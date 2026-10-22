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
  BadgeIndianRupee, 
  Wallet, 
  ExternalLink, 
  ShieldCheck, 
  Info, 
  Palette, 
  Layers, 
  Paintbrush,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Zap,
  Target,
  Sparkles,
  CreditCard,
  CheckCircle2,
  BrainCircuit,
  Loader2,
  Bold,
  Italic,
  Strikethrough,
  Maximize2,
  Type,
  ImageIcon,
  UploadCloud,
  Trash2,
  Maximize
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateMicroSiteContent } from "@/ai/flows/ai-microsite-flow";
import { useToast } from "@/hooks/use-toast";

interface PaymentsTabProps {
  sectionId: string;
  pageData: any;
  globalAiContext?: any;
  setPageData: (data: any) => void;
  uploadingField: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
}

export function PaymentsTab({ sectionId, pageData, globalAiContext, setPageData, uploadingField, handleImageUpload }: PaymentsTabProps) {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<'content' | 'player' | 'stage' | 'spacing'>('content');
  const { toast } = useToast();

  const handleAiPaymentCopy = async () => {
    setIsAiLoading(true);
    try {
      const res = await generateMicroSiteContent({ 
        businessName: globalAiContext?.businessName || "Our Brand", 
        goal: globalAiContext?.goal || pageData.sectionTitle || "Product Sale Integration",
        audience: globalAiContext?.audience || "",
        offer: globalAiContext?.offer || "",
        description: globalAiContext?.description || "",
        tone: globalAiContext?.tone || "Professional",
        brandVibe: globalAiContext?.vibe || "Modern"
      });
      
      const paymentsSection = res.sections.find(s => s.type === 'payments');
      if (paymentsSection) {
        setPageData({
          ...pageData,
          ...paymentsSection.data
        });
        toast({ title: "Payment Narrative Ready" });
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
          onClick={handleAiPaymentCopy} 
          disabled={isAiLoading} 
          className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase border-2 gap-2"
        >
          {isAiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3 w-3 text-primary" />} 
          AI Smart Checkout
        </Button>
        <div className="flex bg-neutral-100 p-1 rounded-xl">
           <button onClick={() => setActiveMainTab('content')} className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", activeMainTab === 'content' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>Gateway</button>
           <button onClick={() => setActiveMainTab('stage')} className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", activeMainTab === 'stage' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>Stage</button>
           <button onClick={() => setActiveMainTab('spacing')} className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", activeMainTab === 'spacing' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>Space</button>
        </div>
      </div>

      {activeMainTab === 'content' && (
        <div className="space-y-6 animate-in slide-in-from-left-2">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Main Heading</Label>
              <Input 
                value={pageData.sectionTitle || ""} 
                onChange={(e) => setPageData({...pageData, sectionTitle: e.target.value})} 
                placeholder="e.g. Claim Your Access" 
                className="h-11 rounded-xl bg-white font-bold text-sm border-2" 
              />
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
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Subtext / Value Prop</Label>
              <Textarea 
                value={pageData.sectionDescription || ""} 
                onChange={(e) => setPageData({...pageData, sectionDescription: e.target.value})} 
                className="text-xs bg-white min-h-[80px] rounded-xl border-2" 
              />
            </div>
          </div>

          <div className="p-6 bg-emerald-50 rounded-[2.5rem] border-2 border-emerald-100 space-y-6">
            <div className="flex items-center justify-between border-b border-emerald-200/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                   <BadgeIndianRupee className="h-5 w-5" />
                </div>
                <h4 className="font-black text-sm uppercase tracking-tight text-emerald-900">Direct-to-Bank</h4>
              </div>
              <Switch checked={pageData.paymentEnabled} onCheckedChange={v => setPageData({...pageData, paymentEnabled: v})} />
            </div>
            
            {pageData.paymentEnabled && (
              <div className="space-y-5 animate-in slide-in-from-top-2">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-emerald-700 ml-1">Interaction Mode</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={pageData.paymentType === 'upi' ? 'default' : 'outline'} 
                      className="h-10 rounded-xl text-[10px] font-bold uppercase border-2 shadow-sm" 
                      onClick={() => setPageData({...pageData, paymentType: 'upi'})}
                    >
                      <Wallet className="h-3.5 w-3.5 mr-2" /> UPI Direct
                    </Button>
                    <Button 
                      variant={pageData.paymentType === 'link' ? 'default' : 'outline'} 
                      className="h-10 rounded-xl text-[10px] font-bold uppercase border-2 shadow-sm" 
                      onClick={() => setPageData({...pageData, paymentType: 'link'})}
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-2" /> External
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 bg-white/50 p-4 rounded-2xl border border-emerald-200">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase text-emerald-800">Product Name</Label>
                    <Input value={pageData.productName} onChange={(e) => setPageData({...pageData, productName: e.target.value})} className="h-10 bg-white rounded-xl text-sm font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase text-emerald-800">Price (INR)</Label>
                    <div className="relative">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-600">₹</span>
                       <Input type="number" value={pageData.productPrice} onChange={(e) => setPageData({...pageData, productPrice: Number(e.target.value)})} className="h-10 pl-7 bg-white rounded-xl font-black text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase text-emerald-800">{pageData.paymentType === 'upi' ? 'Payee UPI ID' : 'Checkout URL'}</Label>
                    <Input 
                      value={pageData.paymentType === 'upi' ? (pageData.upiId || "") : (pageData.externalPaymentUrl || "")} 
                      onChange={(e) => pageData.paymentType === 'upi' ? setPageData({...pageData, upiId: e.target.value}) : setPageData({...pageData, externalPaymentUrl: e.target.value})} 
                      className="h-10 bg-white rounded-xl text-xs font-mono" 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-blue-50 rounded-[2.5rem] border border-blue-100 space-y-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12"><ShieldCheck className="h-20 w-20 text-blue-600" /></div>
             <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
                      <ShieldCheck className="h-5 w-5" />
                   </div>
                   <h4 className="font-black text-sm uppercase tracking-tight text-blue-900">UTR Verification</h4>
                </div>
                <Switch checked={pageData.confirmationEnabled !== false} onCheckedChange={v => setPageData({...pageData, confirmationEnabled: v})} />
             </div>
             {pageData.confirmationEnabled !== false && (
               <div className="space-y-4 animate-in slide-in-from-top-2 relative z-10">
                  <div className="space-y-1.5">
                     <Label className="text-[9px] font-black uppercase text-blue-700 ml-1">Confirmation Headline</Label>
                     <Input 
                       value={pageData.confirmationHeadline || "Verify Payment"} 
                       onChange={(e) => setPageData({...pageData, confirmationHeadline: e.target.value})} 
                       className="h-10 rounded-xl bg-white text-xs font-bold" 
                     />
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-[9px] font-black uppercase text-blue-700 ml-1">Success Message</Label>
                     <Input 
                       value={pageData.successMessage || "Submission Received!"} 
                       onChange={(e) => setPageData({...pageData, successMessage: e.target.value})} 
                       className="h-10 rounded-xl bg-white text-xs font-bold" 
                     />
                  </div>
               </div>
             )}
          </div>
        </div>
      )}

      {activeMainTab === 'stage' && (
        <div className="space-y-6 animate-in slide-in-from-right-2">
          {/* Section Base Design */}
          <div className="p-5 bg-neutral-50 rounded-[2.5rem] border space-y-6">
            <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><Layers className="h-3.5 w-3.5" /> Stage Controls</Label>
            <div className="space-y-6">
               <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Title Alignment</Label>
                  <div className="flex gap-2">
                    {[ { id: 'left', icon: AlignLeft }, { id: 'center', icon: AlignCenter }, { id: 'right', icon: AlignRight } ].map(btn => (
                      <button key={btn.id} onClick={() => setPageData({...pageData, titleAlign: btn.id})} className={cn("h-11 flex-1 flex items-center justify-center rounded-xl border-2 transition-all", (pageData.titleAlign || 'center') === btn.id ? "bg-primary text-white border-primary shadow-lg" : "bg-white text-muted-foreground hover:bg-neutral-50")}><btn.icon className="h-4 w-4" /></button>
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

               <div className="p-5 bg-neutral-900 text-white rounded-[2rem] border-none space-y-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12"><Paintbrush className="h-20 w-20 text-accent" /></div>
                  <Label className="text-[10px] font-black uppercase text-accent tracking-widest flex items-center gap-2 relative z-10"><Paintbrush className="h-3.5 w-3.5" /> Stage Surface</Label>
                  <div className="space-y-4 relative z-10">
                     <div className="flex items-center justify-between"><Label className="text-[10px] font-bold uppercase opacity-60">Gradient Mode</Label><Switch checked={pageData.sectionBgType === 'gradient'} onCheckedChange={v => setPageData({...pageData, sectionBgType: v ? 'gradient' : 'solid'})} className="scale-75" /></div>
                     <div className="flex gap-2">
                        <Input type="color" value={pageData.sectionBgColor1 || '#fafafa'} onChange={e => setPageData({...pageData, sectionBgColor1: e.target.value})} className="h-10 w-full p-0.5 border-none bg-white/10 rounded-xl cursor-pointer" />
                        {pageData.sectionBgType === 'gradient' && <Input type="color" value={pageData.sectionBgColor2 || '#ffffff'} onChange={e => setPageData({...pageData, sectionBgColor2: e.target.value})} className="h-10 w-full p-0.5 border-none bg-white/10 rounded-xl cursor-pointer animate-in zoom-in-95" />}
                     </div>
                  </div>
                  <div className="space-y-4 pt-4 border-t border-white/10 relative z-10">
                    <Label className="text-[10px] font-black uppercase text-accent flex items-center gap-2"><ImageIcon className="h-3.5 w-3.5" /> Section BG Image</Label>
                    <div 
                      className="relative aspect-video bg-white/5 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer overflow-hidden group hover:border-accent/40 transition-all shadow-inner relative" 
                      onClick={() => document.getElementById('payment-bg-input')?.click()}
                    >
                        {pageData.sectionBgImage ? <img src={pageData.sectionBgImage} className="w-full h-full object-cover" alt="" /> : <UploadCloud className="h-6 w-6 opacity-20" />}
                        {uploadingField === 'sectionBgImage' && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 animate-in fade-in"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>}
                    </div>
                    <input type="file" id="payment-bg-input" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'sectionBgImage')} />
                    {pageData.sectionBgImage && (
                      <div className="space-y-4 pt-4 animate-in fade-in">
                          <div className="flex items-center justify-between"><Label className="text-[9px] font-bold uppercase opacity-60">Overlay Opacity</Label><Badge variant="outline" className="text-accent border-accent/20 text-[9px] font-mono">{pageData.sectionBgOverlayOpacity || 0}%</Badge></div>
                          <Slider value={[pageData.sectionBgOverlayOpacity || 0]} min={0} max={100} step={5} onValueChange={v => setPageData({...pageData, sectionBgOverlayOpacity: v[0]})} />
                          <Button variant="ghost" className="w-full text-red-400 text-[10px] font-black uppercase h-10 hover:bg-red-500/10" onClick={() => setPageData({...pageData, sectionBgImage: ''})}><Trash2 className="h-3.5 w-3.5 mr-2" /> Remove Image</Button>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>

          {/* Payment Node Designer */}
          <div className="p-6 bg-white rounded-[2.5rem] border-2 border-primary/20 space-y-8 shadow-xl">
             <div className="flex items-center gap-3 border-b pb-4">
                <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg"><CreditCard className="h-5 w-5" /></div>
                <div>
                   <h4 className="font-black text-sm uppercase tracking-tight text-primary">Node Designer</h4>
                   <p className="text-[8px] font-bold text-muted-foreground uppercase">Granular Styling Controls</p>
                </div>
             </div>
             
             <div className="space-y-6">
                <div className="p-4 bg-neutral-50 rounded-2xl border space-y-4">
                   <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Palette className="h-3.5 w-3.5" /> Node Background</Label>
                   <div className="flex items-center justify-between"><span className="text-[9px] font-bold">Node Gradient</span><Switch checked={pageData.cardBgType === 'gradient'} onCheckedChange={v => setPageData({...pageData, cardBgType: v ? 'gradient' : 'solid'})} className="scale-75" /></div>
                   <div className="flex gap-2">
                      <Input type="color" value={pageData.cardBgColor1 || '#ffffff'} onChange={e => setPageData({...pageData, cardBgColor1: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white rounded-lg cursor-pointer shadow-sm" />
                      {pageData.cardBgType === 'gradient' && <Input type="color" value={pageData.cardBgColor2 || '#ffffff'} onChange={e => setPageData({...pageData, cardBgColor2: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white rounded-lg cursor-pointer shadow-sm animate-in zoom-in-95" />}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-neutral-900 text-white rounded-2xl space-y-3">
                      <Label className="text-[9px] font-bold uppercase text-accent">Heading Tint</Label>
                      <Input type="color" value={pageData.cardTitleColor || '#111827'} onChange={e => setPageData({...pageData, cardTitleColor: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white/10 rounded-md" />
                   </div>
                   <div className="p-4 bg-neutral-900 text-white rounded-2xl space-y-3">
                      <Label className="text-[9px] font-bold uppercase text-accent">Button Tint</Label>
                      <Input type="color" value={pageData.btnColor || '#6750A4'} onChange={e => setPageData({...pageData, btnColor: e.target.value})} className="h-8 w-full p-0.5 border-none bg-white/10 rounded-md" />
                   </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border space-y-4 shadow-sm">
                   <div className="flex items-center justify-between"><Label className="text-[10px] font-bold uppercase">Shadow Depth</Label><div className="grid grid-cols-3 gap-1">{['none', 'md', 'xl'].map(lvl => (<button key={lvl} onClick={() => setPageData({...pageData, cardShadow: lvl})} className={cn("px-2 py-1 rounded-md border text-[8px] font-black uppercase transition-all", (pageData.cardShadow || 'xl') === lvl ? "bg-primary text-white border-primary shadow-sm" : "bg-neutral-50")}>{lvl}</button>))}</div></div>
                   <div className="flex items-center justify-between pt-2 border-t"><Label className="text-[10px] font-bold uppercase">Card Radius</Label><Badge variant="outline" className="text-[9px] font-mono">{pageData.cardRadius || 32}px</Badge></div>
                   <Slider value={[pageData.cardRadius || 32]} min={0} max={64} step={4} onValueChange={v => setPageData({...pageData, cardRadius: v[0]})} />
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

      <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 flex gap-4">
         <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
         <p className="text-[10px] text-emerald-800 font-medium leading-relaxed italic">
           Payments intelligence: "Direct UPI payments in India convert 4x faster than standard gateways." Use Split View for high-end landing pages.
         </p>
      </div>
    </div>
  );
}
