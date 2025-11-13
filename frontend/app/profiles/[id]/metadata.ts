import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https:
const siteName = 'ekGahoi';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  
  
  const profileId = params.id;
  
  
  
  
  const title = `Profile | ${siteName}`;
  const description = `View profile on ${siteName} - Your trusted matrimonial platform`;
  const image = `${siteUrl}/api/og/profile/${profileId}`; 
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/profiles/${profileId}`,
      siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: `${siteUrl}/profiles/${profileId}`,
    },
  };
}

