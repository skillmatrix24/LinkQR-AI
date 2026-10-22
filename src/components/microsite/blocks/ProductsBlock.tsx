'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  ShoppingBag, 
  Tag, 
  ShieldCheck, 
  Zap, 
  X, 
  CheckCircle2, 
  PartyPopper,
  BadgeIndianRupee,
  Wallet,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Info,
  ExternalLink,
  ArrowRight,
  ShoppingCart,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from "qrcode.react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

const hexToRgba = (hex: string, alpha: number) => {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function ProductsBlock({ section, site, isPreview, onSectionClick }: any) {
  const sd = section.data || {};
  const themeColor = site.themeColor || '#6750A4';
  const cardRadius = site.cardRadius || 32;

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [utr, setUtr] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleOpenDetail = (product: any) => {
    if (isPreview) return;
    if (product.showDetailPopup === false) {
       handleOpenCheckout(product);
       return;
    }
    setSelectedProduct(product);
    setShowDetail(true);
  };

  const handleOpenCheckout = (product: any) => {
    if (isPreview) return;
    setSelectedProduct(product);
    setShowDetail(false);
    setShowCheckout(true);
    setSubmitted(false);
    setUtr("");
  };

  const upiUrl = selectedProduct ? `upi://pay?pa=${sd.upiId || ''}&pn=${encodeURIComponent(site.businessName || 'LinkQR')}&am=${selectedProduct.salePrice || selectedProduct.price}&cu=INR&tn=${encodeURIComponent('Order: ' + selectedProduct.title)}` : "";

  const renderHeadline = () => {
    const headline = sd.sectionTitle || "Featured Products";
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

  if (sd.sectionBgType === 'gradient') {
    sectionStyle.background = `linear-gradient(135deg, ${sd.sectionBgColor1 || '#fafafa'}, ${sd.sectionBgColor2 || '#fafafa'})`;
  } else {
    sectionStyle.backgroundColor = sd.sectionBgColor1 || 'transparent';
  }

  const columnsMap: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const renderContent = () => (
    <div className={cn("space-y-6 relative z-10", sd.titleAlign === 'center' ? 'items-center text-center' : sd.titleAlign === 'right' ? 'items-end text-right' : 'items-start text-left')}>
       <h2 className="text-3xl sm:text-6xl font-black uppercase tracking-tight leading-tight" style={{ color: sd.sectionTitleColor || 'inherit' }} dangerouslySetInnerHTML={{ __html: renderHeadline() }} />
       {sd.sectionDescription && <p className="text-base sm:text-xl opacity-60 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0" style={{ color: sd.sectionTitleColor ? `${sd.sectionTitleColor}80` : 'inherit' }}>{sd.sectionDescription}</p>}
    </div>
  );

  // Popup Specific Styles
  const popupBtnStyle: any = {
     backgroundColor: sd.popupBtnStyle === 'solid' ? (sd.popupBtnColor || themeColor) : 'transparent',
     color: sd.popupBtnStyle === 'solid' ? (sd.popupBtnTextColor || '#ffffff') : (sd.popupBtnColor || themeColor),
     borderColor: sd.popupBtnStyle === 'outline' ? (sd.popupBtnColor || themeColor) : 'transparent',
     borderWidth: sd.popupBtnStyle === 'outline' ? '2px' : '0px',
     borderRadius: `${sd.cardRadius || cardRadius}px`
  };

  return (
    <div 
      onClick={() => isPreview && onSectionClick?.(section.id)}
      className={cn("w-full transition-all relative px-6", isPreview && "hover:outline-2 hover:outline-dashed hover:outline-primary/50 cursor-pointer")}
    >
      <section style={sectionStyle} className="px-6 relative z-10 w-full max-w-7xl mx-auto">
        {/* Background Layers */}
        {sd.sectionBgImage && (
          <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: `url(${sd.sectionBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: (sd.sectionBgOpacity ?? 100) / 100 }} />
        )}
        {sd.sectionBgImage && (
          <div className="absolute inset-0 z-[1] pointer-events-none" style={{ backgroundColor: sd.sectionBgOverlayColor || '#000000', opacity: (sd.sectionBgOverlayOpacity || 0) / 100 }} />
        )}

        {sd.layoutSplit ? (
          <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-12 items-start", sd.splitPosition === 'right' ? 'lg:flex-row-reverse' : '')}>
             <div className="lg:col-span-5">
                {renderContent()}
             </div>
             <div className="lg:col-span-7">
                <div className={cn("grid", columnsMap[sd.columns || 3])} style={{ gap: `${sd.itemGap || 24}px` }}>
                   {Array.isArray(sd.items) && sd.items.map((product: any, idx: number) => (
                     <ProductCard key={product.id || idx} product={product} themeColor={themeColor} cardRadius={cardRadius} onOpenDetail={handleOpenDetail} />
                   ))}
                </div>
             </div>
          </div>
        ) : (
          <div className="space-y-12">
            {renderContent()}
            <div className={cn("grid", columnsMap[sd.columns || 3])} style={{ gap: `${sd.itemGap || 24}px` }}>
               {Array.isArray(sd.items) && sd.items.map((product: any, idx: number) => (
                 <ProductCard key={product.id || idx} product={product} themeColor={themeColor} cardRadius={cardRadius} onOpenDetail={handleOpenDetail} />
               ))}
            </div>
          </div>
        )}

        {/* 1. PRODUCT DETAIL MODAL (WooCommerce Pro View) */}
        <AnimatePresence>
          {showDetail && selectedProduct && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-8">
              <div 
                className="absolute inset-0" 
                style={{ 
                    backgroundColor: sd.popupOverlayColor || '#000000', 
                    opacity: (sd.popupOverlayOpacity ?? 80) / 100,
                    backdropFilter: `blur(${sd.popupBlur || 8}px)`
                }} 
                onClick={() => setShowDetail(false)} 
              />
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row border">
                 <button onClick={() => setShowDetail(false)} className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/10 hover:bg-neutral-100 flex items-center justify-center text-neutral-500 z-20 shadow-xl border"><X className="h-5 w-5" /></button>
                 
                 <div className="flex-1 bg-neutral-50 flex items-center justify-center p-8 overflow-hidden">
                    <img 
                      src={selectedProduct.image} 
                      className="max-h-full max-w-full object-contain transition-all duration-700" 
                      style={{ 
                        borderRadius: `${sd.popupImageRadius || 24}px`,
                        boxShadow: sd.popupImageShadow === 'xl' ? '0 30px 60px rgba(0,0,0,0.15)' : sd.popupImageShadow === 'md' ? '0 15px 30px rgba(0,0,0,0.1)' : 'none'
                      }}
                      alt={selectedProduct.title} 
                    />
                 </div>

                 <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center space-y-8 overflow-y-auto">
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          {sd.showPopupBadges !== false && selectedProduct.badgeText && (
                            <Badge variant="outline" className="font-black text-[9px] uppercase tracking-widest border-primary/20 text-primary">{selectedProduct.badgeText}</Badge>
                          )}
                          {!selectedProduct.inStock && <Badge variant="destructive" className="font-black text-[9px] uppercase">Sold Out</Badge>}
                       </div>
                       <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">{selectedProduct.title}</h3>
                       
                       {sd.showPopupPrice !== false && (
                         <div className="flex items-center gap-4">
                            <p className="text-3xl font-black text-primary">₹{selectedProduct.salePrice || selectedProduct.price}</p>
                            {selectedProduct.salePrice && <p className="text-lg font-bold text-muted-foreground line-through opacity-50">₹{selectedProduct.price}</p>}
                         </div>
                       )}
                    </div>

                    {sd.showPopupDescription !== false && selectedProduct.description && (
                      <div className="space-y-4">
                         <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2"><Info className="h-3.5 w-3.5" /> Product Narrative</Label>
                         <p className="text-base text-muted-foreground leading-relaxed font-medium">{selectedProduct.description}</p>
                      </div>
                    )}

                    <div className="pt-8 border-t space-y-4">
                       <Button 
                         disabled={!selectedProduct.inStock} 
                         onClick={() => handleOpenCheckout(selectedProduct)}
                         className={cn(
                           "w-full h-16 font-black text-lg gap-3 shadow-2xl transition-all hover:scale-[1.02]",
                           sd.popupBtnStyle === 'outline' ? "bg-transparent border-2 shadow-none" : ""
                         )}
                         style={popupBtnStyle}
                       >
                          <Zap className="h-5 w-5 fill-current" /> {sd.popupBtnText || "BUY THIS ITEM NOW"}
                       </Button>
                       {sd.showPopupTrust !== false && (
                         <p className="text-[9px] text-center font-bold uppercase tracking-widest" style={{ color: sd.popupTrustTextColor || '#00000080' }}>
                           {sd.popupTrustText || "Instant UPI Redirection • 100% Secure"}
                         </p>
                       )}
                    </div>
                 </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. CHECKOUT MODAL */}
        <AnimatePresence>
          {showCheckout && selectedProduct && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowCheckout(false)} />
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl relative z-10">
                <button onClick={() => setShowCheckout(false)} className="absolute top-6 right-6 h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-all z-20"><X className="h-5 w-5" /></button>
                <div className="p-8 sm:p-10 space-y-8">
                  {submitted ? (
                    <div className="text-center py-10 space-y-6">
                      <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border-2 border-white"><PartyPopper className="h-10 w-10" /></div>
                      <div className="space-y-2">
                         <h3 className="text-2xl font-black text-emerald-900">Order Reported!</h3>
                         <p className="text-sm font-medium text-emerald-700 leading-relaxed px-4">आपका पेमेंट रेफरेंस **{utr}** सिंक हो गया है। जल्द ही आपसे संपर्क किया जाएगा।</p>
                      </div>
                      <Button className="w-full h-12 rounded-xl font-bold" onClick={() => setShowCheckout(false)}>Finish</Button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="flex items-center gap-4">
                         <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-inner shrink-0"><BadgeIndianRupee className="h-7 w-7" /></div>
                         <div className="min-w-0">
                            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest leading-none">CHECKOUT SECURE</p>
                            <p className="text-2xl font-black text-foreground tracking-tighter truncate">{selectedProduct.title}</p>
                            <p className="text-xl font-black text-primary">₹{selectedProduct.salePrice || selectedProduct.price}</p>
                         </div>
                      </div>

                      <div className="p-6 bg-neutral-50 rounded-[2rem] border-2 border-dashed border-primary/20 flex flex-col items-center gap-4">
                         <QRCodeSVG value={upiUrl} size={180} />
                         <div className="text-center space-y-1">
                            <p className="text-[10px] font-black uppercase text-primary tracking-widest">Scan to Pay</p>
                            <p className="text-[11px] font-mono text-muted-foreground">{sd.upiId}</p>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Payment ID / UTR Number</Label>
                            <div className="flex gap-2">
                               <Input value={utr} onChange={e => setUtr(e.target.value.replace(/\D/g, '').substring(0, 12))} placeholder="12-digit ID" className="h-14 rounded-xl text-center font-mono text-xl tracking-widest shadow-inner bg-neutral-50 border-none" />
                               <Button onClick={() => setSubmitted(true)} disabled={utr.length < 10} className="h-14 px-6 rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 shadow-xl">SEND</Button>
                            </div>
                         </div>
                         <div className="flex items-center justify-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            <p className="text-[9px] font-bold text-emerald-800 uppercase tracking-widest">Encrypted Transaction Hub</p>
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

function ProductCard({ product, themeColor, cardRadius, onOpenDetail }: any) {
  const hasSale = product.salePrice && product.salePrice < product.price;
  
  const cardStyle: any = {
    borderRadius: `${product.cardRadius ?? cardRadius}px`,
    borderWidth: `${product.cardBorderWidth || 0}px`,
    borderColor: product.cardBorderColor || '#eeeeee',
    borderStyle: 'solid',
    overflow: 'hidden',
    backgroundColor: '#ffffff'
  };

  if (product.cardBgType === 'gradient') cardStyle.background = `linear-gradient(135deg, ${product.cardBgColor1 || '#ffffff'}, ${product.cardBgColor2 || '#ffffff'})`;
  else cardStyle.backgroundColor = product.cardBgColor1 || '#ffffff';

  if (product.cardShadow === 'xl') cardStyle.boxShadow = `0 20px 40px rgba(0,0,0,0.08)`;
  else if (product.cardShadow === 'md') cardStyle.boxShadow = `0 10px 20px rgba(0,0,0,0.04)`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "flex flex-col group relative transition-all duration-500 cursor-pointer",
        product.hoverEffect === 'lift' ? 'hover:-translate-y-2' : product.hoverEffect === 'scale' ? 'hover:scale-105' : ''
      )}
      style={cardStyle}
      onClick={() => onOpenDetail(product)}
    >
      <div className="aspect-square relative overflow-hidden bg-neutral-50 border-b">
        {product.image ? (
          <img src={product.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={product.title} />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-neutral-200"><ShoppingBag className="h-12 w-12" /></div>
        )}
        
        {product.badgeEnabled && (
          <div className="absolute top-4 right-4 z-20">
             <Badge style={{ backgroundColor: product.badgeBgColor || themeColor, color: product.badgeTextColor || '#ffffff' }} className="font-black text-[8px] sm:text-[9px] uppercase px-3 py-1 border-none shadow-lg rounded-md">
               {product.badgeText}
             </Badge>
          </div>
        )}

        {!product.inStock && (
          <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
             <Badge variant="destructive" className="font-black uppercase h-9 px-5 text-[10px] rounded-xl shadow-2xl">SOLD OUT</Badge>
          </div>
        )}
        
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
           <div className="bg-white/90 backdrop-blur-md h-12 w-12 rounded-full flex items-center justify-center shadow-2xl transform scale-0 group-hover:scale-100 transition-transform duration-500">
              <Maximize2 className="h-5 w-5 text-primary" />
           </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1 space-y-4">
        <div className="space-y-1">
          <h4 className="text-base sm:text-xl font-black tracking-tight leading-tight truncate" style={{ color: product.titleColor || 'inherit' }}>{product.title}</h4>
          <p className="text-[11px] opacity-60 font-medium line-clamp-1 leading-relaxed italic">Tap to see full details...</p>
        </div>

        <div className="flex items-center gap-3 pt-2">
           <p className="text-xl sm:text-2xl font-black text-primary">₹{hasSale ? product.salePrice : product.price}</p>
           {hasSale && <p className="text-xs sm:text-sm font-bold text-muted-foreground line-through opacity-40">₹{product.price}</p>}
        </div>

        <Button 
          disabled={!product.inStock}
          className="w-full h-11 rounded-xl font-black text-[10px] sm:text-xs uppercase gap-2 shadow-lg mt-auto"
          style={{ backgroundColor: product.btnColor || themeColor, borderRadius: `${(product.cardRadius || cardRadius) / 2}px` }}
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {product.btnText || "Quick Shop"}
        </Button>
      </div>
    </motion.div>
  );
}
