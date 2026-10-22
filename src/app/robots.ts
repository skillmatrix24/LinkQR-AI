import { MetadataRoute } from 'next'

/**
 * Configures the robots.txt file to guide search engine crawlers.
 * We allow indexing for all public pages but hide the dashboard and admin areas.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/admin/',
        '/api/',
        '/_next/',
      ],
    },
    sitemap: 'https://linkqr.in/sitemap.xml',
  }
}
