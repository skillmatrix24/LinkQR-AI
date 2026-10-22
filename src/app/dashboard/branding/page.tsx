
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Loader2, 
  Palette, 
  Zap, 
  Crown, 
  CheckCircle2, 
  ArrowRight, 
  Trash2, 
  Wand2, 
  Globe,
  Type,
  ImageIcon,
  Rocket,
  ShieldCheck,
  Briefcase,
  Target,
  FileText,
  Instagram,
  MessageCircle,
  Smartphone,
  Eye,
  Settings2,
  Brush,
  Fingerprint
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateBrandIdentity, type BrandKitOutput } from "@/ai/flows/ai-brand-kit-flow";
import { generateAILogo } from "@/ai/flows/generate-ai-logo-flow";
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const ARCHETYPES = [
  { id: 'creator', name: 'The Creator', desc: 'Innovative & Artistic' },
  { id: 'hero', name: 'The Hero', desc: 'Strong & Courageous' },
  { id: 'sage', name: 'The Sage', desc: 'Wise & Knowledgeable' },
  { id: 'rebel', name: 'The Rebel', desc: 'Rule-breaking & Wild' },
  { id: 'lover', name: 'The Lover', desc: 'Sensual & Passionate' },
  { id: 'ruler', name: 'The Ruler', desc: 'Leader & Premium' }
];

