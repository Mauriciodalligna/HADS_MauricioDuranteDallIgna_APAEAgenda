"use client";

import Button from "@mui/material/Button";

export default function CustomButton({ children, variant = "contained", color = "primary", ...props }) {
  return (
    <Button variant={variant} color={color} {...props}>
      {children}
    </Button>
  );
}


