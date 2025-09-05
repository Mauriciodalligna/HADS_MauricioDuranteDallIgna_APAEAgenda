"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
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
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 480, margin: "40px auto", background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
          Redefinir Senha
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
        {!tokenFromUrl && (
          <FormInput label="Token" value={token} onChange={(e) => setToken(e.target.value)} required />
        )}
        <FormInput type="password" label="Nova senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        <FormInput type="password" label="Confirmar nova senha" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} required />
        <CustomButton type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ py: 1.2 }}>
          {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Redefinir"}
        </CustomButton>
      </form>
    </PageContainer>
  );
}


