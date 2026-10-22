"use client";

import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Global Header component used across all public-facing pages.
 */
export function SiteHeader() {
  const { pathname } = useLocation();
  const db = useFirestore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const siteConfigRef = useMemoFirebase(() => db ? doc(db, "config", "site") : null, [db]);
  const { data: siteConfig } = useDoc(siteConfigRef);

  const businessName = siteConfig?.businessName || "LinkQR AI";

  const navLinks = [
    { name: "Solutions", href: "/#smart-pages" },
    { name: "Digital ID", href: "/#digital-id" },
    { name: "Features", href: "/features" },
    { name: "AI Magic", href: "/#magic" },
    { name: "Pricing", href: "/pricing" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border/50">
      <style>{`
        img[css-h-var="true"] {
          height: var(--logo-h-mobile);
        }
        @media (min-width: 1024px) {
          img[css-h-var="true"] {
            height: var(--logo-h-desktop);
          }
        }
      `}</style>
      <div className="max-w-7xl mx-auto h-20 px-4 sm:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group shrink-0 min-h-[32px]">
          {siteConfig?.logoUrl ? (
            <img 
              src={siteConfig.logoUrl} 
              alt="Logo" 
              className="w-auto object-contain transition-transform group-hover:scale-105"
              style={{ 
                '--logo-h-mobile': `${siteConfig.logoHeightMobile || 28}px`,
                '--logo-h-desktop': `${siteConfig.logoHeight || 32}px`,
              } as any}
              css-h-var="true"
            />
          ) : (
            <span className="font-bold text-xl tracking-tighter text-primary">
              {businessName.includes(" ") ? (
                <>
                  {businessName.split(" ")[0]}
                  <span className="text-accent">{businessName.split(" ").slice(1).join(" ")}</span>
                </>
              ) : businessName}
            </span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 font-bold text-xs uppercase tracking-widest text-muted-foreground">
          {navLinks.map((link) => (
            link.href.startsWith("/#") ? (
              <a 
                key={link.name} 
                to={link.href} 
                className={cn(
                  "hover:text-primary transition-colors",
                  pathname === link.href && "text-primary"
                )}
              >
                {link.name}
              </a>
            ) : (
              <Link 
                key={link.name} 
                to={link.href} 
                className={cn(
                  "hover:text-primary transition-colors",
                  pathname === link.href && "text-primary"
                )}
              >
                {link.name}
              </Link>
            )
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link to="/login" className="hidden sm:inline-block text-xs font-bold uppercase tracking-widest text-foreground/80 hover:text-primary transition-colors">Login</Link>
          <Button className="rounded-full font-bold text-[10px] sm:text-xs px-4 sm:px-6 h-9 sm:h-10 shadow-xl shadow-primary/10" asChild>
            <Link to="/signup">✨ Free Trial</Link>
          </Button>
          
          {/* Mobile Menu Toggle */}
          <button className="lg:hidden p-2 text-muted-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 right-0 bg-white border-b border-border/50 p-6 flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300">
          {navLinks.map((link) => (
            link.href.startsWith("/#") ? (
              <a 
                key={link.name} 
                to={link.href} 
                className="text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ) : (
              <Link 
                key={link.name} 
                to={link.href} 
                className="text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            )
          ))}
          <div className="h-px w-full bg-neutral-100" />
          <Link to="/login" className="text-sm font-bold uppercase tracking-widest text-primary" onClick={() => setIsMobileMenuOpen(false)}>Login Account</Link>
        </div>
      )}
    </header>
  );
}