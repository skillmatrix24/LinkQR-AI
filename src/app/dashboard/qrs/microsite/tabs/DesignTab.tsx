'use client';

import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  Palette, 
  Type, 
  Square, 
  Maximize, 
  Layers,
  Sparkles,
  Info,
  RefreshCcw,
  CheckCircle2,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface DesignTabProps {
  pageData: any;
  setPageData: (data: any) => void;
}

const FONTS = [
  { id: 'font-body', name: 'Standard (Inter)', class: 'font-body' },
  { id: 'font-serif', name: 'Classic Serif', class: 'font-serif' },
  { id: 'font-mono', name: 'Modern Mono', class: 'font-mono' },
  { id: 'font-mukta', name: 'Indian (Mukta)', class: 'font-mukta' }
];

export function DesignTab({ pageData, setPageData }: DesignTabProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(() => (db && user?.uid) ? doc(db, "users", user.uid) : null, [db, user?.uid]);
  const { data: profile } = useDoc(userProfileRef);

  const PRESETS = [
    { id: 'light', name: 'Clean White' },
    { id: 'dark', name: 'Dark Mode' },
    { id: 'glass', name: 'Glassmorphism' },
    { id: 'vibrant', name: 'Vibrant Color' }
  ];

  const handleSyncGlobalBrand = () => {
    if (!profile?.brandKit) {
      toast({
        variant: "destructive",
        title: "Identity Not Found",
        description: "Please generate your Brand Identity in the Branding section first.",
      });
      return;
    }

    const bk = profile.brandKit;
    setPageData({
      ...pageData,
      themeColor: bk.colors.primary,
      logoUrl: bk.logoUrl || pageData.logoUrl,
      fontType: bk.typography.heading === 'Inter' ? 'font-body' : bk.typography.heading.toLowerCase().includes('mukta') ? 'font-mukta' : 'font-body',
    });

    toast({
      title: "Global Identity Synced",
      description: "Brand colors and logo have been applied to this workspace.",
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300 pb-12">
      
      {/* Global Brand Sync Trigger */}
      <div className="p-6 bg-primary/5 border-2 border-primary/10 rounded-[2rem] space-y-4 shadow-sm">
         <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg">
               <Zap className="h-5 w-5" />
            </div>
            <div>
               <h4 className="font-black text-sm uppercase tracking-tight text-primary">Global Identity</h4>
               <p className="text-[9px] font-bold text-muted-foreground uppercase">Identity System v2.0</p>
            </div>
         </div>
         <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">
           अपने ग्लोबल 'Brand Kit' से कलर्स, लोगो और फॉन्ट्स को तुरंत यहाँ सिंक करें।
         </p>
         <Button 
          onClick={handleSyncGlobalBrand}
          className="w-full h-11 rounded-xl font-black text-[10px] uppercase gap-2 shadow-xl"
         >
           <RefreshCcw className="h-3.5 w-3.5" /> Sync Global Brand
         </Button>
      </div>

      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
          <Layers className="h-3.5 w-3.5" /> Base Theme Layout
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {PRESETS.map(t => (
            <button 
              key={t.id} 
              onClick={() => setPageData({...pageData, themeVariant: t.id})} 
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-[10px] font-black uppercase", 
                pageData.themeVariant === t.id ? "bg-primary text-white border-primary shadow-lg" : "bg-neutral-50 border-transparent hover:bg-neutral-100"
              )}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 bg-neutral-50 rounded-[2rem] border space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
           <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
             <Palette className="h-3.5 w-3.5" /> Brand Color Palette
           </Label>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           <div className="space-y-3">
              <Label className="text-[9px] font-bold uppercase">Primary Accent</Label>
              <div className="flex gap-3 items-center p-3 bg-white rounded-xl shadow-inner">
                <Input type="color" value={pageData.themeColor || '#6750A4'} onChange={e => setPageData({...pageData, themeColor: e.target.value})} className="h-8 w-12 cursor-pointer p-0.5" />
                <span className="font-mono text-[10px] font-bold uppercase">{pageData.themeColor || '#6750A4'}</span>
              </div>
           </div>
           <div className="space-y-3">
              <Label className="text-[9px] font-bold uppercase">Background Wash</Label>
              <div className="flex gap-3 items-center p-3 bg-white rounded-xl shadow-inner">
                <Input type="color" value={pageData.bgColor || '#ffffff'} onChange={e => setPageData({...pageData, bgColor: e.target.value})} className="h-8 w-12 cursor-pointer p-0.5" />
                <span className="font-mono text-[10px] font-bold uppercase">{pageData.bgColor || '#ffffff'}</span>
              </div>
           </div>
        </div>
      </div>

      <div className="space-y-6">
         <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
           <Type className="h-3.5 w-3.5" /> Global Typography
         </Label>
         <div className="grid grid-cols-1 gap-4">
            <div className="space-y-3 p-5 bg-neutral-50 rounded-2xl border">
               <Label className="text-[9px] font-bold uppercase">Main Font Family</Label>
               <div className="grid grid-cols-2 gap-2">
                  {FONTS.map(f => (
                    <button 
                      key={f.id}
                      onClick={() => setPageData({...pageData, fontType: f.id})}
                      className={cn(
                        "px-3 py-2 rounded-lg text-[9px] font-bold border transition-all",
                        (pageData.fontType || 'font-body') === f.id ? "bg-white border-primary text-primary shadow-sm" : "bg-white/50 text-muted-foreground"
                      )}
                    >
                      {f.name}
                    </button>
                  ))}
               </div>
            </div>
         </div>
      </div>

      <div className="space-y-8 p-6 bg-neutral-900 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-5"><Maximize className="h-24 w-24" /></div>
         <div className="flex items-center gap-3 relative z-10">
            <Square className="h-5 w-5 text-accent" />
            <h4 className="text-xs font-black uppercase tracking-widest text-accent">Visual Geometry</h4>
         </div>
         
         <div className="space-y-8 relative z-10">
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <Label className="text-[9px] font-bold uppercase text-neutral-400">Section Spacing</Label>
                  <Badge variant="outline" className="text-accent border-accent/20 text-[9px] font-mono">{pageData.sectionSpacing || 24}px</Badge>
               </div>
               <Slider 
                 value={[pageData.sectionSpacing || 24]} 
                 min={0} 
                 max={100} 
                 step={4} 
                 onValueChange={(v) => setPageData({...pageData, sectionSpacing: v[0]})} 
               />
            </div>

            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <Label className="text-[9px] font-bold uppercase text-neutral-400">Card Roundness</Label>
                  <Badge variant="outline" className="text-accent border-accent/20 text-[9px] font-mono">{pageData.cardRadius || 32}px</Badge>
               </div>
               <Slider 
                 value={[pageData.cardRadius || 32]} 
                 min={0} 
                 max={80} 
                 step={4} 
                 onValueChange={(v) => setPageData({...pageData, cardRadius: v[0]})} 
               />
            </div>
         </div>
      </div>
    </div>
  );
}