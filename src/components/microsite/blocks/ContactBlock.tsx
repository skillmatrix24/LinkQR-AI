
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Phone, Mail, Globe, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function ContactBlock({ section, site, isPreview, onSectionClick }: any) {
  const sd = section.data || {};
  const themeColor = site.themeColor || '#6750A4';
  const cardRadius = site.cardRadius || 32;

  const sectionStyle: any = { 
    paddingTop: `${sd.sectionPaddingTop || 60}px`, 
    paddingBottom: `${sd.sectionPaddingBottom || 60}px`,
    borderRadius: `${sd.cardRadius || cardRadius}px`,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.5s ease'
  };

  if (sd.sectionBgType === 'gradient') {
    sectionStyle.background = `linear-gradient(135deg, ${sd.sectionBgColor1 || '#fafafa'}, ${sd.sectionBgColor2 || '#fafafa'})`;
  } else {
    sectionStyle.backgroundColor = sd.sectionBgColor1 || 'transparent';
  }

  const items = [
    { id: 'showMobile', icon: Phone, val: sd.mobile, label: 'Mobile' },
    { id: 'showEmail', icon: Mail, val: sd.email, label: 'Email' },
    { id: 'showWebsite', icon: Globe, val: sd.website, label: 'Official Site' }
  ].filter(f => f.val && sd[f.id] !== false);

  const alignment = sd.titleAlign === 'center' ? 'items-center text-center' : sd.titleAlign === 'right' ? 'items-end text-right' : 'items-start text-left';

  return (
    <div 
      onClick={() => isPreview && onSectionClick?.(section.id)}
      className={cn("w-full transition-all relative px-6", isPreview && "hover:outline-2 hover:outline-dashed hover:outline-primary/50 cursor-pointer")}
    >
      <section style={sectionStyle} className="px-6 w-full max-w-4xl mx-auto relative z-10 shadow-2xl">
         <div className={cn("space-y-4 mb-10 flex flex-col", alignment)}>
            <h2 className="text-2xl sm:text-5xl font-black uppercase tracking-tight" style={{ color: sd.sectionTitleColor || 'inherit' }}>{sd.sectionTitle}</h2>
            {sd.sectionDescription && <p className="text-sm sm:text-lg opacity-60 font-medium max-w-2xl">{sd.sectionDescription}</p>}
         </div>

         <div className="space-y-4 w-full">
            {items.map((item, i) => (
              <motion.a 
                key={i}
                to={isPreview ? undefined : item.id === 'showMobile' ? `tel:${item.val}` : item.id === 'showEmail' ? `mailto:${item.val}` : item.val}
                target={item.id === 'showWebsite' ? "_blank" : undefined}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex items-center gap-5 p-5 border shadow-lg group transition-all active:scale-95"
                )}
                style={{ 
                  borderRadius: `${sd.cardRadius || 24}px`,
                  backgroundColor: sd.cardBgColor1 || '#ffffff',
                  boxShadow: sd.cardShadow === 'none' ? 'none' : '0 10px 30px rgba(0,0,0,0.05)'
                }}
              >
                <div 
                  className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform" 
                  style={{ backgroundColor: sd.iconBgColor || themeColor, color: sd.iconColor || '#ffffff' }}
                >
                  <item.icon className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{item.label}</p>
                   <p className="text-sm sm:text-lg font-black truncate text-foreground">{item.val}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-neutral-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </motion.a>
            ))}
         </div>
      </section>
    </div>
  );
}
