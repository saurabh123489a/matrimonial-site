import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import WelcomeTour from "@/components/WelcomeTour";
import ProfileSetupWizard from "@/components/ProfileSetupWizard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ekGahoi - Complete Community Platform",
  description: "Gahoi community platform: Marriage matching, Census data, Family management, and Community news - Your complete community solution",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        <ThemeProvider>
          <LanguageProvider>
            <NotificationProvider>
              <Navbar />
              <main className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
                {children}
              </main>
              {/* Temporarily disabled to debug black page issue */}
              {/* <WelcomeTour /> */}
              {/* <ProfileSetupWizard /> */}
            </NotificationProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
