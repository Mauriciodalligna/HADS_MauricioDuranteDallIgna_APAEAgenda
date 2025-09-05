import crypto from "crypto";
import Usuario from "@/server/db/models/usuario";
import PasswordResetToken from "@/server/db/models/password_reset_token";

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return new Response(JSON.stringify({ ok: false, error: "E-mail é obrigatório" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    const user = await Usuario.findOne({ where: { email } });
    // Resposta neutra (não revelar existência)
    if (!user) {
      return Response.json({ ok: true, message: "Se existir, enviaremos o link" });
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    await PasswordResetToken.create({
      usuario_id: user.id,
      token,
      expires_at: expiresAt,
      used: false,
      criado_em: new Date(),
    });
    // Aqui poderíamos enviar e-mail com o link contendo o token
    return Response.json({ ok: true, token, expiresAt });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error?.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}


