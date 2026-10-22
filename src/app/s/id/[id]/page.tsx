"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { 
  Loader2, 
  UserCircle, 
  Phone, 
  Mail, 
  Globe, 
  ChevronRight, 
  Quote, 
  CheckCircle2, 
  MessageCircle,
  Download,
  Zap,
  Target,
  Video,
  Star,
  Check,
  Smartphone,
  ShieldCheck,
  X,
  Calendar,
  Send,
  UserCheck,
  IdCard,
  Play,
  FileText,
  Copy,
  Trophy
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * Public Digital ID View.
 */
export default function PublicVCardPage() {
  const params = useParams();
  const id = params.id as string;
  const db = useFirestore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVCard() {
      if (!db || !id) return;
      try {
        let resolvedUserId = "";
        let resolvedCardId = "";

        const regRef = doc(db, "publicSmartPages", `id_${id}`);
        const regSnap = await getDoc(regRef);
        
        if (regSnap.exists()) {
          const regData = regSnap.data();
          resolvedUserId = regData.userId;
          resolvedCardId = regData.micrositeId;
        } else {
           const slugRef = doc(db, "publicSmartPages", id);
           const slugSnap = await getDoc(slugRef);
           if (slugSnap.exists()) {
             resolvedUserId = slugSnap.data().userId;
             resolvedCardId = slugSnap.data().micrositeId;
           }
        }

        if (resolvedUserId && resolvedCardId) {
          const cardRef = doc(db, "users", resolvedUserId, "digitalIDs", resolvedCardId);
          const cardSnap = await getDoc(cardRef);
          if (cardSnap.exists()) {
            const cardData = cardSnap.data();
            setData({ ...cardData, _userId: resolvedUserId });
            updateDoc(cardRef, { "stats.views": increment(1) }).catch(() => null);
            if (cardData.navMode === 'tabs' && cardData.sections?.length > 0) {
              setActiveTab(cardData.sections[0].id);
            }
          }
        }
      } catch (err) {
        console.error("Error loading vCard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVCard();
  }, [db, id]);

  const handleSaveContact = () => {
    if (!data || !db) return;
    
    const cardRef = doc(db, "users", data._userId, "digitalIDs", data.id);
    updateDoc(cardRef, { "stats.saves": increment(1) }).catch(() => null);

    let vCard = `BEGIN:VCARD
VERSION:3.0
FN:${data.fullName}
ORG:${data.company}
TITLE:${data.designation}
TEL;TYPE=CELL:${data.mobile}
EMAIL;TYPE=INTERNET:${data.email}
URL:${data.website || `https://linkqr.in/id/${data.slug || data.id}`}
NOTE:Digital ID powered by LinkQR AI
END:VCARD`;

    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${data.fullName.replace(/\s+/g, '_')}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-neutral-50">
       <div className="relative">
          <Loader2 className="h-14 w-14 animate-spin text-primary" />
          <UserCircle className="absolute inset-0 m-auto h-6 w-6 text-accent animate-pulse" />
       </div>
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Syncing Identity Node...</p>
    </div>
  );

  if (!data) return (
    <div className="h-screen flex flex-col items-center justify-center gap-8 p-10 text-center bg-white">
      <div className="h-24 w-24 bg-red-50 rounded-full flex items-center justify-center text-red-500 shadow-inner"><X className="h-12 w-12" /></div>
      <h1 className="text-3xl font-black uppercase tracking-tight">Identity Offline</h1>
      <Button asChild className="rounded-2xl h-14 px-10 font-black"><Link to="/">Visit Homepage</Link></Button>
    </div>
  );

  const themeColor = data.themeColor || '#6750A4';
  const isTabs = data.navMode === 'tabs';

  const visibleSections = isTabs 
    ? data.sections.filter((s: any) => s.id === activeTab) 
    : data.sections;

  const photoImgStyle = {
    transform: `scale(${data.photoScale || 1.0}) translate(${data.photoInnerX || 0}px, ${data.photoInnerY || 0}px)`,
    transition: 'all 0.3s ease-out',
    minWidth: '100%',
    minHeight: '100%',
    objectFit: 'cover' as any
  };

  const renderBadge = () => {
     if (!data.verificationEnabled) return null;
     if (data.verificationType === 'gold') return <Trophy className="h-5 w-5 text-amber-500 fill-current ml-2 shrink-0 animate-pulse" />;
     return <CheckCircle2 className="h-5 w-5 text-blue-500 fill-current ml-2 shrink-0" />;
  };

  return (
    <div className={cn("min-h-screen w-full flex flex-col items-center overflow-x-hidden", data.fontType || 'font-body')} style={{ 
       background: data.cardBgType === 'gradient' ? `linear-gradient(135deg, ${data.cardBgColor1}, ${data.cardBgColor2})` : data.cardBgColor1 
    }}>
      <div className="w-full max-w-[500px] flex-1 flex flex-col relative bg-white shadow-2xl min-h-screen">
         <div className="relative z-10 flex flex-col flex-1 pb-32">
            
            {data.langToggleEnabled && (
              <div className="flex justify-end p-4 absolute top-0 right-0 z-50">
                 <div className="bg-white/50 backdrop-blur-md rounded-xl p-1 flex gap-1 border shadow-lg border-white/20">
                    <button onClick={() => setLang('en')} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black transition-all", lang === 'en' ? "bg-white shadow-sm text-primary" : "opacity-40")}>EN</button>
                    <button onClick={() => setLang('hi')} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black transition-all font-mukta", lang === 'hi' ? "bg-white shadow-sm text-primary" : "opacity-40")}>हिं</button>
                 </div>
              </div>
            )}

            <div className={cn(
              "flex flex-col text-center space-y-6 relative overflow-hidden transition-all duration-700 z-[30]",
              data.headerLayout === 'cover' ? 'pt-0 pb-16' : 'pt-24 pb-12 px-8',
              data.headerAlign === 'left' ? 'items-start text-left' : data.headerAlign === 'right' ? 'items-end text-right' : 'items-center text-center'
            )}>
               {data.headerLayout === 'cover' && (
                 <div className="w-full h-56 bg-neutral-100 relative overflow-hidden mb-8">
                    <img src={data.photoUrl || `https://picsum.photos/seed/${data.id}/600/400`} className="w-full h-full object-cover blur-xl opacity-40 scale-110" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                 </div>
               )}
               
               <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn(
                     "bg-white shadow-2xl overflow-hidden relative z-10 border-4 border-white flex items-center justify-center transition-all duration-700",
                     data.headerLayout === 'cover' ? 'mt-[-100px] h-40 w-40' : 'h-44 w-44',
                     data.photoShape === 'circle' ? 'rounded-full' : data.photoShape === 'rounded' ? 'rounded-[3rem]' : 'rounded-none'
                  )}
               >
                  {data.photoUrl ? <img src={data.photoUrl} style={photoImgStyle} alt={data.fullName} /> : <UserCircle className="h-24 w-24 text-neutral-100" />}
               </motion.div>
               
               <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-1 relative z-10 px-8">
                  <div className="flex items-center justify-center">
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tighter">{data.fullName}</h1>
                    {renderBadge()}
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em]" style={{ color: themeColor }}>
                     {data.designation} • {data.company}
                  </p>
               </motion.div>

               <div className="px-8 w-full relative z-10">
                  <Button onClick={handleSaveContact} className="w-full h-16 font-black text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-95 gap-4 group" style={{ backgroundColor: themeColor, borderRadius: '20px' }}>
                     <Download className="h-6 w-6 group-hover:translate-y-1 transition-transform" /> Save Contact
                  </Button>
               </div>
            </div>

            <div className="px-8 space-y-10 flex-1 mt-10 relative z-[20]">
               {isTabs && (
                  <div className="mb-6 overflow-x-auto no-scrollbar sticky top-2 z-[100]">
                     <div className="bg-white/80 backdrop-blur-xl p-1 rounded-2xl border flex gap-1 shadow-xl">
                        {data.sections.map((s:any) => (
                           <button 
                             key={s.id} 
                             onClick={() => setActiveTab(s.id)}
                             className={cn(
                                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all flex items-center gap-2", 
                                activeTab === s.id ? "bg-white text-primary shadow-sm" : "text-muted-foreground opacity-50"
                             )}
                           >
                              {s.type === 'bio' && <FileText className="h-3 w-3" />}
                              {s.type === 'social' && <Globe className="h-3 w-3" />}
                              {s.type === 'leadForm' && <UserCheck className="h-3 w-3" />}
                              {s.type}
                           </button>
                        ))}
                     </div>
                  </div>
               )}

               <AnimatePresence mode="wait">
               {visibleSections.map((block: any) => (
                 <motion.div 
                    key={block.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={cn(
                       "p-8 transition-all duration-500 relative overflow-hidden mb-6",
                       data.glassEnabled ? "bg-white/40 backdrop-blur-xl border border-white/20 shadow-2xl" : "bg-white border border-neutral-100 shadow-sm"
                    )}
                    style={{ borderRadius: `${data.cardRadius || 32}px` }}
                 >
                    {block.type === 'bio' && (
                       <div className="space-y-4">
                          <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Narrative</p>
                          <p className={cn("text-sm sm:text-base leading-relaxed font-bold italic opacity-80", lang === 'hi' && "font-mukta text-lg")}>
                             "{lang === 'hi' && block.data.contentHi ? block.data.contentHi : block.data.content}"
                          </p>
                       </div>
                    )}

                    {block.type === 'social' && block.data.items?.length > 0 && (
                       <div className="space-y-6">
                          <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Network Presence</p>
                          <div className="grid grid-cols-4 gap-4">
                             {block.data.items.map((item: any, i: number) => (
                               <a key={i} to={item.value.startsWith('http') ? item.value : `https://${item.value}`} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-2xl flex items-center justify-center bg-white shadow-xl hover:scale-110 transition-all active:scale-95 border border-neutral-100 group">
                                  <img src={`https://cdn.simpleicons.org/${item.platform}/${themeColor.replace('#', '')}`} className="h-7 w-7 group-hover:rotate-12 transition-transform" alt="" />
                               </a>
                             ))}
                          </div>
                       </div>
                    )}

                    {block.type === 'contact' && (
                       <div className="space-y-6">
                          <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Direct Hub</p>
                          <div className="space-y-4">
                             {[
                               { id: 'showMobile', icon: Phone, val: data.mobile, label: 'Mobile' },
                               { id: 'showEmail', icon: Mail, val: data.email, label: 'Email' },
                               { id: 'showWebsite', icon: Globe, val: data.website, label: 'Official Site' }
                             ].filter(f => f.val && data[f.id] !== false).map((item, i) => (
                               <a key={i} to={item.id === 'showMobile' ? `tel:${item.val}` : item.id === 'showEmail' ? `mailto:${item.val}` : item.val} className="flex items-center gap-5 p-5 rounded-[1.5rem] bg-white border border-neutral-100 shadow-xl group transition-all active:scale-95">
                                  <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg" style={{ backgroundColor: `${themeColor}15`, color: themeColor }}><item.icon className="h-6 w-6" /></div>
                                  <div className="min-w-0 flex-1">
                                     <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{item.label}</p>
                                     <p className="text-sm font-black truncate text-foreground">{item.val}</p>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                               </a>
                             ))}
                          </div>
                       </div>
                    )}
                 </motion.div>
               ))}
               </AnimatePresence>

               <div className="mt-24 flex flex-col items-center opacity-30 gap-6 px-10">
                  <div className="flex flex-col items-center gap-3">
                     <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.4em] border-neutral-300 px-6 h-9 rounded-xl">Identity Secure v2.0</Badge>
                     <p className="text-[8px] font-bold text-center uppercase tracking-widest leading-relaxed">Digital Identity Powered by LinkQR Infrastructure</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
