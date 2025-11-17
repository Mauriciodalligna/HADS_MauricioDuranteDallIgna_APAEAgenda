"use client";

import { useState } from "react";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import FormInput from "@/components/FormInput";
import CustomButton from "@/components/CustomButton";
import PageContainer from "@/components/PageContainer";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setOkMsg("");
    if (!novaSenha || novaSenha.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmar) {
      setError("Confirmação de senha não confere.");
      return;
    }
    setLoading(true);
    try {
      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token");
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ senha_atual: senhaAtual || undefined, nova_senha: novaSenha }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data?.error || "Falha ao alterar senha.");
        setLoading(false);
        return;
      }
      setOkMsg("Senha alterada com sucesso.");
      // Atualiza flag local do usuário
      const stored = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("user")) || localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        u.must_change_password = false;
        try { sessionStorage.setItem("user", JSON.stringify(u)); } catch {}
        localStorage.setItem("user", JSON.stringify(u));
      }
      setLoading(false);
      router.push("/dashboard");
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
              Alterar senha
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Defina uma nova senha para proteger sua conta. Use uma combinação de letras, números e símbolos.
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
            <FormInput
              type="password"
              label="Senha atual (se aplicável)"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
            />
            <FormInput
              type="password"
              label="Nova senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
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
            {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Salvar nova senha"}
          </CustomButton>
        </Stack>
      </Paper>
    </PageContainer>
  );
}


