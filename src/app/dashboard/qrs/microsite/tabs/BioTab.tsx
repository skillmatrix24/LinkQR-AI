
'use client';

import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  BrainCircuit, 
  Loader2, 
  Sparkles, 
  Info,
  Type,
  Languages,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Paintbrush,
  Bold,
  Italic,
  Strikethrough,
  Maximize2,
  Maximize,
  Target
} from "lucide-react";
import { generateAIBio } from "@/ai/flows/ai-bio-writer-flow";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface BioTabProps {
  pageData: any;
  globalAiContext: any;
  setPageData: (data: any) => void;
}

/**
 * Advanced BioTab: Ultra-styling for the Story/Bio section.
 */
export function BioTab({ pageData, globalAiContext, setPageData }: BioTabProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'highlights' | 'surface'>('content');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { toast } = useToast();

  const handleAiRefine = async () => {
    if (!globalAiContext.fullName) {
        toast({ variant: "destructive", title: "Information Required", description: "Please set your Name in the vCard first." });
        return;
    }
    setIsAiLoading(true);
    try {
        const result = await generateAIBio({
            name: globalAiContext.fullName,
            designation: globalAiContext.designation || "Professional",
            company: globalAiContext.company || "Self-Employed",
            keywords: pageData.content || "Professional networking",
            tone: 'Professional'
        });
        setPageData({
            ...pageData,
            content: result.bioEn,
            contentHi: result.bioHi
        });
        toast({ title: "Narrative Refined by AI" });
    } catch (e) {
        toast({ variant: "destructive", title: "AI Forge Error" });
    } finally {
        setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      <div className="flex bg-neutral-100 p-1 rounded-xl shadow-inner">
        {['content', 'highlights', 'surface'].map((t) => (
          <button 
            key={t}
            onClick={() => setActiveTab(t as any)} 
            className={cn("flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", activeTab === t ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'content' && (
        <div className="space-y-8 animate-in slide-in-from-left-2">
          <div className="p-5 bg-primary/5 border-2 border-dashed border-primary/20 rounded-[2rem] space-y-4 shadow-sm">
             <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg animate-pulse">
                   <Sparkles className="h-5 w-5" />
                </div>
                <h4 className="font-black text-xs uppercase tracking-tight text-primary">Bio Intelligence</h4>
             </div>
             <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">
                Refining bio for: <span className="text-primary font-black">{globalAiContext.fullName}</span> ({globalAiContext.designation})
             </p>
             <Button 
              onClick={handleAiRefine} 
              disabled={isAiLoading} 
              className="w-full h-11 rounded-xl font-black text-[10px] uppercase shadow-lg bg-primary hover:bg-primary/90 text-white gap-2"
             >
                {isAiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3 w-3" />} 
                RE-FORGE BIO
             </Button>
          </div>

          <div className="space-y-6">
             <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
                   <Type className="h-3.5 w-3.5" /> Story (English)
                </Label>
                <Textarea 
                    value={pageData.content || ""} 
                    onChange={e => setPageData({...pageData, content: e.target.value})} 
                    placeholder="English journey..." 
                    className="min-h-[140px] rounded-xl bg-white border-2 text-sm leading-relaxed" 
                />
             </div>

             <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2">
                   <Languages className="h-3.5 w-3.5" /> Story (Hindi/Hinglish)
                </Label>
                <Textarea 
                    value={pageData.contentHi || ""} 
                    onChange={e => setPageData({...pageData, contentHi: e.target.value})} 
                    placeholder="हिन्दी कहानी..." 
                    className="min-h-[140px] rounded-xl bg-white border-2 text-sm font-mukta leading-relaxed" 
                />
             </div>
          </div>
        </div>
      )}

      {activeTab === 'highlights' && (
        <div className="space-y-6 animate-in slide-in-from-top-2">
            <div className="space-y-4 p-5 bg-primary/5 rounded-[2.5rem] border-2 border-primary/10">
              <div className="flex items-center justify-between border-b border-primary/10 pb-3 mb-3">
                 <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Highlights Ultra</Label>
                 <div className="flex items-center gap-2">
                    <span className="text-[8px] font-bold text-muted-foreground uppercase">Gradient</span>
                    <Switch checked={pageData.highlightedBgType === 'gradient'} onCheckedChange={v => setPageData({...pageData, highlightedBgType: v ? 'gradient' : 'solid'})} className="scale-75" />
                 </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                   <Label className="text-[8px] font-bold uppercase text-muted-foreground ml-1">Words to Highlight</Label>
                   <Input value={pageData.highlightedText || ""} onChange={e => setPageData({...pageData, highlightedText: e.target.value})} placeholder="Words from your bio..." className="h-10 rounded-xl bg-white border-none shadow-inner font-black text-primary text-sm" />
                </div>
                <div className="flex items-center justify-between gap-2 p-3 bg-white rounded-xl border">
                   <div className="flex gap-1 bg-neutral-100 p-0.5 rounded-lg">
                      <button onClick={() => setPageData({...pageData, highlightBold: !pageData.highlightBold})} className={cn("h-7 w-7 flex items-center justify-center rounded transition-all", pageData.highlightBold ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}><Bold className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setPageData({...pageData, highlightItalic: !pageData.highlightItalic})} className={cn("h-7 w-7 flex items-center justify-center rounded transition-all", pageData.highlightItalic ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}><Italic className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setPageData({...pageData, highlightStrike: !pageData.highlightStrike})} className={cn("h-7 w-7 flex items-center justify-center rounded transition-all", pageData.highlightStrike ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}><Strikethrough className="h-3.5 w-3.5" /></button>
                   </div>
                   <select value={pageData.highlightStyle || 'text'} onChange={e => setPageData({...pageData, highlightStyle: e.target.value})} className="bg-neutral-100 rounded-lg h-8 px-2 text-[8px] font-black uppercase outline-none"><option value="text">Text Only</option><option value="underline">Underline</option><option value="pill">Pill</option></select>
                </div>
                <div className="flex gap-2">
                   <div className="flex-1 space-y-1">
                      <Label className="text-[8px] font-bold uppercase opacity-60">Color 1</Label>
                      <Input type="color" value={pageData.highlightedColor || '#6750A4'} onChange={e => setPageData({...pageData, highlightedColor: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white rounded-md" />
                   </div>
                   {pageData.highlightedBgType === 'gradient' && (
                     <div className="flex-1 space-y-1 animate-in zoom-in-95">
                        <Label className="text-[8px] font-bold uppercase opacity-60">Color 2</Label>
                        <Input type="color" value={pageData.highlightedColor2 || '#6750A4'} onChange={e => setPageData({...pageData, highlightedColor2: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white rounded-md" />
                     </div>
                   )}
                </div>
              </div>
            </div>
        </div>
      )}

      {activeTab === 'surface' && (
        <div className="space-y-8 animate-in slide-in-from-right-2">
           <div className="p-5 bg-neutral-50 rounded-[2.5rem] border space-y-6">
              <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Palette className="h-3.5 w-3.5" /> Bio Geometry</Label>
              <div className="space-y-6">
                 <div className="space-y-3">
                    <Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Text Alignment</Label>
                    <div className="flex gap-1 bg-white p-1 rounded-lg border shadow-sm">
                       {[
                         { id: 'left', icon: AlignLeft },
                         { id: 'center', icon: AlignCenter },
                         { id: 'right', icon: AlignRight }
                       ].map(align => (
                         <button key={align.id} onClick={() => setPageData({...pageData, titleAlign: align.id})} className={cn("h-8 flex-1 flex items-center justify-center rounded-md transition-all", (pageData.titleAlign || 'center') === align.id ? "bg-primary text-white" : "text-muted-foreground")}>
                           <align.icon className="h-3.5 w-3.5" />
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                       <Label className="text-[9px] font-bold uppercase opacity-60">Font Size</Label>
                       <Badge variant="outline" className="text-[9px] font-mono">{pageData.fontSize || 16}px</Badge>
                    </div>
                    <Slider value={[pageData.fontSize || 16]} min={12} max={32} step={1} onValueChange={v => setPageData({...pageData, fontSize: v[0]})} />
                 </div>

                 <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                       <Label className="text-[9px] font-bold uppercase opacity-60">Line Height</Label>
                       <Badge variant="outline" className="text-[9px] font-mono">{pageData.lineHeight || 1.6}x</Badge>
                    </div>
                    <Slider value={[pageData.lineHeight || 1.6]} min={1.0} max={2.5} step={0.1} onValueChange={v => setPageData({...pageData, lineHeight: v[0]})} />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div className="space-y-2">
                       <Label className="text-[9px] font-bold uppercase opacity-60">English Tint</Label>
                       <Input type="color" value={pageData.textColor || '#111827'} onChange={e => setPageData({...pageData, textColor: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white rounded-md cursor-pointer shadow-sm" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[9px] font-bold uppercase opacity-60">Hindi Tint</Label>
                       <Input type="color" value={pageData.hiTextColor || '#6750A4'} onChange={e => setPageData({...pageData, hiTextColor: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white rounded-md cursor-pointer shadow-sm" />
                    </div>
                 </div>

                 <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                       <Label className="text-[9px] font-bold uppercase opacity-60">Vertical Space</Label>
                       <Badge variant="outline" className="text-[9px] font-mono">{pageData.paddingTop || 40}px</Badge>
                    </div>
                    <Slider value={[pageData.paddingTop || 40]} min={0} max={120} step={4} onValueChange={v => setPageData({...pageData, paddingTop: v[0], paddingBottom: v[0]})} />
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

      <div className="p-4 rounded-xl bg-neutral-100 flex gap-4">
         <Info className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
         <p className="text-[10px] text-neutral-500 font-medium leading-relaxed">
            AI Refine uses your vCard name & title to write. "Highlights" tab lets you add visual emphasis to key phrases.
         </p>
      </div>
    </div>
  );
}
