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
  Users, 
  Layout, 
  Send,
  Info,
  CheckCircle2,
  Sparkles,
  BrainCircuit,
  Loader2,
  Palette,
  ShieldCheck,
  Zap,
  Target,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Paintbrush,
  Layers,
  Mail,
  PartyPopper,
  MessageSquare,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateMicroSiteContent } from "@/ai/flows/ai-microsite-flow";
import { useToast } from "@/hooks/use-toast";

interface LeadFormTabProps {
  pageData: any;
  globalAiContext?: any;
  setPageData: (data: any) => void;
}

export function LeadFormTab({ pageData, globalAiContext, setPageData }: LeadFormTabProps) {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<'content' | 'section-style'>('content');
  const { toast } = useToast();

  const handleAiForm = async () => {
    setIsAiLoading(true);
    try {
      const res = await generateMicroSiteContent({ 
        businessName: globalAiContext?.businessName || "Our Brand", 
        goal: globalAiContext?.goal || pageData.sectionTitle || "Capture Leads",
        audience: globalAiContext?.audience || "",
        offer: globalAiContext?.offer || "",
        description: globalAiContext?.description || "",
        tone: globalAiContext?.tone || "Professional",
        brandVibe: globalAiContext?.vibe || "Modern"
      });
      
      const leadSection = res.sections.find(s => s.type === 'leadForm');
      if (leadSection) {
        setPageData({
          ...pageData,
          ...leadSection.data
        });
        toast({ title: "Form Copy Optimized" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "AI Forge Error" });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={handleAiForm} 
          disabled={isAiLoading} 
          className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase border-2 gap-2"
        >
          {isAiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3 w-3 text-primary" />} 
          AI Smart Copy
        </Button>
        <div className="flex bg-neutral-100 p-1 rounded-xl">
           <button onClick={() => setActiveMainTab('content')} className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", activeMainTab === 'content' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>Fields</button>
           <button onClick={() => setActiveMainTab('section-style')} className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", activeMainTab === 'section-style' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>Surface</button>
        </div>
      </div>

      {activeMainTab === 'content' && (
        <div className="space-y-6 animate-in slide-in-from-left-2">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Form Headline</Label>
              <Input 
                value={pageData.sectionTitle || ""} 
                onChange={e => setPageData({...pageData, sectionTitle: e.target.value})} 
                className="h-11 rounded-xl bg-white font-bold text-sm border-2" 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Motivation Subtext</Label>
              <Textarea 
                value={pageData.sectionDescription || ""} 
                onChange={e => setPageData({...pageData, sectionDescription: e.target.value})} 
                className="text-xs bg-white min-h-[80px] rounded-xl border-2" 
              />
            </div>
          </div>

          <div className="p-4 bg-neutral-50 rounded-2xl border space-y-4 shadow-inner">
             <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Active Input Fields</Label>
             <div className="space-y-2">
                {[
                  { id: 'showName', label: 'Full Name', icon: Users },
                  { id: 'showEmail', label: 'Email Address', icon: Mail },
                  { id: 'showMobile', label: 'Mobile Number', icon: MessageSquare },
                  { id: 'showBusiness', label: 'Company / Message', icon: Target }
                ].map(f => (
                  <div key={f.id} className="flex items-center justify-between p-3 bg-white rounded-xl border group hover:border-primary/20 transition-all shadow-sm">
                     <div className="flex items-center gap-3">
                        <f.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-[11px] font-bold">{f.label}</span>
                     </div>
                     <Switch checked={pageData[f.id] !== false} onCheckedChange={v => setPageData({...pageData, [f.id]: v})} className="scale-75" />
                  </div>
                ))}
             </div>
          </div>

          <div className="p-5 bg-emerald-50 rounded-[2.5rem] border-2 border-emerald-100 space-y-4">
             <div className="flex items-center gap-3 border-b border-emerald-200/50 pb-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg"><PartyPopper className="h-4 w-4" /></div>
                <h4 className="font-black text-sm uppercase tracking-tight text-emerald-900">Success Experience</h4>
             </div>
             <div className="space-y-2">
                <Label className="text-[9px] font-bold uppercase text-emerald-700 ml-1">Confirmation Message</Label>
                <Textarea 
                  value={pageData.successMessage || ""} 
                  onChange={e => setPageData({...pageData, successMessage: e.target.value})} 
                  placeholder="e.g. Thank you! We will contact you soon." 
                  className="text-xs bg-white min-h-[80px] rounded-xl border-emerald-200" 
                />
             </div>
          </div>

          <div className="p-5 bg-primary/5 border-2 border-primary/10 rounded-[2.5rem] space-y-6">
             <div className="flex items-center gap-3 border-b border-primary/10 pb-4">
                <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg"><Zap className="h-5 w-5" /></div>
                <h4 className="font-black text-sm uppercase tracking-tight text-primary">Button Studio</h4>
             </div>
             <div className="space-y-4">
                <div className="space-y-2">
                   <Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Button Label</Label>
                   <Input value={pageData.buttonText || ""} onChange={e => setPageData({...pageData, buttonText: e.target.value})} className="h-10 rounded-xl bg-white border-none shadow-inner font-bold" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                   {['solid', 'outline', 'ghost'].map(st => (
                     <button key={st} onClick={() => setPageData({...pageData, btnStyle: st})} className={cn("py-2 rounded-lg border-2 text-[8px] font-black uppercase transition-all", (pageData.btnStyle || 'solid') === st ? "bg-primary text-white border-primary shadow-sm" : "bg-white")}>{st}</button>
                   ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                   {[ { id: 'send', icon: Send }, { id: 'zap', icon: Zap }, { id: 'check', icon: CheckCircle2 } ].map(ico => (
                     <button key={ico.id} onClick={() => setPageData({...pageData, btnIcon: ico.id})} className={cn("h-10 rounded-lg border-2 flex items-center justify-center transition-all", (pageData.btnIcon || 'send') === ico.id ? "bg-primary text-white border-primary shadow-sm" : "bg-white")}><ico.icon className="h-4 w-4" /></button>
                   ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                   <Label className="text-[9px] font-bold uppercase">Button Tint</Label>
                   <Input type="color" value={pageData.btnColor || pageData.themeColor || '#6750A4'} onChange={e => setPageData({...pageData, btnColor: e.target.value})} className="h-8 w-14 p-0.5 border-none bg-transparent cursor-pointer" />
                </div>
             </div>
          </div>

          <div className="p-5 bg-neutral-900 text-white rounded-[2.5rem] border-none space-y-6 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12"><ShieldCheck className="h-20 w-20 text-accent" /></div>
             <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
                <div className="flex items-center gap-3">
                   <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-accent"><ShieldCheck className="h-5 w-5" /></div>
                   <h4 className="font-black text-sm uppercase tracking-tight">Trust Signal Node</h4>
                </div>
                <Switch checked={pageData.trustBadgesEnabled} onCheckedChange={v => setPageData({...pageData, trustBadgesEnabled: v})} className="scale-75" />
             </div>
             {pageData.trustBadgesEnabled && (
               <div className="space-y-4 animate-in slide-in-from-top-1 relative z-10">
                  <Input value={pageData.trustText || "Privacy Protected • 100% Secure"} onChange={e => setPageData({...pageData, trustText: e.target.value})} className="h-10 bg-white/5 border-white/10 text-white text-[10px] font-bold uppercase tracking-tighter" />
                  <Input type="color" value={pageData.trustColor || '#ffffff80'} onChange={e => setPageData({...pageData, trustColor: e.target.value})} className="h-8 w-14 p-0.5 border-none bg-white/10 rounded-lg cursor-pointer" />
               </div>
             )}
          </div>
        </div>
      )}

      {activeMainTab === 'section-style' && (
        <div className="space-y-6 animate-in slide-in-from-right-2">
          <div className="p-5 bg-neutral-50 rounded-[2.5rem] border space-y-6">
            <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><Layers className="h-3.5 w-3.5" /> Geometry & Layout</Label>
            <div className="space-y-6">
               <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Content Alignment</Label>
                  <div className="flex gap-2">
                    {[ { id: 'left', icon: AlignLeft }, { id: 'center', icon: AlignCenter }, { id: 'right', icon: AlignRight } ].map(btn => (
                      <button key={btn.id} onClick={() => setPageData({...pageData, titleAlign: btn.id})} className={cn("h-11 flex-1 flex items-center justify-center rounded-xl border-2 transition-all", (pageData.titleAlign || 'center') === btn.id ? "bg-primary text-white border-primary shadow-lg" : "bg-white text-muted-foreground hover:bg-neutral-50")}><btn.icon className="h-4 w-4" /></button>
                    ))}
                  </div>
               </div>

               <div className="space-y-3 pt-4 border-t">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Form Grid (Desktop)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[ { id: 'stack', label: '1-Col Stack', icon: Layout }, { id: 'grid2', label: '2-Col Grid', icon: Layers } ].map(l => (
                      <button key={l.id} onClick={() => setPageData({...pageData, layout: l.id})} className={cn("p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all", (pageData.layout || 'stack') === l.id ? "bg-primary/5 border-primary shadow-sm" : "bg-white border-transparent hover:bg-neutral-100")}><l.icon className={cn("h-4 w-4", (pageData.layout || 'stack') === l.id ? "text-primary" : "text-muted-foreground")} /><span className="text-[9px] font-black uppercase">{l.label}</span></button>
                    ))}
                  </div>
               </div>
               
               <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between"><Label className="text-[10px] font-bold uppercase">Form Radius</Label><Badge variant="outline" className="text-[9px] font-mono">{pageData.formRadius || 32}px</Badge></div>
                  <Slider value={[pageData.formRadius || 32]} min={0} max={80} step={4} onValueChange={v => setPageData({...pageData, formRadius: v[0]})} />
               </div>
            </div>
          </div>

          <div className="p-5 bg-neutral-900 text-white rounded-[2rem] border-none space-y-6 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12"><Paintbrush className="h-20 w-20 text-accent" /></div>
             <Label className="text-[10px] font-black uppercase text-accent tracking-widest flex items-center gap-2 relative z-10"><Paintbrush className="h-3.5 w-3.5" /> Stage Surface</Label>
             <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between"><Label className="text-[10px] font-bold uppercase opacity-60">Gradient Mode</Label><Switch checked={pageData.sectionBgType === 'gradient'} onCheckedChange={v => setPageData({...pageData, sectionBgType: v ? 'gradient' : 'solid'})} className="scale-75" /></div>
                <div className="flex gap-2">
                   <Input type="color" value={pageData.sectionBgColor1 || '#fafafa'} onChange={e => setPageData({...pageData, sectionBgColor1: e.target.value})} className="h-9 w-full p-0.5 border-none bg-white/10 rounded-lg cursor-pointer" />
                   {pageData.sectionBgType === 'gradient' && <Input type="color" value={pageData.sectionBgColor2 || '#fafafa'} onChange={e => setPageData({...pageData, sectionBgColor2: e.target.value})} className="h-9 w-full p-0.5 border-none bg-white/10 rounded-lg cursor-pointer animate-in zoom-in-95" />}
                </div>
             </div>
          </div>
        </div>
      )}

      <div className="p-5 rounded-3xl bg-primary/5 border border-primary/10 flex gap-4">
         <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
         <p className="text-[10px] text-neutral-600 font-medium leading-relaxed italic">Tip: "Personalized forms convert 42% better." Add an email field and use 2-Column Grid for high-fidelity desktop viewing.</p>
      </div>
    </div>
  );
}
