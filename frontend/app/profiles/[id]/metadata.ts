import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ekgahoi.vercel.app';
const siteName = 'ekGahoi';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // In a real implementation, you would fetch the user data here
  // For now, we'll use default values
  const profileId = params.id;
  
  // TODO: Fetch user data from API
  // const user = await getUserById(profileId);
  
  const title = `Profile | ${siteName}`;
  const description = `View profile on ${siteName} - Your trusted matrimonial platform`;
  const image = `${siteUrl}/api/og/profile/${profileId}`; // API route for dynamic OG images
  
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

