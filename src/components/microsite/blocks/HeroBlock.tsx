'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";

/** Helper to convert hex to RGBA */
const hexToRgba = (hex: string, alpha: number) => {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function HeroBlock({ section, site, isPreview, onSectionClick }: any) {
  const sd = section.data || {};
  const themeColor = site.themeColor || '#6750A4';
  const cardRadius = site.cardRadius || 32;

  const renderHeadline = () => {
    const headline = sd.headline || "Main Headline";
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
    paddingTop: `${sd.heroPaddingTop || 60}px`, 
    paddingBottom: `${sd.heroPaddingBottom || 60}px`, 
    borderRadius: `${cardRadius}px`, 
    position: 'relative', 
    overflow: 'hidden' 
  };

  if (sd.heroBgType === 'solid') sectionStyle.backgroundColor = sd.heroBgColor1 || '#ffffff';
  else if (sd.heroBgType === 'gradient') sectionStyle.background = `linear-gradient(135deg, ${sd.heroBgColor1 || '#ffffff'}, ${sd.heroBgColor2 || '#ffffff'})`;

  return (
    <div 
      onClick={() => isPreview && onSectionClick?.(section.id)}
      className={cn("w-full transition-all relative", isPreview && "hover:outline-2 hover:outline-dashed hover:outline-primary/50 cursor-pointer")}
    >
      <section className={cn("relative px-8 flex flex-col lg:flex-row w-full max-w-7xl mx-auto overflow-hidden gap-8", sd.heroImagePosition === 'left' ? 'lg:flex-row-reverse' : '', sd.heroAlign === 'center' ? 'items-center text-center' : sd.heroAlign === 'right' ? 'items-end text-right' : 'items-start text-left')} style={sectionStyle}>
        {sd.heroSectionBgImage && <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: `url(${sd.heroSectionBgImage})`, backgroundSize: 'cover', backgroundPosition: sd.heroSectionBgPosition || 'center', opacity: (sd.heroSectionBgOpacity ?? 100) / 100 }} />}
        {sd.heroSectionBgImage && <div className="absolute inset-0 z-[1] pointer-events-none" style={{ backgroundColor: sd.heroSectionBgOverlayColor || '#000000', opacity: (sd.heroSectionBgOverlayOpacity || 0) / 100 }} />}
        
        <div className="flex-1 relative z-10 space-y-4">
          {sd.heroBadgeEnabled && <Badge style={{ backgroundColor: sd.heroBadgeBgColor || themeColor, color: sd.heroBadgeTextColor || '#ffffff' }} className="font-black text-[9px] uppercase tracking-widest px-4 py-1 border-none shadow-sm">{sd.heroBadgeText}</Badge>}
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight" style={{ color: sd.headlineColor }} dangerouslySetInnerHTML={{ __html: renderHeadline() }} />
          <p className="text-sm leading-relaxed max-w-2xl mx-auto lg:mx-0" style={{ color: sd.subheadlineColor }}>{sd.subheadline}</p>
          <div className="flex flex-wrap gap-3 items-center" style={{ justifyContent: sd.heroAlign === 'center' ? 'center' : sd.heroAlign === 'right' ? 'flex-end' : 'flex-start' }}>
            <button className="h-12 px-8 rounded-xl font-black text-sm text-white shadow-xl border-none" style={{ backgroundColor: sd.heroPrimaryBtnColor || themeColor, borderRadius: `${sd.heroPrimaryBtnRadius ?? cardRadius / 2}px` }}>{sd.ctaText || "Get Started"}</button>
            {sd.heroSecondaryEnabled && <button className="h-12 px-8 rounded-xl font-black text-sm border-none shadow-xl" style={{ backgroundColor: sd.heroSecondaryBtnColor || '#f3f4f6', color: sd.heroSecondaryTextColor || '#111827', borderRadius: `${sd.heroPrimaryBtnRadius ?? cardRadius / 2}px` }}>{sd.heroSecondaryText}</button>}
          </div>
        </div>

        {sd.heroImage && (
          <div className="flex-1 overflow-hidden shadow-2xl relative z-10 group" style={{ borderRadius: `${sd.heroImageRadius ?? cardRadius}px` }}>
            <img src={sd.heroImage} className="w-full h-auto object-cover" style={{ opacity: (sd.heroImageOpacity ?? 100) / 100 }} alt="" />
            {(sd.heroOverlayOpacity ?? 0) > 0 && (
              <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: sd.heroOverlayOpacity / 100 }}></div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}