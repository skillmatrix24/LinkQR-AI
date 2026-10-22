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
  Clock, 
  Timer, 
  Palette, 
  Info, 
  Sparkles, 
  BrainCircuit, 
  Loader2, 
  Zap, 
  Target, 
  ShieldCheck,
  RotateCcw,
  EyeOff,
  MessageSquare,
  Paintbrush,
  Layers,
  Layout,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Square,
  Circle,
  Type,
  MousePointer2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateMicroSiteContent } from "@/ai/flows/ai-microsite-flow";
import { useToast } from "@/hooks/use-toast";

interface CountdownTabProps {
  sectionId: string;
  pageData: any;
  globalAiContext?: any;
  setPageData: (data: any) => void;
}

export function CountdownTab({ sectionId, pageData, globalAiContext, setPageData }: CountdownTabProps) {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<'content' | 'section-style'>('content');
  const { toast } = useToast();

  const handleAiUrgency = async () => {
    setIsAiLoading(true);
    try {
      const res = await generateMicroSiteContent({ 
        businessName: globalAiContext?.businessName || "Our Brand", 
        goal: globalAiContext?.goal || pageData.sectionTitle || "Flash Sale Urgency",
        audience: globalAiContext?.audience || "",
        offer: globalAiContext?.offer || "",
        description: globalAiContext?.description || "",
        tone: globalAiContext?.tone || "Professional",
        brandVibe: globalAiContext?.vibe || "Modern"
      });
      
      const countdownSection = res.sections.find(s => s.type === 'countdown');
      if (countdownSection) {
        setPageData({
          ...pageData,
          ...countdownSection.data
        });
        toast({ title: "Urgency Narrative Ready" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "AI Forge Error" });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* 1. Header & Strategy Trigger */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={handleAiUrgency} 
          disabled={isAiLoading} 
          className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase border-2 gap-2"
        >
          {isAiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3 w-3 text-primary" />} 
          AI Smart Urgency
        </Button>
        <div className="flex bg-neutral-100 p-1 rounded-xl">
           <button onClick={() => setActiveMainTab('content')} className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", activeMainTab === 'content' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>Timer</button>
           <button onClick={() => setActiveMainTab('section-style')} className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", activeMainTab === 'section-style' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>Surface</button>
        </div>
      </div>

      {activeMainTab === 'content' && (
        <div className="space-y-6 animate-in slide-in-from-left-2">
          {/* Main Narrative */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Urgency Headline</Label>
              <Input 
                value={pageData.sectionTitle || ""} 
                onChange={e => setPageData({...pageData, sectionTitle: e.target.value})} 
                placeholder="e.g. Flash Sale Ends In..." 
                className="h-11 rounded-xl bg-white font-bold text-sm border-2" 
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Subtext / Motivation</Label>
              <Textarea 
                value={pageData.sectionDescription || ""} 
                onChange={e => setPageData({...pageData, sectionDescription: e.target.value})} 
                placeholder="e.g. Prices increase immediately after this timer hits zero." 
                className="text-xs bg-white min-h-[80px] rounded-xl border-2" 
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Target Expiry Date/Time</Label>
              <Input 
                type="datetime-local"
                value={pageData.targetDate || ""} 
                onChange={e => setPageData({...pageData, targetDate: e.target.value})} 
                className="h-11 rounded-xl bg-white font-bold text-sm border-2"
              />
            </div>
          </div>

          {/* Scarcity Module */}
          <div className="p-5 bg-orange-50 rounded-[2.5rem] border border-orange-100 space-y-6 shadow-sm">
             <div className="flex items-center justify-between border-b border-orange-200/50 pb-3">
                <Label className="text-[10px] font-black uppercase text-orange-600 flex items-center gap-2"><Zap className="h-3.5 w-3.5" /> Scarcity Signals</Label>
                <Switch checked={pageData.scarcityEnabled} onCheckedChange={v => setPageData({...pageData, scarcityEnabled: v})} className="scale-75" />
             </div>
             {pageData.scarcityEnabled && (
               <div className="space-y-4 animate-in slide-in-from-top-1">
                  <div className="space-y-1.5">
                    <Label className="text-[8px] font-bold uppercase text-orange-700 ml-1">Progress Text</Label>
                    <Input value={pageData.scarcityText} onChange={e => setPageData({...pageData, scarcityText: e.target.value})} placeholder="e.g. 94% slots claimed!" className="h-10 text-xs bg-white border-orange-100 font-bold" />
                  </div>
                  <div className="space-y-3">
                     <div className="flex items-center justify-between">
                        <Label className="text-[8px] font-bold uppercase text-orange-700">Pressure Bar (%)</Label>
                        <Badge className="bg-orange-500 text-white text-[9px] font-mono px-2 rounded-md">{pageData.scarcityPercent || 80}%</Badge>
                     </div>
                     <Slider value={[pageData.scarcityPercent || 80]} min={0} max={100} step={1} onValueChange={v => setPageData({...pageData, scarcityPercent: v[0]})} />
                  </div>
               </div>
             )}
          </div>

          {/* Post-Expiry Control */}
          <div className="p-5 bg-neutral-900 text-white rounded-[2.5rem] space-y-5 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12"><RotateCcw className="h-20 w-20 text-accent" /></div>
             <Label className="text-[10px] font-black uppercase text-accent flex items-center gap-2 relative z-10"><RotateCcw className="h-3.5 w-3.5" /> Post-Expiry Logic</Label>
             <div className="space-y-4 relative z-10">
                <div className="space-y-1.5">
                  <Label className="text-[8px] font-bold uppercase text-white/40">Action Type</Label>
                  <select 
                    value={pageData.expiryAction || 'message'} 
                    onChange={e => setPageData({...pageData, expiryAction: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl h-10 px-3 text-[10px] font-bold text-white outline-none"
                  >
                    <option value="hide" className="bg-neutral-900">Auto-Hide Block</option>
                    <option value="message" className="bg-neutral-900">Show Redirect Message</option>
                  </select>
                </div>
                {pageData.expiryAction === 'message' && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-1">
                    <Label className="text-[8px] font-bold uppercase text-white/40">Custom Message</Label>
                    <Input value={pageData.expiryMessage || "OFFER EXPIRED"} onChange={e => setPageData({...pageData, expiryMessage: e.target.value})} className="h-10 bg-white/5 border-white/10 text-white text-xs font-black uppercase tracking-widest" />
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {activeMainTab === 'section-style' && (
        <div className="space-y-6 animate-in slide-in-from-right-2">
          {/* Section Style */}
          <div className="p-5 bg-neutral-50 rounded-[2.5rem] border space-y-6">
            <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><Layers className="h-3.5 w-3.5" /> Stage Controls</Label>
            <div className="space-y-6">
               <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Section Header Alignment</Label>
                  <div className="flex gap-2">
                    {[ { id: 'left', icon: AlignLeft }, { id: 'center', icon: AlignCenter }, { id: 'right', icon: AlignRight } ].map(btn => (
                      <button key={btn.id} onClick={() => setPageData({...pageData, titleAlign: btn.id})} className={cn("h-11 flex-1 flex items-center justify-center rounded-xl border-2 transition-all", (pageData.titleAlign || 'center') === btn.id ? "bg-primary text-white border-primary shadow-lg" : "bg-white text-muted-foreground hover:bg-neutral-50")}>
                        <btn.icon className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
               </div>

               <div className="p-4 bg-white rounded-2xl border space-y-4">
                  <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Target className="h-3.5 w-3.5" /> Header Tint</Label>
                  <div className="flex items-center justify-between">
                     <span className="text-[9px] font-bold uppercase text-muted-foreground">Title Color</span>
                     <Input type="color" value={pageData.sectionTitleColor || '#111827'} onChange={e => setPageData({...pageData, sectionTitleColor: e.target.value})} className="h-8 w-14 p-0.5 border-none bg-transparent cursor-pointer" />
                  </div>
               </div>

               <div className="p-5 bg-neutral-900 text-white rounded-[2rem] border-none space-y-6 shadow-xl relative overflow-hidden">
                  <Label className="text-[10px] font-black uppercase text-accent tracking-widest flex items-center gap-2"><Paintbrush className="h-3.5 w-3.5" /> Section Surface</Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <Label className="text-[10px] font-bold uppercase opacity-60">Gradient Mode</Label>
                       <Switch checked={pageData.sectionBgType === 'gradient'} onCheckedChange={v => setPageData({...pageData, sectionBgType: v ? 'gradient' : 'solid'})} className="scale-75" />
                    </div>
                    <div className="flex gap-2">
                       <Input type="color" value={pageData.sectionBgColor1 || '#fafafa'} onChange={e => setPageData({...pageData, sectionBgColor1: e.target.value})} className="h-10 w-full p-0.5 border-none bg-white/10 rounded-xl cursor-pointer" />
                       {pageData.sectionBgType === 'gradient' && <Input type="color" value={pageData.sectionBgColor2 || '#fafafa'} onChange={e => setPageData({...pageData, sectionBgColor2: e.target.value})} className="h-10 w-full p-0.5 border-none bg-white/10 rounded-xl cursor-pointer" />}
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Pro Timer Card Customization */}
          <div className="p-6 bg-white rounded-[2.5rem] border-2 border-primary/20 space-y-8 shadow-xl">
             <div className="flex items-center gap-3 border-b pb-4">
                <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg">
                   <Maximize2 className="h-5 w-5" />
                </div>
                <div>
                   <h4 className="font-black text-sm uppercase tracking-tight text-primary">Pro Node Designer</h4>
                   <p className="text-[8px] font-bold text-muted-foreground uppercase">Granular Timer Customization</p>
                </div>
             </div>

             <div className="space-y-6">
                {/* Node Surface */}
                <div className="space-y-4 p-4 bg-neutral-50 rounded-2xl border">
                   <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Palette className="h-3.5 w-3.5" /> Node Background</Label>
                   <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase opacity-60">Node Gradient</span>
                      <Switch checked={pageData.timerCardBgType === 'gradient'} onCheckedChange={v => setPageData({...pageData, timerCardBgType: v ? 'gradient' : 'solid'})} className="scale-75" />
                   </div>
                   <div className="flex gap-2">
                      <Input type="color" value={pageData.timerCardBgColor1 || '#ffffff'} onChange={e => setPageData({...pageData, timerCardBgColor1: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white rounded-lg cursor-pointer shadow-sm" />
                      {pageData.timerCardBgType === 'gradient' && <Input type="color" value={pageData.timerCardBgColor2 || '#ffffff'} onChange={e => setPageData({...pageData, timerCardBgColor2: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white rounded-lg cursor-pointer shadow-sm animate-in zoom-in-95" />}
                   </div>
                </div>

                {/* Node Typography */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-neutral-900 text-white rounded-2xl space-y-3">
                      <Label className="text-[9px] font-bold uppercase text-accent">Value Tint</Label>
                      <Input type="color" value={pageData.timerValueColor || '#ef4444'} onChange={e => setPageData({...pageData, timerValueColor: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white/10 rounded-md cursor-pointer" />
                   </div>
                   <div className="p-4 bg-neutral-900 text-white rounded-2xl space-y-3">
                      <Label className="text-[9px] font-bold uppercase text-accent">Label Tint</Label>
                      <Input type="color" value={pageData.timerLabelColor || '#666666'} onChange={e => setPageData({...pageData, timerLabelColor: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white/10 rounded-md cursor-pointer" />
                   </div>
                </div>

                {/* Node Geometry */}
                <div className="p-4 bg-neutral-50 rounded-2xl border space-y-6">
                   <Label className="text-[10px] font-black uppercase text-primary">Node Geometry</Label>
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <Label className="text-[9px] font-bold uppercase">Node Radius</Label>
                         <Badge variant="outline" className="text-[9px] font-mono">{pageData.timerCardRadius ?? 32}px</Badge>
                      </div>
                      <Slider value={[pageData.timerCardRadius ?? 32]} min={0} max={64} step={4} onValueChange={v => setPageData({...pageData, timerCardRadius: v[0]})} />
                   </div>
                   <div className="space-y-4 border-t pt-4">
                      <div className="flex items-center justify-between">
                         <Label className="text-[9px] font-bold uppercase">Display Scale (Zoom)</Label>
                         <Badge variant="outline" className="text-[9px] font-mono">{pageData.timerScale || 1.0}x</Badge>
                      </div>
                      <Slider value={[pageData.timerScale || 1.0]} min={0.5} max={2.0} step={0.1} onValueChange={v => setPageData({...pageData, timerScale: v[0]})} />
                   </div>
                </div>

                {/* Node Border & Shadow */}
                <div className="p-4 bg-white rounded-2xl border space-y-6 shadow-sm">
                   <Label className="text-[10px] font-black uppercase text-primary">Border Architecture</Label>
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <Label className="text-[9px] font-bold uppercase">Style</Label>
                         <select 
                           value={pageData.timerCardBorderStyle || 'solid'} 
                           onChange={e => setPageData({...pageData, timerCardBorderStyle: e.target.value})}
                           className="h-8 px-2 rounded-lg border bg-neutral-50 text-[10px] font-bold uppercase outline-none"
                         >
                           <option value="solid">Solid</option>
                           <option value="dashed">Dashed</option>
                           <option value="dotted">Dotted</option>
                           <option value="double">Double</option>
                         </select>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                         <Label className="text-[9px] font-bold uppercase">Width</Label>
                         <Badge variant="outline" className="text-[9px] font-mono">{pageData.timerCardBorderWidth || 1}px</Badge>
                      </div>
                      <Slider value={[pageData.timerCardBorderWidth || 1]} min={0} max={12} step={1} onValueChange={v => setPageData({...pageData, timerCardBorderWidth: v[0]})} />
                      <div className="flex items-center justify-between">
                         <Label className="text-[8px] font-bold uppercase opacity-50">Border Color</Label>
                         <Input type="color" value={pageData.timerCardBorderColor || '#eeeeee'} onChange={e => setPageData({...pageData, timerCardBorderColor: e.target.value})} className="h-7 w-12 p-0 border-none bg-transparent cursor-pointer" />
                      </div>
                   </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border space-y-4 shadow-sm">
                   <Label className="text-[10px] font-black uppercase text-primary">Interaction Shadow</Label>
                   <div className="flex items-center justify-between">
                      <Label className="text-[9px] font-bold uppercase">Depth</Label>
                      <div className="grid grid-cols-3 gap-1">
                         {['none', 'md', 'xl'].map(lvl => (
                           <button key={lvl} onClick={() => setPageData({...pageData, timerCardShadow: lvl})} className={cn("px-2 py-1 rounded-md border text-[8px] font-black uppercase transition-all", (pageData.timerCardShadow || 'xl') === lvl ? "bg-primary text-white border-primary shadow-sm" : "bg-neutral-50 hover:bg-neutral-100")}>{lvl}</button>
                         ))}
                      </div>
                   </div>
                   <div className="flex items-center justify-between pt-2">
                      <Label className="text-[8px] font-bold uppercase text-muted-foreground">Shadow Tint</Label>
                      <Input type="color" value={pageData.timerCardShadowColor || '#000000'} onChange={e => setPageData({...pageData, timerCardShadowColor: e.target.value})} className="h-7 w-12 p-0 border-none bg-transparent cursor-pointer" />
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      <div className="p-5 rounded-3xl bg-primary/5 border border-primary/10 flex gap-4">
         <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
         <p className="text-[10px] text-neutral-600 font-medium leading-relaxed italic">
           Conversion Intelligence: "Urgency signals like countdowns can increase sales by up to **33%**." Use 'Pro Node Designer' to make your timer stand out.
         </p>
      </div>
    </div>
  );
}
