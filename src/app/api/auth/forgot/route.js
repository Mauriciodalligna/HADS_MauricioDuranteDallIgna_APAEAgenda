import crypto from "crypto";
import { Op } from "sequelize";
import Usuario from "@/server/db/models/usuario";
import PasswordResetToken from "@/server/db/models/password_reset_token";
import { sendPasswordResetEmail, isEmailConfigured } from "@/utils/email";

// Validação de email
function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

export async function POST(request) {
  try {
    const { email } = await request.json();

    // Validação básica
    if (!email) {
      return new Response(
        JSON.stringify({ ok: false, error: "E-mail é obrigatório" }),
        {
          status: 400,
          headers: { "content-type": "application/json" },
        }
      );
    }

    // Normalizar email
    const normalizedEmail = email.trim().toLowerCase();

    // Validação de formato
    if (!isValidEmail(normalizedEmail)) {
      return new Response(
        JSON.stringify({ ok: false, error: "E-mail inválido" }),
        {
          status: 400,
          headers: { "content-type": "application/json" },
        }
      );
    }

    // Buscar usuário
    const user = await Usuario.findOne({ where: { email: normalizedEmail } });

    // Resposta neutra (não revelar se o email existe ou não por segurança)
    // Sempre retornar sucesso mesmo se o usuário não existir
    if (!user) {
      return Response.json({
        ok: true,
        message: "Se o e-mail estiver cadastrado, você receberá instruções",
      });
    }

    // Verificar se o usuário está ativo
    if (user.status === false) {
      return Response.json({
        ok: true,
        message: "Se o e-mail estiver cadastrado, você receberá instruções",
      });
    }

    // Verificar se já existe um token válido recente (rate limiting)
    const recentToken = await PasswordResetToken.findOne({
      where: {
        usuario_id: user.id,
        used: false,
        expires_at: {
          [Op.gt]: new Date(),
        },
        criado_em: {
          [Op.gte]: new Date(Date.now() - 5 * 60 * 1000), // Últimos 5 minutos
        },
      },
    });

    if (recentToken) {
      // Token já criado recentemente - não criar novo (rate limiting)
      return Response.json({
        ok: true,
        message: "Se o e-mail estiver cadastrado, você receberá instruções",
      });
    }

    // Invalidar tokens anteriores não utilizados
    await PasswordResetToken.update(
      { used: true },
      {
        where: {
          usuario_id: user.id,
          used: false,
          expires_at: {
            [Op.gt]: new Date(),
          },
        },
      }
    );

    // Gerar novo token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

    await PasswordResetToken.create({
      usuario_id: user.id,
      token,
      expires_at: expiresAt,
      used: false,
      criado_em: new Date(),
    });

    // Enviar email de recuperação
    const emailSent = await sendPasswordResetEmail(
      user.email,
      token,
      user.nome
    );

    // Se email não foi enviado mas está configurado, logar erro
    if (!emailSent && isEmailConfigured()) {
      console.error(`❌ Falha ao enviar email de recuperação para ${user.email}`);
      // Não falhar completamente - o token foi criado, usuário pode usar o link direto
    }

    // Em desenvolvimento, mostrar token no console se email não estiver configurado
    if (process.env.NODE_ENV === "development" && !isEmailConfigured()) {
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset?token=${token}`;
      console.log(`\n📧 Email não configurado - Modo Desenvolvimento`);
      console.log(`🔑 Token de recuperação para ${user.email}: ${token}`);
      console.log(`🔗 Link de recuperação: ${resetUrl}\n`);
    }

    return Response.json({
      ok: true,
      message: "Se o e-mail estiver cadastrado, você receberá instruções",
      // Em desenvolvimento e sem email configurado, retornar token para facilitar testes
      ...(process.env.NODE_ENV === "development" && !isEmailConfigured() && { token, expiresAt }),
    });
  } catch (error) {
    console.error("Erro ao processar recuperação de senha:", error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Erro interno do servidor. Tente novamente mais tarde.",
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      }
    );
  }
}


