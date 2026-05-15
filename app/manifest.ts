import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Flowpath',
    short_name: 'Flowpath',
    description: 'Track your job applications in one place',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#0FA878',
    background_color: '#ffffff',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
