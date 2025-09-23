import { Op } from "sequelize";
import { Agendamento, Profissional, Atividade, Aluno, AgendamentoAluno, LogAcao, initAssociations } from "@/server/db/models";

// Configurações da agenda
const CONFIG = {
  JANELA_INICIO: "07:30",
  JANELA_FIM: "17:00",
  PASSO_MINUTOS: 30
};

// Inicializar associações
initAssociations();

/**
 * Listar agendamentos com filtros
 */
export async function listar(req, res) {
  try {
    const { 
      profissional_nome, 
      aluno_id, 
      aluno_ids,
      aluno_nome,
      data_ini, 
      data_fim, 
      status = "confirmado",
      limit = 100 
    } = req.query;

    const where = {};
    const include = [
      {
        model: Profissional,
        as: "profissional",
        attributes: ["id", "nome", "setor", "especialidade"]
      },
      {
        model: Atividade,
        as: "atividade",
        attributes: ["id", "nome", "tipo", "duracao_padrao", "cor"]
      },
      {
        model: Aluno,
        as: "alunos",
        attributes: ["id", "nome", "idade", "turma", "turno", "escola_regular", "serie", "cidade", "responsavel_nome", "responsavel_telefone", "observacoes"],
        through: { attributes: [] }
      }
    ];

    // Filtro por profissional
    if (profissional_nome) {
      include[0].where = { nome: { [Op.iLike]: `%${profissional_nome}%` } };
    }

    // Filtro por aluno
    if (aluno_id) {
      include[2].where = { id: aluno_id };
    } else if (aluno_ids) {
      // Suporte para múltiplos aluno_ids
      const ids = Array.isArray(aluno_ids) ? aluno_ids : [aluno_ids];
      include[2].where = { id: { [Op.in]: ids } };
    } else if (aluno_nome) {
      include[2].where = { nome: { [Op.iLike]: `%${aluno_nome}%` } };
    }

    // Filtro por data
    if (data_ini || data_fim) {
      where.data = {};
      if (data_ini) where.data[Op.gte] = data_ini;
      if (data_fim) where.data[Op.lte] = data_fim;
    }

    // Filtro por status
    if (status) {
      where.status = status;
    }

    const agendamentos = await Agendamento.findAll({
      where,
      include,
      limit: parseInt(limit),
      order: [["data", "ASC"], ["hora_inicio", "ASC"]]
    });

    // Converter objetos Sequelize para JSON simples
    const agendamentosJSON = agendamentos.map(ag => ag.toJSON());

    // Log temporário para debug
    if (agendamentosJSON.length > 0) {
      console.log("Primeiro agendamento:", JSON.stringify(agendamentosJSON[0], null, 2));
    }

    res.json({
      ok: true,
      data: agendamentosJSON,
      total: agendamentosJSON.length
    });

  } catch (error) {
    console.error("Erro ao listar agendamentos:", error);
    res.status(500).json({
      ok: false,
      error: "Erro interno do servidor"
    });
  }
}

/**
 * Criar agendamento com todas as regras de negócio
 */
