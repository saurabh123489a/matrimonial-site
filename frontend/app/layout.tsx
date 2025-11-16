import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ProfileActionProvider } from "@/contexts/ProfileActionContext";
import WelcomeTour from "@/components/WelcomeTour";
import ProfileSetupWizard from "@/components/ProfileSetupWizard";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import BottomActionBar from "@/components/BottomActionBar";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ekgahoi.com';
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-primary transition-colors`}
      >
        {/* Google Analytics - Using Next.js Script component */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_path: window.location.pathname,
                  });
              `}
            </Script>
          </>
        )}
        <ServiceWorkerRegistration />
        <LanguageProvider>
          <NotificationProvider>
            <ProfileActionProvider>
              <GoogleAnalytics />
              <Navbar />
              <main className="min-h-screen bg-white transition-colors pb-32 sm:pb-28 safe-area-bottom">
                {children}
              </main>
              <BottomActionBar />
              {/* Temporarily disabled to debug black page issue */}
              {/* <WelcomeTour /> */}
              {/* <ProfileSetupWizard /> */}
            </ProfileActionProvider>
          </NotificationProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
