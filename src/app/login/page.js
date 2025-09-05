"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Link from "next/link";
import CircularProgress from "@mui/material/CircularProgress";
import PageContainer from "@/components/PageContainer";
import FormInput from "@/components/FormInput";
import CustomButton from "@/components/CustomButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!email || !senha) {
      setError("Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data?.error || "Falha no login");
        setLoading(false);
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.user?.must_change_password) {
        router.push("/auth/change-password");
        return;
      }
      const destino = data.user?.perfil === "gestor" ? "/admin" : "/dashboard";
      router.push(destino);
    } catch (e) {
      setError("Erro inesperado. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <PageContainer>
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 420, margin: "40px auto", background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
          Entrar no APAE Agenda
        </Typography>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}
        <FormInput type="email" label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <FormInput type="password" label="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        <CustomButton type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ py: 1.2 }}>
          {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Entrar"}
        </CustomButton>
        <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
          <Link href="/auth/forgot">Esqueci minha senha</Link>
          <Link href="/auth/register">Criar conta</Link>
        </Box>
      </form>
    </PageContainer>
  );
}


