"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import MenuItem from "@mui/material/MenuItem";
import FormInput from "@/components/FormInput";
import CustomButton from "@/components/CustomButton";
import CircularProgress from "@mui/material/CircularProgress";
import { useRouter } from "next/navigation";

export default function UsuariosCreatePage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [perfil, setPerfil] = useState("profissional");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!nome || !email || !senha || !perfil) {
      setError("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ nome, email, senha, perfil }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data?.error || "Falha ao criar usuário");
        setLoading(false);
        return;
      }
      router.push("/usuarios");
    } catch (err) {
      setError("Erro inesperado.");
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Novo usuário
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Crie uma nova conta de acesso ao sistema com permissões adequadas ao perfil selecionado.
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" variant="outlined">
            {error}
          </Alert>
        )}

        <Paper component="form" onSubmit={handleSubmit} variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, maxWidth: 560 }}>
          <Stack spacing={3}>
            <FormInput label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            <FormInput type="email" label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <FormInput select label="Perfil" value={perfil} onChange={(e) => setPerfil(e.target.value)} required>
              <MenuItem value="gestor">Gestor</MenuItem>
              <MenuItem value="profissional">Profissional</MenuItem>
              <MenuItem value="secretaria">Secretaria</MenuItem>
            </FormInput>
            <FormInput type="password" label="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <CustomButton variant="outlined" color="inherit" onClick={() => router.push("/usuarios")} disabled={loading}>
                Cancelar
              </CustomButton>
              <CustomButton type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Criar usuário"}
              </CustomButton>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </AppShell>
  );
}


