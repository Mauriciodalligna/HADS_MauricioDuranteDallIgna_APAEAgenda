export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>APAE Agenda</h1>
      <p>Bem-vindo ao sistema.</p>
      <ul>
        <li><a href="/api/health">/api/health</a></li>
        <li><a href="/api/db-check">/api/db-check</a></li>
      </ul>
    </main>
  );
}


