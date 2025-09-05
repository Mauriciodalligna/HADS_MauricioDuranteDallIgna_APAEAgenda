"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
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
    <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center", p: 2 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", maxWidth: 420, p: 4, border: "1px solid #e0e0e0", borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", backgroundColor: "#fff" }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
          Alterar senha
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {okMsg && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {okMsg}
          </Alert>
        )}
        <TextField type="password" label="Senha atual (se aplicável)" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} fullWidth sx={{ mb: 2 }} />
        <TextField type="password" label="Nova senha" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} fullWidth required sx={{ mb: 2 }} />
        <TextField type="password" label="Confirmar nova senha" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} fullWidth required sx={{ mb: 2 }} />
        <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ py: 1.2 }}>
          {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Salvar"}
        </Button>
      </Box>
    </Box>
  );
}


