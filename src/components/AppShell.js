"use client";

import Box from "@mui/material/Box";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function AppShell({ children }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100dvh", bgcolor: "background.default" }}>
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Navbar />
      </Box>
      <Box sx={{ display: "flex", width: "100%", pt: { xs: 7, sm: 8 } }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}


