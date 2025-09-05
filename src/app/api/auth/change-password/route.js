import { verifyAuthFromHeaders } from "@/middlewares/auth";
import bcrypt from "bcrypt";
import Usuario from "@/server/db/models/usuario";

export async function POST(request) {
  try {
    const auth = verifyAuthFromHeaders(request.headers);
    if (!auth.ok) {
      return new Response(JSON.stringify(auth), {
        status: auth.status || 401,
        headers: { "content-type": "application/json" },
      });
    }

    const { senha_atual, nova_senha } = await request.json();
    if (!nova_senha || nova_senha.length < 6) {
      return new Response(JSON.stringify({ ok: false, error: "Nova senha inválida" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const userId = auth.payload?.sub;
    const usuario = await Usuario.findByPk(userId);
    if (!usuario) {
      return new Response(JSON.stringify({ ok: false, error: "Usuário não encontrado" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    if (senha_atual) {
      const ok = await bcrypt.compare(senha_atual, usuario.senha);
      if (!ok) {
        return new Response(JSON.stringify({ ok: false, error: "Senha atual incorreta" }), {
          status: 401,
          headers: { "content-type": "application/json" },
        });
      }
    }

    const novaHash = await bcrypt.hash(nova_senha, 10);
    usuario.senha = novaHash;
    usuario.must_change_password = false;
    await usuario.save();

    return Response.json({ ok: true });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error?.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}


