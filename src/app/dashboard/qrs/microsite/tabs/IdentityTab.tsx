'use client';

import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Trash2, 
  Link2, 
  UploadCloud, 
  Loader2, 
  Monitor, 
  Smartphone,
  Zap,
  Globe,
  Navigation,
  Target,
  Plus,
  X,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

interface IdentityTabProps {
  pageData: any;
  setPageData: (data: any) => void;
  uploadingField: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string, index?: number) => void;
}

export function IdentityTab({ pageData, setPageData, uploadingField, handleImageUpload }: IdentityTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'content' | 'nav'>('content');

  const addNavLink = () => {
    const newLinks = [...(pageData.navLinks || []), { label: 'New Link', url: '#' }];
    setPageData({ ...pageData, navLinks: newLinks });
  };

  const removeNavLink = (index: number) => {
    const newLinks = (pageData.navLinks || []).filter((_: any, i: number) => i !== index);
    setPageData({ ...pageData, navLinks: newLinks });
  };

  const updateNavLink = (index: number, key: string, val: string) => {
    const newLinks = [...(pageData.navLinks || [])];
    newLinks[index] = { ...newLinks[index], [key]: val };
    setPageData({ ...pageData, navLinks: newLinks });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      <div className="flex bg-neutral-100 p-1 rounded-xl shadow-inner shrink-0">
        {[
          { id: 'content', icon: Globe, label: 'Brand' },
          { id: 'nav', icon: Navigation, label: 'Nav' }
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setActiveSubTab(t.id as any)} 
            className={cn(
              "flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all flex flex-col items-center gap-1", 
              activeSubTab === t.id ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:bg-white/50"
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'content' && (
        <div className="space-y-8 animate-in slide-in-from-left-2">
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
              <Link2 className="h-3.5 w-3.5 text-primary" /> Global Permalink
            </Label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground opacity-30">linkqr.in/s/</div>
              <Input 
                value={pageData.slug || ""} 
                onChange={e => setPageData({...pageData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')})} 
                placeholder="my-offer-2026" 
                className="h-12 rounded-xl pl-[84px] font-bold text-sm bg-white border-2 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="p-6 bg-primary/5 border-2 border-primary/10 rounded-[2.5rem] space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-primary/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg">
                   <Target className="h-5 w-5" />
                </div>
                <h4 className="font-black text-sm uppercase tracking-tight text-primary">Header CTA</h4>
              </div>
              <Switch checked={pageData.headerCtaEnabled} onCheckedChange={v => setPageData({...pageData, headerCtaEnabled: v})} />
            </div>
            
            {pageData.headerCtaEnabled && (
              <div className="space-y-6 animate-in slide-in-from-top-2">
                <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Button Text</Label>
                  <Input value={pageData.headerCtaText} onChange={e => setPageData({...pageData, headerCtaText: e.target.value})} placeholder="e.g. Book Now" className="h-11 rounded-xl bg-white border-none shadow-inner font-black text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Redirect URL</Label>
                  <Input value={pageData.headerCtaUrl || ""} onChange={e => setPageData({...pageData, headerCtaUrl: e.target.value})} placeholder="https://..." className="h-10 rounded-xl bg-white border-none shadow-inner text-xs font-mono" />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 p-6 border-2 border-dashed rounded-[2.5rem] bg-neutral-50/50">
            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Brand Mark / Logo</Label>
            {pageData.logoUrl ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border shadow-sm relative overflow-hidden">
                  {uploadingField === 'logoUrl' && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
                  <div className="relative h-12 w-24 bg-neutral-50 rounded-lg p-2 border flex items-center justify-center overflow-hidden">
                    <img src={pageData.logoUrl} className="max-h-full max-w-full object-contain" alt="" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-lg h-9 font-bold text-[9px] uppercase" onClick={() => document.getElementById('microsite-logo-input')?.click()}>Replace</Button>
                    <Button variant="ghost" size="icon" onClick={() => setPageData({...pageData, logoUrl: ''})} className="h-9 w-9 rounded-lg text-destructive hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[9px] font-bold uppercase flex items-center gap-2"><Monitor className="h-3.5 w-3.5" /> Desktop Height</Label>
                    <Badge variant="outline" className="font-mono text-[9px]">{pageData.logoHeight || 32}px</Badge>
                  </div>
                  <Slider value={[pageData.logoHeight || 32]} min={10} max={120} step={1} onValueChange={(v) => setPageData({...pageData, logoHeight: v[0]})} />
                </div>
              </div>
            ) : (
              <div className="h-32 bg-white rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-all shadow-inner relative" onClick={() => document.getElementById('microsite-logo-input')?.click()}>
                {uploadingField === 'logoUrl' ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <UploadCloud className="h-6 w-6 opacity-20" />}
                <span className="text-[10px] font-black uppercase text-muted-foreground mt-3 tracking-[0.2em]">Upload Brand Mark</span>
              </div>
            )}
            <input type="file" id="microsite-logo-input" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logoUrl')} />
          </div>
        </div>
      )}

      {activeSubTab === 'nav' && (
        <div className="space-y-6 animate-in slide-in-from-right-2">
           <div className="p-6 bg-white border-2 border-neutral-100 rounded-[2.5rem] space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b pb-4">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner"><Navigation className="h-5 w-5" /></div>
                    <h4 className="font-black text-sm uppercase tracking-tight">Navigation Hub</h4>
                 </div>
                 <Button size="icon" onClick={addNavLink} className="h-8 w-8 rounded-full shadow-lg"><Plus className="h-4 w-4" /></Button>
              </div>

              <div className="space-y-4">
                 {Array.isArray(pageData.navLinks) && pageData.navLinks.map((link: any, i: number) => (
                   <div key={i} className="p-4 bg-neutral-50 rounded-2xl space-y-3 relative group animate-in zoom-in-95">
                      <button onClick={() => removeNavLink(i)} className="absolute -top-2 -right-2 h-7 w-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-xl transition-all"><X className="h-3.5 w-3.5" /></button>
                      <div className="space-y-2">
                         <Label className="text-[8px] font-bold uppercase opacity-60">Link Label</Label>
                         <Input value={link.label} onChange={e => updateNavLink(i, 'label', e.target.value)} className="h-9 bg-white text-xs font-black" />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[8px] font-bold uppercase opacity-60">Target (e.g. #features)</Label>
                         <Input value={link.url} onChange={e => updateNavLink(i, 'url', e.target.value)} className="h-9 bg-white text-xs font-mono" />
                      </div>
                   </div>
                 ))}
                 {(!pageData.navLinks || pageData.navLinks.length === 0) && <div className="py-10 text-center opacity-20"><Navigation className="h-8 w-8 mx-auto mb-2" /><p className="text-[10px] font-bold uppercase">No links defined</p></div>}
              </div>
           </div>
        </div>
      )}

      <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex gap-4">
         <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
         <p className="text-[10px] text-neutral-600 font-medium leading-relaxed italic text-left">
            Advanced identity markers allow you to override global site settings and create a unique retina-display brand node.
         </p>
      </div>
    </div>
  );
}
