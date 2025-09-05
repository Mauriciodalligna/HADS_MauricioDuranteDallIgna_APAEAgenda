"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import CustomButton from "@/components/CustomButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

const DIAS = [
  { value: "segunda", label: "Segunda" },
  { value: "terca", label: "Terça" },
  { value: "quarta", label: "Quarta" },
  { value: "quinta", label: "Quinta" },
  { value: "sexta", label: "Sexta" },
];

export default function DisponibilidadesPage() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ profissional_id: "", dia_semana: "" });
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ profissional_id: "", dia_semana: "", hora_inicio: "", hora_fim: "" });

  async function load() {
    try {
      setError("");
      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token");
      const qs = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "")));
      const res = await fetch(`/api/disponibilidades?${qs.toString()}`, { headers: { authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok || !json.ok) { setError(json?.error || "Falha ao carregar disponibilidades"); return; }
      setData(json.data || []);
    } catch { setError("Erro inesperado"); }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <AppShell>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Disponibilidades</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <TextField type="number" label="Profissional ID" value={filters.profissional_id} onChange={(e) => setFilters((f) => ({ ...f, profissional_id: e.target.value }))} />
        <TextField select label="Dia" value={filters.dia_semana} onChange={(e) => setFilters((f) => ({ ...f, dia_semana: e.target.value }))} sx={{ minWidth: 160 }}>
          <MenuItem value="">Todos</MenuItem>
          {DIAS.map((d) => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
        </TextField>
        <CustomButton onClick={load}>Filtrar</CustomButton>
        <CustomButton color="secondary" onClick={() => { setEditing({}); setEditForm({ profissional_id: "", dia_semana: "", hora_inicio: "08:00", hora_fim: "12:00" }); }}>Nova</CustomButton>
      </div>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Profissional</TableCell>
            <TableCell>Dia</TableCell>
            <TableCell>Início</TableCell>
            <TableCell>Fim</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((d) => (
            <TableRow key={d.id}>
              <TableCell>{d.id}</TableCell>
              <TableCell>{d.profissional_id}</TableCell>
              <TableCell>{d.dia_semana}</TableCell>
              <TableCell>{d.hora_inicio}</TableCell>
              <TableCell>{d.hora_fim}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => { setEditing(d); setEditForm({ ...d }); }}>Editar</Button>
                  <Button size="small" color="warning" onClick={async () => {
                    const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token");
                    const res = await fetch(`/api/disponibilidades/${d.id}`, { method: "DELETE", headers: { authorization: `Bearer ${token}` } });
                    if (res.ok) load();
                  }}>Excluir</Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} fullWidth maxWidth="sm">
        <DialogTitle>{editing?.id ? "Editar disponibilidade" : "Nova disponibilidade"}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <TextField type="number" label="Profissional ID" value={editForm.profissional_id} onChange={(e) => setEditForm((f) => ({ ...f, profissional_id: e.target.value }))} />
            <TextField select label="Dia" value={editForm.dia_semana} onChange={(e) => setEditForm((f) => ({ ...f, dia_semana: e.target.value }))}>
              {DIAS.map((d) => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
            </TextField>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            <TextField type="time" label="Início" value={editForm.hora_inicio} onChange={(e) => setEditForm((f) => ({ ...f, hora_inicio: e.target.value }))} InputLabelProps={{ shrink: true }} />
            <TextField type="time" label="Fim" value={editForm.hora_fim} onChange={(e) => setEditForm((f) => ({ ...f, hora_fim: e.target.value }))} InputLabelProps={{ shrink: true }} />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancelar</Button>
          <Button variant="contained" onClick={async () => {
            const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token");
            const payload = { ...editForm, profissional_id: editForm.profissional_id ? Number(editForm.profissional_id) : undefined };
            const res = await fetch(`/api/disponibilidades${editing?.id ? `/${editing.id}` : ""}`, {
              method: editing?.id ? "PUT" : "POST",
              headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
              body: JSON.stringify(payload),
            });
            const j = await res.json();
            if (!res.ok || !j.ok) { alert(j?.error || "Erro ao salvar"); return; }
            setEditing(null);
            load();
          }}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}


