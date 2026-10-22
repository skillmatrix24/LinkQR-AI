
"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  ArrowLeft, 
  Loader2, 
  Smartphone, 
  Zap, 
  Trash2, 
  Plus, 
  Save,
  QrCode,
  Layers,
  Edit2,
  Globe,
  Palette,
  Eye,
  Settings,
  BrainCircuit,
  Monitor,
  Tablet,
  ChevronUp,
  ChevronDown,
  X,
  ShoppingBag,
  Target,
  ShieldCheck,
  Brain,
  BookmarkPlus
} from "lucide-react";
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  useDoc,
  useMemoFirebase, 
  setDocumentNonBlocking, 
  updateDocumentNonBlocking, 
  useStorage, 
  deleteDocumentNonBlocking 
} from "@/firebase";
import { 
  doc, 
  serverTimestamp, 
  collection, 
  query, 
  increment, 
  orderBy,
  getDoc
} from "firebase/firestore";
import { uploadBytes, getDownloadURL, ref } from "firebase/storage";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { generateMicroSiteContent } from "@/ai/flows/ai-microsite-flow";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

// ShadCN UI Imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

// Modular Imports
import { IdentityTab } from "./tabs/IdentityTab";
import { DesignTab } from "./tabs/DesignTab";
import { AutomationTab } from "./tabs/AutomationTab";
import { LibraryTab } from "./tabs/LibraryTab";
import { InspectorPanel } from "./InspectorPanel";
import { AVAILABLE_BLOCKS, getBlockDefaults } from "./block-defaults";

const ADMIN_EMAILS = ['admin@test.com', 'skillmatrix24@gmail.com', 'thegingerleaf77@gmail.com'];

