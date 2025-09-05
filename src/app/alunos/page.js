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

export default function AlunosListPage() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ nome: "", turma: "", turno: "" });
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    nome: "",
    idade: "",
    turma: "",
    turno: "",
    cidade: "",
    escola_regular: "",
    serie: "",
    responsavel_nome: "",
    responsavel_telefone: "",
    observacoes: "",
  });
  const [viewing, setViewing] = useState(null);

  async function load() {
    try {
      setError("");
      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token");
      const qs = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "")));
      const res = await fetch(`/api/alunos?${qs.toString()}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.error || "Falha ao carregar alunos");
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
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Alunos</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <TextField label="Nome" value={filters.nome} onChange={(e) => setFilters((f) => ({ ...f, nome: e.target.value }))} />
        <TextField label="Turma" value={filters.turma} onChange={(e) => setFilters((f) => ({ ...f, turma: e.target.value }))} />
        <TextField select label="Turno" value={filters.turno} onChange={(e) => setFilters((f) => ({ ...f, turno: e.target.value }))} sx={{ minWidth: 160 }}>
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="manhã">Manhã</MenuItem>
          <MenuItem value="tarde">Tarde</MenuItem>
          <MenuItem value="noite">Noite</MenuItem>
        </TextField>
        <CustomButton onClick={load} color="primary">Filtrar</CustomButton>
        <Link href="/alunos/create"><CustomButton color="secondary">Novo Aluno</CustomButton></Link>
      </div>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nome</TableCell>
            <TableCell>Idade</TableCell>
            <TableCell>Turma</TableCell>
            <TableCell>Turno</TableCell>
            <TableCell>Cidade</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((a) => (
            <TableRow key={a.id} hover onClick={() => setViewing(a)} style={{ cursor: "pointer" }}>
              <TableCell>{a.id}</TableCell>
              <TableCell>{a.nome}</TableCell>
              <TableCell>{a.idade ?? '-'}</TableCell>
              <TableCell>{a.turma ?? '-'}</TableCell>
              <TableCell>{a.turno ?? '-'}</TableCell>
              <TableCell>{a.cidade ?? '-'}</TableCell>
              <TableCell>{a.status ? "Ativo" : "Inativo"}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={(e) => {
                    e.stopPropagation();
                    setEditing(a);
                    setEditForm({
                      nome: a.nome || "",
                      idade: a.idade ?? "",
                      turma: a.turma || "",
                      turno: a.turno || "",
                      cidade: a.cidade || "",
                      escola_regular: a.escola_regular || "",
                      serie: a.serie || "",
                      responsavel_nome: a.responsavel_nome || "",
                      responsavel_telefone: a.responsavel_telefone || "",
                      observacoes: a.observacoes || "",
                    });
                  }}>Editar</Button>
                  {a.status ? (
                    <Button size="small" color="warning" onClick={async (e) => {
                      e.stopPropagation();
                      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token");
                      const res = await fetch(`/api/alunos/${a.id}`, { method: "DELETE", headers: { authorization: `Bearer ${token}` } });
                      if (res.ok) load();
                    }}>Desativar</Button>
                  ) : (
                    <Button size="small" color="success" onClick={async (e) => {
                      e.stopPropagation();
                      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token");
                      const res = await fetch(`/api/alunos/${a.id}/reactivate`, { method: "POST", headers: { authorization: `Bearer ${token}` } });
                      if (res.ok) load();
                    }}>Reativar</Button>
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} fullWidth maxWidth="md">
        <DialogTitle>Editar aluno</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 160px 160px", gap: 12 }}>
            <TextField label="Nome" value={editForm.nome} onChange={(e) => setEditForm((f) => ({ ...f, nome: e.target.value }))} />
            <TextField type="number" label="Idade" value={editForm.idade} onChange={(e) => setEditForm((f) => ({ ...f, idade: e.target.value }))} />
            <TextField label="Turma" value={editForm.turma} onChange={(e) => setEditForm((f) => ({ ...f, turma: e.target.value }))} />
            <TextField select label="Turno" value={editForm.turno} onChange={(e) => setEditForm((f) => ({ ...f, turno: e.target.value }))}>
              <MenuItem value="manhã">Manhã</MenuItem>
              <MenuItem value="tarde">Tarde</MenuItem>
              <MenuItem value="noite">Noite</MenuItem>
            </TextField>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 12 }}>
            <TextField label="Cidade" value={editForm.cidade} onChange={(e) => setEditForm((f) => ({ ...f, cidade: e.target.value }))} />
            <TextField label="Escola regular" value={editForm.escola_regular} onChange={(e) => setEditForm((f) => ({ ...f, escola_regular: e.target.value }))} />
            <TextField label="Série" value={editForm.serie} onChange={(e) => setEditForm((f) => ({ ...f, serie: e.target.value }))} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            <TextField label="Responsável" value={editForm.responsavel_nome} onChange={(e) => setEditForm((f) => ({ ...f, responsavel_nome: e.target.value }))} />
            <TextField label="Telefone do responsável" value={editForm.responsavel_telefone} onChange={(e) => setEditForm((f) => ({ ...f, responsavel_telefone: e.target.value }))} />
          </div>
          <TextField label="Observações" value={editForm.observacoes} onChange={(e) => setEditForm((f) => ({ ...f, observacoes: e.target.value }))} multiline minRows={3} sx={{ mt: 2 }} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancelar</Button>
          <Button variant="contained" onClick={async () => {
            if (!editing) return;
            const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem("token")) || localStorage.getItem("token");
            const body = {
              ...editForm,
              idade: editForm.idade ? Number(editForm.idade) : null,
            };
            const res = await fetch(`/api/alunos/${editing.id}`, {
              method: "PUT",
              headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
              body: JSON.stringify(body),
            });
            if (res.ok) {
              setEditing(null);
              load();
            }
          }}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(viewing)} onClose={() => setViewing(null)} fullWidth maxWidth="sm">
        <DialogTitle>Detalhes do aluno</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {viewing ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <TextField label="Nome" value={viewing.nome || "-"} InputProps={{ readOnly: true }} />
              <TextField label="Idade" value={viewing.idade ?? "-"} InputProps={{ readOnly: true }} />
              <TextField label="Turma" value={viewing.turma || "-"} InputProps={{ readOnly: true }} />
              <TextField label="Turno" value={viewing.turno || "-"} InputProps={{ readOnly: true }} />
              <TextField label="Cidade" value={viewing.cidade || "-"} InputProps={{ readOnly: true }} />
              <TextField label="Escola regular" value={viewing.escola_regular || "-"} InputProps={{ readOnly: true }} />
              <TextField label="Série" value={viewing.serie || "-"} InputProps={{ readOnly: true }} />
              <TextField label="Status" value={viewing.status ? "Ativo" : "Inativo"} InputProps={{ readOnly: true }} />
              <TextField label="Responsável" value={viewing.responsavel_nome || "-"} InputProps={{ readOnly: true }} />
              <TextField label="Telefone Resp." value={viewing.responsavel_telefone || "-"} InputProps={{ readOnly: true }} />
              <TextField label="Observações" value={viewing.observacoes || "-"} InputProps={{ readOnly: true }} multiline minRows={3} sx={{ gridColumn: '1 / -1' }} />
            </div>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewing(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}


