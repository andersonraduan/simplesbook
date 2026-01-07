import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/auth/session-provider";
import { AppNameProvider } from "@/components/app-name-provider";
import { prisma } from "@/lib/prisma";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  let appName = "SimplesBook";
  
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key: "APP_NAME" },
    });
    if (setting) {
      appName = setting.value;
    }
  } catch (error) {
    console.error("Erro ao buscar nome da aplicação:", error);
  }

  return {
    title: `${appName} - Sistema de Agendamento`,
    description: "Sistema de agendamento com autenticação e roles",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initialAppName = "SimplesBook";
  
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key: "APP_NAME" },
    });
    if (setting) {
      initialAppName = setting.value;
    }
  } catch (error) {
    console.error("Erro ao buscar nome da aplicação:", error);
  }

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Por padrão é light, só ativa dark se estiver explicitamente salvo
                  if (localStorage.theme === 'dark') {
                    document.documentElement.classList.add('dark')
                  } else {
                    document.documentElement.classList.remove('dark')
                    // Se não houver tema salvo, define light como padrão
                    if (!localStorage.theme) {
                      localStorage.setItem('theme', 'light')
                    }
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider>
          <AppNameProvider initialAppName={initialAppName}>
            {children}
          </AppNameProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
