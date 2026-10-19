import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'StreetCraft — Growth Engine for Physical Businesses',
    short_name: 'StreetCraft',
    description: 'Turn one business opportunity into everything customers need to see across Google, Instagram, WhatsApp, and in-store print.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAFAF8',
    theme_color: '#1C1B19',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
