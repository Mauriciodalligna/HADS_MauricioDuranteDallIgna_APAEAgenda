"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import MenuItem from "@mui/material/MenuItem";
import FormInput from "@/components/FormInput";
import CustomButton from "@/components/CustomButton";
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
      <form onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Novo Usuário</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <FormInput label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        <FormInput type="email" label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <FormInput select label="Perfil" value={perfil} onChange={(e) => setPerfil(e.target.value)} required>
          <MenuItem value="gestor">Gestor</MenuItem>
          <MenuItem value="profissional">Profissional</MenuItem>
          <MenuItem value="secretaria">Secretaria</MenuItem>
        </FormInput>
        <FormInput type="password" label="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        <CustomButton type="submit" disabled={loading} sx={{ mt: 2 }}>Salvar</CustomButton>
      </form>
    </AppShell>
  );
}


