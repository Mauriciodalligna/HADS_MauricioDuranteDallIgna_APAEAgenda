"use client";

import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import SchoolIcon from "@mui/icons-material/School";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import CampaignIcon from "@mui/icons-material/Campaign";
import { useRouter, usePathname } from "next/navigation";

const drawerWidth = 240;

const links = [
  { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon aria-hidden /> },
  { label: "Alunos", href: "/alunos", icon: <SchoolIcon aria-hidden /> },
  { label: "Profissionais", href: "/profissionais", icon: <AssignmentIndIcon aria-hidden /> },
  { label: "Agendamentos", href: "/agendamentos", icon: <EventNoteIcon aria-hidden /> },
  { label: "Mural de Avisos", href: "/mural", icon: <CampaignIcon aria-hidden /> },
  { label: "Usuários", href: "/usuarios", icon: <GroupIcon aria-hidden /> },
];

export default function Sidebar({ open = true, onClose }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <Drawer
      variant="permanent"
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
      }}
   >
      <List>
        {links.map((item) => (
          <ListItemButton key={item.href} selected={pathname?.startsWith(item.href)} onClick={() => router.push(item.href)} aria-label={`Ir para ${item.label}`}>
            {item.icon ? <ListItemIcon>{item.icon}</ListItemIcon> : null}
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
    </Drawer>
  );
}


