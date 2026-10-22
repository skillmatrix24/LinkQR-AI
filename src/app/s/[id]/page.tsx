"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useFirestore } from '@/firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  limit
} from 'firebase/firestore';
import { 
  Loader2, 
  Phone, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BlockRenderer } from '@/components/microsite/BlockRenderer';

const THEME_PRESETS: Record<string, any> = {
  light: { bg: 'bg-white', text: 'text-neutral-900' },
  dark: { bg: 'bg-[#0a0a0a]', text: 'text-white' },
  glass: { bg: 'bg-neutral-50/50 backdrop-blur-xl', text: 'text-neutral-900' },
  vibrant: { bg: 'bg-primary/5', text: 'text-neutral-900' }
};

export default function SmartPage() {
  const params = useParams();
  const idOrSlug = params.id as string;
  const db = useFirestore();
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    async function fetchSite() {
      if (!db || !idOrSlug) return;
      try {
        let resolved = null;
        const regRef = doc(db, "publicSmartPages", idOrSlug);
        const regSnap = await getDoc(regRef);
        
        if (regSnap.exists()) {
           resolved = regSnap.data();
        } else {
           // Fallback to slug search in registry
           const q = query(collection(db, "publicSmartPages"), where("slug", "==", idOrSlug), limit(1));
           const qs = await getDocs(q);
           if (!qs.empty) resolved = qs.docs[0].data();
        }

        if (resolved) {
          // 1. Fetch Owner Profile for Expiry Check
          const userRef = doc(db, "users", resolved.userId);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const isAdmin = userData.isAdmin === true || userData.email === 'admin@test.com' || userData.email === 'skillmatrix24@gmail.com';
            
            if (userData.planExpiryDate && !isAdmin) {
              const expiry = userData.planExpiryDate.toDate ? userData.planExpiryDate.toDate() : new Date(userData.planExpiryDate);
              if (expiry < new Date()) {
                setIsExpired(true);
                setLoading(false);
                return;
              }
            }
          }

          // 2. Fetch Site Content (Supports both collection nodes)
          const collectionName = resolved.collectionName || (resolved.type === 'vcard' ? 'digitalIDs' : 'microsites');
          const sRef = doc(db, "users", resolved.userId, collectionName, resolved.micrositeId);
          const sSnap = await getDoc(sRef);
          if (sSnap.exists()) {
            setSite({ ...sSnap.data(), _userId: resolved.userId });
          } else if (!resolved.collectionName) {
            // Last ditch fallback to other collection if hint was missing
            const otherColl = collectionName === 'microsites' ? 'digitalIDs' : 'microsites';
            const sRefAlt = doc(db, "users", resolved.userId, otherColl, resolved.micrositeId);
            const sSnapAlt = await getDoc(sRefAlt);
            if (sSnapAlt.exists()) {
               setSite({ ...sSnapAlt.data(), _userId: resolved.userId });
            }
          }
        }
      } catch (err) {
        console.error("Error loading smart page:", err);
      } finally { 
        setLoading(false); 
      }
    }
    fetchSite();
  }, [db, idOrSlug]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Initializing Smart Node...</p>
    </div>
  );

  if (isExpired) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2EFF7] p-6 text-center">
        <div className="bg-white p-10 sm:p-16 rounded-[3rem] shadow-2xl border border-red-100 flex flex-col items-center gap-8 max-w-md w-full">
           <div className="h-24 w-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-inner border-4 border-white">
              <Clock className="h-10 w-10" />
           </div>
           <div className="space-y-2">
              <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Service Suspended</h1>
              <p className="text-muted-foreground font-medium leading-relaxed italic">
                This smart page belongs to an account whose subscription has expired.
              </p>
           </div>
           <div className="w-full h-px bg-neutral-100" />
           <p className="text-[10px] font-bold text-red-400 uppercase tracking-[0.3em]">Code: SUBSCRIPTION_TERMINATED</p>
           <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-2" asChild>
              <Link to="/">Back to Home</Link>
           </Button>
        </div>
      </div>
    );
  }

  if (!site) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center gap-6">
      <div className="h-20 w-20 bg-neutral-100 rounded-full flex items-center justify-center"><AlertCircle className="h-10 w-10 text-muted-foreground" /></div>
      <h1 className="text-2xl font-black">Node Not Found</h1>
      <Button asChild className="rounded-xl px-8 h-12 font-bold"><Link to="/">Return to Home</Link></Button>
    </div>
  );

  const themeColor = site.themeColor || '#6750A4';
  const themePreset = THEME_PRESETS[site.themeVariant] || THEME_PRESETS.light;
  const cardRadius = site.cardRadius || 32;

  const renderFAB = () => {
    if (!site.floatingActionEnabled) return null;
    const type = site.floatingActionType;
    const val = site.floatingActionValue;
    const color = site.floatingActionColor || themeColor;
    const pulse = site.floatingActionPulse !== false;

    let href = "";
    let icon = null;

    if (type === 'whatsapp') {
      href = `https://wa.me/${val?.replace(/\D/g, '')}`;
      icon = <img src="https://cdn.simpleicons.org/whatsapp/ffffff" className="w-6 h-6 sm:w-8 sm:h-8" alt="WA" />;
    } else if (type === 'phone') {
      href = `tel:${val}`;
      icon = <Phone className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />;
    } else {
      href = val?.startsWith('http') ? val : `https://${val}`;
      icon = <ExternalLink className="w-6 h-6 sm:w-8 sm:h-8" />;
    }

    return (
      <div className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-[999] flex items-center justify-center">
        {pulse && (
          <>
            <div className="absolute inset-0 rounded-full animate-ping opacity-25" style={{ backgroundColor: color }}></div>
            <div className="absolute -inset-3 rounded-full animate-pulse opacity-10" style={{ backgroundColor: color }}></div>
          </>
        )}
        <a 
          to={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className="relative h-14 w-14 sm:h-18 sm:w-18 rounded-full flex items-center justify-center text-white shadow-2xl transition-transform hover:scale-110 active:scale-95"
          style={{ backgroundColor: color, height: '64px', width: '64px' }}
        >
          {icon}
        </a>
      </div>
    );
  };

  return (
    <div className={cn("min-h-screen flex flex-col items-center w-full", themePreset.bg, themePreset.text, site.fontType || 'font-body')}>
      <style dangerouslySetInnerHTML={{ __html: `
        .site-logo { height: ${site.logoHeightMobile || 28}px; width: auto; object-fit: contain; }
        @media (min-width: 1024px) {
          .site-logo { height: ${site.logoHeight || 32}px; }
        }
      `}} />
      
      <div className="w-full flex-1 flex flex-col" style={{ backgroundColor: site.bgColor }}>
        <header className={cn("sticky top-0 z-[200] border-b p-4 sm:p-6 backdrop-blur-xl bg-inherit/90", site.headerSticky === false && "relative")}>
           <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
              <div>{site.logoUrl ? <img src={site.logoUrl} className="site-logo" alt="Logo" /> : <span className="font-black text-xl uppercase tracking-tighter">{site.businessName || "Smart Page"}</span>}</div>
              
              <div className="flex items-center gap-6">
                <nav className="hidden md:flex items-center gap-6">
                   {site.navLinks?.map((link: any, i: number) => (
                     <a key={i} to={link.url} className="text-xs font-black uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-primary transition-all">{link.label}</a>
                   ))}
                </nav>

                {site.headerCtaEnabled && (
                  <a 
                    to={site.headerCtaUrl || "#"} 
                    target={site.headerCtaUrl?.startsWith('http') ? "_blank" : undefined}
                    className="flex items-center justify-center font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap" 
                    style={{ 
                      backgroundColor: site.headerCtaBgColor || themeColor, 
                      color: site.headerCtaTextColor || '#ffffff',
                      borderRadius: `${site.headerCtaRadius ?? (cardRadius / 2)}px`,
                      paddingLeft: `${site.headerCtaPaddingX ?? 24}px`,
                      paddingRight: `${site.headerCtaPaddingX ?? 24}px`,
                      fontSize: `${site.headerCtaFontSize ?? 12}px`,
                      height: '40px'
                    }}
                  >
                    {site.headerCtaText}
                  </a>
                )}
              </div>
           </div>
        </header>

        <main className="flex-1 flex flex-col w-full">
           <BlockRenderer site={site} />
        </main>
        {renderFAB()}
      </div>
    </div>
  );
}
