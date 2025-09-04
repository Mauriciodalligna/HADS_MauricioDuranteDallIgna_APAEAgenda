import { sequelize, verifyDatabaseConnection } from "@/server/db/sequelize";

export async function GET() {
  try {
    const started = Date.now();
    await verifyDatabaseConnection();
    const latencyMs = Date.now() - started;
    return Response.json({ ok: true, latencyMs });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error?.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}


