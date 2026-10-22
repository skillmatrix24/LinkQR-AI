'use client';

import React from 'react';
import { HeroBlock } from './blocks/HeroBlock';
import { BenefitsBlock } from './blocks/BenefitsBlock';
import { FeaturesBlock } from './blocks/FeaturesBlock';
import { StepsBlock } from './blocks/StepsBlock';
import { CTABlock } from './blocks/CTABlock';
import { GalleryBlock } from './blocks/GalleryBlock';
import { SocialBlock } from './blocks/SocialBlock';
import { FAQBlock } from './blocks/FAQBlock';
import { ReviewsBlock } from './blocks/ReviewsBlock';
import { LeadFormBlock } from './blocks/LeadFormBlock';
import { CountdownBlock } from './blocks/CountdownBlock';
import { PaymentsBlock } from './blocks/PaymentsBlock';
import { LegalBlock } from './blocks/LegalBlock';
import { FooterBlock } from './blocks/FooterBlock';
import { VideoBlock } from './blocks/VideoBlock';
import { ProductsBlock } from './blocks/ProductsBlock';
import { VCardBlock } from './blocks/VCardBlock';
import { ContactBlock } from './blocks/ContactBlock';
import { BioBlock } from './blocks/BioBlock';
import { cn } from '@/lib/utils';

interface BlockRendererProps {
  site: any;
  isPreview?: boolean;
  onSectionClick?: (id: string) => void;
}

/**
 * Master Registry for all Microsite Components.
 * Wraps sections in clickable divs when in preview mode for direct editing.
 */
export function BlockRenderer({ site, isPreview, onSectionClick }: BlockRendererProps) {
  if (!site || !Array.isArray(site.sections)) return null;

  return (
    <div className="flex flex-col w-full" style={{ gap: `${site.sectionSpacing || 24}px` }}>
      {site.sections.map((section: any) => {
        const props = { section, site, isPreview, onSectionClick };
        
        let BlockComponent = null;
        switch (section.type) {
          case 'vcard': BlockComponent = <VCardBlock {...props} />; break;
          case 'bio': BlockComponent = <BioBlock {...props} />; break;
          case 'contact': BlockComponent = <ContactBlock {...props} />; break;
          case 'hero': BlockComponent = <HeroBlock {...props} />; break;
          case 'benefits': BlockComponent = <BenefitsBlock {...props} />; break;
          case 'features': BlockComponent = <FeaturesBlock {...props} />; break;
          case 'products': BlockComponent = <ProductsBlock {...props} />; break;
          case 'steps': BlockComponent = <StepsBlock {...props} />; break;
          case 'cta': BlockComponent = <CTABlock {...props} />; break;
          case 'gallery': BlockComponent = <GalleryBlock {...props} />; break;
          case 'social': BlockComponent = <SocialBlock {...props} />; break;
          case 'faq': BlockComponent = <FAQBlock {...props} />; break;
          case 'reviews': BlockComponent = <ReviewsBlock {...props} />; break;
          case 'leadForm': BlockComponent = <LeadFormBlock {...props} />; break;
          case 'video': BlockComponent = <VideoBlock {...props} />; break;
          case 'countdown': BlockComponent = <CountdownBlock {...props} />; break;
          case 'payments': BlockComponent = <PaymentsBlock {...props} />; break;
          case 'legal': BlockComponent = <LegalBlock {...props} />; break;
          case 'footer': BlockComponent = <FooterBlock {...props} />; break;
          default:
            BlockComponent = (
              <div className="p-8 text-center opacity-20 border-2 border-dashed rounded-xl">
                Unknown Block Type: {section.type}
              </div>
            );
        }

        return (
          <div 
            key={section.id} 
            className={cn(isPreview && "preview-section")}
            onClick={() => isPreview && onSectionClick?.(section.id)}
          >
            {BlockComponent}
          </div>
        );
      })}
    </div>
  );
}
