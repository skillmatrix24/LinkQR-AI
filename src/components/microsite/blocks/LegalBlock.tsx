'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Scale, FileText } from 'lucide-react';

export function LegalBlock({ section, site, isPreview, onSectionClick }: any) {
  const sd = section.data || {};
  const cardRadius = site.cardRadius || 32;

  const sectionStyle: any = { 
    paddingTop: `${sd.sectionPaddingTop || 80}px`, 
    paddingBottom: `${sd.sectionPaddingBottom || 80}px`, 
    width: '100%', 
    borderRadius: `${cardRadius}px`,
    position: 'relative',
    overflow: 'hidden'
  };

  if (sd.legalSectionBgType === 'gradient') {
    sectionStyle.background = `linear-gradient(135deg, ${sd.legalSectionBgColor1 || '#ffffff'}, ${sd.legalSectionBgColor2 || '#ffffff'})`;
  } else {
    sectionStyle.backgroundColor = sd.legalSectionBgColor1 || 'transparent';
  }

  const renderContent = () => (
    <div className={cn("space-y-4 mb-10", sd.titleAlign === 'center' ? 'text-center' : sd.titleAlign === 'right' ? 'text-right' : 'text-left')}>
      <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight" style={{ color: sd.sectionTitleColor || 'inherit' }}>
        {sd.legalSectionTitle || "Privacy & Terms"}
      </h3>
    </div>
  );

  const renderCards = () => (
    <div className={cn("grid gap-8 w-full", sd.layoutSplit ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
      <div className="p-8 bg-white rounded-3xl border border-neutral-100 shadow-xl space-y-4 group hover:border-primary/20 transition-all">
         <div className="flex items-center gap-3 border-b pb-4">
            <Scale className="h-6 w-6 text-primary" />
            <h4 className="font-black text-sm uppercase">Privacy Policy</h4>
         </div>
         <p className="text-sm text-muted-foreground leading-relaxed line-clamp-[10] font-medium">{sd.privacyPolicyContent}</p>
         {sd.privacyPolicyUrl && (
           <a to={sd.privacyPolicyUrl} target="_blank" className="inline-block text-[10px] font-black text-primary uppercase tracking-widest hover:underline pt-2">Read Full Policy →</a>
         )}
      </div>
      <div className="p-8 bg-white rounded-3xl border border-neutral-100 shadow-xl space-y-4 group hover:border-primary/20 transition-all">
         <div className="flex items-center gap-3 border-b pb-4">
            <FileText className="h-6 w-6 text-primary" />
            <h4 className="font-black text-sm uppercase">Terms of Service</h4>
         </div>
         <p className="text-sm text-muted-foreground leading-relaxed line-clamp-[10] font-medium">{sd.termsOfServiceContent}</p>
         {sd.termsOfServiceUrl && (
           <a to={sd.termsOfServiceUrl} target="_blank" className="inline-block text-[10px] font-black text-primary uppercase tracking-widest hover:underline pt-2">Read Full Terms →</a>
         )}
      </div>
    </div>
  );

  return (
    <div 
      onClick={() => isPreview && onSectionClick?.(section.id)}
      className={cn("w-full transition-all relative px-6", isPreview && "hover:outline-2 hover:outline-dashed hover:outline-primary/50 cursor-pointer")}
    >
      <section style={sectionStyle} className="px-6 relative z-10 max-w-7xl mx-auto">
         {sd.layoutSplit ? (
           <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-12 items-start")}>
              <div className="lg:col-span-4">
                 {renderContent()}
              </div>
              <div className="lg:col-span-8">
                 {renderCards()}
              </div>
           </div>
         ) : (
           <>
             {renderContent()}
             {renderCards()}
           </>
         )}
      </section>
    </div>
  );
}
