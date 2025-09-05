import { Op } from "sequelize";
import bcrypt from "bcrypt";
import Usuario from "@/server/db/models/usuario";
import LogAcao from "@/server/db/models/log_acao";

function sanitizeUser(userInstance) {
  if (!userInstance) return null;
  const { id, nome, email, perfil, status, must_change_password, criado_em } = userInstance;
  return { id, nome, email, perfil, status, must_change_password, criado_em };
}

export async function listar({ search = {}, pagination = {} }) {
  const { nome, perfil, status } = search;
  const where = {};
  if (nome) {
    where.nome = { [Op.iLike]: `%${nome}%` };
  }
  if (perfil) {
    where.perfil = perfil;
  }
  if (typeof status !== "undefined" && status !== "") {
    where.status = String(status) === "true";
  }
  const { rows, count } = await Usuario.findAndCountAll({
    where,
    order: [["id", "ASC"]],
    offset: Number(pagination.offset || 0),
    limit: Number(pagination.limit || 100),
  });
  return {
    ok: true,
    total: count,
    data: rows.map(sanitizeUser),
  };
}

export async function criar({ adminId, nome, email, senha, perfil, status = true }) {
  if (!nome || !email || !senha || !perfil) {
    return { ok: false, status: 400, error: "nome, email, senha e perfil são obrigatórios" };
  }
  const existente = await Usuario.findOne({ where: { email } });
  if (existente) {
    return { ok: false, status: 409, error: "E-mail já cadastrado" };
  }
  const senhaHash = await bcrypt.hash(senha, 10);
  const novo = await Usuario.create({
    nome,
    email,
    senha: senhaHash,
    perfil,
    status: Boolean(status),
    must_change_password: true,
    criado_em: new Date(),
  });
  await LogAcao.create({
    usuario_id: adminId,
    acao: "CRIAR_USUARIO",
    entidade_afetada: "usuario",
    id_entidade: novo.id,
    timestamp: new Date(),
  });
  return { ok: true, user: sanitizeUser(novo) };
}

export async function atualizar({ adminId, id, nome, perfil, status }) {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) return { ok: false, status: 404, error: "Usuário não encontrado" };
  if (typeof nome !== "undefined") usuario.nome = nome;
  if (typeof perfil !== "undefined") usuario.perfil = perfil;
  if (typeof status !== "undefined") usuario.status = Boolean(status);
  await usuario.save();
  await LogAcao.create({
    usuario_id: adminId,
    acao: "ATUALIZAR_USUARIO",
    entidade_afetada: "usuario",
    id_entidade: usuario.id,
    timestamp: new Date(),
  });
  return { ok: true, user: sanitizeUser(usuario) };
}

export async function desativar({ adminId, id }) {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) return { ok: false, status: 404, error: "Usuário não encontrado" };
  usuario.status = false;
  await usuario.save();
  await LogAcao.create({
    usuario_id: adminId,
    acao: "DESATIVAR_USUARIO",
    entidade_afetada: "usuario",
    id_entidade: usuario.id,
    timestamp: new Date(),
  });
  return { ok: true };
}

export async function reativar({ adminId, id }) {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) return { ok: false, status: 404, error: "Usuário não encontrado" };
  usuario.status = true;
  await usuario.save();
  await LogAcao.create({
    usuario_id: adminId,
    acao: "REATIVAR_USUARIO",
    entidade_afetada: "usuario",
    id_entidade: usuario.id,
    timestamp: new Date(),
  });
  return { ok: true };
}

export async function alterarSenhaAdmin({ adminId, id, novaSenha, exigirTroca = true }) {
  if (!novaSenha || String(novaSenha).length < 6) {
    return { ok: false, status: 400, error: "Nova senha inválida" };
  }
  const usuario = await Usuario.findByPk(id);
  if (!usuario) return { ok: false, status: 404, error: "Usuário não encontrado" };
  const hash = await bcrypt.hash(novaSenha, 10);
  usuario.senha = hash;
  usuario.must_change_password = Boolean(exigirTroca);
  await usuario.save();
  await LogAcao.create({
    usuario_id: adminId,
    acao: "ALTERAR_SENHA_USUARIO",
    entidade_afetada: "usuario",
    id_entidade: usuario.id,
    timestamp: new Date(),
  });
  return { ok: true };
}


