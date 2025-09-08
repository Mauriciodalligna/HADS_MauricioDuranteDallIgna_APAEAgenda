import { Op } from "sequelize";
import Atividade from "@/server/db/models/atividade";
import sequelize from "@/server/db/sequelize";
import LogAcao from "@/server/db/models/log_acao";

function sanitizeAtividade(instance) {
  if (!instance) return null;
  const { id, nome, tipo, duracao_padrao, cor, status, criado_em } = instance;
  const agendamentos_count = instance.get?.("agendamentos_count");
  return { id, nome, tipo, duracao_padrao, cor, status, criado_em, agendamentos_count };
}

export async function listar({ search = {}, pagination = {} }) {
  const { nome, tipo, status } = search;
  const where = {};
  if (nome) where.nome = { [Op.iLike]: `%${nome}%` };
  if (tipo) where.tipo = { [Op.iLike]: `%${tipo}%` };
  if (typeof status !== "undefined" && status !== "") where.status = String(status) === "true";
  const { rows, count } = await Atividade.findAndCountAll({
    where,
    attributes: {
      include: [
        [
          sequelize.literal('(SELECT COUNT(*) FROM agendamento AS a WHERE a.atividade_id = atividade.id)'),
          'agendamentos_count',
        ],
      ],
    },
    order: [["id", "ASC"]],
    offset: Number(pagination.offset || 0),
    limit: Number(pagination.limit || 100),
  });
  return { ok: true, total: count, data: rows.map(sanitizeAtividade) };
}

export async function criar({ adminId, nome, tipo, duracao_padrao, cor, status = true }) {
  if (!nome) return { ok: false, status: 400, error: "nome é obrigatório" };
  const novo = await Atividade.create({
    nome,
    tipo,
    duracao_padrao: typeof duracao_padrao === "number" ? duracao_padrao : duracao_padrao ? Number(duracao_padrao) : null,
    cor,
    status: Boolean(status),
    criado_em: new Date(),
  });
  await LogAcao.create({
    usuario_id: adminId,
    acao: "CRIAR_ATIVIDADE",
    entidade_afetada: "atividade",
    id_entidade: novo.id,
    timestamp: new Date(),
  });
  return { ok: true, atividade: sanitizeAtividade(novo) };
}

export async function atualizar({ adminId, id, ...payload }) {
  const atv = await Atividade.findByPk(id);
  if (!atv) return { ok: false, status: 404, error: "Atividade não encontrada" };
  if (typeof payload.duracao_padrao !== "undefined") {
    payload.duracao_padrao = payload.duracao_padrao ? Number(payload.duracao_padrao) : null;
  }
  Object.assign(atv, payload);
  await atv.save();
  await LogAcao.create({
    usuario_id: adminId,
    acao: "ATUALIZAR_ATIVIDADE",
    entidade_afetada: "atividade",
    id_entidade: atv.id,
    timestamp: new Date(),
  });
  return { ok: true, atividade: sanitizeAtividade(atv) };
}

export async function desativar({ adminId, id }) {
  const atv = await Atividade.findByPk(id);
  if (!atv) return { ok: false, status: 404, error: "Atividade não encontrada" };
  atv.status = false;
  await atv.save();
  await LogAcao.create({
    usuario_id: adminId,
    acao: "DESATIVAR_ATIVIDADE",
    entidade_afetada: "atividade",
    id_entidade: atv.id,
    timestamp: new Date(),
  });
  return { ok: true };
}

export async function reativar({ adminId, id }) {
  const atv = await Atividade.findByPk(id);
  if (!atv) return { ok: false, status: 404, error: "Atividade não encontrada" };
  atv.status = true;
  await atv.save();
  await LogAcao.create({
    usuario_id: adminId,
    acao: "REATIVAR_ATIVIDADE",
    entidade_afetada: "atividade",
    id_entidade: atv.id,
    timestamp: new Date(),
  });
  return { ok: true };
}


