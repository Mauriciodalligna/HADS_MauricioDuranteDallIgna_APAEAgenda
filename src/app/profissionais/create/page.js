"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import FormInput from "@/components/FormInput";
import CustomButton from "@/components/CustomButton";
import CircularProgress from "@mui/material/CircularProgress";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

export default function ProfissionaisCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState({ nome: "", setor: "", especialidade: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState([]);

  function updateField(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  useEffect(() => {
    async function loadUsuarios() {
      try {
        setError("");
        const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token");
        const res = await fetch(`/api/usuarios?perfil=profissional&status=true&limit=200`, { headers: { authorization: `Bearer ${token}` } });
        const j = await res.json();
        if (!res.ok || !j.ok) { setError(j?.error || "Falha ao carregar usuários profissionais"); return; }
        setUsuarios(j.data || []);
      } catch { setError("Erro ao carregar usuários profissionais"); }
    }
    loadUsuarios();
  }, []);

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
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Cadastrar profissional
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Associe um usuário existente ao perfil de profissional e defina suas áreas de atuação.
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" variant="outlined">
            {error}
          </Alert>
        )}

        <Paper component="form" onSubmit={handleSubmit} variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 4 }}>
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField select label="Usuário (profissional)" value={form.nome} onChange={updateField("nome")} fullWidth required>
                  {usuarios.map((u) => (
                    <MenuItem key={u.id} value={u.nome}>{u.nome}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormInput label="Setor" value={form.setor} onChange={updateField("setor")} />
              </Grid>
              <Grid item xs={12}>
                <FormInput label="Especialidade" value={form.especialidade} onChange={updateField("especialidade")} />
              </Grid>
            </Grid>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <CustomButton variant="outlined" color="inherit" onClick={() => router.push("/profissionais")} disabled={loading}>
                Cancelar
              </CustomButton>
              <CustomButton type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Salvar profissional"}
              </CustomButton>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </AppShell>
  );
}


