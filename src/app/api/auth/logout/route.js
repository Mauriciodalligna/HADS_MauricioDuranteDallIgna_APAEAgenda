export async function POST() {
  // Logout stateless: cliente deve descartar o token JWT
  return Response.json({ ok: true, message: "Logout efetuado. Remova o token do cliente." });
}


