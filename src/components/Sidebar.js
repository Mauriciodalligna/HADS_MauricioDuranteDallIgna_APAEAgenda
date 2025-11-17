"use client";

import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import SchoolIcon from "@mui/icons-material/School";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import CampaignIcon from "@mui/icons-material/Campaign";
import { useRouter, usePathname } from "next/navigation";

export const SIDEBAR_WIDTH = 264;

const links = [
  { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon aria-hidden /> },
  { label: "Alunos", href: "/alunos", icon: <SchoolIcon aria-hidden /> },
  { label: "Profissionais", href: "/profissionais", icon: <AssignmentIndIcon aria-hidden /> },
  { label: "Agendamentos", href: "/agendamentos", icon: <EventNoteIcon aria-hidden /> },
  { label: "Mural de Avisos", href: "/mural", icon: <CampaignIcon aria-hidden /> },
  { label: "Usuários", href: "/usuarios", icon: <GroupIcon aria-hidden /> },
];

export default function Sidebar({ variant = "permanent", open = true, onClose }) {
  const router = useRouter();
  const pathname = usePathname();
  const isTemporary = variant === "temporary";

  const handleNavigate = (href) => {
    router.push(href);
    if (isTemporary && typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: SIDEBAR_WIDTH,
          boxSizing: "border-box",
          paddingBottom: 3,
          display: "flex",
          flexDirection: "column",
          borderRadius: 0,
        },
      }}
    >
      <Toolbar />
      <Box sx={{ px: 2, pb: 1 }}>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.6 }}>
          Navegação principal
        </Typography>
      </Box>
      <List sx={{ flexGrow: 1, px: 0 }}>
        {links.map((item) => (
          <ListItemButton
            key={item.href}
            selected={pathname?.startsWith(item.href)}
            onClick={() => handleNavigate(item.href)}
            aria-label={`Ir para ${item.label}`}
          >
            {item.icon ? <ListItemIcon>{item.icon}</ListItemIcon> : null}
            <ListItemText primary={item.label} primaryTypographyProps={{ variant: "body2", fontWeight: 600 }} />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ mx: 2, my: 2 }} />
      <Box sx={{ px: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Gerencie agendas, turmas e comunicação da escola em um só lugar.
        </Typography>
      </Box>
    </Drawer>
  );
}


