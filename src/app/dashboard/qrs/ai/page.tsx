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
  X,
  Trash2,
  Info,
  Globe
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser, useDoc, useMemoFirebase, setDocumentNonBlocking, updateDocumentNonBlocking, useStorage } from "@/firebase";
import { doc, increment, serverTimestamp } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { QRCodeSVG } from "qrcode.react";
import { generateQRStyle, type AIQRStyleOutput } from "@/ai/flows/ai-qr-style-flow";
import { generateAILogo } from "@/ai/flows/generate-ai-logo-flow";

const STYLE_PRESETS = [
  { id: 'cyberpunk', name: 'Cyberpunk', icon: Zap, prompt: 'A futuristic cyberpunk style with neon purple and cyan accents' },
  { id: 'minimalist', name: 'Minimalist', icon: ShieldCheck, prompt: 'A clean, high-end minimalist monochrome look' },
  { id: 'nature', name: 'Organic', icon: ImageIcon, prompt: 'A calm organic feel with earthy forest greens' },
  { id: 'luxury', name: 'Luxury Gold', icon: Sparkles, prompt: 'A premium luxury style with deep royal black and gold' },
];

function AIQRGeneratorContent() {
  const [url, setUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [logoPrompt, setLogoPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const [stableShortCode] = useState(() => Math.random().toString(36).substring(2, 12));
  
  const [fgType, setFgType] = useState<'solid' | 'linear'>('solid');
  const [fgColor1, setFgColor1] = useState('#000000');
  const [fgColor2, setFgColor2] = useState('#000000');
  const [bgType, setBgType] = useState<'solid' | 'linear'>('solid');
  const [bgColor1, setBgColor1] = useState('#ffffff');
  const [bgColor2, setBgColor2] = useState('#ffffff');
  const [designerNote, setDesignerNote] = useState("");
  const [generatedLogo, setGeneratedLogo] = useState("");
  
  const router = useNavigate();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const storage = useStorage();

  const userProfileRef = useMemoFirebase(() => (db && user?.uid) ? doc(db, "users", user.uid) : null, [db, user?.uid]);
  const { data: profile } = useDoc(userProfileRef);
  const siteConfigRef = useMemoFirebase(() => db ? doc(db, "config", "site") : null, [db]);
  const { data: siteConfig } = useDoc(siteConfigRef);

  const isProPlus = profile?.currentPlanId === 'pro_plan' || profile?.currentPlanId === 'ent_plan' || profile?.isAdmin;
  const baseUrl = siteConfig?.publicBaseUrl?.replace(/\/$/, "") || "https://linkqr.in";

  const hexToRgbDash = (hex: string) => {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? `${parseInt(r[1], 16)}-${parseInt(r[2], 16)}-${parseInt(r[3], 16)}` : '0-0-0';
  };

  const handleAISuggest = async (manualPrompt?: string) => {
    const activePrompt = manualPrompt || prompt;
    if (!activePrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const result = await generateQRStyle({ prompt: activePrompt });
      
      setFgType(result.fgType);
      setFgColor1(result.fgColor1);
      setFgColor2(result.fgColor2 || result.fgColor1);
      
      setBgType(result.bgType);
      setBgColor1(result.bgColor1);
      setBgColor2(result.bgColor2 || result.bgColor1);
      
      setDesignerNote(result.designerNote);
      if (manualPrompt) setPrompt(manualPrompt);
      toast({ title: "Style Applied!" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "AI Error", description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateLogo = async () => {
    if (!logoPrompt.trim()) return;
    setIsGeneratingLogo(true);
    try {
      const result = await generateAILogo({ prompt: logoPrompt });
      setGeneratedLogo(result.imageUrl);
      toast({ title: "Logo Generated!" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Logo Error", description: err.message });
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  const handleCreate = async () => {
    if (!user || !db || !userProfileRef) return;
    if (!url.startsWith("http")) {
      toast({ variant: "destructive", title: "Invalid URL", description: "URL must start with https://" });
      return;
    }

    setIsCreating(true);
    try {
      const qrCodeId = crypto.randomUUID();
      const timestamp = serverTimestamp();

      const fg = fgType === 'solid' ? hexToRgbDash(fgColor1) : `linear:${hexToRgbDash(fgColor1)}:${hexToRgbDash(fgColor2)}`;
      const bg = bgType === 'solid' ? hexToRgbDash(bgColor1) : `linear:${hexToRgbDash(bgColor1)}:${hexToRgbDash(bgColor2)}`;

      const qrData = {
        id: qrCodeId,
        userId: user.uid,
        title: `AI Gen: ${prompt.substring(0, 20) || 'Smart QR'}`,
        originalUrl: url,
        shortCode: stableShortCode,
        createdAt: timestamp,
        updatedAt: timestamp,
        isActive: true,
        totalScans: 0,
        fgColor: fg,
        bgColor: bg,
        logoUrl: generatedLogo || null,
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
      toast({ title: "Smart QR Saved" });
      navigate("/dashboard/qrs");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 mb-24 space-y-10">
      <div className="flex items-center justify-between">
        <Link to="/dashboard/qrs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to My QRs
        </Link>
        <Badge variant="outline" className="border-accent/20 text-accent font-bold">
          <Sparkles className="h-3 w-3 mr-2" /> AI Magic Studio Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          <Card className="border-none shadow-2xl bg-white overflow-hidden sticky top-24">
            <div className="h-1.5 bg-gradient-to-r from-primary to-accent"></div>
            <CardHeader className="text-center p-6">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Live Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center p-10 pt-0">
              <div className="bg-white p-8 rounded-[3rem] border-8 border-neutral-50 shadow-inner flex items-center justify-center relative">
                <svg width="0" height="0" className="absolute">
                  <defs>
                    <linearGradient id="qr-fg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={fgColor1} />
                      <stop offset="100%" stopColor={fgColor2} />
                    </linearGradient>
                  </defs>
                </svg>
                <QRCodeSVG
                  value={`${baseUrl}/r/${stableShortCode}`}
                  size={180}
                  fgColor={fgType === 'linear' ? 'url(#qr-fg-grad)' : fgColor1}
                  bgColor={bgColor1}
                  level="H"
                  imageSettings={generatedLogo ? { src: generatedLogo, height: 45, width: 45, excavate: true } : undefined}
                />
              </div>
              <Button onClick={handleCreate} disabled={!url || isCreating} className="w-full h-14 mt-8 rounded-2xl font-bold gap-2 shadow-xl">
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Deploy Smart Node
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-xl bg-white overflow-hidden">
            <CardHeader className="p-8">
              <CardTitle className="text-2xl font-black">Configure Aesthetics</CardTitle>
              <CardDescription>Tell the AI about your brand vibe to generate custom colors and icons.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-8">
              <div className="space-y-3">
                <Label className="font-bold flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Target URL</Label>
                <Input placeholder="https://yourbrand.com" value={url} onChange={e => setUrl(e.target.value)} className="h-12 rounded-xl bg-neutral-50" />
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Style Inspiration</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {STYLE_PRESETS.map((s) => (
                    <button key={s.id} onClick={() => handleAISuggest(s.prompt)} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-neutral-100 bg-neutral-50 hover:border-primary/20 transition-all">
                      <s.icon className="h-5 w-5 text-primary" />
                      <span className="text-[10px] font-bold">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="font-bold flex items-center gap-2"><Wand2 className="h-4 w-4 text-primary" /> Custom Style Description</Label>
                <div className="relative">
                  <Textarea placeholder="e.g. 'Luxury boutique style with cream and deep emerald colors'" value={prompt} onChange={e => setPrompt(e.target.value)} className="min-h-[100px] bg-neutral-50" />
                  <Button size="icon" onClick={() => handleAISuggest()} disabled={isGenerating || !prompt} className="absolute bottom-3 right-3 h-10 w-10">
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {designerNote && (
                <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl flex gap-4">
                  <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm font-medium italic text-neutral-700 leading-relaxed">"{designerNote}"</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="p-8 rounded-3xl bg-[#0a0a0a] text-white space-y-4">
                    <h4 className="font-bold flex items-center gap-2"><Zap className="h-4 w-4 text-accent" /> AI Logo Creator</h4>
                    <div className="flex gap-2">
                       <Input placeholder="Icon description..." value={logoPrompt} onChange={e => setLogoPrompt(e.target.value)} className="bg-white/5 border-white/10 text-xs h-10" />
                       <Button size="icon" onClick={handleGenerateLogo} disabled={isGeneratingLogo} className="bg-accent text-white h-10 w-10 shrink-0">
                          {isGeneratingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                       </Button>
                    </div>
                    {generatedLogo && (
                      <div className="h-16 w-16 bg-white rounded-xl p-2 relative group">
                         <img src={generatedLogo} className="h-full w-full object-contain" alt="Generated Logo" />
                         <button onClick={() => setGeneratedLogo("")} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    )}
                 </div>

                 <div className="p-8 rounded-3xl bg-neutral-50 border space-y-6">
                    <h4 className="font-bold flex items-center gap-2 text-primary"><Palette className="h-4 w-4" /> Color Override</h4>
                    <div className="flex items-center justify-between">
                       <Label className="text-xs">Linear Gradient</Label>
                       <Switch checked={fgType === 'linear'} onCheckedChange={v => setFgType(v ? 'linear' : 'solid')} />
                    </div>
                    <div className="flex gap-3">
                       <Input type="color" value={fgColor1} onChange={e => setFgColor1(e.target.value)} className="h-10 cursor-pointer p-1" />
                       {fgType === 'linear' && <Input type="color" value={fgColor2} onChange={e => setFgColor2(e.target.value)} className="h-10 cursor-pointer p-1" />}
                    </div>
                 </div>
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
