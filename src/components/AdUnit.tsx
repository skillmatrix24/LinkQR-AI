'use client';

import { useEffect, useRef } from 'react';

interface AdUnitProps {
  slotId: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: 'true' | 'false';
  className?: string;
}

/**
 * Reusable Google AdSense Ad Component.
 * Removed default margin to prevent layout gaps.
 */
export function AdUnit({ slotId, format = 'auto', responsive = 'true', className = "" }: AdUnitProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    const timer = setTimeout(() => {
      try {
        // @ts-ignore
        if (window.adsbygoogle) {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          initialized.current = true;
        }
      } catch (e) {
        console.warn("AdSense failed to push ad unit", e);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`ad-container overflow-hidden flex justify-center w-full min-h-[90px] ${className}`}>
      <ins 
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '250px', minHeight: '90px' }}
        data-ad-client="ca-pub-3756451089935740" 
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
