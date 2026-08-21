import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ImobSystem — Gestão Imobiliária",
  description: "Sistema de gestão para imobiliárias.",
};

/*
 * Script anti-flash (FOUC): roda ANTES da primeira pintura e aplica a classe
 * `.light` no <html> conforme a preferência salva (ou a do sistema). O tema
 * ESCURO é o padrão (valores direto em `:root`, sem precisar de classe) —
 * só adicionamos `.light` quando a preferência resolvida for o tema claro.
 * Sem isso, a página piscaria no tema errado por um instante antes do React
 * hidratar.
 */
const themeInitScript = `
(function () {
  try {
    var saved = localStorage.getItem('imob:theme');
    var light = saved ? saved === 'light'
      : !window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (light) document.documentElement.classList.add('light');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      // O script acima muda a classe no cliente antes da hidratação; isso evita
      // o aviso de mismatch de hidratação do Next.
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Providers globais: tema + sessão/login/logout. */}
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
