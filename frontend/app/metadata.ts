import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ekgahoi.vercel.app';
const siteName = 'ekGahoi';

export const homeMetadata: Metadata = {
  title: `${siteName} - Your Trusted Matrimonial Platform`,
  description: 'Find your perfect match in the Gahoi community. Trusted matrimonial platform for marriage matching, profile search, and community connections. Join thousands of verified profiles.',
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
    'gahoi matrimonial',
    'gahoi shaadi',
    'gahoi marriage',
  ],
  openGraph: {
    title: `${siteName} - Your Trusted Matrimonial Platform`,
    description: 'Find your perfect match in the Gahoi community. Trusted matrimonial platform for marriage matching, profile search, and community connections.',
    url: siteUrl,
    siteName: siteName,
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'hi_IN',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'ekGahoi - Matrimonial Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} - Your Trusted Matrimonial Platform`,
    description: 'Find your perfect match in the Gahoi community. Trusted matrimonial platform for marriage matching.',
    images: [`${siteUrl}/og-image.jpg`],
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'en': siteUrl,
      'hi': `${siteUrl}/hi`,
    },
  },
};

export const profilesMetadata: Metadata = {
  title: `Browse Profiles - ${siteName}`,
  description: 'Browse verified matrimonial profiles in the Gahoi community. Search by age, location, education, occupation, and more. Find your perfect match today.',
  openGraph: {
    title: `Browse Profiles - ${siteName}`,
    description: 'Browse verified matrimonial profiles in the Gahoi community. Search by age, location, education, occupation, and more.',
    url: `${siteUrl}/profiles`,
    type: 'website',
  },
  alternates: {
    canonical: `${siteUrl}/profiles`,
  },
};

export const loginMetadata: Metadata = {
  title: `Login - ${siteName}`,
  description: 'Login to your ekGahoi account to access your profile, search matches, send interests, and connect with the community.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${siteUrl}/login`,
  },
};

export const registerMetadata: Metadata = {
  title: `Register - ${siteName}`,
  description: 'Create your free matrimonial profile on ekGahoi. Join the Gahoi community and start your journey to find your perfect match.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${siteUrl}/register`,
  },
};

export const aboutMetadata: Metadata = {
  title: `About Us - ${siteName}`,
  description: 'Learn about ekGahoi - a trusted matrimonial platform dedicated to helping the Gahoi community find meaningful connections and life partners.',
  openGraph: {
    title: `About Us - ${siteName}`,
    description: 'Learn about ekGahoi - a trusted matrimonial platform dedicated to helping the Gahoi community.',
    url: `${siteUrl}/about`,
    type: 'website',
  },
  alternates: {
    canonical: `${siteUrl}/about`,
  },
};

