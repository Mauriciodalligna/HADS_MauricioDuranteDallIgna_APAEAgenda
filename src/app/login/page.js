"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Link from "next/link";
import CircularProgress from "@mui/material/CircularProgress";
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
      try {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify(data.user));
      } catch {}
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.user?.must_change_password) {
        router.push("/auth/change-password");
        return;
      }
      const destino = "/dashboard";
      router.push(destino);
    } catch (e) {
      setError("Erro inesperado. Tente novamente.");
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
              APAE Agenda
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sistema de Gestão de Agendamentos
            </Typography>
          </Box>

          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}

          <FormInput
            type="email"
            label="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            sx={{ mb: 2 }}
          />
          <FormInput
            type="password"
            label="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            fullWidth
            sx={{ mb: 3 }}
          />

          <CustomButton
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ py: 1.5, mb: 2 }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Entrar"}
          </CustomButton>

          <Box sx={{ textAlign: "center" }}>
            <Link
              href="/auth/forgot"
              style={{
                textDecoration: "none",
                color: "inherit",
                fontSize: "0.875rem",
              }}
            >
              Esqueci minha senha
            </Link>
          </Box>
        </Box>
    </Box>
  );
}


