'use client';

import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  UploadCloud, 
  Loader2, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Copyright,
  Palette,
  ImageIcon,
  Info,
  Maximize,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Layout,
  Share2,
  Type,
  Layers,
  Sparkles,
  Paintbrush
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterTabProps {
  pageData: any;
  setPageData: (data: any) => void;
  uploadingField: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string, index?: number) => void;
}

export function FooterTab({ pageData, setPageData, uploadingField, handleImageUpload }: FooterTabProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'contact'>('content');

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* 1. Header Navigation */}
      <div className="flex bg-neutral-100 p-1 rounded-xl">
        <button onClick={() => setActiveTab('content')} className={cn("flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", activeTab === 'content' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>Brand</button>
        <button onClick={() => setActiveTab('contact')} className={cn("flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", activeTab === 'contact' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>Contact</button>
        <button onClick={() => setActiveTab('style')} className={cn("flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", activeTab === 'style' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>Surface</button>
      </div>

      {activeTab === 'content' && (
        <div className="space-y-6 animate-in slide-in-from-left-2">
          {/* Logo Management */}
          <div className="space-y-4 p-5 border-2 border-dashed rounded-[2.5rem] bg-neutral-50/50">
            <Label className="text-[10px] font-black uppercase text-muted-foreground">Footer Logo / Mark</Label>
            {pageData.footerLogoUrl ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border relative overflow-hidden">
                  {uploadingField === 'footerLogoUrl' && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
                  <div className="relative h-12 w-24 bg-neutral-50 rounded-lg p-2 border flex items-center justify-center overflow-hidden">
                    <img src={pageData.footerLogoUrl} className="max-h-full max-w-full object-contain" alt="" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-lg h-9 font-bold text-[9px] uppercase" onClick={() => document.getElementById('footer-logo-input')?.click()}>Replace</Button>
                    <Button variant="ghost" size="icon" onClick={() => setPageData({...pageData, footerLogoUrl: ''})} className="h-9 w-9 rounded-lg text-destructive hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="space-y-3">
                   <div className="flex items-center justify-between">
                      <Label className="text-[9px] font-bold uppercase opacity-60">Logo Height</Label>
                      <Badge variant="outline" className="text-[9px] font-mono">{pageData.footerLogoHeight || 32}px</Badge>
                   </div>
                   <Slider value={[pageData.footerLogoHeight || 32]} min={12} max={80} step={2} onValueChange={v => setPageData({...pageData, footerLogoHeight: v[0]})} />
                </div>
              </div>
            ) : (
              <div className="h-24 bg-white rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer group hover:bg-neutral-100 transition-all relative" onClick={() => document.getElementById('footer-logo-input')?.click()}>
                {uploadingField === 'footerLogoUrl' ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <UploadCloud className="h-6 w-6 opacity-20" />}
                <span className="text-[9px] font-black uppercase text-muted-foreground mt-2">Upload Mark</span>
              </div>
            )}
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex gap-3">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-[8px] font-bold text-primary/70 uppercase leading-relaxed">
                Footer Guide: Recommended 200x100px. Max: 500KB.
              </p>
            </div>
            <input type="file" id="footer-logo-input" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'footerLogoUrl')} />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Brand Narrative</Label>
            <Textarea 
              value={pageData.footerDescription || ""} 
              onChange={e => setPageData({...pageData, footerDescription: e.target.value})} 
              placeholder="A short mission statement..." 
              className="rounded-xl min-h-[100px] bg-white border-2 text-xs"
            />
          </div>

          <div className="p-4 bg-neutral-50 rounded-2xl border space-y-4">
             <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase text-primary">Social Links</Label>
                <Switch checked={pageData.footerShowSocial !== false} onCheckedChange={v => setPageData({...pageData, footerShowSocial: v})} className="scale-75" />
             </div>
             <p className="text-[9px] text-muted-foreground italic leading-relaxed">Displays social icons defined in the 'Social' block.</p>
          </div>
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2">
          <div className="p-5 bg-neutral-50 rounded-[2.5rem] border space-y-5">
             <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> Registry Info</Label>
             <div className="space-y-4">
                <div className="space-y-1.5">
                   <Label className="text-[9px] font-bold uppercase opacity-60">Public Email</Label>
                   <Input value={pageData.footerContactEmail} onChange={e => setPageData({...pageData, footerContactEmail: e.target.value})} placeholder="contact@brand.com" className="h-10 rounded-xl bg-white text-xs font-bold" />
                </div>
                <div className="space-y-1.5">
                   <Label className="text-[9px] font-bold uppercase opacity-60">Support Phone</Label>
                   <Input value={pageData.footerContactPhone} onChange={e => setPageData({...pageData, footerContactPhone: e.target.value})} placeholder="+91..." className="h-10 rounded-xl bg-white text-xs font-bold" />
                </div>
                <div className="space-y-1.5">
                   <Label className="text-[9px] font-bold uppercase opacity-60">HQ Address</Label>
                   <Textarea value={pageData.footerAddress} onChange={e => setPageData({...pageData, footerAddress: e.target.value})} placeholder="Office location..." className="min-h-[80px] rounded-xl bg-white text-xs" />
                </div>
             </div>
          </div>
          
          <div className="p-5 bg-white rounded-[2rem] border-2 border-primary/10 space-y-3">
             <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Copyright className="h-3.5 w-3.5" /> Copyright Tag</Label>
             <Input value={pageData.footerCopyrightText} onChange={e => setPageData({...pageData, footerCopyrightText: e.target.value})} placeholder="© 2026 Brand Name" className="h-10 rounded-xl bg-neutral-50 border-none text-xs font-bold" />
          </div>
        </div>
      )}

      {activeTab === 'style' && (
        <div className="space-y-6 animate-in slide-in-from-right-2">
          {/* Advanced Alignment & Layout */}
          <div className="p-5 bg-neutral-50 rounded-[2rem] border space-y-6">
             <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><AlignLeft className="h-3.5 w-3.5" /> Content Alignment</Label>
                <div className="flex gap-2">
                  {[ { id: 'left', icon: AlignLeft }, { id: 'center', icon: AlignCenter }, { id: 'right', icon: AlignRight } ].map(btn => (
                    <button key={btn.id} onClick={() => setPageData({...pageData, titleAlign: btn.id})} className={cn("h-10 flex-1 flex items-center justify-center rounded-xl border-2 transition-all", (pageData.titleAlign || 'left') === btn.id ? "bg-primary text-white border-primary shadow-lg" : "bg-white text-muted-foreground hover:bg-neutral-50")}>
                      <btn.icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
             </div>

             <div className="space-y-4 pt-4 border-t">
                <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Layout className="h-3.5 w-3.5" /> Layout Architecture</Label>
                <div className="grid grid-cols-2 gap-2">
                   {[
                     { id: 'matrix', label: 'Classic Matrix', icon: Layers },
                     { id: 'simple', label: 'Modern Simple', icon: Type }
                   ].map(l => (
                     <button 
                      key={l.id} 
                      onClick={() => setPageData({...pageData, footerLayout: l.id})}
                      className={cn(
                        "p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                        (pageData.footerLayout || 'matrix') === l.id ? "bg-primary text-white border-primary" : "bg-white hover:bg-neutral-50"
                      )}
                     >
                        <l.icon className="h-4 w-4" />
                        <span className="text-[8px] font-black uppercase">{l.label}</span>
                     </button>
                   ))}
                </div>
             </div>
          </div>

          <div className="p-5 bg-neutral-900 text-white rounded-[2rem] space-y-6 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12"><Paintbrush className="h-20 w-20 text-accent" /></div>
             <Label className="text-[10px] font-black uppercase text-accent gap-2 relative z-10 flex items-center"><Sparkles className="h-3.5 w-3.5" /> Stage Surface</Label>
             
             <div className="space-y-6 relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <Label className="text-[9px] font-bold uppercase opacity-60">Gradient Mode</Label>
                     <Switch checked={pageData.footerSectionBgType === 'gradient'} onCheckedChange={v => setPageData({...pageData, footerSectionBgType: v ? 'gradient' : 'solid'})} className="scale-75" />
                  </div>
                  <div className="flex gap-2">
                     <Input type="color" value={pageData.footerSectionBgColor1 || '#fafafa'} onChange={e => setPageData({...pageData, footerSectionBgColor1: e.target.value})} className="h-9 w-full p-0.5 border-none bg-white/10 rounded-lg cursor-pointer" />
                     {pageData.footerSectionBgType === 'gradient' && <Input type="color" value={pageData.footerSectionBgColor2 || '#fafafa'} onChange={e => setPageData({...pageData, footerSectionBgColor2: e.target.value})} className="h-9 w-full p-0.5 border-none bg-white/10 rounded-lg cursor-pointer animate-in zoom-in-95" />}
                  </div>
                </div>

                <div className="space-y-4 border-t border-white/10 pt-4">
                   <div className="flex items-center justify-between">
                      <Label className="text-[9px] font-bold uppercase text-neutral-400">Vertical Space</Label>
                      <Badge variant="outline" className="text-accent border-accent/20 text-[9px] font-mono">{pageData.footerPadding || 80}px</Badge>
                   </div>
                   <Slider value={[pageData.footerPadding || 80]} min={20} max={200} step={10} onValueChange={v => setPageData({...pageData, footerPadding: v[0]})} />
                </div>
             </div>
          </div>
        </div>
      )}

      <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex gap-4">
         <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
         <p className="text-[10px] text-neutral-600 font-medium leading-relaxed italic">
           The footer is the last thing your user sees. Use "Modern Simple" for personal brands and "Classic Matrix" for enterprise entities.
         </p>
      </div>
    </div>
  );
}
