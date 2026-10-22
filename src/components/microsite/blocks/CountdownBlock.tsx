'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion } from "framer-motion";

const hexToRgba = (hex: string, alpha: number) => {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function CountdownBlock({ section, site, isPreview, onSectionClick }: any) {
  const sd = section.data || {};
  const cardRadius = site.cardRadius || 32;

  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [displayPercent, setDisplayPercent] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const target = new Date(sd.targetDate || Date.now() + 86400000).getTime();
      const now = new Date().getTime();
      const diff = target - now;
      if (diff <= 0) { 
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        clearInterval(timer); 
        return; 
      }
      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000)
      });
    }, 1000);
    
    setDisplayPercent(sd.scarcityPercent || 80);
    return () => clearInterval(timer);
  }, [sd.targetDate, sd.scarcityPercent]);

  const isExpired = new Date(sd.targetDate).getTime() < Date.now();
  if (isExpired && sd.expiryAction === 'hide') return null;

  const scarcityVal = displayPercent || 80;
  const scale = sd.timerScale || 1.0;

  const sectionStyle: any = { 
    paddingTop: `${sd.sectionPaddingTop || 80}px`, 
    paddingBottom: `${sd.sectionPaddingBottom || 80}px`,
    borderRadius: `${cardRadius}px`,
    position: 'relative',
    overflow: 'hidden'
  };

  if (sd.sectionBgType === 'gradient') {
    sectionStyle.background = `linear-gradient(135deg, ${sd.sectionBgColor1 || '#fafafa'}, ${sd.sectionBgColor2 || '#fafafa'})`;
  } else {
    sectionStyle.backgroundColor = sd.sectionBgColor1 || 'transparent';
  }

  // Timer Card (Node) Styles - PRO NODE DESIGNER RESTORED
  const nodeStyle: any = {
    borderRadius: `${sd.timerCardRadius ?? 32}px`,
    borderWidth: `${sd.timerCardBorderWidth || 1}px`,
    borderColor: sd.timerCardBorderColor || '#eeeeee',
    borderStyle: sd.timerCardBorderStyle || 'solid',
    overflow: 'hidden',
    transition: 'all 0.5s ease'
  };

  if (sd.timerCardBgType === 'gradient') {
    nodeStyle.background = `linear-gradient(135deg, ${sd.timerCardBgColor1 || '#ffffff'}, ${sd.timerCardBgColor2 || '#ffffff'})`;
  } else {
    nodeStyle.backgroundColor = sd.timerCardBgColor1 || '#ffffff';
  }

  if (sd.timerCardShadow === 'xl') nodeStyle.boxShadow = `0 20px 40px ${hexToRgba(sd.timerCardShadowColor || '#000000', 0.15)}`;
  else if (sd.timerCardShadow === 'md') nodeStyle.boxShadow = `0 10px 20px ${hexToRgba(sd.timerCardShadowColor || '#000000', 0.1)}`;

  return (
    <div 
      onClick={() => isPreview && onSectionClick?.(section.id)}
      className={cn("w-full transition-all relative", isPreview && "hover:outline-2 hover:outline-dashed hover:outline-primary/50 cursor-pointer")}
      style={sectionStyle}
    >
       <div className={cn(
         "flex flex-col w-full max-w-4xl mx-auto px-6 space-y-10",
         sd.titleAlign === 'center' ? 'items-center text-center' : sd.titleAlign === 'right' ? 'items-end text-right' : 'items-start text-left'
       )}>
          <div className="space-y-4">
             <h3 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight" style={{ color: sd.sectionTitleColor || 'inherit' }}>
                {isExpired ? (sd.expiryMessage || "Offer Expired") : sd.sectionTitle}
             </h3>
             <p className="text-base sm:text-lg opacity-60 font-medium max-w-2xl">{sd.sectionDescription}</p>
          </div>
          
          {!isExpired && (
            <div className="w-full flex" style={{ justifyContent: sd.titleAlign === 'center' ? 'center' : sd.titleAlign === 'right' ? 'flex-end' : 'flex-start' }}>
               <div 
                 className={cn("grid grid-cols-4 gap-2 sm:gap-6")}
                 style={{ transform: `scale(${scale})`, transformOrigin: sd.titleAlign === 'center' ? 'center' : sd.titleAlign === 'right' ? 'right' : 'left' }}
               >
                  {[
                    { v: timeLeft.d, l: 'Days' }, { v: timeLeft.h, l: 'Hrs' }, 
                    { v: timeLeft.m, l: 'Min' }, { v: timeLeft.s, l: 'Sec' }
                  ].map((t, i) => (
                    <div key={i} className="flex flex-col items-center justify-center p-3 sm:p-6" style={nodeStyle}>
                        <span className="text-xl sm:text-4xl font-black tracking-tighter" style={{ color: sd.timerValueColor || '#ef4444' }}>
                           {String(t.v).padStart(2, '0')}
                        </span>
                        <span className="text-[7px] sm:text-[9px] font-black uppercase mt-1 tracking-widest" style={{ color: sd.timerLabelColor || '#666666' }}>
                           {t.l}
                        </span>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {sd.scarcityEnabled && !isExpired && (
            <div className={cn("w-full max-w-md space-y-4", sd.titleAlign === 'right' ? 'ml-auto' : sd.titleAlign === 'center' ? 'mx-auto' : '')}>
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                  <span className="text-primary">{sd.scarcityText || "Offer Slots"}</span>
                  <span style={{ color: sd.timerValueColor || '#ef4444' }}>{scarcityVal}% Secured</span>
               </div>
               <div className="h-4 bg-neutral-200/50 rounded-full overflow-hidden p-1 shadow-inner border border-neutral-300/20">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${scarcityVal}%` }} 
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-full rounded-full" 
                    style={{ backgroundColor: sd.timerValueColor || '#ef4444', boxShadow: `0 0 15px ${sd.timerValueColor || '#ef4444'}60` }} 
                  />
               </div>
            </div>
          )}
       </div>
    </div>
  );
}
