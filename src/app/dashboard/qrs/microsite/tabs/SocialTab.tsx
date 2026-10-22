
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
  Globe, 
  MessageSquare, 
  Zap,
  Palette,
  Target,
  Sparkles,
  Layers,
  Layout,
  LayoutList,
  LayoutGrid,
  Copy,
  ChevronDown,
  ChevronUp,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Paintbrush,
  Square,
  Circle,
  Info,
  Type,
  Maximize,
  MousePointer2,
  BrainCircuit,
  Loader2,
  Bold,
  Italic,
  Strikethrough,
  Tag,
  ImageIcon,
  UploadCloud,
  Trash2,
  Maximize2,
  Eye,
  EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateMicroSiteContent } from "@/ai/flows/ai-microsite-flow";
import { useToast } from "@/hooks/use-toast";

interface SocialTabProps {
  sectionId: string;
  pageData: any;
  globalAiContext?: any;
  setPageData: (data: any) => void;
  addItem: (field: string, item: any) => void;
  removeItem: (field: string, index: number) => void;
}

const SOCIAL_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', color: '#E4405F' },
  { id: 'whatsapp', name: 'WhatsApp', color: '#25D366' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000' },
  { id: 'twitter', name: 'X / Twitter', color: '#000000' },
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2' },
  { id: 'telegram', name: 'Telegram', color: '#26A5E4' },
  { id: 'sharechat', name: 'ShareChat', color: '#D83025' },
  { id: 'moj', name: 'Moj', color: '#FFD700' },
  { id: 'josh', name: 'Josh', color: '#E1306C' },
  { id: 'snapchat', name: 'Snapchat', color: '#FFFC00' },
  { id: 'threads', name: 'Threads', color: '#000000' },
  { id: 'zomato', name: 'Zomato', color: '#CB202D' },
  { id: 'swiggy', name: 'Swiggy', color: '#FC8019' },
  { id: 'website', name: 'Website', color: '#6750A4' }
];

