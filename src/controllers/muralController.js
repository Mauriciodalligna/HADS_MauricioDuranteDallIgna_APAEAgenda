import { Op } from "sequelize";
import { MuralAvisos, Usuario, initAssociations } from "@/server/db/models";
import { sequelize } from "@/server/db/sequelize";

// Inicializar associações
initAssociations();

// Inicializar tabela mural_avisos se necessário
let muralTableInitialized = false;
async function ensureMuralTable() {
  if (!muralTableInitialized) {
    try {
      console.log('🔌 Verificando tabela mural_avisos...');
      
      // Verificar se a tabela existe
      const [results] = await sequelize.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'mural_avisos'
        );
      `);
      
      if (results[0].exists) {
        console.log('📋 Tabela mural_avisos já existe!');
        muralTableInitialized = true;
        return true;
      }
      
      console.log('🔨 Criando tabela mural_avisos...');
      
      await sequelize.query(`
        CREATE TABLE mural_avisos (
          id SERIAL PRIMARY KEY,
          remetente_id INTEGER NOT NULL,
          conteudo TEXT NOT NULL,
          data_publicacao TIMESTAMP NOT NULL,
          setor_destino VARCHAR(255) NOT NULL,
          visivel_ate TIMESTAMP NOT NULL
        );
      `);
      
      console.log('✅ Tabela mural_avisos criada com sucesso!');
      muralTableInitialized = true;
      return true;
      
    } catch (error) {
      console.error('💥 Erro ao criar tabela mural_avisos:', error.message);
      return false;
    }
  }
  return true;
}

/**
 * Listar avisos do mural
 */
export async function listarAvisos(req, res) {
  try {
    console.log("=== LISTAR AVISOS ===");
    console.log("Query params:", req.query);
    
    // Garantir que a tabela existe
    await ensureMuralTable();
    
    const { setor, pagina = 1, limite = 10 } = req.query;
    
    const where = {};
    
    // Filtrar por setor se especificado
    if (setor && setor !== 'todos') {
      where.setor_destino = setor;
    }
    
    // Filtrar apenas avisos visíveis (não expirados)
    where.visivel_ate = {
      [Op.gte]: new Date()
    };

    const offset = (pagina - 1) * limite;

    console.log("Where clause:", where);
    console.log("Offset:", offset, "Limit:", limite);

    const avisos = await MuralAvisos.findAndCountAll({
      where,
      include: [
        {
          model: Usuario,
          as: "remetente",
          attributes: ["id", "nome", "email"]
        }
      ],
      order: [["data_publicacao", "DESC"]],
      limit: parseInt(limite),
      offset: parseInt(offset)
    });

    console.log("Avisos encontrados:", avisos.count);

    // Converter objetos Sequelize para JSON simples de forma mais robusta
    const avisosJSON = avisos.rows.map(aviso => {
      const avisoData = aviso.toJSON();
      return {
        id: avisoData.id,
        conteudo: avisoData.conteudo,
        data_publicacao: avisoData.data_publicacao,
        setor_destino: avisoData.setor_destino,
        visivel_ate: avisoData.visivel_ate,
        remetente: avisoData.remetente ? {
          id: avisoData.remetente.id,
          nome: avisoData.remetente.nome,
          email: avisoData.remetente.email
        } : null
      };
    });

    res.json({
      ok: true,
      avisos: avisosJSON,
      total: avisos.count,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(avisos.count / limite)
    });

  } catch (error) {
    console.error("Erro ao listar avisos:", error);
    res.status(500).json({
      ok: false,
      error: "Erro interno do servidor"
    });
  }
}

/**
 * Criar novo aviso
 */
export async function criarAviso(req, res) {
  try {
    console.log("=== CRIAR AVISO ===");
    console.log("Body recebido:", req.body);
    console.log("User:", req.user);
    
    // Garantir que a tabela existe
    await ensureMuralTable();
    
    const { conteudo, setor_destino = 'todos', visivel_ate } = req.body;
    const remetente_id = req.user.id;

    // Validar campos obrigatórios
    if (!conteudo || conteudo.trim().length === 0) {
      console.log("Erro: Conteúdo vazio");
      return res.status(400).json({
        ok: false,
        error: "Conteúdo do aviso é obrigatório"
      });
    }

    // Validar limite de caracteres (2000 conforme DVP)
    if (conteudo.length > 2000) {
      console.log("Erro: Conteúdo muito longo");
      return res.status(400).json({
        ok: false,
        error: "Conteúdo do aviso não pode exceder 2000 caracteres"
      });
    }

    // Calcular data de expiração (30 dias por padrão)
    const dataExpiracao = visivel_ate ? new Date(visivel_ate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    console.log("Tentando criar aviso...");
    const aviso = await MuralAvisos.create({
      remetente_id,
      conteudo: conteudo.trim(),
      setor_destino,
      data_publicacao: new Date(),
      visivel_ate: dataExpiracao
    });

    console.log("Aviso criado com ID:", aviso.id);
    
    // Converter para JSON simples de forma mais robusta
    const avisoData = aviso.toJSON();
    
    // Retornar o aviso criado
    res.status(201).json({
      ok: true,
      aviso: {
        id: avisoData.id,
        conteudo: avisoData.conteudo,
        data_publicacao: avisoData.data_publicacao,
        setor_destino: avisoData.setor_destino,
        visivel_ate: avisoData.visivel_ate,
        remetente: {
          id: req.user.id,
          nome: req.user.nome || "Usuário",
          email: req.user.email || ""
        }
      },
      message: "Aviso publicado com sucesso"
    });

  } catch (error) {
    console.error("Erro ao criar aviso:", error);
    res.status(500).json({
      ok: false,
      error: "Erro interno do servidor: " + error.message
    });
  }
}

/**
 * Atualizar aviso
 */
export async function atualizarAviso(req, res) {
  try {
    const { id } = req.params;
    const { conteudo, setor_destino, visivel_ate } = req.body;
    const usuario_id = req.user.id;

    // Buscar o aviso
    const aviso = await MuralAvisos.findByPk(id);
    
    if (!aviso) {
      return res.status(404).json({
        ok: false,
        error: "Aviso não encontrado"
      });
    }

    // Verificar se o usuário pode editar (apenas o remetente ou gestor)
    if (aviso.remetente_id !== usuario_id && !req.user.roles?.includes('gestor')) {
      return res.status(403).json({
        ok: false,
        error: "Você não tem permissão para editar este aviso"
      });
    }

    // Validar conteúdo se fornecido
    if (conteudo !== undefined) {
      if (!conteudo || conteudo.trim().length === 0) {
        return res.status(400).json({
          ok: false,
          error: "Conteúdo do aviso é obrigatório"
        });
      }

      if (conteudo.length > 2000) {
        return res.status(400).json({
          ok: false,
          error: "Conteúdo do aviso não pode exceder 2000 caracteres"
        });
      }
    }

    // Atualizar campos fornecidos
    const camposAtualizacao = {};
    if (conteudo !== undefined) camposAtualizacao.conteudo = conteudo.trim();
    if (setor_destino !== undefined) camposAtualizacao.setor_destino = setor_destino;
    if (visivel_ate !== undefined) camposAtualizacao.visivel_ate = new Date(visivel_ate);

    await aviso.update(camposAtualizacao);

    // Buscar o aviso atualizado com dados do remetente
    const avisoAtualizado = await MuralAvisos.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: "remetente",
          attributes: ["id", "nome", "email"]
        }
      ]
    });

    // Converter para JSON simples de forma mais robusta
    const avisoData = avisoAtualizado.toJSON();

    res.json({
      ok: true,
      aviso: {
        id: avisoData.id,
        conteudo: avisoData.conteudo,
        data_publicacao: avisoData.data_publicacao,
        setor_destino: avisoData.setor_destino,
        visivel_ate: avisoData.visivel_ate,
        remetente: avisoData.remetente ? {
          id: avisoData.remetente.id,
          nome: avisoData.remetente.nome,
          email: avisoData.remetente.email
        } : null
      },
      message: "Aviso atualizado com sucesso"
    });

  } catch (error) {
    console.error("Erro ao atualizar aviso:", error);
    res.status(500).json({
      ok: false,
      error: "Erro interno do servidor"
    });
  }
}

/**
 * Excluir aviso
 */
export async function excluirAviso(req, res) {
  try {
    const { id } = req.params;
    const usuario_id = req.user.id;

    // Buscar o aviso
    const aviso = await MuralAvisos.findByPk(id);
    
    if (!aviso) {
      return res.status(404).json({
        ok: false,
        error: "Aviso não encontrado"
      });
    }

    // Verificar se o usuário pode excluir (apenas o remetente ou gestor)
    if (aviso.remetente_id !== usuario_id && !req.user.roles?.includes('gestor')) {
      return res.status(403).json({
        ok: false,
        error: "Você não tem permissão para excluir este aviso"
      });
    }

    await aviso.destroy();

    res.json({
      ok: true,
      message: "Aviso excluído com sucesso"
    });

  } catch (error) {
    console.error("Erro ao excluir aviso:", error);
    res.status(500).json({
      ok: false,
      error: "Erro interno do servidor"
    });
  }
}

/**
 * Obter aviso por ID
 */
export async function obterAviso(req, res) {
  try {
    const { id } = req.params;

    const aviso = await MuralAvisos.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: "remetente",
          attributes: ["id", "nome", "email"]
        }
      ]
    });

    if (!aviso) {
      return res.status(404).json({
        ok: false,
        error: "Aviso não encontrado"
      });
    }

    // Converter para JSON simples de forma mais robusta
    const avisoData = aviso.toJSON();

    res.json({
      ok: true,
      aviso: {
        id: avisoData.id,
        conteudo: avisoData.conteudo,
        data_publicacao: avisoData.data_publicacao,
        setor_destino: avisoData.setor_destino,
        visivel_ate: avisoData.visivel_ate,
        remetente: avisoData.remetente ? {
          id: avisoData.remetente.id,
          nome: avisoData.remetente.nome,
          email: avisoData.remetente.email
        } : null
      }
    });

  } catch (error) {
    console.error("Erro ao obter aviso:", error);
    res.status(500).json({
      ok: false,
      error: "Erro interno do servidor"
    });
  }
}
