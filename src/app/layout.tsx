import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.scss";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { AppShell } from "@/components/ui/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CIVIA - Plataforma de Inteligencia Ciudadana",
  description: "Citizen Voice and Intelligence Analytics - Neiva, Huila",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning style={{ width: '100vw', minHeight: '100vh', margin: 0, padding: 0 }}>
      <body className={inter.className} suppressHydrationWarning style={{ width: '100vw', minHeight: '100vh', margin: 0, padding: 0, overflowX: 'hidden' }}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <AppShell>
              {children}
            </AppShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

