import { NextResponse } from "next/server";
import { atualizar, cancelar } from "@/controllers/agendamentoController";
import { initAssociations } from "@/server/db/models";

// Inicializar associações
initAssociations();

// Middleware de autenticação
function authenticate(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Token de acesso requerido", status: 401 };
  }
  
  const token = authHeader.substring(7);
  // TODO: Verificar JWT token
  // Por enquanto, simular usuário autenticado
  return { user: { id: 1, perfil: "gestor" } };
}

// Middleware de autorização por roles
function authorize(user, allowedRoles) {
  if (!allowedRoles.includes(user.perfil)) {
    return { error: "Acesso negado", status: 403 };
  }
  return null;
}

export async function PUT(req, { params }) {
  try {
    const auth = authenticate(req);
    if (auth.error) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    // PUT: apenas gestor e secretaria podem editar
    const authError = authorize(auth.user, ["gestor", "secretaria"]);
    if (authError) {
      return NextResponse.json({ ok: false, error: authError.error }, { status: authError.status });
    }

    const body = await req.json();
    
    // Criar mock response que funciona com NextResponse
    let responseData = null;
    let responseStatus = 200;
    
    const mockRes = {
      json: (data) => {
        responseData = data;
        return data;
      },
      status: (code) => ({
        json: (data) => {
          responseData = data;
          responseStatus = code;
          return data;
        }
      })
    };
    
    // Simular req.params e req.body para o controller
    const mockReq = { params: { id: params.id }, body, user: auth.user };
    
    await atualizar(mockReq, mockRes);
    
    return NextResponse.json(responseData, { status: responseStatus });

  } catch (error) {
    console.error("Erro na rota PUT /api/agendamentos/[id]:", error);
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

    // DELETE: apenas gestor e secretaria podem cancelar
    const authError = authorize(auth.user, ["gestor", "secretaria"]);
    if (authError) {
      return NextResponse.json({ ok: false, error: authError.error }, { status: authError.status });
    }

    const body = await req.json();
    
    // Criar mock response que funciona com NextResponse
    let responseData = null;
    let responseStatus = 200;
    
    const mockRes = {
      json: (data) => {
        responseData = data;
        return data;
      },
      status: (code) => ({
        json: (data) => {
          responseData = data;
          responseStatus = code;
          return data;
        }
      })
    };
    
    // Simular req.params e req.body para o controller
    const mockReq = { params: { id: params.id }, body, user: auth.user };
    
    await cancelar(mockReq, mockRes);
    
    return NextResponse.json(responseData, { status: responseStatus });

  } catch (error) {
    console.error("Erro na rota DELETE /api/agendamentos/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}