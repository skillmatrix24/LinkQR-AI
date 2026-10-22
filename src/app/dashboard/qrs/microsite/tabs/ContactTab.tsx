
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
  Phone, 
  Mail, 
  Globe, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Palette, 
  Layers,
  Info,
  Target,
  LayoutList,
  LayoutGrid,
  Paintbrush
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Advanced ContactTab: Full Presentation Studio for Direct Hub.
 */
export function ContactTab({ pageData, setPageData }: any) {
  const [activeTab, setActiveTab] = useState<'content' | 'surface'>('content');

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      <div className="flex bg-neutral-100 p-1 rounded-xl shadow-inner shrink-0">
        <button 
          onClick={() => setActiveTab('content')} 
          className={cn("flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", activeTab === 'content' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}
        >
          Fields
        </button>
        <button 
          onClick={() => setActiveTab('surface')} 
          className={cn("flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", activeTab === 'surface' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}
        >
          Surface
        </button>
      </div>

      {activeTab === 'content' && (
        <div className="space-y-8 animate-in slide-in-from-left-2">
          <div className="space-y-4">
             <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Section Title</Label>
                <Input value={pageData.sectionTitle} onChange={e => setPageData({...pageData, sectionTitle: e.target.value})} className="h-11 rounded-xl bg-white font-bold border-2" />
             </div>
             <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Subtext Description</Label>
                <Textarea value={pageData.sectionDescription} onChange={e => setPageData({...pageData, sectionDescription: e.target.value})} className="min-h-[80px] rounded-xl bg-white text-xs border-2" />
             </div>
          </div>

          <div className="p-6 bg-neutral-50 rounded-[2.5rem] border space-y-6 shadow-inner">
             <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Channel Registry</Label>
             <div className="space-y-4">
                <div className="space-y-3 p-4 bg-white rounded-2xl border shadow-sm">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /><span className="text-[11px] font-bold uppercase">Mobile Node</span></div>
                      <Switch checked={pageData.showMobile !== false} onCheckedChange={v => setPageData({...pageData, showMobile: v})} className="scale-75" />
                   </div>
                   <Input value={pageData.mobile || ""} onChange={e => setPageData({...pageData, mobile: e.target.value})} placeholder="+91..." className="h-9 text-xs bg-neutral-50 border-none font-mono" />
                </div>
                
                <div className="space-y-3 p-4 bg-white rounded-2xl border shadow-sm">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /><span className="text-[11px] font-bold uppercase">Email Node</span></div>
                      <Switch checked={pageData.showEmail !== false} onCheckedChange={v => setPageData({...pageData, showEmail: v})} className="scale-75" />
                   </div>
                   <Input value={pageData.email || ""} onChange={e => setPageData({...pageData, email: e.target.value})} placeholder="name@email.com" className="h-9 text-xs bg-neutral-50 border-none" />
                </div>

                <div className="space-y-3 p-4 bg-white rounded-2xl border shadow-sm">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><Globe className="h-4 w-4 text-primary" /><span className="text-[11px] font-bold uppercase">Website Node</span></div>
                      <Switch checked={pageData.showWebsite !== false} onCheckedChange={v => setPageData({...pageData, showWebsite: v})} className="scale-75" />
                   </div>
                   <Input value={pageData.website || ""} onChange={e => setPageData({...pageData, website: e.target.value})} placeholder="https://..." className="h-9 text-xs bg-neutral-50 border-none" />
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'surface' && (
        <div className="space-y-8 animate-in slide-in-from-right-2">
           <div className="p-5 bg-neutral-50 rounded-[2.5rem] border space-y-6">
              <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><Layers className="h-3.5 w-3.5" /> Stage Controls</Label>
              <div className="space-y-6">
                 <div className="space-y-3">
                    <Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Header Alignment</Label>
                    <div className="flex gap-2">
                      {[ { id: 'left', icon: AlignLeft }, { id: 'center', icon: AlignCenter }, { id: 'right', icon: AlignRight } ].map(btn => (
                        <button key={btn.id} onClick={() => setPageData({...pageData, titleAlign: btn.id})} className={cn("h-10 flex-1 flex items-center justify-center rounded-xl border-2 transition-all", (pageData.titleAlign || 'center') === btn.id ? "bg-primary text-white border-primary shadow-lg" : "bg-white text-muted-foreground hover:bg-neutral-100")}>
                          <btn.icon className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                 </div>

                 <div className="p-4 bg-white rounded-2xl border space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                       <span className="text-[9px] font-bold uppercase text-muted-foreground">Icon Color</span>
                       <Input type="color" value={pageData.iconColor || '#ffffff'} onChange={e => setPageData({...pageData, iconColor: e.target.value})} className="h-8 w-14 p-0.5 border-none bg-transparent cursor-pointer" />
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                       <span className="text-[9px] font-bold uppercase text-muted-foreground">Icon Background</span>
                       <Input type="color" value={pageData.iconBgColor || '#6750A4'} onChange={e => setPageData({...pageData, iconBgColor: e.target.value})} className="h-8 w-14 p-0.5 border-none bg-transparent cursor-pointer" />
                    </div>
                 </div>

                 <div className="space-y-4 pt-2 border-t">
                    <div className="flex items-center justify-between">
                       <Label className="text-[10px] font-bold uppercase">Vertical Pad</Label>
                       <Badge variant="outline" className="text-[9px] font-mono">{pageData.sectionPaddingTop || 60}px</Badge>
                    </div>
                    <Slider value={[pageData.sectionPaddingTop || 60]} min={0} max={200} step={10} onValueChange={v => setPageData({...pageData, sectionPaddingTop: v[0], sectionPaddingBottom: v[0]})} />
                 </div>
              </div>
           </div>

           <div className="p-6 bg-neutral-900 text-white rounded-[2.5rem] border-none space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12"><Paintbrush className="h-20 w-20 text-accent" /></div>
              <Label className="text-[10px] font-black uppercase text-accent tracking-widest flex items-center gap-2 relative z-10"><Paintbrush className="h-3.5 w-3.5" /> Stage Surface</Label>
              <div className="space-y-4 relative z-10">
                 <div className="flex items-center justify-between"><Label className="text-[10px] font-bold uppercase opacity-60">Gradient Mode</Label><Switch checked={pageData.sectionBgType === 'gradient'} onCheckedChange={v => setPageData({...pageData, sectionBgType: v ? 'gradient' : 'solid'})} className="scale-75" /></div>
                 <div className="flex gap-2">
                    <Input type="color" value={pageData.sectionBgColor1 || 'transparent'} onChange={e => setPageData({...pageData, sectionBgColor1: e.target.value})} className="h-10 w-full p-0.5 border-none bg-white/10 rounded-xl cursor-pointer" />
                    {pageData.sectionBgType === 'gradient' && <Input type="color" value={pageData.sectionBgColor2 || 'transparent'} onChange={e => setPageData({...pageData, sectionBgColor2: e.target.value})} className="h-10 w-full p-0.5 border-none bg-white/10 rounded-xl cursor-pointer animate-in zoom-in-95" />}
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-4">
         <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
         <p className="text-[10px] text-neutral-600 font-medium leading-relaxed italic text-left">
           Advanced Contact Nodes are rendered as individual identity hubs. Use "Surface" to set a contrast background for the hub.
         </p>
      </div>
    </div>
  );
}
