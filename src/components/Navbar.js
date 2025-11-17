"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ButtonBase from "@mui/material/ButtonBase";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import Tooltip from "@mui/material/Tooltip";
import MenuIcon from "@mui/icons-material/Menu";
import SchoolIcon from "@mui/icons-material/School";
import LogoutIcon from "@mui/icons-material/Logout";

function getInitials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const perfilLabels = {
  admin: "Administrador",
  gestor: "Gestor",
  profissional: "Profissional",
};

export default function Navbar({ title = "APAE Agenda", onMenuClick, right, ...props }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // ignore parse error
      }
    }
  }, []);

  const userInitials = useMemo(() => getInitials(user?.nome), [user?.nome]);
  const perfilLabel = perfilLabels[user?.perfil] ?? "Equipe escolar";

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
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
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      }
      router.push("/login");
    }
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      {...props}
      sx={{
        backdropFilter: "blur(12px)",
        backgroundColor: (theme) => theme.palette.background.paper + "cc",
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        ...props.sx,
      }}
    >
      <Toolbar sx={{ display: "flex", gap: 2, px: { xs: 2, lg: 3 } }}>
        {onMenuClick ? (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="abrir menu"
            onClick={onMenuClick}
            sx={{ display: { xs: "inline-flex", lg: "none" } }}
          >
            <MenuIcon />
          </IconButton>
        ) : null}
        <ButtonBase
          onClick={() => router.push("/dashboard")}
          sx={{ display: "flex", alignItems: "center", color: "inherit", textAlign: "left", gap: 1.5 }}
          aria-label="Ir para o dashboard"
        >
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: "primary.main",
              color: "primary.contrastText",
            }}
          >
            <SchoolIcon fontSize="small" aria-hidden />
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Portal Escolar
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1 }}>
              {title}
            </Typography>
          </Box>
        </ButtonBase>
        <Box sx={{ flexGrow: 1 }} />
        {right}
        {user && (
          <Fade in timeout={300}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Stack spacing={0.25} sx={{ textAlign: "right", display: { xs: "none", sm: "flex" } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {user.nome}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {perfilLabel}
                </Typography>
              </Stack>
              <Tooltip title={user.nome} arrow>
                <Avatar sx={{ width: 40, height: 40 }}>{userInitials}</Avatar>
              </Tooltip>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={<LogoutIcon fontSize="small" />}
                onClick={handleLogout}
                sx={{ display: { xs: "none", md: "inline-flex" } }}
                aria-label="Sair da aplicação"
              >
                Sair
              </Button>
              <IconButton
                color="inherit"
                onClick={handleLogout}
                aria-label="Sair da aplicação"
                sx={{ display: { xs: "inline-flex", md: "none" } }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Fade>
        )}
      </Toolbar>
    </AppBar>
  );
}


