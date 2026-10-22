
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
  LayoutList, 
  LayoutGrid, 
  Columns3, 
  ShieldCheck, 
  Zap, 
  Star, 
  Heart, 
  CheckCircle2, 
  Clock, 
  ThumbsUp,
  Palette,
  X,
  Sparkles,
  Plus,
  BrainCircuit,
  Loader2,
  Target,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Square,
  Circle,
  Layers,
  ChevronDown,
  ChevronUp,
  Paintbrush,
  Copy,
  Info,
  Type,
  MousePointer2,
  Trash2,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateMicroSiteContent } from "@/ai/flows/ai-microsite-flow";
import { useToast } from "@/hooks/use-toast";

interface DetailsTabProps {
  sectionId: string;
  pageData: any;
  globalAiContext?: any;
  setPageData: (data: any) => void;
  addItem: (field: string, item: any) => void;
  removeItem: (field: string, index: number) => void;
  moveItem?: (field: string, index: number, dir: 'up' | 'down') => void;
}

const ICON_OPTIONS = [
  { id: 'check', icon: CheckCircle2 },
  { id: 'zap', icon: Zap },
  { id: 'star', icon: Star },
  { id: 'heart', icon: Heart },
  { id: 'clock', icon: Clock },
  { id: 'shield', icon: ShieldCheck },
  { id: 'thumb', icon: ThumbsUp }
];

const ICON_MAP: Record<string, any> = {
  check: <CheckCircle2 className="h-full w-full" />,
  zap: <Zap className="h-full w-full" />,
  star: <Star className="h-full w-full" />,
  heart: <Heart className="h-full w-full" />,
  clock: <Clock className="h-full w-full" />,
  shield: <ShieldCheck className="h-full w-full" />,
  thumb: <ThumbsUp className="h-full w-full" />
};