export default function BrandIdentityPage() {
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [vibe, setVibe] = useState<string>("Modern");
  const [archetype, setArchetype] = useState("creator");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLogoLoading, setIsLogoLoading] = useState(false);
  const [brandKit, setBrandKit] = useState<BrandKitOutput | null>(null);
  const [generatedLogo, setGeneratedLogo] = useState("");
  const [activePreview, setActivePreview] = useState<'dossier' | 'mockups'>('dossier');

  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const userProfileRef = useMemoFirebase(() => (db && user?.uid) ? doc(db, "users", user.uid) : null, [db, user?.uid]);
  const { data: profile } = useDoc(userProfileRef);

  useEffect(() => {
    if (profile?.brandKit) {
      setBrandKit(profile.brandKit);
      setBusinessName(profile.brandKit.businessName || "");
      setGeneratedLogo(profile.brandKit.logoUrl || "");
    }
  }, [profile]);

  const handleGenerateKit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !industry) {
      toast({ variant: "destructive", title: "Input Required", description: "Name and Industry are mandatory." });
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateBrandIdentity({ 
        businessName, 
        industry, 
        vibe: `${vibe} (${archetype} archetype)` 
      });
      setBrandKit(result);
      setGeneratedLogo(""); 
      toast({ title: "Brand Identity Mapped", description: "Design strategy is ready." });
    } catch (err: any) {
      console.error("Branding Flow Error:", err);
      toast({ 
        variant: "destructive", 
        title: "Branding Engine Fault", 
        description: err.message || "Failed to analyze your brand." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateLogo = async () => {
    if (!brandKit) return;
    setIsLogoLoading(true);
    try {
      const result = await generateAILogo({ prompt: brandKit.logoPrompt });
      setGeneratedLogo(result.imageUrl);
      toast({ title: "Visual ID Generated" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Logo Creator Fault" });
    } finally {
      setIsLogoLoading(false);
    }
  };

  const handleSaveToProfile = () => {
    if (!db || !user?.uid || !brandKit) return;
    const userRef = doc(db, "users", user.uid);
    updateDocumentNonBlocking(userRef, {
      brandKit: {
        ...brandKit,
        businessName,
        logoUrl: generatedLogo,
        updatedAt: new Date().toISOString()
      }
    });
    toast({ title: "Sync Successful", description: "Identity is now global to your account." });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-10 mb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1 rounded-full">
               <Fingerprint className="h-3 w-3 mr-2" /> Brand DNA Hub v4.0
            </Badge>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">Master <span className="text-primary">Identity</span></h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl">अपने ब्रांड की "आत्मा" डिफाइन करें। AI आपकी पूरी विजुअल भाषा तैयार करेगा।</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* INPUT PANEL */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
             <div className="h-2 bg-primary"></div>
             <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3"><Settings2 className="h-5 w-5 text-primary" /> Identity Forge</CardTitle>
             </CardHeader>
             <CardContent className="p-8 pt-0 space-y-8">
                <form onSubmit={handleGenerateKit} className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Business Name</Label>
                    <Input 
                      placeholder="e.g. Royal Cafe" 
                      value={businessName} 
                      onChange={e => setBusinessName(e.target.value)}
                      className="h-12 rounded-xl bg-neutral-50 border-neutral-200 focus:bg-white transition-all font-bold"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Industry</Label>
                    <Input 
                      placeholder="e.g. Luxury Real Estate" 
                      value={industry} 
                      onChange={e => setIndustry(e.target.value)}
                      className="h-12 rounded-xl bg-neutral-50 border-neutral-200 focus:bg-white transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Brand Archetype</Label>
                    <div className="grid grid-cols-2 gap-2">
                       {ARCHETYPES.map(a => (
                         <button 
                            key={a.id}
                            type="button"
                            onClick={() => setArchetype(a.id)}
                            className={cn(
                              "p-3 rounded-xl border text-[9px] font-black uppercase transition-all flex flex-col items-center text-center gap-1",
                              archetype === a.id ? "bg-primary text-white border-primary shadow-lg" : "bg-neutral-50 hover:bg-neutral-100"
                            )}
                         >
                            <span>{a.name}</span>
                            <span className="text-[7px] opacity-60 font-medium normal-case">{a.desc}</span>
                         </button>
                       ))}
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full h-16 rounded-2xl font-black gap-3 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white">
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                    FORGE IDENTITY
                  </Button>
                </form>
             </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-neutral-900 text-white rounded-[2rem] p-8 space-y-6">
             <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-accent" />
                <h4 className="text-xs font-black uppercase tracking-widest text-accent">Strategic Impact</h4>
             </div>
             <p className="text-xs text-neutral-400 leading-relaxed font-medium italic">
                "90% of a customer's first impression is based on color and archetype alone."
             </p>
          </Card>
        </div>

        {/* OUTPUT PANEL */}
        <div className="lg:col-span-8">
           <AnimatePresence mode="wait">
             {brandKit ? (
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  {/* NAVIGATION FOR RESULTS */}
                  <div className="flex bg-neutral-100 p-1.5 rounded-2xl w-fit mx-auto mb-4">
                     <button onClick={() => setActivePreview('dossier')} className={cn("px-8 py-2 rounded-xl text-[10px] font-black uppercase transition-all", activePreview === 'dossier' ? "bg-white text-primary shadow-lg" : "text-muted-foreground")}><FileText className="h-3.5 w-3.5 mr-2 inline" /> Dossier</button>
                     <button onClick={() => setActivePreview('mockups')} className={cn("px-8 py-2 rounded-xl text-[10px] font-black uppercase transition-all", activePreview === 'mockups' ? "bg-white text-primary shadow-lg" : "text-muted-foreground")}><Eye className="h-3.5 w-3.5 mr-2 inline" /> Social Mockups</button>
                  </div>

                  {activePreview === 'dossier' ? (
                    <Card className="border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden">
                       <CardHeader className="p-8 sm:p-12 pb-0 flex flex-row items-center justify-between">
                          <div className="space-y-1">
                             <Badge className="bg-emerald-50 text-emerald-700 font-bold uppercase text-[9px] mb-4 px-4 h-6 border-none rounded-md">Archive Locked</Badge>
                             <CardTitle className="text-4xl font-black tracking-tight">{businessName || "New Brand"}</CardTitle>
                             <p className="text-muted-foreground font-medium text-lg uppercase tracking-widest">{industry} • {archetype} Soul</p>
                          </div>
                          <Button variant="ghost" onClick={() => setBrandKit(null)} className="h-12 w-12 rounded-full text-muted-foreground hover:bg-red-50 hover:text-red-500"><Trash2 className="h-5 w-5" /></Button>
                       </CardHeader>
                       <CardContent className="p-8 sm:p-12 space-y-16">
                          {/* 1. Core Narrative */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5"><Rocket className="h-20 w-20 text-primary" /></div>
                                <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-4">Core Motto</p>
                                <p className="text-2xl font-black text-foreground italic leading-tight">"{brandKit.motto}"</p>
                             </div>
                             <div className="p-8 rounded-[2.5rem] bg-neutral-50 border border-neutral-200 space-y-3">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em]">Brand Tone</p>
                                <p className="text-lg font-black text-foreground">{brandKit.brandVoice}</p>
                             </div>
                          </div>

                          {/* 2. Visual DNA */}
                          <div className="space-y-8">
                             <h4 className="text-xl font-black flex items-center gap-3 uppercase tracking-tight"><Palette className="h-6 w-6 text-primary" /> Visual DNA Strategy</h4>
                             <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
                                <div className="md:col-span-5 flex gap-4">
                                   <div className="flex-1 space-y-3">
                                      <div className="h-32 w-full rounded-[2.5rem] shadow-2xl border-4 border-white cursor-pointer group relative overflow-hidden" style={{ backgroundColor: brandKit.colors.primary }}>
                                         <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Brush className="h-5 w-5 text-white" /></div>
                                      </div>
                                      <p className="text-[10px] font-black text-center uppercase tracking-widest">{brandKit.colors.primary}</p>
                                   </div>
                                   <div className="flex-1 space-y-3">
                                      <div className="h-32 w-full rounded-[2.5rem] shadow-2xl border-4 border-white cursor-pointer group relative overflow-hidden" style={{ backgroundColor: brandKit.colors.secondary }}>
                                         <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Brush className="h-5 w-5 text-white" /></div>
                                      </div>
                                      <p className="text-[10px] font-black text-center uppercase tracking-widest">{brandKit.colors.secondary}</p>
                                   </div>
                                </div>
                                <div className="md:col-span-7 p-8 bg-neutral-900 text-white rounded-[2.5rem] shadow-2xl border border-white/5 relative">
                                   <div className="absolute top-0 right-0 p-6 opacity-10"><Zap className="h-12 w-12 text-accent" /></div>
                                   <p className="text-[10px] font-black uppercase text-accent tracking-[0.3em] mb-4">Color Psychology</p>
                                   <p className="text-sm font-medium leading-relaxed italic text-neutral-300">"{brandKit.colors.psychology}"</p>
                                </div>
                             </div>
                          </div>

                          {/* 3. Typography */}
                          <div className="p-10 rounded-[3rem] bg-neutral-50 border border-neutral-100 space-y-8">
                             <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground"><Type className="h-4 w-4" /> Typography Pairing</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-2">
                                   <p className="text-[10px] font-bold text-muted-foreground uppercase">Headline (Authority)</p>
                                   <p className="text-4xl font-black text-foreground">{brandKit.typography.heading}</p>
                                </div>
                                <div className="space-y-2">
                                   <p className="text-[10px] font-bold text-muted-foreground uppercase">Body (Clarity)</p>
                                   <p className="text-xl font-medium text-foreground/80">{brandKit.typography.body}</p>
                                </div>
                             </div>
                          </div>

                          {/* 4. Logo Generation */}
                          <div className="space-y-8 pt-8 border-t border-neutral-100">
                             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <h4 className="text-2xl font-black flex items-center gap-4"><ImageIcon className="h-7 w-7 text-primary" /> Identity Asset (Logo)</h4>
                                <Button onClick={handleGenerateLogo} disabled={isLogoLoading} className="rounded-2xl h-14 px-10 font-black gap-3 bg-accent hover:bg-accent/90 text-white shadow-2xl">
                                   {isLogoLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}
                                   CREATE WITH IMAGEN 3
                                </Button>
                             </div>
                             
                             {generatedLogo ? (
                               <div className="relative aspect-square max-w-[280px] mx-auto bg-white rounded-[4rem] p-12 shadow-2xl border-8 border-neutral-50 group">
                                  <img src={generatedLogo} className="w-full h-full object-contain" alt="Logo" />
                                  <button onClick={() => setGeneratedLogo("")} className="absolute -top-4 -right-4 h-12 w-12 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110"><Trash2 className="h-5 w-5" /></button>
                               </div>
                             ) : (
                               <div className="h-64 border-4 border-dashed border-neutral-100 rounded-[3rem] flex flex-col items-center justify-center text-muted-foreground opacity-30 hover:opacity-100 transition-all cursor-pointer group" onClick={handleGenerateLogo}>
                                  <ImageIcon className="h-16 w-16 mb-4 group-hover:scale-110 transition-transform" />
                                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Asset Awaiting Generation</p>
                               </div>
                             )}
                          </div>

                          <Button onClick={handleSaveToProfile} className="w-full h-20 rounded-[2rem] font-black text-xl gap-4 shadow-2xl shadow-primary/30 group">
                             <CheckCircle2 className="h-8 w-8 group-hover:scale-110 transition-transform" /> ACTIVATE GLOBAL IDENTITY
                          </Button>
                       </CardContent>
                    </Card>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {/* Instagram Mockup */}
                       <Card className="border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden">
                          <div className="p-6 bg-neutral-50 border-b flex items-center gap-3">
                             <Instagram className="h-5 w-5 text-pink-600" />
                             <span className="text-xs font-black uppercase tracking-widest">Instagram Presence</span>
                          </div>
                          <div className="p-8 flex flex-col items-center space-y-6">
                             <div className="h-24 w-24 rounded-full border-2 p-1 border-pink-500">
                                <div className="w-full h-full rounded-full bg-neutral-200 overflow-hidden">
                                   {generatedLogo ? <img src={generatedLogo} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-neutral-200" />}
                                </div>
                             </div>
                             <div className="text-center space-y-2">
                                <p className="font-black text-sm">{businessName || "YourBrand"}</p>
                                <p className="text-[10px] text-muted-foreground max-w-[200px]">{brandKit.motto}</p>
                             </div>
                             <div className="grid grid-cols-3 gap-2 w-full">
                                {[1,2,3].map(i => <div key={i} className="aspect-square bg-neutral-100 rounded-lg overflow-hidden relative">
                                   <div className="absolute inset-0 opacity-20" style={{ backgroundColor: brandKit.colors.primary }} />
                                </div>)}
                             </div>
                          </div>
                       </Card>

                       {/* Business Card Mockup */}
                       <Card className="border-none shadow-2xl bg-neutral-900 text-white rounded-[3rem] overflow-hidden aspect-[1.6/1] flex flex-col p-10 justify-between relative">
                          <div className="absolute top-0 right-0 w-32 h-32 opacity-20 blur-3xl rounded-full" style={{ backgroundColor: brandKit.colors.primary }} />
                          <div className="flex items-center justify-between relative z-10">
                             {generatedLogo ? <img src={generatedLogo} className="h-12 w-12 object-contain brightness-0 invert" /> : <div className="h-10 w-10 bg-white/20 rounded" />}
                             <Badge variant="outline" className="text-white border-white/20 text-[8px] font-black uppercase tracking-widest">Executive ID</Badge>
                          </div>
                          <div className="relative z-10">
                             <h4 className="text-2xl font-black tracking-tight">{businessName || "Business"}</h4>
                             <p className="text-[9px] font-bold text-accent uppercase tracking-[0.3em]">{industry}</p>
                             <div className="h-1 w-20 bg-accent mt-4 rounded-full" />
                          </div>
                          <div className="flex justify-between items-end relative z-10">
                             <p className="text-[8px] font-bold opacity-40 uppercase tracking-widest">{brandKit.motto}</p>
                             <div className="flex gap-2">
                                <div className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: brandKit.colors.primary }} />
                                <div className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: brandKit.colors.secondary }} />
                             </div>
                          </div>
                       </Card>

                       <Card className="md:col-span-2 border-none shadow-xl bg-white rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10">
                          <div className="h-48 w-48 bg-neutral-50 rounded-[3rem] flex items-center justify-center p-8 border-4 border-neutral-100 shadow-inner relative overflow-hidden">
                             <div className="absolute inset-0 opacity-5" style={{ backgroundColor: brandKit.colors.primary }} />
                             {generatedLogo ? <img src={generatedLogo} className="w-full h-full object-contain" /> : <ImageIcon className="h-12 w-12 text-muted-foreground opacity-20" />}
                          </div>
                          <div className="flex-1 space-y-4 text-center md:text-left">
                             <h4 className="text-2xl font-black flex items-center gap-3 justify-center md:justify-start">
                                <Smartphone className="h-6 w-6 text-primary" /> Smart Redirection
                             </h4>
                             <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                आपका लोगो आपके हर **Dynamic QR** और **Smart Page** के सेंटर में ऑटोमैटिकली सिंक हो जाएगा। यह एक "Premium First Impression" की गारंटी देता है।
                             </p>
                             <Button onClick={() => setActivePreview('dossier')} variant="link" className="p-0 h-auto font-black text-[10px] uppercase tracking-widest text-primary gap-2">
                                Back to Strategy <ArrowRight className="h-3.5 w-3.5" />
                             </Button>
                          </div>
                       </Card>
                    </motion.div>
                  )}
               </motion.div>
             ) : (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center py-40 text-center space-y-8 opacity-20 border-4 border-dashed rounded-[4rem]">
                  <div className="h-28 w-28 bg-neutral-100 rounded-full flex items-center justify-center shadow-inner">
                     <Brush className="h-14 w-14" />
                  </div>
                  <div className="space-y-2">
                     <h3 className="text-3xl font-black uppercase tracking-tight">Strategy Node Empty</h3>
                     <p className="text-lg font-medium">Use the Forge to generate your brand DNA.</p>
                  </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

