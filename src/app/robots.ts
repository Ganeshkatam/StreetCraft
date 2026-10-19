import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://streetcraft.tomesphere.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/free-tool',
          '/pricing',
          '/how-it-works',
          '/solutions',
          '/touchpoints',
          '/contact',
          '/login',
          '/signup',
          '/terms',
          '/privacy',
        ],
        disallow: [
          '/api/',
          '/user/',
          '/setup/',
          '/auth/',
          '/checkout/',
          '/new/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
