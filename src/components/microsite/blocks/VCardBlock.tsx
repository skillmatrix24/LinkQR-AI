'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Download, 
  UserCircle, 
  Phone, 
  Mail, 
  Globe, 
  Calendar, 
  ExternalLink, 
  ShieldCheck,
  Zap,
  MessageCircle,
  Link as LinkIcon,
  SearchCode,
  CheckCircle2,
  Trophy,
  MapPin,
  ImageIcon,
  Clock,
  Info,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { Badge } from "@/components/ui/badge";
import { trackClickEvent } from '@/app/lib/analytics-service';
import { Button } from "@/components/ui/button";

const ICON_MAP: Record<string, any> = {
  download: Download,
  calendar: Calendar,
  globe: Globe,
  zap: Zap,
  mail: Mail,
  phone: Phone,
  'message-circle': MessageCircle,
  'external-link': ExternalLink
};

export function VCardBlock({ section, site, isPreview, onSectionClick }: any) {
  const sd = section.data || {};
  const themeColor = site.themeColor || '#6750A4';
  const cardRadius = site.cardRadius || 32;
  const db = useFirestore();

  const [currentTimeStr, setCurrentTimeStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTimeStr(`${hours}:${minutes}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const collectionName = site.type === 'vcard' ? 'digitalIDs' : 'microsites';

  const handleAction = async (e: React.MouseEvent, type: 'primary' | 'secondary' | 'sticky') => {
    e.stopPropagation();
    if (isPreview) return;

    if (type === 'primary' || type === 'sticky') {
        const isSaveAction = sd.btnIcon === 'download' || (sd.btnText || '').toLowerCase().includes('save');
        
        if (isSaveAction) {
            trackClickEvent(db, site._userId, site.id, collectionName, 'SAVE_CONTACT');

            if (db && site._userId && site.id) {
               const cardRef = doc(db, "users", site._userId, collectionName, site.id);
               updateDoc(cardRef, { "stats.saves": increment(1) }).catch(() => null);
            }

            const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${sd.fullName || 'Identity'}
ORG:${sd.company || ''}
TITLE:${sd.designation || ''}
TEL;TYPE=CELL:${sd.mobile || ''}
EMAIL;TYPE=INTERNET:${sd.email || ''}
URL:${sd.website || window.location.href}
ADR;TYPE=WORK:;;${sd.address || ''}
NOTE:${sd.vcfNote || 'Digital ID powered by LinkQR AI'}
END:VCARD`;

            const blob = new Blob([vCard], { type: 'text/vcard' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${(sd.fullName || 'contact').replace(/\s+/g, '_')}.vcf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (sd.primaryBtnUrl) {
            trackClickEvent(db, site._userId, site.id, collectionName, 'WEBSITE');
            window.open(sd.primaryBtnUrl, '_blank');
        }
    } else if (type === 'secondary') {
        if (sd.secondaryBtnUrl) {
          trackClickEvent(db, site._userId, site.id, collectionName, 'APPOINTMENT');
          window.open(sd.secondaryBtnUrl, '_blank');
        }
    }
  };

  const sectionStyle: any = { 
    paddingTop: `${sd.paddingTop || 80}px`, 
    paddingBottom: `${sd.paddingBottom || 80}px`, 
    borderRadius: `${cardRadius}px`, 
    position: 'relative', 
    overflow: 'hidden',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  if (sd.sectionBgType === 'gradient') {
    sectionStyle.background = `linear-gradient(135deg, ${sd.sectionBgColor1 || '#fafafa'}, ${sd.sectionBgColor2 || '#fafafa'})`;
  } else {
    sectionStyle.backgroundColor = sd.sectionBgColor1 || 'transparent';
  }

  const cardContainerStyle: any = {
    borderRadius: `${sd.cardRadius ?? cardRadius}px`,
    overflow: 'hidden',
    borderWidth: `${sd.cardBorderWidth ?? 0}px`,
    borderColor: sd.cardBorderColor || '#eeeeee',
    borderStyle: sd.cardBorderStyle || 'solid',
    transition: 'all 0.5s ease',
    backgroundColor: sd.bgType === 'solid' ? (sd.bgColor1 || '#ffffff') : 'transparent',
    padding: `${sd.cardPaddingY ?? 60}px ${sd.cardPaddingX ?? 40}px`,
    position: 'relative'
  };

  const photoShapeClass = sd.photoShape === 'circle' ? 'rounded-full' : sd.photoShape === 'square' ? 'rounded-none' : 'rounded-[3rem]';
  const photoOuterStyle: any = {
    padding: `${sd.photoBorderWidth ?? 4}px`,
    background: sd.photoBorderType === 'gradient' 
      ? `linear-gradient(135deg, ${sd.photoBorderColor || '#ffffff'}, ${sd.photoBorderColor2 || '#ffffff'})`
      : (sd.photoBorderColor || '#ffffff'),
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
  };

  const renderQuickActions = () => {
    if (sd.showQuickActions === false) return null;
    
    const socialSection = site.sections?.find((s: any) => s.type === 'social');
    const waMessage = socialSection?.data?.whatsappMessage || "";

    // FIX 3: Implementation of Priority WhatsApp routing
    const waNumber = (sd.mobileWhatsApp?.trim() || sd.mobile || "").replace(/\D/g, '');
    const waUrl = `https://wa.me/${waNumber}${waMessage ? `?text=${encodeURIComponent(waMessage)}` : ''}`;

    const actions = [];
    if (sd.mobile && sd.showMobile !== false) {
      actions.push({ id: 'call', type: 'CALL', href: `tel:${sd.mobile}`, icon: <Phone className="h-5 w-5" />, color: themeColor });
    }
    
    if (waNumber) {
      actions.push({ 
          id: 'wa', 
          type: 'WHATSAPP',
          href: waUrl, 
          icon: <MessageCircle className="h-5 w-5" />, 
          color: '#25D366' 
      });
    }
    
    if (sd.mobileSecondary && sd.showMobileSecondary) {
       actions.push({ id: 'call2', type: 'CALL', href: `tel:${sd.mobileSecondary}`, icon: <Phone className="h-5 w-5" />, color: themeColor });
    }

    if (sd.email && sd.showEmail !== false) {
      actions.push({ id: 'email', type: 'EMAIL', href: `mailto:${sd.email}`, icon: <Mail className="h-5 w-5" />, color: '#3b82f6' });
    }
    if (sd.locationUrl && sd.showLocation !== false) {
       actions.push({ id: 'loc', type: 'DIRECTIONS', href: sd.locationUrl, icon: <MapPin className="h-5 w-5" />, color: '#ef4444' });
    }
    if (sd.website && sd.showWebsite !== false) {
       actions.push({ id: 'web', type: 'WEBSITE', href: sd.website.startsWith('http') ? sd.website : `https://${sd.website}`, icon: <Globe className="h-5 w-5" />, color: '#6366f1' });
    }

    if (actions.length === 0) return null;

    return (
      <div className="flex flex-wrap justify-center gap-4 py-6 w-full relative z-10 border-t border-neutral-100/50 mt-4">
         {actions.map((action) => (
           <a 
            key={action.id}
            to={isPreview ? undefined : action.href} 
            target={action.id !== 'call' && action.id !== 'call2' && action.id !== 'email' ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="h-12 w-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-600 hover:text-white transition-all shadow-sm active:scale-90 group"
            onClick={(e) => {
              if (isPreview) {
                e.preventDefault();
                return;
              }
              trackClickEvent(db, site._userId, site.id, collectionName, action.type);
            }}
           >
             <div className="group-hover:scale-110 transition-transform">
               {React.cloneElement(action.icon as React.ReactElement<any>, { 
                 className: cn("h-5 w-5 transition-colors group-hover:text-white") 
               })}
             </div>
             <style>{`
               a:hover { background-color: ${action.color} !important; color: white !important; }
             `}</style>
           </a>
         ))}
      </div>
    );
  };

  const renderWorkingHours = () => {
    const wh = sd.workingHours;
    if (!wh) return null;
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const hasEnabled = Object.values(wh).some((d: any) => d?.enabled);
    if (!hasEnabled && !isPreview) return null;

    const todayIndex = new Date().getDay();
    const todayKey = days[todayIndex];
    const todayConfig = wh[todayKey];
    
    let statusBadge = null;
    if (todayConfig && currentTimeStr) {
       if (!todayConfig.enabled) {
          statusBadge = <Badge variant="destructive" className="ml-auto font-black text-[8px] uppercase tracking-widest px-2.5 h-6 rounded-md">Closed Now</Badge>;
       } else {
          const { start, end } = todayConfig;
          if (start && end && start < end) {
             const isOpen = currentTimeStr >= start && currentTimeStr < end;
             statusBadge = (
               <Badge 
                 variant={isOpen ? "default" : "destructive"} 
                 className={cn("ml-auto font-black text-[8px] uppercase tracking-widest px-2.5 h-6 rounded-md", isOpen && "bg-emerald-50 text-white")}
               >
                  {isOpen ? "Open Now" : "Closed Now"}
               </Badge>
             );
          } else {
             statusBadge = <Badge variant="destructive" className="ml-auto font-black text-[8px] uppercase tracking-widest px-2.5 h-6 rounded-md">Closed Now</Badge>;
          }
       }
    }

    const formatTime = (time: string) => {
        if (!time) return "--:--";
        try {
            const [hour, minute] = time.split(':');
            const h = parseInt(hour);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const displayHour = h % 12 || 12;
            return `${displayHour}:${minute} ${ampm}`;
        } catch(e) { return time; }
    };

    return (
      <div className="w-full mt-10 pt-10 border-t border-neutral-100/50 space-y-6 text-left relative z-10">
          <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-neutral-100 flex items-center justify-center text-primary shadow-inner">
                  <Clock className="h-5 w-5" />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Operating Hours</h4>
              {statusBadge}
          </div>
          <div className="space-y-4">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                  const dayData = wh[day];
                  if (!dayData) return null;
                  return (
                      <div key={day} className="flex justify-between items-center px-2 group">
                          <span className="text-[11px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">{day}</span>
                          {dayData.enabled ? (
                              <span className="text-[11px] font-bold text-foreground">
                                  {formatTime(dayData.start)} – {formatTime(dayData.end)}
                              </span>
                          ) : (
                              <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter opacity-60">Closed</span>
                          )}
                      </div>
                  );
              })}
          </div>
      </div>
    );
  };

  const renderLocation = () => {
    const hasAddress = !!sd.address?.trim();
    if (!hasAddress && !isPreview) return null;
    if (sd.showLocation === false && !isPreview) return null;

    return (
      <div className="w-full mt-10 pt-10 border-t border-neutral-100/50 space-y-8 text-left relative z-10">
         <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-neutral-100 flex items-center justify-center text-primary shadow-inner">
               <MapPin className="h-5 w-5" />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Business Location</h4>
         </div>

         {hasAddress && (
           <p className="text-sm sm:text-base font-bold text-foreground leading-relaxed px-2">
             {sd.address}
           </p>
         )}

         {sd.showMapPreview && hasAddress && (
           <div className="w-full overflow-hidden shadow-inner border-4 border-neutral-50 bg-neutral-100" style={{ borderRadius: `${sd.cardRadius || 24}px` }}>
              <iframe 
                width="100%" 
                height="220" 
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps?q=${encodeURIComponent(sd.address)}&output=embed`}
              />
           </div>
         )}
      </div>
    );
  };

  const renderStickyBar = () => {
    if (isPreview || !sd.stickyActionsEnabled) return null;

    const waNumber = (sd.mobileWhatsApp?.trim() || sd.mobile || "").replace(/\D/g, '');
    const waUrl = `https://wa.me/${waNumber}${site.sections?.find((s:any) => s.type === 'social')?.data?.whatsappMessage ? `?text=${encodeURIComponent(site.sections?.find((s:any) => s.type === 'social')?.data?.whatsappMessage)}` : ''}`;

    return (
      <div className="md:hidden fixed bottom-20 left-4 right-4 z-[999] animate-in slide-in-from-bottom-8 duration-500">
         <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-2 flex gap-2">
            <Button 
              className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase gap-2 bg-emerald-500 hover:bg-emerald-600"
              onClick={() => {
                // FIX 4: Fire analytics on sticky click
                trackClickEvent(db, site._userId, site.id, collectionName, 'WHATSAPP');
                window.open(waUrl, '_blank');
              }}
            >
               <MessageCircle className="h-4 w-4 fill-current" /> WhatsApp
            </Button>
            <Button 
              className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase gap-2"
              style={{ backgroundColor: sd.btnColor || themeColor }}
              onClick={(e) => handleAction(e, 'sticky')}
            >
               <Download className="h-4 w-4" /> Save ID
            </Button>
         </div>
      </div>
    );
  };

  return (
    <div 
      onClick={() => isPreview && onSectionClick?.(section.id)}
      className={cn("w-full transition-all relative px-6", isPreview && "hover:outline-2 hover:outline-dashed hover:outline-primary/50 cursor-pointer")}
      style={sectionStyle}
    >
      <section 
        style={cardContainerStyle} 
        className={cn("relative flex flex-col w-full max-w-5xl mx-auto z-20 shadow-2xl bg-white")}
      >
        <div className="flex flex-col items-center text-center space-y-8 w-full relative z-10">
           {sd.businessLogoUrl && (
             <div className="absolute top-0 right-0 p-6 opacity-60 hover:opacity-100 transition-opacity">
                <img src={sd.businessLogoUrl} className="h-10 w-auto object-contain" alt="Business Logo" />
             </div>
           )}

           <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              style={photoOuterStyle}
              className={cn("relative z-10 h-44 w-44 sm:h-56 sm:w-56", photoShapeClass)}
           >
              <div className={cn("w-full h-full overflow-hidden bg-neutral-100 flex items-center justify-center", photoShapeClass)}>
                {sd.photoUrl ? (
                  <img 
                    src={sd.photoUrl} 
                    style={{ transform: `scale(${sd.photoScale || 1.0}) translate(${sd.photoInnerX || 0}px, ${sd.photoInnerY || 0}px)`, width: '100%', height: '100%', objectFit: 'cover' }} 
                    alt={sd.fullName} 
                  />
                ) : <UserCircle className="h-24 w-24 m-auto text-white/40" />}
              </div>
           </motion.div>
           
           <div className="space-y-3">
              <div className="flex items-center justify-center">
                 <h2 className="font-black tracking-tighter" style={{ color: sd.nameColor || '#111827', fontSize: `${sd.nameFontSize || 32}px` }}>{sd.fullName || "Identity Name"}</h2>
                 {sd.verificationEnabled && (
                   <div className="ml-2 shrink-0">
                      {sd.verificationType === 'gold' ? <Trophy className="h-5 w-5 text-amber-500 fill-current animate-pulse" /> : <CheckCircle2 className="h-5 w-5 text-blue-500 fill-current" />}
                   </div>
                 )}
              </div>
              <div className="flex flex-col items-center gap-2">
                 <p className="text-[11px] font-black uppercase tracking-[0.4em]" style={{ color: sd.titleColor || themeColor }}>{sd.designation} {sd.company ? `• ${sd.company}` : ''}</p>
                 {sd.tagline && <p className="text-xs font-bold italic opacity-60" style={{ color: sd.taglineColor }}>{sd.tagline}</p>}
              </div>
           </div>

           {sd.introduction && (
             <p className="text-sm font-medium leading-relaxed max-w-sm opacity-80" style={{ color: sd.introColor }}>
               {sd.introduction}
             </p>
           )}

           {renderQuickActions()}
           {renderLocation()}
           {renderWorkingHours()}

           <div className="w-full max-sm px-2 space-y-4 pt-4">
              <button 
                onClick={(e) => handleAction(e, 'primary')}
                className="w-full h-16 font-black text-xs uppercase tracking-[0.3em] text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4"
                style={{ backgroundColor: sd.btnColor || themeColor, borderRadius: `${sd.btnRadius ?? 20}px` }}
              >
                {ICON_MAP[sd.btnIcon || 'download'] && React.createElement(ICON_MAP[sd.btnIcon || 'download'], { className: "h-6 w-6" })} {sd.btnText || "Action"}
              </button>
           </div>
        </div>
      </section>
      {renderStickyBar()}
    </div>
  );
}
