
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from "framer-motion";

export function BioBlock({ section, site, isPreview, onSectionClick }: any) {
  const sd = section.data || {};
  const cardRadius = site.cardRadius || 32;

  const sectionStyle: any = { 
    paddingTop: `${sd.paddingTop || 40}px`, 
    paddingBottom: `${sd.paddingBottom || 40}px`,
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

  const alignment = sd.titleAlign === 'center' ? 'text-center' : sd.titleAlign === 'right' ? 'text-right' : 'text-left';

  const renderFormattedText = (text: string, color: string) => {
    if (!text) return null;
    if (!sd.highlightedText) return text;

    const hText = sd.highlightedText;
    const hColor1 = sd.highlightedColor || site.themeColor || '#6750A4';
    const hColor2 = sd.highlightedColor2 || hColor1;
    const isGradient = sd.highlightedBgType === 'gradient';
    const styleType = sd.highlightStyle || 'text';

    let styleStr = `display: inline-block; transition: all 0.3s ease;`;
    if (sd.highlightBold) styleStr += `font-weight: 900;`;
    if (sd.highlightItalic) styleStr += `font-style: italic;`;
    if (sd.highlightStrike) styleStr += `text-decoration: line-through;`;

    if (styleType === 'pill') {
      styleStr += `background: ${isGradient ? `linear-gradient(135deg, ${hColor1}, ${hColor2})` : hColor1}; color: white; padding: 0px 8px; border-radius: 8px; -webkit-text-fill-color: white;`;
    } else if (styleType === 'underline') {
      styleStr += `border-bottom: 3px solid ${hColor1}; padding-bottom: 1px;`;
    } else {
      if (isGradient) {
        styleStr += `background: linear-gradient(135deg, ${hColor1}, ${hColor2}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;`;
      } else {
        styleStr += `color: ${hColor1};`;
      }
    }

    const regex = new RegExp(`(${hText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) 
        ? <span key={i} style={{ ...Object.fromEntries(styleStr.split(';').filter(Boolean).map(s => s.split(':').map(x => x.trim()))) } as any}>{part}</span>
        : part
    );
  };

  const textStyle = {
    fontSize: `${sd.fontSize || 16}px`,
    lineHeight: sd.lineHeight || 1.6,
  };

  return (
    <div 
      onClick={() => isPreview && onSectionClick?.(section.id)}
      className={cn("w-full transition-all relative px-6", isPreview && "hover:outline-2 hover:outline-dashed hover:outline-primary/50 cursor-pointer")}
    >
      <section style={sectionStyle} className={cn("px-8 w-full max-w-4xl mx-auto relative z-10 flex flex-col shadow-sm", alignment === 'text-center' ? 'items-center' : alignment === 'text-right' ? 'items-end' : 'items-start')}>
         <div className={cn("space-y-8 w-full", alignment)}>
            {sd.content && (
              <div className="space-y-2">
                <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-20">Narrative Node</p>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className={cn("font-bold italic")}
                  style={{ ...textStyle, color: sd.textColor || '#111827' }}
                >
                   {renderFormattedText(sd.content, sd.textColor)}
                </motion.p>
              </div>
            )}
            
            {sd.contentHi && (
               <div className={cn("space-y-2", sd.content && "pt-8 border-t border-dashed border-primary/10")}>
                  <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-20 text-primary">Bilingual Node</p>
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="font-bold italic font-mukta"
                    style={{ ...textStyle, fontSize: `${(sd.fontSize || 16) + 2}px`, color: sd.hiTextColor || '#6750A4' }}
                  >
                     {renderFormattedText(sd.contentHi, sd.hiTextColor)}
                  </motion.p>
               </div>
            )}
         </div>
      </section>
    </div>
  );
}
