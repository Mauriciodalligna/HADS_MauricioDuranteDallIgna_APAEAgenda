"use client";

import TextField from "@mui/material/TextField";

export default function FormInput({ fullWidth = true, margin = "normal", ...props }) {
  return <TextField fullWidth={fullWidth} margin={margin} {...props} />;
}


