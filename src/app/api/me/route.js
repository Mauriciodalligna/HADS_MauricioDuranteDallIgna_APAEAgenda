import { verifyAuthFromHeaders } from "@/middlewares/auth";
import Usuario from "@/server/db/models/usuario";

export async function GET(request) {
  const auth = verifyAuthFromHeaders(request.headers);
  if (!auth.ok) {
    return new Response(JSON.stringify(auth), {
      status: auth.status || 401,
      headers: { "content-type": "application/json" },
    });
  }

  const user = await Usuario.findByPk(auth.payload.sub, {
    attributes: ["id", "nome", "email", "perfil", "status"],
  });
  if (!user) {
    return new Response(JSON.stringify({ ok: false, error: "Usuário não encontrado" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }
  return Response.json({ ok: true, user });
}


