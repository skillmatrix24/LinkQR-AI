"use client";

import { Link } from "react-router-dom";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

/**
 * Global Footer component used across all public-facing pages.
 */
export function SiteFooter() {
  const db = useFirestore();
  const siteConfigRef = useMemoFirebase(() => db ? doc(db, "config", "site") : null, [db]);
  const { data: siteConfig } = useDoc(siteConfigRef);

  const businessName = siteConfig?.businessName || "LinkQR AI";

  return (
    <footer className="bg-white py-12 sm:py-16 border-t border-border/50 px-6 sm:px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 sm:gap-16">
        <div className="col-span-2 space-y-6 text-center md:text-left">
          <Link to="/" className="inline-flex md:flex items-center gap-2 mx-auto md:mx-0 min-h-[28px]">
            {siteConfig?.logoUrl ? (
              <img 
                src={siteConfig.logoUrl} 
                alt="Logo" 
                className="w-auto object-contain" 
                style={{ 
                  '--logo-h-mobile': `${siteConfig.logoHeightMobile || 24}px`, 
                  '--logo-h-desktop': `${siteConfig.logoHeight || 28}px` 
                } as any} 
                css-h-var="true" 
              />
            ) : (
              <span className="font-black text-xl uppercase tracking-tighter text-primary">{businessName}</span>
            )}
          </Link>
          <p className="max-w-xs mx-auto md:mx-0 text-sm sm:text-base text-muted-foreground font-normal leading-relaxed">
            The world's most sophisticated **Dynamic QR Generator** for modern brands and agencies. Operated by **{businessName}**.
          </p>
        </div>
        <div className="text-center md:text-left">
          <h4 className="font-black uppercase tracking-[2px] sm:tracking-[3px] text-[9px] sm:text-[10px] text-muted-foreground mb-6 sm:mb-8">Product Suite</h4>
          <nav className="space-y-4 sm:space-y-5 font-medium text-xs sm:text-sm text-foreground/80 flex flex-col">
            <Link to="/#magic" className="hover:text-primary transition-colors">AI Magic Studio</Link>
            <Link to="/dashboard/qrs/microsite" className="hover:text-primary transition-colors">Smart Pages</Link>
            <Link to="/dashboard/vcards" className="hover:text-primary transition-colors">Digital ID Cards</Link>
            <Link to="/features" className="hover:text-primary transition-colors">BI Bot Engine</Link>
            <Link to="/dashboard/qrs/bulk" className="hover:text-primary transition-colors">Bulk Generation</Link>
          </nav>
        </div>
        <div className="text-center md:text-left">
          <h4 className="font-black uppercase tracking-[2px] sm:tracking-[3px] text-[9px] sm:text-[10px] text-muted-foreground mb-6 sm:mb-8">Company</h4>
          <nav className="space-y-4 sm:space-y-5 font-medium text-xs sm:text-sm text-foreground/80 flex flex-col">
            <Link to="/about" className="hover:text-primary transition-colors">Our Vision</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </nav>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 sm:mt-20 pt-8 sm:pt-12 border-t border-border/50 flex flex-col md:flex-row justify-between gap-6 sm:gap-8 items-center text-center">
        <p className="font-medium text-xs sm:text-sm text-muted-foreground">© 2026 Powered By ❤️ <a to="https://skillmatrix.in" target="_blank" className="text-primary font-black hover:underline">Skill Matrix</a></p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest">
          <Link to="/contact" className="hover:text-primary">Support</Link>
          <Link to="/faq" className="hover:text-primary">FAQ</Link>
          <span className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div> Google Index Active</span>
        </div>
      </div>
    </footer>
  );
}
