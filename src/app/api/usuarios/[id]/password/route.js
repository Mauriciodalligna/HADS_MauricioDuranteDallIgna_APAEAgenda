import { ensureRole } from "@/middlewares/auth";
import { alterarSenhaAdmin } from "@/controllers/usuarioController";

export async function POST(request, { params }) {
  const auth = ensureRole(request.headers, ["gestor"]);
  if (!auth.ok) {
    return new Response(JSON.stringify(auth), {
      status: auth.status || 403,
      headers: { "content-type": "application/json" },
    });
  }
  const id = Number(params.id);
  const body = await request.json();
  const { novaSenha, exigirTroca } = body || {};
  const result = await alterarSenhaAdmin({ adminId: auth.payload?.sub, id, novaSenha, exigirTroca });
  const status = result.ok ? 200 : result.status || 400;
  return new Response(JSON.stringify(result), { status, headers: { "content-type": "application/json" } });
}


