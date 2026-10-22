'use client';

import { useEffect } from 'react';
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

/**
 * Utility component to dynamically update the site's favicon based on database configuration.
 * Placed in RootLayout to ensure global application.
 */
export function DynamicBranding() {
  const db = useFirestore();
  const siteConfigRef = useMemoFirebase(() => db ? doc(db, "config", "site") : null, [db]);
  const { data: siteConfig } = useDoc(siteConfigRef);

  useEffect(() => {
    if (siteConfig?.faviconUrl) {
      const link = (document.querySelector("link[rel*='icon']") as HTMLLinkElement) || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = siteConfig.faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [siteConfig]);

  return null;
}
