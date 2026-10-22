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

export function StepsBlock({ section, site, isPreview, onSectionClick }: any) {
  const sd = section.data || {};
  const themeColor = site.themeColor || '#6750A4';
  const cardRadius = site.cardRadius || 32;

  const renderHeadline = () => {
    const headline = sd.stepsSectionTitle || "Our Process";
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
  
  if (sd.stepsSectionBgType === 'gradient') sectionStyle.background = `linear-gradient(135deg, ${sd.stepsSectionBgColor1 || '#ffffff'}, ${sd.stepsSectionBgColor2 || '#ffffff'})`;
  else sectionStyle.backgroundColor = sd.stepsSectionBgColor1 || 'transparent';

  const renderContent = () => (
    <div className={cn("space-y-4 mb-12", sd.titleAlign === 'center' ? 'text-center' : sd.titleAlign === 'right' ? 'text-right' : 'text-left')}>
      <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight" style={{ color: sd.sectionTitleColor || 'inherit' }} dangerouslySetInnerHTML={{ __html: renderHeadline() }} />
      {sd.sectionDescription && <p className="text-sm sm:text-base opacity-60 font-medium max-w-2xl mx-auto lg:mx-0">{sd.sectionDescription}</p>}
    </div>
  );

  const renderSteps = () => (
    <div className={cn("grid gap-8", sd.stepsLayout === 'grid2' ? 'grid-cols-1 md:grid-cols-2' : sd.stepsLayout === 'grid3' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
       {Array.isArray(sd.howItWorks) && sd.howItWorks.filter(Boolean).map((item: any, idx: number) => {
         const Icon = ICON_MAP[item.icon || 'check'] || CheckCircle2;
         const cardStyle: any = { 
            borderRadius: `${item.cardRadius ?? cardRadius}px`, 
            textAlign: item.cardTextAlign || 'left',
            borderWidth: `${item.cardBorderWidth || 0}px`,
            borderColor: item.cardBorderColor || '#eeeeee',
            borderStyle: 'solid'
         };
         if (item.cardBgType === 'gradient') cardStyle.background = `linear-gradient(135deg, ${item.cardBgColor1 || '#ffffff'}, ${item.cardBgColor2 || '#ffffff'})`;
         else cardStyle.backgroundColor = item.cardBgColor1 || '#ffffff';

         return (
           <div key={idx} className="p-8 transition-all flex flex-col group relative overflow-hidden shadow-xl" style={cardStyle}>
              <div className="mb-6 flex items-center" style={{ justifyContent: item.cardTextAlign === 'center' ? 'center' : item.cardTextAlign === 'right' ? 'flex-end' : 'flex-start' }}>
                 <div className={cn("flex items-center justify-center font-black text-white shadow-lg", item.stepShape === 'circle' ? 'rounded-full' : 'rounded-xl')} style={{ width: `${item.stepSize || 40}px`, height: `${item.stepSize || 40}px`, background: item.stepType === 'gradient' ? `linear-gradient(135deg, ${item.stepColor1 || themeColor}, ${item.stepColor2 || themeColor})` : (item.stepColor1 || themeColor) }}>
                    {item.showIcon ? <Icon className="h-5 w-5" /> : (idx + 1)}
                 </div>
              </div>
              <h4 className="text-xl font-black mb-2 leading-tight" style={{ color: item.titleColor || '#111827' }}>{item.title}</h4>
              <p className="text-sm opacity-70 leading-relaxed">{item.desc}</p>
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
              <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-12 items-center", sd.splitPosition === 'right' ? 'lg:flex-row-reverse' : '')}>
                  <div className="lg:col-span-5">{renderContent()}</div>
                  <div className="lg:col-span-7">{renderSteps()}</div>
              </div>
            ) : (
              <> {renderContent()} {renderSteps()} </>
            )}
         </div>
      </section>
    </div>
  );
}
