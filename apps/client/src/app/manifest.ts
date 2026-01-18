import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Royal Tens',
    short_name: 'Royal Tens',
    description: 'The Premium Multiplayer Card Game',
    start_url: '/',
    display: 'standalone',
    background_color: '#051f11',
    theme_color: '#051f11',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
    orientation: 'portrait-primary',
  };
}
