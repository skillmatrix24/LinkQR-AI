'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Copyright, Mail, Phone, MapPin } from 'lucide-react';

export function FooterBlock({ section, site, isPreview, onSectionClick }: any) {
  const sd = section.data || {};
  const cardRadius = site.cardRadius || 32;

  const alignment = sd.titleAlign || 'left';
  const layout = sd.footerLayout || 'matrix';
  const padding = sd.footerPadding || 80;
  
  const footerStyle: any = { 
    paddingTop: `${padding}px`, 
    paddingBottom: `${padding}px`,
    borderRadius: `${cardRadius}px`,
    position: 'relative',
    overflow: 'hidden'
  };
  
  if (sd.footerSectionBgType === 'gradient') {
    footerStyle.background = `linear-gradient(135deg, ${sd.footerSectionBgColor1 || '#fafafa'}, ${sd.footerSectionBgColor2 || '#fafafa'})`;
  } else {
    footerStyle.backgroundColor = sd.footerSectionBgColor1 || '#fafafa';
  }

  // Find social links and respect displayLocation setting
  const socialSection = site.sections?.find((s: any) => s.type === 'social');
  const socialData = socialSection?.data;
  const showSocialInFooter = sd.footerShowSocial !== false && (socialData?.displayLocation === 'both' || socialData?.displayLocation === 'footer' || !socialData?.displayLocation);

  return (
    <div 
      onClick={() => isPreview && onSectionClick?.(section.id)}
      className={cn("w-full transition-all relative px-6 mb-20", isPreview && "hover:outline-2 hover:outline-dashed hover:outline-primary/50 cursor-pointer")}
    >
      <footer style={footerStyle} className={cn(
        "max-w-7xl mx-auto shadow-2xl bg-white border px-8 sm:px-12",
        layout === 'simple' ? 'flex flex-col items-center text-center' : 'grid grid-cols-1 md:grid-cols-12 gap-12'
      )}>
         <div className={cn(layout === 'simple' ? 'w-full space-y-6' : 'md:col-span-5 space-y-8', alignment === 'center' ? 'items-center text-center' : alignment === 'right' ? 'items-end text-right' : 'items-start text-left')}>
            <div className={cn("flex", alignment === 'center' ? "justify-center" : alignment === 'right' ? "justify-end" : "justify-start")}>
              {sd.footerLogoUrl ? (
                <img src={sd.footerLogoUrl} style={{ height: `${sd.footerLogoHeight || 32}px` }} className="w-auto h-auto" alt="" />
              ) : (
                <span className="font-black text-2xl uppercase tracking-tighter">{site.businessName || "Smart Page"}</span>
              )}
            </div>
            <p className="text-base opacity-60 leading-relaxed max-w-sm mx-auto md:mx-0">{sd.footerDescription}</p>
            
            {showSocialInFooter && (
               <div className={cn("flex flex-wrap gap-4 pt-2", alignment === 'center' ? "justify-center" : alignment === 'right' ? "justify-end" : "justify-start")}>
                  {socialData?.socialLinks?.map((link: any, idx: number) => (
                    <a key={idx} to={link.url} target="_blank" className="h-10 w-10 flex items-center justify-center rounded-xl bg-neutral-900/5 hover:bg-primary/10 transition-all border shadow-sm group">
                       <img 
                        src={`https://cdn.simpleicons.org/${link.platform}/666666`} 
                        className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" 
                        alt="" 
                       />
                    </a>
                  ))}
               </div>
            )}
            
            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em] flex items-center gap-2 pt-4">
               <Copyright className="h-3 w-3" /> {sd.footerCopyrightText || `© 2026 ${site.businessName}`}
            </p>
         </div>

         {layout === 'matrix' && (
           <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <h4 className="font-black text-[11px] uppercase tracking-[0.2em] text-primary">Direct Contact</h4>
                 <div className="space-y-4">
                    {sd.footerContactEmail && (
                      <div className="flex items-center gap-4 text-sm font-bold">
                        <div className="h-9 w-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary shadow-inner"><Mail className="h-4 w-4" /></div>
                        <span>{sd.footerContactEmail}</span>
                      </div>
                    )}
                    {sd.footerContactPhone && (
                      <div className="flex items-center gap-4 text-sm font-bold">
                        <div className="h-9 w-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary shadow-inner"><Phone className="h-4 w-4" /></div>
                        <span>{sd.footerContactPhone}</span>
                      </div>
                    )}
                 </div>
              </div>
              <div className="space-y-6">
                 <h4 className="font-black text-[11px] uppercase tracking-[0.2em] text-primary">Official Address</h4>
                 <div className="flex items-start gap-4 text-sm opacity-70 leading-relaxed font-medium">
                    <div className="h-9 w-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary shadow-inner shrink-0 mt-0.5"><MapPin className="h-4 w-4" /></div>
                    <span>{sd.footerAddress || "Hub Address Not Set"}</span>
                  </div>
              </div>
           </div>
         )}
      </footer>
    </div>
  );
}
