import { Op } from "sequelize";
import { Agendamento, Profissional, Atividade, Aluno, AgendamentoAluno, LogAcao, initAssociations } from "@/server/db/models";
import jsPDF from "jspdf";

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
    const { profissional_nome, aluno_id, semana_inicio, opcoes = {} } = req.body;
    
    console.log("Backend - Opções recebidas:", opcoes);

    // Removendo validação obrigatória - permitir exportar todos os agendamentos
    // if (!profissional_nome && !aluno_id) {
    //   return res.status(400).json({
    //     ok: false,
    //     error: "É necessário fornecer profissional_nome ou aluno_id"
    //   });
    // }

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

    // Gerar PDF
    const pdf = gerarPDFAgenda(agendamentosJSON, {
      periodo: { inicio: semana_inicio, fim: dataFim.toISOString().split('T')[0] },
      filtro: profissional_nome ? `Profissional: ${profissional_nome}` : `Aluno ID: ${aluno_id}`,
      opcoes: opcoes
    });

    // Configurar headers para download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="agenda-${semana_inicio}.pdf"`);
    
    // Enviar PDF
    res.send(pdf);

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
 * Gerar PDF da agenda
 */
function gerarPDFAgenda(agendamentos, opcoes) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;
  
  // Opções padrão
  const config = {
    incluirObservacoes: true,
    incluirDetalhesAlunos: true,
    incluirContatos: true,
    agruparPorProfissional: false,
    incluirEstatisticas: true,
    ...opcoes.opcoes
  };
  
  console.log("PDF - Configuração final:", config);

  // Cabeçalho
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("AGENDA APAE", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  // Período
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const periodoTexto = `Período: ${formatarData(opcoes.periodo.inicio)} a ${formatarData(opcoes.periodo.fim)}`;
  doc.text(periodoTexto, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 8;

  // Filtro
  doc.setFontSize(10);
  doc.text(opcoes.filtro, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // Agrupar agendamentos por data ou profissional
  let agendamentosAgrupados;
  if (config.agruparPorProfissional) {
    agendamentosAgrupados = agruparPorProfissionalEData(agendamentos);
  } else {
    agendamentosAgrupados = agruparPorData(agendamentos);
  }

  // Gerar conteúdo
  if (config.agruparPorProfissional) {
    // Agrupamento por profissional
    Object.keys(agendamentosAgrupados).forEach(profissionalNome => {
      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      // Nome do Profissional
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Profissional: ${profissionalNome}`, 20, yPosition);
      yPosition += 8;

      // Linha separadora
      doc.setLineWidth(0.5);
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 5;

      // Agendamentos do profissional
      Object.keys(agendamentosAgrupados[profissionalNome]).forEach(data => {
        // Data
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`  ${formatarData(data)}`, 25, yPosition);
        yPosition += 6;

        // Agendamentos do dia
        agendamentosAgrupados[profissionalNome][data].forEach(agendamento => {
          yPosition = adicionarAgendamentoAoPDF(doc, agendamento, yPosition, pageHeight, config);
        });

        yPosition += 3; // Espaço entre dias
      });

      yPosition += 5; // Espaço entre profissionais
    });
  } else {
    // Agrupamento por data (padrão)
    Object.keys(agendamentosAgrupados).forEach(data => {
      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      // Data
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(formatarData(data), 20, yPosition);
      yPosition += 8;

      // Linha separadora
      doc.setLineWidth(0.5);
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 5;

      // Agendamentos do dia
      agendamentosAgrupados[data].forEach(agendamento => {
        yPosition = adicionarAgendamentoAoPDF(doc, agendamento, yPosition, pageHeight, config);
      });

      yPosition += 5; // Espaço entre dias
    });
  }

  // Rodapé
  const totalAgendamentos = agendamentos.length;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  
  if (config.incluirEstatisticas) {
    // Calcular estatísticas
    const alunosUnicos = new Set();
    const profissionaisUnicos = new Set();
    let totalHoras = 0;
    
    agendamentos.forEach(ag => {
      if (ag.alunos) {
        ag.alunos.forEach(aluno => alunosUnicos.add(aluno.id));
      }
      if (ag.profissional) {
        profissionaisUnicos.add(ag.profissional.id);
      }
      // Calcular horas (aproximado)
      const inicio = ag.hora_inicio.split(':');
      const fim = ag.hora_fim.split(':');
      const horasInicio = parseInt(inicio[0]) + parseInt(inicio[1]) / 60;
      const horasFim = parseInt(fim[0]) + parseInt(fim[1]) / 60;
      totalHoras += horasFim - horasInicio;
    });
    
    doc.text(`Total de agendamentos: ${totalAgendamentos}`, 20, pageHeight - 25);
    doc.text(`Alunos únicos: ${alunosUnicos.size}`, 20, pageHeight - 20);
    doc.text(`Profissionais: ${profissionaisUnicos.size}`, 20, pageHeight - 15);
    doc.text(`Horas de atendimento: ${totalHoras.toFixed(1)}h`, 20, pageHeight - 10);
  } else {
    doc.text(`Total de agendamentos: ${totalAgendamentos}`, 20, pageHeight - 10);
  }
  
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth - 60, pageHeight - 10, { align: "right" });

  return doc.output('arraybuffer');
}

/**
 * Agrupar agendamentos por data
 */
function agruparPorData(agendamentos) {
  return agendamentos.reduce((grupos, agendamento) => {
    const data = agendamento.data;
    if (!grupos[data]) {
      grupos[data] = [];
    }
    grupos[data].push(agendamento);
    return grupos;
  }, {});
}

/**
 * Agrupar agendamentos por profissional e data
 */
function agruparPorProfissionalEData(agendamentos) {
  return agendamentos.reduce((grupos, agendamento) => {
    const profissionalNome = agendamento.profissional?.nome || 'Sem Profissional';
    const data = agendamento.data;
    
    if (!grupos[profissionalNome]) {
      grupos[profissionalNome] = {};
    }
    if (!grupos[profissionalNome][data]) {
      grupos[profissionalNome][data] = [];
    }
    grupos[profissionalNome][data].push(agendamento);
    return grupos;
  }, {});
}

/**
 * Adicionar agendamento ao PDF com base nas opções
 */
function adicionarAgendamentoAoPDF(doc, agendamento, yPosition, pageHeight, config) {
  // Verificar se precisa de nova página
  if (yPosition > pageHeight - 30) {
    doc.addPage();
    yPosition = 20;
  }

  // Horário
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`${agendamento.hora_inicio} - ${agendamento.hora_fim}`, 25, yPosition);

  // Profissional (se não estiver agrupado por profissional)
  if (!config.agruparPorProfissional) {
    doc.setFont("helvetica", "normal");
    doc.text(`Profissional: ${agendamento.profissional?.nome || 'N/A'}`, 80, yPosition);
    yPosition += 5;
  }

  // Atividade
  doc.text(`Atividade: ${agendamento.atividade?.nome || 'N/A'}`, 80, yPosition);
  yPosition += 5;

  // Alunos
  if (agendamento.alunos && agendamento.alunos.length > 0) {
    const nomesAlunos = agendamento.alunos.map(aluno => aluno.nome).join(", ");
    doc.text(`Alunos: ${nomesAlunos}`, 80, yPosition);
    yPosition += 5;

    // Detalhes dos alunos (se habilitado)
    if (config.incluirDetalhesAlunos) {
      agendamento.alunos.forEach(aluno => {
        doc.setFontSize(8);
        doc.text(`  - ${aluno.nome} (${aluno.idade || 'N/A'} anos, Turma: ${aluno.turma || 'N/A'})`, 85, yPosition);
        yPosition += 4;
        
        // Contatos (se habilitado)
        if (config.incluirContatos) {
          if (aluno.responsavel_telefone) {
            doc.text(`    Contato: ${aluno.responsavel_telefone}`, 90, yPosition);
          } else {
            doc.text(`    Contato: (não informado)`, 90, yPosition);
          }
          yPosition += 4;
        }
      });
      doc.setFontSize(10);
    }
  } else {
    doc.text(`Alunos: (sem alunos)`, 80, yPosition);
    yPosition += 5;
  }

  // Observações (se habilitado)
  if (config.incluirObservacoes) {
    if (agendamento.observacoes) {
      doc.text(`Obs: ${agendamento.observacoes}`, 80, yPosition);
      yPosition += 5;
    } else {
      doc.text(`Obs: (sem observações)`, 80, yPosition);
      yPosition += 5;
    }
  }

  yPosition += 3; // Espaço entre agendamentos
  return yPosition;
}

/**
 * Formatar data para exibição
 */
function formatarData(data) {
  const date = new Date(data);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

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
