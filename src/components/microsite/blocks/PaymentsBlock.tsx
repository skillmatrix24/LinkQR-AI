'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Wallet, ExternalLink, BadgeIndianRupee, Loader2, CheckCircle2, PartyPopper, Zap } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PaymentsBlock({ section, site, isPreview, onSectionClick }: any) {
  const sd = section.data || {};
  const themeColor = site.themeColor || '#6750A4';
  const cardRadius = site.cardRadius || 32;

  const [showQR, setShowQR] = useState(false);
  const [showUTRForm, setShowUTRForm] = useState(false);
  const [utr, setUtr] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const upiUrl = `upi://pay?pa=${sd.upiId}&pn=${encodeURIComponent(sd.productName || 'Payment')}&am=${sd.productPrice}&cu=INR`;

  const handlePay = () => {
    if (isPreview) return;
    if (sd.paymentType === 'link' && sd.externalPaymentUrl) {
      window.open(sd.externalPaymentUrl, '_blank');
      return;
    }
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) window.location.href = upiUrl;
    else setShowQR(true);
  };

  const renderHeadline = () => {
    const headline = sd.sectionTitle || "Complete Your Purchase";
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

  if (sd.sectionBgType === 'gradient') {
    sectionStyle.background = `linear-gradient(135deg, ${sd.sectionBgColor1 || '#fafafa'}, ${sd.sectionBgColor2 || '#fafafa'})`;
  } else {
    sectionStyle.backgroundColor = sd.sectionBgColor1 || 'transparent';
  }

  const nodeStyle: any = {
    borderRadius: `${sd.cardRadius ?? cardRadius}px`,
    overflow: 'hidden',
    borderWidth: `${sd.cardBorderWidth || 0}px`,
    borderColor: sd.cardBorderColor || '#eeeeee',
    borderStyle: sd.cardBorderStyle || 'solid',
    transition: 'all 0.5s ease'
  };

  if (sd.cardBgType === 'gradient') {
    nodeStyle.background = `linear-gradient(135deg, ${sd.cardBgColor1 || '#ffffff'}, ${sd.cardBgColor2 || '#ffffff'})`;
  } else {
    nodeStyle.backgroundColor = sd.cardBgColor1 || '#ffffff';
  }

  const hexToRgba = (hex: string, alpha: number) => {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  if (sd.cardShadow === 'xl') nodeStyle.boxShadow = `0 30px 60px ${hexToRgba(sd.cardShadowColor || '#000000', 0.15)}`;
  else if (sd.cardShadow === 'md') nodeStyle.boxShadow = `0 15px 30px ${hexToRgba(sd.cardShadowColor || '#000000', 0.1)}`;

  if (!sd.paymentEnabled && !isPreview) return null;

  const renderContent = () => (
    <div className={cn("space-y-6 relative z-10", sd.titleAlign === 'center' ? 'items-center text-center' : sd.titleAlign === 'right' ? 'items-end text-right' : 'items-start text-left')}>
       <h2 className="text-3xl sm:text-6xl font-black uppercase tracking-tight leading-tight" style={{ color: sd.sectionTitleColor || 'inherit' }} dangerouslySetInnerHTML={{ __html: renderHeadline() }} />
       <p className="text-base sm:text-xl opacity-60 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">{sd.sectionDescription}</p>
    </div>
  );

  const renderCard = () => (
    <div className="w-full max-w-lg mx-auto space-y-6 relative z-10">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="p-10 sm:p-14 bg-emerald-50 rounded-[3rem] text-center border-2 border-emerald-100 shadow-2xl relative overflow-hidden"
            style={{ borderRadius: `${sd.cardRadius ?? cardRadius}px` }}
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><PartyPopper className="h-40 w-40 text-emerald-600" /></div>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-2 border-white">
              <CheckCircle2 className="h-10 w-10" />
            </motion.div>
            <h4 className="text-2xl font-black text-emerald-900 mb-2">{sd.successMessage || "Verification Sent!"}</h4>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest opacity-60">Status: Pending Review</p>
          </motion.div>
        ) : (
          <motion.div key="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <Card className="border-none shadow-2xl overflow-hidden group" style={nodeStyle}>
              <div className="p-8 sm:p-12 space-y-8">
                <div className="flex justify-between items-start">
                   <div className="space-y-1.5">
                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.2em] border-primary/20 text-primary bg-primary/5 px-3">Secure Node</Badge>
                      <h4 className="text-2xl font-black tracking-tight" style={{ color: sd.cardTitleColor }}>{sd.productName || "Direct Access"}</h4>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Offer Price</p>
                      <p className="text-3xl font-black text-primary">₹{sd.productPrice}</p>
                   </div>
                </div>
                
                <Button 
                  onClick={handlePay} 
                  className="w-full h-16 rounded-2xl font-black text-lg shadow-xl border-none transition-all hover:scale-[1.02] active:scale-95 group" 
                  style={{ 
                    backgroundColor: sd.btnColor || themeColor, 
                    borderRadius: `${(sd.cardRadius || cardRadius) / 2}px`, 
                    color: '#ffffff',
                    boxShadow: `0 15px 30px ${hexToRgba(sd.btnColor || themeColor, 0.4)}`
                  }}
                >
                  <Zap className="h-5 w-5 mr-3 fill-current group-hover:animate-pulse" />
                  {sd.paymentType === 'upi' ? "PAY VIA UPI" : "CHECKOUT NOW"}
                </Button>

                {showQR && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="p-6 bg-neutral-50 rounded-[2rem] border-2 border-dashed flex flex-col items-center">
                    <QRCodeSVG value={upiUrl} size={180} />
                    <p className="text-[9px] font-black uppercase mt-4 opacity-40 tracking-[0.2em]">Scan with any UPI Application</p>
                  </motion.div>
                )}
              </div>
              <div className="p-4 bg-neutral-900 text-white flex items-center justify-center gap-3">
                 <ShieldCheck className="h-4 w-4 text-emerald-400" />
                 <span className="text-[9px] font-black uppercase tracking-[0.2em]">End-to-End Encryption Protocol</span>
              </div>
            </Card>

            {sd.confirmationEnabled !== false && !showUTRForm && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowUTRForm(true)} className="w-full py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-3">
                 <div className="h-1 w-8 bg-current opacity-20" /> I have paid • Verify UTR <div className="h-1 w-8 bg-current opacity-20" />
              </motion.button>
            )}

            {showUTRForm && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-6 sm:p-8 bg-white rounded-[2.5rem] border-2 border-primary/10 shadow-2xl space-y-5">
                 <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><ShieldCheck className="h-4 w-4" /></div>
                    <Label className="text-[10px] font-black uppercase text-primary tracking-widest">{sd.confirmationHeadline || "Verify Payment"}</Label>
                 </div>
                 <div className="flex gap-2">
                    <Input 
                      value={utr} 
                      onChange={(e) => setUtr(e.target.value)} 
                      placeholder="12-digit ID" 
                      className="h-12 rounded-xl font-mono text-center text-lg bg-neutral-50 border-none shadow-inner" 
                    />
                    <Button onClick={() => setSubmitted(true)} disabled={!utr} className="h-12 px-6 rounded-xl font-black text-xs uppercase shadow-lg">SUBMIT</Button>
                 </div>
                 <button onClick={() => setShowUTRForm(false)} className="text-[8px] font-black uppercase text-muted-foreground mx-auto block hover:text-primary transition-colors">Go Back</button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div 
      onClick={() => isPreview && onSectionClick?.(section.id)}
      className={cn("w-full transition-all relative px-6", isPreview && "hover:outline-2 hover:outline-dashed hover:outline-primary/50 cursor-pointer")}
    >
      <section style={sectionStyle} className="px-6 relative z-10 w-full max-w-7xl mx-auto">
        {sd.sectionBgImage && (
          <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: `url(${sd.sectionBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: (sd.sectionBgOpacity ?? 100) / 100 }} />
        )}
        {sd.sectionBgImage && (
          <div className="absolute inset-0 z-[1] pointer-events-none" style={{ backgroundColor: sd.sectionBgOverlayColor || '#000000', opacity: (sd.sectionBgOverlayOpacity || 0) / 100 }} />
        )}

        {sd.layoutSplit ? (
          <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-12 items-center", sd.splitPosition === 'right' ? 'lg:flex-row-reverse' : '')}>
             <div className="lg:col-span-6">
                {renderContent()}
             </div>
             <div className="lg:col-span-6">
                {renderCard()}
             </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-12">
            {renderContent()}
            {renderCard()}
          </div>
        )}
      </section>
    </div>
  );
}
