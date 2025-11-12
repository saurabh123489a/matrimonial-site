'use client';

import { useEffect } from 'react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ekgahoi.vercel.app';
const siteName = 'ekGahoi';

interface SEOStructuredDataProps {
  type?: 'home' | 'profile' | 'profiles' | 'about';
  profileData?: {
    name?: string;
    age?: number;
    location?: string;
    image?: string;
    gahoiId?: number;
  };
}

export default function SEOStructuredData({ type = 'home', profileData }: SEOStructuredDataProps) {
  useEffect(() => {
    let structuredData: any = {};

    // Organization Schema
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      description: 'Trusted matrimonial platform for the Gahoi community',
      sameAs: [
        // Add social media links when available
        // 'https://www.facebook.com/ekgahoi',
        // 'https://www.twitter.com/ekgahoi',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        email: 'support@ekgahoi.com',
      },
    };

    // Website Schema
    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: siteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/profiles?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    };

    // Breadcrumb Schema
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteUrl,
        },
      ],
    };

    // Profile Schema (if viewing a profile)
    if (type === 'profile' && profileData) {
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: profileData.name,
        age: profileData.age,
        address: {
          '@type': 'PostalAddress',
          addressLocality: profileData.location,
        },
        image: profileData.image,
        url: `${siteUrl}/profiles/${profileData.gahoiId || profileData.name}`,
      };

      // Add breadcrumb
      breadcrumbSchema.itemListElement.push({
        '@type': 'ListItem',
        position: 2,
        name: 'Profiles',
        item: `${siteUrl}/profiles`,
      });
      breadcrumbSchema.itemListElement.push({
        '@type': 'ListItem',
        position: 3,
        name: profileData.name || 'Profile',
        item: `${siteUrl}/profiles/${profileData.gahoiId || profileData.name}`,
      });
    } else if (type === 'profiles') {
      breadcrumbSchema.itemListElement.push({
        '@type': 'ListItem',
        position: 2,
        name: 'Browse Profiles',
        item: `${siteUrl}/profiles`,
      });
    } else if (type === 'about') {
      breadcrumbSchema.itemListElement.push({
        '@type': 'ListItem',
        position: 2,
        name: 'About Us',
        item: `${siteUrl}/about`,
      });
    }

    // FAQ Schema (for home page)
    if (type === 'home') {
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is ekGahoi?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'ekGahoi is a trusted matrimonial platform dedicated to helping the Gahoi community find meaningful connections and life partners. We provide verified profiles, advanced search filters, and a secure platform for matchmaking.',
            },
          },
          {
            '@type': 'Question',
            name: 'How do I create a profile?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Creating a profile on ekGahoi is free and easy. Simply click on "Register" and fill in your basic information. You can then complete your profile with photos, education details, family information, and more.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is ekGahoi free to use?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, ekGahoi offers free registration and profile creation. You can browse profiles, send interests, and connect with potential matches at no cost.',
            },
          },
          {
            '@type': 'Question',
            name: 'How do I search for profiles?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'You can search for profiles using various filters including age, location, education, occupation, and more. You can also search by Gahoi ID if you know the specific profile ID.',
            },
          },
        ],
      };

      // Inject all schemas
      injectSchema(organizationSchema);
      injectSchema(websiteSchema);
      injectSchema(breadcrumbSchema);
      injectSchema(faqSchema);
    } else {
      // Inject organization, website, and breadcrumb for other pages
      injectSchema(organizationSchema);
      injectSchema(websiteSchema);
      injectSchema(breadcrumbSchema);
      
      // Inject profile schema if available
      if (type === 'profile' && profileData) {
        injectSchema(structuredData);
      }
    }

    return () => {
      // Cleanup on unmount
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => {
        const data = JSON.parse(script.textContent || '{}');
        if (data['@type'] === 'Organization' || data['@type'] === 'WebSite' || 
            data['@type'] === 'BreadcrumbList' || data['@type'] === 'FAQPage' ||
            data['@type'] === 'Person') {
          script.remove();
        }
      });
    };
  }, [type, profileData]);

  return null;
}

function injectSchema(schema: any) {
  const scriptId = `schema-${schema['@type']?.toLowerCase() || 'unknown'}`;
  
  // Remove existing schema of same type
  const existing = document.getElementById(scriptId);
  if (existing) {
    existing.remove();
  }

  const script = document.createElement('script');
  script.id = scriptId;
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
}

