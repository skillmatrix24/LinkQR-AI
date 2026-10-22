'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { trackClickEvent } from '@/app/lib/analytics-service';
import { useFirestore } from '@/firebase';

/** Helper to convert hex to RGBA for shadows */
const hexToRgba = (hex: string, alpha: number) => {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function SocialBlock({ section, site, isPreview, onSectionClick }: any) {
  const sd = section.data || {};
  const themeColor = site.themeColor || '#6750A4';
  const cardRadius = site.cardRadius || 32;
  const db = useFirestore();

  // Visibility logic
  const displayLoc = sd.displayLocation || 'both';
  if (displayLoc === 'footer' && !isPreview) return null;

  const collectionName = site.type === 'vcard' ? 'digitalIDs' : 'microsites';

  const renderHeadline = () => {
    const headline = sd.socialSectionTitle || "Connect with Us";
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
    paddingTop: `${sd.sectionPaddingTop || 80}px`, 
    paddingBottom: `${sd.sectionPaddingBottom || 80}px`,
    borderRadius: `${cardRadius}px`,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.5s ease'
  };

  if (sd.socialSectionBgType === 'gradient') {
    sectionStyle.background = `linear-gradient(135deg, ${sd.socialSectionBgColor1 || '#ffffff'}, ${sd.socialSectionBgColor2 || '#ffffff'})`;
  } else {
    sectionStyle.backgroundColor = sd.socialSectionBgColor1 || 'transparent';
  }

  const renderContent = () => (
    <div className={cn("space-y-4 mb-10", sd.titleAlign === 'center' ? 'text-center' : sd.titleAlign === 'right' ? 'text-right' : 'text-left')}>
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

  const getLinkUrl = (link: any) => {
    if (isPreview) return undefined;
    let url = link.url;
    if (link.platform === 'whatsapp' && sd.whatsappMessage) {
        const number = url.replace(/\D/g, '');
        return `https://wa.me/${number}?text=${encodeURIComponent(sd.whatsappMessage)}`;
    }
    return url.startsWith('http') ? url : `https://${url}`;
  };

  const renderLinks = () => (
    <div 
      className={cn(
        "grid w-full",
        sd.iconOnlyMode ? "grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 justify-items-center" : 
        sd.socialLayout === 'list' ? 'grid-cols-1' : 
        sd.socialLayout === 'grid2' ? 'grid-cols-2 md:grid-cols-4' : 
        'flex flex-wrap justify-center'
      )} 
      style={{ gap: `${sd.itemGap || (sd.iconOnlyMode ? 16 : 24)}px` }}
    >
       {Array.isArray(sd.socialLinks) && sd.socialLinks.filter(Boolean).map((link: any, idx: number) => {
         const itemRadius = link.cardRadius ?? cardRadius;
         
         const nodeStyle: any = {
            borderRadius: sd.iconOnlyMode ? (link.iconShape === 'circle' ? '999px' : '12px') : `${itemRadius}px`,
            borderWidth: sd.iconOnlyMode ? '0px' : `${link.cardBorderWidth || 0}px`,
            borderColor: link.cardBorderColor || '#eeeeee',
            borderStyle: 'solid',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: sd.iconOnlyMode ? '0px' : '16px'
         };

         if (!sd.iconOnlyMode) {
            if (link.cardBgType === 'gradient') nodeStyle.background = `linear-gradient(135deg, ${link.cardBgColor1 || '#ffffff'}, ${link.cardBgColor2 || '#ffffff'})`;
            else nodeStyle.backgroundColor = link.cardBgColor1 || '#ffffff';

            if (link.cardShadow === 'xl') nodeStyle.boxShadow = `0 20px 40px ${hexToRgba(link.shadowColor || '#000000', 0.1)}`;
            else if (link.cardShadow === 'md') nodeStyle.boxShadow = `0 10px 20px ${hexToRgba(link.shadowColor || '#000000', 0.05)}`;
         }

         if (link.showGlow) nodeStyle.boxShadow = `0 0 20px ${hexToRgba(link.iconBgColor1 || themeColor, 0.3)}`;

         return (
           <motion.a
             key={idx}
             to={getLinkUrl(link)}
             target="_blank"
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className={cn(
               "relative overflow-hidden group",
               link.hoverEffect === 'lift' ? 'hover:-translate-y-2' : 
               link.hoverEffect === 'scale' ? 'hover:scale-105' : 
               link.hoverEffect === 'glow' ? 'glow-node' : '',
               link.showPulse && "animate-pulse"
             )}
             style={{
                ...nodeStyle,
                '--glow-color': hexToRgba(link.hoverColor || themeColor, 0.4)
             } as any}
             onClick={() => {
               if (isPreview) return;
               trackClickEvent(db, site._userId, site.id, collectionName, 'SOCIAL_CLICK', { platform: link.platform });
             }}
           >
              <div 
                className={cn(
                  "flex items-center justify-center shrink-0 p-2.5 shadow-lg",
                  link.iconShape === 'circle' ? 'rounded-full' : link.iconShape === 'square' ? 'rounded-none' : 'rounded-xl'
                )}
                style={{ 
                  width: `${sd.iconOnlyMode ? 56 : (link.iconSize || 48)}px`, 
                  height: `${sd.iconOnlyMode ? 56 : (link.iconSize || 48)}px`,
                  background: link.iconBgType === 'gradient' ? `linear-gradient(135deg, ${link.iconBgColor1 || themeColor}, ${link.iconBgColor2 || themeColor})` : (link.iconBgColor1 || themeColor) 
                }}
              >
                <img 
                  src={`https://cdn.simpleicons.org/${link.platform}/${(link.iconColor || '#ffffff').replace('#', '')}`} 
                  className="w-full h-full object-contain" 
                  alt="" 
                />
              </div>

              {!sd.iconOnlyMode && link.showLabel !== false && (
                <span className="font-black text-sm uppercase tracking-wider ml-4" style={{ color: link.titleColor || 'inherit' }}>
                   {link.platform}
                </span>
              )}

              {link.showPulse && (
                <div className="absolute inset-0 bg-white/20 animate-ping pointer-events-none" />
              )}
           </motion.a>
         );
       })}
    </div>
  );

  return (
    <div 
      onClick={() => isPreview && onSectionClick?.(section.id)}
      className={cn("w-full transition-all relative px-6", isPreview && "hover:outline-2 hover:outline-dashed hover:outline-primary/50 cursor-pointer")}
    >
      <section style={sectionStyle} className="px-6 w-full max-w-7xl mx-auto relative z-10 shadow-2xl">
         {sd.layoutSplit ? (
           <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-12 items-center", sd.splitPosition === 'right' ? 'lg:flex-row-reverse' : '')}>
              <div className="lg:col-span-5">
                 {renderContent()}
              </div>
              <div className="lg:col-span-7">
                 {renderLinks()}
              </div>
           </div>
         ) : (
           <>
             {renderContent()}
             {renderLinks()}
           </>
         )}
      </section>
    </div>
  );
}
