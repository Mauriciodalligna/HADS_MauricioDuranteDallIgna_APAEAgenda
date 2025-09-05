import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Usuario from "@/server/db/models/usuario";

function isBcryptHash(value) {
  return typeof value === "string" && value.startsWith("$2");
}

export async function register({ nome, email, senha, perfil = "profissional" }) {
  if (!email || !senha || !nome) {
    return { ok: false, status: 400, error: "nome, email e senha são obrigatórios" };
  }
  const existente = await Usuario.findOne({ where: { email } });
  if (existente) {
    return { ok: false, status: 409, error: "E-mail já cadastrado" };
  }
  const senhaHash = await bcrypt.hash(senha, 10);
  const usuario = await Usuario.create({
    nome,
    email,
    senha: senhaHash,
    perfil,
    status: true,
    criado_em: new Date(),
  });
  return {
    ok: true,
    user: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil },
  };
}

export async function login({ email, senha }) {
  if (!email || !senha) {
    return { ok: false, status: 400, error: "email e senha são obrigatórios" };
  }
  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario || usuario.status === false) {
    return { ok: false, status: 401, error: "Credenciais inválidas" };
  }

  let valido = false;
  if (isBcryptHash(usuario.senha)) {
    valido = await bcrypt.compare(senha, usuario.senha);
  } else {
    valido = senha === usuario.senha;
  }
  if (!valido) {
    return { ok: false, status: 401, error: "Credenciais inválidas" };
  }

  const secret = process.env.JWT_SECRET || "dev-secret";
  const token = jwt.sign(
    { sub: usuario.id, email: usuario.email, perfil: usuario.perfil, nome: usuario.nome, mcp: !!usuario.must_change_password },
    secret,
    { expiresIn: "1d" }
  );

  return {
    ok: true,
    token,
    user: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil, must_change_password: !!usuario.must_change_password },
  };
}


