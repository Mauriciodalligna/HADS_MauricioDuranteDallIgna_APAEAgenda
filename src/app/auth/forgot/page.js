"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Informe seu e-mail.");
      return;
    }
    const res = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    // Mesmo em caso de e-mail inexistente retornamos OK (resposta neutra)
    if (!res.ok) {
      setError("Não foi possível processar sua solicitação.");
      return;
    }
    setDone(true);
  }

  return (
    <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center", p: 2 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", maxWidth: 420, p: 4, border: "1px solid #e0e0e0", borderRadius: 2, backgroundColor: "#fff" }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
          Recuperar senha
        </Typography>
        {done ? (
          <Alert severity="success">Se existir, enviaremos o link para seu e-mail.</Alert>
        ) : (
          <>
            {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
            <TextField label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required sx={{ mb: 2 }} />
            <Button type="submit" variant="contained" fullWidth>Enviar</Button>
          </>
        )}
      </Box>
    </Box>
  );
}


