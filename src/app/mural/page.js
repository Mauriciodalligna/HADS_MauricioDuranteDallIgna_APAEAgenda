"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Grid,
  Avatar,
  Divider
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

export default function MuralPage() {
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Estados para modal de criação/edição
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAviso, setEditingAviso] = useState(null);
  const [formData, setFormData] = useState({
    conteudo: "",
    setor_destino: "todos"
  });
  
  // Estados para filtros e paginação
  const [filtros, setFiltros] = useState({
    setor: "todos"
  });
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    totalPaginas: 1,
    total: 0
  });
  
  // Estados para menu de ações
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAviso, setSelectedAviso] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Carregar avisos
  const carregarAvisos = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        setor: filtros.setor,
        pagina: paginacao.pagina,
        limite: 10
      });

      const res = await fetch(`/api/mural?${params}`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || "Erro ao carregar avisos");
      }

      const data = await res.json();
      setAvisos(data.avisos);
      setPaginacao(prev => ({
        ...prev,
        totalPaginas: data.totalPaginas,
        total: data.total
      }));

    } catch (error) {
      console.error("Erro ao carregar avisos:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Criar/editar aviso
  const salvarAviso = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (!formData.conteudo.trim()) {
        setError("Conteúdo do aviso é obrigatório");
        return;
      }

      const url = editingAviso ? `/api/mural/${editingAviso.id}` : "/api/mural";
      const method = editingAviso ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || "Erro ao salvar aviso");
      }

      setSuccess(editingAviso ? "Aviso atualizado com sucesso!" : "Aviso publicado com sucesso!");
      setModalOpen(false);
      setEditingAviso(null);
      setFormData({ conteudo: "", setor_destino: "todos" });
      carregarAvisos();

    } catch (error) {
      console.error("Erro ao salvar aviso:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Excluir aviso
  const excluirAviso = async (id) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await fetch(`/api/mural/${id}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || "Erro ao excluir aviso");
      }

      setSuccess("Aviso excluído com sucesso!");
      carregarAvisos();

    } catch (error) {
      console.error("Erro ao excluir aviso:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de edição
  const abrirEdicao = (aviso) => {
    setEditingAviso(aviso);
    setFormData({
      conteudo: aviso.conteudo,
      setor_destino: aviso.setor_destino
    });
    setModalOpen(true);
  };

  // Fechar modal
  const fecharModal = () => {
    setModalOpen(false);
    setEditingAviso(null);
    setFormData({ conteudo: "", setor_destino: "todos" });
  };

  // Abrir menu de ações
  const abrirMenuAcoes = (event, aviso) => {
    setAnchorEl(event.currentTarget);
    setSelectedAviso(aviso);
  };

  // Fechar menu de ações
  const fecharMenuAcoes = () => {
    setAnchorEl(null);
    setSelectedAviso(null);
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    setPaginacao(prev => ({ ...prev, pagina: 1 }));
    carregarAvisos();
  };

  // Mudar página
  const mudarPagina = (event, novaPagina) => {
    setPaginacao(prev => ({ ...prev, pagina: novaPagina }));
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (token) {
      carregarAvisos();
    }
  }, [token, paginacao.pagina]);

  // Recarregar quando filtros mudarem
  useEffect(() => {
    if (token) {
      carregarAvisos();
    }
  }, [filtros]);

  return (
    <AppShell>
      <Box sx={{ p: 3 }}>
        {/* Cabeçalho */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" component="h1" color="primary">
            📢 Mural de Avisos
          </Typography>
          
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={aplicarFiltros}
            >
              Aplicar Filtros
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={carregarAvisos}
              disabled={loading}
            >
              Atualizar
            </Button>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setModalOpen(true)}
            >
              Novo Aviso
            </Button>
          </Box>
        </Box>

        {/* Alertas */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        {/* Filtros */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔍 Filtros
            </Typography>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Setor</InputLabel>
                  <Select
                    value={filtros.setor}
                    onChange={(e) => setFiltros(prev => ({ ...prev, setor: e.target.value }))}
                    label="Setor"
                  >
                    <MenuItem value="todos">Todos os Setores</MenuItem>
                    <MenuItem value="gestao">Gestão</MenuItem>
                    <MenuItem value="pedagogico">Pedagógico</MenuItem>
                    <MenuItem value="saude">Saúde</MenuItem>
                    <MenuItem value="secretaria">Secretaria</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Lista de Avisos */}
        {loading ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography>Carregando avisos...</Typography>
          </Box>
        ) : avisos.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Nenhum aviso encontrado
              </Typography>
              <Typography color="text.secondary">
                Publique o primeiro aviso para começar a comunicação interna.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {avisos.map((aviso) => (
              <Card key={aviso.id} sx={{ position: "relative" }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        {aviso.remetente?.nome?.charAt(0) || "?"}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="div">
                          {aviso.remetente?.nome || "Usuário"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(aviso.data_publicacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip 
                        label={aviso.setor_destino === "todos" ? "Todos" : aviso.setor_destino}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      
                      <IconButton
                        onClick={(e) => abrirMenuAcoes(e, aviso)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {aviso.conteudo}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
                    Visível até: {format(new Date(aviso.visivel_ate), "dd/MM/yyyy", { locale: ptBR })}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Paginação */}
        {paginacao.totalPaginas > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={paginacao.totalPaginas}
              page={paginacao.pagina}
              onChange={mudarPagina}
              color="primary"
            />
          </Box>
        )}

        {/* Modal de Criação/Edição */}
        <Dialog open={modalOpen} onClose={fecharModal} fullWidth maxWidth="md">
          <DialogTitle>
            {editingAviso ? "Editar Aviso" : "Novo Aviso"}
          </DialogTitle>
          
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Setor de Destino</InputLabel>
                <Select
                  value={formData.setor_destino}
                  onChange={(e) => setFormData(prev => ({ ...prev, setor_destino: e.target.value }))}
                  label="Setor de Destino"
                >
                  <MenuItem value="todos">Todos os Setores</MenuItem>
                  <MenuItem value="gestao">Gestão</MenuItem>
                  <MenuItem value="pedagogico">Pedagógico</MenuItem>
                  <MenuItem value="saude">Saúde</MenuItem>
                  <MenuItem value="secretaria">Secretaria</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Conteúdo do Aviso"
                multiline
                rows={6}
                value={formData.conteudo}
                onChange={(e) => setFormData(prev => ({ ...prev, conteudo: e.target.value }))}
                placeholder="Digite o conteúdo do aviso..."
                helperText={`${formData.conteudo.length}/2000 caracteres`}
                inputProps={{ maxLength: 2000 }}
                fullWidth
              />
            </Box>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={fecharModal}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={salvarAviso}
              disabled={loading || !formData.conteudo.trim()}
            >
              {loading ? "Salvando..." : editingAviso ? "Atualizar" : "Publicar"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Menu de Ações */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={fecharMenuAcoes}
        >
          <MenuItem onClick={() => {
            abrirEdicao(selectedAviso);
            fecharMenuAcoes();
          }}>
            <EditIcon sx={{ mr: 1 }} />
            Editar
          </MenuItem>
          <MenuItem 
            onClick={() => {
              excluirAviso(selectedAviso?.id);
              fecharMenuAcoes();
            }}
            sx={{ color: "error.main" }}
          >
            <DeleteIcon sx={{ mr: 1 }} />
            Excluir
          </MenuItem>
        </Menu>
      </Box>
    </AppShell>
  );
}
