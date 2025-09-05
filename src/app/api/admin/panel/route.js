import { ensureRole } from "@/middlewares/auth";

export async function GET(request) {
  const auth = ensureRole(request.headers, ["gestor"]);
  if (!auth.ok) {
    return new Response(JSON.stringify(auth), {
      status: auth.status || 403,
      headers: { "content-type": "application/json" },
    });
  }
  return Response.json({ ok: true, message: "Bem-vindo ao painel do gestor" });
}


