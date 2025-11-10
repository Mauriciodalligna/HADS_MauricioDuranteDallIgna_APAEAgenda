"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Link from "next/link";
import CircularProgress from "@mui/material/CircularProgress";
import FormInput from "@/components/FormInput";
import CustomButton from "@/components/CustomButton";

// Validação de email
const validateEmail = (email) => {
  if (!email) {
    return "E-mail é obrigatório";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Por favor, insira um e-mail válido";
  }
  if (email.length > 255) {
    return "E-mail muito longo (máximo 255 caracteres)";
  }
  return null;
};

export default function ForgotPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    // Validação em tempo real
    if (value && emailError) {
      const validationError = validateEmail(value);
      setEmailError(validationError || "");
    }
  };

  const handleEmailBlur = () => {
    const validationError = validateEmail(email);
    setEmailError(validationError || "");
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setEmailError("");

    // Validação antes de enviar
    const validationError = validateEmail(email);
    if (validationError) {
      setEmailError(validationError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Não foi possível processar sua solicitação. Tente novamente mais tarde.");
        setLoading(false);
        return;
      }

      // Sucesso - resposta neutra para segurança
      setDone(true);
    } catch (err) {
      setError("Erro de conexão. Verifique sua internet e tente novamente.");
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        px: 2,
        bgcolor: "background.default",
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          padding: 4,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: "primary.main" }}>
            Recuperar senha
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Digite seu e-mail para receber instruções de recuperação
          </Typography>
        </Box>

        {done ? (
          <>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Solicitação enviada com sucesso!
              </Typography>
              <Typography variant="body2">
                Se o e-mail informado estiver cadastrado, você receberá um link para redefinir sua senha.
                Verifique sua caixa de entrada e spam.
              </Typography>
            </Alert>
            <CustomButton
              variant="outlined"
              fullWidth
              onClick={() => router.push("/login")}
              sx={{ mb: 2 }}
            >
              Voltar para o login
            </CustomButton>
          </>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            <FormInput
              type="email"
              label="E-mail"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              error={!!emailError}
              helperText={emailError}
              required
              fullWidth
              disabled={loading}
              autoComplete="email"
              autoFocus
              sx={{ mb: 3 }}
            />

            <CustomButton
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading || !!emailError || !email.trim()}
              sx={{ py: 1.5, mb: 2 }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Enviar instruções"}
            </CustomButton>

            <Box sx={{ textAlign: "center" }}>
              <Link
                href="/login"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  fontSize: "0.875rem",
                }}
              >
                Voltar para o login
              </Link>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}


