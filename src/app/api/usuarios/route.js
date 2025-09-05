import { ensureRole } from "@/middlewares/auth";
import { listar, criar } from "@/controllers/usuarioController";

export async function GET(request) {
  const auth = ensureRole(request.headers, ["gestor"]);
  if (!auth.ok) {
    return new Response(JSON.stringify(auth), {
      status: auth.status || 403,
      headers: { "content-type": "application/json" },
    });
  }
  const { searchParams } = new URL(request.url);
  const search = {
    nome: searchParams.get("nome") || undefined,
    perfil: searchParams.get("perfil") || undefined,
    status: searchParams.get("status") || undefined,
  };
  const pagination = {
    offset: searchParams.get("offset") || 0,
    limit: searchParams.get("limit") || 100,
  };
  const result = await listar({ search, pagination });
  const status = result.ok ? 200 : result.status || 400;
  return new Response(JSON.stringify(result), { status, headers: { "content-type": "application/json" } });
}

export async function POST(request) {
  const auth = ensureRole(request.headers, ["gestor"]);
  if (!auth.ok) {
    return new Response(JSON.stringify(auth), {
      status: auth.status || 403,
      headers: { "content-type": "application/json" },
    });
  }
  const body = await request.json();
  const result = await criar({ adminId: auth.payload?.sub, ...body });
  const status = result.ok ? 201 : result.status || 400;
  return new Response(JSON.stringify(result), { status, headers: { "content-type": "application/json" } });
}


