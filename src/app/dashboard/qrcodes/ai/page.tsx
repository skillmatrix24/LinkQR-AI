"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  ArrowLeft, 
  Loader2, 
  QrCode, 
  Wand2, 
  CheckCircle2, 
  ExternalLink,
  Zap,
  Image as ImageIcon,
  Palette,
  ShieldCheck,
  Crown,
  Trophy,
  Target,
  MessageSquare,
  Activity,
  Trash2,
  Globe,
  Gauge,
  ZapOff,
  Info
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser, useDoc, useMemoFirebase, setDocumentNonBlocking, updateDocumentNonBlocking, useStorage } from "@/firebase";
import { doc, increment, serverTimestamp } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { QRCodeSVG } from "qrcode.react";
import { generateQRStyle, type AIQRStyleOutput } from "@/ai/flows/ai-qr-style-flow";
import { generateAILogo } from "@/ai/flows/generate-ai-logo-flow";
import { generateCTASuggestions, type CTAOutput } from "@/ai/flows/ai-cta-generator-flow";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const PRESET_COLLECTIONS = [
  { id: 'gold', name: 'Royal Gold', prompt: 'Deep royal black and shimmering gold luxury' },
  { id: 'neon', name: 'Neon Cyber', prompt: 'Futuristic purple and electric cyan cyberpunk' },
  { id: 'eco', name: 'Organic', prompt: 'Forest greens and natural cream minimalist' }
];

