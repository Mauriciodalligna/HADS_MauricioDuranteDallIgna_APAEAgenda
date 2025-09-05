import { register } from "@/controllers/authController";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await register(body);
    if (!result.ok) {
      return new Response(JSON.stringify(result), {
        status: result.status || 400,
        headers: { "content-type": "application/json" },
      });
    }
    return Response.json(result, { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error?.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}


