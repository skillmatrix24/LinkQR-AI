'use client';

import React, { useEffect, useState } from 'react';
import { 
  Loader2, 
  Phone, 
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlockRenderer } from '@/components/microsite/BlockRenderer';

const THEME_PRESETS: Record<string, any> = {
  light: { bg: 'bg-white', text: 'text-neutral-900' },
  dark: { bg: 'bg-[#0a0a0a]', text: 'text-white' },
  glass: { bg: 'bg-neutral-50/50 backdrop-blur-xl', text: 'text-neutral-900' },
  vibrant: { bg: 'bg-primary/5', text: 'text-neutral-900' }
};

export default function PreviewPage() {
  const [site, setSite] = useState<any>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'MICROSITE_PREVIEW_DATA') {
        setSite(event.data.data);
      }
    };
    window.addEventListener('message', handleMessage);
    if (window.parent) window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSectionClick = (sectionId: string) => {
    if (window.parent) {
      window.parent.postMessage({ type: 'PREVIEW_SECTION_CLICKED', sectionId }, '*');
    }
  };

  if (!site) return (
    <div className="h-screen w-full flex items-center justify-center bg-white p-10">
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Synchronizing Preview Hub...</p>
      </div>
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

    let icon = null;
    if (type === 'whatsapp') {
      icon = <img src="https://cdn.simpleicons.org/whatsapp/ffffff" className="w-6 h-6 sm:w-8 sm:h-8" alt="WA" />;
    } else if (type === 'phone') {
      icon = <Phone className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />;
    } else {
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
        <div 
          className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("h-screen w-full flex flex-col items-center overflow-y-auto overflow-x-hidden", themePreset.bg, themePreset.text, site.fontType || 'font-body')}>
      <style dangerouslySetInnerHTML={{ __html: `
        .preview-section { position: relative; cursor: pointer; transition: all 0.2s ease; border: 2px solid transparent; }
        .preview-section:hover { border: 2px dashed ${themeColor}50; background: ${themeColor}05; }
        .preview-section::after { 
          content: 'Edit Block'; position: absolute; top: 4px; right: 4px; 
          background: ${themeColor}; color: white; font-size: 8px; font-weight: 900; 
          text-transform: uppercase; padding: 2px 8px; border-radius: 4px; 
          opacity: 0; transition: opacity 0.2s ease; z-index: 50; pointer-events: none; 
        }
        .preview-section:hover::after { opacity: 1; }
        .glow-node:hover { box-shadow: 0 0 30px var(--glow-color) !important; }
        
        .site-logo { height: ${site.logoHeightMobile || 28}px; width: auto; object-fit: contain; }
        @media (min-width: 1024px) {
          .site-logo { height: ${site.logoHeight || 32}px; }
        }
      `}} />
      
      <div className="w-full flex-1 relative flex flex-col min-h-full" style={{ backgroundColor: site.bgColor }}>
        <header className={cn("sticky top-0 z-[200] border-b p-4 sm:p-6 flex items-center justify-between backdrop-blur-xl bg-inherit/90", site.headerSticky === false && "relative")}>
           <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
              <div>{site.logoUrl ? <img src={site.logoUrl} className="site-logo" alt="Logo" /> : <span className="font-black text-xl uppercase tracking-tighter">{site.businessName || "Smart Page"}</span>}</div>
              
              <div className="flex items-center gap-6">
                <nav className="hidden md:flex items-center gap-6">
                   {site.navLinks?.map((link: any, i: number) => (
                     <div key={i} className="text-xs font-black uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-primary transition-all cursor-pointer">{link.label}</div>
                   ))}
                </nav>

                {site.headerCtaEnabled && (
                  <div 
                    className="flex items-center justify-center font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer" 
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
                  </div>
                )}
              </div>
           </div>
        </header>

        <main className="flex-1 flex flex-col w-full pb-20">
           <BlockRenderer site={site} isPreview onSectionClick={handleSectionClick} />
        </main>
        {renderFAB()}
      </div>
    </div>
  );
}
