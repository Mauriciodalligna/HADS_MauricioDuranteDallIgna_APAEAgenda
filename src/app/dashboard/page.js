"use client";

import Typography from "@mui/material/Typography";
import AppShell from "@/components/AppShell";

export default function DashboardPage() {
  return (
    <AppShell>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Bem-vindo ao APAE Agenda
      </Typography>
      <Typography variant="body1">
        Use o menu lateral para navegar entre as funcionalidades.
      </Typography>
    </AppShell>
  );
}


