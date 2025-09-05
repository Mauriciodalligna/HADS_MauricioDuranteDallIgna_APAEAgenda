import { Op } from "sequelize";
import Profissional from "@/server/db/models/profissional";
import LogAcao from "@/server/db/models/log_acao";

function sanitizeProfissional(instance) {
  if (!instance) return null;
  const { id, nome, setor, especialidade, status, criado_em } = instance;
  return { id, nome, setor, especialidade, status, criado_em };
}

export async function listar({ search = {}, pagination = {} }) {
  const { nome, setor, status } = search;
  const where = {};
  if (nome) where.nome = { [Op.iLike]: `%${nome}%` };
  if (setor) where.setor = { [Op.iLike]: `%${setor}%` };
  if (typeof status !== "undefined" && status !== "") where.status = String(status) === "true";

  const { rows, count } = await Profissional.findAndCountAll({
    where,
    order: [["id", "ASC"]],
    offset: Number(pagination.offset || 0),
    limit: Number(pagination.limit || 100),
  });
  return { ok: true, total: count, data: rows.map(sanitizeProfissional) };
}

export async function criar({ adminId, nome, setor, especialidade, status = true }) {
  if (!nome) return { ok: false, status: 400, error: "nome é obrigatório" };
  const novo = await Profissional.create({
    nome,
    setor,
    especialidade,
    status: Boolean(status),
    criado_em: new Date(),
  });
  await LogAcao.create({
    usuario_id: adminId,
    acao: "CRIAR_PROFISSIONAL",
    entidade_afetada: "profissional",
    id_entidade: novo.id,
    timestamp: new Date(),
  });
  return { ok: true, profissional: sanitizeProfissional(novo) };
}

export async function atualizar({ adminId, id, ...payload }) {
  const prof = await Profissional.findByPk(id);
  if (!prof) return { ok: false, status: 404, error: "Profissional não encontrado" };
  Object.assign(prof, payload);
  await prof.save();
  await LogAcao.create({
    usuario_id: adminId,
    acao: "ATUALIZAR_PROFISSIONAL",
    entidade_afetada: "profissional",
    id_entidade: prof.id,
    timestamp: new Date(),
  });
  return { ok: true, profissional: sanitizeProfissional(prof) };
}

export async function desativar({ adminId, id }) {
  const prof = await Profissional.findByPk(id);
  if (!prof) return { ok: false, status: 404, error: "Profissional não encontrado" };
  prof.status = false;
  await prof.save();
  await LogAcao.create({
    usuario_id: adminId,
    acao: "DESATIVAR_PROFISSIONAL",
    entidade_afetada: "profissional",
    id_entidade: prof.id,
    timestamp: new Date(),
  });
  return { ok: true };
}

export async function reativar({ adminId, id }) {
  const prof = await Profissional.findByPk(id);
  if (!prof) return { ok: false, status: 404, error: "Profissional não encontrado" };
  prof.status = true;
  await prof.save();
  await LogAcao.create({
    usuario_id: adminId,
    acao: "REATIVAR_PROFISSIONAL",
    entidade_afetada: "profissional",
    id_entidade: prof.id,
    timestamp: new Date(),
  });
  return { ok: true };
}


