"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import FormInput from "@/components/FormInput";
import CustomButton from "@/components/CustomButton";
import PageContainer from "@/components/PageContainer";

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
    <PageContainer>
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={(theme) => ({
          width: "100%",
          mx: "auto",
          px: { xs: 3, md: 5 },
          py: { xs: 4, md: 5 },
          borderRadius: 4,
          boxShadow: theme.shadows[3],
          backdropFilter: "blur(8px)",
        })}
      >
        <Stack spacing={3}>
          <Stack spacing={1} sx={{ textAlign: "center" }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Recuperar senha
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Digite seu e-mail para receber instruções de recuperação de senha.
            </Typography>
          </Stack>

          {done ? (
            <>
              <Alert severity="success" variant="outlined">
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Solicitação enviada com sucesso!
                </Typography>
                <Typography variant="body2">
                  Se o e-mail informado estiver cadastrado, você receberá um link para redefinir sua senha.
                  Verifique sua caixa de entrada e spam.
                </Typography>
              </Alert>
              <CustomButton variant="outlined" fullWidth onClick={() => router.push("/login")}>
                Voltar para o login
              </CustomButton>
            </>
          ) : (
            <>
              {error && (
                <Alert severity="error" variant="outlined" onClose={() => setError("")}>
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
              />

              <CustomButton
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading || !!emailError || !email.trim()}
              >
                {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Enviar instruções"}
              </CustomButton>

              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="body2"
                  component={NextLink}
                  href="/login"
                  sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                >
                  Voltar para o login
                </Typography>
              </Box>
            </>
          )}
        </Stack>
      </Paper>
    </PageContainer>
  );
}


