"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import CustomButton from "@/components/CustomButton";
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

const INITIAL_FILTERS = { setor: "todos" };
const PAGE_SIZE = 8;

function getToken() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("token") || localStorage.getItem("token") || "";
}

function getSetorLabel(value) {
  const labels = {
    todos: "Todos os setores",
    gestao: "Gestão",
    pedagogico: "Pedagógico",
    saude: "Saúde",
    secretaria: "Secretaria",
  };
  return labels[value] || value;
}

export default function MuralPage() {
  const [avisos, setAvisos] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedAviso, setSelectedAviso] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAviso, setEditingAviso] = useState(null);
  const [formData, setFormData] = useState({ conteudo: "", setor_destino: "todos" });

  const token = useMemo(() => getToken(), []);

  const loadAvisos = useCallback(async () => {
    if (!token) {
      setAvisos([]);
      setTotalItems(0);
      return;
    }
    try {
      setListLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (filters.setor && filters.setor !== "todos") {
        params.append("setor", filters.setor);
      }
      params.append("pagina", String(page + 1));
      params.append("limite", String(PAGE_SIZE));

      const res = await fetch(`/api/mural?${params}`, {
        headers: { authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Falha ao carregar avisos");
      }

      setAvisos(data.avisos || []);
      setTotalItems(data.total || data.avisos?.length || 0);
      setTotalPages(Math.max(1, data.totalPaginas || 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao carregar avisos");
      setAvisos([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setListLoading(false);
    }
  }, [filters.setor, page, token]);

  useEffect(() => {
    loadAvisos();
  }, [loadAvisos]);

  useEffect(() => {
    if (page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const handleFilterChange = (event) => {
    setFilters({ setor: event.target.value });
    setPage(0);
  };

  const handleOpenModal = () => {
    setEditingAviso(null);
    setFormData({ conteudo: "", setor_destino: "todos" });
    setModalOpen(true);
  };

  const handleEditAviso = (aviso) => {
    setEditingAviso(aviso);
    setFormData({ conteudo: aviso.conteudo || "", setor_destino: aviso.setor_destino || "todos" });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingAviso(null);
    setFormData({ conteudo: "", setor_destino: "todos" });
  };

  const handleSubmitAviso = async () => {
    if (!formData.conteudo.trim()) {
      setError("Conteúdo do aviso é obrigatório.");
      return;
    }
    try {
      setSubmitLoading(true);
      setError("");
      setSuccess("");

      const endpoint = editingAviso ? `/api/mural/${editingAviso.id}` : "/api/mural";
      const method = editingAviso ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Erro ao salvar aviso");
      }

      setSuccess(editingAviso ? "Aviso atualizado com sucesso!" : "Aviso publicado com sucesso!");
      handleCloseModal();
      loadAvisos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao salvar aviso");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteAviso = async (aviso) => {
    if (!aviso) return;
    try {
      setSubmitLoading(true);
      setError("");
      setSuccess("");
      const res = await fetch(`/api/mural/${aviso.id}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Erro ao excluir aviso");
      }
      setSuccess("Aviso excluído com sucesso!");
      loadAvisos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao excluir aviso");
    } finally {
      setSubmitLoading(false);
      setMenuAnchor(null);
      setSelectedAviso(null);
    }
  };

  const handleOpenMenu = (event, aviso) => {
    setMenuAnchor(event.currentTarget);
    setSelectedAviso(aviso);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setSelectedAviso(null);
  };

  const handlePageChange = (_event, nextPage) => {
    setPage(nextPage - 1);
  };

  const setorOptions = useMemo(
    () => [
      { value: "todos", label: "Todos os setores" },
      { value: "gestao", label: "Gestão" },
      { value: "pedagogico", label: "Pedagógico" },
      { value: "saude", label: "Saúde" },
      { value: "secretaria", label: "Secretaria" },
    ],
    [],
  );

  return (
    <AppShell>
      <Stack spacing={3} sx={{ pb: 2 }}>
        <Stack spacing={1} direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Mural de Avisos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Compartilhe comunicados institucionais com a equipe e mantenha todos informados.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <CustomButton
              variant="outlined"
              color="inherit"
              startIcon={<RefreshIcon />}
              onClick={loadAvisos}
              disabled={listLoading}
            >
              Atualizar
            </CustomButton>
            <CustomButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenModal}
            >
              Novo aviso
            </CustomButton>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" variant="outlined" onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" variant="outlined" onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        <Paper variant="outlined" sx={{ borderRadius: 4, p: { xs: 2, md: 3 } }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <FilterIcon fontSize="small" />
              <Typography variant="subtitle2" color="text.secondary">
                Filtros
              </Typography>
            </Stack>
            <FormControl fullWidth sx={{ maxWidth: 280 }}>
              <InputLabel>Setor</InputLabel>
              <Select
                value={filters.setor}
                label="Setor"
                onChange={handleFilterChange}
              >
                {setorOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ borderRadius: 4, overflow: "hidden" }}>
          {listLoading ? <LinearProgress /> : null}
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            {listLoading && avisos.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 6 }}>
                Carregando avisos...
              </Typography>
            ) : avisos.length === 0 ? (
              <Card variant="outlined" sx={{ borderStyle: "dashed" }}>
                <CardContent sx={{ textAlign: "center", py: 6 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Nenhum aviso encontrado
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Publique o primeiro aviso para iniciar a comunicação com a equipe.
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Stack spacing={2}>
                {avisos.map((aviso) => (
                  <Card key={aviso.id} variant="outlined" sx={{ position: "relative" }}>
                    <CardContent>
                      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}>
                            {aviso.remetente?.nome?.charAt(0)?.toUpperCase() || "?"}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {aviso.remetente?.nome || "Usuário"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {format(new Date(aviso.data_publicacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={getSetorLabel(aviso.setor_destino || "todos")} size="small" variant="outlined" color="primary" />
                          <IconButton size="small" onClick={(event) => handleOpenMenu(event, aviso)}>
                            <MoreVertIcon />
                          </IconButton>
                        </Stack>
                      </Stack>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                        {aviso.conteudo}
                      </Typography>

                      {aviso.visivel_ate ? (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
                          Visível até {format(new Date(aviso.visivel_ate), "dd/MM/yyyy", { locale: ptBR })}
                        </Typography>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
          {totalPages > 1 ? (
            <Box sx={{ display: "flex", justifyContent: "center", pb: 3 }}>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={handlePageChange}
                color="primary"
                size="small"
              />
            </Box>
          ) : null}
        </Paper>
      </Stack>

      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>{editingAviso ? "Editar aviso" : "Novo aviso"}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Setor de destino</InputLabel>
              <Select
                value={formData.setor_destino}
                label="Setor de destino"
                onChange={(event) => setFormData((prev) => ({ ...prev, setor_destino: event.target.value }))}
              >
                {setorOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Conteúdo do aviso"
              multiline
              minRows={5}
              helperText={`${formData.conteudo.length}/2000 caracteres`}
              value={formData.conteudo}
              onChange={(event) => setFormData((prev) => ({ ...prev, conteudo: event.target.value }))}
              inputProps={{ maxLength: 2000 }}
              placeholder="Descreva o comunicado que deseja compartilhar..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <CustomButton variant="outlined" color="inherit" onClick={handleCloseModal}>
            Cancelar
          </CustomButton>
          <CustomButton
            variant="contained"
            onClick={handleSubmitAviso}
            disabled={submitLoading || !formData.conteudo.trim()}
          >
            {submitLoading ? "Salvando..." : editingAviso ? "Atualizar" : "Publicar"}
          </CustomButton>
        </DialogActions>
      </Dialog>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenu}>
        <MenuItem
          onClick={() => {
            if (selectedAviso) {
              handleEditAviso(selectedAviso);
            }
            handleCloseMenu();
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem
          onClick={() => handleDeleteAviso(selectedAviso)}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Excluir
        </MenuItem>
      </Menu>
    </AppShell>
  );
}
