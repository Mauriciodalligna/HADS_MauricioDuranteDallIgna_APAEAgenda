import { Op } from "sequelize";
import Aluno from "@/server/db/models/aluno";
import LogAcao from "@/server/db/models/log_acao";

function sanitizeAluno(instance) {
  if (!instance) return null;
  const {
    id,
    nome,
    idade,
    turma,
    turno,
    escola_regular,
    serie,
    cidade,
    responsavel_nome,
    responsavel_telefone,
    status,
    observacoes,
    criado_em,
  } = instance;
  return {
    id,
    nome,
    idade,
    turma,
    turno,
    escola_regular,
    serie,
    cidade,
    responsavel_nome,
    responsavel_telefone,
    status,
    observacoes,
    criado_em,
  };
}

export async function listar({ search = {}, pagination = {} }) {
  const { nome, turma, turno, status, cidade } = search;
  const where = {};
  if (nome) where.nome = { [Op.iLike]: `%${nome}%` };
  if (turma) where.turma = turma;
  if (turno) where.turno = turno;
  if (cidade) where.cidade = { [Op.iLike]: `%${cidade}%` };
  if (typeof status !== "undefined" && status !== "") where.status = String(status) === "true";

  const { rows, count } = await Aluno.findAndCountAll({
    where,
    order: [["id", "ASC"]],
    offset: Number(pagination.offset || 0),
    limit: Number(pagination.limit || 100),
  });
  return { ok: true, total: count, data: rows.map(sanitizeAluno) };
}

export async function criar({ adminId, ...payload }) {
  if (!payload?.nome) return { ok: false, status: 400, error: "nome é obrigatório" };
  // validação duplicidade (nome+turma)
  if (payload?.nome && payload?.turma) {
    const exists = await Aluno.findOne({ where: { nome: payload.nome, turma: payload.turma } });
    if (exists) {
      return { ok: false, status: 409, error: "Aluno já existente nesta turma (nome+turma deve ser único)" };
    }
  }
  const novo = await Aluno.create({
    ...payload,
    status: typeof payload.status === "undefined" ? true : Boolean(payload.status),
    criado_em: new Date(),
  });
  await LogAcao.create({
    usuario_id: adminId,
    acao: "CRIAR_ALUNO",
    entidade_afetada: "aluno",
    id_entidade: novo.id,
    timestamp: new Date(),
  });
  return { ok: true, aluno: sanitizeAluno(novo) };
}

export async function atualizar({ adminId, id, ...payload }) {
  const aluno = await Aluno.findByPk(id);
  if (!aluno) return { ok: false, status: 404, error: "Aluno não encontrado" };
  Object.assign(aluno, payload);
  await aluno.save();
  await LogAcao.create({
    usuario_id: adminId,
    acao: "ATUALIZAR_ALUNO",
    entidade_afetada: "aluno",
    id_entidade: aluno.id,
    timestamp: new Date(),
  });
  return { ok: true, aluno: sanitizeAluno(aluno) };
}

export async function desativar({ adminId, id }) {
  const aluno = await Aluno.findByPk(id);
  if (!aluno) return { ok: false, status: 404, error: "Aluno não encontrado" };
  aluno.status = false;
  await aluno.save();
  await LogAcao.create({
    usuario_id: adminId,
    acao: "DESATIVAR_ALUNO",
    entidade_afetada: "aluno",
    id_entidade: aluno.id,
    timestamp: new Date(),
  });
  return { ok: true };
}

export async function reativar({ adminId, id }) {
  const aluno = await Aluno.findByPk(id);
  if (!aluno) return { ok: false, status: 404, error: "Aluno não encontrado" };
  aluno.status = true;
  await aluno.save();
  await LogAcao.create({
    usuario_id: adminId,
    acao: "REATIVAR_ALUNO",
    entidade_afetada: "aluno",
    id_entidade: aluno.id,
    timestamp: new Date(),
  });
  return { ok: true };
}


