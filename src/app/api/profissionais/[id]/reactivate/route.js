import { ensureRole } from "@/middlewares/auth";
import { reativar } from "@/controllers/profissionalController";

export async function POST(request, { params }) {
  const auth = ensureRole(request.headers, ["gestor", "secretaria"]);
  if (!auth.ok) return new Response(JSON.stringify(auth), { status: auth.status || 403, headers: { "content-type": "application/json" } });
  const id = Number(params.id);
  const result = await reativar({ adminId: auth.payload?.sub, id });
  return new Response(JSON.stringify(result), { status: result.ok ? 200 : result.status || 400, headers: { "content-type": "application/json" } });
}


