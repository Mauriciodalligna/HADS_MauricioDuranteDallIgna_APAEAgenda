"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
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

export default function AgendamentosPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [filters, setFilters] = useState({ 
    profissional_nome: "", 
    aluno_id: "",
    status: "confirmado"
  });
  
  // Estados para controle do calendário
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("week");
  
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

  async function loadOptions() {
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
  }

  async function loadAgendamentos() {
    try {
      setError("");
      const qs = new URLSearchParams();
      
      if (filters.profissional_nome) qs.append("profissional_nome", filters.profissional_nome);
      if (filters.aluno_id) qs.append("aluno_id", String(filters.aluno_id));
      if (filters.status) qs.append("status", filters.status);
      
      qs.append("limit", "500");
      
      const res = await fetch(`/api/agendamentos?${qs.toString()}`, { 
        headers: { authorization: `Bearer ${token}` } 
      });
      const j = await res.json();
      
      if (!res.ok || !j.ok) { 
        setError(j?.error || "Falha ao carregar agenda"); 
        return; 
      }
      
      const evs = (j.data || []).map((ag) => ({
        id: ag.id,
        title: `${ag.atividade?.nome || "Atividade"} - ${ag.alunos?.map(a => a.nome).join(", ") || "Sem alunos"}`,
        start: toDate(ag.data, ag.hora_inicio),
        end: toDate(ag.data, ag.hora_fim),
        resource: ag,
        style: {
          backgroundColor: getCorPorTipo(ag.atividade?.tipo) || ag.atividade?.cor || "#1976d2",
          color: "white",
          border: "none",
          borderRadius: "4px"
        }
      }));
      
      setEvents(evs);
    } catch { 
      setError("Erro ao carregar agenda"); 
    }
  }

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
      
      const payload = {
        profissional_nome: filters.profissional_nome || null,
        aluno_id: filters.aluno_id || null,
        semana_inicio: formatDateInput(new Date())
      };
      
      const res = await fetch(`/api/agendamentos/export/pdf`, {
        method: "POST",
        headers: { 
          "content-type": "application/json", 
          authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });
      
      const j = await res.json();
      
      if (!res.ok || !j.ok) { 
        setError(j?.error || "Erro ao exportar PDF"); 
        return; 
      }
      
      setSuccess("Dados preparados para PDF (implementação pendente)");
    } catch {
      setError("Erro inesperado");
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
  }, []);

  useEffect(() => { 
    loadAgendamentos(); 
  }, [filters.profissional_nome, filters.aluno_id, filters.status]);

  return (
    <AppShell>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Agendamentos
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      {/* Toolbar com filtros */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
        <Autocomplete
          options={profissionais}
          getOptionLabel={(option) => option.nome}
          value={profissionais.find(p => p.nome === filters.profissional_nome) || null}
          onChange={(event, newValue) => {
            setFilters(prev => ({ ...prev, profissional_nome: newValue?.nome || "" }));
          }}
          sx={{ minWidth: 200 }}
          renderInput={(params) => (
            <TextField {...params} label="Profissional" variant="outlined" />
          )}
        />
        
        <Autocomplete
          options={alunos}
          getOptionLabel={(option) => option.nome}
          value={alunos.find(a => a.id === Number(filters.aluno_id)) || null}
          onChange={(event, newValue) => {
            setFilters(prev => ({ ...prev, aluno_id: newValue?.id || "" }));
          }}
          sx={{ minWidth: 200 }}
          renderInput={(params) => (
            <TextField {...params} label="Aluno" variant="outlined" />
          )}
        />


        <Button 
          variant="contained" 
          color="primary"
          onClick={() => {
            setModalOpen(true);
            setForm(prev => ({
              ...prev,
              data: formatDateInput(new Date()),
              hora_inicio: "09:00",
              profissional_nome: filters.profissional_nome || "",
              atividade: { id: null, nome: "", duracao_padrao: 60, cor: "#1976d2", tipo: "Geral" }
            }));
          }}
          sx={{ mr: 1 }}
        >
          Criar Agendamento
        </Button>

        <Button 
          variant="contained" 
          onClick={handleExportPDF}
          disabled={loading}
          sx={{ ml: "auto" }}
        >
          Exportar PDF
        </Button>
      </Box>

      {/* Calendário */}
      <Box sx={{ height: 700, mb: 2 }}>
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
          min={new Date(0, 0, 0, 7, 30)} // 07:30
          max={new Date(0, 0, 0, 17, 0)} // 17:00
          eventPropGetter={(event) => ({
            style: event.style
          })}
          components={{
            toolbar: (props) => (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '10px',
                borderBottom: '1px solid #e0e0e0',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => handleNavigate('PREV')}
                    style={{ 
                      padding: '8px 12px', 
                      border: '1px solid #ccc', 
                      borderRadius: '4px',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    ← Anterior
                  </button>
                  <button 
                    onClick={() => handleNavigate('TODAY')}
                    style={{ 
                      padding: '8px 12px', 
                      border: '1px solid #ccc', 
                      borderRadius: '4px',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Hoje
                  </button>
                  <button 
                    onClick={() => handleNavigate('NEXT')}
                    style={{ 
                      padding: '8px 12px', 
                      border: '1px solid #ccc', 
                      borderRadius: '4px',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Próximo →
                  </button>
                </div>
                
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  {currentView === 'day' && format(currentDate, 'dd/MM/yyyy')}
                  {currentView === 'week' && `${format(startOfWeek(currentDate), 'dd/MM')} - ${format(endOfWeek(currentDate), 'dd/MM/yyyy')}`}
                  {currentView === 'month' && format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                </div>
                
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button 
                    onClick={() => handleViewChange('day')}
                    style={{ 
                      padding: '8px 12px', 
                      border: '1px solid #ccc', 
                      borderRadius: '4px',
                      background: currentView === 'day' ? '#1976d2' : 'white',
                      color: currentView === 'day' ? 'white' : 'black',
                      cursor: 'pointer'
                    }}
                  >
                    Dia
                  </button>
                  <button 
                    onClick={() => handleViewChange('week')}
                    style={{ 
                      padding: '8px 12px', 
                      border: '1px solid #ccc', 
                      borderRadius: '4px',
                      background: currentView === 'week' ? '#1976d2' : 'white',
                      color: currentView === 'week' ? 'white' : 'black',
                      cursor: 'pointer'
                    }}
                  >
                    Semana
                  </button>
                  <button 
                    onClick={() => handleViewChange('month')}
                    style={{ 
                      padding: '8px 12px', 
                      border: '1px solid #ccc', 
                      borderRadius: '4px',
                      background: currentView === 'month' ? '#1976d2' : 'white',
                      color: currentView === 'month' ? 'white' : 'black',
                      cursor: 'pointer'
                    }}
                  >
                    Mês
                  </button>
                </div>
              </div>
            )
          }}
        />
      </Box>

      {/* Modal de Criação Rápida */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>
          Novo Agendamento - {form.data} às {form.hora_inicio}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            {/* Seleção de Profissional */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={profissionais}
                getOptionLabel={(option) => option.nome}
                value={profissionais.find(p => p.nome === form.profissional_nome) || null}
                onChange={(event, newValue) => {
                  setForm(prev => ({ ...prev, profissional_nome: newValue?.nome || "" }));
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Profissional" required />
                )}
              />
            </Grid>

            {/* Seleção de Alunos */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={alunos}
                getOptionLabel={(option) => option.nome}
                value={alunos.filter(a => form.aluno_ids.includes(a.id))}
                onChange={(event, newValue) => {
                  setForm(prev => ({ ...prev, aluno_ids: newValue.map(a => a.id) }));
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Alunos" required />
                )}
              />
            </Grid>

            {/* Dados da Atividade */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Dados da Atividade
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Nome da Atividade" 
                        value={form.atividade.nome} 
                        onChange={(e) => setForm(prev => ({ 
                          ...prev, 
                          atividade: { ...prev.atividade, nome: e.target.value }
                        }))}
                        required
                        fullWidth
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <TextField 
                        select
                        label="Tipo de Atendimento" 
                        value={form.atividade.tipo} 
                        onChange={(e) => {
                          const novoTipo = e.target.value;
                          setForm(prev => ({ 
                            ...prev, 
                            atividade: { 
                              ...prev.atividade, 
                              tipo: novoTipo,
                              cor: getCorPorTipo(novoTipo)
                            }
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
                        onChange={(e) => setForm(prev => ({ 
                          ...prev, 
                          atividade: { ...prev.atividade, duracao_padrao: Number(e.target.value) }
                        }))}
                        required
                        fullWidth
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField 
                        type="color" 
                        label="Cor da Atividade" 
                        value={form.atividade.cor} 
                        onChange={(e) => setForm(prev => ({ 
                          ...prev, 
                          atividade: { ...prev.atividade, cor: e.target.value }
                        }))}
                        required
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Alunos Selecionados */}
            {form.aluno_ids.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Alunos selecionados:
                </Typography>
                {form.aluno_ids.map(id => {
                  const aluno = alunos.find(a => a.id === id);
                  return aluno ? (
                    <Chip key={id} label={aluno.nome} size="small" sx={{ mr: 1, mb: 1 }} />
                  ) : null;
                })}
              </Grid>
            )}

            {/* Data e Hora */}
            <Grid item xs={12} md={6}>
              <TextField 
                type="date" 
                label="Data" 
                InputLabelProps={{ shrink: true }} 
                value={form.data} 
                onChange={(e) => setForm(prev => ({ ...prev, data: e.target.value }))}
                required
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField 
                type="time" 
                label="Hora Início" 
                InputLabelProps={{ shrink: true }} 
                value={form.hora_inicio} 
                onChange={(e) => setForm(prev => ({ ...prev, hora_inicio: e.target.value }))}
                required
                fullWidth
              />
            </Grid>

            {/* Observações */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Observações"
                value={form.observacoes}
                onChange={(e) => setForm(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Adicione observações sobre o agendamento..."
              />
            </Grid>

            {/* Recorrência */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.recorrente}
                    onChange={(e) => setForm(prev => ({ ...prev, recorrente: e.target.checked }))}
                  />
                }
                label="Recorrente (semanal)"
              />
            </Grid>

            {form.recorrente && (
              <Grid item xs={12}>
                <TextField 
                  type="date" 
                  label="Data Fim da Recorrência" 
                  InputLabelProps={{ shrink: true }} 
                  value={form.recorrencia_fim} 
                  onChange={(e) => setForm(prev => ({ ...prev, recorrencia_fim: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
            )}
          </Grid>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            O horário de término será calculado automaticamente conforme a duração da atividade.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateAgendamento} 
            disabled={loading}
          >
            {loading ? "Salvando..." : "Criar Agendamento"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Detalhes/Edição */}
      <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>
          Detalhes do Agendamento
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedEvent && (
            <Grid container spacing={3}>
              {/* Informações do Agendamento */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Informações do Agendamento
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Atividade:</strong> {selectedEvent.atividade?.nome || "N/A"}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Tipo:</strong> {selectedEvent.atividade?.tipo || "N/A"}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Profissional:</strong> {selectedEvent.profissional?.nome}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Setor:</strong> {selectedEvent.profissional?.setor || "N/A"}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Especialidade:</strong> {selectedEvent.profissional?.especialidade || "N/A"}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Data:</strong> {selectedEvent.data}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Horário:</strong> {selectedEvent.hora_inicio} - {selectedEvent.hora_fim}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Status:</strong> 
                      <Chip 
                        label={selectedEvent.status} 
                        color={selectedEvent.status === 'confirmado' ? 'success' : 'error'}
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    {selectedEvent.observacoes && (
                      <Typography variant="body1" gutterBottom>
                        <strong>Observações:</strong> {selectedEvent.observacoes}
                      </Typography>
                    )}
                    {selectedEvent.recorrente && (
                      <Typography variant="body1" gutterBottom>
                        <strong>Recorrente:</strong> Sim (até {selectedEvent.recorrencia_fim})
                      </Typography>
                    )}
                    {selectedEvent.motivo_cancelamento && (
                      <Typography variant="body1" gutterBottom color="error">
                        <strong>Motivo do cancelamento:</strong> {selectedEvent.motivo_cancelamento}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Informações dos Alunos */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Alunos Participantes
                    </Typography>
                    {selectedEvent.alunos && selectedEvent.alunos.length > 0 ? (
                      selectedEvent.alunos.map(aluno => (
                        <Box key={aluno.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            <strong>{aluno.nome}</strong>
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Idade:</strong> {aluno.idade || "N/A"} anos
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Turma:</strong> {aluno.turma || "N/A"}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Turno:</strong> {aluno.turno || "N/A"}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Escola Regular:</strong> {aluno.escola_regular || "N/A"}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Série:</strong> {aluno.serie || "N/A"}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Cidade:</strong> {aluno.cidade || "N/A"}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Responsável:</strong> {aluno.responsavel_nome || "N/A"}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Telefone:</strong> {aluno.responsavel_telefone || "N/A"}
                          </Typography>
                          {aluno.observacoes && (
                            <Typography variant="body2" gutterBottom>
                              <strong>Observações:</strong> {aluno.observacoes}
                            </Typography>
                          )}
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Nenhum aluno associado
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Próximos Agendamentos */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Próximos Agendamentos dos Alunos
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Agendamentos de hoje e amanhã dos alunos participantes:
                    </Typography>
                    
                    {proximosAgendamentos.length > 0 ? (
                      <Box sx={{ mt: 2 }}>
                        {proximosAgendamentos.map((agendamento, index) => (
                          <Box 
                            key={agendamento.id} 
                            sx={{ 
                              mb: 2, 
                              p: 2, 
                              border: '1px solid #e0e0e0', 
                              borderRadius: 1,
                              backgroundColor: '#f9f9f9'
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle2" color="primary">
                                <strong>{agendamento.atividade?.nome || "Atividade"}</strong>
                              </Typography>
                              <Chip 
                                label={agendamento.status} 
                                color={agendamento.status === 'confirmado' ? 'success' : 'default'}
                                size="small"
                              />
                            </Box>
                            
                            <Typography variant="body2" gutterBottom>
                              <strong>Data:</strong> {agendamento.data} às {agendamento.hora_inicio} - {agendamento.hora_fim}
                            </Typography>
                            
                            <Typography variant="body2" gutterBottom>
                              <strong>Profissional:</strong> {agendamento.profissional?.nome}
                            </Typography>
                            
                            <Typography variant="body2" gutterBottom>
                              <strong>Alunos:</strong> {agendamento.alunos?.map(a => a.nome).join(", ") || "N/A"}
                            </Typography>
                            
                            {agendamento.atividade?.tipo && (
                              <Typography variant="body2" gutterBottom>
                                <strong>Tipo:</strong> {agendamento.atividade.tipo}
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Box sx={{ mt: 2, p: 3, textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Nenhum agendamento futuro encontrado para estes alunos.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Você pode criar novos agendamentos clicando em "Criar Agendamento".
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>Fechar</Button>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={handleEditAgendamento}
          >
            Editar Agendamento
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleCancelAgendamento}
          >
            Cancelar Agendamento
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>
          Editar Agendamento
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            {/* Data e Horário */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Data"
                value={editForm.data || ""}
                onChange={(e) => setEditForm(prev => ({ ...prev, data: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="time"
                label="Horário de Início"
                value={editForm.hora_inicio || ""}
                onChange={(e) => setEditForm(prev => ({ ...prev, hora_inicio: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Profissional */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={profissionais}
                getOptionLabel={(option) => option.nome}
                value={profissionais.find(p => p.nome === editForm.profissional_nome) || null}
                onChange={(event, newValue) => {
                  setEditForm(prev => ({ ...prev, profissional_nome: newValue?.nome || "" }));
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Profissional" required />
                )}
              />
            </Grid>

            {/* Alunos */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={alunos}
                getOptionLabel={(option) => option.nome}
                value={alunos.filter(a => editForm.aluno_ids?.includes(a.id))}
                onChange={(event, newValue) => {
                  setEditForm(prev => ({ ...prev, aluno_ids: newValue.map(a => a.id) }));
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Alunos" required />
                )}
              />
            </Grid>

            {/* Atividade */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome da Atividade"
                value={editForm.atividade?.nome || ""}
                onChange={(e) => setEditForm(prev => ({ 
                  ...prev, 
                  atividade: { ...prev.atividade, nome: e.target.value }
                }))}
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
                  setEditForm(prev => ({ 
                    ...prev, 
                    atividade: { 
                      ...prev.atividade, 
                      tipo: novoTipo,
                      cor: getCorPorTipo(novoTipo)
                    }
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
                onChange={(e) => setEditForm(prev => ({ 
                  ...prev, 
                  atividade: { ...prev.atividade, duracao_padrao: parseInt(e.target.value) || 60 }
                }))}
              />
            </Grid>

            {/* Observações */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Observações"
                value={editForm.observacoes || ""}
                onChange={(e) => setEditForm(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Adicione observações sobre o agendamento..."
              />
            </Grid>

            {/* Recorrência */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editForm.recorrente || false}
                    onChange={(e) => setEditForm(prev => ({ ...prev, recorrente: e.target.checked }))}
                  />
                }
                label="Agendamento Recorrente"
              />
            </Grid>
            {editForm.recorrente && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data de Término da Recorrência"
                  value={editForm.recorrencia_fim || ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, recorrencia_fim: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveEdit} 
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Cancelamento */}
      <Dialog open={cancelModalOpen} onClose={() => setCancelModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          Cancelar Agendamento
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Motivo do Cancelamento"
                multiline
                rows={3}
                value={cancelForm.motivo}
                onChange={(e) => setCancelForm(prev => ({ ...prev, motivo: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Tipo de Cancelamento"
                value={cancelForm.tipo}
                onChange={(e) => setCancelForm(prev => ({ ...prev, tipo: e.target.value }))}
              >
                <MenuItem value="only">Apenas este agendamento</MenuItem>
                <MenuItem value="future">Este e todos os futuros (se recorrente)</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelModalOpen(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleConfirmCancel} 
            disabled={loading}
          >
            {loading ? "Cancelando..." : "Confirmar Cancelamento"}
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}