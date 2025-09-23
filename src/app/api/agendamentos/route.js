import { NextResponse } from "next/server";
import { listar, criar } from "@/controllers/agendamentoController";
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

export async function GET(req) {
  try {
    const auth = authenticate(req);
    if (auth.error) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    // GET: gestor, secretaria, profissional podem listar
    const authError = authorize(auth.user, ["gestor", "secretaria", "profissional"]);
    if (authError) {
      return NextResponse.json({ ok: false, error: authError.error }, { status: authError.status });
    }

    const url = new URL(req.url);
    const queryParams = Object.fromEntries(url.searchParams);
    
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

    // Simular req.query para o controller
    const mockReq = { query: queryParams, user: auth.user };
    
    await listar(mockReq, mockRes);
    
    return NextResponse.json(responseData, { status: responseStatus });

  } catch (error) {
    console.error("Erro na rota GET /api/agendamentos:", error);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const auth = authenticate(req);
    if (auth.error) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    // POST: apenas gestor e secretaria podem criar
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
    
    // Simular req.body para o controller
    const mockReq = { body, user: auth.user };
    
    await criar(mockReq, mockRes);
    
    return NextResponse.json(responseData, { status: responseStatus });

  } catch (error) {
    console.error("Erro na rota POST /api/agendamentos:", error);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}