"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import CustomButton from "@/components/CustomButton";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Chip from "@mui/material/Chip";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Autocomplete from "@mui/material/Autocomplete";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TodayIcon from "@mui/icons-material/Today";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import ViewDayIcon from "@mui/icons-material/ViewDay";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import DownloadIcon from "@mui/icons-material/Download";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addDays, endOfWeek } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "pt-BR": ptBR };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const INITIAL_FILTERS = {
  profissional_nome: "",
  aluno_id: "",
  status: "confirmado",
};

export default function AgendamentosPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  
  // Estados para controle do calendário
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("week");
  
  // Estado para semana selecionada para exportação
  const [selectedWeekForExport, setSelectedWeekForExport] = useState(() => {
    // Inicializar com a segunda-feira da semana atual
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    return monday.toISOString().split('T')[0];
  });
  
  // Estado para próximos agendamentos
  const [proximosAgendamentos, setProximosAgendamentos] = useState([]);

  // Modal de criação rápida
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({
    aluno_ids: [],
    profissional_nome: "",
    atividade: { id: null, nome: "", duracao_padrao: 60, cor: "#1976d2", tipo: "Geral" },
    data: "",
    hora_inicio: "",
    recorrente: false,
    recorrencia_fim: "",
    observacoes: ""
  });

  // Modal de detalhes/edição
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Modal de edição
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  
  // Modal de cancelamento
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelForm, setCancelForm] = useState({ motivo: "", tipo: "only" });
  
  // Modal de exportação PDF
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    incluirObservacoes: true,
    incluirDetalhesAlunos: true,
    incluirContatos: true,
    agruparPorProfissional: false,
    incluirEstatisticas: true,
    formato: "semanal" // semanal, mensal, personalizado
  });

  const token = useMemo(() => {
    const sessionToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem("token") : null;
    const localToken = typeof localStorage !== 'undefined' ? localStorage.getItem("token") : null;
    return sessionToken || localToken || "test-token";
  }, []);

  function toDate(dateStr, timeStr) {
    const [y, m, d] = String(dateStr).split("-").map(Number);
    const [hh, mm] = String(timeStr).split(":").map(Number);
    return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0);
  }

  function formatDateInput(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function formatWeekPeriod(weekStart) {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return `${start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a ${end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
  }

  const loadOptions = useCallback(async () => {
    try {
      setError("");
      const [rp, ra, rt] = await Promise.all([
        fetch(`/api/profissionais?status=true&limit=200`, { headers: { authorization: `Bearer ${token}` } }),
        fetch(`/api/alunos?status=true&limit=200`, { headers: { authorization: `Bearer ${token}` } }),
        fetch(`/api/atividades?status=true&limit=200`, { headers: { authorization: `Bearer ${token}` } }),
      ]);
      const [jp, ja, jt] = await Promise.all([rp.json(), ra.json(), rt.json()]);
      if (!jp.ok || !ja.ok || !jt.ok) { 
        setError("Falha ao carregar filtros"); 
        return; 
      }
      setProfissionais(jp.data || []);
      setAlunos(ja.data || []);
      setAtividades(jt.data || []);
    } catch { 
      setError("Erro ao carregar filtros"); 
    }
  }, [token]);

  const loadAgendamentos = useCallback(async () => {
    try {
      setError("");
      const qs = new URLSearchParams();
      if (filters.profissional_nome) qs.append("profissional_nome", filters.profissional_nome);
      if (filters.aluno_id) qs.append("aluno_id", String(filters.aluno_id));
      if (filters.status) qs.append("status", filters.status);
      qs.append("limit", "500");
      const res = await fetch(`/api/agendamentos?${qs.toString()}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const j = await res.json();
      if (!res.ok || !j.ok) {
        setError(j?.error || "Falha ao carregar agenda");
        return;
      }
      const evs = (j.data || []).map((ag) => ({
        id: ag.id,
        title: `${ag.atividade?.nome || "Atividade"} - ${ag.alunos?.map((a) => a.nome).join(", ") || "Sem alunos"}`,
        start: toDate(ag.data, ag.hora_inicio),
        end: toDate(ag.data, ag.hora_fim),
        resource: ag,
        style: {
          backgroundColor: getCorPorTipo(ag.atividade?.tipo) || ag.atividade?.cor || "#1976d2",
          color: "white",
          border: "none",
          borderRadius: "4px",
        },
      }));
      setEvents(evs);
    } catch {
      setError("Erro ao carregar agenda");
    }
  }, [filters.aluno_id, filters.profissional_nome, filters.status, token]);

  function handleSelectSlot({ start, end }) {
    const data = formatDateInput(start);
    const hora_inicio = format(start, "HH:mm");
    
    setSelectedSlot({ start, end });
    setForm(prev => ({
      ...prev,
      data,
      hora_inicio,
      profissional_nome: filters.profissional_nome || "",
      atividade: { id: null, nome: "", duracao_padrao: 60, cor: "#1976d2", tipo: "Geral" }
    }));
    setModalOpen(true);
  }

  function handleSelectEvent(event) {
    setSelectedEvent(event.resource);
    setDetailModalOpen(true);
    
    // Carregar próximos agendamentos dos alunos
    if (event.resource && event.resource.alunos) {
      loadProximosAgendamentos(event.resource.alunos);
    }
  }

  // Funções de navegação do calendário
  function handleNavigate(action) {
    const newDate = new Date(currentDate);
    
    switch (action) {
      case 'PREV':
        if (currentView === 'day') {
          newDate.setDate(newDate.getDate() - 1);
        } else if (currentView === 'week') {
          newDate.setDate(newDate.getDate() - 7);
        } else if (currentView === 'month') {
          newDate.setMonth(newDate.getMonth() - 1);
        }
        break;
      case 'NEXT':
        if (currentView === 'day') {
          newDate.setDate(newDate.getDate() + 1);
        } else if (currentView === 'week') {
          newDate.setDate(newDate.getDate() + 7);
        } else if (currentView === 'month') {
          newDate.setMonth(newDate.getMonth() + 1);
        }
        break;
      case 'TODAY':
        newDate.setTime(new Date().getTime());
        break;
    }
    
    setCurrentDate(newDate);
  }

  function handleViewChange(view) {
    setCurrentView(view);
  }

  // Função para obter cor baseada no tipo de atividade
  function getCorPorTipo(tipo) {
    const coresPorTipo = {
      'Fisioterapia': '#FF5722',      // Laranja
      'Fonoaudiologia': '#2196F3',    // Azul
      'Psicologia': '#4CAF50',        // Verde
      'Terapia Ocupacional': '#FFC107', // Amarelo
      'Nutrição': '#9C27B0',          // Roxo
      'Psicomotricidade': '#FF9800',  // Laranja escuro
      'Musicoterapia': '#E91E63',     // Rosa
      'Equoterapia': '#795548',       // Marrom
      'Geral': '#607D8B'              // Azul acinzentado
    };
    
    return coresPorTipo[tipo] || '#1976d2'; // Azul padrão
  }

  function getToolbarLabel(date, view) {
    if (view === "month") {
      return format(date, "MMMM yyyy", { locale: ptBR });
    }
    if (view === "week") {
      const start = startOfWeek(date, { weekStartsOn: 1 });
      const end = endOfWeek(date, { weekStartsOn: 1 });
      return `${format(start, "dd/MM", { locale: ptBR })} - ${format(end, "dd/MM/yyyy", { locale: ptBR })}`;
    }
    return format(date, "dd 'de' MMMM yyyy", { locale: ptBR });
  }

  const CalendarToolbar = ({ date, view, onNavigate, onView }) => {
    const label = getToolbarLabel(date, view);

    const handleViewChange = (_event, nextView) => {
      if (nextView) {
        onView(nextView);
      }
    };

    return (
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        sx={{
          px: { xs: 1.5, md: 2 },
          py: 1.5,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: (theme) => theme.palette.background.paper,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton aria-label="Voltar período" onClick={() => onNavigate("PREV")} size="small">
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton aria-label="Avançar período" onClick={() => onNavigate("NEXT")} size="small">
            <ChevronRightIcon fontSize="small" />
          </IconButton>
          <Button
            variant="outlined"
            size="small"
            startIcon={<TodayIcon />}
            onClick={() => onNavigate("TODAY")}
          >
            Hoje
          </Button>
        </Stack>

        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, textTransform: "capitalize", textAlign: "center" }}
        >
          {label}
        </Typography>

        <ToggleButtonGroup
          exclusive
          size="small"
          value={view}
          onChange={handleViewChange}
          color="primary"
        >
          <ToggleButton value="day" aria-label="Visualização diária">
            <ViewDayIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="week" aria-label="Visualização semanal">
            <ViewWeekIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="month" aria-label="Visualização mensal">
            <CalendarMonthIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    );
  };


  // Função para buscar próximos agendamentos dos alunos
  async function loadProximosAgendamentos(alunos) {
    if (!alunos || alunos.length === 0) {
      setProximosAgendamentos([]);
      return;
    }

    try {
      // Buscar agendamentos de hoje e amanhã
      const hoje = new Date();
      const amanha = new Date();
      amanha.setDate(amanha.getDate() + 1);
      const dataHoje = formatDateInput(hoje);
      const dataAmanha = formatDateInput(amanha);
      
      // Buscar agendamentos para cada aluno individualmente
      const promises = alunos.map(async (aluno) => {
        const qs = new URLSearchParams();
        qs.append('aluno_id', aluno.id);
        qs.append('status', 'confirmado');
        qs.append('data_ini', dataHoje);
        qs.append('data_fim', dataAmanha);
        qs.append('limit', '50');
        
        const res = await fetch(`/api/agendamentos?${qs.toString()}`, { 
          headers: { authorization: `Bearer ${token}` } 
        });
        const j = await res.json();
        
        return res.ok && j.ok ? (j.data || []) : [];
      });
      
      const results = await Promise.all(promises);
      
      // Combinar todos os resultados e remover duplicatas
      const allAgendamentos = results.flat();
      const uniqueAgendamentos = allAgendamentos.filter((ag, index, self) => 
        index === self.findIndex(a => a.id === ag.id)
      );
      
      // Ordenar por horário
      const proximos = uniqueAgendamentos
        .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
      
      setProximosAgendamentos(proximos);
    } catch (error) {
      console.error('Erro ao carregar próximos agendamentos:', error);
      setProximosAgendamentos([]);
    }
  }

  async function handleCreateAgendamento() {
    if (!form.aluno_ids.length || !form.profissional_nome || !form.atividade.nome) {
      setError("Selecione aluno(s), profissional e preencha os dados da atividade");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setLoading(true);
      
      const payload = {
        aluno_ids: form.aluno_ids.map(id => Number(id)),
        profissional_nome: form.profissional_nome,
        atividade: form.atividade.id ? { id: form.atividade.id } : form.atividade,
        data: form.data,
        hora_inicio: form.hora_inicio,
        recorrente: form.recorrente,
        recorrencia_fim: form.recorrente ? form.recorrencia_fim : null,
        observacoes: form.observacoes
      };

      // Log temporário para debug
      console.log("Frontend - Enviando payload:", payload);
      
      const res = await fetch(`/api/agendamentos`, {
        method: "POST",
        headers: { 
          "content-type": "application/json", 
          authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });
      
      const j = await res.json();
      
      if (!res.ok || !j.ok) { 
        setError(j?.error || "Erro ao criar agendamento"); 
        return; 
      }
      
      setSuccess("Agendamento criado com sucesso");
      setModalOpen(false);
      setForm({
        aluno_ids: [],
        profissional_nome: "",
        atividade: { id: null, nome: "", duracao_padrao: 60, cor: "#1976d2", tipo: "Geral" },
        data: "",
        hora_inicio: "",
        recorrente: false,
        recorrencia_fim: ""
      });
      await loadAgendamentos();
    } catch {
      setError("Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function handleExportPDF() {
    if (!filters.profissional_nome && !filters.aluno_id) {
      setError("Selecione um profissional ou aluno para exportar");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      const payload = {
        profissional_nome: filters.profissional_nome || null,
        aluno_id: filters.aluno_id || null,
        semana_inicio: selectedWeekForExport,
        opcoes: exportOptions
      };
      
      const res = await fetch(`/api/agendamentos/export/pdf`, {
        method: "POST",
        headers: { 
          "content-type": "application/json", 
          authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData?.error || "Erro ao exportar PDF");
        return;
      }
      
      // Verificar se a resposta é um PDF
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/pdf')) {
        // Criar blob e fazer download
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agenda-semana-${payload.semana_inicio}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setSuccess("PDF exportado com sucesso!");
        setExportModalOpen(false);
      } else {
        // Se não for PDF, tentar ler como JSON (para erros)
        const j = await res.json();
        if (!j.ok) {
          setError(j?.error || "Erro ao exportar PDF");
        } else {
          setSuccess("Dados preparados para PDF");
        }
      }
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      setError("Erro inesperado ao exportar PDF");
    } finally {
      setLoading(false);
    }
  }

  // Função para abrir modal de edição
  function handleEditAgendamento() {
    if (!selectedEvent) return;
    
    setEditForm({
      id: selectedEvent.id,
      data: selectedEvent.data,
      hora_inicio: selectedEvent.hora_inicio,
      profissional_nome: selectedEvent.profissional?.nome || "",
      atividade: selectedEvent.atividade || { id: null, nome: "", duracao_padrao: 60, cor: "#1976d2", tipo: "Geral" },
      aluno_ids: selectedEvent.alunos?.map(a => a.id) || [],
      recorrente: selectedEvent.recorrente || false,
      recorrencia_fim: selectedEvent.recorrencia_fim || "",
      observacoes: selectedEvent.observacoes || ""
    });
    
    setEditModalOpen(true);
    setDetailModalOpen(false);
  }

  // Função para salvar edição
  async function handleSaveEdit() {
    try {
      setLoading(true);
      setError("");
      
      const res = await fetch(`/api/agendamentos/${editForm.id}`, {
        method: "PUT",
        headers: { 
          "content-type": "application/json", 
          authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(editForm)
      });
      
      const j = await res.json();
      
      if (!res.ok || !j.ok) { 
        setError(j?.error || "Falha ao atualizar agendamento"); 
        return; 
      }
      
      setSuccess("Agendamento atualizado com sucesso!");
      setEditModalOpen(false);
      loadAgendamentos();
      
    } catch { 
      setError("Erro ao atualizar agendamento"); 
    } finally { 
      setLoading(false); 
    }
  }

  // Função para abrir modal de cancelamento
  function handleCancelAgendamento() {
    if (!selectedEvent) return;
    
    setCancelForm({
      id: selectedEvent.id,
      motivo: "",
      tipo: "only"
    });
    
    setCancelModalOpen(true);
    setDetailModalOpen(false);
  }

  // Função para confirmar cancelamento
  async function handleConfirmCancel() {
    if (!cancelForm.motivo.trim()) {
      setError("Motivo do cancelamento é obrigatório");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const res = await fetch(`/api/agendamentos/${cancelForm.id}`, {
        method: "DELETE",
        headers: { 
          "content-type": "application/json", 
          authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          motivo_cancelamento: cancelForm.motivo,
          scope: cancelForm.tipo
        })
      });
      
      const j = await res.json();
      
      if (!res.ok || !j.ok) { 
        setError(j?.error || "Falha ao cancelar agendamento"); 
        return; 
      }
      
      setSuccess("Agendamento cancelado com sucesso!");
      setCancelModalOpen(false);
      loadAgendamentos();
      
    } catch { 
      setError("Erro ao cancelar agendamento"); 
    } finally { 
      setLoading(false); 
    }
  }

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    loadAgendamentos();
  }, [loadAgendamentos]);

  return (
    <AppShell>
      <Stack spacing={3} sx={{ pb: 3 }}>
        <Stack spacing={1}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                Agendamentos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Coordene atendimentos, acompanhe a disponibilidade da equipe e mantenha a rotina da escola em ordem.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <CustomButton
                variant="outlined"
                color="inherit"
                startIcon={<ChevronLeftIcon />}
                onClick={() => handleNavigate("PREV")}
              >
                Semana anterior
              </CustomButton>
              <CustomButton
                variant="outlined"
                color="inherit"
                startIcon={<ChevronRightIcon />}
                onClick={() => handleNavigate("NEXT")}
              >
                Próxima semana
              </CustomButton>
              <CustomButton
                variant="outlined"
                color="inherit"
                startIcon={<RefreshIcon />}
                onClick={loadAgendamentos}
                disabled={loading}
              >
                Atualizar agenda
              </CustomButton>
              <CustomButton
                variant="outlined"
                color="inherit"
                startIcon={<DownloadIcon />}
                onClick={() => setExportModalOpen(true)}
                disabled={loading}
              >
                Exportar PDF
              </CustomButton>
              <CustomButton
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setModalOpen(true);
                  setForm((prev) => ({
                    ...prev,
                    data: formatDateInput(new Date()),
                    hora_inicio: "09:00",
                    profissional_nome: filters.profissional_nome || "",
                    atividade: { id: null, nome: "", duracao_padrao: 60, cor: "#1976d2", tipo: "Geral" },
                  }));
                }}
              >
                Novo agendamento
              </CustomButton>
            </Stack>
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
              <FilterAltIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" color="text.secondary">
                Filtros rápidos
              </Typography>
            </Stack>
            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={2}
              alignItems={{ lg: "center" }}
              justifyContent="space-between"
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ flexGrow: 1 }}>
                <Autocomplete
                  options={profissionais}
                  getOptionLabel={(option) => option.nome}
                  value={profissionais.find((p) => p.nome === filters.profissional_nome) || null}
                  onChange={(_event, newValue) => {
                    setFilters((prev) => ({ ...prev, profissional_nome: newValue?.nome || "" }));
                  }}
                  sx={{ minWidth: { xs: "100%", sm: 240 } }}
                  renderInput={(params) => <TextField {...params} label="Profissional" variant="outlined" />}
                />

                <Autocomplete
                  options={alunos}
                  getOptionLabel={(option) => option.nome}
                  value={alunos.find((a) => a.id === Number(filters.aluno_id)) || null}
                  onChange={(_event, newValue) => {
                    setFilters((prev) => ({ ...prev, aluno_id: newValue?.id || "" }));
                  }}
                  sx={{ minWidth: { xs: "100%", sm: 240 } }}
                  renderInput={(params) => <TextField {...params} label="Aluno" variant="outlined" />}
                />

                <TextField
                  select
                  label="Status"
                  value={filters.status}
                  onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
                  sx={{ minWidth: { xs: "100%", sm: 180 } }}
                >
                  <MenuItem value="">Todos os status</MenuItem>
                  <MenuItem value="confirmado">Confirmado</MenuItem>
                  <MenuItem value="pendente">Pendente</MenuItem>
                  <MenuItem value="cancelado">Cancelado</MenuItem>
                </TextField>
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ borderRadius: 4, overflow: "hidden" }}>
          {loading ? <LinearProgress /> : null}
          <Box sx={{ height: { xs: 520, md: 700 } }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={currentView}
              date={currentDate}
              onNavigate={handleNavigate}
              onView={handleViewChange}
              views={["week", "day", "month"]}
              culture="pt-BR"
              style={{ height: "100%" }}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              selectable
              step={30}
              timeslots={1}
              min={new Date(0, 0, 0, 7, 30)}
              max={new Date(0, 0, 0, 17, 0)}
              eventPropGetter={(event) => ({ style: event.style })}
              components={{ toolbar: CalendarToolbar }}
            />
          </Box>
        </Paper>
      </Stack>

      {/* Modal de Criação Rápida */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ pb: 1 }}>
          <Stack spacing={0.5}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Novo agendamento
            </Typography>
            {form.data ? (
              <Typography variant="body2" color="text.secondary">
                {format(new Date(`${form.data}T${form.hora_inicio || "00:00"}`), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </Typography>
            ) : null}
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={profissionais}
                  getOptionLabel={(option) => option.nome}
                  value={profissionais.find((p) => p.nome === form.profissional_nome) || null}
                  onChange={(_event, newValue) => {
                    setForm((prev) => ({ ...prev, profissional_nome: newValue?.nome || "" }));
                  }}
                  renderInput={(params) => <TextField {...params} label="Profissional" required />}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  multiple
                  options={alunos}
                  getOptionLabel={(option) => option.nome}
                  value={alunos.filter((aluno) => form.aluno_ids.includes(aluno.id))}
                  onChange={(_event, newValue) => {
                    setForm((prev) => ({ ...prev, aluno_ids: newValue.map((aluno) => aluno.id) }));
                  }}
                  renderInput={(params) => <TextField {...params} label="Alunos" required />}
                />
              </Grid>
            </Grid>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Detalhes da atividade
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Nome da atividade"
                        value={form.atividade.nome}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            atividade: { ...prev.atividade, nome: e.target.value },
                          }))
                        }
                        required
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        select
                        label="Tipo de atendimento"
                        value={form.atividade.tipo}
                        onChange={(e) => {
                          const novoTipo = e.target.value;
                          setForm((prev) => ({
                            ...prev,
                            atividade: {
                              ...prev.atividade,
                              tipo: novoTipo,
                              cor: getCorPorTipo(novoTipo),
                            },
                          }));
                        }}
                        required
                        fullWidth
                      >
                        <MenuItem value="Fisioterapia">Fisioterapia</MenuItem>
                        <MenuItem value="Fonoaudiologia">Fonoaudiologia</MenuItem>
                        <MenuItem value="Psicologia">Psicologia</MenuItem>
                        <MenuItem value="Terapia Ocupacional">Terapia Ocupacional</MenuItem>
                        <MenuItem value="Nutrição">Nutrição</MenuItem>
                        <MenuItem value="Psicomotricidade">Psicomotricidade</MenuItem>
                        <MenuItem value="Musicoterapia">Musicoterapia</MenuItem>
                        <MenuItem value="Equoterapia">Equoterapia</MenuItem>
                        <MenuItem value="Geral">Geral</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        type="number"
                        label="Duração (min)"
                        value={form.atividade.duracao_padrao}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            atividade: { ...prev.atividade, duracao_padrao: Number(e.target.value) },
                          }))
                        }
                        required
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        type="color"
                        label="Cor da atividade"
                        value={form.atividade.cor}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            atividade: { ...prev.atividade, cor: e.target.value },
                          }))
                        }
                        helperText="Selecione uma cor para destacar este atendimento no calendário"
                        required
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>

            {form.aluno_ids.length > 0 ? (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Alunos selecionados
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {form.aluno_ids.map((id) => {
                    const aluno = alunos.find((a) => a.id === id);
                    return aluno ? <Chip key={id} label={aluno.nome} size="small" /> : null;
                  })}
                </Box>
              </Stack>
            ) : null}

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  type="date"
                  label="Data"
                  InputLabelProps={{ shrink: true }}
                  value={form.data}
                  onChange={(e) => setForm((prev) => ({ ...prev, data: e.target.value }))}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  type="time"
                  label="Hora de início"
                  InputLabelProps={{ shrink: true }}
                  value={form.hora_inicio}
                  onChange={(e) => setForm((prev) => ({ ...prev, hora_inicio: e.target.value }))}
                  required
                  fullWidth
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observações"
              value={form.observacoes}
              onChange={(e) => setForm((prev) => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Inclua detalhes relevantes sobre o atendimento, como objetivos ou materiais necessários."
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.recorrente}
                    onChange={(e) => setForm((prev) => ({ ...prev, recorrente: e.target.checked }))}
                  />
                }
                label="Repetir semanalmente"
              />
              {form.recorrente ? (
                <TextField
                  type="date"
                  label="Fim da recorrência"
                  InputLabelProps={{ shrink: true }}
                  value={form.recorrencia_fim}
                  onChange={(e) => setForm((prev) => ({ ...prev, recorrencia_fim: e.target.value }))}
                  required
                  sx={{ minWidth: { xs: "100%", sm: 220 } }}
                />
              ) : null}
            </Stack>

            <Typography variant="caption" color="text.secondary">
              O término é calculado automaticamente a partir da duração da atividade.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <CustomButton variant="outlined" color="inherit" onClick={() => setModalOpen(false)}>
            Cancelar
          </CustomButton>
          <CustomButton
            variant="contained"
            onClick={handleCreateAgendamento}
            disabled={loading}
          >
            {loading ? "Salvando..." : "Criar agendamento"}
          </CustomButton>
        </DialogActions>
      </Dialog>

      {/* Modal de Detalhes */}
      <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle sx={{ pb: 1 }}>
          <Stack spacing={0.5}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Detalhes do agendamento
            </Typography>
            {selectedEvent ? (
              <Typography variant="body2" color="text.secondary">
                {format(new Date(`${selectedEvent.data}T${selectedEvent.hora_inicio}`), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </Typography>
            ) : null}
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          {selectedEvent ? (
            <Stack spacing={3}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Informações do atendimento
                      </Typography>
                      <Stack spacing={1.5}>
                        <Typography variant="body2">
                          <strong>Atividade:</strong> {selectedEvent.atividade?.nome || "Não informado"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Tipo:</strong> {selectedEvent.atividade?.tipo || "Não informado"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Profissional:</strong> {selectedEvent.profissional?.nome || "Não informado"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Setor:</strong> {selectedEvent.profissional?.setor || "Não informado"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Especialidade:</strong> {selectedEvent.profissional?.especialidade || "Não informado"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Status:</strong>{" "}
                          <Chip
                            label={selectedEvent.status}
                            color={selectedEvent.status === "confirmado" ? "success" : selectedEvent.status === "cancelado" ? "error" : "default"}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                        {selectedEvent.recorrente ? (
                          <Typography variant="body2">
                            <strong>Recorrente até:</strong> {selectedEvent.recorrencia_fim || "Não informado"}
                          </Typography>
                        ) : null}
                        {selectedEvent.observacoes ? (
                          <Typography variant="body2">
                            <strong>Observações:</strong> {selectedEvent.observacoes}
                          </Typography>
                        ) : null}
                        {selectedEvent.motivo_cancelamento ? (
                          <Typography variant="body2" color="error">
                            <strong>Motivo do cancelamento:</strong> {selectedEvent.motivo_cancelamento}
                          </Typography>
                        ) : null}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Alunos participantes
                      </Typography>
                      <Stack spacing={2}>
                        {selectedEvent.alunos?.length ? (
                          selectedEvent.alunos.map((aluno) => (
                            <Box key={aluno.id} sx={{ p: 2, border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {aluno.nome}
                              </Typography>
                              <Stack spacing={0.5} mt={1}>
                                <Typography variant="body2">Idade: {aluno.idade ? `${aluno.idade} anos` : "Não informado"}</Typography>
                                <Typography variant="body2">Turma: {aluno.turma || "Não informado"}</Typography>
                                <Typography variant="body2">Turno: {aluno.turno || "Não informado"}</Typography>
                                <Typography variant="body2">Responsável: {aluno.responsavel_nome || "Não informado"}</Typography>
                                <Typography variant="body2">Contato: {aluno.responsavel_telefone || "Não informado"}</Typography>
                                {aluno.observacoes ? (
                                  <Typography variant="body2">Observações: {aluno.observacoes}</Typography>
                                ) : null}
                              </Stack>
                            </Box>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Nenhum aluno associado.
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Stack spacing={1.5}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Próximos agendamentos dos alunos
                        </Typography>
                        {proximosAgendamentos.length ? (
                          <Stack spacing={1.5}>
                            {proximosAgendamentos.map((agendamento) => (
                              <Box
                                key={agendamento.id}
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  border: (theme) => `1px solid ${theme.palette.divider}`,
                                  backgroundColor: (theme) => theme.palette.background.default,
                                }}
                              >
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {agendamento.atividade?.nome || "Atividade"}
                                  </Typography>
                                  <Chip
                                    label={agendamento.status}
                                    color={agendamento.status === "confirmado" ? "success" : "default"}
                                    size="small"
                                  />
                                </Stack>
                                <Typography variant="body2">Data: {agendamento.data} — {agendamento.hora_inicio} até {agendamento.hora_fim}</Typography>
                                <Typography variant="body2">Profissional: {agendamento.profissional?.nome || "Não informado"}</Typography>
                                <Typography variant="body2">
                                  Alunos: {agendamento.alunos?.map((aluno) => aluno.nome).join(", ") || "Não informado"}
                                </Typography>
                                {agendamento.atividade?.tipo ? (
                                  <Typography variant="body2">Tipo: {agendamento.atividade.tipo}</Typography>
                                ) : null}
                              </Box>
                            ))}
                          </Stack>
                        ) : (
                          <Box sx={{ p: 3, textAlign: "center", borderRadius: 2, border: (theme) => `1px dashed ${theme.palette.divider}` }}>
                            <Typography variant="body2" color="text.secondary">
                              Nenhum outro agendamento encontrado para estes alunos nos próximos dias.
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <CustomButton variant="outlined" color="inherit" onClick={() => setDetailModalOpen(false)}>
            Fechar
          </CustomButton>
          <CustomButton variant="outlined" onClick={handleEditAgendamento}>
            Editar agendamento
          </CustomButton>
          <CustomButton variant="contained" color="error" onClick={handleCancelAgendamento}>
            Cancelar agendamento
          </CustomButton>
        </DialogActions>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ pb: 1 }}>
          <Stack spacing={0.5}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Editar agendamento
            </Typography>
            {selectedEvent ? (
              <Typography variant="body2" color="text.secondary">
                {format(new Date(`${selectedEvent.data}T${selectedEvent.hora_inicio}`), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </Typography>
            ) : null}
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data"
                  value={editForm.data || ""}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, data: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Hora de início"
                  value={editForm.hora_inicio || ""}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, hora_inicio: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={profissionais}
                  getOptionLabel={(option) => option.nome}
                  value={profissionais.find((p) => p.nome === editForm.profissional_nome) || null}
                  onChange={(_event, newValue) => {
                    setEditForm((prev) => ({ ...prev, profissional_nome: newValue?.nome || "" }));
                  }}
                  renderInput={(params) => <TextField {...params} label="Profissional" required />}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  multiple
                  options={alunos}
                  getOptionLabel={(option) => option.nome}
                  value={alunos.filter((a) => editForm.aluno_ids?.includes(a.id))}
                  onChange={(_event, newValue) => {
                    setEditForm((prev) => ({ ...prev, aluno_ids: newValue.map((aluno) => aluno.id) }));
                  }}
                  renderInput={(params) => <TextField {...params} label="Alunos" required />}
                />
              </Grid>
            </Grid>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nome da atividade"
                      value={editForm.atividade?.nome || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          atividade: { ...prev.atividade, nome: e.target.value },
                        }))
                      }
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      select
                      label="Tipo"
                      value={editForm.atividade?.tipo || ""}
                      onChange={(e) => {
                        const novoTipo = e.target.value;
                        setEditForm((prev) => ({
                          ...prev,
                          atividade: {
                            ...prev.atividade,
                            tipo: novoTipo,
                            cor: getCorPorTipo(novoTipo),
                          },
                        }));
                      }}
                    >
                      <MenuItem value="Fisioterapia">Fisioterapia</MenuItem>
                      <MenuItem value="Fonoaudiologia">Fonoaudiologia</MenuItem>
                      <MenuItem value="Psicologia">Psicologia</MenuItem>
                      <MenuItem value="Terapia Ocupacional">Terapia Ocupacional</MenuItem>
                      <MenuItem value="Nutrição">Nutrição</MenuItem>
                      <MenuItem value="Psicomotricidade">Psicomotricidade</MenuItem>
                      <MenuItem value="Musicoterapia">Musicoterapia</MenuItem>
                      <MenuItem value="Equoterapia">Equoterapia</MenuItem>
                      <MenuItem value="Geral">Geral</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Duração (min)"
                      value={editForm.atividade?.duracao_padrao || 60}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          atividade: { ...prev.atividade, duracao_padrao: parseInt(e.target.value, 10) || 60 },
                        }))
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observações"
              value={editForm.observacoes || ""}
              onChange={(e) => setEditForm((prev) => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Inclua detalhes adicionais sobre o atendimento."
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editForm.recorrente || false}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, recorrente: e.target.checked }))}
                  />
                }
                label="Agendamento recorrente"
              />
              {editForm.recorrente ? (
                <TextField
                  fullWidth
                  type="date"
                  label="Fim da recorrência"
                  value={editForm.recorrencia_fim || ""}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, recorrencia_fim: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: { xs: "100%", sm: 220 } }}
                />
              ) : null}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <CustomButton variant="outlined" color="inherit" onClick={() => setEditModalOpen(false)}>
            Cancelar
          </CustomButton>
          <CustomButton variant="contained" onClick={handleSaveEdit} disabled={loading}>
            {loading ? "Salvando..." : "Salvar alterações"}
          </CustomButton>
        </DialogActions>
      </Dialog>

      {/* Modal de Cancelamento */}
      <Dialog open={cancelModalOpen} onClose={() => setCancelModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Cancelar agendamento
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary">
              Informe o motivo do cancelamento e escolha se deseja cancelar apenas este compromisso ou toda a sequência futura.
            </Typography>
            <TextField
              fullWidth
              label="Motivo do cancelamento"
              multiline
              rows={3}
              value={cancelForm.motivo}
              onChange={(e) => setCancelForm((prev) => ({ ...prev, motivo: e.target.value }))}
              required
            />
            <TextField
              fullWidth
              select
              label="Escopo do cancelamento"
              value={cancelForm.tipo}
              onChange={(e) => setCancelForm((prev) => ({ ...prev, tipo: e.target.value }))}
            >
              <MenuItem value="only">Apenas este agendamento</MenuItem>
              <MenuItem value="future">Este e os próximos (se recorrente)</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <CustomButton variant="outlined" color="inherit" onClick={() => setCancelModalOpen(false)}>
            Voltar
          </CustomButton>
          <CustomButton
            variant="contained"
            color="error"
            onClick={handleConfirmCancel}
            disabled={loading || !cancelForm.motivo.trim()}
          >
            {loading ? "Cancelando..." : "Confirmar cancelamento"}
          </CustomButton>
        </DialogActions>
      </Dialog>

      {/* Modal de Exportação PDF */}
      <Dialog open={exportModalOpen} onClose={() => setExportModalOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Exportar agenda em PDF
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Stack spacing={3}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Período da exportação
                  </Typography>
                  <TextField
                    type="date"
                    label="Semana de referência"
                    value={selectedWeekForExport}
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value);
                      if (Number.isNaN(selectedDate.getTime())) return;
                      const dayOfWeek = selectedDate.getDay();
                      const monday = new Date(selectedDate);
                      monday.setDate(selectedDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
                      setSelectedWeekForExport(monday.toISOString().split("T")[0]);
                    }}
                    InputLabelProps={{ shrink: true }}
                    helperText={`Período gerado: ${formatWeekPeriod(selectedWeekForExport)}`}
                    sx={{ maxWidth: 260 }}
                  />
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <CustomButton
                      variant="outlined"
                      color="inherit"
                      onClick={() => {
                        const currentWeek = new Date(selectedWeekForExport);
                        currentWeek.setDate(currentWeek.getDate() - 7);
                        setSelectedWeekForExport(currentWeek.toISOString().split("T")[0]);
                      }}
                    >
                      Semana anterior
                    </CustomButton>
                    <CustomButton
                      variant="outlined"
                      color="inherit"
                      onClick={() => {
                        const today = new Date();
                        const dayOfWeek = today.getDay();
                        const monday = new Date(today);
                        monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
                        setSelectedWeekForExport(monday.toISOString().split("T")[0]);
                      }}
                    >
                      Semana atual
                    </CustomButton>
                    <CustomButton
                      variant="outlined"
                      color="inherit"
                      onClick={() => {
                        const currentWeek = new Date(selectedWeekForExport);
                        currentWeek.setDate(currentWeek.getDate() + 7);
                        setSelectedWeekForExport(currentWeek.toISOString().split("T")[0]);
                      }}
                    >
                      Próxima semana
                    </CustomButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Filtros opcionais
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={profissionais}
                      getOptionLabel={(option) => option.nome}
                      value={profissionais.find((p) => p.nome === filters.profissional_nome) || null}
                      onChange={(_event, newValue) => {
                        setFilters((prev) => ({ ...prev, profissional_nome: newValue?.nome || "" }));
                      }}
                      renderInput={(params) => <TextField {...params} label="Profissional" placeholder="Todos" />}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={alunos}
                      getOptionLabel={(option) => option.nome}
                      value={alunos.find((a) => a.id === Number(filters.aluno_id)) || null}
                      onChange={(_event, newValue) => {
                        setFilters((prev) => ({ ...prev, aluno_id: newValue?.id || "" }));
                      }}
                      renderInput={(params) => <TextField {...params} label="Aluno" placeholder="Todos" />}
                    />
                  </Grid>
                </Grid>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Deixe os filtros vazios para exportar todos os agendamentos da semana selecionada.
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Conteúdo do relatório
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={exportOptions.incluirObservacoes}
                          onChange={(e) =>
                            setExportOptions((prev) => ({ ...prev, incluirObservacoes: e.target.checked }))
                          }
                        />
                      }
                      label="Incluir observações dos agendamentos"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={exportOptions.incluirDetalhesAlunos}
                          onChange={(e) =>
                            setExportOptions((prev) => ({ ...prev, incluirDetalhesAlunos: e.target.checked }))
                          }
                        />
                      }
                      label="Incluir detalhes dos alunos"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={exportOptions.incluirContatos}
                          onChange={(e) =>
                            setExportOptions((prev) => ({ ...prev, incluirContatos: e.target.checked }))
                          }
                        />
                      }
                      label="Incluir contatos dos responsáveis"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={exportOptions.agruparPorProfissional}
                          onChange={(e) =>
                            setExportOptions((prev) => ({ ...prev, agruparPorProfissional: e.target.checked }))
                          }
                        />
                      }
                      label="Agrupar por profissional"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={exportOptions.incluirEstatisticas}
                          onChange={(e) =>
                            setExportOptions((prev) => ({ ...prev, incluirEstatisticas: e.target.checked }))
                          }
                        />
                      }
                      label="Incluir estatísticas da semana"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 3, backgroundColor: (theme) => theme.palette.background.default }}>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Resumo antes de exportar
                  </Typography>
                  <Typography variant="body2">
                    <strong>Período:</strong> {formatWeekPeriod(selectedWeekForExport)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Filtros:</strong> {filters.profissional_nome || filters.aluno_id ? `${filters.profissional_nome ? `Profissional: ${filters.profissional_nome}` : ""}${filters.profissional_nome && filters.aluno_id ? " | " : ""}${filters.aluno_id ? `Aluno: ${alunos.find((a) => a.id === Number(filters.aluno_id))?.nome || `ID ${filters.aluno_id}`}` : ""}` : "Todos os agendamentos"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Opções:</strong> {
                      [
                        exportOptions.incluirObservacoes ? "Observações" : null,
                        exportOptions.incluirDetalhesAlunos ? "Detalhes dos alunos" : null,
                        exportOptions.incluirContatos ? "Contatos" : null,
                        exportOptions.agruparPorProfissional ? "Agrupado por profissional" : null,
                        exportOptions.incluirEstatisticas ? "Estatísticas" : null,
                      ]
                        .filter(Boolean)
                        .join(", ") || "Nenhuma opção extra selecionada"
                    }
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 3 }}>
          <CustomButton
            variant="outlined"
            color="inherit"
            onClick={() => {
              setExportOptions({
                incluirObservacoes: true,
                incluirDetalhesAlunos: true,
                incluirContatos: true,
                agruparPorProfissional: false,
                incluirEstatisticas: true,
                formato: "semanal",
              });
            }}
          >
            Restaurar padrões
          </CustomButton>
          <Stack direction="row" spacing={1}>
            <CustomButton variant="outlined" color="inherit" onClick={() => setExportModalOpen(false)}>
              Voltar
            </CustomButton>
            <CustomButton variant="contained" onClick={handleExportPDF} disabled={loading}>
              {loading ? "Gerando PDF..." : "Gerar PDF"}
            </CustomButton>
          </Stack>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}