function MicroSiteBuilderContent() {
  const router = useNavigate();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const templateType = searchParams.get('template');
  const loadTemplateId = searchParams.get('loadTemplateId');
  const initialType = searchParams.get('type') || (templateType === 'vcard' ? 'vcard' : 'microsite');

  const [viewMode, setViewMode] = useState<'list' | 'edit'>(editId || loadTemplateId || templateType ? 'edit' : 'list');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(0);
  const [mobileTab, setMobileTab] = useState<'navigator' | 'preview' | 'inspector'>('navigator');

  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const storage = useStorage();

  const userProfileRef = useMemoFirebase(() => (db && user?.uid) ? doc(db, "users", user.uid) : null, [db, user?.uid]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(userProfileRef);
  const isAdmin = !!(profile?.isAdmin === true || (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())));

  const sitesRef = useMemoFirebase(() => (db && user?.uid) ? query(collection(db, "users", user.uid, "microsites"), orderBy("updatedAt", "desc")) : null, [db, user?.uid]);
  const { data: allSites, isLoading: isSitesLoading } = useCollection(sitesRef);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  const initialData = {
    id: editId || crypto.randomUUID(),
    type: initialType, 
    slug: "",
    businessName: "",
    aiGoal: "",
    aiAudience: "",
    aiOffer: "",
    aiDescription: "",
    protectDesign: true,
    logoUrl: "",
    themeColor: "#6750A4",
    themeVariant: "light",
    fontType: "font-body",
    cardRadius: 32,
    sections: [],
    notificationEmail: user?.email || "",
    emailNotificationsEnabled: true
  };

  const [pageData, setPageData] = useState<any>(initialData);
  const hasInitialized = useRef(false);

  const siteConfigRef = useMemoFirebase(() => db ? doc(db, "config", "site") : null, [db]);
  const { data: siteConfig } = useDoc(siteConfigRef);
  const baseUrl = siteConfig?.publicBaseUrl?.replace(/\/$/, "") || "https://linkqr.in";

  useEffect(() => {
    if (viewMode !== 'edit' || !stageRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) setStageWidth(entry.contentRect.width - 40);
    });
    resizeObserver.observe(stageRef.current);
    return () => resizeObserver.disconnect();
  }, [viewMode, mobileTab]);

  const targetWidth = previewDevice === 'mobile' ? 375 : previewDevice === 'tablet' ? 768 : 1280;
  const scale = stageWidth > 0 ? Math.min(1, stageWidth / targetWidth) : 1;

  const syncPreview = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ 
        type: 'MICROSITE_PREVIEW_DATA', 
        data: JSON.parse(JSON.stringify(pageData)) 
      }, '*');
    }
  };

  useEffect(() => {
    if (viewMode === 'edit') syncPreview();
  }, [pageData, viewMode]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PREVIEW_SECTION_CLICKED') {
        setEditingSectionId(event.data.sectionId);
        if (window.innerWidth < 1024) setMobileTab('inspector');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (hasInitialized.current || isProfileLoading || isSitesLoading) return;

    const performInit = async () => {
        if (editId && db && user?.uid) {
            let foundData = allSites?.find(s => s.id === editId);
            if (!foundData) {
                const idSnap = await getDoc(doc(db, "users", user.uid, "digitalIDs", editId));
                if (idSnap.exists()) foundData = idSnap.data();
            }
            if (foundData) {
                setPageData({ ...initialData, ...foundData });
                setViewMode('edit');
                hasInitialized.current = true;
                return;
            }
        }

        if (templateType === 'vcard' && profile && user) {
            const cardId = `vcard-${crypto.randomUUID().substring(0, 8)}`;
            const bioId = `bio-${crypto.randomUUID().substring(0, 8)}`;
            const portfolioId = `gal-${crypto.randomUUID().substring(0, 8)}`;
            const reviewsId = `rev-${crypto.randomUUID().substring(0, 8)}`;
            const socialId = `social-${crypto.randomUUID().substring(0, 8)}`;
            const contactId = `contact-${crypto.randomUUID().substring(0, 8)}`;

            setPageData({
                ...initialData,
                type: 'vcard',
                id: editId || initialData.id,
                businessName: profile.displayName || "Digital ID",
                sections: [
                   { id: cardId, type: 'vcard', data: getBlockDefaults('vcard', profile, user) },
                   { id: bioId, type: 'bio', data: getBlockDefaults('bio', profile, user) },
                   { id: portfolioId, type: 'gallery', data: getBlockDefaults('gallery', profile, user) },
                   { id: reviewsId, type: 'reviews', data: getBlockDefaults('reviews', profile, user) },
                   { id: socialId, type: 'social', data: getBlockDefaults('social', profile, user) },
                   { id: contactId, type: 'contact', data: getBlockDefaults('contact', profile, user) }
                ]
            });
            setEditingSectionId(cardId);
            setViewMode('edit');
            hasInitialized.current = true;
            return;
        }

        if (loadTemplateId && db) {
            const tSnap = await getDoc(doc(db, "smartTemplates", loadTemplateId));
            if (tSnap.exists()) {
                const tData = tSnap.data();
                setPageData({
                    ...initialData,
                    sections: tData.sections || [],
                    themeColor: tData.design?.themeColor || initialData.themeColor,
                    themeVariant: tData.design?.themeVariant || initialData.themeVariant,
                    cardRadius: tData.design?.cardRadius || initialData.cardRadius,
                    fontType: tData.design?.fontType || initialData.fontType
                });
                setViewMode('edit');
                hasInitialized.current = true;
            }
        }
    };

    performInit();
  }, [editId, allSites, templateType, isProfileLoading, profile, user, db, loadTemplateId, isSitesLoading]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string, sectionId?: string, index?: number) => {
    const file = e.target.files?.[0];
    if (!file || !storage || !user?.uid) return;
    setUploadingField(sectionId ? `${sectionId}-${field}-${index}` : field);
    try {
      const storagePath = `users/${user.uid}/microsites/${pageData.id}/${field}/${Date.now()}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      if (sectionId) {
        const next = pageData.sections.map((s: any) => {
          if (s.id === sectionId) {
            const data = { ...s.data };
            if (index !== undefined && Array.isArray(data.items)) {
              data.items[index] = { ...data.items[index], [field]: url };
            } else if (index !== undefined && Array.isArray(data.gallery)) {
              data.gallery[index] = { ...data.gallery[index], [field]: url };
            } else if (index !== undefined && Array.isArray(data.reviews)) {
              data.reviews[index] = { ...data.reviews[index], [field]: url };
            } else {
              data[field] = url;
            }
            return { ...s, data };
          }
          return s;
        });
        setPageData({ ...pageData, sections: next });
      } else {
        setPageData({ ...pageData, [field]: url });
      }
      toast({ title: "Asset Uploaded" });
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = async () => {
    if (!db || !user?.uid) return;
    setIsSaving(true);
    try {
      const collectionName = pageData.type === 'vcard' ? 'digitalIDs' : 'microsites';
      const siteRef = doc(db, "users", user.uid, collectionName, pageData.id);
      
      const finalData = { 
        ...pageData, 
        userId: user.uid, 
        updatedAt: serverTimestamp(), 
        createdAt: pageData.createdAt || serverTimestamp() 
      };
      
      setDocumentNonBlocking(siteRef, finalData, { merge: true });

      const regRef = doc(db, "publicSmartPages", pageData.id);
      setDocumentNonBlocking(regRef, { 
        micrositeId: pageData.id, 
        userId: user.uid, 
        collectionName, 
        type: pageData.type || 'microsite',
        slug: pageData.slug || null, 
        updatedAt: serverTimestamp() 
      }, { merge: true });

      if (pageData.slug) {
          const slugRegRef = doc(db, "publicSmartPages", pageData.slug);
          setDocumentNonBlocking(slugRegRef, { 
            micrositeId: pageData.id, 
            userId: user.uid, 
            collectionName,
            type: pageData.type || 'microsite',
            slug: pageData.slug, 
            updatedAt: serverTimestamp() 
          }, { merge: true });
      }

      toast({ title: "Identity Hub Synced" });
      navigate(pageData.type === 'vcard' ? '/dashboard/vcards' : '/dashboard/qrs/microsite');
    } finally {
      setIsSaving(false);
    }
  };

  const addSection = (type: string) => {
    const id = `${type}-${crypto.randomUUID().substring(0, 8)}`;
    const defaultData = getBlockDefaults(type, profile, user);
    setPageData((prev: any) => ({ ...prev, sections: [...prev.sections, { id, type, data: defaultData }] }));
    setEditingSectionId(id);
    if (window.innerWidth < 1024) setMobileTab('inspector');
  };

  const removeBlock = (id: string) => {
    setPageData((prev: any) => ({
      ...prev,
      sections: prev.sections.filter((s: any) => s.id !== id)
    }));
    if (editingSectionId === id) setEditingSectionId(null);
  };

  const moveBlock = (index: number, dir: 'up' | 'down') => {
    setPageData((prev: any) => {
      const next = [...prev.sections];
      const target = dir === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, sections: next };
    });
  };

  /** Move items within a block (e.g. social links, benefits) */
  const moveItem = (field: string, index: number, dir: 'up' | 'down') => {
    if (!editingSectionId) return;
    setPageData((prev: any) => {
      const sections = prev.sections.map((s: any) => {
        if (s.id === editingSectionId) {
          const list = [...(s.data[field] || [])];
          const target = dir === 'up' ? index - 1 : index + 1;
          if (target < 0 || target >= list.length) return s;
          [list[index], list[target]] = [list[target], list[index]];
          return { ...s, data: { ...s.data, [field]: list } };
        }
        return s;
      });
      return { ...prev, sections };
    });
  };

  const updateSectionData = (id: string, newData: any) => {
    setPageData((prev: any) => ({
      ...prev,
      sections: prev.sections.map((s: any) => s.id === id ? { ...s, data: newData } : s)
    }));
  };

  const addItem = (field: string, item: any) => {
    if (!editingSectionId) return;
    setPageData((prev: any) => {
      const sections = prev.sections.map((s: any) => {
        if (s.id === editingSectionId) {
          return { ...s, data: { ...s.data, [field]: [...(s.data[field] || []), item] } };
        }
        return s;
      });
      return { ...prev, sections };
    });
  };

  const removeItem = (field: string, index: number) => {
    if (!editingSectionId) return;
    setPageData((prev: any) => {
      const sections = prev.sections.map((s: any) => {
        if (s.id === editingSectionId) {
          const newList = (s.data[field] || []).filter((_: any, i: number) => i !== index);
          return { ...s, data: { ...s.data, [field]: newList } };
        }
        return s;
      });
      return { ...prev, sections };
    });
  };

  const updateItem = (field: string, index: number, key: string, value: any) => {
    if (!editingSectionId) return;
    setPageData((prev: any) => {
      const sections = prev.sections.map((s: any) => {
        if (s.id === editingSectionId) {
          const list = [...(s.data[field] || [])];
          list[index] = { ...list[index], [key]: value };
          return { ...s, data: { ...s.data, [field]: list } };
        }
        return s;
      });
      return { ...prev, sections };
    });
  };

  const handleMagicBuild = async () => {
    if (!pageData.businessName || !pageData.aiGoal) {
      toast({ variant: "destructive", title: "Input Required", description: "Name and Goal are mandatory." });
      return;
    }
    setIsLoading(true);
    try {
      const res = await generateMicroSiteContent({ 
        businessName: pageData.businessName, 
        goal: pageData.aiGoal, 
        audience: pageData.aiAudience,
        offer: pageData.aiOffer,
        description: pageData.aiDescription 
      });
      const mapped = res.sections.map(s => ({ id: `${s.type}-${crypto.randomUUID().substring(0, 8)}`, type: s.type, data: s.data }));
      setPageData((prev: any) => ({ ...prev, themeColor: res.design.themeColor, cardRadius: res.design.cardRadius, fontType: res.design.fontType, sections: mapped }));
      toast({ title: "Page Optimized by AI" });
    } finally {
      setIsLoading(false);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Smart <span className="text-primary">Studio</span></h1>
            <p className="text-muted-foreground font-medium">Build identity hubs and sales funnels.</p>
          </div>
          <Button onClick={() => { setPageData(initialData); setViewMode('edit'); }} className="h-14 px-8 rounded-2xl font-black gap-3 shadow-xl"><Plus className="h-6 w-6" /> CREATE PAGE</Button>
        </div>
        {isSitesLoading ? <div className="flex justify-center py-40"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div> : (allSites && allSites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allSites.map(siteDoc => (
              <Card key={siteDoc.id} className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden group hover:shadow-2xl transition-all">
                <div className="aspect-video relative overflow-hidden bg-neutral-100">
                  <img src={siteDoc.heroImage || siteDoc.sections?.find((s:any) => s.type === 'vcard' || s.type === 'hero')?.data?.photoUrl || "https://picsum.photos/seed/promo/800/600"} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Button size="sm" className="rounded-xl font-bold" onClick={() => { setPageData(siteDoc); setViewMode('edit'); }}><Edit2 className="h-4 w-4 mr-2" /> Edit</Button>
                    <Button size="sm" variant="secondary" className="rounded-xl font-bold" asChild><a to={`/s/${siteDoc.slug || siteDoc.id}`} target="_blank"><Eye className="h-4 w-4 mr-2" /> View</a></Button>
                  </div>
                </div>
                <CardContent className="p-8 space-y-4">
                  <h3 className="text-xl font-black truncate">{siteDoc.businessName || siteDoc.sections?.find((s:any) => s.type === 'vcard')?.data?.fullName || "Untitled Studio"}</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-xl h-11 text-[10px] font-black uppercase" asChild><Link to="/dashboard/qrs/microsite/leads">View Leads</Link></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if(window.confirm("Delete this page?")) deleteDocumentNonBlocking(doc(db!, "users", user!.uid, "microsites", siteDoc.id)); }} className="h-11 w-11 rounded-xl text-muted-foreground hover:text-red-50"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : <div className="py-40 text-center opacity-30 flex flex-col items-center gap-6"><Smartphone className="h-16 w-16" /><h3 className="text-2xl font-black uppercase">Start Your First Design</h3><Button asChild><Link to="/dashboard/vcards/new">New Digital ID</Link></Button></div>)}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="fixed inset-0 z-[9999] bg-neutral-50 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(pageData.type === 'vcard' ? '/dashboard/vcards' : '/dashboard/qrs/microsite')} className="rounded-xl font-bold gap-2"><ArrowLeft className="h-4 w-4" /> Exit</Button>
            <div className="h-6 w-px bg-neutral-100 hidden sm:block"></div>
            <h2 className="font-black text-xs sm:text-sm uppercase tracking-tight truncate max-w-[150px] sm:max-w-[300px]">{pageData.businessName || "Draft Studio Node"}</h2>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleSave} disabled={isSaving} className="h-10 px-6 rounded-xl font-bold gap-2 border-2">{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</Button>
            <Button onClick={handleSave} disabled={isSaving} className="h-10 px-8 rounded-xl font-black bg-primary text-white shadow-lg">Publish</Button>
          </div>
        </header>

        <div className="lg:hidden w-full bg-white border-b flex items-center justify-around h-14 shrink-0 shadow-sm z-[45]">
           <button onClick={() => setMobileTab('navigator')} className={cn("flex-1 h-full flex flex-col items-center justify-center gap-1", mobileTab === 'navigator' ? "text-primary bg-primary/5" : "text-muted-foreground")}><Layers className="h-4 w-4" /><span className="text-[8px] font-black uppercase">Architecture</span></button>
           <button onClick={() => setMobileTab('preview')} className={cn("flex-1 h-full flex flex-col items-center justify-center gap-1 border-x", mobileTab === 'preview' ? "text-primary bg-primary/5" : "text-muted-foreground")}><Eye className="h-4 w-4" /><span className="text-[8px] font-black uppercase">Preview</span></button>
           <button onClick={() => setMobileTab('inspector')} className={cn("flex-1 h-full flex flex-col items-center justify-center gap-1", mobileTab === 'inspector' ? "text-primary bg-primary/5" : "text-muted-foreground")}><Settings className="h-4 w-4" /><span className="text-[8px] font-black uppercase">Editor</span></button>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          <aside className={cn("w-80 bg-white border-r flex flex-col overflow-hidden shrink-0 shadow-xl z-50 transition-all", mobileTab === 'navigator' ? "flex w-full absolute inset-0 lg:relative lg:w-80" : "hidden lg:flex")}>
            <Tabs defaultValue="blocks" className="flex flex-col h-full">
              <TabsList className="grid grid-cols-5 h-12 p-1 bg-neutral-100 rounded-none shrink-0 border-b">
                <TabsTrigger value="identity" title="Brand & Links"><Globe className="h-4 w-4" /></TabsTrigger>
                <TabsTrigger value="blocks" title="Architecture"><Layers className="h-4 w-4" /></TabsTrigger>
                <TabsTrigger value="library" title="Library"><BookmarkPlus className="h-4 w-4" /></TabsTrigger>
                <TabsTrigger value="design" title="Visual Style"><Palette className="h-4 w-4" /></TabsTrigger>
                <TabsTrigger value="automations" title="Automation Hub"><Zap className="h-4 w-4" /></TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-y-auto p-4 pb-32 custom-scrollbar">
                <TabsContent value="identity" className="m-0">
                  <IdentityTab 
                    pageData={pageData} 
                    setPageData={setPageData} 
                    uploadingField={uploadingField} 
                    handleImageUpload={(e: React.ChangeEvent<HTMLInputElement>, f: string, idx?: number) => handleImageUpload(e, f, undefined, idx)} 
                  />
                </TabsContent>
                <TabsContent value="blocks" className="m-0 space-y-8">
                  <div className="p-6 bg-neutral-950 text-white rounded-[2rem] space-y-6 relative overflow-hidden group border border-white/5 shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12"><Brain className="h-40 w-40 text-primary" /></div>
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg"><Sparkles className="h-6 w-6" /></div>
                      <h4 className="font-black text-xs uppercase tracking-widest">AI Strategy Hub</h4>
                    </div>
                    
                    <div className="space-y-3 relative z-10">
                      <Input value={pageData.businessName} onChange={e => setPageData({...pageData, businessName: e.target.value})} placeholder="Business Name & Industry" className="bg-white/5 border-white/10 text-white h-12 rounded-xl text-xs font-bold" />
                      <Input value={pageData.aiGoal} onChange={e => setPageData({...pageData, aiGoal: e.target.value})} placeholder="Main Goal (e.g. Sales, Leads)" className="bg-white/5 border-white/10 text-white h-12 rounded-xl text-xs font-bold" />
                      <Input value={pageData.aiAudience} onChange={e => setPageData({...pageData, aiAudience: e.target.value})} placeholder="Target Audience" className="bg-white/5 border-white/10 text-white h-12 rounded-xl text-xs font-bold" />
                      <Input value={pageData.aiOffer} onChange={e => setPageData({...pageData, aiOffer: e.target.value})} placeholder="Current Offer / Hook" className="bg-white/5 border-white/10 text-white h-12 rounded-xl text-xs font-bold" />
                      <Textarea value={pageData.aiDescription} onChange={e => setPageData({...pageData, aiDescription: e.target.value})} placeholder="Detailed Business Description..." className="bg-white/5 border-white/10 text-white min-h-[80px] rounded-xl text-xs" />
                      
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                         <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /><span className="text-[8px] font-black uppercase text-white/60">Protect Design</span></div>
                         <Switch checked={pageData.protectDesign !== false} onCheckedChange={v => setPageData({...pageData, protectDesign: v})} className="scale-75 data-[state=checked]:bg-primary" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button variant="outline" onClick={handleSave} className="h-12 rounded-xl font-black text-[9px] uppercase bg-white/5 border-white/10 text-white hover:bg-white/10">Save Strategy</Button>
                        <Button onClick={handleMagicBuild} disabled={isLoading || !pageData.aiGoal} className="h-12 rounded-xl font-black text-[9px] uppercase bg-white text-black hover:bg-neutral-200">
                          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Sparkles className="h-3.5 w-3.5 mr-2" />} Build Strategy
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Hierarchy</Label>
                    <div className="space-y-2">
                      {pageData.sections.map((section: any, idx: number) => (
                        <div key={section.id} className={cn("p-4 rounded-2xl border-2 flex items-center justify-between group transition-all cursor-pointer", editingSectionId === section.id ? "bg-primary/5 border-primary shadow-sm" : "bg-neutral-50 border-transparent")} onClick={() => setEditingSectionId(section.id)}>
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="h-9 w-9 rounded-xl bg-white shadow-inner flex items-center justify-center text-primary shrink-0"><Layers className="h-5 w-5" /></div>
                            <div className="min-w-0"><p className="text-[10px] font-black uppercase text-primary tracking-widest leading-none truncate">{section.type}</p></div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); moveBlock(idx, 'up'); }} disabled={idx === 0} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white"><ChevronUp className="h-4 w-4" /></button>
                            <button onClick={(e) => { e.stopPropagation(); moveBlock(idx, 'down'); }} disabled={idx === pageData.sections.length - 1} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white"><ChevronDown className="h-4 w-4" /></button>
                            <button onClick={(e) => { e.stopPropagation(); removeBlock(section.id); }} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-destructive"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t pb-24">
                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-4 tracking-widest text-center">Inject Node</p>
                    <div className="grid grid-cols-2 gap-2">
                      {AVAILABLE_BLOCKS.map(block => (
                        <button key={block.id} onClick={() => addSection(block.id)} className="p-3 rounded-xl border-2 bg-neutral-50 hover:bg-white hover:border-primary/40 hover:shadow-lg transition-all text-[8px] font-black uppercase flex items-center gap-2 group">
                          <block.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                          {block.id}
                        </button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="library" className="m-0">
                   <LibraryTab 
                      pageData={pageData} 
                      setPageData={setPageData} 
                      isAdmin={isAdmin}
                      onUpdateContent={async (tid: string, type: 'full-page' | 'block') => {
                         if (!db || !user?.uid) return;
                         const tRef = doc(db, "smartTemplates", tid);
                         const templateData: any = {
                           updatedAt: serverTimestamp()
                         };
                         if (type === 'full-page') {
                           templateData.sections = pageData.sections;
                           templateData.design = {
                             themeColor: pageData.themeColor,
                             themeVariant: pageData.themeVariant,
                             fontType: pageData.fontType,
                             cardRadius: pageData.cardRadius
                           };
                         } else {
                           const section = pageData.sections.find((s:any) => s.id === editingSectionId);
                           if (section) {
                             templateData.data = section.data;
                           }
                         }
                         await updateDocumentNonBlocking(tRef, templateData);
                         toast({ title: "Template Logic Synced" });
                      }}
                   />
                </TabsContent>
                <TabsContent value="design" className="m-0"><DesignTab pageData={pageData} setPageData={setPageData} /></TabsContent>
                <TabsContent value="automations" className="m-0"><AutomationTab pageData={pageData} setPageData={setPageData} /></TabsContent>
              </div>
            </Tabs>
          </aside>

          <main ref={stageRef} className={cn("flex-1 bg-neutral-200/30 flex flex-col items-center relative overflow-y-auto transition-all", mobileTab === 'preview' ? "flex w-full absolute inset-0 lg:relative" : "hidden lg:flex")}>
            <div className="w-full bg-white/60 backdrop-blur-md h-12 border-b flex items-center justify-center gap-4 px-6 shrink-0 z-[40] sticky top-0 shadow-sm">
              <button onClick={() => setPreviewDevice('mobile')} className={cn("h-8 px-4 rounded-lg flex items-center gap-2 text-[10px] font-black transition-all", previewDevice === 'mobile' ? "bg-primary text-white" : "text-muted-foreground")}><Smartphone className="h-3.5 w-3.5" /> MOBILE</button>
              <button onClick={() => setPreviewDevice('tablet')} className={cn("h-8 px-4 rounded-lg flex items-center gap-2 text-[10px] font-black transition-all", previewDevice === 'tablet' ? "bg-primary text-white" : "text-muted-foreground")}><Tablet className="h-3.5 w-3.5" /> TABLET</button>
              <button onClick={() => setPreviewDevice('desktop')} className={cn("h-8 px-4 rounded-lg flex items-center gap-2 text-[10px] font-black transition-all", previewDevice === 'desktop' ? "bg-primary text-white" : "text-muted-foreground")}><Monitor className="h-3.5 w-3.5" /> DESKTOP</button>
            </div>
            <div className="flex-1 w-full overflow-y-auto p-4 sm:p-12 flex items-start justify-center pb-32">
              <div style={{ width: `${targetWidth * scale}px` }} className="transition-all duration-700 ease-out">
                <div style={{ width: `${targetWidth}px`, height: `1000px`, transform: `scale(${scale})`, transformOrigin: 'top center' }} className="relative transition-all duration-500 bg-white shadow-2xl overflow-hidden rounded-[3.5rem] border-[12px] border-neutral-900">
                  <iframe ref={iframeRef} src="/s/preview" onLoad={syncPreview} className="w-full h-full border-none pointer-events-auto" />
                </div>
              </div>
            </div>
          </main>

          <aside className={cn("w-80 bg-white border-l flex flex-col overflow-hidden shrink-0 shadow-2xl z-[48] transition-all", mobileTab === 'inspector' ? "flex w-full absolute inset-0 lg:relative lg:w-80" : "hidden lg:flex")}>
            <div className="h-14 bg-neutral-50 border-b flex items-center justify-between px-6 shrink-0">
              <h3 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Block Inspector</h3>
              <button className="lg:hidden text-muted-foreground h-10 w-10 flex items-center justify-center rounded-full hover:bg-neutral-100" onClick={() => setMobileTab('navigator')}><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 pb-32 custom-scrollbar">
              <InspectorPanel 
                editingSectionId={editingSectionId} 
                pageData={pageData} 
                updateSectionData={updateSectionData} 
                uploadingField={uploadingField} 
                handleImageUpload={(e: React.ChangeEvent<HTMLInputElement>, f: string, sid?: string, idx?: number) => handleImageUpload(e, f, sid, idx)}
                addItem={addItem}
                removeItem={removeItem}
                updateItem={updateItem}
                moveItem={moveItem}
                setEditingSectionId={setEditingSectionId}
              />
            </div>
          </aside>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </TooltipProvider>
  );
}

export default function MicroSiteBuilder() {
  return <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
    <MicroSiteBuilderContent />
  </Suspense>;
}
