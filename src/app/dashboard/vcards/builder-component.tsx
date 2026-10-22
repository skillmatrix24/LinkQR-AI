"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "react-router-dom";
import { Link } from "react-router-dom";
import { 
  Loader2, 
  ArrowLeft, 
  UserCircle, 
  Plus, 
  CheckCircle2, 
  Smartphone, 
  Globe, 
  Mail, 
  Phone, 
  Briefcase, 
  Building2, 
  Sparkles, 
  Wand2, 
  Save, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Trash2,
  Camera,
  UploadCloud,
  IdCard,
  Type,
  FileText,
  ArrowRight,
  Info,
  Facebook,
  Youtube,
  Music,
  MessageCircle,
  Zap,
  Palette,
  Maximize2,
  Layout,
  Share2,
  ExternalLink,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  Target,
  Send,
  Eye,
  Settings2,
  Layers,
  ChevronUp,
  ChevronDown,
  X,
  Maximize,
  Paintbrush,
  UserCheck,
  Check,
  Square,
  Circle,
  MousePointer2,
  Video,
  Monitor,
  Tablet,
  LayoutGrid,
  Menu,
  Heart,
  Quote,
  Star,
  Copy,
  Ghost,
  Pin,
  Utensils,
  ShoppingBag,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Slack,
  Github,
  Disc as Discord,
  Link as LinkIcon,
  ImageIcon,
  SearchCode,
  Calendar,
  Languages,
  LayoutList,
  Contact2,
  Nfc,
  QrCode,
  Download,
  BrainCircuit,
  Strikethrough
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  useUser, 
  useFirestore, 
  useDoc,
  useMemoFirebase, 
  setDocumentNonBlocking, 
  useStorage, 
  updateDocumentNonBlocking 
} from "@/firebase";
import { doc, serverTimestamp, increment } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { generateAIBio } from "@/ai/flows/ai-bio-writer-flow";

