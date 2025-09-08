import { ensureRole } from "@/middlewares/auth";
import { atualizar, desativar } from "@/controllers/atividadeController";

export async function PUT(request, { params }) {
  const auth = ensureRole(request.headers, ["gestor", "secretaria"]);
  if (!auth.ok) return new Response(JSON.stringify(auth), { status: auth.status || 403, headers: { "content-type": "application/json" } });
  const id = Number(params.id);
  const body = await request.json();
  const result = await atualizar({ adminId: auth.payload?.sub, id, ...body });
  return new Response(JSON.stringify(result), { status: result.ok ? 200 : result.status || 400, headers: { "content-type": "application/json" } });
}

export async function DELETE(request, { params }) {
  const auth = ensureRole(request.headers, ["gestor", "secretaria"]);
  if (!auth.ok) return new Response(JSON.stringify(auth), { status: auth.status || 403, headers: { "content-type": "application/json" } });
  const id = Number(params.id);
  const result = await desativar({ adminId: auth.payload?.sub, id });
  return new Response(JSON.stringify(result), { status: result.ok ? 200 : result.status || 400, headers: { "content-type": "application/json" } });
}