function AIQRGeneratorContent() {
  const [url, setUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [logoPrompt, setLogoPrompt] = useState("");
  const [ctaText, setCtaText] = useState("");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCtaLoading, setIsCtaLoading] = useState(false);
  const [isLogoLoading, setIsLogoLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [aiCtas, setAiCtas] = useState<CTAOutput['suggestions'] | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIQRStyleOutput | null>(null);
  
  // Fix: Hydration-safe random code
  const [stableShortCode, setStableShortCode] = useState("");
  
  const [fgType, setFgType] = useState<'solid' | 'linear'>('solid');
  const [fgColor1, setFgColor1] = useState('#000000');
  const [fgColor2, setFgColor2] = useState('#000000');
  const [bgType, setBgType] = useState<'solid' | 'linear'>('solid');
  const [bgColor1, setBgColor1] = useState('#ffffff');
  const [bgColor2, setBgColor2] = useState('#ffffff');
  const [generatedLogo, setGeneratedLogo] = useState("");
  
  const router = useNavigate();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const storage = useStorage();

  useEffect(() => {
    setStableShortCode(Math.random().toString(36).substring(2, 12));
  }, []);

  const userProfileRef = useMemoFirebase(() => (db && user?.uid) ? doc(db, "users", user.uid) : null, [db, user?.uid]);
  const { data: profile } = useDoc(userProfileRef);
  const siteConfigRef = useMemoFirebase(() => db ? doc(db, "config", "site") : null, [db]);
  const { data: siteConfig } = useDoc(siteConfigRef);

  const isProPlus = profile?.currentPlanId === 'pro_plan' || profile?.currentPlanId === 'ent_plan' || profile?.isAdmin;
  const baseUrl = siteConfig?.publicBaseUrl?.replace(/\/$/, "") || "https://linkqr.in";

  useEffect(() => {
    if (profile?.brandKit) {
      const bk = profile.brandKit;
      setFgColor1(bk.colors.primary);
      setFgColor2(bk.colors.secondary || bk.colors.primary);
      setGeneratedLogo(bk.logoUrl || "");
    }
  }, [profile?.brandKit]);

  const handleAISuggest = async (manualPrompt?: string) => {
    const activePrompt = manualPrompt || prompt;
    if (!activePrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const result = await generateQRStyle({ prompt: activePrompt });
      setAiAnalysis(result);
      setFgType(result.fgType);
      setFgColor1(result.fgColor1);
      setFgColor2(result.fgColor2 || result.fgColor1);
      setBgType(result.bgType);
      setBgColor1(result.bgColor1);
      setBgColor2(result.bgColor2 || result.bgColor1);
      toast({ title: "Intelligence Deployed" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "AI Fault", description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCTA = async () => {
    if (!url) return;
    setIsCtaLoading(true);
    try {
      const res = await generateCTASuggestions({ 
        businessType: profile?.brandKit?.industry || "Retail"
      });
      setAiCtas(res.suggestions);
    } finally {
      setIsCtaLoading(false);
    }
  };

  const handleGenerateLogo = async () => {
    if (!logoPrompt.trim()) return;
    setIsLogoLoading(true);
    try {
      const result = await generateAILogo({ prompt: logoPrompt });
      setGeneratedLogo(result.imageUrl);
    } finally {
      setIsLogoLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!user || !db || !userProfileRef || !stableShortCode) return;
    if (!url.startsWith("http")) {
      toast({ variant: "destructive", title: "Target Missing", description: "URL must start with https://" });
      return;
    }

    setIsCreating(true);
    const qrCodeId = crypto.randomUUID();
    const timestamp = serverTimestamp();

    const hexToDash = (hex: string) => hex.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join('-') || '0-0-0';
    const fg = fgType === 'solid' ? hexToDash(fgColor1) : `linear:${hexToDash(fgColor1)}:${hexToDash(fgColor2)}`;
    const bg = bgType === 'solid' ? hexToDash(bgColor1) : `linear:${hexToDash(bgColor1)}:${hexToDash(bgColor2)}`;

    const qrData = {
      id: qrCodeId,
      userId: user.uid,
      title: `Magic Node: ${prompt.substring(0, 15) || 'Generated'}`,
      originalUrl: url,
      shortCode: stableShortCode,
      createdAt: timestamp,
      updatedAt: timestamp,
      isActive: true,
      totalScans: 0,
      fgColor: fg,
      bgColor: bg,
      logoUrl: generatedLogo,
    };

    setDocumentNonBlocking(doc(db, "users", user.uid, "qrcodes", qrCodeId), qrData, { merge: true });
    setDocumentNonBlocking(doc(db, "publicShortLinks", stableShortCode), {
      shortCode: stableShortCode,
      qrCodeId,
      userId: user.uid,
      originalUrl: url,
      isActive: true,
      updatedAt: timestamp
    }, { merge: true });

    updateDocumentNonBlocking(userProfileRef, { qrCodeCount: increment(1) });
    toast({ title: "Deployment Successful" });
    navigate("/dashboard/qrs");
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 mb-24 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Link to="/dashboard/qrs" className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-all">
            <ArrowLeft className="h-4 w-4" /> THE STUDIO HUB
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">AI Magic <span className="text-primary">Studio</span></h1>
          <p className="text-muted-foreground font-medium text-lg max-w-xl">Enterprise-grade generative design for physical-to-digital nodes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* DESIGN PREVIEW */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-2xl bg-white overflow-hidden sticky top-24">
            <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary animate-gradient"></div>
            <CardContent className="p-8 sm:p-12 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-10">
                 <Badge className="bg-primary/10 text-primary border-none px-4 py-1 font-black text-[9px] uppercase tracking-widest rounded-full">Intelligent Node</Badge>
                 <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px]">
                    <ShieldCheck className="h-4 w-4" /> ENCRYPTED
                 </div>
              </div>

              <motion.div layoutId="qr-canvas" className="bg-white p-8 rounded-[3.5rem] border-8 border-neutral-50 shadow-inner relative">
                <svg width="0" height="0" className="absolute">
                  <defs>
                    <linearGradient id="aiFgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={fgColor1} />
                      <stop offset="100%" stopColor={fgColor2} />
                    </linearGradient>
                    <linearGradient id="aiBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={bgColor1} />
                      <stop offset="100%" stopColor={bgColor2} />
                    </linearGradient>
                  </defs>
                </svg>
                <QRCodeSVG
                  value={stableShortCode ? `${baseUrl}/r/${stableShortCode}` : "LINKQR"}
                  size={180}
                  fgColor={fgType === 'linear' ? 'url(#aiFgGrad)' : fgColor1}
                  bgColor={bgType === 'linear' ? 'url(#aiBgGrad)' : bgColor1}
                  level="H"
                  imageSettings={generatedLogo ? { src: generatedLogo, height: 45, width: 45, excavate: true } : undefined}
                />
              </motion.div>

              {ctaText && <p className="mt-8 text-center text-[11px] font-black uppercase text-primary px-6 py-3 bg-primary/5 rounded-xl border border-primary/10 w-full">{ctaText}</p>}

              <div className="w-full grid grid-cols-2 gap-4 mt-10">
                 <div className="p-4 bg-neutral-50 rounded-2xl text-center"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Contrast</p><p className="text-xl font-black">{aiAnalysis?.contrastRatio || '--'}%</p></div>
                 <div className="p-4 bg-neutral-50 rounded-2xl text-center"><p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Scan Score</p><p className="text-xl font-black">{aiAnalysis?.readabilityScore || '--'}%</p></div>
              </div>

              <Button onClick={handleCreate} disabled={!url || isCreating || !stableShortCode} className="w-full h-16 mt-10 rounded-2xl font-black text-sm shadow-2xl shadow-primary/20 gap-3 group">
                {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
                DEPLOY SMART NODE
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* CONTROLS */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden">
             <CardHeader className="p-8 sm:p-12 pb-0">
                <div className="space-y-4">
                   <Label className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-muted-foreground"><Globe className="h-4 w-4 text-primary" /> Destination Target</Label>
                   <div className="relative">
                      <Globe className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                      <Input placeholder="https://yourbrand.com/campaign" value={url} onChange={e => setUrl(e.target.value)} className="h-16 pl-14 bg-neutral-50 border-neutral-200 rounded-2xl text-lg font-bold shadow-inner focus:ring-2 focus:ring-primary/20" />
                   </div>
                </div>
             </CardHeader>
             <CardContent className="p-8 sm:p-12 space-y-12">
                <div className="space-y-6">
                   <div className="flex items-center justify-between border-b pb-4"><h3 className="text-xl font-black flex items-center gap-3"><Palette className="h-6 w-6 text-primary" /> Aesthetics Lab</h3><Badge variant="outline" className="text-[9px] font-black tracking-widest">GENAI POWERED</Badge></div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {PRESET_COLLECTIONS.map(p => (
                        <button key={p.id} onClick={() => handleAISuggest(p.prompt)} className="p-6 bg-neutral-50 rounded-[1.5rem] border border-neutral-100 hover:bg-white hover:shadow-xl transition-all text-left group">
                           <p className="text-xs font-black mb-1 group-hover:text-primary">{p.name}</p>
                           <p className="text-[10px] text-muted-foreground font-medium line-clamp-1">Auto-Style Generator</p>
                        </button>
                      ))}
                   </div>
                   <div className="relative mt-4">
                      <Textarea placeholder="Describe your vibe (e.g. 'A premium luxury look with gold and deep charcoal')..." value={prompt} onChange={e => setPrompt(e.target.value)} className="min-h-[100px] bg-neutral-50 rounded-2xl border-neutral-200 font-bold" />
                      <Button onClick={() => handleAISuggest()} disabled={isGenerating || !prompt} className="absolute bottom-3 right-3 h-10 px-6 rounded-xl font-black gap-2 shadow-lg">{isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Apply Intelligence</Button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="p-8 rounded-[2.5rem] bg-[#0a0a0a] text-white space-y-6 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 transition-transform duration-1000"><ImageIcon className="h-32 w-32 text-accent" /></div>
                      <h4 className="text-lg font-black flex items-center gap-3 relative z-10"><Zap className="h-5 w-5 text-accent" /> AI Logo Creator</h4>
                      <div className="flex gap-2 relative z-10">
                         <Input placeholder="Describe icon..." value={logoPrompt} onChange={e => setLogoPrompt(e.target.value)} className="bg-white/5 border-white/10 text-white text-xs h-12 rounded-xl" />
                         <Button onClick={handleGenerateLogo} disabled={isLogoLoading || !logoPrompt} className="bg-accent hover:bg-accent/90 text-white h-12 w-12 rounded-xl shadow-lg shrink-0">{isLogoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}</Button>
                      </div>
                      {generatedLogo && (
                         <div className="relative z-10 h-16 w-16 bg-white rounded-xl p-2 shadow-2xl group/logo"><img src={generatedLogo} className="h-full w-full object-contain" alt="" /><button onClick={() => setGeneratedLogo("")} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover/logo:opacity-100 transition-opacity"><Trash2 className="h-3 w-3" /></button></div>
                      )}
                   </div>

                   <div className="p-8 rounded-[2.5rem] bg-primary text-white space-y-6 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 transition-transform duration-1000"><MessageSquare className="h-32 w-32" /></div>
                      <h4 className="text-lg font-black flex items-center gap-3 relative z-10"><Target className="h-5 w-5" /> AI Captions</h4>
                      <Button onClick={handleGenerateCTA} disabled={isCtaLoading} className="w-full bg-white text-primary hover:bg-neutral-100 font-black h-12 rounded-xl relative z-10 shadow-xl">{isCtaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "GENERATE"}</Button>
                      <AnimatePresence>{aiCtas && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-2 relative z-10">{aiCtas.slice(0, 2).map((c, i) => (<button key={i} onClick={() => setCtaText(c.text)} className="text-[10px] font-black bg-white/10 hover:bg-white/20 p-3 rounded-lg text-left truncate transition-all uppercase tracking-tighter">{c.text}</button>))}</motion.div>)}</AnimatePresence>
                   </div>
                </div>

                <div className="p-10 rounded-[3rem] bg-neutral-50 border border-neutral-100 space-y-8">
                   <div className="flex items-center justify-between border-b pb-4"><h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Palette className="h-4 w-4" /> Manual Override</h4><div className="flex items-center gap-4"><div className="flex items-center gap-2"><span className="text-[10px] font-bold">FG</span><Switch checked={fgType === 'linear'} onCheckedChange={v => setFgType(v ? 'linear' : 'solid')} /></div><div className="flex items-center gap-2"><span className="text-[10px] font-bold">BG</span><Switch checked={bgType === 'linear'} onCheckedChange={v => setBgType(v ? 'linear' : 'solid')} /></div></div></div>
                   <div className="grid grid-cols-2 gap-8"><div className="space-y-4"><div className="flex gap-2"><Input type="color" value={fgColor1} onChange={e => setFgColor1(e.target.value)} className="h-12 cursor-pointer p-1 rounded-xl shadow-sm border-2 border-white ring-2 ring-neutral-100" />{fgType === 'linear' && <Input type="color" value={fgColor2} onChange={e => setFgColor2(e.target.value)} className="h-12 cursor-pointer p-1 rounded-xl shadow-sm border-2 border-white ring-2 ring-neutral-100" />}</div><p className="text-[9px] font-black uppercase text-center text-muted-foreground tracking-widest">Foreground Canvas</p></div><div className="space-y-4"><div className="flex gap-2"><Input type="color" value={bgColor1} onChange={e => setBgColor1(e.target.value)} className="h-12 cursor-pointer p-1 rounded-xl shadow-sm border-2 border-white ring-2 ring-neutral-100" />{bgType === 'linear' && <Input type="color" value={bgColor2} onChange={e => setBgColor2(e.target.value)} className="h-12 cursor-pointer p-1 rounded-xl shadow-sm border-2 border-white ring-2 ring-neutral-100" />}</div><p className="text-[9px] font-black uppercase text-center text-muted-foreground tracking-widest">Background Surface</p></div></div>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AIQRGenerator() {
  return (
    <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <AIQRGeneratorContent />
    </Suspense>
  );
}
