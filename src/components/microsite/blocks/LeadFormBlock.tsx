
'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, Send, Zap, ShieldCheck, Mail, User, Phone, Target, PartyPopper } from "lucide-react";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { processNewLeadAction } from "@/app/actions/leads";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

/**
 * LeadFormBlock: Dynamic Lead Generation Node.
 * Now includes Attribution Logic to link leads to specific scan events.
 */
export function LeadFormBlock({ section, site, isPreview, onSectionClick }: any) {
  const sd = section.data || {};
  const themeColor = site.themeColor || '#6750A4';
  const cardRadius = site.cardRadius || 32;
  const db = useFirestore();
  const { toast } = useToast();

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    mobile: '',
    business: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) return;
    if (!db || !site._userId) return;

    setLoading(true);
    try {
      // ATTRIBUTION RETRIEVAL (From Redirection Session)
      const attributionQrId = sessionStorage.getItem('lqr_attribution_qr') || "direct_visit";

      const leadData = {
        ...formValues,
        userId: site._userId,
        micrositeId: site.id,
        attributionQrId,
        source: site.businessName || "Smart Page",
        status: "new",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const leadRef = await addDoc(collection(db, "users", site._userId, "microsites", site.id, "leads"), leadData);

      await processNewLeadAction({
        ownerId: site._userId,
        micrositeId: site.id,
        leadData: { ...formValues, id: leadRef.id, attributionQrId }
      });

      setSubmitted(true);
      toast({ title: "Inquiry Dispatched" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Submission Failed" });
    } finally {
      setLoading(false);
    }
  };

  const IconMap: Record<string, any> = {
    zap: Zap,
    send: Send,
    check: CheckCircle2
  };
  const IconComp = IconMap[sd.btnIcon || 'send'] || Send;

  const sectionStyle: any = {
    borderRadius: `${cardRadius}px`,
    position: 'relative',
    overflow: 'hidden',
    paddingTop: '40px',
    paddingBottom: '40px'
  };

  if (sd.sectionBgType === 'gradient') {
    sectionStyle.background = `linear-gradient(135deg, ${sd.sectionBgColor1 || '#fafafa'}, ${sd.sectionBgColor2 || '#fafafa'})`;
  } else {
    sectionStyle.backgroundColor = sd.sectionBgColor1 || 'transparent';
  }

  const btnColor = sd.btnColor || themeColor;

  return (
    <div 
      onClick={() => isPreview && onSectionClick?.(section.id)}
      className={cn("w-full transition-all relative", isPreview && "hover:outline-2 hover:outline-dashed hover:outline-primary/50 cursor-pointer")}
      style={sectionStyle}
    >
      <div className="px-6 w-full max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="p-10 sm:p-20 bg-emerald-50 rounded-[3rem] text-center border-2 border-emerald-100 shadow-2xl relative overflow-hidden"
              style={{ borderRadius: `${sd.formRadius ?? cardRadius}px` }}
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                 <PartyPopper className="h-40 w-40 text-emerald-600" />
              </div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                className="h-24 w-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border-4 border-white"
              >
                <CheckCircle2 className="h-12 w-12" />
              </motion.div>
              <h4 className="text-2xl sm:text-4xl font-black text-emerald-900 mb-4 tracking-tight leading-tight">
                 {sd.successMessage || "Thank you for your interest!"}
              </h4>
              <p className="text-sm sm:text-lg font-bold text-emerald-700 uppercase tracking-widest opacity-70">
                 Transmission Secure • Entry Logged
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="border-none shadow-2xl overflow-hidden bg-white w-full max-w-lg mx-auto transition-all duration-500" style={{ borderRadius: `${sd.formRadius ?? cardRadius}px` }}>
                <div className="p-8 sm:p-12 space-y-8">
                  <div className={cn("space-y-3", sd.titleAlign === 'center' ? 'text-center' : sd.titleAlign === 'right' ? 'text-right' : 'text-left')}>
                    <h3 className="text-2xl sm:text-4xl font-black tracking-tight" style={{ color: sd.sectionTitleColor || 'inherit' }}>
                      {sd.sectionTitle || "Get in Touch"}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
                      {sd.sectionDescription}
                    </p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className={cn("gap-4", sd.layout === 'grid2' ? 'grid grid-cols-1 sm:grid-cols-2' : 'flex flex-col')}>
                    {sd.showName !== false && (
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                        <Input 
                            placeholder="Full Name" 
                            required 
                            value={formValues.name}
                            onChange={e => setFormValues({...formValues, name: e.target.value})}
                            className="h-12 pl-12 bg-neutral-50/50 border-neutral-100 focus:bg-white transition-all font-bold text-sm" 
                            style={{ borderRadius: `${sd.fieldRadius || 12}px` }} 
                        />
                      </div>
                    )}
                    {sd.showEmail !== false && (
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                        <Input 
                            placeholder="Email Address" 
                            type="email" 
                            required 
                            value={formValues.email}
                            onChange={e => setFormValues({...formValues, email: e.target.value})}
                            className="h-12 pl-12 bg-neutral-50/50 border-neutral-100 focus:bg-white transition-all font-bold text-sm" 
                            style={{ borderRadius: `${sd.fieldRadius || 12}px` }} 
                        />
                      </div>
                    )}
                    {sd.showMobile !== false && (
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                        <Input 
                            placeholder="Mobile Number" 
                            type="tel" 
                            required 
                            value={formValues.mobile}
                            onChange={e => setFormValues({...formValues, mobile: e.target.value})}
                            className="h-12 pl-12 bg-neutral-50/50 border-neutral-100 focus:bg-white transition-all font-bold text-sm" 
                            style={{ borderRadius: `${sd.fieldRadius || 12}px` }} 
                        />
                      </div>
                    )}
                    {sd.showBusiness !== false && (
                      <div className={cn("relative group", sd.layout === 'grid2' && "sm:col-span-2")}>
                        <Target className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                        <Input 
                            placeholder="Company / Message" 
                            value={formValues.business}
                            onChange={e => setFormValues({...formValues, business: e.target.value})}
                            className="h-12 pl-12 bg-neutral-50/50 border-neutral-100 focus:bg-white transition-all font-bold text-sm" 
                            style={{ borderRadius: `${sd.fieldRadius || 12}px` }} 
                        />
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      disabled={loading} 
                      className={cn(
                        "w-full h-14 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest gap-3 mt-4 shadow-xl transition-all hover:scale-[1.02] active:scale-95",
                        sd.layout === 'grid2' && "sm:col-span-2",
                        sd.btnStyle === 'outline' ? "bg-transparent border-2" : 
                        sd.btnStyle === 'ghost' ? "bg-transparent border-none shadow-none hover:bg-neutral-100" : "text-white"
                      )} 
                      style={{ 
                        backgroundColor: sd.btnStyle === 'solid' ? btnColor : 'transparent',
                        borderColor: sd.btnStyle === 'outline' ? btnColor : 'transparent',
                        color: sd.btnStyle === 'solid' ? '#ffffff' : btnColor
                      }}
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <IconComp className="h-5 w-5" />}
                      {sd.buttonText || "Submit Inquiry"}
                    </Button>
                  </form>
                  
                  {sd.trustBadgesEnabled && (
                    <div className="flex items-center justify-center gap-3 pt-6 border-t border-neutral-50" style={{ color: sd.trustColor || '#00000080' }}>
                      <ShieldCheck className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{sd.trustText || "Privacy Protected • 100% Secure"}</span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
