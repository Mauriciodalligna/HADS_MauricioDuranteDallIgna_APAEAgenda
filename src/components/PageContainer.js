"use client";

import Box from "@mui/material/Box";

export default function PageContainer({ children, maxWidth = 1200, sx, innerSx, ...props }) {
  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "background.default" }} {...props}>
      <Box sx={{ mx: "auto", maxWidth, p: { xs: 2, md: 3 }, ...innerSx }}>{children}</Box>
    </Box>
  );
}


