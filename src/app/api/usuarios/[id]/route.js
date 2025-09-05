import { ensureRole } from "@/middlewares/auth";
import { atualizar, desativar } from "@/controllers/usuarioController";

export async function PUT(request, { params }) {
  const auth = ensureRole(request.headers, ["gestor"]);
  if (!auth.ok) {
    return new Response(JSON.stringify(auth), {
      status: auth.status || 403,
      headers: { "content-type": "application/json" },
    });
  }
  const id = Number(params.id);
  const body = await request.json();
  const result = await atualizar({ adminId: auth.payload?.sub, id, ...body });
  const status = result.ok ? 200 : result.status || 400;
  return new Response(JSON.stringify(result), { status, headers: { "content-type": "application/json" } });
}

export async function DELETE(request, { params }) {
  const auth = ensureRole(request.headers, ["gestor"]);
  if (!auth.ok) {
    return new Response(JSON.stringify(auth), {
      status: auth.status || 403,
      headers: { "content-type": "application/json" },
    });
  }
  const id = Number(params.id);
  const result = await desativar({ adminId: auth.payload?.sub, id });
  const status = result.ok ? 200 : result.status || 400;
  return new Response(JSON.stringify(result), { status, headers: { "content-type": "application/json" } });
}


