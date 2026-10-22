import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import Script from 'next/script';
import { DynamicBranding } from '@/components/DynamicBranding';
import { TrafficTracker } from '@/components/TrafficTracker';
import { ChatBot } from '@/components/ChatBot';
import { getAdminDb } from '@/lib/firebase-admin';

/**
 * Global Metadata for Google indexing.
 */
export async function generateMetadata(): Promise<Metadata> {
  let dbMeta = {
    title: 'LinkQR AI | Best Dynamic & AI QR Code Generator with Analytics',
    description: 'Deploy branded, trackable, and intelligent dynamic QR codes with Level 10 BI Analytics. Features include Digital ID Cards, Bulk QR generation, AI Magic Studio, and advanced Fraud Shield.',
    keywords: ['dynamic qr code', 'qr code generator', 'trackable qr codes', 'ai qr code', 'bulk qr generator', 'qr code analytics', 'bot filter qr', 'branded qr codes', 'saas qr india', 'marketing automation qr', 'digital id cards', 'digital business cards', 'digital business card india']
  };

  try {
    const db = getAdminDb();
    if (db) {
      const config = await db.collection("config").doc("site").get();
      if (config.exists) {
        const data = config.data();
        if (data?.businessName) dbMeta.title = `${data.businessName} | Dynamic & AI QR Generator`;
        if (data?.metaDescription) dbMeta.description = data.metaDescription;
        if (data?.seoKeywords) dbMeta.keywords = data.seoKeywords.split(',').map((k: string) => k.trim());
      }
    }
  } catch (e) {
    console.warn("Metadata Sync Node: Offline or config missing. Using default presets.");
  }

  return {
    metadataBase: new URL('https://linkqr.in'),
    title: {
      default: dbMeta.title,
      template: `%s | ${dbMeta.title.split('|')[0].trim()}`
    },
    description: dbMeta.description,
    keywords: dbMeta.keywords,
    authors: [{ name: 'LinkQR AI Team' }],
    creator: 'LinkQR AI Global',
    publisher: 'LinkQR AI Infrastructure',
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: dbMeta.title,
      description: dbMeta.description,
      url: 'https://linkqr.in',
      siteName: 'LinkQR AI',
      locale: 'en_IN',
      type: 'website',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'LinkQR AI Dashboard' }]
    },
    twitter: {
      card: 'summary_large_image',
      title: dbMeta.title,
      description: dbMeta.description,
      creator: '@linkqrai',
    },
    robots: {
      index: true,
      follow: true,
    }
  };
}

export const viewport: Viewport = {
  themeColor: '#6750A4',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "LinkQR AI",
    "operatingSystem": "All",
    "applicationCategory": "BusinessApplication",
    "description": "Enterprise-grade AI-powered dynamic QR code generator with real-time BI analytics and bot filtering.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "1250"
    },
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD"
    }
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" to="https://fonts.googleapis.com" />
        <link rel="preconnect" to="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link to="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Mukta:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,700;1,400&family=Roboto+Mono:wght@400;700&family=Playfair+Display:wght@700;900&family=Montserrat:wght@700;900&family=Poppins:wght@400;600;800&family=Ubuntu:wght@400;700&family=Lato:wght@400;700&family=Open+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased selection:bg-primary/20">
        <FirebaseClientProvider>
          <DynamicBranding />
          <TrafficTracker />
          {children}
          <Toaster />
          <ChatBot />
        </FirebaseClientProvider>
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