const SOCIAL_PLATFORMS = [
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: '#25D366' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
  { id: 'sharechat', name: 'ShareChat', icon: Share2, color: '#D83025' },
  { id: 'moj', name: 'Moj', icon: Zap, color: '#FFD700' },
  { id: 'josh', name: 'Josh', icon: Target, color: '#E1306C' },
  { id: 'telegram', name: 'Telegram', icon: Send, color: '#26A5E4' },
  { id: 'twitter', name: 'X / Twitter', icon: Twitter, color: '#000000' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000' },
  { id: 'spotify', name: 'Spotify', icon: Music, color: '#1DB954' },
  { id: 'snapchat', name: 'Snapchat', icon: Ghost, color: '#FFFC00' },
  { id: 'pinterest', name: 'Pinterest', icon: Pin, color: '#E60023' },
  { id: 'zomato', name: 'Zomato', icon: Utensils, color: '#CB202D' },
  { id: 'swiggy', name: 'Swiggy', icon: ShoppingBag, color: '#FC8019' },
  { id: 'slack', name: 'Slack', icon: Slack, color: '#4A154B' },
  { id: 'discord', name: 'Discord', icon: Discord, color: '#5865F2' },
  { id: 'github', name: 'GitHub', icon: Github, color: '#181717' },
  { id: 'website', name: 'Website', icon: Globe, color: '#6750A4' },
];

const FONTS = [
  { id: 'font-body', name: 'Standard (Inter)' },
  { id: 'font-mukta', name: 'Mukta (Indian)' },
  { id: 'font-serif', name: 'Classic Serif' },
  { id: 'font-mono', name: 'Modern Mono' },
  { id: 'font-playfair', name: 'Playfair (Luxury)' },
  { id: 'font-montserrat', name: 'Montserrat (Bold)' },
  { id: 'font-poppins', name: 'Poppins (Geometric)' },
  { id: 'font-ubuntu', name: 'Ubuntu (Tech)' },
  { id: 'font-lato', name: 'Lato (Soft)' },
  { id: 'font-opensans', name: 'Open Sans (Modern)' }
];

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

export default function DigitalIDEditor({ existingData }: { existingData?: any }) {
  const router = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const storage = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState('identity');
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet'>('mobile');
  const [stageWidth, setStageWidth] = useState(0);
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  // Tool States
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false);
  const [isNfcDialogOpen, setIsNfcDialogOpen] = useState(false);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [isAiBioLoading, setIsAiBioLoading] = useState(false);

  const initialData = {
    id: crypto.randomUUID(),
    slug: "",
    fullName: "",
    designation: "",
    company: "",
    mobile: "",
    email: "",
    website: "",
    photoUrl: "",
    photoShape: 'circle',
    headerLayout: 'classic', 
    headerAlign: 'center', 
    themeColor: "#6750A4",
    fontType: "font-body",
    cardRadius: 32,
    buttonStyle: 'rounded',
    cardShadow: 'xl',
    cardBgType: 'solid',
    cardBgColor1: '#ffffff',
    cardBgColor2: '#ffffff',
    cardBgImage: '',
    glassEnabled: false,
    navMode: 'scroll', 
    langToggleEnabled: false,
    sections: [
      { id: 'bio-1', type: 'bio', data: { content: "Experienced professional dedicated to innovative solutions.", contentHi: "" } },
      { id: 'social-1', type: 'social', data: { items: [] } },
      { id: 'contact-1', type: 'contact', data: { showMobile: true, showEmail: true, showWebsite: true } }
    ],
    stats: { views: 0, saves: 0 }
  };

  const [formData, setFormData] = useState<any>(existingData || initialData);

  const userProfileRef = useMemoFirebase(() => (db && user?.uid) ? doc(db, "users", user.uid) : null, [db, user?.uid]);

  useEffect(() => {
    if (!stageRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) setStageWidth(entry.contentRect.width - 40);
    });
    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, []);

  const scale = stageWidth > 0 ? Math.min(1, stageWidth / 375) : 1;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, photoUrl: reader.result as string });
      setUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const addBlock = (type: string) => {
    const id = `${type}-${Math.random().toString(36).substring(2, 9)}`;
    let defaultData: any = {};
    if (type === 'bio') defaultData = { content: "Share your story...", contentHi: "" };
    if (type === 'social') defaultData = { items: [] };
    if (type === 'contact') defaultData = { showMobile: true, showEmail: true, showWebsite: true };
    if (type === 'services') defaultData = { title: 'My Expertise', titleHi: 'मेरी विशेषज्ञता', items: [{ title: 'Strategy', desc: 'Growth management.' }] };
    if (type === 'testimonials') defaultData = { title: 'Social Proof', reviews: [{ name: 'Client', comment: 'Exceptional service!', rating: 5 }] };
    if (type === 'video') defaultData = { url: '', title: 'Watch Intro' };
    if (type === 'leadForm') defaultData = { title: 'Connect with Me', buttonText: 'Send Message', showEmail: true, showPhone: true };
    if (type === 'appointment') defaultData = { title: 'Book a Meeting', provider: 'calendly', url: '' };

    setFormData({ ...formData, sections: [...formData.sections, { id, type, data: defaultData }] });
    setEditingBlockId(id);
  };

  const removeBlock = (id: string) => {
    setFormData({ ...formData, sections: formData.sections.filter((s: any) => s.id !== id) });
    if (editingBlockId === id) setEditingBlockId(null);
  };

  const moveBlock = (index: number, dir: 'up' | 'down') => {
    const next = [...formData.sections];
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setFormData({ ...formData, sections: next });
  };

  const updateBlockData = (id: string, key: string, value: any) => {
    const next = formData.sections.map((s: any) => 
      s.id === id ? { ...s, data: { ...s.data, [key]: value } } : s
    );
    setFormData({ ...formData, sections: next });
  };

  const handleAiRefineBio = async (blockId: string, currentContent: string) => {
    if (!formData.fullName || !formData.designation) {
        toast({ variant: "destructive", title: "Information Required", description: "Please fill Name and Designation first." });
        return;
    }
    setIsAiBioLoading(true);
    try {
        const result = await generateAIBio({
            name: formData.fullName,
            designation: formData.designation,
            company: formData.company || "Self-Employed",
            keywords: currentContent || "Professional networking",
            tone: 'Professional'
        });
        updateBlockData(blockId, 'content', result.bioEn);
        updateBlockData(blockId, 'contentHi', result.bioHi);
        toast({ title: "Bio Refined by AI" });
    } catch (e) {
        toast({ variant: "destructive", title: "AI Error" });
    } finally {
        setIsAiBioLoading(false);
    }
  };

  const duplicateBlock = (index: number) => {
    const original = formData.sections[index];
    const duplicate = JSON.parse(JSON.stringify(original));
    duplicate.id = `${original.type}-${crypto.randomUUID().substring(0, 8)}`;
    const next = [...formData.sections];
    next.splice(index + 1, 0, duplicate);
    setFormData({ ...formData, sections: next });
    setEditingBlockId(duplicate.id);
  };

  const handleSave = async () => {
    if (!user || !db || !userProfileRef) return;
    setIsLoading(true);
    try {
      const timestamp = serverTimestamp();
      let finalPhotoUrl = formData.photoUrl;

      if (formData.photoUrl && formData.photoUrl.startsWith('data:') && storage) {
        const sRef = ref(storage, `users/${user.uid}/vcards/${formData.id}/photo`);
        await uploadString(sRef, formData.photoUrl, 'data_url');
        finalPhotoUrl = await getDownloadURL(sRef);
      }

      const cardRef = doc(db, "users", user.uid, "digitalIDs", formData.id);
      setDocumentNonBlocking(cardRef, { 
        ...formData, 
        photoUrl: finalPhotoUrl, 
        userId: user.uid, 
        updatedAt: timestamp, 
        createdAt: formData.createdAt || timestamp 
      }, { merge: true });

      setDocumentNonBlocking(doc(db, "publicSmartPages", `id_${formData.id}`), {
         micrositeId: formData.id,
         userId: user.uid,
         type: 'vcard',
         slug: formData.slug || null,
         updatedAt: timestamp
      }, { merge: true });

      if (!existingData) {
        updateDocumentNonBlocking(userProfileRef, { vCardCount: increment(1) });
      }
      
      toast({ title: "Identity Deployed" });
      navigate("/dashboard/vcards");
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Fault" });
    } finally {
      setIsLoading(false);
    }
  };

  const publicUrl = `https://linkqr.in/id/${formData.slug || formData.id}`;

  const visibleSectionsPreview = formData.navMode === 'tabs' 
    ? formData.sections.filter((s: any) => s.id === (editingBlockId || formData.sections[0]?.id)) 
    : formData.sections;

  const getPrimaryIcon = () => {
    const IconComp = ICON_OPTIONS.find(opt => opt.id === (formData.btnIcon || 'download'))?.icon || Download;
    return <IconComp className="h-6 w-6" />;
  };

  const getSecondaryIcon = () => {
    const IconComp = ICON_OPTIONS.find(opt => opt.id === (formData.secondaryBtnIcon || 'calendar'))?.icon || Calendar;
    return <IconComp className="h-5 w-5" />;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-neutral-100 flex flex-col overflow-hidden">
      <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/vcards")} className="rounded-full h-10 w-10 hover:bg-neutral-100">
              <ArrowLeft className="h-5 w-5" />
           </Button>
           <div className="h-6 w-px bg-neutral-100 hidden sm:block"></div>
           <h2 className="font-black text-sm uppercase tracking-tight truncate max-w-[120px] sm:max-w-[300px]">{formData.fullName || "Draft Identity"}</h2>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" size="sm" onClick={() => setIsQrDialogOpen(true)} className="rounded-xl h-10 px-4 font-bold gap-2 border-2 hidden md:flex text-primary border-primary/20">
              <QrCode className="h-4 w-4" /> QR Identity
           </Button>
           <Button variant="outline" size="sm" onClick={() => setIsSignatureDialogOpen(true)} className="rounded-xl h-10 px-4 font-bold gap-2 border-2 hidden md:flex">
              <Mail className="h-4 w-4" /> Signature
           </Button>
           <Button variant="outline" size="sm" onClick={() => setIsNfcDialogOpen(true)} className="rounded-xl h-10 px-4 font-bold gap-2 border-2 hidden md:flex">
              <Nfc className="h-4 w-4" /> NFC Node
           </Button>
           <div className="h-6 w-px bg-neutral-100 hidden sm:block"></div>
           <Button onClick={handleSave} disabled={isLoading} className="rounded-xl h-11 px-8 font-black gap-2 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              SAVE ID
           </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-full lg:w-[480px] bg-white border-r flex flex-col overflow-hidden shrink-0 shadow-2xl z-20">
           <Tabs value={activeEditorTab} onValueChange={setActiveEditorTab} className="flex flex-col h-full">
              <TabsList className="grid grid-cols-4 h-14 bg-neutral-50 p-1 rounded-none border-b shrink-0">
                 <TabsTrigger value="identity" className="rounded-xl font-black text-[9px] uppercase gap-2"><UserCircle className="h-4 w-4" /> <span className="hidden sm:inline">Identity</span></TabsTrigger>
                 <TabsTrigger value="structure" className="rounded-xl font-black text-[9px] uppercase gap-2"><Layers className="h-4 w-4" /> <span className="hidden sm:inline">Blocks</span></TabsTrigger>
                 <TabsTrigger value="style" className="rounded-xl font-black text-[9px] uppercase gap-2"><Palette className="h-4 w-4" /> <span className="hidden sm:inline">Style</span></TabsTrigger>
                 <TabsTrigger value="settings" className="rounded-xl font-black text-[9px] uppercase gap-2"><Settings2 className="h-4 w-4" /> <span className="hidden sm:inline">Core</span></TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar pb-32">
                {activeEditorTab === 'identity' && (
                  <div className="space-y-10 animate-in slide-in-from-left-2">
                    <div className="p-8 bg-neutral-50 rounded-[3rem] border-2 border-dashed space-y-6 flex flex-col items-center relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-4 opacity-5"><Camera className="h-20 w-20" /></div>
                       <div className={cn(
                         "h-40 w-40 bg-white shadow-2xl overflow-hidden relative z-10 border-4 border-white transition-all duration-500",
                         formData.photoShape === 'circle' ? 'rounded-full' : formData.photoShape === 'rounded' ? 'rounded-[2.5rem]' : 'rounded-none'
                       )}>
                          {formData.photoUrl ? <img src={formData.photoUrl} className="h-full w-full object-cover" alt="" /> : <UserCircle className="h-20 w-20 m-auto text-neutral-100 mt-10" />}
                          {uploadingPhoto && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                       </div>
                       <div className="space-y-4 w-full relative z-10">
                          <div className="flex items-center justify-between"><Label className="text-[10px] font-black uppercase">Photo Geometry</Label><div className="flex gap-1 bg-white p-1 rounded-xl border shadow-sm"><button onClick={() => setFormData({...formData, photoShape: 'circle'})} className={cn("h-8 w-8 flex items-center justify-center rounded-lg transition-all", formData.photoShape === 'circle' ? "bg-primary text-white" : "text-muted-foreground")}><Circle className="h-4 w-4" /></button><button onClick={() => setFormData({...formData, photoShape: 'rounded'})} className={cn("h-8 w-8 flex items-center justify-center rounded-lg transition-all", formData.photoShape === 'rounded' ? "bg-primary text-white" : "text-muted-foreground")}><Layers className="h-4 w-4" /></button><button onClick={() => setFormData({...formData, photoShape: 'square'})} className={cn("h-8 w-8 flex items-center justify-center rounded-lg transition-all", formData.photoShape === 'square' ? "bg-primary text-white" : "text-muted-foreground")}><Square className="h-4 w-4" /></button></div></div>
                          <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full h-11 rounded-xl font-bold border-2 gap-2"><UploadCloud className="h-4 w-4" /> Change Identity Photo</Button>
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="p-6 bg-neutral-50 rounded-[2rem] border space-y-6">
                          <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><Type className="h-3.5 w-3.5" /> Header Layout</Label>
                          <div className="grid grid-cols-3 gap-2">
                             {[
                               { id: 'classic', label: 'Classic', icon: IdCard },
                               { id: 'cover', label: 'Cover', icon: ImageIcon },
                               { id: 'split', label: 'Split', icon: Maximize2 }
                             ].map(l => {
                               const IconComp = l.icon;
                               return (
                               <button key={l.id} onClick={() => setFormData({...formData, headerLayout: l.id})} className={cn("p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all", (formData.headerLayout || 'classic') === l.id ? "bg-primary border-primary text-white" : "bg-white")}>
                                  <IconComp className="h-4 w-4" /><span className="text-[7px] font-black uppercase">{l.label}</span>
                               </button>
                               );
                             })}
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t">
                            <Label className="text-[10px] font-black uppercase">Alignment</Label>
                            <div className="flex gap-1 bg-white p-1 rounded-lg border shadow-sm">
                               {[
                                 { id: 'left', icon: AlignLeft },
                                 { id: 'center', icon: AlignCenter },
                                 { id: 'right', icon: AlignRight }
                               ].map(align => {
                                 const AlignIcon = align.icon;
                                 return (
                                 <button key={align.id} onClick={() => setFormData({...formData, headerAlign: align.id})} className={cn("h-8 w-8 flex items-center justify-center rounded-md transition-all", (formData.headerAlign || 'center') === align.id ? "bg-primary text-white" : "text-muted-foreground")}><AlignIcon className="h-3.5 w-3.5" /></button>
                                 );
                               })}
                            </div>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Full Legal Name</Label><Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="e.g. Rahul Sharma" className="h-12 rounded-xl bg-neutral-50 border-none font-black text-lg shadow-inner" /></div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Designation</Label><Input value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} placeholder="Title" className="h-11 rounded-xl bg-neutral-50 border-none font-bold text-sm shadow-inner" /></div>
                             <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Company</Label><Input value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="Org" className="h-11 rounded-xl bg-neutral-50 border-none font-bold text-sm shadow-inner" /></div>
                          </div>
                          <div className="p-6 bg-neutral-50 rounded-[2.5rem] border space-y-4 shadow-inner">
                             <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60 ml-1">Mobile</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="+91..." className="h-11 bg-white border-none rounded-xl font-mono" /></div>
                             <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60 ml-1">Email</Label><Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="name@company.com" className="h-11 bg-white border-none rounded-xl" /></div>
                             <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase opacity-60 ml-1">Website</Label><Input value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="https://..." className="h-11 bg-white border-none rounded-xl" /></div>
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {activeEditorTab === 'structure' && (
                  <div className="space-y-8 animate-in slide-in-from-right-2">
                     <div className="flex items-center justify-between px-1 border-b pb-4">
                        <Label className="text-[11px] font-black uppercase text-primary tracking-widest">Card Architecture</Label>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black text-[9px] uppercase">{formData.sections.length} Active Nodes</Badge>
                     </div>

                     <div className="space-y-4">
                        {formData.sections.map((s: any, idx: number) => (
                          <div key={s.id} className={cn("bg-white border-2 rounded-[2rem] overflow-hidden transition-all duration-500", editingBlockId === s.id ? "border-primary shadow-2xl" : "border-neutral-100 hover:border-neutral-200")}>
                             <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setEditingBlockId(editingBlockId === s.id ? null : s.id)}>
                                <div className="flex items-center gap-4 min-w-0">
                                   <div className="h-10 w-10 rounded-xl bg-neutral-50 flex items-center justify-center text-primary border shadow-inner shrink-0">
                                      {s.type === 'bio' ? <FileText className="h-5 w-5" /> : 
                                       s.type === 'social' ? <Globe className="h-5 w-5" /> : 
                                       s.type === 'contact' ? <Phone className="h-5 w-5" /> : 
                                       s.type === 'services' ? <Target className="h-5 w-5" /> : 
                                       s.type === 'testimonials' ? <Quote className="h-5 w-5" /> : 
                                       s.type === 'leadForm' ? <UserCheck className="h-5 w-5" /> :
                                       s.type === 'appointment' ? <Calendar className="h-5 w-5" /> :
                                       <Video className="h-5 w-5" />}
                                   </div>
                                   <div className="min-w-0">
                                      <p className="text-[10px] font-black uppercase text-primary tracking-widest leading-none">{s.type}</p>
                                      <p className="text-[11px] font-bold text-muted-foreground truncate max-w-[140px] mt-1">{s.data.title || s.data.content || "Identity Block"}</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-2">
                                   <div className="flex items-center gap-1 opacity-100 transition-opacity">
                                      <button onClick={(e) => { e.stopPropagation(); duplicateBlock(idx); }} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-primary"><Copy className="h-3.5 w-3.5" /></button>
                                      <button onClick={(e) => { e.stopPropagation(); moveBlock(idx, 'up'); }} disabled={idx === 0} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400"><ChevronUp className="h-4 w-4" /></button>
                                      <button onClick={(e) => { e.stopPropagation(); moveBlock(idx, 'down'); }} disabled={idx === formData.sections.length - 1} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400"><ChevronDown className="h-4 w-4" /></button>
                                      <button onClick={(e) => { e.stopPropagation(); removeBlock(s.id); }} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500"><X className="h-4 w-4" /></button>
                                   </div>
                                </div>
                             </div>

                             <AnimatePresence>
                                {editingBlockId === s.id && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t bg-neutral-50/50">
                                     <div className="p-6 space-y-6">
                                        {s.type === 'bio' && (
                                           <div className="space-y-6">
                                              <div className="flex items-center justify-between">
                                                 <Label className="text-[10px] font-black uppercase text-primary">Biographical Data</Label>
                                                 <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    disabled={isAiBioLoading} 
                                                    onClick={() => handleAiRefineBio(s.id, s.data.content)}
                                                    className="h-8 rounded-lg font-black text-[9px] uppercase border-primary/20 text-primary gap-2"
                                                 >
                                                    {isAiBioLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3 w-3" />} AI REFINE
                                                 </Button>
                                              </div>
                                              <div className="space-y-1.5">
                                                 <Label className="text-[9px] font-bold uppercase text-muted-foreground">About You (English)</Label>
                                                 <Textarea value={s.data.content} onChange={e => updateBlockData(s.id, 'content', e.target.value)} className="min-h-[120px] rounded-xl bg-white border-none shadow-inner text-sm" />
                                              </div>
                                              <div className="space-y-1.5">
                                                 <Label className="text-[9px] font-bold uppercase text-primary">About You (Hindi)</Label>
                                                 <Textarea value={s.data.contentHi} onChange={e => updateBlockData(s.id, 'contentHi', e.target.value)} className="min-h-[120px] rounded-xl bg-white border-none shadow-inner text-sm font-mukta" />
                                              </div>
                                           </div>
                                        )}
                                        {s.type === 'social' && (
                                           <div className="space-y-6">
                                              <div className="flex items-center justify-between"><Label className="text-[10px] font-black uppercase">Network Nodes</Label><Button size="sm" onClick={() => { const items = [...(s.data.items || []), { platform: 'instagram', value: '', pulse: false }]; updateBlockData(s.id, 'items', items); }} className="h-8 px-4 rounded-xl font-bold gap-2"><Plus className="h-3 w-3" /> Add Link</Button></div>
                                              <div className="space-y-3">
                                                 {s.data.items?.map((item: any, i: number) => (
                                                   <div key={i} className="flex gap-2 items-center bg-white p-3 rounded-2xl border relative group/link animate-in slide-in-from-top-2 shadow-sm">
                                                      <select value={item.platform} onChange={e => { const list = [...s.data.items]; list[i].platform = e.target.value; updateBlockData(s.id, 'items', list); }} className="bg-neutral-50 rounded-xl h-10 px-3 text-[10px] font-bold outline-none border flex-1 shrink-0">{SOCIAL_PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                                                      <Input value={item.value} onChange={e => { const list = [...s.data.items]; list[i].value = e.target.value; updateBlockData(s.id, 'items', list); }} placeholder="Username / Link" className="h-10 text-xs border-none bg-neutral-50 shadow-inner font-bold flex-[2]" />
                                                      <button onClick={() => { const list = s.data.items.filter((_:any, j:number) => j !== i); updateBlockData(s.id, 'items', list); }} className="text-red-500 h-10 w-10 flex items-center justify-center hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="h-4 w-4" /></button>
                                                   </div>
                                                 ))}
                                              </div>
                                           </div>
                                        )}
                                        {s.type === 'contact' && (
                                           <div className="space-y-4">
                                              {[
                                                { id: 'showMobile', label: 'Show Mobile Node', icon: Phone },
                                                { id: 'showEmail', label: 'Show Email Node', icon: Mail },
                                                { id: 'showWebsite', label: 'Show Website Node', icon: Globe }
                                              ].map(f => {
                                                const IconComp = f.icon;
                                                return (
                                                <div key={f.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border shadow-sm"><div className="flex items-center gap-3"><IconComp className="h-4 w-4 text-primary" /><span className="text-[11px] font-bold">{f.label}</span></div><Switch checked={s.data[f.id] !== false} onCheckedChange={v => updateBlockData(s.id, f.id, v)} className="scale-75" /></div>
                                                );
                                              })}
                                           </div>
                                        )}
                                        {s.type === 'leadForm' && (
                                          <div className="space-y-6">
                                             <div className="space-y-1.5"><Label className="text-[9px] font-bold uppercase">Form Headline</Label><Input value={s.data.title} onChange={e => updateBlockData(s.id, 'title', e.target.value)} className="bg-white rounded-xl h-10" /></div>
                                             <div className="space-y-4">
                                                {[
                                                   { id: 'showEmail', label: 'Collect Email' },
                                                   { id: 'showPhone', label: 'Collect Phone' },
                                                   { id: 'showNote', label: 'Allow Custom Note' }
                                                ].map(f => (
                                                   <div key={f.id} className="flex items-center justify-between p-3 bg-white rounded-xl border shadow-sm"><span className="text-[10px] font-bold uppercase">{f.label}</span><Switch checked={s.data[f.id] !== false} onCheckedChange={v => updateBlockData(s.id, f.id, v)} className="scale-75" /></div>
                                                ))}
                                             </div>
                                             <div className="space-y-1.5"><Label className="text-[9px] font-bold uppercase">Submit Button Text</Label><Input value={s.data.buttonText} onChange={e => updateBlockData(s.id, 'buttonText', e.target.value)} className="bg-white rounded-xl h-10" /></div>
                                          </div>
                                        )}
                                        {s.type === 'appointment' && (
                                          <div className="space-y-6">
                                             <div className="space-y-1.5"><Label className="text-[9px] font-bold uppercase">Block Title</Label><Input value={s.data.title} onChange={e => updateBlockData(s.id, 'title', e.target.value)} className="bg-white rounded-xl h-10" /></div>
                                             <div className="space-y-1.5">
                                                <Label className="text-[9px] font-bold uppercase">Booking Service URL (Calendly/Google)</Label>
                                                <Input value={s.data.url} onChange={e => updateBlockData(s.id, 'url', e.target.value)} placeholder="https://calendly.com/your-id" className="bg-white rounded-xl h-10 text-xs font-mono" />
                                             </div>
                                          </div>
                                        )}
                                        {s.type === 'services' && (
                                           <div className="space-y-6">
                                              <div className="grid grid-cols-2 gap-2">
                                                 <div className="space-y-1.5"><Label className="text-[9px] font-bold uppercase">Title (EN)</Label><Input value={s.data.title} onChange={e => updateBlockData(s.id, 'title', e.target.value)} className="bg-white rounded-xl h-10" /></div>
                                                 <div className="space-y-1.5"><Label className="text-[9px] font-bold uppercase">Title (HI)</Label><Input value={s.data.titleHi} onChange={e => updateBlockData(s.id, 'titleHi', e.target.value)} className="bg-white rounded-xl h-10 font-mukta" /></div>
                                              </div>
                                              <div className="space-y-4">
                                                 {s.data.items?.map((item: any, i: number) => (
                                                   <div key={i} className="p-4 bg-white rounded-2xl border space-y-3 relative group/item shadow-sm">
                                                      <button onClick={() => { const list = s.data.items.filter((_:any, j:number) => j !== i); updateBlockData(s.id, 'items', list); }} className="absolute top-2 right-2 h-7 w-7 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"><Trash2 className="h-4 w-4" /></button>
                                                      <Input value={item.title} onChange={e => { const list = [...s.data.items]; list[i].title = e.target.value; updateBlockData(s.id, 'items', list); }} placeholder="Skill / Service" className="h-9 font-bold text-xs" />
                                                      <Textarea value={item.desc} onChange={e => { const list = [...s.data.items]; list[i].desc = e.target.value; updateBlockData(s.id, 'items', list); }} placeholder="Short details..." className="min-h-[60px] text-[10px]" />
                                                   </div>
                                                 ))}
                                                 <Button variant="outline" size="sm" onClick={() => { const list = [...(s.data.items || []), { title: '', desc: '' }]; updateBlockData(s.id, 'items', list); }} className="w-full border-dashed rounded-xl">+ Add Expertise Node</Button>
                                              </div>
                                           </div>
                                        )}
                                        {s.type === 'testimonials' && (
                                           <div className="space-y-6">
                                              <div className="space-y-1.5"><Label className="text-[9px] font-bold uppercase">Section Title</Label><Input value={s.data.title} onChange={e => updateBlockData(s.id, 'title', e.target.value)} className="bg-white rounded-xl h-10" /></div>
                                              <div className="space-y-4">
                                                 {s.data.reviews?.map((r: any, i: number) => (
                                                   <div key={i} className="p-4 bg-white rounded-2xl border space-y-3 relative group/rev shadow-sm">
                                                      <button onClick={() => { const list = s.data.reviews.filter((_:any, j:number) => j !== i); updateBlockData(s.id, 'reviews', list); }} className="absolute top-2 right-2 h-7 w-7 text-red-500 opacity-0 group-hover/rev:opacity-100 transition-opacity"><Trash2 className="h-4 w-4" /></button>
                                                      <Input value={r.name} onChange={e => { const list = [...s.data.reviews]; list[i].name = e.target.value; updateBlockData(s.id, 'reviews', list); }} placeholder="Client Name" className="h-9 font-bold text-xs" />
                                                      <div className="flex gap-1 py-1">{[1,2,3,4,5].map(star => (<button key={star} onClick={() => { const list = [...s.data.reviews]; list[i].rating = star; updateBlockData(s.id, 'reviews', list); }} className={cn("text-amber-400", r.rating >= star ? "fill-current" : "opacity-20")}><Star key={star} className="h-4 w-4" /></button>))}</div>
                                                      <Textarea value={r.comment} onChange={e => { const list = [...s.data.reviews]; list[i].comment = e.target.value; updateBlockData(s.id, 'reviews', list); }} placeholder="The story..." className="min-h-[80px] text-[10px]" />
                                                   </div>
                                                 ))}
                                                 <Button variant="outline" size="sm" onClick={() => { const list = [...(s.data.reviews || []), { name: '', comment: '', rating: 5 }]; updateBlockData(s.id, 'reviews', list); }} className="w-full border-dashed rounded-xl">+ Add Proof Node</Button>
                                              </div>
                                           </div>
                                        )}
                                        {s.type === 'video' && (
                                           <div className="space-y-4">
                                              <div className="space-y-1.5"><Label className="text-[9px] font-bold uppercase">Video Title</Label><Input value={s.data.title} onChange={e => updateBlockData(s.id, 'title', e.target.value)} className="bg-white rounded-xl h-10" /></div>
                                              <div className="space-y-1.5"><Label className="text-[9px] font-bold uppercase">YouTube / Vimeo URL</Label><Input value={s.data.url} onChange={e => updateBlockData(s.id, 'url', e.target.value)} placeholder="https://..." className="bg-white rounded-xl h-10 text-xs font-mono" /></div>
                                           </div>
                                        )}
                                     </div>
                                  </motion.div>
                                )}
                             </AnimatePresence>
                          </div>
                        ))}
                     </div>

                     <div className="pt-6 border-t pb-24">
                        <p className="text-[10px] font-black uppercase text-muted-foreground mb-4 tracking-widest text-center">Inject Identity Element</p>
                        <div className="grid grid-cols-3 gap-2">
                           {[
                             { id: 'bio', label: 'Story', icon: FileText },
                             { id: 'social', label: 'Network', icon: Globe },
                             { id: 'contact', label: 'Direct', icon: Phone },
                             { id: 'leadForm', label: 'Leads', icon: UserCheck },
                             { id: 'appointment', label: 'Book', icon: Calendar },
                             { id: 'services', label: 'Skills', icon: Target },
                             { id: 'testimonials', label: 'Proof', icon: Quote },
                             { id: 'video', label: 'Video', icon: Video }
                           ].map(type => {
                             const IconComp = type.icon;
                             return (
                             <button key={type.id} onClick={() => addBlock(type.id)} className="p-4 rounded-[1.5rem] border-2 bg-neutral-50 hover:bg-primary/5 hover:border-primary/20 transition-all flex flex-col items-center gap-2 group">
                                <IconComp className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="text-[8px] font-black uppercase">{type.label}</span>
                             </button>
                             );
                           })}
                        </div>
                     </div>
                  </div>
                )}

                {activeEditorTab === 'style' && (
                  <div className="space-y-10 animate-in slide-in-from-bottom-2">
                     <div className="p-6 bg-neutral-50 rounded-[2.5rem] border space-y-8 shadow-sm">
                        <div className="space-y-6">
                           <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><Palette className="h-3.5 w-3.5" /> Identity Branding</Label>
                           <div className="space-y-4 pt-2">
                              <div className="space-y-2">
                                 <Label className="text-[9px] font-bold uppercase opacity-60 ml-1">Brand Accent Color</Label>
                                 <div className="flex gap-3 items-center p-3 bg-white rounded-2xl shadow-inner border">
                                    <Input type="color" value={formData.themeColor} onChange={e => setFormData({...formData, themeColor: e.target.value})} className="h-10 w-20 cursor-pointer p-0.5 border-none" />
                                    <span className="font-mono text-[11px] font-black uppercase tracking-tighter">{formData.themeColor}</span>
                                 </div>
                              </div>
                              <div className="space-y-3 pt-4 border-t">
                                 <Label className="text-[9px] font-bold uppercase opacity-60 ml-1">Typography Set</Label>
                                 <div className="grid grid-cols-2 gap-2">
                                    {FONTS.map(f => (
                                      <button key={f.id} onClick={() => setFormData({...formData, fontType: f.id})} className={cn("px-3 py-2 rounded-xl text-[9px] font-bold border-2 transition-all", formData.fontType === f.id ? "bg-primary border-primary text-white shadow-lg" : "bg-white text-muted-foreground hover:border-primary/20")}>{f.name}</button>
                                    ))}
                                 </div>
                              </div>
                              <div className="space-y-3 pt-4 border-t">
                                 <Label className="text-[9px] font-bold uppercase opacity-60 ml-1">Navigation Architecture</Label>
                                 <div className="grid grid-cols-2 gap-2">
                                    {[
                                       { id: 'scroll', label: 'Vertical Scroll', icon: LayoutList },
                                       { id: 'tabs', label: 'Multi-Page Tabs', icon: Maximize2 }
                                    ].map(m => {
                                       const NavIcon = m.icon;
                                       return (
                                       <button key={m.id} onClick={() => setFormData({...formData, navMode: m.id})} className={cn("p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all", (formData.navMode || 'scroll') === m.id ? "bg-primary border-primary text-white shadow-lg" : "bg-white text-muted-foreground hover:bg-neutral-100")}>
                                          <NavIcon className="h-4 w-4" />
                                          <span className="text-[8px] font-black uppercase">{m.label}</span>
                                       </button>
                                       );
                                    })}
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="p-8 bg-neutral-900 text-white rounded-[3rem] space-y-10 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12"><Paintbrush className="h-24 w-24 text-accent" /></div>
                        <Label className="text-[10px] font-black uppercase text-accent tracking-widest flex items-center gap-2 relative z-10"><Paintbrush className="h-4 w-4" /> Visual Environment</Label>
                        
                        <div className="space-y-8 relative z-10">
                           <div className="space-y-6">
                              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Surface Engine</span>
                                 <div className="flex gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                                    {['solid', 'gradient'].map(type => (
                                      <button key={type} onClick={() => setFormData({...formData, cardBgType: type})} className={cn("px-4 py-1.5 rounded-md text-[8px] font-black uppercase transition-all", formData.cardBgType === type ? "bg-accent text-white shadow-lg" : "text-white/30")}>{type}</button>
                                    ))}
                                 </div>
                              </div>
                              <div className="flex gap-3">
                                 <div className="flex-1 space-y-2"><Label className="text-[8px] font-bold uppercase opacity-40">Primary Surface</Label><Input type="color" value={formData.cardBgColor1} onChange={e => setFormData({...formData, cardBgColor1: e.target.value})} className="h-11 w-full p-0.5 border-none bg-white/10 rounded-2xl cursor-pointer" /></div>
                                 {formData.cardBgType === 'gradient' && <div className="flex-1 space-y-2 animate-in zoom-in-95"><Label className="text-[8px] font-bold uppercase opacity-40">Accent Surface</Label><Input type="color" value={formData.cardBgColor2} onChange={e => setFormData({...formData, cardBgColor2: e.target.value})} className="h-11 w-full p-0.5 border-none bg-white/10 rounded-2xl cursor-pointer" /></div>}
                              </div>
                           </div>
                           
                           <div className="space-y-6 pt-4 border-t border-white/10">
                              <div className="flex items-center justify-between"><Label className="text-[9px] font-black uppercase text-white/60 flex items-center gap-2"><Maximize2 className="h-3.5 w-3.5 text-accent" /> Glass Architecture</Label><Switch checked={formData.glassEnabled} onCheckedChange={v => setFormData({...formData, glassEnabled: v})} className="scale-75 data-[state=checked]:bg-accent" /></div>
                           </div>

                           <div className="space-y-5 pt-4 border-t border-white/10">
                              <div className="flex items-center justify-between"><Label className="text-[9px] font-black uppercase text-white/60">Node Roundness</Label><Badge variant="outline" className="text-accent border-accent/20 text-[9px] font-mono">{formData.cardRadius || 32}px</Badge></div>
                              <Slider value={[formData.cardRadius || 32]} min={0} max={64} step={4} onValueChange={v => setFormData({...formData, cardRadius: v[0]})} />
                           </div>
                        </div>
                     </div>
                  </div>
                )}

                {activeEditorTab === 'settings' && (
                  <div className="space-y-10 animate-in slide-in-from-right-2">
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-2"><Globe className="h-3.5 w-3.5" /> Identity Registry Node</Label>
                        <div className="relative group">
                           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground opacity-30">linkqr.in/id/</div>
                           <Input 
                              value={formData.slug} 
                              onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
                              placeholder="unique-handle" 
                              className="h-16 pl-24 rounded-[1.5rem] bg-neutral-50 border-none font-black text-lg focus:bg-white transition-all shadow-inner"
                           />
                        </div>
                     </div>

                     <div className="p-6 bg-neutral-50 rounded-[2rem] border space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-black uppercase flex items-center gap-2">
                            <Languages className="h-4 w-4 text-primary" /> Bilingual Switch
                          </Label>
                          <Switch checked={formData.langToggleEnabled} onCheckedChange={v => setFormData({...formData, langToggleEnabled: v})} />
                        </div>
                        <p className="text-[9px] text-muted-foreground leading-relaxed italic">Adds a Hindi/English toggle at the top of your card.</p>
                     </div>
                     
                     <div className="p-8 bg-neutral-50 rounded-[3rem] border-2 border-dashed space-y-6">
                        <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner"><SearchCode className="h-5 w-5" /></div><h4 className="font-black text-xs uppercase tracking-tight">Search Optimizer</h4></div>
                        <div className="space-y-4">
                           <div className="space-y-2"><Label className="text-[9px] font-bold uppercase opacity-60">SEO Meta Description</Label><Textarea value={formData.seoDesc} onChange={e => setFormData({...formData, seoDesc: e.target.value})} placeholder="How you want to appear on Google index..." className="min-h-[120px] rounded-2xl bg-white border-none shadow-inner text-xs leading-relaxed" /></div>
                        </div>
                     </div>
                  </div>
                )}
              </div>
           </Tabs>
        </aside>

        <main ref={stageRef} className="hidden lg:flex flex-1 bg-neutral-200/50 p-12 flex-col items-center overflow-y-auto custom-scrollbar">
           <div className="flex gap-4 mb-6">
              <button onClick={() => setPreviewDevice('mobile')} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all", previewDevice === 'mobile' ? "bg-primary text-white shadow-xl" : "bg-white text-muted-foreground")}><Smartphone className="h-4 w-4" /> Mobile</button>
              <button onClick={() => setPreviewDevice('tablet')} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all", previewDevice === 'tablet' ? "bg-primary text-white shadow-xl" : "bg-white text-muted-foreground")}><Tablet className="h-4 w-4" /> Tablet</button>
           </div>
           
           <div 
              className={cn(
                "bg-neutral-900 shadow-2xl relative flex flex-col transition-all duration-700 ease-out shrink-0",
                previewDevice === 'mobile' ? "w-[375px] rounded-[3.5rem] border-[12px] h-[780px]" : "w-[600px] rounded-[3rem] border-[14px] h-[900px]"
              )} 
              style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
           >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-900 rounded-b-2xl z-[60] flex items-center justify-center">
                 <div className="h-1 w-10 bg-neutral-800 rounded-full"></div>
              </div>
              
              <div 
                className={cn("flex-1 overflow-y-auto bg-white flex flex-col relative custom-scrollbar pb-32", formData.fontType)} 
                style={{ 
                   background: formData.cardBgType === 'gradient' ? `linear-gradient(135deg, ${formData.cardBgColor1}, ${formData.cardBgColor2})` : formData.cardBgColor1 
                }}
              >
                 <div className="relative z-10 flex flex-col min-h-full">
                    <div className="flex justify-end p-4 relative z-50">
                       <div className="bg-white/50 backdrop-blur-md rounded-lg p-1 flex gap-1 border shadow-sm">
                          <button onClick={() => setLang('en')} className={cn("px-3 py-1 rounded text-[9px] font-black", lang === 'en' ? "bg-white shadow-sm" : "opacity-40")}>EN</button>
                          <button onClick={() => setLang('hi')} className={cn("px-3 py-1 rounded text-[9px] font-black font-mukta", lang === 'hi' ? "bg-white shadow-sm" : "opacity-40")}>हिं</button>
                       </div>
                    </div>

                    <div className={cn(
                      "flex flex-col text-center space-y-6 relative overflow-hidden transition-all duration-700 z-[30]",
                      formData.headerLayout === 'cover' ? 'pt-0 pb-16' : 'pt-12 pb-12 px-8',
                      formData.headerAlign === 'left' ? 'items-start text-left' : formData.headerAlign === 'right' ? 'items-end text-right' : 'items-center text-center'
                    )}>
                       {formData.headerLayout === 'cover' && (
                         <div className="w-full h-48 bg-neutral-100 relative overflow-hidden mb-6">
                            {formData.photoUrl && <img src={formData.photoUrl} className="w-full h-full object-cover blur-xl opacity-40" alt="" />}
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                         </div>
                       )}

                       {formData.headerLayout === 'split' ? (
                          <div className="flex items-center gap-6 px-8 py-6 w-full">
                             <div className={cn(
                                "bg-white shadow-xl overflow-hidden shrink-0 border-2 border-white relative z-10",
                                formData.photoShape === 'circle' ? 'rounded-full' : formData.photoShape === 'rounded' ? 'rounded-2xl' : 'rounded-none',
                                "h-24 w-24"
                             )}>
                                {formData.photoUrl ? <img src={formData.photoUrl} className="h-full w-full object-cover" alt="" /> : <UserCircle className="h-12 w-12 m-auto mt-6 text-neutral-100" />}
                             </div>
                             <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-black truncate">{formData.fullName || "Your Name"}</h3>
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60" style={{ color: formData.themeColor }}>{formData.designation}</p>
                             </div>
                          </div>
                       ) : (
                          <>
                             <div className={cn(
                                "bg-white shadow-2xl overflow-hidden relative z-10 border-4 border-white flex items-center justify-center transition-all duration-700",
                                formData.headerLayout === 'cover' ? 'mt-[-80px] h-32 w-32' : 'h-36 w-36',
                                formData.photoShape === 'circle' ? 'rounded-full' : formData.photoShape === 'rounded' ? 'rounded-[2.5rem]' : 'rounded-none'
                             )}>
                                {formData.photoUrl ? <img src={formData.photoUrl} className="h-full w-full object-cover" alt="" /> : <UserCircle className="h-20 w-20 text-neutral-100" />}
                             </div>
                             
                             <div className="space-y-1 relative z-10 px-6">
                                <h3 className="text-2xl sm:text-3xl font-black tracking-tight">{formData.fullName || "Your Full Name"}</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: formData.themeColor }}>{formData.designation} {formData.company ? `• ${formData.company}` : ''}</p>
                             </div>
                          </>
                       )}
                       
                       <div className="px-8 w-full flex flex-col gap-4">
                          <Button className="w-full h-14 font-black text-xs uppercase tracking-widest relative z-10 shadow-2xl transition-all flex items-center justify-center gap-3" style={{ backgroundColor: formData.btnColor || formData.themeColor || '#6750A4', borderRadius: '18px', color: '#ffffff' }}>
                             {getPrimaryIcon()} {formData.btnText || 'Save Contact'}
                          </Button>
                          {formData.secondaryBtnEnabled && (
                            <Button variant="outline" className="w-full h-14 font-black text-xs uppercase tracking-widest relative z-10 shadow-sm border-2 flex items-center justify-center gap-3" style={{ backgroundColor: formData.secondaryBtnColor || '#f3f4f6', borderColor: formData.secondaryBtnBorderColor || '#e5e7eb', color: formData.secondaryBtnTextColor || '#111827', borderRadius: '18px' }}>
                               {getSecondaryIcon()} {formData.secondaryBtnText || 'Schedule Call'}
                            </Button>
                          )}
                       </div>
                    </div>

                    <div className="px-8 space-y-8 flex-1 mt-10 relative z-[20]">
                       {formData.navMode === 'tabs' && (
                          <div className="bg-white/50 backdrop-blur-md p-1 rounded-2xl border flex gap-1 mb-6 overflow-x-auto no-scrollbar shadow-sm">
                             {formData.sections.map((s:any) => (
                                <button 
                                  key={s.id} 
                                  onClick={() => setEditingBlockId(s.id)}
                                  className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all flex items-center gap-2", 
                                    (editingBlockId === s.id || (!editingBlockId && formData.sections[0]?.id === s.id)) ? "bg-white text-primary shadow-sm" : "text-muted-foreground opacity-40"
                                  )}
                                >
                                  {s.type}
                                </button>
                             ))}
                          </div>
                       )}

                       {visibleSectionsPreview.map((s: any) => (
                         <div key={s.id} className={cn("p-8 transition-all duration-500 relative overflow-hidden mb-6", formData.glassEnabled ? "bg-white/40 backdrop-blur-xl border border-white/20 shadow-xl" : "bg-white border border-neutral-100 shadow-sm")} style={{ borderRadius: `${formData.cardRadius || 32}px` }}>
                            {s.type === 'bio' && (
                               <div className="space-y-4">
                                  <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Narrative</p>
                                  <p className={cn("text-sm sm:text-base leading-relaxed font-bold italic opacity-80", lang === 'hi' && "font-mukta text-lg")}>
                                     "{lang === 'hi' && s.data.contentHi ? s.data.contentHi : s.data.content}"
                                  </p>
                               </div>
                            )}
                            {s.type === 'social' && s.data.items?.length > 0 && (
                               <div className="space-y-6">
                                  <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Network Presence</p>
                                  <div className="grid grid-cols-4 gap-4">
                                     {s.data.items.map((item:any, idx:number) => (
                                       <div key={idx} className="aspect-square rounded-2xl flex items-center justify-center bg-white shadow-xl hover:scale-110 transition-all active:scale-95 border border-neutral-100 group">
                                          <img src={`https://cdn.simpleicons.org/${item.platform}/${formData.themeColor.replace('#','')}`} className="h-6 w-6" alt="" />
                                       </div>
                                     ))}
                                  </div>
                               </div>
                            )}
                            {s.type === 'contact' && (
                               <div className="space-y-6">
                                  <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Direct Hub</p>
                                  <div className="space-y-4">
                                     {s.data.showMobile && formData.mobile && <div className="flex items-center gap-4 p-4 bg-neutral-50/50 rounded-2xl border shadow-inner"><div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${formData.themeColor}15`, color: formData.themeColor }}><Phone className="h-5 w-5" /></div><p className="text-xs font-bold truncate">{formData.mobile}</p></div>}
                                     {s.data.showEmail && formData.email && <div className="flex items-center gap-4 p-4 bg-neutral-50/50 rounded-2xl border shadow-inner"><div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${formData.themeColor}15`, color: formData.themeColor }}><Mail className="h-5 w-5" /></div><p className="text-xs font-bold truncate">{formData.email}</p></div>}
                                     {s.data.showWebsite && formData.website && <div className="flex items-center gap-4 p-4 bg-neutral-50/50 rounded-2xl border shadow-inner"><div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${formData.themeColor}15`, color: formData.themeColor }}><Globe className="h-5 w-5" /></div><p className="text-xs font-bold truncate">{formData.website}</p></div>}
                                  </div>
                               </div>
                            )}
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </main>
      </div>

      {/* Signature Dialog */}
      <Dialog open={isSignatureDialogOpen} onOpenChange={setIsSignatureDialogOpen}>
         <DialogContent className="sm:max-w-xl rounded-[2rem] p-8 border-none shadow-2xl">
            <DialogHeader>
               <DialogTitle className="text-2xl font-black flex items-center gap-3">
                  <Mail className="h-6 w-6 text-primary" /> Email Signature
               </DialogTitle>
               <DialogDescription>Copy this professional snippet into your Gmail or Outlook signature settings.</DialogDescription>
            </DialogHeader>
            <div className="py-10 flex justify-center">
               <div id="sig-snippet" className="p-6 bg-white border-2 rounded-2xl flex items-center gap-6 shadow-xl max-w-full overflow-hidden text-left">
                  <img src={formData.photoUrl || "https://picsum.photos/seed/user/100/100"} className="h-16 w-16 rounded-full border-2 border-primary object-cover shrink-0" alt="" />
                  <div className="min-w-0">
                     <p className="font-black text-lg text-neutral-900 truncate">{formData.fullName || "Your Name"}</p>
                     <p className="text-[10px] font-bold text-primary uppercase tracking-widest truncate">{formData.designation} {formData.company ? `@ ${formData.company}` : ''}</p>
                     <div className="mt-3 pt-2 border-t flex items-center gap-3">
                        <a to={publicUrl} target="_blank" style={{ color: formData.themeColor }} className="text-[9px] font-black uppercase tracking-tighter hover:underline">View Digital ID</a>
                     </div>
                  </div>
               </div>
            </div>
            <DialogFooter>
               <Button onClick={() => {
                  const el = document.getElementById('sig-snippet');
                  if (el) {
                    const range = document.createRange();
                    range.selectNode(el);
                    window.getSelection()?.removeAllRanges();
                    window.getSelection()?.addRange(range);
                    document.execCommand('copy');
                    toast({ title: "Signature Copied", description: "Paste it directly into your email settings." });
                  }
               }} className="w-full h-14 rounded-xl font-black gap-2">
                  <Copy className="h-4 w-4" /> COPY SNIPPET
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* NFC Dialog */}
      <Dialog open={isNfcDialogOpen} onOpenChange={setIsNfcDialogOpen}>
         <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl">
            <DialogHeader>
               <DialogTitle className="text-2xl font-black flex items-center gap-3">
                  <Nfc className="h-6 w-6 text-primary" /> NFC Bridge Node
               </DialogTitle>
               <DialogDescription>Write your public identity link to physical NFC hardware.</DialogDescription>
            </DialogHeader>
            <div className="py-8 space-y-6">
               <div className="p-6 bg-neutral-50 rounded-2xl border-2 border-dashed space-y-4">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center">Your Universal Link</p>
                  <div className="bg-white p-4 rounded-xl border text-center font-mono text-xs font-bold text-primary truncate shadow-inner">
                     {publicUrl}
                  </div>
                  <Button variant="outline" onClick={() => { navigator.clipboard.writeText(publicUrl); toast({title: "Link Copied"}); }} className="w-full h-11 rounded-xl font-bold border-2">Copy Link for NFC</Button>
               </div>
               <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex gap-5">
                  <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-[10px] text-primary font-bold leading-relaxed">
                     Tip: Use an app like "NFC Tools" on your smartphone to write this URL to a blank NFC tag or business card.
                  </p>
               </div>
            </div>
            <DialogFooter>
               <Button onClick={() => setIsNfcDialogOpen(false)} className="w-full h-12 rounded-xl font-black">GOT IT</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* QR Identity Dialog */}
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl text-center">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
                 <QrCode className="h-6 w-6 text-primary" /> ID Asset Node
              </DialogTitle>
              <DialogDescription>Branded QR for your business cards.</DialogDescription>
            </DialogHeader>
            <div className="py-8 flex flex-col items-center gap-6">
               <div className="bg-white p-6 rounded-[2.5rem] shadow-inner border-8 border-neutral-50">
                  <QRCodeSVG 
                    id="vcard-qr-svg"
                    value={publicUrl} 
                    size={220} 
                    level="H" 
                    fgColor={formData.themeColor || "#000000"} 
                    imageSettings={formData.photoUrl ? { src: formData.photoUrl, height: 50, width: 50, excavate: true } : undefined}
                  />
               </div>
               <Badge className="bg-primary/10 text-primary font-black px-4 h-6 text-[10px] uppercase">{formData.slug || "Universal Node"}</Badge>
            </div>
            <DialogFooter>
              <Button onClick={() => {
                 const svg = document.getElementById("vcard-qr-svg") as unknown as SVGSVGElement;
                 if (!svg) return;
                 const svgData = new XMLSerializer().serializeToString(svg);
                 const canvas = document.createElement("canvas");
                 const ctx = canvas.getContext("2d");
                 const img = new Image();
                 img.onload = () => {
                    canvas.width = img.width; canvas.height = img.height;
                    ctx?.drawImage(img, 0, 0);
                    const link = document.createElement("a");
                    link.download = `ID-QR-${formData.fullName}.png`;
                    link.href = canvas.toDataURL("image/png");
                    link.click();
                 };
                 img.src = "data:image/svg+xml;base64," + btoa(svgData);
              }} className="w-full h-14 rounded-xl font-black gap-2">
                 <Download className="h-4 w-4" /> DOWNLOAD HD PNG
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

function Play(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}
