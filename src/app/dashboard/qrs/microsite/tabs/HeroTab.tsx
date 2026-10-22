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
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Sparkles,
  BrainCircuit,
  Palette,
  Maximize,
  ChevronLeft,
  ChevronRight,
  Zap,
  Tag,
  ImageIcon,
  Trash2,
  Paintbrush,
  Type,
  RotateCcw,
  Bold,
  Italic,
  Strikethrough,
  Info,
  Maximize2,
  MessageSquarePlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateMicroSiteContent } from "@/ai/flows/ai-microsite-flow";
import { useToast } from "@/hooks/use-toast";

interface HeroTabProps {
  pageData: any;
  globalAiContext?: any;
  setPageData: (data: any) => void;
  uploadingField: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string, index?: number) => void;
}

export function HeroTab({ pageData, globalAiContext, setPageData, uploadingField, handleImageUpload }: HeroTabProps) {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'content' | 'style' | 'actions' | 'background' | 'spacing'>('content');
  const [customRefineInstruction, setCustomRefineInstruction] = useState("");
  const { toast } = useToast();

  const handleAiCopy = async () => {
    setIsAiLoading(true);
    try {
      const res = await generateMicroSiteContent({ 
        businessName: globalAiContext?.businessName || "Business", 
        goal: globalAiContext?.goal || pageData.headline || "Conversion",
        audience: globalAiContext?.audience || "",
        offer: globalAiContext?.offer || "",
        description: globalAiContext?.description || "", 
        tone: globalAiContext?.tone || "Professional",
        brandVibe: globalAiContext?.vibe || "Modern",
        refineInstruction: customRefineInstruction,
        targetBlockType: 'hero'
      });
      
      const heroBlock = res.sections.find(s => s.type === 'hero');
      if (heroBlock && heroBlock.data) {
        setPageData({
          ...pageData,
          ...heroBlock.data
        });
        toast({ 
          title: "Hero Strategy Refined", 
          description: customRefineInstruction ? `Applied: "${customRefineInstruction}"` : "AI has refined the narrative." 
        });
        setCustomRefineInstruction("");
      }
    } catch (err) {
      toast({ variant: "destructive", title: "AI Forge Error" });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 overflow-x-hidden">
      
      <div className="p-4 bg-accent/5 border-2 border-dashed border-accent/20 rounded-[2rem] space-y-4">
         <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-accent text-white flex items-center justify-center shadow-lg animate-pulse">
               <Sparkles className="h-5 w-5" />
            </div>
            <h4 className="font-black text-xs uppercase tracking-tight text-accent">Hero Intelligence</h4>
         </div>
         <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-accent/60 ml-1">Custom Command (Optional)</Label>
            <Input 
              value={customRefineInstruction} 
              onChange={e => setCustomRefineInstruction(e.target.value)}
              placeholder="e.g. Make it more urgent..." 
              className="h-10 rounded-xl bg-white border-none shadow-inner text-xs font-bold"
            />
         </div>
         <Button 
          size="sm" 
          onClick={handleAiCopy} 
          disabled={isAiLoading} 
          className="w-full h-11 rounded-xl font-black text-[10px] uppercase shadow-lg bg-accent hover:bg-accent/90 text-white gap-2"
         >
            {isAiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3 w-3" />} 
            RE-FORGE NARRATIVE
         </Button>
      </div>

      <div className="flex flex-wrap gap-1.5 p-1 bg-neutral-100 rounded-xl">
           {['content', 'style', 'actions', 'background', 'spacing'].map((tab) => (
             <button key={tab} onClick={() => setActiveSection(tab as any)} className={cn("flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all", activeSection === tab ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:bg-white/50")}>{tab}</button>
           ))}
      </div>

      {activeSection === 'content' && (
        <div className="space-y-6 animate-in slide-in-from-left-2">
          <div className="p-4 bg-neutral-50 rounded-2xl border space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase flex items-center gap-2"><Tag className="h-3 w-3 text-primary" /> Badge / Label</Label>
              <Switch checked={pageData.heroBadgeEnabled} onCheckedChange={v => setPageData({...pageData, heroBadgeEnabled: v})} />
            </div>
            {pageData.heroBadgeEnabled && (
              <div className="space-y-3 animate-in slide-in-from-top-2">
                <Input value={pageData.heroBadgeText} onChange={e => setPageData({...pageData, heroBadgeText: e.target.value})} placeholder="e.g. New Launch" className="h-9 text-xs" />
                <div className="flex gap-2">
                   <div className="flex-1 space-y-1">
                      <Label className="text-[8px] font-bold uppercase opacity-60">BG Color</Label>
                      <Input type="color" value={pageData.heroBadgeBgColor || '#6750A4'} onChange={e => setPageData({...pageData, heroBadgeBgColor: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white rounded-md" />
                   </div>
                   <div className="flex-1 space-y-1">
                      <Label className="text-[8px] font-bold uppercase opacity-60">Text Color</Label>
                      <Input type="color" value={pageData.heroBadgeTextColor || '#ffffff'} onChange={e => setPageData({...pageData, heroBadgeTextColor: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white rounded-md" />
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Main Headline</Label>
              <Input value={pageData.headline} onChange={e => setPageData({...pageData, headline: e.target.value})} placeholder="e.g. Build your dream with" className="h-11 rounded-xl font-bold text-sm bg-white border-2" />
            </div>
            <div className="space-y-4 p-5 bg-primary/5 rounded-[2rem] border-2 border-primary/10 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-primary/10 pb-3 mb-3">
                 <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Highlights Ultra</Label>
                 <div className="flex items-center gap-2"><span className="text-[8px] font-bold text-muted-foreground uppercase">Gradient</span><Switch checked={pageData.highlightedBgType === 'gradient'} onCheckedChange={v => setPageData({...pageData, highlightedBgType: v ? 'gradient' : 'solid'})} className="scale-75" /></div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                   <Label className="text-[8px] font-bold uppercase text-muted-foreground">Words to Highlight</Label>
                   <Input value={pageData.highlightedText || ""} onChange={e => setPageData({...pageData, highlightedText: e.target.value})} placeholder="e.g. Dream Home" className="h-10 rounded-xl bg-white border-none shadow-inner font-black text-primary text-sm" />
                </div>
                <div className="p-3 bg-white rounded-xl border border-primary/10 space-y-3">
                   <Label className="text-[8px] font-bold uppercase text-muted-foreground block border-b pb-1 mb-2">Typography Overrides</Label>
                   <div className="flex items-center justify-between gap-2">
                      <div className="flex gap-1 bg-neutral-100 p-0.5 rounded-lg">
                         <button onClick={() => setPageData({...pageData, highlightBold: !pageData.highlightBold})} className={cn("h-7 w-7 flex items-center justify-center rounded transition-all", pageData.highlightBold ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}><Bold className="h-3.5 w-3.5" /></button>
                         <button onClick={() => setPageData({...pageData, highlightItalic: !pageData.highlightItalic})} className={cn("h-7 w-7 flex items-center justify-center rounded transition-all", pageData.highlightItalic ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}><Italic className="h-3.5 w-3.5" /></button>
                         <button onClick={() => setPageData({...pageData, highlightStrike: !pageData.highlightStrike})} className={cn("h-7 w-7 flex items-center justify-center rounded transition-all", pageData.highlightStrike ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}><Strikethrough className="h-3.5 w-3.5" /></button>
                      </div>
                      <select value={pageData.highlightCase || 'none'} onChange={e => setPageData({...pageData, highlightCase: e.target.value})} className="bg-neutral-100 border-none rounded-lg h-8 px-2 text-[8px] font-black uppercase outline-none"><option value="none">Original</option><option value="uppercase">ALL CAPS</option><option value="lowercase">lowercase</option><option value="capitalize">Capitalize</option></select>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2"><Label className="text-[8px] font-bold uppercase text-muted-foreground">Effect Style</Label><select value={pageData.highlightStyle || 'text'} onChange={e => setPageData({...pageData, highlightStyle: e.target.value})} className="w-full bg-white border rounded-lg h-9 px-2 text-[9px] font-black uppercase"><option value="text">Text Only</option><option value="underline">Underline</option><option value="pill">Pill Background</option></select></div>
                  <div className="space-y-2 flex flex-col justify-end"><div className="flex items-center justify-between p-1.5 bg-white rounded-lg border"><span className="text-[8px] font-bold uppercase">Glow</span><Switch checked={pageData.highlightGlow} onCheckedChange={v => setPageData({...pageData, highlightGlow: v})} className="scale-50" /></div></div>
                </div>
                <div className="space-y-3 pt-2">
                   <div className="flex items-center justify-between"><Label className="text-[8px] font-bold uppercase text-muted-foreground">Rotation (Tilt)</Label><Badge variant="outline" className="text-[8px] font-mono">{pageData.highlightRotate || 0}°</Badge></div>
                   <Slider value={[pageData.highlightRotate || 0]} min={10} max={10} step={1} onValueChange={v => setPageData({...pageData, highlightRotate: v[0]})} />
                </div>
                <div className="space-y-2">
                   <Label className="text-[8px] font-bold uppercase text-muted-foreground">Highlight Color(s)</Label>
                   <div className="flex gap-2">
                      <div className="flex-1"><Input type="color" value={pageData.highlightedColor || pageData.themeColor} onChange={e => setPageData({...pageData, highlightedColor: e.target.value})} className="h-9 w-full p-0.5 border-none bg-white rounded-lg cursor-pointer shadow-sm" /></div>
                      {pageData.highlightedBgType === 'gradient' && <div className="flex-1 animate-in slide-in-from-left-2"><Input type="color" value={pageData.highlightedColor2 || pageData.themeColor} onChange={e => setPageData({...pageData, highlightedColor2: e.target.value})} className="h-9 w-full p-0.5 border-none bg-white rounded-lg cursor-pointer shadow-sm" /></div>}
                   </div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-muted-foreground">Subheadline</Label><Textarea value={pageData.subheadline} onChange={e => setPageData({...pageData, subheadline: e.target.value})} className="rounded-xl min-h-[80px] text-sm bg-white border-2" /></div>
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase text-muted-foreground">Main Illustration / Image</Label>
            <div className="relative aspect-video bg-neutral-50 rounded-[1.5rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:bg-neutral-100 transition-all shadow-inner" onClick={() => document.getElementById('microsite-hero-input')?.click()}>
              {pageData.heroImage ? <img src={pageData.heroImage} className="w-full h-full object-cover" alt="" /> : <UploadCloud className="h-8 w-8 opacity-30" />}
              {uploadingField === 'heroImage' && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 animate-in fade-in"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
            </div>
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex gap-3">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-[8px] font-bold text-primary/70 uppercase leading-relaxed">
                Hero Guide: Recommended 1200x800px. Max: 2MB. Use high-contrast PNG or JPG.
              </p>
            </div>
            <input type="file" id="microsite-hero-input" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'heroImage')} />
          </div>
        </div>
      )}

      {activeSection === 'style' && (
        <div className="space-y-6 animate-in slide-in-from-right-2">
          <div className="p-5 bg-neutral-50 rounded-[2rem] border space-y-6">
            <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><Palette className="h-3 w-3" /> Appearance Controls</Label>
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between"><Label className="text-[10px] font-bold uppercase">Image Position</Label><div className="flex gap-1 bg-white p-1 rounded-lg border"><button onClick={() => setPageData({...pageData, heroImagePosition: 'left'})} className={cn("h-8 w-8 flex items-center justify-center rounded-md transition-all", (pageData.heroImagePosition || 'right') === 'left' ? "bg-primary text-white shadow-sm" : "text-muted-foreground")}><ChevronLeft className="h-3.5 w-3.5" /></button><button onClick={() => setPageData({...pageData, heroImagePosition: 'right'})} className={cn("h-8 w-8 flex items-center justify-center rounded-md transition-all", (pageData.heroImagePosition || 'right') === 'right' ? "bg-primary text-white shadow-sm" : "text-muted-foreground")}><ChevronRight className="h-3.5 w-3.5" /></button></div></div>
              <div className="flex items-center justify-between pt-2 border-t"><Label className="text-[10px] font-bold uppercase">Text Alignment</Label><div className="flex gap-1">{[{ id: 'left', icon: AlignLeft }, { id: 'center', icon: AlignCenter }, { id: 'right', icon: AlignRight }].map(btn => (<button key={btn.id} onClick={() => setPageData({...pageData, heroAlign: btn.id})} className={cn("h-8 w-8 flex items-center justify-center rounded-lg border transition-all", pageData.heroAlign === btn.id ? "bg-primary text-white border-primary shadow-sm" : "bg-white text-muted-foreground hover:bg-neutral-100")}><btn.icon className="h-3.5 w-3.5" /></button>))}</div></div>
              
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                   <Label className="text-[10px] font-bold uppercase flex items-center gap-2"><Maximize2 className="h-3.5 w-3.5" /> Image Radius</Label>
                   <Badge variant="outline" className="text-[9px] font-mono">{pageData.heroImageRadius ?? 32}px</Badge>
                </div>
                <Slider 
                  value={[pageData.heroImageRadius ?? 32]} 
                  min={0} 
                  max={120} 
                  step={4} 
                  onValueChange={v => setPageData({...pageData, heroImageRadius: v[0]})} 
                />
              </div>
            </div>
          </div>

          <div className="p-5 bg-neutral-900 text-white rounded-[2rem] space-y-6 shadow-xl">
             <Label className="text-[10px] font-black uppercase text-accent tracking-widest flex items-center gap-2"><Type className="h-3.5 w-3.5" /> Typography Tints</Label>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label className="text-[8px] font-bold uppercase opacity-60">Headline</Label>
                   <Input type="color" value={pageData.headlineColor || '#111827'} onChange={e => setPageData({...pageData, headlineColor: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white rounded-md cursor-pointer" />
                </div>
                <div className="space-y-2">
                   <Label className="text-[8px] font-bold uppercase opacity-60">Description</Label>
                   <Input type="color" value={pageData.subheadlineColor || '#4b5563'} onChange={e => setPageData({...pageData, subheadlineColor: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white rounded-md cursor-pointer" />
                </div>
             </div>
          </div>

          <div className="p-5 bg-neutral-900 text-white rounded-[2rem] space-y-6">
             <div className="space-y-4"><div className="flex items-center justify-between"><Label className="text-[9px] font-black uppercase text-accent flex items-center gap-2"><Maximize className="h-3.5 w-3.5" /> Image Transparency</Label><Badge className="bg-accent text-white text-[9px] font-mono">{pageData.heroImageOpacity ?? 100}%</Badge></div><Slider value={[pageData.heroImageOpacity ?? 100]} min={0} max={100} step={5} onValueChange={v => setPageData({...pageData, heroImageOpacity: v[0]})} /></div>
             <div className="space-y-4 border-t border-white/10 pt-4"><div className="flex items-center justify-between"><Label className="text-[9px] font-black uppercase text-accent">Overlay Strength</Label><Badge variant="outline" className="text-accent border-accent/20 text-[9px] font-mono">{pageData.heroOverlayOpacity || 0}%</Badge></div><Slider value={[pageData.heroOverlayOpacity || 0]} min={0} max={100} step={5} onValueChange={v => setPageData({...pageData, heroOverlayOpacity: v[0]})} /></div>
          </div>
        </div>
      )}

      {activeSection === 'actions' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2">
           <div className="p-5 bg-neutral-50 rounded-[2rem] border space-y-4"><Label className="text-[10px] font-black uppercase flex items-center gap-2 text-primary"><Zap className="h-3.5 w-3.5" /> Primary CTA</Label><Input value={pageData.ctaText} onChange={e => setPageData({...pageData, ctaText: e.target.value})} placeholder="Button Text" className="h-10 text-xs font-bold" /><div className="grid grid-cols-2 gap-2"><div className="space-y-1"><Label className="text-[8px] font-bold uppercase opacity-60">Color</Label><Input type="color" value={pageData.heroPrimaryBtnColor || pageData.themeColor} onChange={e => setPageData({...pageData, heroPrimaryBtnColor: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white rounded-md" /></div><div className="space-y-1"><Label className="text-[8px] font-bold uppercase opacity-60">Radius ({pageData.heroPrimaryBtnRadius ?? 16}px)</Label><Slider value={[pageData.heroPrimaryBtnRadius ?? 16]} min={0} max={40} step={2} onValueChange={v => setPageData({...pageData, heroPrimaryBtnRadius: v[0]})} className="mt-2" /></div></div></div>
           <div className="p-5 bg-neutral-50 rounded-[2rem] border space-y-4"><div className="flex items-center justify-between"><Label className="text-[10px] font-black uppercase flex items-center gap-2 text-primary"><Zap className="h-3.5 w-3.5" /> Secondary CTA</Label><Switch checked={pageData.heroSecondaryEnabled} onCheckedChange={v => setPageData({...pageData, heroSecondaryEnabled: v})} /></div>{pageData.heroSecondaryEnabled && (<div className="space-y-3 animate-in slide-in-from-top-2"><Input value={pageData.heroSecondaryText} onChange={e => setPageData({...pageData, heroSecondaryText: e.target.value})} placeholder="e.g. Learn More" className="h-9 text-xs" /><Input value={pageData.heroSecondaryUrl} onChange={e => setPageData({...pageData, heroSecondaryUrl: e.target.value})} placeholder="https://..." className="h-9 text-xs font-mono" /><div className="flex gap-2"><div className="flex-1 space-y-1"><Label className="text-[8px] font-bold uppercase opacity-60">Color</Label><Input type="color" value={pageData.heroSecondaryBtnColor || '#f3f4f6'} onChange={e => setPageData({...pageData, heroSecondaryBtnColor: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white rounded-md" /></div><div className="flex-1 space-y-1"><Label className="text-[8px] font-bold uppercase opacity-60">Text</Label><Input type="color" value={pageData.heroSecondaryTextColor || '#111827'} onChange={e => setPageData({...pageData, heroSecondaryTextColor: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white rounded-md" /></div></div></div>)}</div>
        </div>
      )}

      {activeSection === 'background' && (
        <div className="space-y-6 animate-in slide-in-from-top-2">
           <div className="p-5 bg-neutral-900 text-white rounded-[2.5rem] space-y-8">
              <div className="space-y-6">
                 <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <Label className="text-[10px] font-black uppercase text-accent flex items-center gap-2"><Paintbrush className="h-3.5 w-3.5" /> Surface Identity</Label>
                    <div className="flex items-center gap-2">
                       <span className="text-[8px] font-bold opacity-60">GRADIENT</span>
                       <Switch 
                         checked={pageData.heroBgType === 'gradient'} 
                         onCheckedChange={v => setPageData({...pageData, heroBgType: v ? 'gradient' : 'solid'})} 
                         className="scale-75"
                       />
                    </div>
                 </div>
                 <div className="flex gap-3">
                    <div className="flex-1 space-y-2">
                       <Label className="text-[8px] font-bold uppercase opacity-40">Base Color</Label>
                       <Input type="color" value={pageData.heroBgColor1 || '#ffffff'} onChange={e => setPageData({...pageData, heroBgColor1: e.target.value})} className="h-10 w-full p-0.5 border-none bg-white/10 rounded-xl cursor-pointer" />
                    </div>
                    {pageData.heroBgType === 'gradient' && (
                      <div className="flex-1 space-y-2 animate-in zoom-in-95">
                         <Label className="text-[8px] font-bold uppercase opacity-40">Accent Color</Label>
                         <Input type="color" value={pageData.heroBgColor2 || '#ffffff'} onChange={e => setPageData({...pageData, heroBgColor2: e.target.value})} className="h-10 w-full p-0.5 border-none bg-white/10 rounded-xl cursor-pointer" />
                      </div>
                    )}
                 </div>
              </div>

              <div className="h-px bg-white/5 w-full" />

              <div className="space-y-4">
                 <Label className="text-[10px] font-black uppercase text-accent flex items-center gap-2"><ImageIcon className="h-3.5 w-3.5" /> Section BG Image</Label>
                 <div 
                   className="relative aspect-video bg-white/5 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer overflow-hidden group hover:border-accent/40 transition-all relative" 
                   onClick={() => document.getElementById('hero-bg-image-input')?.click()}
                 >
                    {pageData.heroSectionBgImage ? (<img src={pageData.heroSectionBgImage} className={cn("w-full h-full object-cover transition-opacity", uploadingField === 'heroSectionBgImage' ? "opacity-40" : "opacity-100")} alt="" />) : <UploadCloud className="h-6 w-6 opacity-20" />}
                    {uploadingField === 'heroSectionBgImage' && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 animate-in fade-in"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>}
                 </div>
                 <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex gap-3">
                   <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                   <p className="text-[8px] font-bold text-accent/70 uppercase leading-relaxed">
                     BG Guide: Use wide abstract textures or landscapes. Max 2MB.
                   </p>
                 </div>
                 <input type="file" id="hero-bg-image-input" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'heroSectionBgImage')} />
              </div>

              {pageData.heroSectionBgImage && (
                <div className="space-y-6 pt-4 border-t border-white/10 animate-in fade-in">
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <Label className="text-[9px] font-black uppercase text-neutral-400">Image Opacity</Label>
                         <Badge variant="outline" className="text-accent border-accent/20 text-[9px] font-mono">{pageData.heroSectionBgOpacity ?? 100}%</Badge>
                      </div>
                      <Slider value={[pageData.heroSectionBgOpacity ?? 100]} min={0} max={100} step={5} onValueChange={v => setPageData({...pageData, heroSectionBgOpacity: v[0]})} />
                   </div>
                   <div className="space-y-4 border-t border-white/10 pt-4">
                      <div className="flex items-center justify-between">
                         <Label className="text-[9px] font-black uppercase text-neutral-400">Overlay strength</Label>
                         <Badge variant="outline" className="text-accent border-accent/20 text-[9px] font-mono">{pageData.heroSectionBgOverlayOpacity || 0}%</Badge>
                      </div>
                      <Slider value={[pageData.heroSectionBgOverlayOpacity || 0]} min={0} max={100} step={5} onValueChange={v => setPageData({...pageData, heroSectionBgOverlayOpacity: v[0]})} />
                      <div className="flex items-center gap-3">
                         <Label className="text-[8px] font-bold uppercase text-white/40">Overlay Color</Label>
                         <Input type="color" value={pageData.heroSectionBgOverlayColor || '#000000'} onChange={e => setPageData({...pageData, heroSectionBgOverlayColor: e.target.value})} className="h-8 w-14 p-0.5 border-none bg-white/10 rounded-md" />
                      </div>
                   </div>
                   <div className="space-y-4 border-t border-white/10 pt-4">
                      <Label className="text-[9px] font-black uppercase text-neutral-400">Image Alignment</Label>
                      <div className="grid grid-cols-3 gap-2">{['top', 'center', 'bottom'].map(pos => (<button key={pos} onClick={() => setPageData({...pageData, heroSectionBgPosition: pos})} className={cn("py-2 rounded-lg text-[8px] font-black uppercase border transition-all", pageData.heroSectionBgPosition === pos ? "bg-accent text-white border-accent shadow-lg" : "bg-white/5 text-white/40 border-white/10")}>{pos}</button>))}</div>
                   </div>
                   <Button variant="ghost" className="w-full text-red-400 hover:text-red-500 hover:bg-red-500/10 h-10 rounded-xl font-bold text-[10px] uppercase gap-2" onClick={() => setPageData({...pageData, heroSectionBgImage: ''})}><Trash2 className="h-4 w-4" /> Purge Background</Button>
                </div>
              )}
           </div>
        </div>
      )}

      {activeSection === 'spacing' && (
        <div className="p-6 bg-neutral-50 rounded-[2.5rem] border space-y-8 animate-in zoom-in-95"><div className="space-y-6"><div className="flex items-center justify-between"><Label className="text-[10px] font-black uppercase text-primary">Padding Top</Label><Badge variant="outline" className="font-mono text-[10px]">{pageData.heroPaddingTop || 80}px</Badge></div><Slider value={[pageData.heroPaddingTop || 80]} min={0} max={200} step={4} onValueChange={v => setPageData({...pageData, heroPaddingTop: v[0]})} /></div><div className="space-y-6"><div className="flex items-center justify-between"><Label className="text-[10px] font-black uppercase text-primary">Padding Bottom</Label><Badge variant="outline" className="font-mono text-[10px]">{pageData.heroPaddingBottom || 80}px</Badge></div><Slider value={[pageData.heroPaddingBottom || 80]} min={0} max={200} step={4} onValueChange={v => setPageData({...pageData, heroPaddingBottom: v[0]})} /></div></div>
      )}
    </div>
  );
}
