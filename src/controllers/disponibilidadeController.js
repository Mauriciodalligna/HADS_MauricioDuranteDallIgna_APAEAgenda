import { Op } from "sequelize";
import Disponibilidade from "@/server/db/models/disponibilidade";
import LogAcao from "@/server/db/models/log_acao";

function sanitizeDisponibilidade(instance) {
  if (!instance) return null;
  const { id, profissional_id, dia_semana, hora_inicio, hora_fim } = instance;
  return { id, profissional_id, dia_semana, hora_inicio, hora_fim };
}

export async function listar({ search = {}, pagination = {} }) {
  const { profissional_id, dia_semana } = search;
  const where = {};
  if (profissional_id) where.profissional_id = Number(profissional_id);
  if (dia_semana) where.dia_semana = dia_semana;
  const { rows, count } = await Disponibilidade.findAndCountAll({
    where,
    order: [["profissional_id", "ASC"], ["dia_semana", "ASC"], ["hora_inicio", "ASC"]],
    offset: Number(pagination.offset || 0),
    limit: Number(pagination.limit || 200),
  });
  return { ok: true, total: count, data: rows.map(sanitizeDisponibilidade) };
}

function isOverlapCondition({ hora_inicio, hora_fim }) {
  // overlap if existing.hora_inicio < new.hora_fim AND existing.hora_fim > new.hora_inicio
  return {
    hora_inicio: { [Op.lt]: hora_fim },
    hora_fim: { [Op.gt]: hora_inicio },
  };
}

export async function criar({ adminId, profissional_id, dia_semana, hora_inicio, hora_fim }) {
  if (!profissional_id || !dia_semana || !hora_inicio || !hora_fim) {
    return { ok: false, status: 400, error: "profissional_id, dia_semana, hora_inicio e hora_fim são obrigatórios" };
  }
  if (hora_inicio >= hora_fim) {
    return { ok: false, status: 400, error: "hora_inicio deve ser menor que hora_fim" };
  }
  const exists = await Disponibilidade.findOne({
    where: {
      profissional_id: Number(profissional_id),
      dia_semana,
      [Op.and]: [isOverlapCondition({ hora_inicio, hora_fim })],
    },
  });
  if (exists) {
    return { ok: false, status: 409, error: "Conflito de horário: já existe disponibilidade sobreposta" };
  }
  const novo = await Disponibilidade.create({ profissional_id: Number(profissional_id), dia_semana, hora_inicio, hora_fim });
  await LogAcao.create({
    usuario_id: adminId,
    acao: "CRIAR_DISPONIBILIDADE",
    entidade_afetada: "disponibilidade",
    id_entidade: novo.id,
    timestamp: new Date(),
  });
  return { ok: true, disponibilidade: sanitizeDisponibilidade(novo) };
}

export async function atualizar({ adminId, id, profissional_id, dia_semana, hora_inicio, hora_fim }) {
  const disp = await Disponibilidade.findByPk(id);
  if (!disp) return { ok: false, status: 404, error: "Disponibilidade não encontrada" };
  const newProfId = profissional_id ? Number(profissional_id) : disp.profissional_id;
  const newDia = dia_semana || disp.dia_semana;
  const newInicio = hora_inicio || disp.hora_inicio;
  const newFim = hora_fim || disp.hora_fim;
  if (newInicio >= newFim) {
    return { ok: false, status: 400, error: "hora_inicio deve ser menor que hora_fim" };
  }
  const overlap = await Disponibilidade.findOne({
    where: {
      id: { [Op.ne]: id },
      profissional_id: newProfId,
      dia_semana: newDia,
      [Op.and]: [isOverlapCondition({ hora_inicio: newInicio, hora_fim: newFim })],
    },
  });
  if (overlap) {
    return { ok: false, status: 409, error: "Conflito de horário: já existe disponibilidade sobreposta" };
  }
  Object.assign(disp, { profissional_id: newProfId, dia_semana: newDia, hora_inicio: newInicio, hora_fim: newFim });
  await disp.save();
  await LogAcao.create({
    usuario_id: adminId,
    acao: "ATUALIZAR_DISPONIBILIDADE",
    entidade_afetada: "disponibilidade",
    id_entidade: disp.id,
    timestamp: new Date(),
  });
  return { ok: true, disponibilidade: sanitizeDisponibilidade(disp) };
}

export async function excluir({ adminId, id }) {
  const disp = await Disponibilidade.findByPk(id);
  if (!disp) return { ok: false, status: 404, error: "Disponibilidade não encontrada" };
  await disp.destroy();
  await LogAcao.create({
    usuario_id: adminId,
    acao: "EXCLUIR_DISPONIBILIDADE",
    entidade_afetada: "disponibilidade",
    id_entidade: id,
    timestamp: new Date(),
  });
  return { ok: true };
}