export function DetailsTab({ sectionId, pageData, globalAiContext, setPageData, addItem, removeItem, moveItem }: DetailsTabProps) {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<'content' | 'section-style'>('content');
  const [expandedItem, setExpandedItem] = useState<number | null>(0);
  const { toast } = useToast();

  const handleAiBenefits = async () => {
    setIsAiLoading(true);
    try {
      const res = await generateMicroSiteContent({ 
        businessName: globalAiContext?.businessName || "Business", 
        goal: globalAiContext?.goal || pageData.sectionTitle || "Showcase Benefits",
        audience: globalAiContext?.audience || "",
        offer: globalAiContext?.offer || "",
        description: globalAiContext?.description || "",
        tone: globalAiContext?.tone || "Professional",
        brandVibe: globalAiContext?.vibe || "Modern"
      });

      const benefitsSection = res.sections.find(s => s.type === 'benefits');
      
      if (benefitsSection && benefitsSection.data) {
        const rawItems = benefitsSection.data.items || [];
        const newItems = rawItems.map((b: any) => ({ 
          title: b.title, 
          desc: b.desc, 
          icon: b.icon || 'check',
          titleColor: '#111827',
          cardBgType: 'solid',
          cardBgColor1: '#ffffff',
          iconBgType: 'solid',
          iconBgColor1: '#6750A4',
          iconShape: 'rounded',
          iconContainerSize: 56,
          cardTextAlign: 'left',
          cardShadow: 'xl',
          shadowColor: '#000000',
          hoverEffect: 'lift',
          hoverColor: '#6750A4',
          cardBorderWidth: 0,
          cardBorderColor: '#eeeeee',
          cardBorderStyle: 'solid',
          cardRadius: 32
        }));

        setPageData({ 
          ...pageData, 
          sectionTitle: benefitsSection.data.sectionTitle || pageData.sectionTitle,
          items: newItems 
        });
        toast({ title: "Benefits Optimized" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "AI Forge Error" });
    } finally {
      setIsAiLoading(false);
    }
  };

  const updateBenefit = (index: number, key: string, value: any) => {
    const newList = [...(pageData.items || [])];
    if (!newList[index]) return;
    newList[index] = { ...newList[index], [key]: value };
    setPageData({ ...pageData, items: newList });
  };

  const duplicateBenefit = (index: number) => {
    if (!Array.isArray(pageData.items)) return;
    const original = pageData.items[index];
    if (!original) return;
    const duplicate = { ...original, id: crypto.randomUUID() };
    const newList = [...pageData.items];
    newList.splice(index + 1, 0, duplicate);
    setPageData({ ...pageData, items: newList });
    setExpandedItem(index + 1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={handleAiBenefits} 
          disabled={isAiLoading} 
          className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase border-2 gap-2"
        >
          {isAiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3 w-3 text-primary" />} 
          AI Smart Plan
        </Button>
        <div className="flex bg-neutral-100 p-1 rounded-xl">
           <button onClick={() => setActiveMainTab('content')} className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", activeMainTab === 'content' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>Blocks</button>
           <button onClick={() => setActiveMainTab('section-style')} className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", activeMainTab === 'section-style' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>Surface</button>
        </div>
      </div>

      {activeMainTab === 'content' && (
        <div className="space-y-6 animate-in slide-in-from-left-2">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Section Heading</Label>
            <Input 
              value={pageData.sectionTitle || ""} 
              onChange={e => setPageData({...pageData, sectionTitle: e.target.value})} 
              className="h-11 rounded-xl bg-white font-bold text-sm border-2" 
            />
          </div>

          <div className="space-y-4">
            {Array.isArray(pageData.items) && pageData.items.filter(Boolean).map((item: any, i: number) => (
              <div key={i} className={cn(
                "bg-white border-2 rounded-[2.5rem] overflow-hidden transition-all duration-500",
                expandedItem === i ? "border-primary shadow-2xl" : "border-neutral-100 hover:border-neutral-200"
              )}>
                <div 
                  className="p-5 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedItem(expandedItem === i ? null : i)}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-primary border shadow-sm"
                      style={{ background: item.iconBgType === 'gradient' ? `linear-gradient(135deg, ${item.iconBgColor1 || '#6750A4'}, ${item.iconBgColor2 || '#6750A4'})` : (item.iconBgColor1 || '#6750A4') }}
                    >
                      <div className="h-5 w-5 text-white">{ICON_MAP[item.icon || 'check']}</div>
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-foreground truncate max-w-[120px] uppercase tracking-tight">{item.title || "Untitled Card"}</p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Design Node #{i+1}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {moveItem && (
                      <div className="flex flex-col gap-0.5 mr-2">
                        <button onClick={(e) => { e.stopPropagation(); moveItem('items', i, 'up'); }} disabled={i === 0} className="text-neutral-300 hover:text-primary disabled:opacity-20"><ChevronUp className="h-3 w-3" /></button>
                        <button onClick={(e) => { e.stopPropagation(); moveItem('items', i, 'down'); }} disabled={i === (pageData.items?.length || 0) - 1} className="text-neutral-300 hover:text-primary disabled:opacity-20"><ChevronDown className="h-3 w-3" /></button>
                      </div>
                    )}
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); duplicateBenefit(i); }} className="h-8 w-8 text-primary hover:bg-primary/5 rounded-full" title="Duplicate"><Copy className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeItem('items', i); }} className="h-8 w-8 text-destructive hover:bg-red-50 rounded-full" title="Delete"><X className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>

                {expandedItem === i && (
                  <div className="px-5 pb-8 space-y-8 animate-in slide-in-from-top-2 border-t pt-6 bg-neutral-50/50">
                    <div className="space-y-4">
                       <div className="space-y-1.5"><Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Card Heading</Label><Input value={item.title || ""} onChange={e => updateBenefit(i, 'title', e.target.value)} className="h-10 rounded-xl bg-white font-bold text-xs" /></div>
                       <div className="space-y-1.5"><Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Card Description</Label><Textarea value={item.desc || ""} onChange={e => updateBenefit(i, 'desc', e.target.value)} className="text-xs bg-white min-h-[80px] rounded-xl" /></div>
                    </div>

                    <div className="space-y-6">
                       <div className="p-4 bg-white rounded-2xl border space-y-4 shadow-sm">
                          <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Palette className="h-3 w-3" /> Card Background</Label>
                          <div className="flex items-center justify-between">
                             <span className="text-[9px] font-bold uppercase text-muted-foreground">Gradient Mode</span>
                             <Switch checked={item.cardBgType === 'gradient'} onCheckedChange={v => updateBenefit(i, 'cardBgType', v ? 'gradient' : 'solid')} className="scale-75" />
                          </div>
                          <div className="flex gap-2">
                             <Input type="color" value={item.cardBgColor1 || '#ffffff'} onChange={e => updateBenefit(i, 'cardBgColor1', e.target.value)} className="h-8 w-full p-0.5 border-none bg-neutral-100 rounded-lg cursor-pointer shadow-inner" />
                             {item.cardBgType === 'gradient' && <Input type="color" value={item.cardBgColor2 || '#ffffff'} onChange={e => updateBenefit(i, 'cardBgColor2', e.target.value)} className="h-8 w-full p-0.5 border-none bg-neutral-100 rounded-lg cursor-pointer shadow-inner animate-in zoom-in-95" />}
                          </div>
                       </div>

                       <div className="p-4 bg-neutral-900 text-white rounded-2xl space-y-4 shadow-xl">
                          <Label className="text-[10px] font-black uppercase text-accent flex items-center gap-2"><Target className="h-3.5 w-3.5" /> Heading Tint</Label>
                          <Input type="color" value={item.titleColor || '#111827'} onChange={e => updateBenefit(i, 'titleColor', e.target.value)} className="h-8 w-full p-0.5 border-none bg-white/10 rounded-lg cursor-pointer" />
                       </div>

                       <div className="p-4 bg-white rounded-2xl border space-y-6 shadow-sm">
                          <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Icon Branding</Label>
                          
                          <div className="flex flex-wrap gap-1.5 p-1.5 bg-neutral-50 rounded-xl border w-fit mx-auto">
                            {ICON_OPTIONS.map(opt => (
                              <button key={opt.id} onClick={() => updateBenefit(i, 'icon', opt.id)} className={cn("h-8 w-8 flex items-center justify-center rounded-lg transition-all", item.icon === opt.id ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-white")}><opt.icon className="h-4 w-4" /></button>
                            ))}
                          </div>

                          <div className="space-y-4 border-t pt-4">
                             <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold uppercase text-muted-foreground">Icon Gradient</span>
                                <Switch checked={item.iconBgType === 'gradient'} onCheckedChange={v => updateBenefit(i, 'iconBgType', v ? 'gradient' : 'solid')} className="scale-75" />
                             </div>
                             <div className="flex gap-2">
                                <Input type="color" value={item.iconBgColor1 || '#6750A4'} onChange={e => updateBenefit(i, 'iconBgColor1', e.target.value)} className="h-8 w-full p-0.5 border-none bg-neutral-100 rounded-lg cursor-pointer shadow-inner" />
                                {item.iconBgType === 'gradient' && <Input type="color" value={item.iconBgColor2 || '#6750A4'} onChange={e => updateBenefit(i, 'iconBgColor2', e.target.value)} className="h-8 w-full p-0.5 border-none bg-neutral-100 rounded-lg cursor-pointer shadow-inner animate-in zoom-in-95" />}
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 border-t pt-4">
                             <div className="space-y-2">
                                <Label className="text-[8px] font-bold uppercase opacity-60">Icon Tint</Label>
                                <Input type="color" value={item.iconColor || '#ffffff'} onChange={e => updateBenefit(i, 'iconColor', e.target.value)} className="h-8 w-full p-0.5 border-none bg-neutral-100 rounded-lg cursor-pointer" />
                             </div>
                             <div className="space-y-2">
                                <Label className="text-[8px] font-bold uppercase opacity-60">Shape</Label>
                                <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg">
                                   <button onClick={() => updateBenefit(i, 'iconShape', 'square')} className={cn("h-7 w-7 flex items-center justify-center rounded transition-all", item.iconShape === 'square' ? "bg-white shadow-sm text-primary" : "text-muted-foreground")}><Square className="h-3.5 w-3.5" /></button>
                                   <button onClick={() => updateBenefit(i, 'iconShape', 'rounded')} className={cn("h-7 w-7 flex items-center justify-center rounded-lg transition-all", (item.iconShape || 'rounded') === 'rounded' ? "bg-white shadow-sm text-primary" : "text-muted-foreground")}><Layers className="h-3.5 w-3.5" /></button>
                                   <button onClick={() => updateBenefit(i, 'iconShape', 'circle')} className={cn("h-7 w-7 flex items-center justify-center rounded-full transition-all", item.iconShape === 'circle' ? "bg-white shadow-sm text-primary" : "text-muted-foreground")}><Circle className="h-3.5 w-3.5" /></button>
                                </div>
                             </div>
                          </div>

                          <div className="space-y-4 pt-4 border-t">
                             <div className="flex items-center justify-between">
                                <Label className="text-[9px] font-bold uppercase">Icon Scale (Size)</Label>
                                <Badge variant="outline" className="text-[9px] font-mono">{item.iconContainerSize || 56}px</Badge>
                             </div>
                             <Slider value={[item.iconContainerSize || 56]} min={32} max={80} step={2} onValueChange={v => updateBenefit(i, 'iconContainerSize', v[0])} />
                          </div>
                       </div>

                       <div className="p-4 bg-white rounded-2xl border space-y-8 shadow-sm">
                          <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><MousePointer2 className="h-3.5 w-3.5" /> Interaction & Layout</Label>
                          
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-3">
                                <Label className="text-[9px] font-bold uppercase">Alignment</Label>
                                <div className="flex gap-1 bg-neutral-50 p-1 rounded-lg border">
                                  {[ { id: 'left', icon: AlignLeft }, { id: 'center', icon: AlignCenter }, { id: 'right', icon: AlignRight } ].map(align => (
                                    <button key={align.id} onClick={() => updateBenefit(i, 'cardTextAlign', align.id)} className={cn("h-7 w-7 flex-1 flex items-center justify-center rounded-md transition-all", (item.cardTextAlign || 'left') === align.id ? "bg-primary text-white shadow-sm" : "text-muted-foreground")}><align.icon className="h-3 w-3" /></button>
                                  ))}
                                </div>
                             </div>
                             <div className="space-y-3">
                                <Label className="text-[9px] font-bold uppercase">Hover Node</Label>
                                <div className="grid grid-cols-2 gap-1">
                                   {['none', 'lift', 'scale', 'glow'].map(eff => (
                                     <button key={eff} onClick={() => updateBenefit(i, 'hoverEffect', eff)} className={cn("px-1 py-1 rounded-md border text-[7px] font-black uppercase transition-all", (item.hoverEffect || 'lift') === eff ? "bg-primary text-white border-primary shadow-sm" : "bg-neutral-50 hover:bg-neutral-100")}>{eff}</button>
                                   ))}
                                </div>
                             </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t">
                             <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                   <Label className="text-[9px] font-bold uppercase text-muted-foreground">Hover Color</Label>
                                   <Input type="color" value={item.hoverColor || '#6750A4'} onChange={e => updateBenefit(i, 'hoverColor', e.target.value)} className="h-7 w-12 p-0.5 border-none bg-neutral-100 rounded-md cursor-pointer" />
                                </div>
                             </div>
                             <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                   <Label className="text-[9px] font-bold uppercase text-muted-foreground">Shadow Color</Label>
                                   <Input type="color" value={item.shadowColor || '#000000'} onChange={e => updateBenefit(i, 'shadowColor', e.target.value)} className="h-7 w-12 p-0.5 border-none bg-neutral-100 rounded-md cursor-pointer" />
                                </div>
                             </div>
                          </div>

                          <div className="space-y-4 border-t pt-4">
                             <div className="flex items-center justify-between">
                                <Label className="text-[9px] font-bold uppercase">Shadow Depth</Label>
                                <div className="grid grid-cols-3 gap-1">
                                   {['none', 'md', 'xl'].map(lvl => (
                                     <button key={lvl} onClick={() => updateBenefit(i, 'cardShadow', lvl)} className={cn("px-2 py-1 rounded-md border text-[8px] font-black uppercase transition-all", (item.cardShadow || 'xl') === lvl ? "bg-primary text-white border-primary shadow-sm" : "bg-neutral-50 hover:bg-neutral-100")}>{lvl}</button>
                                   ))}
                                </div>
                             </div>
                          </div>

                          <div className="space-y-4 border-t pt-4">
                             <div className="flex items-center justify-between">
                                <Label className="text-[9px] font-bold uppercase">Card Roundness</Label>
                                <Badge variant="outline" className="text-[9px] font-mono">{item.cardRadius ?? 32}px</Badge>
                             </div>
                             <Slider value={[item.cardRadius ?? 32]} min={0} max={120} step={4} onValueChange={v => updateBenefit(i, 'cardRadius', v[0])} />
                          </div>
                       </div>

                       <div className="p-4 bg-white rounded-2xl border space-y-6 shadow-sm">
                          <Label className="text-[10px] font-black uppercase text-primary">Border Architecture</Label>
                          <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                <Label className="text-[9px] font-bold uppercase">Style</Label>
                                <select 
                                  value={item.cardBorderStyle || 'solid'} 
                                  onChange={e => updateBenefit(i, 'cardBorderStyle', e.target.value)}
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
                                <Badge variant="outline" className="text-[9px] font-mono">{item.cardBorderWidth || 0}px</Badge>
                             </div>
                             <Slider value={[item.cardBorderWidth || 0]} min={0} max={12} step={1} onValueChange={v => updateBenefit(i, 'cardBorderWidth', v[0])} />
                             <div className="flex items-center justify-between">
                                <Label className="text-[8px] font-bold uppercase opacity-50">Border Color</Label>
                                <Input type="color" value={item.cardBorderColor || '#eeeeee'} onChange={e => updateBenefit(i, 'cardBorderColor', e.target.value)} className="h-7 w-12 p-0 border-none bg-transparent cursor-pointer" />
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button onClick={() => addItem('items', { title: 'New Advantage', desc: '', icon: 'check', titleColor: '#111827', cardBgType: 'solid', cardBgColor1: '#ffffff', iconBgType: 'solid', iconBgColor1: '#6750A4', iconColor: '#ffffff', iconShape: 'rounded', iconContainerSize: 56, cardTextAlign: 'left', cardShadow: 'xl', shadowColor: '#000000', hoverEffect: 'lift', hoverColor: '#6750A4', cardBorderWidth: 0, cardBorderColor: '#eeeeee', cardBorderStyle: 'solid', cardRadius: 32 })} className="w-full h-16 border-2 border-dashed rounded-[1.5rem] font-black text-xs uppercase gap-2 hover:bg-primary/5 hover:border-primary/20 transition-all">+ Add Advantage Card</button>
        </div>
      )}

      {activeMainTab === 'section-style' && (
        <div className="space-y-6 animate-in slide-in-from-right-2">
          <div className="p-5 bg-neutral-50 rounded-[2rem] border space-y-6">
            <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><Layers className="h-3.5 w-3.5" /> Presentation Studio</Label>
            
            <div className="space-y-6">
               <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Section Header Alignment</Label>
                  <div className="flex gap-2">
                    {[
                      { id: 'left', icon: AlignLeft },
                      { id: 'center', icon: AlignCenter },
                      { id: 'right', icon: AlignRight }
                    ].map(btn => (
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

               <div className="space-y-3 pt-4 border-t">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Grid Architecture (Desktop)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'list', icon: LayoutList, label: '1-Col' },
                      { id: 'grid2', icon: LayoutGrid, label: '2-Col' },
                      { id: 'grid3', icon: Columns3, label: '3-Col' }
                    ].map(l => (
                      <button key={l.id} onClick={() => setPageData({...pageData, layout: l.id})} className={cn("p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all", (pageData.layout || 'grid3') === l.id ? "bg-primary/5 border-primary shadow-sm" : "bg-white border-transparent hover:bg-neutral-100")}>
                        <l.icon className={cn("h-4 w-4", (pageData.layout || 'grid3') === l.id ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-[8px] font-black uppercase">{l.label}</span>
                      </button>
                    ))}
                  </div>
               </div>
               
               <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                     <Label className="text-[10px] font-bold uppercase">Vertical Gap</Label>
                     <Badge variant="outline" className="text-[9px] font-mono">{pageData.itemGap || 24}px</Badge>
                  </div>
                  <Slider value={[pageData.itemGap || 24]} min={8} max={80} step={4} onValueChange={v => setPageData({...pageData, itemGap: v[0]})} />
               </div>
            </div>
          </div>

          <div className="p-5 bg-neutral-900 text-white rounded-[2rem] border-none space-y-6 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12"><Paintbrush className="h-20 w-20 text-accent" /></div>
             <Label className="text-[10px] font-black uppercase text-accent tracking-widest flex items-center gap-2 relative z-10"><Paintbrush className="h-3.5 w-3.5" /> Stage Surface</Label>
             <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                   <Label className="text-[10px] font-bold uppercase opacity-60">Gradient Mode</Label>
                   <Switch checked={pageData.sectionBgType === 'gradient'} onCheckedChange={v => setPageData({...pageData, sectionBgType: v ? 'gradient' : 'solid'})} className="scale-75" />
                </div>
                <div className="flex gap-2">
                   <Input type="color" value={pageData.sectionBgColor1 || '#fafafa'} onChange={e => setPageData({...pageData, sectionBgColor1: e.target.value})} className="h-9 w-full p-0.5 border-none bg-white/10 rounded-lg cursor-pointer shadow-inner" />
                   {pageData.sectionBgType === 'gradient' && <Input type="color" value={pageData.sectionBgColor2 || '#ffffff'} onChange={e => setPageData({...pageData, sectionBgColor2: e.target.value})} className="h-9 w-full p-0.5 border-none bg-white/10 rounded-lg cursor-pointer shadow-inner animate-in zoom-in-95" />}
                </div>
             </div>
          </div>
        </div>
      )}

      <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex gap-4">
         <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
         <p className="text-[10px] text-neutral-600 font-medium leading-relaxed italic">
           Advanced benefit nodes are rendered as independent design entities with real-time responsive scaling.
         </p>
      </div>
    </div>
  );
}
