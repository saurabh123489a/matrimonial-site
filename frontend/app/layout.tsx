import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import WelcomeTour from "@/components/WelcomeTour";
import ProfileSetupWizard from "@/components/ProfileSetupWizard";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ekgahoi.vercel.app';
const siteName = 'ekGahoi';
const defaultDescription = 'Your trusted matrimonial platform - Find your perfect match in the Gahoi community. Marriage matching, profile search, and community connections.';
const defaultImage = `${siteUrl}/og-image.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - Your Trusted Matrimonial Platform`,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: [
    'matrimonial',
    'marriage',
    'matchmaking',
    'gahoi community',
    'wedding',
    'matrimony',
    'bride',
    'groom',
    'marriage bureau',
    'shaadi',
    'vivah',
  ],
  authors: [{ name: 'ekGahoi Team' }],
  creator: 'ekGahoi',
  publisher: 'ekGahoi',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: siteName,
    title: `${siteName} - Your Trusted Matrimonial Platform`,
    description: defaultDescription,
    images: [
      {
        url: defaultImage,
        width: 1200,
        height: 630,
        alt: 'ekGahoi - Matrimonial Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} - Your Trusted Matrimonial Platform`,
    description: defaultDescription,
    images: [defaultImage],
    creator: '@ekgahoi',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: '#FFF8F0', color: '#374151' }}
      >
        <ThemeProvider>
          <LanguageProvider>
            <NotificationProvider>
              <GoogleAnalytics />
              <Navbar />
              <main className="min-h-screen transition-colors" style={{ backgroundColor: '#FFF8F0' }}>
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
