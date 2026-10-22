'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Plus, Zap, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FAQBlock({ section, site, isPreview, onSectionClick }: any) {
  const sd = section.data || {};
  const themeColor = site.themeColor || '#6750A4';
  const cardRadius = site.cardRadius || 32;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const renderHeadline = () => {
    const headline = sd.faqSectionTitle || "Frequently Asked Questions";
    if (!sd.highlightedText) return headline;
    
    const hText = sd.highlightedText;
    const hColor1 = sd.highlightedColor || themeColor;
    const hColor2 = sd.highlightedColor2 || themeColor;
    const isGradient = sd.highlightedBgType === 'gradient';
    const styleType = sd.highlightStyle || 'text';
    const rotation = sd.highlightRotate || 0;

    let styleStr = `display: inline-block; transition: all 0.3s ease; position: relative;`;
    if (rotation !== 0) styleStr += `transform: rotate(${rotation}deg);`;
    if (sd.highlightBold) styleStr += `font-weight: 900;`;
    if (sd.highlightItalic) styleStr += `font-style: italic;`;

    if (styleType === 'pill') {
      styleStr += `background: ${isGradient ? `linear-gradient(135deg, ${hColor1}, ${hColor2})` : hColor1}; color: white; padding: 4px 16px; border-radius: 99px; -webkit-text-fill-color: white;`;
    } else if (styleType === 'underline') {
      styleStr += `border-bottom: 6px solid ${hColor1}; padding-bottom: 2px;`;
      if (isGradient) styleStr += `border-image: linear-gradient(to right, ${hColor1}, ${hColor2}) 1;`;
    } else {
      if (isGradient) {
        styleStr += `background: linear-gradient(135deg, ${hColor1}, ${hColor2}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;`;
      } else {
        styleStr += `color: ${hColor1};`;
      }
    }
    if (sd.highlightGlow) styleStr += `text-shadow: 0 0 15px ${hColor1}80;`;
    
    const regex = new RegExp(`(${hText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return headline.replace(regex, `<span style="${styleStr}">$1</span>`);
  };

  const sectionStyle: any = { 
    paddingTop: `${sd.sectionPaddingTop || 80}px`, 
    paddingBottom: `${sd.sectionPaddingBottom || 80}px`,
    borderRadius: `${cardRadius}px`,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.5s ease'
  };

  if (sd.faqSectionBgType === 'gradient') {
    sectionStyle.background = `linear-gradient(135deg, ${sd.faqSectionBgColor1 || '#fafafa'}, ${sd.faqSectionBgColor2 || '#fafafa'})`;
  } else {
    sectionStyle.backgroundColor = sd.faqSectionBgColor1 || 'transparent';
  }

  const renderContent = () => (
    <div className={cn("space-y-4 mb-10", sd.titleAlign === 'center' ? 'text-center' : sd.titleAlign === 'right' ? 'text-right' : 'text-left')}>
      <h2 
        className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight" 
        style={{ color: sd.sectionTitleColor || 'inherit' }}
        dangerouslySetInnerHTML={{ __html: renderHeadline() }}
      />
      {sd.sectionDescription && (
        <p className="text-base sm:text-xl opacity-60 font-medium max-w-2xl mx-auto lg:mx-0">
          {sd.sectionDescription}
        </p>
      )}
    </div>
  );

  const renderFaqs = () => (
    <div className="grid grid-cols-1 gap-4 w-full">
      {Array.isArray(sd.faqs) && sd.faqs.filter(Boolean).map((f: any, idx: number) => {
        const isOpen = openIndex === idx;
        const itemStyle: any = { borderRadius: `${cardRadius / 2}px`, overflow: 'hidden', transition: 'all 0.4s ease' };
        if (f.cardBgType === 'gradient') itemStyle.background = `linear-gradient(135deg, ${f.cardBgColor1 || '#ffffff'}, ${f.cardBgColor2 || '#ffffff'})`;
        else itemStyle.backgroundColor = f.cardBgColor1 || '#ffffff';

        return (
          <div key={idx} className="w-full border shadow-sm" style={itemStyle}>
             <button onClick={() => setOpenIndex(isOpen ? null : idx)} className="w-full p-5 sm:p-7 flex items-center justify-between gap-4 text-left outline-none">
                <div className="flex items-center gap-4">
                   <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary shadow-inner shrink-0"><MessageSquare className="h-4 w-4" /></div>
                   <h4 className="font-black text-sm sm:text-lg leading-tight">{f.question}</h4>
                </div>
                <ChevronDown className={cn("h-5 w-5 transition-transform duration-500 shrink-0", isOpen && "rotate-180")} style={{ color: themeColor }} />
             </button>
             <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className="px-5 sm:px-7 pb-7 sm:pb-8 pt-0"><p className="text-sm sm:text-base opacity-70 leading-relaxed font-medium">{f.answer}</p></div>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        );
      })}
    </div>
  );

  return (
    <div onClick={() => isPreview && onSectionClick?.(section.id)} className={cn("w-full transition-all relative px-6", isPreview && "hover:outline-2 hover:outline-dashed hover:outline-primary/50 cursor-pointer")}>
      <section style={sectionStyle} className="px-6 w-full max-w-7xl mx-auto relative z-10 shadow-2xl">
         {sd.sectionBgImage && <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: `url(${sd.sectionBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: (sd.sectionBgOpacity ?? 100) / 100 }} />}
         {sd.sectionBgImage && <div className="absolute inset-0 z-[1] pointer-events-none" style={{ backgroundColor: sd.sectionBgOverlayColor || '#000000', opacity: (sd.sectionBgOverlayOpacity || 0) / 100 }} />}
         
         <div className="relative z-10">
            {sd.layoutSplit ? (
              <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-12 items-start", sd.splitPosition === 'right' ? 'lg:flex-row-reverse' : '')}>
                  <div className="lg:col-span-5">{renderContent()}</div>
                  <div className="lg:col-span-7 w-full">{renderFaqs()}</div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto w-full">
                {renderContent()}
                {renderFaqs()}
              </div>
            )}
         </div>
      </section>
    </div>
  );
}
