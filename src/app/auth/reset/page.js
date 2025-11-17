"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import PageContainer from "@/components/PageContainer";
import FormInput from "@/components/FormInput";
import CustomButton from "@/components/CustomButton";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [token, setToken] = useState(tokenFromUrl);
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setOkMsg("");
    if (!token) {
      setError("Token é obrigatório.");
      return;
    }
    if (!senha || senha.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      setError("Confirmação de senha não confere.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, senha }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data?.error || "Falha ao redefinir senha.");
        setLoading(false);
        return;
      }
      setOkMsg("Senha redefinida com sucesso. Você será redirecionado para o login...");
      setLoading(false);
      setTimeout(() => router.push("/login"), 1200);
    } catch (err) {
      setError("Erro inesperado. Tente novamente.");
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
          <Stack spacing={1}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Redefinir senha
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crie uma senha forte: combine letras, números e símbolos para proteger o acesso.
            </Typography>
          </Stack>
          <Divider flexItem />
          {error && (
            <Alert severity="error" variant="outlined">
              {error}
            </Alert>
          )}
          {okMsg && (
            <Alert severity="success" variant="outlined">
              {okMsg}
            </Alert>
          )}
          <Stack spacing={2}>
            {!tokenFromUrl && (
              <FormInput label="Token de verificação" value={token} onChange={(e) => setToken(e.target.value)} required />
            )}
            <FormInput
              type="password"
              label="Nova senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <FormInput
              type="password"
              label="Confirmar nova senha"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
            />
          </Stack>
          <CustomButton type="submit" variant="contained" size="large" color="primary" fullWidth disabled={loading}>
            {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Redefinir senha"}
          </CustomButton>
        </Stack>
      </Paper>
    </PageContainer>
  );
}


