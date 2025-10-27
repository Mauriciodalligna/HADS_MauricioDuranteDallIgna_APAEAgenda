import { NextResponse } from "next/server";
import { obterAviso, atualizarAviso, excluirAviso } from "@/controllers/muralController";
import { authenticate, authorize } from "@/middlewares/auth";

export async function GET(req, { params }) {
  try {
    const auth = authenticate(req);
    if (auth.error) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    // Todos os usuários autenticados podem ver avisos
    const mockReq = { params, user: auth.user };
    const mockRes = { json: (data) => data, status: (code) => ({ json: (data) => data }) };

    const result = await obterAviso(mockReq, mockRes);
    return NextResponse.json(result);

  } catch (error) {
    console.error("Erro na rota GET /api/mural/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const auth = authenticate(req);
    if (auth.error) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    // Apenas gestores e secretaria podem editar avisos
    const authError = authorize(auth.user, ["gestor", "secretaria"]);
    if (authError) {
      return NextResponse.json({ ok: false, error: authError.error }, { status: authError.status });
    }

    const body = await req.json();
    const mockReq = { params, body, user: auth.user };
    const mockRes = { json: (data) => data, status: (code) => ({ json: (data) => data }) };

    const result = await atualizarAviso(mockReq, mockRes);
    return NextResponse.json(result);

  } catch (error) {
    console.error("Erro na rota PUT /api/mural/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = authenticate(req);
    if (auth.error) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    // Apenas gestores e secretaria podem excluir avisos
    const authError = authorize(auth.user, ["gestor", "secretaria"]);
    if (authError) {
      return NextResponse.json({ ok: false, error: authError.error }, { status: authError.status });
    }

    const mockReq = { params, user: auth.user };
    const mockRes = { json: (data) => data, status: (code) => ({ json: (data) => data }) };

    const result = await excluirAviso(mockReq, mockRes);
    return NextResponse.json(result);

  } catch (error) {
    console.error("Erro na rota DELETE /api/mural/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
