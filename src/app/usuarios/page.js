"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import CustomButton from "@/components/CustomButton";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Alert from "@mui/material/Alert";
import Link from "next/link";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

export default function UsuariosListPage() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ nome: "", perfil: "", status: "" });
  const [editing, setEditing] = useState(null);
  const [editNome, setEditNome] = useState("");
  const [editPerfil, setEditPerfil] = useState("");
  const [editStatus, setEditStatus] = useState(true);

  async function load() {
    try {
      setError("");
      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token");
      const qs = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "")));
      const res = await fetch(`/api/usuarios?${qs.toString()}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.error || "Falha ao carregar usuários");
        return;
      }
      setData(json.data || []);
    } catch (e) {
      setError("Erro inesperado");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppShell>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Usuários</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <TextField label="Nome" value={filters.nome} onChange={(e) => setFilters((f) => ({ ...f, nome: e.target.value }))} />
        <TextField select label="Perfil" value={filters.perfil} onChange={(e) => setFilters((f) => ({ ...f, perfil: e.target.value }))} sx={{ minWidth: 160 }}>
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="gestor">Gestor</MenuItem>
          <MenuItem value="profissional">Profissional</MenuItem>
          <MenuItem value="secretaria">Secretaria</MenuItem>
        </TextField>
        <TextField select label="Status" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} sx={{ minWidth: 160 }}>
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="true">Ativo</MenuItem>
          <MenuItem value="false">Inativo</MenuItem>
        </TextField>
        <CustomButton onClick={load} color="primary">Filtrar</CustomButton>
        <Link href="/usuarios/create"><CustomButton color="secondary">Novo Usuário</CustomButton></Link>
      </div>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nome</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Perfil</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.id}</TableCell>
              <TableCell>{u.nome}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.perfil}</TableCell>
              <TableCell>{u.status ? "Ativo" : "Inativo"}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => {
                    setEditing(u);
                    setEditNome(u.nome || "");
                    setEditPerfil(u.perfil || "profissional");
                    setEditStatus(Boolean(u.status));
                  }}>Editar</Button>
                  {u.status ? (
                    <Button size="small" color="warning" onClick={async () => {
                      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token");
                      const res = await fetch(`/api/usuarios/${u.id}`, { method: "DELETE", headers: { authorization: `Bearer ${token}` } });
                      if (res.ok) load();
                    }}>Desativar</Button>
                  ) : (
                    <Button size="small" color="success" onClick={async () => {
                      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token");
                      const res = await fetch(`/api/usuarios/${u.id}/reactivate`, { method: "POST", headers: { authorization: `Bearer ${token}` } });
                      if (res.ok) load();
                    }}>Reativar</Button>
                  )}
                  <Button size="small" onClick={async () => {
                    const novaSenha = prompt("Nova senha para o usuário?");
                    if (!novaSenha) return;
                    const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token");
                    const res = await fetch(`/api/usuarios/${u.id}/password`, {
                      method: "POST",
                      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
                      body: JSON.stringify({ novaSenha, exigirTroca: true }),
                    });
                    if (res.ok) alert("Senha alterada com sucesso.");
                  }}>Alterar senha</Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} fullWidth maxWidth="sm">
        <DialogTitle>Editar usuário</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField label="Nome" value={editNome} onChange={(e) => setEditNome(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <TextField select label="Perfil" value={editPerfil} onChange={(e) => setEditPerfil(e.target.value)} fullWidth sx={{ mb: 2 }}>
            <MenuItem value="gestor">Gestor</MenuItem>
            <MenuItem value="profissional">Profissional</MenuItem>
            <MenuItem value="secretaria">Secretaria</MenuItem>
          </TextField>
          <FormControlLabel control={<Switch checked={editStatus} onChange={(e) => setEditStatus(e.target.checked)} />} label={editStatus ? "Ativo" : "Inativo"} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancelar</Button>
          <Button variant="contained" onClick={async () => {
            if (!editing) return;
            const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token");
            const res = await fetch(`/api/usuarios/${editing.id}`, {
              method: "PUT",
              headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
              body: JSON.stringify({ nome: editNome, perfil: editPerfil, status: editStatus }),
            });
            if (res.ok) {
              setEditing(null);
              load();
            }
          }}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}


