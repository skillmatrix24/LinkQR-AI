'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Play } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export function VideoBlock({ section, site, isPreview, onSectionClick }: any) {
  const sd = section.data || {};
  const themeColor = site.themeColor || '#6750A4';
  const cardRadius = site.cardRadius || 32;

  const renderHeadline = () => {
    const headline = sd.sectionTitle || "Watch Our Demo";
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

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    let videoId = "";
    
    if (url.includes('youtube.com/shorts/')) {
        videoId = url.split('shorts/')[1].split('?')[0];
    } else if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('vimeo.com/')) {
        videoId = url.split('vimeo.com/')[1].split('?')[0];
    }

    if (!videoId) return url;

    if (url.includes('vimeo')) {
      return `https://player.vimeo.com/video/${videoId}?autoplay=${sd.autoplay ? 1 : 0}&loop=${sd.loop ? 1 : 0}`;
    }
    
    let params = `?autoplay=${sd.autoplay ? 1 : 0}&loop=${sd.loop ? 1 : 0}&playlist=${videoId}`;
    if (sd.hideControls) params += `&controls=0&modestbranding=1&rel=0`;
    return `https://www.youtube.com/embed/${videoId}${params}`;
  };

  const sectionStyle: any = { 
    paddingTop: `${sd.sectionPaddingTop || 80}px`, 
    paddingBottom: `${sd.sectionPaddingBottom || 80}px`,
    borderRadius: `${cardRadius}px`,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.5s ease'
  };

  if (sd.sectionBgType === 'gradient') {
    sectionStyle.background = `linear-gradient(135deg, ${sd.sectionBgColor1 || '#fafafa'}, ${sd.sectionBgColor2 || '#fafafa'})`;
  } else {
    sectionStyle.backgroundColor = sd.sectionBgColor1 || 'transparent';
  }

  const aspectRatios: Record<string, string> = {
    video: '16/9',
    classic: '4/3',
    square: '1/1',
    vertical: '9/16'
  };

  const hexToRgba = (hex: string, alpha: number) => {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div 
      onClick={() => isPreview && onSectionClick?.(section.id)}
      className={cn("w-full transition-all relative px-6", isPreview && "hover:outline-2 hover:outline-dashed hover:outline-primary/50 cursor-pointer")}
    >
      <section style={sectionStyle} className={cn("relative px-8 flex flex-col w-full max-w-7xl mx-auto overflow-hidden", sd.titleAlign === 'center' ? 'items-center text-center' : sd.titleAlign === 'right' ? 'items-end text-right' : 'items-start text-left')}>
        
        {sd.sectionBgImage && (
          <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: `url(${sd.sectionBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: (sd.sectionBgOpacity ?? 100) / 100 }} />
        )}
        {sd.sectionBgImage && (
          <div className="absolute inset-0 z-[1] pointer-events-none" style={{ backgroundColor: sd.sectionBgOverlayColor || '#000000', opacity: (sd.sectionBgOverlayOpacity || 0) / 100 }} />
        )}

        <div className="relative z-10 w-full space-y-12">
          <div className="space-y-4 max-w-4xl mx-auto">
             <h2 className="text-3xl sm:text-6xl font-black tracking-tight leading-tight" style={{ color: sd.sectionTitleColor || 'inherit' }} dangerouslySetInnerHTML={{ __html: renderHeadline() }} />
             <p className="text-base sm:text-xl opacity-60 font-medium leading-relaxed" style={{ color: sd.sectionDescColor || 'inherit' }}>{sd.sectionDescription}</p>
          </div>

          <div className={cn("w-full max-w-5xl mx-auto transition-all duration-700", sd.playerShadow === 'xl' ? 'shadow-2xl' : sd.playerShadow === 'md' ? 'shadow-xl' : 'shadow-none')} style={{ borderRadius: `${sd.playerRadius || 24}px`, overflow: 'hidden', boxShadow: sd.playerShadow === 'xl' ? `0 40px 80px ${hexToRgba(themeColor, 0.15)}` : sd.playerShadow === 'md' ? `0 20px 40px ${hexToRgba(themeColor, 0.1)}` : 'none' }}>
             <div className="relative w-full overflow-hidden bg-neutral-900" style={{ aspectRatio: aspectRatios[sd.videoAspectRatio || 'video'] }}>
                {sd.videoUrl ? (
                   <iframe
                     src={getEmbedUrl(sd.videoUrl)}
                     className="absolute inset-0 w-full h-full border-none"
                     allow="autoplay; fullscreen; picture-in-picture"
                     allowFullScreen
                   />
                ) : (
                   <div className="absolute inset-0 bg-neutral-100 flex flex-col items-center justify-center gap-4 text-neutral-400">
                      <Play className="h-16 w-16 opacity-20" />
                      <p className="font-black text-xs uppercase tracking-[0.3em]">Awaiting Media Feed</p>
                   </div>
                )}
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}