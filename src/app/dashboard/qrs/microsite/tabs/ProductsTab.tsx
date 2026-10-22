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
  ShoppingBag, 
  Plus, 
  Trash2, 
  Copy, 
  X, 
  ChevronDown, 
  ChevronUp, 
  ImageIcon, 
  UploadCloud, 
  Loader2, 
  Palette, 
  Target, 
  Sparkles, 
  LayoutGrid, 
  LayoutList, 
  Columns3, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Paintbrush,
  Maximize2,
  Info,
  BadgeIndianRupee,
  Zap,
  Tag,
  Bold,
  Italic,
  Layout,
  Layers,
  MousePointer2,
  BrainCircuit,
  Type,
  Maximize,
  Strikethrough,
  MonitorSmartphone,
  ShieldCheck,
  CreditCard,
  Settings,
  Eye,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateMicroSiteContent } from "@/ai/flows/ai-microsite-flow";
import { useToast } from "@/hooks/use-toast";

interface ProductsTabProps {
  sectionId: string;
  pageData: any;
  globalAiContext?: any;
  setPageData: (data: any) => void;
  addItem: (field: string, item: any) => void;
  removeItem: (field: string, index: number) => void;
  uploadingField: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string, index?: number) => void;
}

export function ProductsTab({ sectionId, pageData, globalAiContext, setPageData, addItem, removeItem, uploadingField, handleImageUpload }: ProductsTabProps) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'narrative' | 'canvas' | 'popup' | 'surface' | 'spacing'>('inventory');
  const [expandedItem, setExpandedItem] = useState<number | null>(0);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { toast } = useToast();

  const handleAiRefine = async () => {
    setIsAiLoading(true);
    try {
      const res = await generateMicroSiteContent({ 
        businessName: globalAiContext?.businessName || "Our Brand", 
        goal: globalAiContext?.goal || pageData.sectionTitle || "Product Catalog",
        audience: globalAiContext?.audience || "",
        offer: globalAiContext?.offer || "",
        description: globalAiContext?.description || "",
        tone: globalAiContext?.tone || "Professional",
        brandVibe: globalAiContext?.vibe || "Modern"
      });
      const prodSection = res.sections.find(s => s.type === 'products');
      if (prodSection) {
        setPageData({ ...pageData, ...prodSection.data });
        toast({ title: "Inventory Optimized" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "AI Forge Error" });
    } finally {
      setIsAiLoading(false);
    }
  };

  const updateItem = (index: number, key: string, value: any) => {
    if (!Array.isArray(pageData.items)) return;
    const newList = [...pageData.items];
    newList[index] = { ...newList[index], [key]: value };
    setPageData({ ...pageData, items: newList });
  };

  const duplicateItem = (index: number) => {
    if (!Array.isArray(pageData.items)) return;
    const original = pageData.items[index];
    const newList = [...pageData.items];
    newList.splice(index + 1, 0, { ...original, id: crypto.randomUUID() });
    setPageData({ ...pageData, items: newList });
    setExpandedItem(index + 1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={handleAiRefine} 
          disabled={isAiLoading} 
          className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase border-2 gap-2"
        >
          {isAiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3 w-3 text-primary" />} 
          AI Smart Catalog
        </Button>
      </div>

      <div className="flex flex-wrap gap-1 p-1 bg-neutral-100 rounded-xl">
        {['inventory', 'narrative', 'canvas', 'popup', 'surface', 'spacing'].map(t => (
          <button 
            key={t} 
            onClick={() => setActiveTab(t as any)} 
            className={cn("flex-1 py-1.5 rounded-lg text-[7px] font-black uppercase transition-all", activeTab === t ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-in slide-in-from-left-2">
           <div className="p-5 bg-emerald-50 rounded-[2.5rem] border-2 border-emerald-100 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-emerald-200/50 pb-3">
                 <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg"><BadgeIndianRupee className="h-4 w-4" /></div>
                 <h4 className="font-black text-sm uppercase tracking-tight text-emerald-900">Global Gateway</h4>
              </div>
              <div className="space-y-2">
                 <Label className="text-[9px] font-bold uppercase text-emerald-700 ml-1">Common Payee UPI ID</Label>
                 <Input value={pageData.upiId || ""} onChange={e => setPageData({...pageData, upiId: e.target.value})} placeholder="name@upi" className="h-11 rounded-xl bg-white border-none shadow-inner text-sm font-mono" />
              </div>
           </div>

           <div className="space-y-4">
              {Array.isArray(pageData.items) && pageData.items.map((p: any, i: number) => (
                <div key={i} className={cn("bg-white border-2 rounded-[2rem] overflow-hidden transition-all duration-500 shadow-sm", expandedItem === i ? "border-primary shadow-2xl" : "border-neutral-100")}>
                   <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedItem(expandedItem === i ? null : i)}>
                      <div className="flex items-center gap-4 min-w-0">
                         <div className="h-10 w-10 rounded-xl bg-neutral-50 flex items-center justify-center border overflow-hidden shrink-0 relative">
                            {p.image ? <img src={p.image} className="h-full w-full object-cover" alt="" /> : <ShoppingBag className="h-5 w-5 text-primary/30" />}
                            {uploadingField === `image-${i}` && <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>}
                         </div>
                         <div className="min-w-0">
                            <p className="text-[11px] font-black text-foreground truncate max-w-[140px] uppercase">₹{p.salePrice || p.price} • {p.title || "New Product"}</p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">SKU Node #{i+1}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <button onClick={(e) => { e.stopPropagation(); duplicateItem(i); }} className="h-8 w-8 flex items-center justify-center text-primary hover:bg-primary/5 rounded-full"><Copy className="h-3.5 w-3.5" /></button>
                         <button onClick={(e) => { e.stopPropagation(); removeItem('items', i); }} className="h-8 w-8 flex items-center justify-center text-destructive hover:bg-red-50 rounded-full"><X className="h-3.5 w-3.5" /></button>
                         {expandedItem === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                   </div>

                   {expandedItem === i && (
                     <div className="px-5 pb-8 space-y-8 animate-in slide-in-from-top-2 border-t pt-6 bg-neutral-50/50">
                        <div className="space-y-4">
                           <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><ImageIcon className="h-3.5 w-3.5" /> High-End Media</Label>
                           <div className="relative aspect-square bg-white rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:bg-neutral-100 transition-all shadow-inner" onClick={() => document.getElementById(`product-img-input-${i}`)?.click()}>
                              {p.image ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : <div className="flex flex-col items-center gap-2"><UploadCloud className="h-8 w-8 opacity-20" /><span className="text-[9px] font-black uppercase text-muted-foreground">Select Square Asset</span></div>}
                              {uploadingField === `image-${i}` && <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                           </div>
                           <input type="file" id={`product-img-input-${i}`} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'image', i)} />
                        </div>

                        <div className="space-y-4">
                           <div className="space-y-1.5"><Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Product Title</Label><Input value={p.title} onChange={e => updateItem(i, 'title', e.target.value)} className="h-10 rounded-xl bg-white font-bold text-xs" /></div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5"><Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Regular Price (₹)</Label><Input type="number" value={p.price} onChange={e => updateItem(i, 'price', Number(e.target.value))} className="h-10 rounded-xl bg-white font-bold text-xs" /></div>
                              <div className="space-y-1.5"><Label className="text-[9px] font-bold uppercase text-primary ml-1">Sale Price (₹)</Label><Input type="number" value={p.salePrice} onChange={e => updateItem(i, 'salePrice', Number(e.target.value))} className="h-10 rounded-xl bg-white font-black text-xs border-primary/20" /></div>
                           </div>
                           <div className="space-y-1.5">
                              <Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Detailed Description (Shows in Pop-up)</Label>
                              <Textarea value={p.description} onChange={e => updateItem(i, 'description', e.target.value)} placeholder="Enter full specifications here..." className="text-[11px] bg-white min-h-[120px] rounded-xl" />
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="p-4 bg-neutral-900 text-white rounded-2xl space-y-4 shadow-xl">
                              <div className="flex items-center justify-between"><Label className="text-[9px] font-bold uppercase text-accent">Active Badge</Label><Switch checked={p.badgeEnabled} onCheckedChange={v => updateItem(i, 'badgeEnabled', v)} className="scale-75" /></div>
                              {p.badgeEnabled && <Input value={p.badgeText} onChange={e => updateItem(i, 'badgeText', e.target.value)} placeholder="BEST SELLER" className="h-9 bg-white/5 border-white/10 text-white text-[10px] font-black uppercase" />}
                           </div>
                           <div className="p-4 bg-white rounded-2xl border space-y-4 shadow-sm">
                              <div className="flex items-center justify-between"><Label className="text-[9px] font-bold uppercase">Stock Status</Label><Switch checked={p.inStock !== false} onCheckedChange={v => updateItem(i, 'inStock', v)} className="scale-75" /></div>
                              <div className="flex items-center justify-between border-t pt-2"><Label className="text-[9px] font-bold uppercase">Detail Popup</Label><Switch checked={p.showDetailPopup !== false} onCheckedChange={v => updateItem(i, 'showDetailPopup', v)} className="scale-75" /></div>
                           </div>
                        </div>
                     </div>
                   )}
                </div>
              ))}
              <Button variant="outline" onClick={() => addItem('items', { id: crypto.randomUUID(), title: 'New Premium Item', price: 999, salePrice: 799, inStock: true, badgeEnabled: true, badgeText: 'BEST SELLER', cardBgType: 'solid', cardBgColor1: '#ffffff', cardShadow: 'xl', hoverEffect: 'lift', showDetailPopup: true })} className="w-full h-16 border-2 border-dashed rounded-[1.5rem] font-black text-xs uppercase gap-2 hover:bg-primary/5">+ Add New Entry</Button>
           </div>
        </div>
      )}

      {activeTab === 'narrative' && (
        <div className="space-y-6 animate-in slide-in-from-right-2">
           <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Section Display Heading</Label>
                <Input value={pageData.sectionTitle || ""} onChange={e => setPageData({...pageData, sectionTitle: e.target.value})} className="h-11 rounded-xl bg-white font-bold text-sm border-2" />
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
                     {pageData.highlightedBgType === 'gradient' && <div className="flex-1 space-y-1 animate-in zoom-in-95"><Label className="text-[8px] font-bold uppercase opacity-60">Color 2</Label><Input type="color" value={pageData.highlightedColor2 || pageData.themeColor} onChange={e => setPageData({...pageData, highlightedColor2: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white rounded-md" /></div>}
                </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Support Narrative</Label>
                <Textarea value={pageData.sectionDescription || ""} onChange={e => setPageData({...pageData, sectionDescription: e.target.value})} className="text-[11px] bg-white min-h-[100px] rounded-xl border-2" />
              </div>
           </div>
        </div>
      )}

      {activeTab === 'canvas' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2">
           <div className="p-5 bg-neutral-50 rounded-[2.5rem] border space-y-6">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase flex items-center gap-2"><Layout className="h-3.5 w-3.5 text-primary" /> Grid Architecture</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 1, label: 'Full Wide', icon: LayoutList },
                    { id: 2, label: '2-Columns', icon: LayoutGrid },
                    { id: 3, label: '3-Columns', icon: Columns3 },
                    { id: 4, label: '4-Columns', icon: Maximize2 }
                  ].map(l => (
                    <button key={l.id} onClick={() => setPageData({...pageData, columns: l.id})} className={cn("p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all", (pageData.columns || 3) === l.id ? "bg-primary border-primary text-white shadow-lg" : "bg-white hover:bg-neutral-50")}>
                       <l.icon className="h-4 w-4" />
                       <span className="text-[8px] font-black uppercase">{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Architecture (Split View)</Label>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border">
                     <div className="flex items-center gap-3"><div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Maximize2 className="h-4 w-4" /></div><span className="text-[10px] font-black uppercase">Enable Split</span></div>
                     <Switch checked={pageData.layoutSplit} onCheckedChange={v => setPageData({...pageData, layoutSplit: v})} />
                  </div>
                  {pageData.layoutSplit && (
                    <div className="flex gap-2 mt-3 animate-in slide-in-from-top-2">
                       <button onClick={() => setPageData({...pageData, splitPosition: 'left'})} className={cn("flex-1 h-10 rounded-xl border-2 text-[9px] font-black uppercase transition-all", (pageData.splitPosition || 'left') === 'left' ? "bg-primary text-white border-primary shadow-md" : "bg-white text-muted-foreground")}>Text Left</button>
                       <button onClick={() => setPageData({...pageData, splitPosition: 'right'})} className={cn("flex-1 h-10 rounded-xl border-2 text-[9px] font-black uppercase transition-all", pageData.splitPosition === 'right' ? "bg-primary text-white border-primary shadow-md" : "bg-white text-muted-foreground")}>Text Right</button>
                    </div>
                  )}
               </div>

              <div className="space-y-4 border-t pt-4">
                 <div className="flex items-center justify-between"><Label className="text-[10px] font-bold uppercase">Node Separation</Label><Badge variant="outline" className="text-[9px] font-mono">{pageData.itemGap || 24}px</Badge></div>
                 <Slider value={[pageData.itemGap || 24]} min={8} max={80} step={4} onValueChange={v => setPageData({...pageData, itemGap: v})} />
              </div>
           </div>
        </div>
      )}

      {activeTab === 'popup' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-2">
           <div className="p-6 bg-white rounded-[2.5rem] border-2 border-primary/20 space-y-8 shadow-xl">
             <div className="flex items-center gap-3 border-b pb-4">
                <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg"><MonitorSmartphone className="h-5 w-5" /></div>
                <div>
                   <h4 className="font-black text-sm uppercase tracking-tight text-primary">Detail Popup Studio</h4>
                   <p className="text-[8px] font-bold text-muted-foreground uppercase">Global Modal Configuration</p>
                </div>
             </div>

             <div className="space-y-10">
                {/* A. Popup Content Logic */}
                <div className="space-y-6">
                   <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Content Architecture</Label>
                   </div>
                   
                   <div className="space-y-3 bg-neutral-50 p-4 rounded-2xl border">
                      {[
                        { id: 'showPopupPrice', label: 'Display Price Node', icon: BadgeIndianRupee },
                        { id: 'showPopupDescription', label: 'Display Narrative', icon: Type },
                        { id: 'showPopupBadges', label: 'Display Status Badges', icon: Tag }
                      ].map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded-lg border shadow-sm">
                           <div className="flex items-center gap-2"><item.icon className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-[9px] font-bold uppercase">{item.label}</span></div>
                           <Switch checked={pageData[item.id] !== false} onCheckedChange={v => setPageData({...pageData, [item.id]: v})} className="scale-75" />
                        </div>
                      ))}
                   </div>

                   <div className="space-y-4">
                      <div className="space-y-1.5">
                         <Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Action Button Text</Label>
                         <Input 
                            value={pageData.popupBtnText || ""} 
                            onChange={e => setPageData({...pageData, popupBtnText: e.target.value})} 
                            placeholder="e.g. BUY THIS ITEM NOW" 
                            className="h-11 rounded-xl bg-neutral-50 border-none shadow-inner font-black text-sm" 
                         />
                      </div>
                      <div className="space-y-1.5">
                         <Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Trust Label Text</Label>
                         <Input 
                            value={pageData.popupTrustText || ""} 
                            onChange={e => setPageData({...pageData, popupTrustText: e.target.value})} 
                            placeholder="e.g. Instant UPI Redirection • 100% Secure" 
                            className="h-11 rounded-xl bg-neutral-50 border-none shadow-inner text-[10px] font-bold uppercase tracking-tighter" 
                         />
                         <div className="flex items-center justify-between pt-1">
                            <span className="text-[8px] font-bold uppercase text-muted-foreground opacity-50">Trust Tint</span>
                            <Input type="color" value={pageData.popupTrustTextColor || '#00000080'} onChange={e => setPageData({...pageData, popupTrustTextColor: e.target.value})} className="h-7 w-12 p-0 border-none bg-transparent cursor-pointer" />
                         </div>
                      </div>
                   </div>
                </div>

                <div className="h-px bg-neutral-100 w-full" />

                {/* B. Popup Visual Studio */}
                <div className="space-y-6">
                   <div className="flex items-center gap-3">
                      <Palette className="h-4 w-4 text-primary" />
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Backdrop Studio</Label>
                   </div>
                   <div className="space-y-4 p-4 bg-neutral-50 rounded-2xl border">
                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold uppercase text-muted-foreground">Blur Intensity</span>
                            <Badge variant="outline" className="text-[9px] font-mono">{pageData.popupBlur || 8}px</Badge>
                         </div>
                         <Slider value={[pageData.popupBlur || 8]} min={0} max={24} step={1} onValueChange={v => setPageData({...pageData, popupBlur: v[0]})} />
                         
                         <div className="flex items-center justify-between border-t pt-2">
                            <span className="text-[9px] font-bold uppercase text-muted-foreground">Overlay Opacity</span>
                            <Badge variant="outline" className="text-[9px] font-mono">{pageData.popupOverlayOpacity || 80}%</Badge>
                         </div>
                         <Slider value={[pageData.popupOverlayOpacity || 80]} min={0} max={100} step={5} onValueChange={v => setPageData({...pageData, popupOverlayOpacity: v[0]})} />
                         <div className="flex items-center justify-between">
                            <span className="text-[8px] font-bold uppercase opacity-40">Overlay Color</span>
                            <Input type="color" value={pageData.popupOverlayColor || '#000000'} onChange={e => setPageData({...pageData, popupOverlayColor: e.target.value})} className="h-7 w-12 p-0 border-none bg-transparent cursor-pointer" />
                         </div>
                      </div>
                   </div>
                </div>

                {/* C. Node Branding */}
                <div className="space-y-6">
                   <div className="flex items-center gap-3">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Media Presence</Label>
                   </div>
                   <div className="p-4 bg-white rounded-2xl border space-y-6 shadow-sm">
                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <Label className="text-[9px] font-bold uppercase">Image Radius</Label>
                            <Badge variant="outline" className="text-[9px] font-mono">{pageData.popupImageRadius || 24}px</Badge>
                         </div>
                         <Slider value={[pageData.popupImageRadius || 24]} min={0} max={64} step={4} onValueChange={v => setPageData({...pageData, popupImageRadius: v[0]})} />
                         
                         <div className="flex items-center justify-between border-t pt-2">
                           <Label className="text-[9px] font-bold uppercase">Image Shadow</Label>
                           <div className="grid grid-cols-3 gap-1">
                              {['none', 'md', 'xl'].map(lvl => (
                                <button key={lvl} onClick={() => setPageData({...pageData, popupImageShadow: lvl})} className={cn("px-2 py-1.5 rounded-lg border text-[8px] font-black uppercase transition-all", (pageData.popupImageShadow || 'xl') === lvl ? "bg-primary text-white border-primary shadow-sm" : "bg-neutral-50")}>{lvl}</button>
                              ))}
                           </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* D. Action Branding */}
                <div className="p-4 bg-primary/5 border-2 border-primary/10 rounded-2xl space-y-6">
                   <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Action Node (Popup)</Label>
                   </div>
                   <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                           <Label className="text-[8px] font-bold uppercase opacity-60">Button Tint</Label>
                           <Input type="color" value={pageData.popupBtnColor || pageData.themeColor || '#6750A4'} onChange={e => setPageData({...pageData, popupBtnColor: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white rounded-md cursor-pointer" />
                        </div>
                        <div className="space-y-1">
                           <Label className="text-[8px] font-bold uppercase opacity-60">Text Tint</Label>
                           <Input type="color" value={pageData.popupBtnTextColor || '#ffffff'} onChange={e => setPageData({...pageData, popupBtnTextColor: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white rounded-md cursor-pointer" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                         <Label className="text-[9px] font-bold uppercase">Button Style</Label>
                         <div className="grid grid-cols-3 gap-1">
                            {['solid', 'outline', 'ghost'].map(st => (
                              <button key={st} onClick={() => setPageData({...pageData, popupBtnStyle: st})} className={cn("px-2 py-1 rounded-md border text-[7px] font-black uppercase transition-all", (pageData.popupBtnStyle || 'solid') === st ? "bg-primary text-white border-primary shadow-sm" : "bg-white")}>{st}</button>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
             </div>
           </div>
        </div>
      )}

      {activeTab === 'surface' && (
        <div className="space-y-6 animate-in slide-in-from-top-2">
           <div className="p-5 bg-neutral-900 text-white rounded-[2.5rem] space-y-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12"><Paintbrush className="h-20 w-20 text-accent" /></div>
              <div className="space-y-6 relative z-10">
                 <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <Label className="text-[10px] font-black uppercase text-accent flex items-center gap-2"><Palette className="h-3.5 w-3.5" /> Stage Identity</Label>
                    <div className="flex items-center gap-2"><span className="text-[8px] font-bold opacity-60 uppercase">GRADIENT</span><Switch checked={pageData.sectionBgType === 'gradient'} onCheckedChange={v => setPageData({...pageData, sectionBgType: v ? 'gradient' : 'solid'})} className="scale-75" /></div>
                 </div>
                 <div className="flex gap-2">
                    <Input type="color" value={pageData.sectionBgColor1 || '#fafafa'} onChange={e => setPageData({...pageData, sectionBgColor1: e.target.value})} className="h-9 w-full p-0.5 border-none bg-white/10 rounded-lg cursor-pointer shadow-inner" />
                    {pageData.sectionBgType === 'gradient' && <Input type="color" value={pageData.sectionBgColor2 || '#ffffff'} onChange={e => setPageData({...pageData, sectionBgColor2: e.target.value})} className="h-9 w-full p-0.5 border-none bg-white/10 rounded-lg cursor-pointer shadow-inner animate-in zoom-in-95" />}
                 </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10 relative z-10">
                 <Label className="text-[10px] font-black uppercase text-accent flex items-center gap-2"><ImageIcon className="h-3.5 w-3.5" /> Section BG Image</Label>
                 <div 
                   className="relative aspect-video bg-white/5 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer overflow-hidden group hover:border-accent/40 transition-all shadow-inner relative" 
                   onClick={() => document.getElementById('product-section-bg-input')?.click()}
                 >
                    {pageData.sectionBgImage ? <img src={pageData.sectionBgImage} className="w-full h-full object-cover" alt="" /> : <UploadCloud className="h-6 w-6 opacity-20" />}
                    {uploadingField === 'sectionBgImage' && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 animate-in fade-in"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>}
                 </div>
                 <input type="file" id="product-section-bg-input" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'sectionBgImage')} />
                 {pageData.sectionBgImage && (
                    <div className="space-y-4 pt-4 animate-in fade-in">
                       <div className="flex items-center justify-between"><Label className="text-[9px] font-bold uppercase opacity-60">Overlay strength</Label><Badge variant="outline" className="text-accent border-accent/20 text-[9px] font-mono">{pageData.sectionBgOverlayOpacity || 0}%</Badge></div>
                       <Slider value={[pageData.sectionBgOverlayOpacity || 0]} min={0} max={100} step={5} onValueChange={v => setPageData({...pageData, sectionBgOverlayOpacity: v[0]})} />
                       <Button variant="ghost" className="w-full text-red-400 text-[10px] font-black uppercase h-10 hover:bg-red-500/10" onClick={() => setPageData({...pageData, sectionBgImage: ''})}><Trash2 className="h-3.5 w-3.5 mr-2" /> Remove Surface Asset</Button>
                    </div>
                 )}
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

      <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex gap-4">
         <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
         <p className="text-[10px] text-neutral-600 font-medium leading-relaxed italic">
           Deep Management: "Customizing popup content allows you to emphasize different sales triggers for different business models." 
         </p>
      </div>
    </div>
  );
}
