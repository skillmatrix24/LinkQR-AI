'use client';

import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Scale, FileText, Palette, Type, AlignLeft, AlignCenter, AlignRight, Info, Layout, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

interface LegalTabProps {
  pageData: any;
  setPageData: (data: any) => void;
}

export function LegalTab({ pageData, setPageData }: LegalTabProps) {
  return (
    <div className="space-y-10 animate-in fade-in duration-300 pb-12">
      {/* 1. Header & Section Style */}
      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
            <Type className="h-3.5 w-3.5 text-primary" /> Section Header
          </Label>
          <Input 
            value={pageData.legalSectionTitle || ""} 
            onChange={e => setPageData({...pageData, legalSectionTitle: e.target.value})} 
            placeholder="Terms & Privacy Information" 
            className="h-11 rounded-xl bg-neutral-50 border-none font-bold text-sm shadow-inner"
          />
        </div>

        <div className="p-6 bg-neutral-50 rounded-[2rem] border space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
             <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
               <Palette className="h-3.5 w-3.5" /> Stage Studio
             </Label>
             <div className="flex items-center gap-2">
                <span className="text-[8px] font-bold uppercase">Gradient</span>
                <Switch 
                  checked={pageData.legalSectionBgType === 'gradient'} 
                  onCheckedChange={v => setPageData({...pageData, legalSectionBgType: v ? 'gradient' : 'solid'})}
                  className="scale-75"
                />
             </div>
          </div>
          
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <Input 
                  type="color" 
                  value={pageData.legalSectionBgColor1 || '#ffffff'} 
                  onChange={e => setPageData({...pageData, legalSectionBgColor1: e.target.value})} 
                  className="h-10 w-full cursor-pointer p-1 rounded-xl shadow-inner border-none bg-white"
                />
                {pageData.legalSectionBgType === 'gradient' && (
                  <Input 
                    type="color" 
                    value={pageData.legalSectionBgColor2 || '#ffffff'} 
                    onChange={e => setPageData({...pageData, legalSectionBgColor2: e.target.value})} 
                    className="h-10 w-full cursor-pointer p-1 rounded-xl shadow-inner border-none bg-white animate-in zoom-in-95"
                  />
                )}
             </div>
             
             <div className="space-y-3 pt-4 border-t">
                <Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Title Alignment</Label>
                <div className="flex gap-2">
                  {[
                    { id: 'left', icon: AlignLeft },
                    { id: 'center', icon: AlignCenter },
                    { id: 'right', icon: AlignRight }
                  ].map(align => (
                    <button 
                      key={align.id} 
                      type="button"
                      onClick={() => setPageData({...pageData, titleAlign: align.id})}
                      className={cn("h-9 flex-1 flex items-center justify-center rounded-xl border-2 transition-all", (pageData.titleAlign || 'center') === align.id ? "bg-primary text-white border-primary" : "bg-white text-muted-foreground hover:bg-neutral-50")}
                    >
                       <align.icon className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
             </div>

             <div className="space-y-3 pt-4 border-t">
                <Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Split View Architecture</Label>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border">
                   <div className="flex items-center gap-3"><div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Maximize2 className="h-4 w-4" /></div><span className="text-[10px] font-black uppercase">Enable Split</span></div>
                   <Switch checked={pageData.layoutSplit} onCheckedChange={v => setPageData({...pageData, layoutSplit: v})} />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* 2. Policies Editor */}
      <div className="space-y-8">
        <div className="p-6 bg-white border-2 border-neutral-100 rounded-[2.5rem] space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b pb-4">
             <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Scale className="h-5 w-5" />
             </div>
             <h4 className="font-black text-sm uppercase tracking-tight">Privacy Policy</h4>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">External Policy URL</Label>
              <Input 
                value={pageData.privacyPolicyUrl || ""} 
                onChange={e => setPageData({...pageData, privacyPolicyUrl: e.target.value})} 
                placeholder="https://..." 
                className="h-10 rounded-xl bg-neutral-50 border-none shadow-inner text-xs" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Inline Content</Label>
              <Textarea 
                value={pageData.privacyPolicyContent || ""} 
                onChange={e => setPageData({...pageData, privacyPolicyContent: e.target.value})} 
                placeholder="Policy details..." 
                className="rounded-xl min-h-[100px] bg-neutral-50 border-none shadow-inner text-[11px] leading-relaxed" 
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border-2 border-neutral-100 rounded-[2.5rem] space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b pb-4">
             <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shadow-inner">
                <FileText className="h-5 w-5" />
             </div>
             <h4 className="font-black text-sm uppercase tracking-tight">Terms of Service</h4>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">External Terms URL</Label>
              <Input 
                value={pageData.termsOfServiceUrl || ""} 
                onChange={e => setPageData({...pageData, termsOfServiceUrl: e.target.value})} 
                placeholder="https://..." 
                className="h-10 rounded-xl bg-neutral-50 border-none shadow-inner text-xs" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Inline Content</Label>
              <Textarea 
                value={pageData.termsOfServiceContent || ""} 
                onChange={e => setPageData({...pageData, termsOfServiceContent: e.target.value})} 
                placeholder="Terms details..." 
                className="rounded-xl min-h-[100px] bg-neutral-50 border-none shadow-inner text-[11px] leading-relaxed" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-neutral-50 rounded-[2.5rem] border space-y-8 animate-in zoom-in-95">
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <Label className="text-[10px] font-black uppercase text-primary">Padding Top</Label>
                 <Badge variant="outline" className="font-mono text-[10px]">{pageData.sectionPaddingTop || 80}px</Badge>
              </div>
              <Slider value={[pageData.sectionPaddingTop || 80]} min={0} max={240} step={4} onValueChange={v => setPageData({...pageData, sectionPaddingTop: v[0]})} />
           </div>
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <Label className="text-[10px] font-black uppercase text-primary">Padding Bottom</Label>
                 <Badge variant="outline" className="font-mono text-[10px]">{pageData.sectionPaddingBottom || 80}px</Badge>
              </div>
              <Slider value={[pageData.sectionPaddingBottom || 80]} min={0} max={240} step={4} onValueChange={v => setPageData({...pageData, sectionPaddingBottom: v[0]})} />
           </div>
      </div>
      
      <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex gap-4">
         <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
         <p className="text-[10px] text-neutral-600 font-medium leading-relaxed italic">
           All legal nodes are optimized for search visibility and high-fidelity mobile rendering.
         </p>
      </div>
    </div>
  );
}
