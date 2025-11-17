"use client";

import { useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PIE_COLORS = ["#1976d2", "#9c27b0", "#fb8c00", "#2e7d32", "#ff5f52", "#00838f"];

function formatMonthLabel(value) {
  if (!value) return "Sem data";
  const date = parseISO(value);
  if (Number.isNaN(date.getTime())) return "Sem data";
  return format(date, "MMM/yy", { locale: ptBR }).toUpperCase();
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAnalytics() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/dashboard/analytics");
        if (!response.ok) {
          throw new Error("Falha ao carregar os dados do dashboard.");
        }
        const payload = await response.json();
        if (isMounted) {
          setAnalytics(payload);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  const atendimentosChartData = useMemo(() => {
    if (!analytics?.charts?.atendimentosPorMes?.length) return [];
    return analytics.charts.atendimentosPorMes.map((item) => ({
      label: formatMonthLabel(item.periodo),
      total: item.total,
    }));
  }, [analytics]);

  const topTiposAtividadeData = analytics?.charts?.topTiposAtividade ?? [];
  const statusResumoData = analytics?.charts?.statusResumo ?? [];
  const totals = analytics?.totals;

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Visão analítica
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Acompanhe a produtividade e identifique gargalos nos atendimentos.
        </Typography>
      </Stack>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Carregando insights do dashboard...
            </Typography>
          </Stack>
        </Box>
      )}

      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}

      {!loading && !error && analytics && (
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Atendimentos hoje
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {totals?.totalAtendimentosHoje ?? 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Agendamentos previstos para o dia atual.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Semana em andamento
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {totals?.totalAtendimentosSemana ?? 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total de atendimentos agendados entre segunda e domingo.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Alunos ativos
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {totals?.totalAlunos ?? 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quantidade de alunos cadastrados na base.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} lg={7}>
              <Card variant="outlined" sx={{ height: "100%", borderRadius: 3 }}>
                <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Tendência de atendimentos (6 meses)
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {atendimentosChartData.length ? (
                    <Box sx={{ flexGrow: 1, minHeight: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={atendimentosChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="label" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="total" stroke="#1e88e5" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Stack spacing={1} sx={{ flexGrow: 1 }} alignItems="center" justifyContent="center" color="text.secondary">
                      <Typography variant="body2">Sem dados suficientes para exibir o gráfico.</Typography>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={5}>
              <Card variant="outlined" sx={{ height: "100%", borderRadius: 3 }}>
                <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Top tipos de atividade do mês
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {topTiposAtividadeData.length ? (
                    <Box sx={{ flexGrow: 1, minHeight: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topTiposAtividadeData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" allowDecimals={false} />
                          <YAxis type="category" dataKey="tipo" width={160} />
                          <Tooltip />
                          <Bar dataKey="total" fill="#43a047" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Stack spacing={1} sx={{ flexGrow: 1 }} alignItems="center" justifyContent="center" color="text.secondary">
                      <Typography variant="body2">Ainda não há registros de tipos de atividade neste mês.</Typography>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: "100%", borderRadius: 3 }}>
                <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Status dos agendamentos
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {statusResumoData.length ? (
                    <Box sx={{ flexGrow: 1, minHeight: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusResumoData}
                            dataKey="total"
                            nameKey="status"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                          >
                            {statusResumoData.map((entry, index) => (
                              <Cell key={`cell-${entry.status}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Stack spacing={1} sx={{ flexGrow: 1 }} alignItems="center" justifyContent="center" color="text.secondary">
                      <Typography variant="body2">Cadastre atendimentos para visualizar a distribuição por status.</Typography>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      )}
    </Stack>
  );
}


