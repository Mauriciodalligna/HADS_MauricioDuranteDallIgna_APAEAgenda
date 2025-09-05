import bcrypt from "bcrypt";
import Usuario from "@/server/db/models/usuario";
import PasswordResetToken from "@/server/db/models/password_reset_token";

export async function POST(request) {
  try {
    const { token, senha } = await request.json();
    if (!token || !senha) {
      return new Response(JSON.stringify({ ok: false, error: "token e nova senha são obrigatórios" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    const record = await PasswordResetToken.findOne({ where: { token } });
    if (!record || record.used) {
      return new Response(JSON.stringify({ ok: false, error: "Token inválido" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    if (new Date(record.expires_at) < new Date()) {
      return new Response(JSON.stringify({ ok: false, error: "Token expirado" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    const user = await Usuario.findByPk(record.usuario_id);
    if (!user) {
      return new Response(JSON.stringify({ ok: false, error: "Usuário não encontrado" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }
    const hash = await bcrypt.hash(senha, 10);
    await user.update({ senha: hash });
    await record.update({ used: true });
    return Response.json({ ok: true });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error?.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}


