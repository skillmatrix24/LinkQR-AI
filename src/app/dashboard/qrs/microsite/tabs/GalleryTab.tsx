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
  ImageIcon, 
  LayoutGrid, 
  LayoutList,
  Columns3, 
  Palette, 
  UploadCloud, 
  Loader2, 
  Type,
  Maximize,
  Sparkles,
  Zap,
  MousePointer2,
  Layers,
  Info,
  ChevronDown,
  ChevronUp,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Paintbrush,
  Copy,
  Wand2,
  Crop,
  Maximize2,
  Trash2,
  Layout,
  Target,
  BrainCircuit,
  Bold,
  Italic,
  Strikethrough,
  Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateMicroSiteContent } from "@/ai/flows/ai-microsite-flow";
import { generateAILogo } from "@/ai/flows/generate-ai-logo-flow";
import { useToast } from "@/hooks/use-toast";

interface GalleryTabProps {
  sectionId: string;
  pageData: any;
  globalAiContext?: any;
  setPageData: (data: any) => void;
  addItem: (field: string, item: any) => void;
  removeItem: (field: string, index: number) => void;
  updateItem: (field: string, index: number, key: string, value: any) => void;
  uploadingField: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string, index?: number) => void;
}

export function GalleryTab({ sectionId, pageData, globalAiContext, setPageData, addItem, removeItem, updateItem, uploadingField, handleImageUpload }: GalleryTabProps) {
  const [activeTab, setActiveTab] = useState<'assets' | 'narrative' | 'canvas' | 'surface' | 'spacing'>('assets');
  const [expandedItem, setExpandedItem] = useState<number | null>(0);
  const [isAiGenerating, setIsAiGenerating] = useState<number | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { toast } = useToast();

  const handleAiRefine = async () => {
    setIsAiLoading(true);
    try {
      const res = await generateMicroSiteContent({ 
        businessName: globalAiContext?.businessName || "Business", 
        goal: globalAiContext?.goal || pageData.gallerySectionTitle || "Gallery Strategy",
        audience: globalAiContext?.audience || "",
        offer: globalAiContext?.offer || "",
        description: globalAiContext?.description || "",
        tone: globalAiContext?.tone || "Professional",
        brandVibe: globalAiContext?.vibe || "Modern"
      });
      const galleryBlock = res.sections.find(s => s.type === 'gallery');
      if (galleryBlock) {
        setPageData({ ...pageData, ...galleryBlock.data });
        toast({ title: "Strategy Refined" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "AI Forge Error" });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateAIImage = async (index: number, prompt: string) => {
    if (!prompt) {
      toast({ variant: "destructive", title: "Description Required" });
      return;
    }
    setIsAiGenerating(index);
    try {
      const result = await generateAILogo({ prompt });
      updateGalleryItem(index, 'image', result.imageUrl);
      toast({ title: "Visual Node Created" });
    } catch (err) {
      toast({ variant: "destructive", title: "AI Forge Error" });
    } finally {
      setIsAiGenerating(null);
    }
  };

  const updateGalleryItem = (index: number, key: string, value: any) => {
    if (!Array.isArray(pageData.gallery)) return;
    const newList = [...pageData.gallery];
    newList[index] = { ...newList[index], [key]: value };
    setPageData({ ...pageData, gallery: newList });
  };

  const duplicateItem = (index: number) => {
    if (!Array.isArray(pageData.gallery)) return;
    const original = pageData.gallery[index];
    const newList = [...pageData.gallery];
    newList.splice(index + 1, 0, { ...original, id: crypto.randomUUID() });
    setPageData({ ...pageData, gallery: newList });
    setExpandedItem(index + 1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-24">
      <div className="p-3 bg-accent/5 border border-accent/10 rounded-2xl flex items-center justify-between gap-3">
         <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-accent shrink-0" />
            <p className="text-[9px] font-black uppercase text-accent leading-none">AI Identity Active</p>
         </div>
         <Button size="sm" onClick={handleAiRefine} disabled={isAiLoading} className="h-8 rounded-xl font-black text-[9px] uppercase shadow-lg bg-accent hover:bg-accent/90 text-white">
            {isAiLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />} Refine
         </Button>
      </div>

      <div className="flex flex-wrap gap-1 p-1 bg-neutral-100 rounded-xl">
        {['assets', 'narrative', 'canvas', 'surface', 'spacing'].map(t => (
          <button 
            key={t} 
            onClick={() => setActiveTab(t as any)} 
            className={cn("flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all", activeTab === t ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:bg-white/50")}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'assets' && (
        <div className="space-y-6 animate-in slide-in-from-left-2">
          <div className="space-y-4">
            {Array.isArray(pageData.gallery) && pageData.gallery.map((item: any, i: number) => (
              <div key={i} className={cn(
                "bg-white border-2 rounded-[2rem] overflow-hidden transition-all duration-500",
                expandedItem === i ? "border-primary shadow-2xl" : "border-neutral-100 hover:border-neutral-200"
              )}>
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedItem(expandedItem === i ? null : i)}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-neutral-50 flex items-center justify-center border overflow-hidden shrink-0 relative">
                      {item.image ? <img src={item.image} className="h-full w-full object-cover" alt="" /> : <ImageIcon className="h-5 w-5 text-primary/30" />}
                      {uploadingField === `image-${i}` && <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black text-foreground truncate max-w-[140px] uppercase tracking-tight">{item.caption || "Awaiting Media"}</p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Node {i+1}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); duplicateItem(i); }} className="h-8 w-8 flex items-center justify-center text-primary hover:bg-primary/5 rounded-full"><Copy className="h-3.5 w-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); removeItem('gallery', i); }} className="h-8 w-8 flex items-center justify-center text-destructive hover:bg-red-50 rounded-full"><X className="h-3.5 w-3.5" /></button>
                    {expandedItem === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>

                {expandedItem === i && (
                  <div className="px-5 pb-8 space-y-8 animate-in slide-in-from-top-2 border-t pt-6 bg-neutral-50/50">
                    <div className="p-5 rounded-3xl bg-[#0a0a0a] text-white space-y-4 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700"><Wand2 className="h-20 w-20 text-accent" /></div>
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2 relative z-10"><Sparkles className="h-3.5 w-3.5" /> AI Magic Asset</h4>
                       <Textarea placeholder="What should AI imagine?" value={item.aiPrompt || ""} onChange={e => updateGalleryItem(i, 'aiPrompt', e.target.value)} className="bg-white/5 border-white/10 text-white text-[11px] min-h-[60px]" />
                       <Button onClick={() => handleGenerateAIImage(i, item.aiPrompt)} disabled={isAiGenerating === i || !item.aiPrompt} className="w-full h-10 rounded-xl font-black bg-accent hover:bg-accent/90 text-white text-[10px] shadow-lg">
                          {isAiGenerating === i ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "CREATE WITH AI"}
                       </Button>
                    </div>

                    <div className="space-y-4">
                       <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><ImageIcon className="h-3.5 w-3.5" /> Traditional Upload</Label>
                       <div className="relative aspect-video bg-white rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:bg-neutral-100 transition-all shadow-inner" onClick={() => document.getElementById(`gallery-img-input-${i}`)?.click()}>
                          {item.image ? <img src={item.image} className="w-full h-full object-cover" alt="" /> : <div className="flex flex-col items-center gap-2"><UploadCloud className="h-8 w-8 opacity-20" /><span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Select Image</span></div>}
                          {uploadingField === `image-${i}` && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>}
                       </div>
                       <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl flex gap-3"><Info className="h-4 w-4 text-primary shrink-0 mt-0.5" /><p className="text-[8px] font-bold text-primary/70 uppercase leading-relaxed">Guide: 800x600px. Max: 1MB.</p></div>
                       <input type="file" id={`gallery-img-input-${i}`} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'image', i)} />
                    </div>

                    <div className="p-4 bg-white rounded-2xl border space-y-3">
                       <Label className="text-[10px] font-black uppercase text-primary">Item Identity</Label>
                       <Input value={item.caption} onChange={e => updateGalleryItem(i, 'caption', e.target.value)} placeholder="Title / Caption" className="h-10 text-xs font-bold" />
                       <Textarea value={item.description} onChange={e => updateGalleryItem(i, 'description', e.target.value)} placeholder="Details..." className="min-h-[60px] text-xs" />
                    </div>

                    <div className="p-4 bg-white rounded-2xl border space-y-6">
                       <Label className="text-[10px] font-black uppercase text-primary">Styling & Hover</Label>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5"><Label className="text-[8px] font-bold uppercase opacity-60">Aspect Ratio</Label><select value={item.aspectRatio || 'video'} onChange={e => updateGalleryItem(i, 'aspectRatio', e.target.value)} className="w-full bg-neutral-50 rounded-lg h-9 px-2 text-[10px] font-bold outline-none"><option value="square">Square</option><option value="video">Video</option><option value="portrait">Portrait</option></select></div>
                          <div className="space-y-1.5"><Label className="text-[8px] font-bold uppercase opacity-60">Hover Effect</Label><select value={item.hoverEffect || 'zoom'} onChange={e => updateGalleryItem(i, 'hoverEffect', e.target.value)} className="w-full bg-neutral-50 rounded-lg h-9 px-2 text-[10px] font-bold outline-none"><option value="zoom">Zoom</option><option value="lift">Lift</option><option value="glow">Glow</option></select></div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => addItem('gallery', { id: crypto.randomUUID(), image: 'https://picsum.photos/seed/gallery/800/600', caption: 'New Entry', description: '', hoverEffect: 'zoom', cardBorderWidth: 0, aspectRatio: 'video' })} className="w-full h-16 border-2 border-dashed rounded-[1.5rem] font-black text-xs uppercase gap-2 hover:bg-primary/5 transition-all">+ Add New Media Node</button>
        </div>
      )}

      {activeTab === 'narrative' && (
        <div className="space-y-6 animate-in slide-in-from-right-2">
           <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Main Heading</Label>
              <Input value={pageData.gallerySectionTitle || ""} onChange={e => setPageData({...pageData, gallerySectionTitle: e.target.value})} className="h-11 rounded-xl bg-white font-bold text-sm border-2" />
            </div>

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
                      <button onClick={() => setPageData({...pageData, highlightStrike: !pageData.highlightStrike})} className={cn("h-7 w-7 flex items-center justify-center rounded transition-all", pageData.highlightStrike ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}><Strikethrough className="h-3.5 w-3.5" /></button>
                   </div>
                   <select value={pageData.highlightStyle || 'text'} onChange={e => setPageData({...pageData, highlightStyle: e.target.value})} className="bg-neutral-100 rounded-lg h-8 px-2 text-[8px] font-black uppercase outline-none"><option value="text">Text Only</option><option value="underline">Underline</option><option value="pill">Pill</option></select>
                </div>
                <div className="flex gap-2">
                   <div className="flex-1 space-y-1"><Label className="text-[8px] font-bold uppercase opacity-60">Color 1</Label><Input type="color" value={pageData.highlightedColor || pageData.themeColor} onChange={e => setPageData({...pageData, highlightedColor: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white rounded-md" /></div>
                   {pageData.highlightedBgType === 'gradient' && <div className="flex-1 space-y-1 animate-in zoom-in-95"><Label className="text-[8px] font-bold uppercase opacity-60">Color 2</Label><Input type="color" value={pageData.highlightedColor2 || pageData.themeColor} onChange={e => setPageData({...pageData, highlightedColor2: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white rounded-md" /></div>}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Narrative Description</Label>
              <Textarea value={pageData.sectionDescription || ""} onChange={e => setPageData({...pageData, sectionDescription: e.target.value})} className="text-xs bg-white min-h-[80px] rounded-xl border-2" />
            </div>

            <div className="p-4 bg-neutral-900 text-white rounded-2xl space-y-4 shadow-xl">
               <Label className="text-[10px] font-black uppercase text-accent flex items-center gap-2"><Target className="h-3.5 w-3.5" /> Header Tint</Label>
               <Input type="color" value={pageData.sectionTitleColor || '#111827'} onChange={e => setPageData({...pageData, sectionTitleColor: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white/10 rounded-lg cursor-pointer" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'canvas' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2">
           <div className="p-6 bg-primary/5 border-2 border-primary/10 rounded-[2.5rem] space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg"><Layout className="h-5 w-5" /></div>
                   <h4 className="font-black text-sm uppercase tracking-tight text-primary">Split Architecture</h4>
                </div>
                <Switch checked={pageData.layoutSplit} onCheckedChange={v => setPageData({...pageData, layoutSplit: v})} />
             </div>
             {pageData.layoutSplit && (
               <div className="space-y-4 animate-in slide-in-from-top-2">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border">
                     <span className="text-[10px] font-black uppercase text-muted-foreground">Content Side</span>
                     <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg">
                        <button onClick={() => setPageData({...pageData, splitPosition: 'left'})} className={cn("h-8 px-4 rounded-md text-[8px] font-black uppercase transition-all", (pageData.splitPosition || 'left') === 'left' ? "bg-primary text-white shadow-sm" : "text-muted-foreground")}>Left</button>
                        <button onClick={() => setPageData({...pageData, splitPosition: 'right'})} className={cn("h-8 px-4 rounded-md text-[8px] font-black uppercase transition-all", pageData.splitPosition === 'right' ? "bg-white shadow-sm text-primary" : "text-muted-foreground")}>Right</button>
                     </div>
                  </div>
               </div>
             )}
          </div>

          <div className="p-5 bg-neutral-50 rounded-[2rem] border space-y-6">
             <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Grid Matrix (Desktop)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[ 
                    { id: 'grid', icon: LayoutGrid, label: 'Standard' }, 
                    { id: 'carousel', icon: Columns3, label: 'Slider' }, 
                    { id: 'collage', icon: Sparkles, label: 'Collage' },
                    { id: 'masonry', icon: LayoutList, label: 'Masonry' } 
                  ].map(l => (
                    <button key={l.id} onClick={() => setPageData({...pageData, galleryLayout: l.id})} className={cn("p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all", (pageData.galleryLayout || 'grid') === l.id ? "bg-primary/5 border-primary shadow-sm" : "bg-white border-transparent hover:bg-neutral-100")}>
                      <l.icon className={cn("h-4 w-4", (pageData.galleryLayout || 'grid') === l.id ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-[8px] font-black uppercase">{l.label}</span>
                    </button>
                  ))}
                </div>
             </div>
             
             {pageData.galleryLayout !== 'collage' && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                     <Label className="text-[10px] font-bold uppercase">Desktop Columns</Label>
                     <Badge variant="outline" className="text-[9px] font-mono">{pageData.columns || 3} Cols</Badge>
                  </div>
                  <Slider value={[pageData.columns || 3]} min={1} max={4} step={1} onValueChange={v => setPageData({...pageData, columns: v[0]})} />
                </div>
             )}
             
             <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                   <Label className="text-[10px] font-bold uppercase">Node Separation</Label>
                   <Badge variant="outline" className="text-[9px] font-mono">{pageData.itemGap || 24}px</Badge>
                </div>
                <Slider value={[pageData.itemGap || 24]} min={8} max={64} step={4} onValueChange={v => setPageData({...pageData, itemGap: v[0]})} />
             </div>
          </div>
        </div>
      )}

      {activeTab === 'surface' && (
        <div className="space-y-6 animate-in slide-in-from-top-2">
           <div className="p-5 bg-neutral-900 text-white rounded-[2.5rem] border-none space-y-6 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12"><Paintbrush className="h-20 w-20 text-accent" /></div>
             <Label className="text-[10px] font-black uppercase text-accent tracking-widest flex items-center gap-2 relative z-10"><Paintbrush className="h-3.5 w-3.5" /> Section Background</Label>
             <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                   <Label className="text-[10px] font-bold uppercase opacity-60">Gradient Surface</Label>
                   <Switch checked={pageData.gallerySectionBgType === 'gradient'} onCheckedChange={v => setPageData({...pageData, gallerySectionBgType: v ? 'gradient' : 'solid'})} className="scale-75" />
                </div>
                <div className="flex gap-2">
                   <Input type="color" value={pageData.gallerySectionBgColor1 || '#ffffff'} onChange={e => setPageData({...pageData, gallerySectionBgColor1: e.target.value})} className="h-9 w-full p-0.5 border-none bg-white/10 rounded-lg cursor-pointer shadow-inner" />
                   {pageData.gallerySectionBgType === 'gradient' && <Input type="color" value={pageData.gallerySectionBgColor2 || '#ffffff'} onChange={e => setPageData({...pageData, gallerySectionBgColor2: e.target.value})} className="h-9 w-full p-0.5 border-none bg-white/10 rounded-lg cursor-pointer shadow-inner animate-in zoom-in-95" />}
                </div>
             </div>
          </div>

          <div className="p-4 bg-neutral-50 rounded-[2rem] border space-y-4">
             <Label className="text-[10px] font-black uppercase text-primary">Alignment</Label>
             <div className="flex gap-1 bg-white p-1 rounded-lg border">
                {[ { id: 'left', icon: AlignLeft }, { id: 'center', icon: AlignCenter }, { id: 'right', icon: AlignRight } ].map(btn => (
                  <button key={btn.id} onClick={() => setPageData({...pageData, titleAlign: btn.id})} className={cn("h-10 flex-1 flex items-center justify-center rounded-lg transition-all", (pageData.titleAlign || 'center') === btn.id ? "bg-primary text-white" : "text-muted-foreground hover:bg-neutral-50")}><btn.icon className="h-4 w-4" /></button>
                ))}
             </div>
          </div>
        </div>
      )}

      {activeTab === 'spacing' && (
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
      )}
    </div>
  );
}
