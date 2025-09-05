export const metadata = {
  title: "APAE Agenda",
  description: "Sistema de agenda da APAE",
};

import Providers from "./providers";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


