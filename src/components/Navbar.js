"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import SchoolIcon from "@mui/icons-material/School";

export default function Navbar({ title = "APAE Agenda", onMenuClick, right, ...props }) {
  return (
    <AppBar position="static" color="primary" {...props}>
      <Toolbar>
        {onMenuClick ? (
          <IconButton edge="start" color="inherit" aria-label="abrir menu" onClick={onMenuClick} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
        ) : null}
        <SchoolIcon sx={{ mr: 1 }} aria-hidden />
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }} aria-label="Título da aplicação">
          {title}
        </Typography>
        {right}
      </Toolbar>
    </AppBar>
  );
}


