"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import FormInput from "@/components/FormInput";
import CustomButton from "@/components/CustomButton";
import { useRouter } from "next/navigation";

export default function ProfissionaisCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState({ nome: "", setor: "", especialidade: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.nome) return setError("Nome é obrigatório.");
    setLoading(true);
    try {
      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token");
      const res = await fetch("/api/profissionais", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data?.error || "Falha ao cadastrar profissional");
        setLoading(false);
        return;
      }
      router.push("/profissionais");
    } catch (err) {
      setError("Erro inesperado.");
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <form onSubmit={handleSubmit} style={{ maxWidth: 720 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Cadastrar Profissional</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormInput label="Nome" value={form.nome} onChange={updateField("nome")} required />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormInput label="Setor" value={form.setor} onChange={updateField("setor")} />
          </Grid>
          <Grid item xs={12}>
            <FormInput label="Especialidade" value={form.especialidade} onChange={updateField("especialidade")} />
          </Grid>
        </Grid>
        <CustomButton type="submit" sx={{ mt: 2 }} disabled={loading}>Salvar</CustomButton>
      </form>
    </AppShell>
  );
}


