'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function CTABlock({ section, site, isPreview, onSectionClick }: any) {
  const sd = section.data || {};
  const themeColor = site.themeColor || '#6750A4';
  const cardRadius = site.cardRadius || 32;

  const renderHeadline = () => {
    const headline = sd.sectionTitle || "Ready to Start?";
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
  
  if (sd.sectionBgType === 'solid') sectionStyle.backgroundColor = sd.sectionBgColor1 || '#ffffff';
  else if (sd.sectionBgType === 'gradient') sectionStyle.background = `linear-gradient(135deg, ${sd.sectionBgColor1 || '#ffffff'}, ${sd.sectionBgColor2 || '#ffffff'})`;

  return (
    <div 
      onClick={() => isPreview && onSectionClick?.(section.id)}
      className={cn("w-full transition-all relative px-6", isPreview && "hover:outline-2 hover:outline-dashed hover:outline-primary/50 cursor-pointer")}
    >
      <section className={cn("relative px-8 flex flex-col w-full max-w-7xl mx-auto overflow-hidden", sd.ctaImage ? 'lg:flex-row gap-12' : '', sd.ctaImagePosition === 'left' ? 'lg:flex-row-reverse' : '', sd.titleAlign === 'center' ? 'items-center text-center' : sd.titleAlign === 'right' ? 'items-end text-right' : 'items-start text-left')} style={sectionStyle}>
        
        {/* Background Layers */}
        {sd.sectionBgImage && (
          <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: `url(${sd.sectionBgImage})`, backgroundSize: 'cover', backgroundPosition: sd.sectionBgPosition || 'center', opacity: (sd.sectionBgOpacity ?? 100) / 100 }} />
        )}
        {sd.sectionBgImage && (
          <div className="absolute inset-0 z-[1] pointer-events-none" style={{ backgroundColor: sd.sectionBgOverlayColor || '#000000', opacity: (sd.sectionBgOverlayOpacity || 0) / 100 }} />
        )}
        
        <div className="flex-1 relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-6xl font-black tracking-tight leading-tight" style={{ color: sd.sectionTitleColor || 'inherit' }} dangerouslySetInnerHTML={{ __html: renderHeadline() }} />
          <p className="text-lg opacity-70 leading-relaxed font-medium max-w-2xl mx-auto lg:mx-0">
            {sd.sectionDescription}
          </p>
          <div className="pt-4">
            <button 
              className="h-16 px-12 rounded-2xl font-black text-lg text-white shadow-2xl border-none transition-all hover:scale-105 active:scale-95" 
              style={{ 
                backgroundColor: sd.ctaButtonColor || themeColor, 
                borderRadius: `${cardRadius / 2}px`,
                boxShadow: `0 20px 40px ${sd.ctaButtonColor || themeColor}40`
              }}
            >
              {sd.ctaButtonText || "Get Started"}
            </button>
          </div>
        </div>

        {sd.ctaImage && (
          <div className="flex-1 overflow-hidden shadow-2xl relative z-10 group" style={{ borderRadius: `${sd.ctaImageRadius ?? cardRadius}px` }}>
            <img src={sd.ctaImage} className="w-full h-auto object-cover transition-opacity duration-500" style={{ opacity: (sd.ctaImageOpacity ?? 100) / 100 }} alt="" />
          </div>
        )}
      </section>
    </div>
  );
}

