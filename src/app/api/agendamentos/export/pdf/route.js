import { NextResponse } from "next/server";
import { exportarPDF } from "@/controllers/agendamentoController";
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

export async function POST(req) {
  try {
    const auth = authenticate(req);
    if (auth.error) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    // POST: apenas gestor e secretaria podem exportar
    const authError = authorize(auth.user, ["gestor", "secretaria"]);
    if (authError) {
      return NextResponse.json({ ok: false, error: authError.error }, { status: authError.status });
    }

    const body = await req.json();
    
    // Criar mock response que funciona com NextResponse
    let responseData = null;
    let responseStatus = 200;
    let pdfBuffer = null;
    let contentType = 'application/json';
    let contentDisposition = null;
    
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
      }),
      setHeader: (name, value) => {
        if (name === 'Content-Type') {
          contentType = value;
        } else if (name === 'Content-Disposition') {
          contentDisposition = value;
        }
      },
      send: (buffer) => {
        pdfBuffer = buffer;
        responseStatus = 200;
      }
    };
    
    // Simular req.body para o controller
    const mockReq = { body, user: auth.user };
    
    await exportarPDF(mockReq, mockRes);
    
    // Se é um PDF, retornar como buffer
    if (pdfBuffer) {
      return new NextResponse(pdfBuffer, {
        status: responseStatus,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': contentDisposition
        }
      });
    }
    
    // Caso contrário, retornar JSON
    return NextResponse.json(responseData, { status: responseStatus });

  } catch (error) {
    console.error("Erro na rota POST /api/agendamentos/export/pdf:", error);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}