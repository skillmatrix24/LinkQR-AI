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
  Zap, 
  Target, 
  Palette, 
  Sparkles, 
  BrainCircuit, 
  Loader2, 
  ImageIcon, 
  UploadCloud, 
  Trash2, 
  Layers, 
  Paintbrush, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Info,
  ExternalLink,
  Type,
  Maximize2,
  Bold,
  Italic,
  Strikethrough,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateMicroSiteContent } from "@/ai/flows/ai-microsite-flow";
import { useToast } from "@/hooks/use-toast";

interface CTATabProps {
  pageData: any;
  setPageData: (data: any) => void;
  uploadingField: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
}

export function CTATab({ pageData, setPageData, uploadingField, handleImageUpload }: CTATabProps) {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'media' | 'surface' | 'actions'| 'library'>('content');
  const { toast } = useToast();

  const handleAiCTA = async () => {
    setIsAiLoading(true);
    try {
      const res = await generateMicroSiteContent({ 
        businessName: "Business", 
        goal: pageData.sectionTitle || "Click to Action" 
      });
      const ctaSection = res.sections.find(s => s.type === 'cta');
      if (ctaSection) {
        setPageData({ ...pageData, ...ctaSection.data });
        toast({ title: "Smart CTA Ready" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "AI Forge Error" });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* AI Trigger */}
      <Button 
        variant="outline" 
        onClick={handleAiCTA} 
        disabled={isAiLoading} 
        className="w-full h-12 rounded-xl font-black text-[10px] uppercase border-2 gap-2"
      >
        {isAiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3 w-3 text-primary" />} 
        AI Smart CTA
      </Button>

      {/* Internal Navigation */}
      <div className="flex flex-wrap gap-1 p-1 bg-neutral-100 rounded-xl">
        {['content', 'media', 'surface', 'actions'].map(t => (
          <button 
            key={t} 
            onClick={() => setActiveTab(t as any)} 
            className={cn("flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all", activeTab === t ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'content' && (
        <div className="space-y-6 animate-in slide-in-from-left-2">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Main Headline</Label>
              <Input value={pageData.sectionTitle || ""} onChange={e => setPageData({...pageData, sectionTitle: e.target.value})} className="h-11 rounded-xl bg-white font-bold text-sm border-2" />
            </div>

            {/* Highlights Module (Same as Hero) */}
            <div className="space-y-4 p-5 bg-primary/5 rounded-[2rem] border-2 border-primary/10">
              <div className="flex items-center justify-between border-b border-primary/10 pb-3 mb-3">
                 <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Highlights Ultra</Label>
                 <div className="flex items-center gap-2"><span className="text-[8px] font-bold text-muted-foreground uppercase">Gradient</span><Switch checked={pageData.highlightedBgType === 'gradient'} onCheckedChange={v => setPageData({...pageData, highlightedBgType: v ? 'gradient' : 'solid'})} className="scale-75" /></div>
              </div>
              <div className="space-y-4">
                <Input value={pageData.highlightedText || ""} onChange={e => setPageData({...pageData, highlightedText: e.target.value})} placeholder="Words to highlight..." className="h-10 rounded-xl bg-white font-black text-primary text-sm" />
                <div className="flex items-center justify-between gap-2 p-3 bg-white rounded-xl border">
                   <div className="flex gap-1 bg-neutral-100 p-0.5 rounded-lg">
                      <button onClick={() => setPageData({...pageData, highlightBold: !pageData.highlightBold})} className={cn("h-7 w-7 flex items-center justify-center rounded", pageData.highlightBold ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}><Bold className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setPageData({...pageData, highlightItalic: !pageData.highlightItalic})} className={cn("h-7 w-7 flex items-center justify-center rounded", pageData.highlightItalic ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}><Italic className="h-3.5 w-3.5" /></button>
                   </div>
                   <select value={pageData.highlightStyle || 'text'} onChange={e => setPageData({...pageData, highlightStyle: e.target.value})} className="bg-neutral-100 rounded-lg h-8 px-2 text-[8px] font-black uppercase outline-none"><option value="text">Text Only</option><option value="underline">Underline</option><option value="pill">Pill</option></select>
                </div>
                <div className="flex gap-2">
                   <div className="flex-1 space-y-1">
                      <Label className="text-[8px] font-bold uppercase opacity-60">Color 1</Label>
                      <Input type="color" value={pageData.highlightedColor || pageData.themeColor} onChange={e => setPageData({...pageData, highlightedColor: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white rounded-md" />
                   </div>
                   {pageData.highlightedBgType === 'gradient' && (
                     <div className="flex-1 space-y-1">
                        <Label className="text-[8px] font-bold uppercase opacity-60">Color 2</Label>
                        <Input type="color" value={pageData.highlightedColor2 || pageData.themeColor} onChange={e => setPageData({...pageData, highlightedColor2: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white rounded-md" />
                     </div>
                   )}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Description</Label>
              <Textarea value={pageData.sectionDescription || ""} onChange={e => setPageData({...pageData, sectionDescription: e.target.value})} className="text-xs bg-white min-h-[80px] rounded-xl border-2" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'media' && (
        <div className="space-y-6 animate-in slide-in-from-right-2">
          <div className="space-y-4">
             <Label className="text-[10px] font-black uppercase text-muted-foreground">Illustration Image</Label>
             <div 
               className="relative aspect-video bg-neutral-50 rounded-[1.5rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:bg-neutral-100 transition-all shadow-inner relative" 
               onClick={() => document.getElementById('cta-illustration-input')?.click()}
             >
                {pageData.ctaImage ? <img src={pageData.ctaImage} className="w-full h-full object-cover" alt="" /> : <UploadCloud className="h-8 w-8 opacity-30" />}
                {uploadingField === 'ctaImage' && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 animate-in fade-in"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
             </div>
             <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex gap-3">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-[8px] font-bold text-primary/70 uppercase leading-relaxed">
                Media Guide: 800x600px aspect recommended. Max: 1MB. Use transparent PNG for best blending.
              </p>
             </div>
             <input type="file" id="cta-illustration-input" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'ctaImage')} />
             
             {pageData.ctaImage && (
               <div className="p-5 bg-neutral-50 rounded-[2rem] border space-y-6 animate-in fade-in">
                  <div className="flex items-center justify-between">
                     <Label className="text-[10px] font-bold uppercase">Position</Label>
                     <div className="flex gap-1 bg-white p-1 rounded-lg border">
                        <button onClick={() => setPageData({...pageData, ctaImagePosition: 'left'})} className={cn("h-8 w-8 flex items-center justify-center rounded-md transition-all", (pageData.ctaImagePosition || 'right') === 'left' ? "bg-primary text-white shadow-sm" : "text-muted-foreground")}><ChevronLeft className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setPageData({...pageData, ctaImagePosition: 'right'})} className={cn("h-8 w-8 flex items-center justify-center rounded-md transition-all", (pageData.ctaImagePosition || 'right') === 'right' ? "bg-primary text-white shadow-sm" : "text-muted-foreground")}><ChevronRight className="h-3.5 w-3.5" /></button>
                     </div>
                  </div>
                  <div className="space-y-4 pt-4 border-t">
                     <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-bold uppercase">Radius</Label>
                        <Badge variant="outline" className="text-[9px] font-mono">{pageData.ctaImageRadius ?? 32}px</Badge>
                     </div>
                     <Slider value={[pageData.ctaImageRadius ?? 32]} min={0} max={120} step={4} onValueChange={v => setPageData({...pageData, ctaImageRadius: v[0]})} />
                  </div>
                  <div className="space-y-4 pt-4 border-t">
                     <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-bold uppercase">Opacity</Label>
                        <Badge variant="outline" className="text-[9px] font-mono">{pageData.ctaImageOpacity ?? 100}%</Badge>
                     </div>
                     <Slider value={[pageData.ctaImageOpacity ?? 100]} min={0} max={100} step={5} onValueChange={v => setPageData({...pageData, ctaImageOpacity: v[0]})} />
                  </div>
                  <Button variant="ghost" className="w-full text-red-500 text-[10px] font-black uppercase h-10 hover:bg-red-50" onClick={() => setPageData({...pageData, ctaImage: ''})}><Trash2 className="h-3.5 w-3.5 mr-2" /> Remove Illustration</Button>
               </div>
             )}
          </div>
        </div>
      )}

      {activeTab === 'surface' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2">
           <div className="p-5 bg-neutral-900 text-white rounded-[2.5rem] space-y-8 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12"><Paintbrush className="h-20 w-20 text-accent" /></div>
              <div className="space-y-6 relative z-10">
                 <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <Label className="text-[10px] font-black uppercase text-accent flex items-center gap-2"><Palette className="h-3.5 w-3.5" /> Stage Identity</Label>
                    <div className="flex items-center gap-2"><span className="text-[8px] font-bold opacity-60 uppercase">GRADIENT</span><Switch checked={pageData.sectionBgType === 'gradient'} onCheckedChange={v => setPageData({...pageData, sectionBgType: v ? 'gradient' : 'solid'})} className="scale-75" /></div>
                 </div>
                 <div className="flex gap-2">
                    <Input type="color" value={pageData.sectionBgColor1 || '#ffffff'} onChange={e => setPageData({...pageData, sectionBgColor1: e.target.value})} className="h-9 w-full p-0.5 border-none bg-white/10 rounded-lg cursor-pointer" />
                    {pageData.sectionBgType === 'gradient' && <Input type="color" value={pageData.sectionBgColor2 || '#ffffff'} onChange={e => setPageData({...pageData, sectionBgColor2: e.target.value})} className="h-9 w-full p-0.5 border-none bg-white/10 rounded-lg cursor-pointer animate-in zoom-in-95" />}
                 </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10 relative z-10">
                 <Label className="text-[10px] font-black uppercase text-accent flex items-center gap-2"><ImageIcon className="h-3.5 w-3.5" /> Section BG Image</Label>
                 <div 
                   className="relative aspect-video bg-white/5 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer overflow-hidden group hover:border-accent/40 transition-all shadow-inner relative" 
                   onClick={() => document.getElementById('cta-section-bg-input')?.click()}
                 >
                    {pageData.sectionBgImage ? <img src={pageData.sectionBgImage} className="w-full h-full object-cover" alt="" /> : <UploadCloud className="h-6 w-6 opacity-20" />}
                    {uploadingField === 'sectionBgImage' && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 animate-in fade-in"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>}
                 </div>
                 <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex gap-3">
                  <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <p className="text-[8px] font-bold text-accent/70 uppercase leading-relaxed">
                    Surface Guide: 1200x800px recommended for wide displays. Max: 2MB.
                  </p>
                 </div>
                 <input type="file" id="cta-section-bg-input" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'sectionBgImage')} />
                 
                 {pageData.sectionBgImage && (
                   <div className="space-y-4 pt-4 animate-in fade-in">
                      <div className="flex items-center justify-between"><Label className="text-[9px] font-bold uppercase opacity-60">Overlay strength</Label><Badge variant="outline" className="text-accent border-accent/20 text-[9px] font-mono">{pageData.sectionBgOverlayOpacity || 0}%</Badge></div>
                      <Slider value={[pageData.sectionBgOverlayOpacity || 0]} min={0} max={100} step={5} onValueChange={v => setPageData({...pageData, sectionBgOverlayOpacity: v[0]})} />
                      <div className="flex items-center gap-3"><Label className="text-[8px] font-bold uppercase opacity-40">Overlay Tint</Label><Input type="color" value={pageData.sectionBgOverlayColor || '#000000'} onChange={e => setPageData({...pageData, sectionBgOverlayColor: e.target.value})} className="h-7 w-12 p-0.5 border-none bg-white/10 rounded-md" /></div>
                   </div>
                 )}
              </div>
           </div>

           <div className="p-5 bg-neutral-50 rounded-[2rem] border space-y-6">
              <div className="space-y-4">
                 <Label className="text-[10px] font-black uppercase flex items-center gap-2"><AlignLeft className="h-3.5 w-3.5" /> Text Alignment</Label>
                 <div className="flex gap-2">
                   {[ { id: 'left', icon: AlignLeft }, { id: 'center', icon: AlignCenter }, { id: 'right', icon: AlignRight } ].map(btn => (
                     <button key={btn.id} onClick={() => setPageData({...pageData, titleAlign: btn.id})} className={cn("h-10 flex-1 flex items-center justify-center rounded-xl border-2 transition-all", (pageData.titleAlign || 'center') === btn.id ? "bg-primary text-white border-primary shadow-lg" : "bg-white text-muted-foreground hover:bg-neutral-50")}>
                       <btn.icon className="h-4 w-4" />
                     </button>
                   ))}
                 </div>
              </div>
              <div className="space-y-4 border-t pt-4">
                 <div className="flex items-center justify-between"><Label className="text-[10px] font-bold uppercase">Vertical Space</Label><Badge variant="outline" className="text-[9px] font-mono">{pageData.sectionPaddingTop || 80}px</Badge></div>
                 <Slider value={[pageData.sectionPaddingTop || 80]} min={20} max={200} step={10} onValueChange={v => setPageData({...pageData, sectionPaddingTop: v[0], sectionPaddingBottom: v[0]})} />
              </div>
           </div>
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2">
           <div className="p-6 bg-primary/5 border-2 border-primary/10 rounded-[2.5rem] space-y-6">
              <div className="flex items-center gap-3 border-b border-primary/10 pb-4">
                 <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg"><Zap className="h-5 w-5" /></div>
                 <h4 className="font-black text-sm uppercase tracking-tight text-primary">CTA Button Studio</h4>
              </div>
              <div className="space-y-4">
                 <Input value={pageData.ctaButtonText || ""} onChange={e => setPageData({...pageData, ctaButtonText: e.target.value})} placeholder="Button Label" className="h-11 rounded-xl bg-white border-none shadow-inner font-black" />
                 <Input value={pageData.ctaButtonUrl || ""} onChange={e => setPageData({...pageData, ctaButtonUrl: e.target.value})} placeholder="Redirect URL (https://...)" className="h-10 rounded-xl bg-white border-none shadow-inner text-xs font-mono" />
                 <div className="flex items-center justify-between pt-2">
                    <Label className="text-[9px] font-bold uppercase">Action Tint</Label>
                    <Input type="color" value={pageData.ctaButtonColor || '#6750A4'} onChange={e => setPageData({...pageData, ctaButtonColor: e.target.value})} className="h-8 w-14 p-0.5 border-none bg-transparent cursor-pointer" />
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 flex gap-4">
         <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
         <p className="text-[10px] text-emerald-800 font-medium leading-relaxed italic">
           Advanced CTA nodes function as the final conversion trigger. Use 'Media' to add social proof images or product mockups.
         </p>
      </div>
    </div>
  );
}
