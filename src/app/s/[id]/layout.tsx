
import { Metadata } from 'next';
import { getAdminDb } from '@/lib/firebase-admin';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = params;
  const db = getAdminDb();
  if (!db) return {};

  try {
    const regRef = db.collection("publicSmartPages").doc(id);
    const regSnap = await regRef.get();
    let resolved = regSnap.exists ? regSnap.data() : null;

    if (!resolved) {
      const q = await db.collection("publicSmartPages").where("slug", "==", id).limit(1).get();
      if (!q.empty) resolved = q.docs[0].data();
    }

    if (resolved) {
      const collectionName = resolved.collectionName || (resolved.type === 'vcard' ? 'digitalIDs' : 'microsites');
      const sRef = db.collection("users").doc(resolved.userId).collection(collectionName).doc(resolved.micrositeId);
      const sSnap = await sRef.get();
      
      if (sSnap.exists) {
        const site = sSnap.data();
        const title = site?.fullName || site?.businessName || "Smart Identity Node";
        const description = site?.tagline || site?.introduction || "Professional Digital Business Card powered by LinkQR AI.";
        const photo = site?.photoUrl || site?.heroImage || site?.sections?.find((s:any) => s.type === 'vcard')?.data?.photoUrl;

        return {
          title,
          description,
          openGraph: {
            title,
            description,
            images: photo ? [{ url: photo }] : [],
            type: 'website',
          },
          twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: photo ? [photo] : [],
          }
        };
      }
    }
  } catch (e) {
    console.error("Metadata Generation Error:", e);
  }

  return { title: "Digital ID | LinkQR AI" };
}

export default function SmartPageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
