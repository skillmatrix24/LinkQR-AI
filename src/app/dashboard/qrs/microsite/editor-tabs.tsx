'use client';

import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Trash2, 
  Plus, 
  X, 
  Link2, 
  UploadCloud, 
  Loader2, 
  Monitor, 
  Smartphone, 
  BadgeIndianRupee, 
  Wallet, 
  ExternalLink,
  Palette,
  Scale,
  FileText,
  Globe,
  Star,
  Zap,
  Info,
  Image as ImageIcon,
  ListOrdered
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorTabsProps {
  pageData: any;
  setPageData: (data: any) => void;
  uploadingField: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string, index?: number) => void;
  addItem: (field: string, item: any) => void;
  removeItem: (field: string, index: number) => void;
  updateItem: (field: string, index: number, key: string, value: any) => void;
}

/** 1. Identity Tab: Manage Brand, Logo & FAB */
export function IdentityTab({ pageData, setPageData, uploadingField, handleImageUpload }: EditorTabsProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2"><Link2 className="h-3.5 w-3.5" /> Permalink Slug</Label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground opacity-40">/s/</div>
          <Input 
            value={pageData.slug || ""} 
            onChange={e => setPageData({...pageData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')})} 
            placeholder="my-business-offer" 
            className="h-11 rounded-xl pl-10 font-bold text-sm"
          />
        </div>
      </div>

      <div className="p-5 bg-neutral-50 rounded-[2rem] border space-y-6">
        <div className="flex items-center justify-between">
          <Label className="font-black text-[10px] sm:text-xs uppercase tracking-widest">Header CTA Button</Label>
          <Switch checked={pageData.headerCtaEnabled} onCheckedChange={v => setPageData({...pageData, headerCtaEnabled: v})} />
        </div>
        {pageData.headerCtaEnabled && (
          <div className="space-y-4 animate-in slide-in-from-top-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase">Button Text</Label>
              <Input value={pageData.headerCtaText} onChange={e => setPageData({...pageData, headerCtaText: e.target.value})} placeholder="e.g. Book Now" className="h-10 bg-white rounded-xl text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase">Redirect URL (Optional)</Label>
              <Input value={pageData.headerCtaUrl || ""} onChange={e => setPageData({...pageData, headerCtaUrl: e.target.value})} placeholder="https://..." className="h-10 bg-white rounded-xl text-xs" />
            </div>
          </div>
        )}
      </div>

      <div className="p-5 bg-neutral-50 rounded-[2rem] border space-y-6">
        <div className="flex items-center justify-between">
          <Label className="font-black text-[10px] sm:text-xs uppercase tracking-widest">Floating Action Button</Label>
          <Switch checked={pageData.floatingActionEnabled} onCheckedChange={v => setPageData({...pageData, floatingActionEnabled: v})} />
        </div>
        {pageData.floatingActionEnabled && (
          <div className="space-y-4 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-3 gap-2">
              {['whatsapp', 'phone', 'link'].map(type => (
                <Button key={type} size="sm" variant={pageData.floatingActionType === type ? 'default' : 'outline'} onClick={() => setPageData({...pageData, floatingActionType: type})} className="text-[9px] uppercase font-bold rounded-lg h-8">{type}</Button>
              ))}
            </div>
            <Input value={pageData.floatingActionValue} onChange={e => setPageData({...pageData, floatingActionValue: e.target.value})} placeholder={pageData.floatingActionType === 'phone' ? 'Phone Number' : 'URL or Username'} className="h-10 bg-white rounded-xl text-sm" />
          </div>
        )}
      </div>

      <div className="space-y-6 p-5 border-2 border-dashed rounded-[2rem] bg-neutral-50/50">
        <Label className="text-[10px] font-black uppercase text-muted-foreground">Brand Identity & Logo</Label>
        {pageData.logoUrl ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 transition-all">
            <div className="relative h-16 w-16 bg-white rounded-xl shadow-inner p-2 border flex items-center justify-center overflow-hidden">
              <img src={pageData.logoUrl} className="max-h-full max-w-full object-contain" alt="" />
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={() => document.getElementById('microsite-logo-input')?.click()} className="flex-1 sm:flex-none rounded-xl h-10 px-4 font-bold text-[10px]">Change</Button>
              <Button variant="ghost" size="icon" onClick={() => setPageData({...pageData, logoUrl: ''})} className="h-10 w-10 rounded-xl text-destructive hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ) : (
          <div className="relative h-24 bg-white rounded-[1.5rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer group hover:border-primary/40 transition-all" onClick={() => document.getElementById('microsite-logo-input')?.click()}>
            <div className="flex flex-col items-center gap-2">
              {uploadingField === 'logoUrl' ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <UploadCloud className="h-6 w-6 opacity-20 group-hover:opacity-100" />}
              <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest text-center">Upload Logo</span>
            </div>
          </div>
        )}
        <input type="file" id="microsite-logo-input" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logoUrl')} />
        
        {pageData.logoUrl && (
          <div className="space-y-6 pt-6 border-t animate-in fade-in">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[9px] font-bold uppercase flex items-center gap-2"><Monitor className="h-3.5 w-3.5" /> Desktop Logo Height</Label>
                <Badge variant="outline" className="font-mono text-[9px]">{pageData.logoHeight}px</Badge>
              </div>
              <Slider defaultValue={[pageData.logoHeight || 32]} min={10} max={120} step={1} onValueChange={(v) => setPageData({...pageData, logoHeight: v[0]})} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[9px] font-bold uppercase flex items-center gap-2"><Smartphone className="h-3.5 w-3.5" /> Mobile Logo Height</Label>
                <Badge variant="outline" className="font-mono text-[9px]">{pageData.logoHeightMobile}px</Badge>
              </div>
              <Slider defaultValue={[pageData.logoHeightMobile || 28]} min={10} max={80} step={1} onValueChange={(v) => setPageData({...pageData, logoHeightMobile: v[0]})} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** 2. Payments Tab: Accept UPI or Links */
export function PaymentsTab({ pageData, setPageData }: EditorTabsProps) {
  return (
    <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><BadgeIndianRupee className="h-6 w-6 text-emerald-600" /><h4 className="font-black text-xs uppercase tracking-tight">Direct Payments</h4></div>
        <Switch checked={pageData.paymentEnabled} onCheckedChange={v => setPageData({...pageData, paymentEnabled: v})} />
      </div>
      {pageData.paymentEnabled && (
        <div className="space-y-4 pt-4 border-t border-emerald-100">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase">Payment Mode</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant={pageData.paymentType === 'upi' ? 'default' : 'outline'} className="h-10 rounded-xl text-[10px] font-bold uppercase" onClick={() => setPageData({...pageData, paymentType: 'upi'})}><Wallet className="h-3.5 w-3.5 mr-2" /> UPI Direct</Button>
              <Button variant={pageData.paymentType === 'link' ? 'default' : 'outline'} className="h-10 rounded-xl text-[10px] font-bold uppercase" onClick={() => setPageData({...pageData, paymentType: 'link'})}><ExternalLink className="h-3.5 w-3.5 mr-2" /> Link</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase">Product Name</Label>
            <Input value={pageData.productName} onChange={e => setPageData({...pageData, productName: e.target.value})} className="h-10 bg-white rounded-xl text-sm" placeholder="e.g. Special Offer" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase">Price (INR)</Label>
            <Input type="number" value={pageData.productPrice} onChange={e => setPageData({...pageData, productPrice: Number(e.target.value)})} className="h-10 bg-white rounded-xl font-black text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase">{pageData.paymentType === 'upi' ? 'UPI ID' : 'URL'}</Label>
            <Input value={pageData.paymentType === 'upi' ? (pageData.upiId || "") : (pageData.externalPaymentUrl || "")} onChange={e => pageData.paymentType === 'upi' ? setPageData({...pageData, upiId: e.target.value}) : setPageData({...pageData, externalPaymentUrl: e.target.value})} placeholder={pageData.paymentType === 'upi' ? "name@okaxis" : "https://..." } className="h-10 bg-white rounded-xl text-sm" />
          </div>
        </div>
      )}
    </div>
  );
}

/** 3. Hero Tab: Headline & Hero Image */
export function HeroTab({ pageData, setPageData, uploadingField, handleImageUpload }: EditorTabsProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase">Main Headline</Label>
        <Input value={pageData.headline} onChange={e => setPageData({...pageData, headline: e.target.value})} placeholder="Headline" className="h-11 rounded-xl font-bold text-sm" />
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase">Subheadline</Label>
        <Textarea value={pageData.subheadline} onChange={e => setPageData({...pageData, subheadline: e.target.value})} placeholder="Detailed subtext..." className="rounded-xl min-h-[80px] text-sm" />
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase">Hero Asset</Label>
        <div className="relative aspect-video bg-neutral-50 rounded-2xl border border-dashed flex items-center justify-center cursor-pointer overflow-hidden group hover:bg-neutral-100 transition-all" onClick={() => document.getElementById('microsite-hero-input')?.click()}>
          {pageData.heroImage ? <img src={pageData.heroImage} className="w-full h-full object-cover" alt="" /> : <UploadCloud className="h-8 w-8 opacity-30" />}
          {uploadingField === 'heroImage' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}
        </div>
        <input type="file" id="microsite-hero-input" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'heroImage')} />
      </div>
    </div>
  );
}

/** 4. Details Tab: Benefits & Advantages */
export function DetailsTab({ pageData, setPageData, addItem, removeItem }: EditorTabsProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Key Advantages</Label>
      {pageData.benefits?.map((b: string, i: number) => (
        <div key={i} className="flex gap-2 animate-in zoom-in-95"><Input value={b} onChange={e => { const newList = [...pageData.benefits]; newList[i] = e.target.value; setPageData({...pageData, benefits: newList}); }} className="h-10 rounded-xl text-sm" /><Button variant="ghost" size="icon" onClick={() => removeItem('benefits', i)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button></div>
      ))}
      <Button variant="outline" size="sm" onClick={() => addItem('benefits', 'New Benefit')} className="w-full border-dashed rounded-xl h-11 font-bold text-xs uppercase">+ Add Advantage</Button>
    </div>
  );
}

/** 5. Steps Tab: Process Flow (How it Works) */
export function StepsTab({ pageData, addItem, removeItem, updateItem }: EditorTabsProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Label className="text-[10px] font-black uppercase text-primary tracking-widest">The Process (Steps)</Label>
      {pageData.howItWorks?.map((h: any, i: number) => (
        <div key={i} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-2 relative group animate-in slide-in-from-top-2">
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-destructive opacity-0 group-hover:opacity-100" onClick={() => removeItem('howItWorks', i)}><X className="h-3 w-3" /></Button>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white border flex items-center justify-center font-black text-xs shadow-sm">{h.step || (i+1)}</div>
            <Input value={h.title} onChange={e => updateItem('howItWorks', i, 'title', e.target.value)} placeholder="Step Title" className="h-9 bg-white text-sm font-bold" />
          </div>
          <Textarea value={h.desc} onChange={e => updateItem('howItWorks', i, 'desc', e.target.value)} className="text-xs bg-white min-h-[60px]" placeholder="Short description..." />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => addItem('howItWorks', { step: (pageData.howItWorks?.length || 0) + 1, title: '', desc: '' })} className="w-full border-dashed rounded-xl h-11 font-bold text-xs uppercase">+ Add Step</Button>
    </div>
  );
}

/** 6. Features Tab: Product Highlights */
export function FeaturesTab({ pageData, addItem, removeItem, updateItem }: EditorTabsProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Highlights</Label>
      {pageData.features?.map((f: any, i: number) => (
        <div key={i} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-2 relative group">
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-destructive opacity-0 group-hover:opacity-100" onClick={() => removeItem('features', i)}><X className="h-3 w-3" /></Button>
          <Input value={f.title} onChange={e => updateItem('features', i, 'title', e.target.value)} placeholder="Feature Name" className="h-9 bg-white text-sm font-bold" />
          <Textarea value={f.content} onChange={e => updateItem('features', i, 'content', e.target.value)} className="text-xs bg-white min-h-[60px]" />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => addItem('features', { title: '', content: '', icon: 'zap' })} className="w-full border-dashed rounded-xl h-11 font-bold text-xs uppercase">+ Add Feature</Button>
    </div>
  );
}

/** 7. Social Tab: Digital Links */
export function SocialTab({ pageData, addItem, removeItem, updateItem }: EditorTabsProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Social Footprint</Label>
      {pageData.socialLinks?.map((link: any, i: number) => (
        <div key={i} className="flex gap-3 items-end bg-neutral-50 p-4 rounded-xl border border-neutral-100">
          <div className="flex-1 space-y-2">
            <select value={link.platform} onChange={e => updateItem('socialLinks', i, 'platform', e.target.value)} className="w-full bg-white border rounded-lg h-10 px-3 text-[10px] font-bold">
              <option value="instagram">Instagram</option><option value="facebook">Facebook</option><option value="twitter">X (Twitter)</option><option value="youtube">YouTube</option><option value="linkedin">LinkedIn</option>
            </select>
            <Input value={link.url} onChange={e => updateItem('socialLinks', i, 'url', e.target.value)} placeholder="Username or Link" className="h-10 text-[10px]" />
          </div>
          <Button variant="ghost" size="icon" onClick={() => removeItem('socialLinks', i)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => addItem('socialLinks', { platform: 'instagram', url: '' })} className="w-full border-dashed rounded-xl h-11 font-bold text-xs uppercase">+ Add Platform</Button>
    </div>
  );
}

/** 8. Reviews Tab: Customer Proof */
export function ReviewsTab({ pageData, addItem, removeItem, updateItem }: EditorTabsProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Social Proof</Label>
      {pageData.reviews?.map((r: any, i: number) => (
        <div key={i} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-2 relative group">
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-destructive opacity-0 group-hover:opacity-100" onClick={() => removeItem('reviews', i)}><X className="h-3 w-3" /></Button>
          <Input value={r.name} onChange={e => updateItem('reviews', i, 'name', e.target.value)} placeholder="Customer Name" className="h-9 bg-white text-sm font-bold" />
          <Textarea value={r.comment} onChange={e => updateItem('reviews', i, 'comment', e.target.value)} className="text-xs bg-white min-h-[60px]" placeholder="Feedback..." />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => addItem('reviews', { name: '', comment: '', rating: 5 })} className="w-full border-dashed rounded-xl h-11 font-bold text-xs uppercase">+ Add Review</Button>
    </div>
  );
}

/** 9. FAQ Tab: Help Center */
export function FAQTab({ pageData, addItem, removeItem, updateItem }: EditorTabsProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Label className="text-[10px] font-black uppercase text-primary tracking-widest">FAQ Hub</Label>
      {pageData.faqs?.map((f: any, i: number) => (
        <div key={i} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-2 relative group">
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-destructive opacity-0 group-hover:opacity-100" onClick={() => removeItem('faqs', i)}><X className="h-3 w-3" /></Button>
          <Input value={f.question} onChange={e => updateItem('faqs', i, 'question', e.target.value)} placeholder="Question" className="h-9 bg-white text-sm font-bold" />
          <Textarea value={f.answer} onChange={e => updateItem('faqs', i, 'answer', e.target.value)} className="text-xs bg-white min-h-[60px]" placeholder="Answer..." />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => addItem('faqs', { question: '', answer: '' })} className="w-full border-dashed rounded-xl h-11 font-bold text-xs uppercase">+ Add FAQ</Button>
    </div>
  );
}

/** 10. Legal Tab: Privacy & Terms */
export function LegalTab({ pageData, setPageData }: EditorTabsProps) {
  return (
    <div className="p-5 bg-neutral-50 rounded-[2rem] border border-neutral-100 space-y-8 animate-in fade-in duration-300">
      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2"><Scale className="h-3.5 w-3.5" /> Privacy Policy</Label>
        <Input value={pageData.privacyPolicyUrl || ""} onChange={e => setPageData({...pageData, privacyPolicyUrl: e.target.value})} placeholder="External URL" className="h-10 rounded-xl bg-white border-none shadow-inner text-sm" />
        <Textarea value={pageData.privacyPolicyContent || ""} onChange={e => setPageData({...pageData, privacyPolicyContent: e.target.value})} placeholder="Legal text..." className="rounded-xl min-h-[80px] bg-white border-none shadow-inner text-sm" />
      </div>
      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2"><FileText className="h-3.5 w-3.5" /> Terms of Service</Label>
        <Input value={pageData.termsOfServiceUrl || ""} onChange={e => setPageData({...pageData, termsOfServiceUrl: e.target.value})} placeholder="External URL" className="h-10 rounded-xl bg-white border-none shadow-inner text-sm" />
        <Textarea value={pageData.termsOfServiceContent || ""} onChange={e => setPageData({...pageData, termsOfServiceContent: e.target.value})} placeholder="Legal text..." className="rounded-xl min-h-[80px] bg-white border-none shadow-inner text-sm" />
      </div>
    </div>
  );
}

/** 11. Design Tab: Themes & Colors */
export function DesignTab({ pageData, setPageData }: EditorTabsProps) {
  const PRESETS = [
    { id: 'light', name: 'Clean White' },
    { id: 'dark', name: 'Dark Mode' },
    { id: 'glass', name: 'Glassmorphism' },
    { id: 'vibrant', name: 'Vibrant' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase">Theme Layout</Label>
        <div className="grid grid-cols-2 gap-3">
          {PRESETS.map(t => (
            <button key={t.id} onClick={() => setPageData({...pageData, themeVariant: t.id})} className={cn("p-4 rounded-xl border text-[10px] font-black uppercase transition-all", pageData.themeVariant === t.id ? "bg-primary text-white border-primary shadow-lg" : "bg-neutral-50 hover:bg-white")}>{t.name}</button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase">Primary Brand Color</Label>
        <div className="flex gap-4 items-center p-4 bg-neutral-50 rounded-2xl border shadow-inner">
          <Input type="color" value={pageData.themeColor} onChange={e => setPageData({...pageData, themeColor: e.target.value})} className="h-10 w-20 cursor-pointer p-1" />
          <span className="font-mono text-xs font-bold uppercase tracking-widest">{pageData.themeColor}</span>
        </div>
      </div>
    </div>
  );
}
