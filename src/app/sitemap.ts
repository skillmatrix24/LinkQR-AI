
import { MetadataRoute } from 'next';
import { initializeFirebase } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

/**
 * Dynamically generates a sitemap for Google Search Console.
 * Now crawls Firestore to include all published blog posts for maximum SEO impact.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://linkqr.in';
  
  // 1. Static Core Routes
  const staticRoutes = [
    '',
    '/features',
    '/pricing',
    '/about',
    '/contact',
    '/faq',
    '/terms',
    '/privacy',
    '/login',
    '/signup',
    '/blog',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Dynamic Blog Routes
  let blogRoutes: any[] = [];
  try {
    const { firestore } = initializeFirebase();
    if (firestore) {
      const q = query(collection(firestore, "blogPosts"), where("status", "==", "published"));
      const snap = await getDocs(q);
      blogRoutes = snap.docs.map(doc => {
        const data = doc.data();
        return {
          url: `${baseUrl}/blog/${data.slug}`,
          lastModified: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        };
      });
    }
  } catch (e) {
    console.error("Sitemap generation error:", e);
  }

  return [...staticRoutes, ...blogRoutes];
}