export async function criar(req, res) {
  const transaction = await Agendamento.sequelize.transaction();
  
  try {
    const {
      profissional_nome,
      aluno_ids,
      atividade,
      data,
      hora_inicio,
      observacoes,
      recorrente = false,
      recorrencia_fim
    } = req.body;

    // Log temporário para debug
    console.log("Dados recebidos:", { observacoes, req_body: req.body });

    // Validações básicas
    if (!profissional_nome || !aluno_ids?.length || !atividade || !data || !hora_inicio) {
      return res.status(400).json({
        ok: false,
        error: "Dados obrigatórios: profissional_nome, aluno_ids, atividade, data, hora_inicio"
      });
    }

    // Resolver profissional_id por nome
    const profissional = await Profissional.findOne({
      where: { nome: profissional_nome, status: true }
    });

    if (!profissional) {
      return res.status(404).json({
        ok: false,
        error: "Profissional não encontrado"
      });
    }

    // Upsert/resolver atividade
    let atividadeRecord;
    if (atividade.id) {
      atividadeRecord = await Atividade.findByPk(atividade.id);
    } else {
      // Criar nova atividade
      atividadeRecord = await Atividade.create({
        nome: atividade.nome,
        tipo: atividade.tipo || "Geral",
        duracao_padrao: atividade.duracao_padrao || 60,
        cor: atividade.cor || "#1976d2",
        status: true
      }, { transaction });
    }

    if (!atividadeRecord) {
      return res.status(404).json({
        ok: false,
        error: "Atividade não encontrada"
      });
    }

    // Calcular hora_fim
    const horaFim = calcularHoraFim(hora_inicio, atividadeRecord.duracao_padrao);

    // Verificar alunos existem
    const alunos = await Aluno.findAll({
      where: { 
        id: { [Op.in]: aluno_ids },
        status: true 
      }
    });

    if (alunos.length !== aluno_ids.length) {
      return res.status(400).json({
        ok: false,
        error: "Um ou mais alunos não foram encontrados"
      });
    }

    // Processar recorrência
    const datas = recorrente && recorrencia_fim 
      ? gerarDatasRecorrencia(data, recorrencia_fim)
      : [data];

    const agendamentosCriados = [];

    for (const dataAtual of datas) {
      // Verificar conflito/sessão em grupo
      const resultado = await verificarConflitoESessaoGrupo({
        profissional_id: profissional.id,
        data: dataAtual,
        hora_inicio,
        hora_fim: horaFim
      }, transaction);

      if (resultado.conflito) {
        await transaction.rollback();
        return res.status(409).json({
          ok: false,
          error: "Profissional já possui agendamento neste horário"
        });
      }

      let agendamento;
      
      if (resultado.sessaoGrupo) {
        // Anexar alunos ao agendamento existente
        agendamento = resultado.agendamentoExistente;
        await anexarAlunosAoAgendamento(agendamento.id, aluno_ids, transaction);
      } else {
        // Criar novo agendamento
        agendamento = await Agendamento.create({
          profissional_id: profissional.id,
          atividade_id: atividadeRecord.id,
          data: dataAtual,
          hora_inicio,
          hora_fim: horaFim,
          status: "confirmado",
          observacoes: observacoes || null,
          recorrente,
          recorrencia_fim: recorrente ? recorrencia_fim : null
        }, { transaction });

        // Associar alunos
        await anexarAlunosAoAgendamento(agendamento.id, aluno_ids, transaction);
      }

      // Log temporário para debug
      console.log("Backend - Agendamento criado:", {
        id: agendamento.id,
        observacoes: agendamento.observacoes,
        dataValues: agendamento.dataValues
      });

      agendamentosCriados.push(agendamento);
    }

    // Log da ação
    await LogAcao.create({
      usuario_id: req.user.id,
      acao: "criar_agendamento",
      detalhes: JSON.stringify({
        agendamentos_criados: agendamentosCriados.length,
        profissional: profissional_nome,
        alunos: aluno_ids,
        atividade: atividadeRecord.nome
      })
    }, { transaction });

    await transaction.commit();

    // Converter objetos Sequelize para JSON simples
    const agendamentosJSON = agendamentosCriados.map(ag => ag.toJSON());

    res.status(201).json({
      ok: true,
      data: agendamentosJSON,
      message: `${agendamentosJSON.length} agendamento(s) criado(s) com sucesso`
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Erro ao criar agendamento:", error);
    res.status(500).json({
      ok: false,
      error: "Erro interno do servidor"
    });
  }
}

/**
 * Atualizar agendamento
 */
export async function atualizar(req, res) {
  const transaction = await Agendamento.sequelize.transaction();
  
  try {
    const { id } = req.params;
    const {
      data,
      hora_inicio,
      atividade_id,
      aluno_ids,
      observacoes,
      motivo_cancelamento
    } = req.body;

    const agendamento = await Agendamento.findByPk(id, {
      include: [
        { model: Atividade, as: "atividade" },
        { model: Aluno, as: "alunos", through: { attributes: [] } }
      ],
      transaction
    });

    if (!agendamento) {
      return res.status(404).json({
        ok: false,
        error: "Agendamento não encontrado"
      });
    }

    // Se está cancelando
    if (motivo_cancelamento) {
      agendamento.status = "cancelado";
      agendamento.motivo_cancelamento = motivo_cancelamento;
      await agendamento.save({ transaction });
    } else {
      // Atualizar dados
      if (data) agendamento.data = data;
      if (hora_inicio) {
        agendamento.hora_inicio = hora_inicio;
        // Recalcular hora_fim se atividade mudou
        const atividade = atividade_id 
          ? await Atividade.findByPk(atividade_id, { transaction })
          : agendamento.atividade;
        
        if (atividade) {
          agendamento.hora_fim = calcularHoraFim(hora_inicio, atividade.duracao_padrao);
          if (atividade_id) agendamento.atividade_id = atividade_id;
        }
      }
      if (observacoes !== undefined) agendamento.observacoes = observacoes;

      await agendamento.save({ transaction });

      // Atualizar alunos se fornecido
      if (aluno_ids) {
        // Remover associações existentes
        await AgendamentoAluno.destroy({
          where: { agendamento_id: id },
          transaction
        });

        // Adicionar novas associações
        await anexarAlunosAoAgendamento(id, aluno_ids, transaction);
      }
    }

    // Log da ação
    await LogAcao.create({
      usuario_id: req.user.id,
      acao: "atualizar_agendamento",
      detalhes: JSON.stringify({
        agendamento_id: id,
        alteracoes: req.body
      })
    }, { transaction });

    await transaction.commit();

    res.json({
      ok: true,
      data: agendamento.toJSON(),
      message: "Agendamento atualizado com sucesso"
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Erro ao atualizar agendamento:", error);
    res.status(500).json({
      ok: false,
      error: "Erro interno do servidor"
    });
  }
}

/**
 * Cancelar agendamento
 */
export async function cancelar(req, res) {
  const transaction = await Agendamento.sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { motivo_cancelamento, scope = "only" } = req.body;

    if (!motivo_cancelamento) {
      return res.status(400).json({
        ok: false,
        error: "Motivo do cancelamento é obrigatório"
      });
    }

    const agendamento = await Agendamento.findByPk(id, { transaction });

    if (!agendamento) {
      return res.status(404).json({
        ok: false,
        error: "Agendamento não encontrado"
      });
    }

    if (scope === "only") {
      // Cancelar apenas este agendamento
      agendamento.status = "cancelado";
      agendamento.motivo_cancelamento = motivo_cancelamento;
      await agendamento.save({ transaction });
    } else if (scope === "future" && agendamento.recorrente) {
      // Cancelar este e todos os futuros
      await Agendamento.update(
        { 
          status: "cancelado", 
          motivo_cancelamento,
          recorrencia_fim: agendamento.data // Para na data atual
        },
        {
          where: {
            profissional_id: agendamento.profissional_id,
            atividade_id: agendamento.atividade_id,
            hora_inicio: agendamento.hora_inicio,
            data: { [Op.gte]: agendamento.data },
            status: "confirmado"
          },
          transaction
        }
      );
    }

    // Log da ação
    await LogAcao.create({
      usuario_id: req.user.id,
      acao: "cancelar_agendamento",
      detalhes: JSON.stringify({
        agendamento_id: id,
        motivo: motivo_cancelamento,
        scope
      })
    }, { transaction });

    await transaction.commit();

    res.json({
      ok: true,
      message: "Agendamento(s) cancelado(s) com sucesso"
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Erro ao cancelar agendamento:", error);
    res.status(500).json({
      ok: false,
      error: "Erro interno do servidor"
    });
  }
}

/**
 * Exportar agenda em PDF
 */
export async function exportarPDF(req, res) {
  try {
    const { profissional_nome, aluno_id, semana_inicio } = req.body;

    if (!profissional_nome && !aluno_id) {
      return res.status(400).json({
        ok: false,
        error: "É necessário fornecer profissional_nome ou aluno_id"
      });
    }

    // Calcular data fim da semana
    const dataInicio = new Date(semana_inicio);
    const dataFim = new Date(dataInicio);
    dataFim.setDate(dataFim.getDate() + 6);

    const where = {
      data: { [Op.between]: [semana_inicio, dataFim.toISOString().split('T')[0]] },
      status: "confirmado"
    };

    const include = [
      {
        model: Profissional,
        as: "profissional",
        attributes: ["nome", "setor", "especialidade"]
      },
      {
        model: Atividade,
        as: "atividade",
        attributes: ["nome", "tipo", "cor"]
      },
      {
        model: Aluno,
        as: "alunos",
        attributes: ["nome", "turma"],
        through: { attributes: [] }
      }
    ];

    if (profissional_nome) {
      include[0].where = { nome: profissional_nome };
    }

    if (aluno_id) {
      include[2].where = { id: aluno_id };
    }

    const agendamentos = await Agendamento.findAll({
      where,
      include,
      order: [["data", "ASC"], ["hora_inicio", "ASC"]]
    });

    // Converter objetos Sequelize para JSON simples
    const agendamentosJSON = agendamentos.map(ag => ag.toJSON());

    // TODO: Implementar geração de PDF
    // Por enquanto, retornar dados estruturados
    res.json({
      ok: true,
      data: {
        periodo: { inicio: semana_inicio, fim: dataFim.toISOString().split('T')[0] },
        agendamentos: agendamentosJSON,
        total: agendamentosJSON.length
      },
      message: "Dados preparados para PDF (implementação pendente)"
    });

  } catch (error) {
    console.error("Erro ao exportar PDF:", error);
    res.status(500).json({
      ok: false,
      error: "Erro interno do servidor"
    });
  }
}

// Funções auxiliares

/**
 * Calcular hora de fim baseada na duração da atividade
 */
function calcularHoraFim(horaInicio, duracaoMinutos) {
  const [hora, minuto] = horaInicio.split(':').map(Number);
  const inicioMinutos = hora * 60 + minuto;
  const fimMinutos = inicioMinutos + duracaoMinutos;
  
  const fimHora = Math.floor(fimMinutos / 60);
  const fimMinuto = fimMinutos % 60;
  
  return `${fimHora.toString().padStart(2, '0')}:${fimMinuto.toString().padStart(2, '0')}`;
}

/**
 * Gerar datas de recorrência semanal
 */
function gerarDatasRecorrencia(dataInicio, dataFim) {
  const datas = [];
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  
  let dataAtual = new Date(inicio);
  
  while (dataAtual <= fim) {
    datas.push(dataAtual.toISOString().split('T')[0]);
    dataAtual.setDate(dataAtual.getDate() + 7); // Próxima semana
  }
  
  return datas;
}

/**
 * Verificar conflito e sessão em grupo
 */
async function verificarConflitoESessaoGrupo({ profissional_id, data, hora_inicio, hora_fim }, transaction) {
  // 1) Verificar se existe agendamento EXATO no mesmo slot
  const mesmoSlot = await Agendamento.findOne({
    where: {
      profissional_id,
      data,
      hora_inicio,
      hora_fim,
      status: "confirmado"
    },
    include: [{
      model: Aluno,
      as: "alunos",
      through: { attributes: [] }
    }],
    transaction
  });

  if (mesmoSlot) {
    return { conflito: false, sessaoGrupo: true, agendamentoExistente: mesmoSlot };
  }

  // 2) Verificar conflito geral (sobreposição)
  const conflito = await Agendamento.findOne({
    where: {
      profissional_id,
      data,
      status: "confirmado",
      [Op.and]: [
        { hora_inicio: { [Op.lt]: hora_fim } },
        { hora_fim: { [Op.gt]: hora_inicio } }
      ]
    },
    transaction
  });

  if (conflito) {
    return { conflito: true, sessaoGrupo: false };
  }

  return { conflito: false, sessaoGrupo: false };
}

/**
 * Anexar alunos ao agendamento
 */
async function anexarAlunosAoAgendamento(agendamentoId, alunoIds, transaction) {
  const associacoes = alunoIds.map(alunoId => ({
    agendamento_id: agendamentoId,
    aluno_id: alunoId
  }));

  await AgendamentoAluno.bulkCreate(associacoes, {
    ignoreDuplicates: true,
    transaction
  });
}
