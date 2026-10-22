'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Zap, Star, Heart, Clock, ShieldCheck, ThumbsUp } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  check: CheckCircle2,
  zap: Zap,
  star: Star,
  heart: Heart,
  clock: Clock,
  shield: ShieldCheck,
  thumb: ThumbsUp
};

const hexToRgba = (hex: string, alpha: number) => {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function BenefitsBlock({ section, site, isPreview, onSectionClick }: any) {
  const sd = section.data || {};
  const themeColor = site.themeColor || '#6750A4';
  const cardRadius = site.cardRadius || 32;

  const sectionStyle: any = { 
    paddingTop: '40px', 
    paddingBottom: '40px', 
    borderRadius: `${cardRadius}px`, 
    position: 'relative', 
    overflow: 'hidden' 
  };
  
  if (sd.sectionBgType === 'solid') sectionStyle.backgroundColor = sd.sectionBgColor1 || 'transparent';
  else if (sd.sectionBgType === 'gradient') sectionStyle.background = `linear-gradient(135deg, ${sd.sectionBgColor1 || '#ffffff'}, ${sd.sectionBgColor2 || '#ffffff'})`;

  return (
    <div 
      onClick={() => isPreview && onSectionClick?.(section.id)}
      className={cn("w-full transition-all relative", isPreview && "hover:outline-2 hover:outline-dashed hover:outline-primary/50 cursor-pointer")}
    >
      <section className="px-6 w-full max-w-7xl mx-auto relative z-10" style={sectionStyle}>
        <h2 className={cn("text-2xl sm:text-4xl font-black mb-12 uppercase tracking-tight", sd.titleAlign === 'center' ? 'text-center' : sd.titleAlign === 'right' ? 'text-right' : 'text-left')} style={{ color: sd.sectionTitleColor || 'inherit' }}>{sd.sectionTitle}</h2>
        <div className={cn("grid gap-8", sd.layout === 'list' ? 'grid-cols-1' : sd.layout === 'grid2' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3')}>
           {Array.isArray(sd.items) && sd.items.filter(Boolean).map((item: any, idx: number) => {
             const Icon = ICON_MAP[item.icon || 'check'] || Zap;
             const cardStyle: any = { 
                borderRadius: `${item.cardRadius ?? cardRadius}px`, 
                textAlign: item.cardTextAlign || 'left', 
                borderWidth: `${item.cardBorderWidth || 0}px`, 
                borderColor: item.cardBorderColor || '#eeeeee',
                borderStyle: item.cardBorderStyle || 'solid',
                overflow: 'hidden'
             };
             
             if (item.cardBgType === 'solid') cardStyle.backgroundColor = item.cardBgColor1 || '#ffffff';
             else if (item.cardBgType === 'gradient') cardStyle.background = `linear-gradient(135deg, ${item.cardBgColor1 || '#ffffff'}, ${item.cardBgColor2 || '#ffffff'})`;
             
             let interactionStyles: any = {};
             if (item.cardShadow === 'xl') interactionStyles.boxShadow = `0 20px 40px ${hexToRgba(item.shadowColor || '#000000', 0.15)}`;
             else if (item.cardShadow === 'md') interactionStyles.boxShadow = `0 10px 20px ${hexToRgba(item.shadowColor || '#000000', 0.1)}`;

             return (
               <div 
                 key={idx} 
                 className={cn(
                   "transition-all duration-500 flex flex-col group relative", 
                   item.hoverEffect === 'lift' ? 'hover:-translate-y-2' : 
                   item.hoverEffect === 'scale' ? 'hover:scale-105' : 
                   item.hoverEffect === 'glow' ? 'glow-node' : ''
                 )} 
                 style={{
                    ...cardStyle, 
                    ...interactionStyles,
                    '--glow-color': hexToRgba(item.hoverColor || themeColor, 0.4)
                 } as any}
               >
                  <div className="p-8 flex flex-col flex-1">
                    {item.showIcon !== false && (
                      <div className="mb-6 flex items-center" style={{ justifyContent: item.cardTextAlign === 'center' ? 'center' : item.cardTextAlign === 'right' ? 'flex-end' : 'flex-start' }}>
                        <div className={cn("flex items-center justify-center shadow-lg", item.iconShape === 'circle' ? 'rounded-full' : item.iconShape === 'square' ? 'rounded-none' : 'rounded-2xl')} style={{ width: `${item.iconContainerSize || 56}px`, height: `${item.iconContainerSize || 56}px`, background: item.iconBgType === 'gradient' ? `linear-gradient(135deg, ${item.iconBgColor1 || '#6750A4'}, ${item.iconBgColor2 || '#6750A4'})` : (item.iconBgColor1 || '#6750A4') }}>
                          <div className="h-6 w-6" style={{ color: item.iconColor || '#ffffff' }}>{Icon && <Icon className="w-full h-full" />}</div>
                        </div>
                      </div>
                    )}
                    <h4 className="text-xl font-black mb-3 leading-tight" style={{ color: item.titleColor || '#111827' }}>{item.title}</h4>
                    <p className="text-sm opacity-70 leading-relaxed flex-1">{item.desc}</p>
                  </div>
               </div>
             );
           })}
        </div>
      </section>
    </div>
  );
}
