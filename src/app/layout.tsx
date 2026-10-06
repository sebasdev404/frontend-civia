import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.scss";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Sidebar } from "@/components/ui/Sidebar";
import { TopBar } from "@/components/ui/TopBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CIVIA",
  description: "Citizen Voice and Intelligence Analytics",
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
          <div className="app-shell" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', width: '100vw', minHeight: '100vh', overflowX: 'hidden' }}>
            <Sidebar />
            <div className="app-main-container" style={{ width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <TopBar />
              <main className="app-main" style={{ width: '100%', minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

