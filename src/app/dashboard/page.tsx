"use client";

import React, { useMemo, useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  ArrowRight,
  Loader2, 
  Sparkles, 
  QrCode,
  BrainCircuit,
  Target,
  Zap,
  CheckCircle2,
  Rocket,
  Trophy,
  Activity,
  Lock,
  Crown,
  Palette,
  Smartphone,
  Layout,
  LineChart,
  Users,
  SearchCode,
  ShieldCheck,
  Layers,
  BadgeIndianRupee,
  Megaphone,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, limit, collectionGroup, orderBy, where, doc, increment } from "firebase/firestore";
import { format, subDays, isToday } from "date-fns";
import { generateBusinessIntel, type AIBusinessIntelOutput } from "@/ai/flows/ai-business-intel-flow";
import { generateMarketingSuggestions, type MarketingOutput } from "@/ai/flows/ai-marketing-suggestions-flow";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();

  const [intel, setIntel] = useState<AIBusinessIntelOutput | null>(null);
  const [marketingSuggestion, setMarketingSuggestion] = useState<MarketingOutput | null>(null);
  const [isIntelLoading, setIsIntelLoading] = useState(false);
  const fetchStarted = useRef(false);

  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const siteConfigRef = useMemoFirebase(() => db ? doc(db, "config", "site") : null, [db]);
  const { data: siteConfig } = useDoc(siteConfigRef);

  const baseUrl = useMemo(() => {
    if (siteConfig?.publicBaseUrl) return siteConfig.publicBaseUrl.replace(/\/$/, "");
    return "https://linkqr.in";
  }, [siteConfig]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  const currentPlanId = profile?.currentPlanId || 'free_plan';
  const isStarterPlus = currentPlanId !== 'free_plan';
  const isProPlus = currentPlanId === 'pro_plan' || currentPlanId === 'ent_plan' || profile?.isAdmin;
  const isEnterprise = currentPlanId === 'ent_plan' || profile?.isAdmin;

  const onboardingSteps = useMemo(() => {
    return [
      { id: 1, label: "Define Brand Identity", desc: "AI-generated colors & logo", icon: Palette, done: !!profile?.brandKit, href: "/dashboard/branding" },
      { id: 2, label: "Deploy First Smart QR", desc: "Create a dynamic node", icon: QrCode, done: (profile?.qrCodeCount || 0) > 0, href: "/dashboard/qrs/new" },
      { id: 3, label: "Launch Smart Page", desc: "Setup sales funnel", icon: Smartphone, done: (profile?.micrositeCount || 0) > 0, href: "/dashboard/qrs/microsite" },
      { id: 4, label: "Unlock BI Tiers", desc: "Activate business health engine", icon: Crown, done: isStarterPlus, href: "/dashboard/billing" },
    ];
  }, [profile, isStarterPlus]);

  const progressPercent = Math.round((onboardingSteps.filter(s => s.done).length / onboardingSteps.length) * 100);

  const qrsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, "users", user.uid, "qrcodes"), 
      orderBy("createdAt", "desc"),
      limit(10)
    );
  }, [db, user?.uid]);

  const { data: qrs, isLoading: isQrsLoading } = useCollection(qrsQuery);

  const scansQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collectionGroup(db, "scanevents"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(100)
    );
  }, [db, user?.uid]);

  const { data: scans } = useCollection(scansQuery);

  const totalScans = qrs?.reduce((acc, curr) => acc + (curr.totalScans || 0), 0) || 0;
  const flaggedScans = scans?.filter(s => s.isBot).length || 0;
  const todayScans = scans?.filter(s => s.timestamp?.toDate && isToday(s.timestamp.toDate())).length || 0;
  const returningScanners = scans?.filter(s => s.isReturning === true).length || 0;

  const scanChartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        name: format(date, 'EEE'),
        fullDate: format(date, 'yyyy-MM-dd'),
        scans: 0
      };
    });

    if (scans) {
      scans.forEach(scan => {
        if (!scan.timestamp?.toDate) return;
        const scanDate = format(scan.timestamp.toDate(), 'yyyy-MM-dd');
        const day = days.find(d => d.fullDate === scanDate);
        if (day) day.scans++;
      });
    }
    return days;
  }, [scans]);

  useEffect(() => {
    if (!isProfileLoading && !isQrsLoading && profile && qrs && !intel && !isIntelLoading && !fetchStarted.current && isStarterPlus) {
      const fetchIntel = async () => {
        fetchStarted.current = true;
        setIsIntelLoading(true);
        try {
          const [res, mkt] = await Promise.all([
            generateBusinessIntel({
              userName: profile.displayName || "User",
              totalScans,
              qrCodeCount: profile.qrCodeCount || 0,
              recentScansHistory: scanChartData.map(d => ({ date: d.fullDate, count: d.scans })),
              planTier: profile.currentPlanId || 'free_plan'
            }),
            isEnterprise ? generateMarketingSuggestions({
              scanHistory: scanChartData.map(d => ({ date: d.fullDate, count: d.scans })),
              industry: "General Business",
              qrTypesUsed: qrs.map(q => q.title)
            }) : Promise.resolve(null)
          ]);
          setIntel(res);
          setMarketingSuggestion(mkt);
        } catch (err) {
          console.error("AI BI Failure:", err);
        } finally {
          setIsIntelLoading(false);
        }
      };
      fetchIntel();
    }
  }, [profile, qrs, isProfileLoading, isQrsLoading, totalScans, scanChartData, intel, isIntelLoading, isStarterPlus, isEnterprise]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 px-2 sm:px-4">
      
      {/* GLOBAL STATS HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Interaction", value: totalScans.toLocaleString(), sub: "Lifetime Volume", icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Active Today", value: todayScans.toLocaleString(), sub: "Last 24 Hours", icon: Zap, color: "text-emerald-600", bg: "bg-emerald-50" },
          { title: "Returning Fans", value: returningScanners.toLocaleString(), sub: "Loyalty DNA", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
          { title: "Shield Status", value: flaggedScans.toLocaleString(), sub: "Bots Filtered", icon: ShieldCheck, color: "text-orange-500", bg: "bg-orange-50" },
        ].map((s, i) => (
          <Card key={i} className="border-none shadow-sm bg-white rounded-2xl group hover:shadow-xl transition-all">
             <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                   <div className={cn("p-3 rounded-xl shadow-inner", s.bg, s.color)}><s.icon className="h-5 w-5" /></div>
                   <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-primary/20">LIVE</Badge>
                </div>
                <p className="text-3xl font-black tracking-tighter">{s.value}</p>
                <div className="flex flex-col mt-1">
                   <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{s.title}</span>
                   <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-tighter">{s.sub}</span>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>

      {/* ONBOARDING ROADMAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <Card className="lg:col-span-8 border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4 bg-neutral-50/50 border-b">
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                     <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                        <Target className="h-6 w-6 text-primary" /> Setup Roadmap
                     </CardTitle>
                     <CardDescription className="text-sm font-medium">Complete these steps to unlock full potential.</CardDescription>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Ecosystem Ready</p>
                     <p className="text-2xl font-black text-primary">{progressPercent}%</p>
                  </div>
               </div>
               <div className="mt-6 h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} className="h-full bg-primary" />
               </div>
            </CardHeader>
            <CardContent className="p-8">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {onboardingSteps.map((step) => (
                    <Link key={step.id} to={step.href}>
                       <div className={cn(
                         "p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group",
                         step.done ? "bg-emerald-50 border-emerald-100" : "bg-white border-neutral-100 hover:border-primary/20 hover:shadow-lg"
                       )}>
                          <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                            step.done ? "bg-emerald-500 text-white" : "bg-neutral-100 text-muted-foreground"
                          )}>
                             {step.done ? <CheckCircle2 className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                          </div>
                          <div className="min-w-0">
                             <p className={cn("text-xs font-black uppercase tracking-tight truncate", step.done ? "text-emerald-700" : "text-foreground")}>{step.label}</p>
                             <p className="text-[10px] text-muted-foreground font-medium truncate">{step.desc}</p>
                          </div>
                       </div>
                    </Link>
                  ))}
               </div>
            </CardContent>
         </Card>

         <Card className="lg:col-span-4 border-none shadow-2xl bg-primary text-white rounded-[2.5rem] overflow-hidden p-8 flex flex-col justify-between relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000"><Sparkles className="h-40 w-40" /></div>
            <div className="space-y-6 relative z-10">
               <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-accent shadow-lg"><Zap className="h-7 w-7" /></div>
               <h3 className="text-3xl font-black leading-tight uppercase tracking-tight">Need a <br />Strategy?</h3>
               <p className="text-primary-foreground/70 text-sm font-medium leading-relaxed">
                  Let the AI Agent build your next marketing campaign and design matching Smart Pages instantly.
               </p>
            </div>
            <Button className="w-full mt-10 h-14 rounded-xl font-black bg-white text-primary hover:bg-neutral-100 transition-all shadow-2xl" asChild>
               <Link to="/dashboard/campaigns/new">LAUNCH AI AGENT</Link>
            </Button>
         </Card>
      </div>

      {/* BI COPILOT BRIEFING */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[2.5rem] relative border-l-4 border-l-primary">
            {!isStarterPlus && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-8 text-center">
                 <Lock className="h-10 w-10 text-primary/40 mb-4" />
                 <h4 className="text-xl font-bold mb-2">Copilot is Locked</h4>
                 <p className="text-sm text-muted-foreground mb-6 max-w-xs">Upgrade to Starter or Pro to activate your daily AI Business Health briefing.</p>
                 <Button asChild><Link to="/dashboard/billing">Activate Copilot</Link></Button>
              </div>
            )}
            <CardHeader className="bg-neutral-50/50 border-b p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg"><BrainCircuit className="h-6 w-6" /></div>
                  <div>
                    <CardTitle className="text-lg font-bold uppercase tracking-tight">Executive Copilot</CardTitle>
                    <Badge className="bg-primary/10 text-primary border-none text-[8px] font-bold tracking-[0.2em] px-2 py-0.5 mt-1">BUSINESS INTELLIGENCE v1.0</Badge>
                  </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              {isIntelLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Aggregating Enterprise Data...</p>
                </div>
              ) : intel ? (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="relative shrink-0">
                      <svg className="h-36 w-36 transform -rotate-90">
                        <circle cx="72" cy="72" r="62" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-neutral-100" />
                        <circle 
                          cx="72" cy="72" r="62" stroke="currentColor" strokeWidth="10" fill="transparent" 
                          strokeDasharray={390}
                          strokeDashoffset={390 - (390 * intel.healthScore) / 100}
                          className="text-primary transition-all duration-1000 ease-out" 
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-foreground">{intel.healthScore}</span>
                        <span className="text-[9px] font-bold uppercase text-muted-foreground">SCORE</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-6">
                      <div className="bg-primary/5 rounded-[1.5rem] p-6 border border-primary/10 relative overflow-hidden group">
                        <p className="text-sm font-bold text-primary mb-2 uppercase tracking-widest flex items-center gap-2"><Rocket className="h-4 w-4" /> Daily Briefing</p>
                        <p className="text-base font-bold text-foreground leading-relaxed italic">"{intel.morningBriefing}"</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-muted-foreground italic flex flex-col items-center gap-4">
                  <p className="font-medium text-sm">Copilot is ready to analyze your node network. Get started by generating scans.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <Card className="border-none shadow-2xl bg-neutral-900 text-white rounded-[2.5rem] overflow-hidden p-8 flex flex-col justify-between min-h-[320px] relative">
              <div className="space-y-6 relative z-10">
                 <div className="h-14 w-14 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg"><Activity className="h-7 w-7" /></div>
                 <h3 className="text-2xl font-bold leading-tight uppercase tracking-tight">Growth <br />Velocity</h3>
                 <div className="space-y-2">
                    <div className="flex items-end justify-between">
                       <span className="text-5xl font-bold text-accent">{intel ? `+${intel.healthScore / 2}%` : '--'}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-accent animate-pulse" style={{ width: `${intel?.healthScore || 0}%` }}></div>
                    </div>
                 </div>
              </div>
           </Card>
        </div>
      </div>

      {/* PERFORMANCE ANALYTICS CHART */}
      <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
         <CardHeader className="p-8">
            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3"><LineChart className="h-6 w-6 text-primary" /> Scan Interaction Node</CardTitle>
            <CardDescription className="text-sm font-medium">Real-time scan logs across all dynamic links.</CardDescription>
         </CardHeader>
         <CardContent className="p-8 pt-0 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={scanChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="scans" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} barSize={40} />
               </BarChart>
            </ResponsiveContainer>
         </CardContent>
      </Card>

      {/* RECENT INTERACTION REGISTRY */}
      <div className="space-y-4 pt-8">
         <div className="flex items-center justify-between">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3"><Layers className="h-6 w-6 text-primary" /> Interaction Registry</h3>
            <Button variant="link" className="font-bold text-xs uppercase text-primary" asChild><Link to="/dashboard/qrs">Manage All Links</Link></Button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isQrsLoading ? (
               Array.from({ length: 4 }).map((_, i) => <Card key={i} className="h-48 animate-pulse bg-neutral-100 border-none rounded-[2rem]" />)
            ) : qrs && qrs.length > 0 ? qrs.slice(0, 4).map((qr) => (
              <Card key={qr.id} className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden group hover:shadow-2xl transition-all duration-500">
                 <div className="p-6 bg-neutral-50/50 flex items-center justify-center aspect-video relative border-b">
                    <div className="h-24 w-24 bg-white p-2 rounded-xl shadow-inner flex items-center justify-center">
                       <QRCodeSVG value={`${baseUrl}/r/${qr.shortCode}`} size={80} />
                    </div>
                    <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                       <Button size="sm" className="rounded-xl h-9 font-bold" asChild><Link to={`/dashboard/qrs?id=${qr.id}`}>EDIT NODE</Link></Button>
                    </div>
                 </div>
                 <div className="p-5">
                    <h5 className="font-black text-xs uppercase truncate mb-1">{qr.title}</h5>
                    <div className="flex items-center justify-between">
                       <p className="text-[10px] font-bold text-primary">/r/{qr.shortCode}</p>
                       <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground"><Activity className="h-3 w-3" /> {qr.totalScans || 0}</div>
                    </div>
                 </div>
              </Card>
            )) : (
              <Card className="col-span-full border-4 border-dashed rounded-[2.5rem] bg-neutral-50/50 p-12 text-center opacity-30">
                 <QrCode className="h-12 w-12 mx-auto mb-4" />
                 <p className="font-black uppercase text-sm tracking-widest">No Interaction Nodes Found</p>
              </Card>
            )}
         </div>
      </div>

    </div>
  );
}
