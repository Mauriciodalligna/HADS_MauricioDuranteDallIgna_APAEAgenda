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

export default function ProfissionaisListPage() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ nome: "", setor: "" });
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ nome: "", setor: "", especialidade: "", status: true });

  async function load() {
    try {
      setError("");
      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token");
      const qs = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "")));
      const res = await fetch(`/api/profissionais?${qs.toString()}`, { headers: { authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.error || "Falha ao carregar profissionais");
        return;
      }
      setData(json.data || []);
    } catch (e) {
      setError("Erro inesperado");
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <AppShell>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Profissionais</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <TextField label="Nome" value={filters.nome} onChange={(e) => setFilters((f) => ({ ...f, nome: e.target.value }))} />
        <TextField label="Setor" value={filters.setor} onChange={(e) => setFilters((f) => ({ ...f, setor: e.target.value }))} />
        <CustomButton onClick={load} color="primary">Filtrar</CustomButton>
        <Link href="/profissionais/create"><CustomButton color="secondary">Novo Profissional</CustomButton></Link>
      </div>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nome</TableCell>
            <TableCell>Setor</TableCell>
            <TableCell>Especialidade</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.id}</TableCell>
              <TableCell>{p.nome}</TableCell>
              <TableCell>{p.setor ?? '-'}</TableCell>
              <TableCell>{p.especialidade ?? '-'}</TableCell>
              <TableCell>{p.status ? "Ativo" : "Inativo"}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => {
                    setEditing(p);
                    setEditForm({ nome: p.nome || "", setor: p.setor || "", especialidade: p.especialidade || "", status: !!p.status });
                  }}>Editar</Button>
                  {p.status ? (
                    <Button size="small" color="warning" onClick={async () => {
                      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token");
                      const res = await fetch(`/api/profissionais/${p.id}`, { method: "DELETE", headers: { authorization: `Bearer ${token}` } });
                      if (res.ok) load();
                    }}>Desativar</Button>
                  ) : (
                    <Button size="small" color="success" onClick={async () => {
                      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token");
                      const res = await fetch(`/api/profissionais/${p.id}/reactivate`, { method: "POST", headers: { authorization: `Bearer ${token}` } });
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
        <DialogTitle>Editar profissional</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <TextField label="Nome" value={editForm.nome} onChange={(e) => setEditForm((f) => ({ ...f, nome: e.target.value }))} />
            <TextField label="Setor" value={editForm.setor} onChange={(e) => setEditForm((f) => ({ ...f, setor: e.target.value }))} />
          </div>
          <TextField label="Especialidade" value={editForm.especialidade} onChange={(e) => setEditForm((f) => ({ ...f, especialidade: e.target.value }))} sx={{ mt: 2 }} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancelar</Button>
          <Button variant="contained" onClick={async () => {
            if (!editing) return;
            const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token");
            const res = await fetch(`/api/profissionais/${editing.id}`, {
              method: "PUT",
              headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
              body: JSON.stringify(editForm),
            });
            if (res.ok) { setEditing(null); load(); }
          }}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}


