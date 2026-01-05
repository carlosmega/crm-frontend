import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SidebarProviderWrapper } from "@/components/providers/sidebar-provider-wrapper";
import { QueryProvider } from "@/components/providers/query-provider";
import { SettingsProvider } from "@/core/providers/settings-provider";
import { ThemeProvider } from "@/core/providers/theme-provider";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import "@/lib/reset-storage"; // Import reset utility to make it available globally
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRM Sales - Dynamics 365",
  description: "Sistema CRM para gestión del ciclo completo de ventas basado en Microsoft Dynamics 365 Sales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply theme IMMEDIATELY before React hydrates - prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('crm-user-settings');
                  if (stored) {
                    const data = JSON.parse(stored);
                    let theme = data.settings?.theme || 'dark'; // Default to dark

                    // Resolve 'system' theme
                    if (theme === 'system') {
                      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    }

                    // Apply dark class immediately if needed
                    if (theme === 'dark') {
                      document.documentElement.classList.add('dark');
                    }
                  } else {
                    // No settings stored - apply default (dark)
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {
                  // If error, apply default dark theme
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <SettingsProvider>
            <ThemeProvider>
              <QueryProvider>
                <SidebarProviderWrapper>
                  {children}
                </SidebarProviderWrapper>
              </QueryProvider>
            </ThemeProvider>
          </SettingsProvider>
        </SessionProvider>
        <Toaster />
        <Sonner />
      </body>
    </html>
  );
}
