"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import FormInput from "@/components/FormInput";
import CustomButton from "@/components/CustomButton";
import MenuItem from "@mui/material/MenuItem";
import { useRouter } from "next/navigation";

export default function AlunosCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nome: "",
    idade: "",
    turma: "",
    turno: "",
    cidade: "",
    responsavel_nome: "",
    responsavel_telefone: "",
    escola_regular: "",
    serie: "",
    observacoes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.nome) return setError("Nome é obrigatório.");
    if (!form.turma) return setError("Turma é obrigatória.");
    if (!form.turno) return setError("Turno é obrigatório.");
    setLoading(true);
    try {
      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token");
      const res = await fetch("/api/alunos", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          idade: form.idade ? Number(form.idade) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data?.error || "Falha ao cadastrar aluno");
        setLoading(false);
        return;
      }
      router.push("/alunos");
    } catch (err) {
      setError("Erro inesperado.");
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <form onSubmit={handleSubmit} style={{ maxWidth: 900 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Cadastrar Aluno</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormInput label="Nome" value={form.nome} onChange={updateField("nome")} required />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormInput type="number" label="Idade" value={form.idade} onChange={updateField("idade")} />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormInput label="Turma" value={form.turma} onChange={updateField("turma")} required />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormInput select label="Turno" value={form.turno} onChange={updateField("turno")} required>
              <MenuItem value="manhã">Manhã</MenuItem>
              <MenuItem value="tarde">Tarde</MenuItem>
              <MenuItem value="noite">Noite</MenuItem>
            </FormInput>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormInput label="Cidade" value={form.cidade} onChange={updateField("cidade")} />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormInput label="Escola regular" value={form.escola_regular} onChange={updateField("escola_regular")} />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormInput label="Série" value={form.serie} onChange={updateField("serie")} />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormInput label="Responsável" value={form.responsavel_nome} onChange={updateField("responsavel_nome")} />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormInput label="Telefone do responsável" value={form.responsavel_telefone} onChange={updateField("responsavel_telefone")} />
          </Grid>
          <Grid item xs={12}>
            <FormInput label="Observações" value={form.observacoes} onChange={updateField("observacoes")} multiline minRows={3} />
          </Grid>
        </Grid>
        <CustomButton type="submit" sx={{ mt: 2 }} disabled={loading}>Salvar</CustomButton>
      </form>
    </AppShell>
  );
}


