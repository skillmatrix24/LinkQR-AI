
import { MetadataRoute } from 'next'

/**
 * PWA Manifest Configuration.
 * Allows users to install LinkQR AI as a mobile app.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LinkQR AI - Smart QR Ecosystem',
    short_name: 'LinkQR',
    description: 'Enterprise-grade AI-powered dynamic QR codes and Smart Pages.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#F2EFF7',
    theme_color: '#6750A4',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
