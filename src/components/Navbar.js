"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import MenuIcon from "@mui/icons-material/Menu";
import SchoolIcon from "@mui/icons-material/School";
import LogoutIcon from "@mui/icons-material/Logout";
import Box from "@mui/material/Box";

export default function Navbar({ title = "APAE Agenda", onMenuClick, right, ...props }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Carregar dados do usuário do localStorage
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          // Ignorar erro de parsing
        }
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Chamar API de logout
      const token = localStorage.getItem('token');
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      // Limpar storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      }
      // Redirecionar para login
      router.push('/login');
    }
  };

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
        {user && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mr: 1 }}>
            <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" } }}>
              {user.nome}
            </Typography>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ textTransform: "none" }}
              aria-label="Sair"
            >
              Sair
            </Button>
          </Box>
        )}
        {right}
      </Toolbar>
    </AppBar>
  );
}