export function SocialTab({ sectionId, pageData, globalAiContext, setPageData, addItem, removeItem }: SocialTabProps) {
  const [activeMainTab, setActiveMainTab] = useState<'narrative' | 'links' | 'surface' | 'spacing'>('links');
  const [expandedItem, setExpandedItem] = useState<number | null>(0);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { toast } = useToast();

  const handleAiSocial = async () => {
    setIsAiLoading(true);
    try {
      const res = await generateMicroSiteContent({ 
        businessName: globalAiContext?.businessName || "Our Brand", 
        goal: globalAiContext?.goal || pageData.socialSectionTitle || "Social Connect",
        audience: globalAiContext?.audience || "",
        offer: globalAiContext?.offer || "",
        description: globalAiContext?.description || "",
        tone: globalAiContext?.tone || "Professional",
        brandVibe: globalAiContext?.vibe || "Modern"
      });
      
      const socialSection = res.sections.find(s => s.type === 'social');
      if (socialSection) {
        setPageData({
          ...pageData,
          ...socialSection.data
        });
        toast({ title: "Social Strategy Synced" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "AI Forge Error" });
    } finally {
      setIsAiLoading(false);
    }
  };

  const updateLink = (index: number, key: string, value: any) => {
    if (!Array.isArray(pageData.socialLinks)) return;
    const newList = [...pageData.socialLinks];
    
    if (key === 'platform') {
      const platformData = SOCIAL_PLATFORMS.find(p => p.id === value);
      newList[index] = { 
        ...newList[index], 
        [key]: value,
        iconBgColor1: platformData?.color || '#6750A4'
      };
    } else {
      newList[index] = { ...newList[index], [key]: value };
    }
    
    setPageData({ ...pageData, socialLinks: newList });
  };

  const duplicateLink = (index: number) => {
    if (!Array.isArray(pageData.socialLinks)) return;
    const original = pageData.socialLinks[index];
    const newList = [...pageData.socialLinks];
    newList.splice(index + 1, 0, { ...original, id: crypto.randomUUID() });
    setPageData({ ...pageData, socialLinks: newList });
    setExpandedItem(index + 1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={handleAiSocial} 
          disabled={isAiLoading} 
          className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase border-2 gap-2"
        >
          {isAiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3 w-3 text-primary" />} 
          AI Smart Connect
        </Button>
        <div className="flex bg-neutral-100 p-1 rounded-xl">
          {['narrative', 'links', 'surface', 'spacing'].map(t => (
             <button key={t} onClick={() => setActiveMainTab(t as any)} className={cn("px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all", activeMainTab === t ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:bg-white/50")}>{t}</button>
          ))}
        </div>
      </div>

      {activeMainTab === 'narrative' && (
        <div className="space-y-6 animate-in slide-in-from-left-2">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Main Heading</Label>
              <Input value={pageData.socialSectionTitle || ""} onChange={e => setPageData({...pageData, socialSectionTitle: e.target.value})} className="h-11 rounded-xl bg-white font-bold text-sm border-2" />
            </div>

            <div className="p-5 bg-emerald-50 rounded-[2.5rem] border-2 border-emerald-100 space-y-4">
               <div className="flex items-center gap-3 border-b border-emerald-200/50 pb-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg"><MessageSquare className="h-5 w-5" /></div>
                  <h4 className="font-black text-sm uppercase tracking-tight text-emerald-900">WhatsApp Automation</h4>
               </div>
               <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase text-emerald-700 ml-1">Pre-filled Enquiry Message</Label>
                  <Textarea 
                    value={pageData.whatsappMessage || ""} 
                    onChange={e => setPageData({...pageData, whatsappMessage: e.target.value})} 
                    placeholder="Hello, I am interested in..." 
                    className="h-24 rounded-xl bg-white border-none shadow-inner text-[11px] leading-relaxed"
                  />
               </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Narrative Description</Label>
              <Textarea value={pageData.sectionDescription || ""} onChange={e => setPageData({...pageData, sectionDescription: e.target.value})} className="text-xs bg-white min-h-[80px] rounded-xl border-2" />
            </div>
          </div>
        </div>
      )}

      {activeMainTab === 'links' && (
        <div className="space-y-4 animate-in slide-in-from-right-2">
           {Array.isArray(pageData.socialLinks) && pageData.socialLinks.map((link: any, i: number) => (
              <div key={i} className={cn("bg-white border-2 rounded-[2rem] overflow-hidden transition-all duration-500", expandedItem === i ? "border-primary shadow-2xl" : "border-neutral-100")}>
                <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedItem(expandedItem === i ? null : i)}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div 
                      className="h-10 w-10 rounded-xl flex items-center justify-center border overflow-hidden p-2 shadow-sm"
                      style={{ background: link.iconBgType === 'gradient' ? `linear-gradient(135deg, ${link.iconBgColor1 || '#6750A4'}, ${link.iconBgColor2 || '#6750A4'})` : (link.iconBgColor1 || '#6750A4') }}
                    >
                      <img src={`https://cdn.simpleicons.org/${link.platform}/ffffff`} className="w-full h-full object-contain" alt="" />
                    </div>
                    <p className="text-[11px] font-black text-foreground truncate max-w-[140px] uppercase">{link.platform || "New Node"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); duplicateLink(i); }} className="h-8 w-8 flex items-center justify-center text-primary hover:bg-primary/5 rounded-full"><Copy className="h-3.5 w-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); removeItem('socialLinks', i); }} className="h-8 w-8 flex items-center justify-center text-destructive hover:bg-red-50 rounded-full"><X className="h-3.5 w-3.5" /></button>
                    {expandedItem === i ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
                {expandedItem === i && (
                  <div className="px-5 pb-8 space-y-8 animate-in slide-in-from-top-2 border-t pt-6 bg-neutral-50/50">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5"><Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Platform</Label><select value={link.platform} onChange={e => updateLink(i, 'platform', e.target.value)} className="w-full bg-white border-2 rounded-xl h-10 px-3 text-[10px] font-bold outline-none">{SOCIAL_PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                       <div className="space-y-1.5"><Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Handle / URL</Label><Input value={link.url} onChange={e => updateLink(i, 'url', e.target.value)} placeholder="@username" className="h-10 rounded-xl bg-white text-xs font-bold" /></div>
                    </div>
                  </div>
                )}
              </div>
           ))}
           <Button variant="outline" onClick={() => addItem('socialLinks', { platform: 'instagram', url: '', showLabel: true, cardBgType: 'solid', cardBgColor1: '#ffffff', iconBgType: 'solid', iconBgColor1: '#E4405F', iconColor: '#ffffff', titleColor: '#111827', cardShadow: 'xl', hoverEffect: 'lift', iconShape: 'rounded', iconSize: 40, cardTextAlign: 'left', cardBorderWidth: 0, cardBorderColor: '#eeeeee', showGlow: true, showPulse: false })} className="w-full h-14 border-2 border-dashed rounded-[1.5rem] font-black text-xs uppercase gap-2 hover:bg-primary/5 transition-all">+ Add Connection Node</Button>
        </div>
      )}

      {activeMainTab === 'surface' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2">
           <div className="p-5 bg-neutral-50 rounded-[2.5rem] border space-y-6">
            <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><Layout className="h-3.5 w-3.5" /> Stage Controls</Label>
            <div className="space-y-6">
               <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Header Alignment</Label>
                  <div className="flex gap-2">
                    {[ { id: 'left', icon: AlignLeft }, { id: 'center', icon: AlignCenter }, { id: 'right', icon: AlignRight } ].map(btn => (
                      <button key={btn.id} onClick={() => setPageData({...pageData, titleAlign: btn.id})} className={cn("h-11 flex-1 flex items-center justify-center rounded-xl border-2 transition-all", (pageData.titleAlign || 'center') === btn.id ? "bg-primary text-white border-primary shadow-lg" : "bg-white text-muted-foreground hover:bg-neutral-50")}><btn.icon className="h-4 w-4" /></button>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
