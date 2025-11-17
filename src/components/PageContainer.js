"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

export default function PageContainer({
  children,
  maxWidth = 520,
  centered = true,
  background = "gradient",
  innerSx,
  ...props
}) {
  const backgroundStyles =
    background === "gradient"
      ? {
          bgcolor: "transparent",
          backgroundImage:
            "radial-gradient(circle at top, rgba(30, 136, 229, 0.15), transparent 55%), radial-gradient(circle at bottom, rgba(67, 160, 71, 0.12), transparent 45%)",
        }
      : { bgcolor: "background.default" };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        ...backgroundStyles,
      }}
      {...props}
    >
      <Container
        maxWidth={false}
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: centered ? "center" : "stretch",
          justifyContent: "center",
          px: { xs: 2, sm: 3 },
          py: { xs: 6, md: 8 },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth,
            backdropFilter: background === "gradient" ? "blur(2px)" : "none",
            ...innerSx,
          }}
        >
          {children}
        </Box>
      </Container>
    </Box>
  );
}


