'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Star, User, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

export function ReviewsBlock({ section, site, isPreview, onSectionClick }: any) {
  const sd = section.data || {};
  const themeColor = site.themeColor || '#6750A4';
  const cardRadius = site.cardRadius || 32;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: 'start', loop: true, skipSnaps: false }, 
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  );

  const scrollPrev = React.useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = React.useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const renderHeadline = () => {
    const headline = sd.reviewsSectionTitle || "Customer Stories";
    if (!sd.highlightedText) return headline;
    const hText = sd.highlightedText;
    const hColor1 = sd.highlightedColor || themeColor;
    const hColor2 = sd.highlightedColor2 || themeColor;
    const isGradient = sd.highlightedBgType === 'gradient';
    const styleType = sd.highlightStyle || 'text';

    let styleStr = `display: inline-block; transition: all 0.3s ease; position: relative;`;
    if (sd.highlightBold) styleStr += `font-weight: 900;`;
    if (sd.highlightItalic) styleStr += `font-style: italic;`;

    if (styleType === 'pill') styleStr += `background: ${isGradient ? `linear-gradient(135deg, ${hColor1}, ${hColor2})` : hColor1}; color: white; padding: 4px 16px; border-radius: 99px; -webkit-text-fill-color: white;`;
    else if (styleType === 'underline') styleStr += `border-bottom: 6px solid ${hColor1}; padding-bottom: 2px;`;
    else styleStr += `color: ${hColor1}; ${isGradient ? `background: linear-gradient(135deg, ${hColor1}, ${hColor2}); -webkit-background-clip: text; -webkit-text-fill-color: transparent;` : ''}`;

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
  
  if (sd.reviewsSectionBgType === 'gradient') sectionStyle.background = `linear-gradient(135deg, ${sd.reviewsSectionBgColor1 || '#fafafa'}, ${sd.reviewsSectionBgColor2 || '#fafafa'})`;
  else sectionStyle.backgroundColor = sd.reviewsSectionBgColor1 || 'transparent';

  const renderContent = () => (
    <div className={cn("space-y-4 mb-12", sd.titleAlign === 'center' ? 'text-center' : sd.titleAlign === 'right' ? 'text-right' : 'text-left')}>
      <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight" style={{ color: sd.sectionTitleColor || 'inherit' }} dangerouslySetInnerHTML={{ __html: renderHeadline() }} />
      {sd.sectionDescription && <p className="text-sm sm:text-base opacity-60 font-medium max-w-2xl mx-auto lg:mx-0">{sd.sectionDescription}</p>}
    </div>
  );

  const renderCards = () => (
    <div className="embla overflow-hidden" ref={emblaRef}>
      <div className="embla__container flex -ml-4">
        {Array.isArray(sd.reviews) && sd.reviews.filter(Boolean).map((r: any, idx: number) => (
          <div key={idx} className="embla__slide flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="p-6 sm:p-8 h-full bg-white rounded-3xl border shadow-xl flex flex-col group relative">
              <div className="absolute top-0 right-0 p-6 opacity-5"><Quote className="h-12 w-12 text-primary" /></div>
              <div className="flex gap-1 mb-4">{Array.from({ length: 5 }).map((_, s) => (<Star key={s} className={cn("h-3.5 w-3.5", (r.rating || 5) > s ? "fill-amber-400 text-amber-400" : "text-neutral-200")} />))}</div>
              <p className="text-sm sm:text-base italic font-bold opacity-80 mb-6 flex-1 leading-relaxed">"{r.comment}"</p>
              <div className="flex items-center gap-4 pt-4 border-t border-neutral-100">
                <div className="h-10 w-10 rounded-full bg-neutral-100 overflow-hidden shrink-0 border-2 border-white shadow-lg">{r.image ? <img src={r.image} className="h-full w-full object-cover" alt="" /> : <User className="h-full w-full p-2.5 opacity-20" />}</div>
                <div className="min-w-0"><p className="font-black text-xs sm:text-sm uppercase tracking-tight truncate">{r.name}</p><p className="text-[8px] sm:text-[9px] uppercase font-bold opacity-50 truncate tracking-widest">{r.role || "Verified Client"}</p></div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-3 mt-8">
        <button onClick={scrollPrev} className="h-10 w-10 rounded-full bg-white border shadow-md flex items-center justify-center hover:bg-primary hover:text-white transition-all"><ChevronLeft className="h-5 w-5" /></button>
        <button onClick={scrollNext} className="h-10 w-10 rounded-full bg-white border shadow-md flex items-center justify-center hover:bg-primary hover:text-white transition-all"><ChevronRight className="h-5 w-5" /></button>
      </div>
    </div>
  );

  return (
    <div onClick={() => isPreview && onSectionClick?.(section.id)} className={cn("w-full transition-all relative px-6", isPreview && "hover:outline-2 hover:outline-dashed hover:outline-primary/50 cursor-pointer")}>
      <section style={sectionStyle} className="px-6 w-full max-w-7xl mx-auto relative z-10 shadow-2xl">
         {sd.sectionBgImage && <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: `url(${sd.sectionBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: (sd.sectionBgOpacity ?? 100) / 100 }} />}
         {sd.sectionBgImage && <div className="absolute inset-0 z-[1] pointer-events-none" style={{ backgroundColor: sd.sectionBgOverlayColor || '#000000', opacity: (sd.sectionBgOverlayOpacity || 0) / 100 }} />}
         <div className="relative z-10">
            {sd.layoutSplit ? (
              <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-12 items-center", sd.splitPosition === 'right' ? 'lg:flex-row-reverse' : '')}>
                  <div className="lg:col-span-5">{renderContent()}</div>
                  <div className="lg:col-span-7">{renderCards()}</div>
              </div>
            ) : (
              <> {renderContent()} {renderCards()} </>
            )}
         </div>
      </section>
    </div>
  );
}
