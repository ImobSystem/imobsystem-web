import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ImobSystem — Gestão Imobiliária",
  description: "Sistema de gestão para imobiliárias.",
};

/*
 * Script anti-flash (FOUC): roda ANTES da primeira pintura e aplica a classe
 * `.dark` no <html> conforme a preferência salva (ou a do sistema). Sem isso,
 * a página apareceria clara por um instante antes do React hidratar o tema.
 */
const themeInitScript = `
(function () {
  try {
    var saved = localStorage.getItem('imob:theme');
    var dark = saved ? saved === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (dark) document.documentElement.classList.add('dark');
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
