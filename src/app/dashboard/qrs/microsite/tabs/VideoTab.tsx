"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Loader2, 
  Play, 
  Youtube, 
  Link2,
  Info,
  Monitor,
  BrainCircuit,
  Layers,
  Paintbrush,
  Maximize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Bold,
  Italic,
  ImageIcon,
  UploadCloud,
  Trash2,
  Type,
  Maximize
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateMicroSiteContent } from "@/ai/flows/ai-microsite-flow";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

interface VideoTabProps {
  sectionId: string;
  pageData: any;
  setPageData: (data: any) => void;
  uploadingField: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string, index?: number) => void;
  globalAiContext?: any;
}

export function VideoTab({ pageData, setPageData, uploadingField, handleImageUpload, sectionId, globalAiContext }: VideoTabProps) {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<'content' | 'player' | 'stage' | 'spacing'>('content');
  const { toast } = useToast();

  const handleAiVideoCopy = async () => {
    setIsAiLoading(true);
    try {
      const res = await generateMicroSiteContent({ 
        businessName: globalAiContext?.businessName || "Business", 
        goal: pageData.sectionTitle || "Video Engagement" 
      });
      
      const videoSection = res.sections.find(s => s.type === 'video');
      if (videoSection) {
        setPageData({
          ...pageData,
          ...videoSection.data
        });
        toast({ title: "Narrative Optimized" });
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
          onClick={handleAiVideoCopy} 
          disabled={isAiLoading} 
          className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase border-2 gap-2"
        >
          {isAiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3 w-3 text-primary" />} 
          AI Smart Video
        </Button>
      </div>

      <div className="flex flex-wrap gap-1 p-1 bg-neutral-100 rounded-xl">
           {['content', 'player', 'stage', 'spacing'].map((tab) => (
             <button 
              key={tab} 
              onClick={() => setActiveMainTab(tab as any)} 
              className={cn("flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all", activeMainTab === tab ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}
             >
               {tab}
             </button>
           ))}
      </div>

      {activeMainTab === 'content' && (
        <div className="space-y-6 animate-in slide-in-from-left-2">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Main Heading</Label>
              <Input value={pageData.sectionTitle || ""} onChange={e => setPageData({...pageData, sectionTitle: e.target.value})} className="h-11 rounded-xl bg-white font-bold text-sm border-2" />
            </div>

            <div className="space-y-4 p-5 bg-primary/5 rounded-[2rem] border-2 border-primary/10">
              <div className="flex items-center justify-between border-b border-primary/10 pb-3 mb-3">
                 <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Highlights Ultra</Label>
                 <div className="flex items-center gap-2"><span className="text-[8px] font-bold text-muted-foreground uppercase">Gradient</span><Switch checked={pageData.highlightedBgType === 'gradient'} onCheckedChange={v => setPageData({...pageData, highlightedBgType: v ? 'gradient' : 'solid'})} className="scale-75" /></div>
              </div>
              <div className="space-y-4">
                <Input value={pageData.highlightedText || ""} onChange={e => setPageData({...pageData, highlightedText: e.target.value})} placeholder="Words to highlight..." className="h-10 rounded-xl bg-white font-black text-primary text-sm" />
                
                <div className="p-3 bg-white rounded-xl border space-y-3">
                   <div className="flex items-center justify-between gap-2">
                      <div className="flex gap-1 bg-neutral-100 p-0.5 rounded-lg">
                         <button onClick={() => setPageData({...pageData, highlightBold: !pageData.highlightBold})} className={cn("h-7 w-7 flex items-center justify-center rounded transition-all", pageData.highlightBold ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}><Bold className="h-3.5 w-3.5" /></button>
                         <button onClick={() => setPageData({...pageData, highlightItalic: !pageData.highlightItalic})} className={cn("h-7 w-7 flex items-center justify-center rounded transition-all", pageData.highlightItalic ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}><Italic className="h-3.5 w-3.5" /></button>
                      </div>
                      <select value={pageData.highlightCase || 'none'} onChange={e => setPageData({...pageData, highlightCase: e.target.value})} className="bg-neutral-100 rounded-lg h-8 px-2 text-[8px] font-black uppercase outline-none"><option value="none">Original</option><option value="uppercase">ALL CAPS</option><option value="capitalize">Capitalize</option></select>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-[8px] font-bold uppercase">Style</Label><select value={pageData.highlightStyle || 'text'} onChange={e => setPageData({...pageData, highlightStyle: e.target.value})} className="w-full bg-white border rounded-lg h-9 px-2 text-[9px] font-black uppercase"><option value="text">Text Only</option><option value="underline">Underline</option><option value="pill">Pill</option></select></div>
                  <div className="space-y-2 flex flex-col justify-end"><div className="flex items-center justify-between p-1.5 bg-white rounded-lg border"><span className="text-[8px] font-bold uppercase">Glow</span><Switch checked={pageData.highlightGlow} onCheckedChange={v => setPageData({...pageData, highlightGlow: v})} className="scale-50" /></div></div>
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
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Description Narrative</Label>
              <Textarea value={pageData.sectionDescription || ""} onChange={e => setPageData({...pageData, sectionDescription: e.target.value})} className="text-xs bg-white min-h-[80px] rounded-xl border-2" />
            </div>

            <div className="p-6 bg-neutral-900 text-white rounded-[2rem] space-y-6 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-700"><Youtube className="h-20 w-20 text-accent" /></div>
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                   <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-red-500 shadow-lg"><Play className="h-5 w-5 fill-current" /></div>
                   <h4 className="font-black text-sm uppercase tracking-tight">Media Source</h4>
                </div>
                <div className="space-y-3">
                   <Label className="text-[8px] font-bold uppercase text-white/40 ml-1">URL (YouTube / Vimeo / Shorts)</Label>
                   <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                      <Input value={pageData.videoUrl || ""} onChange={e => setPageData({...pageData, videoUrl: e.target.value})} placeholder="https://youtube.com/..." className="h-12 pl-10 bg-white/5 border-white/10 text-white rounded-xl text-xs font-mono" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeMainTab === 'player' && (
        <div className="space-y-6 animate-in slide-in-from-right-2">
           <div className="p-5 bg-neutral-50 rounded-[2.5rem] border space-y-6">
              <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><Monitor className="h-3.5 w-3.5" /> Player Canvas</Label>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase">Aspect Ratio</Label>
                    <div className="grid grid-cols-2 gap-2">
                       {['video', 'classic', 'square', 'vertical'].map(r => (
                         <button key={r} onClick={() => setPageData({...pageData, videoAspectRatio: r})} className={cn("p-2 rounded-lg border-2 text-[8px] font-black uppercase transition-all", (pageData.videoAspectRatio || 'video') === r ? "bg-primary text-white border-primary" : "bg-white")}>{r}</button>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between"><Label className="text-[10px] font-bold uppercase">Player Radius</Label><Badge variant="outline" className="text-[9px] font-mono">{pageData.playerRadius || 24}px</Badge></div>
                    <Slider value={[pageData.playerRadius || 24]} min={0} max={64} step={4} onValueChange={v => setPageData({...pageData, playerRadius: v[0]})} />
                 </div>
                 <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between"><Label className="text-[10px] font-bold uppercase">Shadow Depth</Label><div className="grid grid-cols-3 gap-1">{['none', 'md', 'xl'].map(lvl => (<button key={lvl} onClick={() => setPageData({...pageData, playerShadow: lvl})} className={cn("px-2 py-1.5 rounded-lg border text-[8px] font-black uppercase transition-all", (pageData.playerShadow || 'xl') === lvl ? "bg-primary text-white border-primary shadow-sm" : "bg-neutral-50")}>{lvl}</button>))}</div></div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeMainTab === 'stage' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2">
           <div className="p-5 bg-neutral-50 rounded-[2.5rem] border space-y-6">
              <div className="space-y-4">
                 <Label className="text-[10px] font-black uppercase flex items-center gap-2"><AlignLeft className="h-3.5 w-3.5" /> Text Alignment</Label>
                 <div className="flex gap-2">
                   {[ { id: 'left', icon: AlignLeft }, { id: 'center', icon: AlignCenter }, { id: 'right', icon: AlignRight } ].map(btn => (
                     <button key={btn.id} onClick={() => setPageData({...pageData, titleAlign: btn.id})} className={cn("h-10 flex-1 flex items-center justify-center rounded-xl border-2 transition-all", (pageData.titleAlign || 'center') === btn.id ? "bg-primary text-white border-primary shadow-lg" : "bg-white text-muted-foreground hover:bg-neutral-50")}><btn.icon className="h-4 w-4" /></button>
                   ))}
                 </div>
              </div>
           </div>
           <div className="p-5 bg-neutral-900 text-white rounded-[2rem] space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12"><Paintbrush className="h-20 w-20 text-accent" /></div>
              <Label className="text-[10px] font-black uppercase text-accent tracking-widest flex items-center gap-2 relative z-10"><Paintbrush className="h-3.5 w-3.5" /> Stage Surface</Label>
              <div className="space-y-4 relative z-10">
                 <div className="flex items-center justify-between"><Label className="text-[10px] font-bold uppercase opacity-60">Gradient Mode</Label><Switch checked={pageData.sectionBgType === 'gradient'} onCheckedChange={v => setPageData({...pageData, sectionBgType: v ? 'gradient' : 'solid'})} className="scale-75" /></div>
                 <div className="flex gap-2">
                    <Input type="color" value={pageData.sectionBgColor1 || '#fafafa'} onChange={e => setPageData({...pageData, sectionBgColor1: e.target.value})} className="h-10 w-full p-0.5 border-none bg-white/10 rounded-lg cursor-pointer" />
                    {pageData.sectionBgType === 'gradient' && <Input type="color" value={pageData.sectionBgColor2 || '#ffffff'} onChange={e => setPageData({...pageData, sectionBgColor2: e.target.value})} className="h-10 w-full p-0.5 border-none bg-white/10 rounded-lg cursor-pointer animate-in zoom-in-95" />}
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeMainTab === 'spacing' && (
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
           Video nodes are essential for high-fidelity demos. Use 'Vertical' aspect for Instagram Reels or TikTok-style content.
         </p>
      </div>
    </div>
  );
}
