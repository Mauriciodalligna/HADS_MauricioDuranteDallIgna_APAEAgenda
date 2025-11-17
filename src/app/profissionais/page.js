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
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

const initialFilters = { nome: "", setor: "", status: "" };
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

export default function ProfissionaisListPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [total, setTotal] = useState(0);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ nome: "", setor: "", especialidade: "", status: true });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const token = getStoredToken();
      const qs = buildQueryString(filters, { offset: page * rowsPerPage, limit: rowsPerPage });
      const res = await fetch(`/api/profissionais?${qs}`, { headers: { authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.error || "Falha ao carregar profissionais");
        setData([]);
        setTotal(0);
        return;
      }
      setData(json.data || []);
      setTotal(json.total ?? 0);
    } catch (e) {
      setError("Erro inesperado ao carregar profissionais.");
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

  const handleEdit = (profissional) => {
    setEditing(profissional);
    setEditForm({
      nome: profissional.nome || "",
      setor: profissional.setor || "",
      especialidade: profissional.especialidade || "",
      status: !!profissional.status,
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      const token = getStoredToken();
      const payload = { ...editForm, status: Boolean(editForm.status) };
      const res = await fetch(`/api/profissionais/${editing.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setError("Falha ao salvar o profissional. Verifique os dados e tente novamente.");
        return;
      }
      setEditing(null);
      load();
    } catch {
      setError("Erro inesperado ao salvar profissional.");
    }
  };

  const handleToggleStatus = async (profissional, action) => {
    try {
      const token = getStoredToken();
      const endpoint = action === "deactivate" ? `/api/profissionais/${profissional.id}` : `/api/profissionais/${profissional.id}/reactivate`;
      const res = await fetch(endpoint, {
        method: action === "deactivate" ? "DELETE" : "POST",
        headers: { authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setError("Não foi possível atualizar o status do profissional.");
        return;
      }
      load();
    } catch {
      setError("Erro inesperado ao atualizar status.");
    }
  };

  return (
    <AppShell>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Profissionais
            </Typography>
            <CustomButton
              component={NextLink}
              href="/profissionais/create"
              variant="contained"
              color="primary"
              size="large"
            >
              Novo profissional
            </CustomButton>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Gerencie a equipe multidisciplinar e acompanhe disponibilidade por setor e especialidade.
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
                label="Setor"
                value={filters.setor}
                onChange={handleFilterChange("setor")}
                fullWidth
              />
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
                  <TableCell>Setor</TableCell>
                  <TableCell>Especialidade</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Stack spacing={1} alignItems="center" sx={{ py: 6 }}>
                        <Typography variant="subtitle1">Nenhum profissional encontrado</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Ajuste os filtros ou cadastre um novo profissional.
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : null}
                {data.map((profissional) => (
                  <TableRow key={profissional.id} hover>
                    <TableCell>{profissional.id}</TableCell>
                    <TableCell>{profissional.nome}</TableCell>
                    <TableCell>{profissional.setor ?? "-"}</TableCell>
                    <TableCell>{profissional.especialidade ?? "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={profissional.status ? "Ativo" : "Inativo"}
                        color={profissional.status ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          onClick={() => handleEdit(profissional)}
                        >
                          Editar
                        </Button>
                        {profissional.status ? (
                          <Button
                            size="small"
                            color="warning"
                            onClick={() => handleToggleStatus(profissional, "deactivate")}
                          >
                            Desativar
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            color="success"
                            onClick={() => handleToggleStatus(profissional, "activate")}
                          >
                            Reativar
                          </Button>
                        )}
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
        <DialogTitle>Editar profissional</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nome"
                value={editForm.nome}
                onChange={(e) => setEditForm((prev) => ({ ...prev, nome: e.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Setor"
                value={editForm.setor}
                onChange={(e) => setEditForm((prev) => ({ ...prev, setor: e.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Especialidade"
                value={editForm.especialidade}
                onChange={(e) => setEditForm((prev) => ({ ...prev, especialidade: e.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(editForm.status)}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, status: event.target.checked }))}
                  />
                }
                label="Profissional ativo"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Salvar alterações
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}
