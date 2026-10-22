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
  X, 
  Plus, 
  Palette, 
  BrainCircuit,
  Loader2,
  ChevronDown,
  ChevronUp,
  Zap,
  MessageSquare,
  Paintbrush,
  Copy,
  Info,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Bold,
  Italic,
  Strikethrough,
  Target,
  Maximize2,
  ImageIcon,
  UploadCloud,
  Trash2,
  Maximize
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateMicroSiteContent } from "@/ai/flows/ai-microsite-flow";
import { useToast } from "@/hooks/use-toast";

interface FAQTabProps {
  pageData: any;
  globalAiContext?: any;
  setPageData: (data: any) => void;
  addItem: (field: string, item: any) => void;
  removeItem: (field: string, index: number) => void;
  uploadingField: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string, index?: number) => void;
}

export function FAQTab({ pageData, globalAiContext, setPageData, addItem, removeItem, uploadingField, handleImageUpload }: FAQTabProps) {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'hub' | 'surface' | 'spacing'>('content');
  const [expandedItem, setExpandedItem] = useState<number | null>(0);
  const { toast } = useToast();

  const handleAiFAQ = async () => {
    setIsAiLoading(true);
    try {
      const res = await generateMicroSiteContent({ 
        businessName: globalAiContext?.businessName || "Our Brand", 
        goal: globalAiContext?.goal || pageData.faqSectionTitle || "Resolve Customer Doubts",
        audience: globalAiContext?.audience || "",
        offer: globalAiContext?.offer || "",
        description: globalAiContext?.description || "",
        tone: globalAiContext?.tone || "Professional",
        brandVibe: globalAiContext?.vibe || "Modern"
      });
      
      const faqSection = res.sections.find(s => s.type === 'faq');
      if (faqSection) {
        setPageData({
          ...pageData,
          ...faqSection.data
        });
        toast({ title: "Knowledge Hub Synced" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "AI Forge Error" });
    } finally {
      setIsAiLoading(false);
    }
  };

  const updateItem = (index: number, key: string, value: any) => {
    if (!Array.isArray(pageData.faqs)) return;
    const newList = [...pageData.faqs];
    newList[index] = { ...newList[index], [key]: value };
    setPageData({ ...pageData, faqs: newList });
  };

  const duplicateItem = (index: number) => {
    if (!Array.isArray(pageData.faqs)) return;
    const original = pageData.faqs[index];
    const newList = [...pageData.faqs];
    newList.splice(index + 1, 0, { ...original, id: crypto.randomUUID() });
    setPageData({ ...pageData, faqs: newList });
    setExpandedItem(index + 1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={handleAiFAQ} 
          disabled={isAiLoading} 
          className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase border-2 gap-2"
        >
          {isAiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3 w-3 text-primary" />} 
          AI Smart Resolve
        </Button>
        <div className="flex bg-neutral-100 p-1 rounded-xl">
           {['content', 'hub', 'surface', 'spacing'].map(t => (
             <button key={t} onClick={() => setActiveTab(t as any)} className={cn("px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all", activeTab === t ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:bg-white/50")}>{t}</button>
           ))}
        </div>
      </div>

      {activeTab === 'content' && (
        <div className="space-y-6 animate-in slide-in-from-left-2">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Main Heading</Label>
              <Input value={pageData.faqSectionTitle || ""} onChange={e => setPageData({...pageData, faqSectionTitle: e.target.value})} className="h-11 rounded-xl bg-white font-bold text-sm border-2" />
            </div>

            {/* Highlights Ultra Module */}
            <div className="space-y-4 p-5 bg-primary/5 rounded-[2rem] border-2 border-primary/10">
              <div className="flex items-center justify-between border-b border-primary/10 pb-3 mb-3">
                 <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Highlights Ultra</Label>
                 <div className="flex items-center gap-2"><span className="text-[8px] font-bold text-muted-foreground uppercase">Gradient</span><Switch checked={pageData.highlightedBgType === 'gradient'} onCheckedChange={v => setPageData({...pageData, highlightedBgType: v ? 'gradient' : 'solid'})} className="scale-75" /></div>
              </div>
              <div className="space-y-4">
                <Input value={pageData.highlightedText || ""} onChange={e => setPageData({...pageData, highlightedText: e.target.value})} placeholder="Words to highlight..." className="h-10 rounded-xl bg-white font-black text-primary text-sm" />
                <div className="flex items-center justify-between gap-2 p-3 bg-white rounded-xl border shadow-sm">
                   <div className="flex gap-1 bg-neutral-100 p-0.5 rounded-lg">
                      <button onClick={() => setPageData({...pageData, highlightBold: !pageData.highlightBold})} className={cn("h-7 w-7 flex items-center justify-center rounded transition-all", pageData.highlightBold ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}><Bold className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setPageData({...pageData, highlightItalic: !pageData.highlightItalic})} className={cn("h-7 w-7 flex items-center justify-center rounded transition-all", pageData.highlightItalic ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}><Italic className="h-3.5 w-3.5" /></button>
                   </div>
                   <select value={pageData.highlightStyle || 'text'} onChange={e => setPageData({...pageData, highlightStyle: e.target.value})} className="bg-neutral-100 rounded-lg h-8 px-2 text-[8px] font-black uppercase outline-none"><option value="text">Text Only</option><option value="underline">Underline</option><option value="pill">Pill</option></select>
                </div>
                <div className="flex gap-2">
                   <div className="flex-1 space-y-1"><Label className="text-[8px] font-bold uppercase opacity-60">Color 1</Label><Input type="color" value={pageData.highlightedColor || pageData.themeColor} onChange={e => setPageData({...pageData, highlightedColor: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white rounded-md" /></div>
                   {pageData.highlightedBgType === 'gradient' && <div className="flex-1 space-y-1"><Label className="text-[8px] font-bold uppercase opacity-60">Color 2</Label><Input type="color" value={pageData.highlightedColor2 || pageData.themeColor} onChange={e => setPageData({...pageData, highlightedColor2: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white rounded-md" /></div>}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Narrative Description</Label>
              <Textarea value={pageData.sectionDescription || ""} onChange={e => setPageData({...pageData, sectionDescription: e.target.value})} className="text-xs bg-white min-h-[80px] rounded-xl border-2" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'hub' && (
        <div className="space-y-4 animate-in slide-in-from-right-2">
           {Array.isArray(pageData.faqs) && pageData.faqs.map((f: any, i: number) => (
              <div key={i} className={cn("bg-white border-2 rounded-[2rem] overflow-hidden transition-all duration-500", expandedItem === i ? "border-primary shadow-2xl" : "border-neutral-100")}>
                <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedItem(expandedItem === i ? null : i)}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-neutral-50 flex items-center justify-center text-primary border shrink-0"><MessageSquare className="h-5 w-5" /></div>
                    <p className="text-[11px] font-black text-foreground truncate max-w-[140px] uppercase">{f.question || "New Question"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); duplicateItem(i); }} className="h-8 w-8 flex items-center justify-center text-primary hover:bg-primary/5 rounded-full"><Copy className="h-3.5 w-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); removeItem('faqs', i); }} className="h-8 w-8 flex items-center justify-center text-destructive hover:bg-red-50 rounded-full"><X className="h-3.5 w-3.5" /></button>
                    {expandedItem === i ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
                {expandedItem === i && (
                  <div className="px-5 pb-8 space-y-6 animate-in slide-in-from-top-2 border-t pt-6 bg-neutral-50/50">
                    <div className="space-y-4">
                       <div className="space-y-1.5"><Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">The Question</Label><Input value={f.question} onChange={e => updateItem(i, 'question', e.target.value)} className="h-10 rounded-xl bg-white font-bold text-xs" /></div>
                       <div className="space-y-1.5"><Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">The Answer</Label><Textarea value={f.answer} onChange={e => updateItem(i, 'answer', e.target.value)} className="text-xs bg-white min-h-[100px] rounded-xl" /></div>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border space-y-4 shadow-sm">
                       <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Palette className="h-3 w-3" /> Node Background</Label>
                       <div className="flex items-center justify-between"><span className="text-[9px] font-bold">Gradient</span><Switch checked={f.cardBgType === 'gradient'} onCheckedChange={v => updateItem(i, 'cardBgType', v ? 'gradient' : 'solid')} className="scale-75" /></div>
                       <div className="flex gap-2">
                          <Input type="color" value={f.cardBgColor1 || '#ffffff'} onChange={e => updateItem(i, 'cardBgColor1', e.target.value)} className="h-8 w-full p-0.5 border-none bg-neutral-100 rounded-lg" />
                          {f.cardBgType === 'gradient' && <Input type="color" value={f.cardBgColor2 || '#ffffff'} onChange={e => updateItem(i, 'cardBgColor2', e.target.value)} className="h-8 w-full p-0.5 border-none bg-neutral-100 rounded-lg animate-in zoom-in-95" />}
                       </div>
                    </div>
                  </div>
                )}
              </div>
           ))}
           <Button variant="outline" onClick={() => addItem('faqs', { question: 'New Question', answer: '', cardBgType: 'solid', cardBgColor1: '#ffffff' })} className="w-full h-14 border-2 border-dashed rounded-[1.5rem] font-black text-xs uppercase gap-2">+ Add FAQ Node</Button>
        </div>
      )}

      {activeTab === 'surface' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2">
           <div className="p-5 bg-neutral-50 rounded-[2.5rem] border space-y-6">
            <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><Palette className="h-3.5 w-3.5" /> Stage Controls</Label>
            <div className="space-y-6">
               <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Header Alignment</Label>
                  <div className="flex gap-2">
                    {[ { id: 'left', icon: AlignLeft }, { id: 'center', icon: AlignCenter }, { id: 'right', icon: AlignRight } ].map(btn => (
                      <button key={btn.id} onClick={() => setPageData({...pageData, titleAlign: btn.id})} className={cn("h-11 flex-1 flex items-center justify-center rounded-xl border-2 transition-all", (pageData.titleAlign || 'center') === btn.id ? "bg-primary text-white border-primary shadow-lg" : "bg-white text-muted-foreground hover:bg-neutral-50")}><btn.icon className="h-4 w-4" /></button>
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
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Split View Architecture</Label>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border">
                     <div className="flex items-center gap-3"><div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Maximize2 className="h-4 w-4" /></div><span className="text-[10px] font-black uppercase">Enable Split</span></div>
                     <Switch checked={pageData.layoutSplit} onCheckedChange={v => setPageData({...pageData, layoutSplit: v})} />
                  </div>
               </div>
            </div>
          </div>

          <div className="p-5 bg-neutral-900 text-white rounded-[2rem] border-none space-y-6 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12"><Paintbrush className="h-20 w-20 text-accent" /></div>
             <Label className="text-[10px] font-black uppercase text-accent tracking-widest flex items-center gap-2 relative z-10"><Paintbrush className="h-3.5 w-3.5" /> Stage Surface</Label>
             <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between"><Label className="text-[10px] font-bold uppercase opacity-60">Gradient Mode</Label><Switch checked={pageData.faqSectionBgType === 'gradient'} onCheckedChange={v => setPageData({...pageData, faqSectionBgType: v ? 'gradient' : 'solid'})} className="scale-75" /></div>
                <div className="flex gap-2">
                   <Input type="color" value={pageData.faqSectionBgColor1 || '#fafafa'} onChange={e => setPageData({...pageData, faqSectionBgColor1: e.target.value})} className="h-9 w-full p-0.5 border-none bg-white/10 rounded-lg cursor-pointer shadow-inner" />
                   {pageData.faqSectionBgType === 'gradient' && <Input type="color" value={pageData.faqSectionBgColor2 || '#ffffff'} onChange={e => setPageData({...pageData, faqSectionBgColor2: e.target.value})} className="h-9 w-full p-0.5 border-none bg-white/10 rounded-lg cursor-pointer animate-in zoom-in-95" />}
                </div>
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <Label className="text-[10px] font-black uppercase text-accent flex items-center gap-2"><ImageIcon className="h-3.5 w-3.5" /> Section BG Image</Label>
                  <div className="relative aspect-video bg-white/5 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer overflow-hidden group hover:border-accent/40 transition-all shadow-inner" onClick={() => document.getElementById('faq-bg-input')?.click()}>
                      {pageData.sectionBgImage ? <img src={pageData.sectionBgImage} className="w-full h-full object-cover" alt="" /> : <UploadCloud className="h-6 w-6 opacity-20" />}
                      {uploadingField === 'sectionBgImage' && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 animate-in fade-in"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>}
                  </div>
                  <input type="file" id="faq-bg-input" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'sectionBgImage')} />
                  {pageData.sectionBgImage && (
                    <div className="space-y-4 pt-2">
                       <div className="flex items-center justify-between"><Label className="text-[9px] font-bold uppercase opacity-60">Overlay Strength</Label><Badge variant="outline" className="text-accent border-accent/20 text-[9px] font-mono">{pageData.sectionBgOverlayOpacity || 0}%</Badge></div>
                       <Slider value={[pageData.sectionBgOverlayOpacity || 0]} min={0} max={100} step={5} onValueChange={v => setPageData({...pageData, sectionBgOverlayOpacity: v[0]})} />
                       <Button variant="ghost" className="w-full text-red-400 text-[10px] font-black uppercase h-10 hover:bg-red-500/10" onClick={() => setPageData({...pageData, sectionBgImage: ''})}><Trash2 className="h-3.5 w-3.5 mr-2" /> Remove Image</Button>
                    </div>
                  )}
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'spacing' && (
        <div className="p-6 bg-neutral-50 rounded-[2.5rem] border space-y-8 animate-in zoom-in-95">
           <div className="space-y-6">
              <div className="flex items-center justify-between"><Label className="text-[10px] font-black uppercase text-primary">Padding Top</Label><Badge variant="outline" className="font-mono text-[10px]">{pageData.sectionPaddingTop || 80}px</Badge></div>
              <Slider value={[pageData.sectionPaddingTop || 80]} min={0} max={240} step={4} onValueChange={v => setPageData({...pageData, sectionPaddingTop: v[0]})} />
           </div>
           <div className="space-y-6">
              <div className="flex items-center justify-between"><Label className="text-[10px] font-black uppercase text-primary">Padding Bottom</Label><Badge variant="outline" className="font-mono text-[10px]">{pageData.sectionPaddingBottom || 80}px</Badge></div>
              <Slider value={[pageData.sectionPaddingBottom || 80]} min={0} max={240} step={4} onValueChange={v => setPageData({...pageData, sectionPaddingBottom: v[0]})} />
           </div>
        </div>
      )}
    </div>
  );
}
