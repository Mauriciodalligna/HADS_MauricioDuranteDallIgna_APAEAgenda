import { NextResponse } from "next/server";
import { listarAvisos, criarAviso } from "@/controllers/muralController";
import { authenticate, authorize } from "@/middlewares/auth";

export async function GET(req) {
  try {
    console.log("=== GET /api/mural ===");
    
    const auth = authenticate(req);
    if (auth.error) {
      console.log("Erro de autenticação:", auth.error);
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    console.log("Usuário autenticado:", auth.user);
    
    // Todos os usuários autenticados podem ver o mural
    const mockReq = { 
      query: Object.fromEntries(new URL(req.url).searchParams),
      user: auth.user 
    };
    const mockRes = { 
      json: (data) => {
        console.log("Resposta do controller:", data);
        return data;
      },
      status: (code) => ({ 
        json: (data) => {
          console.log("Resposta com status:", code, data);
          return data;
        }
      })
    };
    
    const result = await listarAvisos(mockReq, mockRes);
    console.log("Resultado final:", result);
    return NextResponse.json(result);

  } catch (error) {
    console.error("Erro na rota GET /api/mural:", error);
    console.error("Stack trace:", error.stack);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    console.log("=== POST /api/mural ===");
    
    const auth = authenticate(req);
    if (auth.error) {
      console.log("Erro de autenticação:", auth.error);
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }
    
    console.log("Usuário autenticado:", auth.user);

    // Apenas gestores e secretaria podem criar avisos
    const authError = authorize(auth.user, ["gestor", "secretaria"]);
    if (authError) {
      return NextResponse.json({ ok: false, error: authError.error }, { status: authError.status });
    }

    const body = await req.json();
    console.log("Body da requisição:", body);
    
    const mockReq = { body, user: auth.user };
    const mockRes = { 
      json: (data) => {
        console.log("Resposta do controller:", data);
        return data;
      }, 
      status: (code) => ({ 
        json: (data) => {
          console.log("Resposta com status:", code, data);
          return data;
        }
      }) 
    };

    const result = await criarAviso(mockReq, mockRes);
    console.log("Resultado final:", result);
    return NextResponse.json(result);

  } catch (error) {
    console.error("Erro na rota POST /api/mural:", error);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
