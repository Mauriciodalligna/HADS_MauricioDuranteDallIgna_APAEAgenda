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
import Link from "next/link";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

export default function AtividadesListPage() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ nome: "", tipo: "", status: "" });
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ nome: "", tipo: "", duracao_padrao: "", cor: "#1976d2", status: true });

  async function load() {
    try {
      setError("");
      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token");
      const qs = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "")));
      const res = await fetch(`/api/atividades?${qs.toString()}`, { headers: { authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok || !json.ok) { setError(json?.error || "Falha ao carregar atividades"); return; }
      setData(json.data || []);
    } catch { setError("Erro inesperado"); }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <AppShell>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Atividades</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <TextField label="Nome" value={filters.nome} onChange={(e) => setFilters((f) => ({ ...f, nome: e.target.value }))} />
        <TextField label="Tipo" value={filters.tipo} onChange={(e) => setFilters((f) => ({ ...f, tipo: e.target.value }))} />
        <TextField select label="Status" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} sx={{ minWidth: 160 }}>
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="true">Ativo</MenuItem>
          <MenuItem value="false">Inativo</MenuItem>
        </TextField>
        <CustomButton onClick={load}>Filtrar</CustomButton>
        <Link href="/atividades/create"><CustomButton color="secondary">Nova Atividade</CustomButton></Link>
      </div>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nome</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Duração (min)</TableCell>
            <TableCell>Cor</TableCell>
            <TableCell>Agendamentos</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((a) => (
            <TableRow key={a.id}>
              <TableCell>{a.id}</TableCell>
              <TableCell>{a.nome}</TableCell>
              <TableCell>{a.tipo ?? '-'}</TableCell>
              <TableCell>{a.duracao_padrao ?? '-'}</TableCell>
              <TableCell>
                {a.cor ? (
                  <span style={{ display: 'inline-block', width: 14, height: 14, background: a.cor, borderRadius: 3, border: '1px solid #ccc' }} />
                ) : '-'}
              </TableCell>
              <TableCell>{a.agendamentos_count ?? 0}</TableCell>
              <TableCell>{a.status ? "Ativo" : "Inativo"}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => {
                    setEditing(a);
                    setEditForm({ nome: a.nome || "", tipo: a.tipo || "", duracao_padrao: a.duracao_padrao ?? "", cor: a.cor || "#1976d2", status: !!a.status });
                  }}>Editar</Button>
                  {a.status ? (
                    <Button size="small" color="warning" onClick={async () => {
                      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token");
                      const res = await fetch(`/api/atividades/${a.id}`, { method: "DELETE", headers: { authorization: `Bearer ${token}` } });
                      if (res.ok) load();
                    }}>Desativar</Button>
                  ) : (
                    <Button size="small" color="success" onClick={async () => {
                      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token");
                      const res = await fetch(`/api/atividades/${a.id}`, { method: "PUT", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify({ status: true }) });
                      if (res.ok) load();
                    }}>Reativar</Button>
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} fullWidth maxWidth="sm">
        <DialogTitle>Editar atividade</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField label="Nome" value={editForm.nome} onChange={(e) => setEditForm((f) => ({ ...f, nome: e.target.value }))} fullWidth sx={{ mb: 2 }} />
          <TextField label="Tipo" value={editForm.tipo} onChange={(e) => setEditForm((f) => ({ ...f, tipo: e.target.value }))} fullWidth sx={{ mb: 2 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <TextField type="number" label="Duração (min)" value={editForm.duracao_padrao} onChange={(e) => setEditForm((f) => ({ ...f, duracao_padrao: e.target.value }))} />
            <TextField type="color" label="Cor" value={editForm.cor} onChange={(e) => setEditForm((f) => ({ ...f, cor: e.target.value }))} InputLabelProps={{ shrink: true }} />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancelar</Button>
          <Button variant="contained" onClick={async () => {
            if (!editing) return;
            const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token");
            const res = await fetch(`/api/atividades/${editing.id}`, {
              method: "PUT",
              headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
              body: JSON.stringify({
                ...editForm,
                duracao_padrao: editForm.duracao_padrao ? Number(editForm.duracao_padrao) : null,
              }),
            });
            if (res.ok) { setEditing(null); load(); }
          }}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}


