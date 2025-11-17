"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { isTokenExpired, getStoredToken, redirectToLogin } from "@/utils/token";

export default function AppShell({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checked, setChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  // Verifica autenticação ao montar o componente e ao recarregar a página
  useEffect(() => {
    const token = getStoredToken();
    
    // Se não há token, redireciona para login
    if (!token) {
      redirectToLogin(router);
      setAuthorized(false);
      setChecked(true);
      return;
    }

    // Se o token está expirado, redireciona para login
    if (isTokenExpired(token)) {
      redirectToLogin(router);
      setAuthorized(false);
      setChecked(true);
      return;
    }

    // Token válido
    setAuthorized(true);
    setChecked(true);
  }, [router]);

  // Monitora mudanças no storage (quando o token é removido em outra aba)
  useEffect(() => {
    function handleStorage(event) {
      if (event.key === "token" && !event.newValue) {
        setAuthorized(false);
        redirectToLogin(router);
      }
    }
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorage);
      }
    };
  }, [router]);

  // Verifica periodicamente se o token expirou (a cada 1 minuto)
  useEffect(() => {
    const interval = setInterval(() => {
      const token = getStoredToken();
      if (!token || isTokenExpired(token)) {
        setAuthorized(false);
        redirectToLogin(router);
      }
    }, 60000); // Verifica a cada 1 minuto

    return () => clearInterval(interval);
  }, [router]);

  if (!checked || !authorized) {
    return null;
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh", bgcolor: "background.default" }}>
      <Navbar onMenuClick={!isDesktop ? () => setSidebarOpen(true) : undefined} />
      <Sidebar
        variant={isDesktop ? "permanent" : "temporary"}
        open={isDesktop ? true : sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 2, sm: 3, xl: 5 },
          pt: { xs: 12, sm: 12, md: 14 },
          pb: { xs: 6, md: 8 },
          transition: (theme) => theme.transitions.create(["padding"], { duration: theme.transitions.duration.shorter }),
          width: "100%",
        }}
      >
        <Box
          sx={{
            mx: "auto",
            width: "100%",
            maxWidth: { lg: "1160px", xl: "1320px" },
            display: "flex",
            flexDirection: "column",
            gap: { xs: 3, md: 4 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}


