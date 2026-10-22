'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { X, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from "@/components/ui/badge";

export function GalleryBlock({ section, site, isPreview, onSectionClick }: any) {
  const sd = section.data || {};
  const cardRadius = site.cardRadius || 32;
  const themeColor = site.themeColor || '#6750A4';
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const renderHeadline = () => {
    const headline = sd.gallerySectionTitle || "Our Gallery";
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
    if (sd.highlightStrike) styleStr += `text-decoration: line-through;`;
    if (sd.highlightCase && sd.highlightCase !== 'none') styleStr += `text-transform: ${sd.highlightCase};`;

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
    paddingTop: `${sd.sectionPaddingTop || 60}px`, 
    paddingBottom: `${sd.sectionPaddingBottom || 60}px`,
    borderRadius: `${cardRadius}px`,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.5s ease'
  };

  if (sd.gallerySectionBgType === 'gradient') {
    sectionStyle.background = `linear-gradient(135deg, ${sd.gallerySectionBgColor1 || '#ffffff'}, ${sd.gallerySectionBgColor2 || '#ffffff'})`;
  } else {
    sectionStyle.backgroundColor = sd.gallerySectionBgColor1 || 'transparent';
  }

  const columnsMap: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const aspectRatios: Record<string, string> = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[4/5]',
    auto: 'aspect-auto'
  };

  const getCollageSpan = (idx: number) => {
    if (sd.galleryLayout !== 'collage') return "";
    const sequence = [
      "md:col-span-2 md:row-span-2",
      "md:col-span-1",
      "md:col-span-1",
      "md:row-span-2",
      "md:col-span-2",
    ];
    return sequence[idx % sequence.length];
  };

  const renderContent = () => (
    <div className={cn("space-y-4 mb-12", sd.titleAlign === 'center' ? 'text-center' : sd.titleAlign === 'right' ? 'text-right' : 'text-left')}>
      <h2 
        className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight" 
        style={{ color: sd.sectionTitleColor || 'inherit' }}
        dangerouslySetInnerHTML={{ __html: renderHeadline() }}
      />
      {sd.sectionDescription && (
        <p className="text-base sm:text-lg opacity-60 font-medium max-w-2xl mx-auto lg:mx-0" style={{ color: sd.sectionTitleColor ? `${sd.sectionTitleColor}80` : 'inherit' }}>
          {sd.sectionDescription}
        </p>
      )}
    </div>
  );

  const renderGallery = () => (
    <div className={cn(
      "grid",
      sd.galleryLayout === 'carousel' ? 'flex overflow-x-auto snap-x no-scrollbar pb-6 gap-6' : 
      sd.galleryLayout === 'collage' ? 'grid-cols-2 md:grid-cols-4 grid-flow-dense' :
      columnsMap[sd.columns || 3]
    )} style={{ gap: `${sd.itemGap || 24}px` }}>
       {Array.isArray(sd.gallery) && sd.gallery.filter(Boolean).map((item: any, idx: number) => {
         const itemRadius = item.cardRadius ?? cardRadius;
         
         const cardStyle: any = {
            borderRadius: `${itemRadius}px`,
            borderWidth: `${item.cardBorderWidth || 0}px`,
            borderColor: item.cardBorderColor || '#eeeeee',
            borderStyle: 'solid',
            overflow: 'hidden',
            backgroundColor: '#ffffff'
         };

         return (
           <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
              "relative group cursor-pointer transition-all duration-500",
              sd.galleryLayout === 'carousel' ? 'min-w-[280px] sm:min-w-[400px] snap-center' : '',
              getCollageSpan(idx),
              item.hoverEffect === 'zoom' ? 'hover:scale-[1.02]' : 
              item.hoverEffect === 'lift' ? 'hover:-translate-y-2' : 
              item.hoverEffect === 'glow' ? 'z-20' : ''
            )}
            onClick={() => sd.lightboxEnabled !== false && setSelectedImage(item.image)}
           >
              <div 
                className={cn(
                  "relative overflow-hidden shadow-xl h-full transition-all duration-500", 
                  sd.galleryLayout === 'collage' ? 'aspect-square md:aspect-auto' : aspectRatios[item.aspectRatio || 'video'],
                  item.hoverEffect === 'glow' && "group-hover:shadow-[0_0_30px_rgba(var(--primary),0.4)]"
                )} 
                style={{
                  ...cardStyle,
                  '--primary': themeColor.replace('#', '')
                } as any}
              >
                <img 
                  src={item.image} 
                  className={cn("w-full h-full object-cover transition-transform duration-700", item.hoverEffect === 'zoom' && "group-hover:scale-110")} 
                  alt={item.caption} 
                />
                
                {item.caption && (item.captionPosition === 'overlay' || !item.captionPosition) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <h4 className="text-white font-black text-xs sm:text-sm uppercase tracking-widest">{item.caption}</h4>
                     {item.description && <p className="text-white/70 text-[9px] sm:text-[10px] font-medium mt-1 line-clamp-2 leading-relaxed">{item.description}</p>}
                  </div>
                )}
              </div>

              {item.caption && item.captionPosition === 'below' && (
                <div className="mt-4 px-1 animate-in fade-in">
                   <h4 className="font-black text-xs sm:text-sm uppercase tracking-tight" style={{ color: item.titleColor || 'inherit' }}>{item.caption}</h4>
                   {item.description && <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-2 font-medium leading-relaxed italic">"{item.description}"</p>}
                </div>
              )}
           </motion.div>
         );
       })}
    </div>
  );

  return (
    <div 
      onClick={() => isPreview && onSectionClick?.(section.id)}
      className={cn("w-full transition-all relative px-6", isPreview && "hover:outline-2 hover:outline-dashed hover:outline-primary/50 cursor-pointer")}
    >
      <section style={sectionStyle} className="px-6 w-full max-w-7xl mx-auto relative z-10">
        
        {sd.layoutSplit ? (
          <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-12 items-center", sd.splitPosition === 'right' ? 'lg:flex-row-reverse' : '')}>
             <div className="lg:col-span-5 space-y-6">
                {renderContent()}
             </div>
             <div className="lg:col-span-7">
                {renderGallery()}
             </div>
          </div>
        ) : (
          <>
            {renderContent()}
            {renderGallery()}
          </>
        )}

        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center p-4 sm:p-10 cursor-zoom-out backdrop-blur-md"
              onClick={() => setSelectedImage(null)}
            >
               <button className="absolute top-6 right-6 h-12 w-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all shadow-2xl border border-white/20">
                  <X className="h-6 w-6" />
               </button>
               <motion.img 
                initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 15 }}
                src={selectedImage} 
                className="max-h-full max-w-full object-contain rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] border-4 border-white/10" 
                alt="Fullscreen Preview" 
               />
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}