"use client";

import { useCallback, useEffect, useState } from "react";
import NextLink from "next/link";
import AppShell from "@/components/AppShell";
import CustomButton from "@/components/CustomButton";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import LinearProgress from "@mui/material/LinearProgress";
export default function UsuariosListPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [total, setTotal] = useState(0);
  const [editing, setEditing] = useState(null);
  const [editNome, setEditNome] = useState("");
  const [editPerfil, setEditPerfil] = useState("profissional");
  const [editStatus, setEditStatus] = useState(true);
  const [passwordDialog, setPasswordDialog] = useState({ open: false, user: null, novaSenha: "", exigirTroca: true, error: "" });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const token = getStoredToken();
      const qs = buildQueryString(filters, { offset: page * rowsPerPage, limit: rowsPerPage });
      const res = await fetch(`/api/usuarios?${qs}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.error || "Falha ao carregar usuários");
        setData([]);
        setTotal(0);
        return;
      }
      setData(json.data || []);
      setTotal(json.total ?? 0);
    } catch (e) {
      setError("Erro inesperado ao carregar usuários.");
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page, rowsPerPage]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (total === 0) {
      if (page !== 0) setPage(0);
      return;
    }
    const maxPage = Math.max(0, Math.ceil(total / rowsPerPage) - 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [total, rowsPerPage, page]);

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({ ...prev, [field]: event.target.value }));
    setPage(0);
  };

  const openEditDialog = (usuario) => {
    setEditing(usuario);
    setEditNome(usuario.nome || "");
    setEditPerfil(usuario.perfil || "profissional");
    setEditStatus(Boolean(usuario.status));
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    try {
      const token = getStoredToken();
      const res = await fetch(`/api/usuarios/${editing.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ nome: editNome, perfil: editPerfil, status: editStatus }),
      });
      if (!res.ok) {
        setError("Falha ao salvar o usuário. Verifique os dados e tente novamente.");
        return;
      }
      setEditing(null);
      load();
    } catch {
      setError("Erro inesperado ao salvar usuário.");
    }
  };

  const handleToggleStatus = async (usuario, action) => {
    try {
      const token = getStoredToken();
      const endpoint = action === "deactivate" ? `/api/usuarios/${usuario.id}` : `/api/usuarios/${usuario.id}/reactivate`;
      const res = await fetch(endpoint, {
        method: action === "deactivate" ? "DELETE" : "POST",
        headers: { authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setError("Não foi possível atualizar o status do usuário.");
        return;
      }
      load();
    } catch {
      setError("Erro inesperado ao atualizar status.");
    }
  };

  const handleOpenPasswordDialog = (usuario) => {
    setPasswordDialog({ open: true, user: usuario, novaSenha: "", exigirTroca: true, error: "" });
  };

  const handleSavePassword = async () => {
    if (!passwordDialog.user) return;
    if (!passwordDialog.novaSenha || passwordDialog.novaSenha.length < 6) {
      setPasswordDialog((prev) => ({ ...prev, error: "A nova senha deve ter ao menos 6 caracteres." }));
      return;
    }
    try {
      const token = getStoredToken();
      const res = await fetch(`/api/usuarios/${passwordDialog.user.id}/password`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ novaSenha: passwordDialog.novaSenha, exigirTroca: passwordDialog.exigirTroca }),
      });
      if (!res.ok) {
        setPasswordDialog((prev) => ({ ...prev, error: "Falha ao alterar a senha. Tente novamente." }));
        return;
      }
      setPasswordDialog({ open: false, user: null, novaSenha: "", exigirTroca: true, error: "" });
    } catch {
      setPasswordDialog((prev) => ({ ...prev, error: "Erro inesperado ao alterar a senha." }));
    }
  };

  return (
    <AppShell>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Usuários
            </Typography>
            <CustomButton
              component={NextLink}
              href="/usuarios/create"
              variant="contained"
              color="primary"
              size="large"
            >
              Novo usuário
            </CustomButton>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Administre perfis de acesso, controle senhas e garanta que a equipe esteja alinhada às permissões corretas.
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" variant="outlined">
            {error}
          </Alert>
        )}

        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 4 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Filtros
            </Typography>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "flex-end" }}>
              <TextField
                label="Nome"
                value={filters.nome}
                onChange={handleFilterChange("nome")}
                fullWidth
              />
              <TextField
                select
                label="Perfil"
                value={filters.perfil}
                onChange={handleFilterChange("perfil")}
                sx={{ minWidth: { xs: "100%", md: 180 } }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="gestor">Gestor</MenuItem>
                <MenuItem value="profissional">Profissional</MenuItem>
                <MenuItem value="secretaria">Secretaria</MenuItem>
              </TextField>
              <TextField
                select
                label="Status"
                value={filters.status}
                onChange={handleFilterChange("status")}
                sx={{ minWidth: { xs: "100%", md: 180 } }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Ativos</MenuItem>
                <MenuItem value="false">Inativos</MenuItem>
              </TextField>
              <Stack direction="row" spacing={1}>
                <CustomButton variant="contained" onClick={load}>
                  Aplicar
                </CustomButton>
                <CustomButton
                  variant="outlined"
                  color="inherit"
                  onClick={() => {
                    setFilters(initialFilters);
                    setPage(0);
                  }}
                >
                  Limpar
                </CustomButton>
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ borderRadius: 4, overflow: "hidden" }}>
          {loading ? <LinearProgress /> : null}
          <TableContainer>
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
                {data.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Stack spacing={1} alignItems="center" sx={{ py: 6 }}>
                        <Typography variant="subtitle1">Nenhum usuário encontrado</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Ajuste os filtros ou cadastre um novo usuário.
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : null}
                {data.map((usuario) => (
                  <TableRow key={usuario.id} hover>
                    <TableCell>{usuario.id}</TableCell>
                    <TableCell>{usuario.nome}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>{usuario.perfil}</TableCell>
                    <TableCell>
                      <Chip
                        label={usuario.status ? "Ativo" : "Inativo"}
                        color={usuario.status ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1}>
                        <Button size="small" onClick={() => openEditDialog(usuario)}>
                          Editar
                        </Button>
                        {usuario.status ? (
                          <Button
                            size="small"
                            color="warning"
                            onClick={() => handleToggleStatus(usuario, "deactivate")}
                          >
                            Desativar
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            color="success"
                            onClick={() => handleToggleStatus(usuario, "activate")}
                          >
                            Reativar
                          </Button>
                        )}
                        <Button size="small" onClick={() => handleOpenPasswordDialog(usuario)}>
                          Alterar senha
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Itens por página"
            rowsPerPageOptions={[5, 10, 20, 50]}
            sx={{ px: 2 }}
          />
        </Paper>
      </Stack>

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} fullWidth maxWidth="sm">
        <DialogTitle>Editar usuário</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Nome"
              value={editNome}
              onChange={(e) => setEditNome(e.target.value)}
              fullWidth
            />
            <TextField
              select
              label="Perfil"
              value={editPerfil}
              onChange={(e) => setEditPerfil(e.target.value)}
              fullWidth
            >
              <MenuItem value="gestor">Gestor</MenuItem>
              <MenuItem value="profissional">Profissional</MenuItem>
              <MenuItem value="secretaria">Secretaria</MenuItem>
            </TextField>
            <FormControlLabel
              control={<Switch checked={editStatus} onChange={(e) => setEditStatus(e.target.checked)} />}
              label={editStatus ? "Ativo" : "Inativo"}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Salvar alterações
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={passwordDialog.open} onClose={() => setPasswordDialog({ open: false, user: null, novaSenha: "", exigirTroca: true, error: "" })} fullWidth maxWidth="sm">
        <DialogTitle>Alterar senha de {passwordDialog.user?.nome}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              type="password"
              label="Nova senha"
              value={passwordDialog.novaSenha}
              onChange={(e) => setPasswordDialog((prev) => ({ ...prev, novaSenha: e.target.value }))}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={passwordDialog.exigirTroca}
                  onChange={(e) => setPasswordDialog((prev) => ({ ...prev, exigirTroca: e.target.checked }))}
                />
              }
              label="Exigir troca no próximo acesso"
            />
            {passwordDialog.error ? (
              <Alert severity="error" variant="outlined">
                {passwordDialog.error}
              </Alert>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog({ open: false, user: null, novaSenha: "", exigirTroca: true, error: "" })}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSavePassword}>
            Salvar senha
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}


const initialFilters = { nome: "", perfil: "", status: "" };
const DEFAULT_ROWS_PER_PAGE = 10;

function getStoredToken() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("token") || localStorage.getItem("token") || "";
}

function buildQueryString(filters, pagination) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== null && typeof value !== "undefined") {
      params.append(key, value);
    }
  });
  params.append("offset", String(pagination.offset ?? 0));
  params.append("limit", String(pagination.limit ?? DEFAULT_ROWS_PER_PAGE));
  return params.toString();
}

