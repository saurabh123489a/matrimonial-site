import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ekgahoi.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/profile/',
          '/messages/',
          '/notifications/',
          '/interests/',
          '/profile-views/',
          '/settings/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/profile/',
          '/messages/',
          '/notifications/',
          '/interests/',
          '/profile-views/',
          '/settings/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

