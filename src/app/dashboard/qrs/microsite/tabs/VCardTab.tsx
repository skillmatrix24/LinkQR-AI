'use client';

import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  UserCircle, 
  UploadCloud, 
  Loader2, 
  Trash2, 
  Palette, 
  Type, 
  Layers,
  Circle,
  Square,
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Maximize2,
  Sparkles,
  Maximize,
  ShieldCheck,
  Smartphone,
  IdCard,
  Zap,
  Target,
  FileText,
  Paintbrush,
  ImageIcon,
  Info,
  MoveVertical,
  MoveHorizontal,
  RotateCcw,
  Crop,
  SearchCode,
  Mail,
  Phone,
  Globe,
  Camera,
  Download,
  Calendar,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  X,
  Trophy,
  CheckCircle2,
  BrainCircuit,
  Strikethrough,
  MapPin,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from '@/components/ui/textarea';

interface VCardTabProps {
  pageData: any;
  setPageData: (data: any) => void;
  uploadingField: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string, index?: number) => void;
}

export function VCardTab({ pageData, setPageData, uploadingField, handleImageUpload }: VCardTabProps) {
  const [activeTab, setActiveTab] = useState<string>('identity');

  const ICON_OPTIONS = [
    { id: 'none', label: 'None', icon: X },
    { id: 'download', label: 'Save', icon: Download },
    { id: 'calendar', label: 'Book', icon: Calendar },
    { id: 'globe', label: 'Site', icon: Globe },
    { id: 'zap', label: 'Action', icon: Zap },
    { id: 'mail', label: 'Email', icon: Mail },
    { id: 'phone', label: 'Call', icon: Phone },
    { id: 'message-circle', label: 'Chat', icon: MessageCircle },
    { id: 'external-link', label: 'Link', icon: ExternalLink }
  ];

  const VCARD_FONTS = [
    { id: 'font-body', name: 'Inter (Clean)' },
    { id: 'font-mukta', name: 'Mukta (Indian)' },
    { id: 'font-serif', name: 'Lora (Classic)' },
    { id: 'font-mono', name: 'Roboto Mono' },
    { id: 'font-playfair', name: 'Playfair (Luxury)' },
    { id: 'font-montserrat', name: 'Montserrat (Bold)' },
    { id: 'font-poppins', name: 'Poppins (Geometric)' },
    { id: 'font-ubuntu', name: 'Ubuntu (Tech)' },
    { id: 'font-lato', name: 'Lato (Soft)' },
    { id: 'font-opensans', name: 'Open Sans (Modern)' }
  ];

  const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      
      <div className="flex bg-neutral-100 p-1 rounded-xl shadow-inner shrink-0 text-center">
        {[
          { id: 'identity', icon: UserCircle, label: 'Profile' },
          { id: 'schedule', icon: Clock, label: 'Hours' },
          { id: 'vfx', icon: Sparkles, label: 'Visuals' },
          { id: 'surface', icon: Paintbrush, label: 'Stage' },
          { id: 'actions', icon: Zap, label: 'Nodes' }
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setActiveTab(t.id as any)} 
            className={cn(
              "flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all flex flex-col items-center gap-1", 
              activeTab === t.id ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:bg-white/50"
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'identity' && (
        <div className="space-y-8 animate-in slide-in-from-left-2">
           <div className="p-6 bg-neutral-50 rounded-[3rem] border-2 border-dashed space-y-6 flex flex-col items-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5"><Camera className="h-20 w-20" /></div>
            
            <AnimatePresence mode="wait">
              <motion.div 
                key={pageData.photoUrl || 'empty'}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "h-40 w-40 bg-white shadow-2xl overflow-hidden relative z-10 border-4 border-white transition-all duration-500",
                  pageData.photoShape === 'circle' ? 'rounded-full' : pageData.photoShape === 'rounded' ? 'rounded-2xl' : 'rounded-none'
                )}
              >
                  {pageData.photoUrl ? <img src={pageData.photoUrl} className="h-full w-full object-cover" alt="" /> : <UserCircle className="h-20 w-20 m-auto text-neutral-100 mt-10" />}
                  {uploadingField === 'photoUrl' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm z-20">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>}
              </motion.div>
            </AnimatePresence>

            <div className="space-y-4 w-full relative z-10">
                <div className="flex items-center justify-between"><Label className="text-[10px] font-black uppercase">Photo Geometry</Label><div className="flex gap-1 bg-white p-1 rounded-xl border shadow-sm"><button onClick={() => setPageData({...pageData, photoShape: 'circle'})} className={cn("h-8 w-8 flex items-center justify-center rounded-lg transition-all", pageData.photoShape === 'circle' ? "bg-primary text-white" : "text-muted-foreground hover:bg-neutral-50")}><Circle className="h-3.5 w-3.5" /></button><button onClick={() => setPageData({...pageData, photoShape: 'rounded'})} className={cn("h-8 w-8 flex items-center justify-center rounded-lg transition-all", pageData.photoShape === 'rounded' ? "bg-primary text-white" : "text-muted-foreground")}><Layers className="h-3.5 w-3.5" /></button><button onClick={() => setPageData({...pageData, photoShape: 'square'})} className={cn("h-8 w-8 flex items-center justify-center rounded-lg transition-all", pageData.photoShape === 'square' ? "bg-primary text-white" : "text-muted-foreground")}><Square className="h-3.5 w-3.5" /></button></div></div>
                <Button onClick={() => document.getElementById('vcard-photo-input')?.click()} variant="outline" className="w-full h-11 rounded-xl font-bold border-2 gap-2"><UploadCloud className="h-4 w-4" /> Change Identity Photo</Button>
                <input type="file" id="vcard-photo-input" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'photoUrl')} />
            </div>

            <div className="p-4 bg-white rounded-xl border flex gap-3 shadow-sm border-primary/10 w-full relative z-10">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[8px] font-black text-muted-foreground uppercase leading-relaxed text-left">GUIDE: 800x800px High-Res Portrait. Adjust frame position below.</p>
              </div>
            </div>
           </div>

           <div className="p-5 bg-neutral-50 rounded-[2.5rem] border space-y-4">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Business Logo (Optional)</Label>
              {pageData.businessLogoUrl ? (
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border shadow-sm">
                   <img src={pageData.businessLogoUrl} className="h-10 w-16 object-contain" alt="" />
                   <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-8 rounded-lg text-[9px] font-black" onClick={() => document.getElementById('vcard-logo-input')?.click()}>Replace</Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => setPageData({...pageData, businessLogoUrl: ''})}><Trash2 className="h-4 w-4" /></Button>
                   </div>
                </div>
              ) : (
                <div className="relative h-20 bg-white rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-all shadow-inner" onClick={() => document.getElementById('vcard-logo-input')?.click()}>
                   {uploadingField === 'businessLogoUrl' ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <ImageIcon className="h-5 w-5 text-neutral-300" />}
                   <span className="text-[9px] font-black uppercase text-muted-foreground mt-2">Upload Logo</span>
                </div>
              )}
              <input type="file" id="vcard-logo-input" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'businessLogoUrl')} />
           </div>

           <div className="space-y-6">
             <div className="p-6 bg-primary/5 rounded-[2.5rem] border-2 border-primary/10 space-y-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-primary/10 pb-4">
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg"><CheckCircle2 className="h-5 w-5" /></div>
                      <h4 className="font-black text-sm uppercase tracking-tight text-primary">Verification Node</h4>
                   </div>
                   <Switch checked={pageData.verificationEnabled} onCheckedChange={v => setPageData({...pageData, verificationEnabled: v})} />
                </div>
                {pageData.verificationEnabled && (
                  <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2">
                     <button onClick={() => setPageData({...pageData, verificationType: 'blue'})} className={cn("p-3 rounded-xl border-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all", (pageData.verificationType || 'blue') === 'blue' ? "bg-blue-500 text-white border-blue-600" : "bg-white")}>
                        <CheckCircle2 className="h-4 w-4" /> BLUE TICK
                     </button>
                     <button onClick={() => setPageData({...pageData, verificationType: 'gold'})} className={cn("p-3 rounded-xl border-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all", pageData.verificationType === 'gold' ? "bg-amber-500 text-white border-amber-600" : "bg-white")}>
                        <Trophy className="h-4 w-4" /> GOLD SHIELD
                     </button>
                  </div>
                )}
             </div>

             <div className="space-y-4 p-5 bg-white rounded-2xl border-2 border-primary/10 shadow-sm">
                <div className="space-y-4">
                   <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Full Legal Name</Label><Input value={pageData.fullName || ""} onChange={e => setPageData({...pageData, fullName: e.target.value})} placeholder="e.g. Rahul Sharma" className="h-12 rounded-xl bg-neutral-50 border-none font-black text-base shadow-inner" /></div>
                   <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Magnetic Tagline</Label>
                      <Input 
                        value={pageData.tagline || ""} 
                        onChange={e => setPageData({...pageData, tagline: e.target.value})} 
                        maxLength={100}
                        placeholder="e.g. Scaling Digital Boundaries" 
                        className="h-11 rounded-xl bg-neutral-50 border-none shadow-inner text-sm italic" 
                      />
                   </div>
                </div>
                <div className="space-y-3 pt-2 border-t">
                   <div className="flex items-center justify-between">
                      <Label className="text-[9px] font-bold uppercase text-primary">Name Font Size</Label>
                      <Badge variant="outline" className="text-[9px] font-mono">{pageData.nameFontSize || 32}px</Badge>
                   </div>
                   <Slider value={[pageData.nameFontSize || 32]} min={16} max={80} step={1} onValueChange={v => setPageData({...pageData, nameFontSize: v[0]})} />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-[9px] font-bold uppercase opacity-60 ml-1">Designation</Label><Input value={pageData.designation || ""} onChange={e => setPageData({...pageData, designation: e.target.value})} placeholder="Title" className="h-11 rounded-xl bg-neutral-50 border-none font-bold text-sm shadow-inner" /></div>
                <div className="space-y-1.5"><Label className="text-[9px] font-bold uppercase opacity-60 ml-1">Company</Label><Input value={pageData.company || ""} onChange={e => setPageData({...pageData, company: e.target.value})} placeholder="Org" className="h-11 rounded-xl bg-neutral-50 border-none font-bold text-sm shadow-inner" /></div>
             </div>

             <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Short Introduction</Label>
                <Textarea 
                  value={pageData.introduction || ""} 
                  onChange={e => setPageData({...pageData, introduction: e.target.value})} 
                  maxLength={250}
                  placeholder="A quick 2-line summary of who you are..." 
                  className="min-h-[80px] rounded-xl bg-neutral-50 border-none shadow-inner text-xs leading-relaxed" 
                />
             </div>

             <div className="p-6 bg-neutral-50 rounded-[2.5rem] border space-y-6 shadow-inner">
                <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Registry Nodes</Label>
                
                <div className="space-y-4">
                  <div className="space-y-3 p-4 bg-white rounded-2xl border shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /><span className="text-[11px] font-bold uppercase">Primary Mobile</span></div>
                      <Switch checked={pageData.showMobile !== false} onCheckedChange={v => setPageData({...pageData, showMobile: v})} className="scale-75" />
                    </div>
                    <Input value={pageData.mobile} onChange={e => setPageData({...pageData, mobile: e.target.value})} placeholder="+91..." className="h-11 bg-neutral-50 border-none rounded-xl font-mono text-sm" />
                  </div>

                  <div className="space-y-3 p-4 bg-white rounded-2xl border shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /><span className="text-[11px] font-bold uppercase">Secondary Number</span></div>
                      <Switch checked={pageData.showMobileSecondary} onCheckedChange={v => setPageData({...pageData, showMobileSecondary: v})} className="scale-75" />
                    </div>
                    <Input value={pageData.mobileSecondary} onChange={e => setPageData({...pageData, mobileSecondary: e.target.value})} placeholder="Secondary Mobile" className="h-11 bg-neutral-50 border-none rounded-xl font-mono text-sm" />
                  </div>

                  {/* FIX 2: Added WhatsApp Only editor input */}
                  <div className="space-y-3 p-4 bg-white rounded-2xl border shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><MessageCircle className="h-4 w-4 text-primary" /><span className="text-[11px] font-bold uppercase">WhatsApp Only</span></div>
                      <Switch checked={pageData.showMobileWhatsApp} onCheckedChange={v => setPageData({...pageData, showMobileWhatsApp: v})} className="scale-75" />
                    </div>
                    <Input value={pageData.mobileWhatsApp} onChange={e => setPageData({...pageData, mobileWhatsApp: e.target.value})} placeholder="WhatsApp Number" className="h-11 bg-neutral-50 border-none rounded-xl font-mono text-sm" />
                  </div>

                  <div className="space-y-3 p-4 bg-white rounded-2xl border shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /><span className="text-[11px] font-bold uppercase">Email Node</span></div>
                      <Switch checked={pageData.showEmail !== false} onCheckedChange={v => setPageData({...pageData, showEmail: v})} className="scale-75" />
                    </div>
                    <Input value={pageData.email} onChange={e => setPageData({...pageData, email: e.target.value})} placeholder="name@company.com" className="h-11 bg-neutral-50 border-none rounded-xl text-sm" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase opacity-60 ml-1">Physical Address</Label>
                    <Textarea 
                      value={pageData.address || ""} 
                      onChange={e => setPageData({...pageData, address: e.target.value})} 
                      placeholder="Street, City, State..." 
                      className="min-h-[80px] bg-white border-none rounded-xl text-xs" 
                    />
                  </div>
                  
                  <div className="space-y-3 p-4 bg-white rounded-2xl border shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /><span className="text-[11px] font-bold uppercase">Location Node</span></div>
                      <Switch checked={pageData.showLocation !== false} onCheckedChange={v => setPageData({...pageData, showLocation: v})} className="scale-75" />
                    </div>
                    <Input value={pageData.locationUrl} onChange={e => setPageData({...pageData, locationUrl: e.target.value})} placeholder="https://maps.google.com/..." className="h-11 bg-neutral-50 border-none rounded-xl text-xs font-mono" />
                    <div className="flex items-center justify-between pt-2 border-t mt-2">
                       <span className="text-[9px] font-bold uppercase opacity-60">Show Map Preview</span>
                       <Switch checked={pageData.showMapPreview} onCheckedChange={v => setPageData({...pageData, showMapPreview: v})} className="scale-50" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t gap-4">
                   <div className="flex flex-col items-center gap-2">
                      <span className="text-[8px] font-black uppercase opacity-40">Quick Actions</span>
                      <Switch checked={pageData.showQuickActions !== false} onCheckedChange={v => setPageData({...pageData, showQuickActions: v})} className="scale-50" />
                   </div>
                   <div className="flex flex-col items-center gap-2">
                      <span className="text-[8px] font-black uppercase opacity-40">Sticky Bar</span>
                      <Switch checked={pageData.stickyActionsEnabled !== false} onCheckedChange={v => setPageData({...pageData, stickyActionsEnabled: v})} className="scale-50" />
                   </div>
                   <div className="flex flex-col items-center gap-2">
                      <span className="text-[8px] font-black uppercase opacity-40">Website</span>
                      <Switch checked={pageData.showWebsite !== false} onCheckedChange={v => setPageData({...pageData, showWebsite: v})} className="scale-50" />
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="space-y-6 animate-in slide-in-from-right-2">
           <div className="p-6 bg-neutral-50 rounded-[2.5rem] border space-y-8 shadow-sm">
              <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" /> Operating Schedule
              </Label>
              
              <div className="space-y-4">
                 {DAYS.map((day) => {
                    const dayData = pageData.workingHours?.[day] || { enabled: false, start: '09:00', end: '18:00' };
                    return (
                      <div key={day} className="p-4 bg-white rounded-2xl border space-y-4 shadow-sm group hover:border-primary/20 transition-all">
                         <div className="flex items-center justify-between">
                            <Label className="text-[11px] font-black uppercase tracking-tight">{day}</Label>
                            <Switch 
                              checked={dayData.enabled} 
                              onCheckedChange={(v) => {
                                const wh = { ...(pageData.workingHours || {}) };
                                wh[day] = { ...dayData, enabled: v };
                                setPageData({ ...pageData, workingHours: wh });
                              }} 
                              className="scale-75 data-[state=checked]:bg-primary"
                            />
                         </div>
                         {dayData.enabled && (
                           <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-1">
                              <div className="space-y-1">
                                 <span className="text-[8px] font-bold text-muted-foreground uppercase ml-1">Opens</span>
                                 <Input 
                                   type="time" 
                                   value={dayData.start} 
                                   onChange={(e) => {
                                      const wh = { ...(pageData.workingHours || {}) };
                                      wh[day] = { ...dayData, start: e.target.value };
                                      setPageData({ ...pageData, workingHours: wh });
                                   }} 
                                   className="h-9 text-xs bg-neutral-50 border-none font-mono" 
                                 />
                              </div>
                              <div className="space-y-1">
                                 <span className="text-[8px] font-bold text-muted-foreground uppercase ml-1">Closes</span>
                                 <Input 
                                   type="time" 
                                   value={dayData.end} 
                                   onChange={(e) => {
                                      const wh = { ...(pageData.workingHours || {}) };
                                      wh[day] = { ...dayData, end: e.target.value };
                                      setPageData({ ...pageData, workingHours: wh });
                                   }} 
                                   className="h-9 text-xs bg-neutral-50 border-none font-mono" 
                                 />
                              </div>
                           </div>
                         )}
                         {!dayData.enabled && (
                           <p className="text-[9px] font-bold text-muted-foreground italic uppercase opacity-50 px-1">Closed for Business</p>
                         )}
                      </div>
                    );
                 })}
              </div>
           </div>

           <div className="p-5 rounded-3xl bg-primary/5 border border-primary/10 flex gap-4 shadow-inner">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-[10px] text-neutral-600 font-medium leading-relaxed italic text-left">
                Configure your active business hours. These will be displayed in a clean structured format on your public card.
              </p>
           </div>
        </div>
      )}

      {activeTab === 'vfx' && (
        <div className="space-y-6 animate-in slide-in-from-right-2">
           <div className="p-5 bg-neutral-50 rounded-[2.5rem] border space-y-6">
              <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><SearchCode className="h-3.5 w-3.5" /> Identity Typography</Label>
              <div className="grid grid-cols-2 gap-2">
                  {VCARD_FONTS.map(f => (
                    <button 
                      key={f.id} 
                      onClick={() => setPageData({...pageData, fontType: f.id})}
                      className={cn(
                        "p-3 rounded-xl border-2 text-[8px] font-black uppercase transition-all", 
                        (pageData.fontType || 'font-body') === f.id ? "bg-primary text-white border-primary shadow-lg" : "bg-white hover:bg-neutral-100"
                      )}
                    >
                        {f.name}
                    </button>
                  ))}
              </div>
           </div>

           <div className="p-6 bg-neutral-900 text-white rounded-[2.5rem] space-y-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12"><Zap className="h-20 w-20 text-accent" /></div>
              <Label className="text-[10px] font-black uppercase text-accent tracking-widest flex items-center gap-2 relative z-10"><Palette className="h-3.5 w-3.5" /> Identity Aesthetics</Label>
              <div className="space-y-6 relative z-10">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-[9px] font-bold uppercase text-white/40">Name Color</Label>
                       <Input type="color" value={pageData.nameColor || '#111827'} onChange={e => setPageData({...pageData, nameColor: e.target.value})} className="h-10 w-full p-0.5 border-none bg-white/10 rounded-xl cursor-pointer" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[9px] font-bold uppercase text-white/40">Title Color</Label>
                       <Input type="color" value={pageData.titleColor || '#6750A4'} onChange={e => setPageData({...pageData, titleColor: e.target.value})} className="h-10 w-full p-0.5 border-none bg-white/10 rounded-xl cursor-pointer" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                    <div className="space-y-2">
                       <Label className="text-[9px] font-bold uppercase text-white/40">Tagline Color</Label>
                       <Input type="color" value={pageData.taglineColor || '#6b7280'} onChange={e => setPageData({...pageData, taglineColor: e.target.value})} className="h-10 w-full p-0.5 border-none bg-white/10 rounded-xl cursor-pointer" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[9px] font-bold uppercase text-white/40">Intro Color</Label>
                       <Input type="color" value={pageData.introColor || '#4b5563'} onChange={e => setPageData({...pageData, introColor: e.target.value})} className="h-10 w-full p-0.5 border-none bg-white/10 rounded-xl cursor-pointer" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                     <div className="flex flex-col">
                        <Label className="text-[10px] font-black uppercase text-accent flex items-center gap-2"><Maximize2 className="h-3.5 w-3.5" /> Glass Mode</Label>
                        <span className="text-[7px] text-white/40 font-bold uppercase mt-1">Translucency Engine</span>
                     </div>
                     <Switch checked={pageData.glassEnabled} onCheckedChange={v => setPageData({...pageData, glassEnabled: v})} className="scale-75 data-[state=checked]:bg-accent" />
                  </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2">
           <div className="p-6 bg-primary/5 border-2 border-primary/10 rounded-[2.5rem] space-y-8 shadow-sm">
              <div className="flex items-center gap-3 border-b border-primary/10 pb-4">
                 <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg"><Zap className="h-5 w-5" /></div>
                 <h4 className="font-black text-sm uppercase tracking-tight text-primary">Primary Action Studio</h4>
              </div>
              <div className="space-y-6">
                 <div className="space-y-2">
                   <Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Button Text</Label>
                   <Input value={pageData.btnText || ""} onChange={e => setPageData({...pageData, btnText: e.target.value})} placeholder="Button Text" className="h-11 rounded-xl bg-white border-none shadow-inner font-black text-sm" />
                 </div>
                 
                 <div className="space-y-4">
                   <Label className="text-[9px] font-bold uppercase opacity-60">Button Icon</Label>
                   <div className="grid grid-cols-3 gap-2">
                      {ICON_OPTIONS.map(opt => (
                        <button 
                          key={opt.id}
                          onClick={() => setPageData({...pageData, btnIcon: opt.id})}
                          className={cn(
                            "flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all",
                            (pageData.btnIcon || 'download') === opt.id ? "bg-primary border-primary text-white" : "bg-white hover:bg-neutral-100"
                          )}
                        >
                           <opt.icon className="h-4 w-4" />
                           <span className="text-[7px] font-black uppercase">{opt.label}</span>
                        </button>
                      ))}
                   </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="p-5 rounded-3xl bg-primary/5 border border-primary/10 flex gap-4 shadow-inner">
         <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
         <p className="text-[10px] text-neutral-600 font-medium leading-relaxed italic text-left">
           Advanced Identity Nodes are high-fidelity redirection units. Use "Introduction" and "Tagline" to build immediate authority.
         </p>
      </div>
    </div>
  );
}
