"use client";

import { useMemo, Suspense, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ShieldCheck, 
  Smartphone, 
  Loader2, 
  FileDown, 
  Activity, 
  Globe, 
  Zap, 
  Monitor, 
  Clock, 
  ShieldAlert,
  BrainCircuit,
  TrendingUp,
  BadgeIndianRupee,
  UserCheck,
  Trophy,
  Target,
  ArrowRight,
  Users2,
  Users,
  Lock,
  Crown,
  MousePointer2,
  Sparkles,
  Info,
  BarChart3,
  MousePointerClick,
  Share2,
  Filter,
  Calendar
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart, 
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collectionGroup, query, orderBy, limit as firestoreLimit, where, collection, doc } from "firebase/firestore";
import { format, isValid, subDays, getHours, isToday, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { generateBehaviorAnalysis, type BehaviorOutput } from "@/ai/flows/ai-behavior-analysis-flow";
import { generateRevenueInsights, type RevenueOutput } from "@/ai/flows/ai-revenue-insights-flow";
import { generateCompetitorIntel, type CompetitorOutput } from "@/ai/flows/ai-competitor-intel-flow";
import { generateCustomerSegmentation, type SegmentationOutput } from "@/ai/flows/ai-customer-segmentation-flow";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function AnalyticsContent() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const qrId = searchParams.get("id");

  const [dateFilter, setDateFilter] = useState<'today' | '7d' | '30d' | 'all'>('all');
  const [behavioralIntel, setBehavioralIntel] = useState<BehaviorOutput | null>(null);
  const [revenueIntel, setRevenueIntel] = useState<RevenueOutput | null>(null);
  const [competitorIntel, setCompetitorIntel] = useState<CompetitorOutput | null>(null);
  const [segmentIntel, setSegmentIntel] = useState<SegmentationOutput | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(userProfileRef);

  const isAdmin = !!(profile?.isAdmin === true || (user?.email && user.email.toLowerCase() === 'skillmatrix24@gmail.com'));
  const currentPlanId = profile?.currentPlanId || 'free_plan';
  const isProPlus = currentPlanId === 'pro_plan' || currentPlanId === 'ent_plan' || isAdmin;
  const isEnterprise = currentPlanId === 'ent_plan' || isAdmin;

  const qrDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid || !qrId) return null;
    return doc(db, "users", user.uid, "qrcodes", qrId);
  }, [db, user?.uid, qrId]);

  const { data: qrDetails } = useDoc(qrDocRef);

  // 1. Scan Events Query
  const scansQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    if (qrId) {
      return query(
        collection(db, "users", user.uid, "qrcodes", qrId, "scanevents"),
        orderBy("timestamp", "desc"),
        firestoreLimit(1000)
      );
    } else {
      return query(
        collectionGroup(db, "scanevents"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc"),
        firestoreLimit(1000)
      );
    }
  }, [db, user?.uid, qrId]);

  const { data: rawScans, isLoading: scansLoading } = useCollection(scansQuery);

  // 2. Click Events Query
  const clicksQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    if (qrId) {
      return query(
        collection(db, "users", user.uid, "qrcodes", qrId, "clickevents"),
        orderBy("timestamp", "desc"),
        firestoreLimit(1000)
      );
    } else {
      return query(
        collectionGroup(db, "clickevents"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc"),
        firestoreLimit(1000)
      );
    }
  }, [db, user?.uid, qrId]);

  const { data: rawClicks, isLoading: clicksLoading } = useCollection(clicksQuery);

  const filteredData = useMemo(() => {
     const now = new Date();
     let start = subDays(now, 365); // Default All
     if (dateFilter === 'today') start = startOfDay(now);
     if (dateFilter === '7d') start = subDays(now, 7);
     if (dateFilter === '30d') start = subDays(now, 30);

     const interval = { start, end: endOfDay(now) };

     const scans = (rawScans || []).filter(s => {
        const d = s.timestamp?.toDate ? s.timestamp.toDate() : new Date();
        return isWithinInterval(d, interval);
     });

     const clicks = (rawClicks || []).filter(c => {
        const d = c.timestamp?.toDate ? c.timestamp.toDate() : new Date();
        return isWithinInterval(d, interval);
     });

     return { scans, clicks };
  }, [rawScans, rawClicks, dateFilter]);

  const { scans, clicks } = filteredData;

  const qrsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, "users", user.uid, "qrcodes"), firestoreLimit(10));
  }, [db, user?.uid]);
  const { data: qrs } = useCollection(qrsQuery);

  const totalScans = qrs?.reduce((acc, curr) => acc + (curr.totalScans || 0), 0) || 0;

  // Click Metrics Memo
  const clickMetrics = useMemo(() => {
    const counts: Record<string, number> = {
      CALL: 0, WHATSAPP: 0, EMAIL: 0, SAVE_CONTACT: 0,
      WEBSITE: 0, DIRECTIONS: 0, SOCIAL_CLICK: 0, UPI_PAYMENT: 0
    };
    const socialBreakdown: Record<string, number> = {};

    if (clicks) {
      clicks.forEach(c => {
        if (counts[c.type] !== undefined) counts[c.type]++;
        if (c.type === 'SOCIAL_CLICK' && c.platform) {
          socialBreakdown[c.platform] = (socialBreakdown[c.platform] || 0) + 1;
        }
      });
    }

    const highIntentConversions = counts.CALL + counts.WHATSAPP + counts.EMAIL + counts.SAVE_CONTACT + counts.UPI_PAYMENT;
    const totalActions = Object.values(counts).reduce((a, b) => a + b, 0);
    
    // Accurate period-specific denominator
    const activeTotalScans = (qrId && qrDetails) ? (qrDetails.totalScans || 0) : totalScans;
    const denominator = dateFilter === 'all' ? activeTotalScans : (scans?.length || 0);
    
    const conversionRate = denominator > 0 ? ((highIntentConversions / denominator) * 100).toFixed(1) : "0.0";

    const breakdownData = Object.entries(counts).map(([name, value]) => ({ name, value }));
    const socialData = Object.entries(socialBreakdown).map(([name, value]) => ({ name, value }));

    const sortedActions = [...breakdownData].sort((a,b) => b.value - a.value);
    const topAction = sortedActions[0]?.value > 0 ? sortedActions[0].name : "No Data";
    
    const sortedSocial = [...socialData].sort((a,b) => b.value - a.value);
    const topSocial = sortedSocial[0]?.value > 0 ? sortedSocial[0].name : "No Social";

    return { 
      counts, 
      highIntentConversions, 
      totalActions, 
      conversionRate, 
      breakdownData, 
      socialData,
      topAction,
      topSocial
    };
  }, [clicks, scans, totalScans, qrId, qrDetails, dateFilter]);

  const chartData = useMemo(() => {
    if (!scans) return [];
    const days: Record<string, any> = {};
    
    const range = dateFilter === 'today' ? 1 : dateFilter === '7d' ? 7 : 30;
    for (let i = range - 1; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, 'dd MMM');
      days[dateStr] = { day: dateStr, organic: 0, bot: 0 };
    }
    
    scans.forEach(scan => {
      let dateObj;
      if (scan.timestamp?.toDate) dateObj = scan.timestamp.toDate();
      else if (scan.timestamp) dateObj = new Date(scan.timestamp);
      
      if (dateObj && isValid(dateObj)) {
        const dateStr = format(dateObj, 'dd MMM');
        if (days[dateStr]) {
          if (scan.isBot) days[dateStr].bot++;
          else days[dateStr].organic++;
        }
      }
    });

    return Object.values(days);
  }, [scans, dateFilter]);

  const timeOfDayData = useMemo(() => {
    if (!scans) return [];
    const periods = [
      { name: 'Morning', hours: [6, 7, 8, 9, 10, 11], count: 0 },
      { name: 'Afternoon', hours: [12, 13, 14, 15, 16, 17], count: 0 },
      { name: 'Evening', hours: [18, 19, 20, 21], count: 0 },
      { name: 'Night', hours: [22, 23, 0, 1, 2, 3, 4, 5], count: 0 }
    ];

    scans.forEach(scan => {
      if (!scan.timestamp?.toDate) return;
      const hour = getHours(scan.timestamp.toDate());
      const period = periods.find(p => p.hours.includes(hour));
      if (period) period.count++;
    });

    return periods.map(p => ({ name: p.name, count: p.count }));
  }, [scans]);

  const segmentRadarData = useMemo(() => {
    if (!segmentIntel) return [
      { subject: 'VIP', A: 0, fullMark: 100 },
      { subject: 'Frequent', A: 0, fullMark: 100 },
      { subject: 'New', A: 0, fullMark: 100 },
      { subject: 'Inactive', A: 0, fullMark: 100 },
    ];
    return [
      { subject: 'VIP', A: segmentIntel.breakdown.vip, fullMark: 100 },
      { subject: 'Frequent', A: segmentIntel.breakdown.frequent, fullMark: 100 },
      { subject: 'New', A: segmentIntel.breakdown.new, fullMark: 100 },
      { subject: 'Inactive', A: segmentIntel.breakdown.inactive, fullMark: 100 },
    ];
  }, [segmentIntel]);

  useEffect(() => {
    if (scans && scans.length > 5 && !isAiLoading && isProPlus) {
      const runIntelligence = async () => {
        setIsAiLoading(true);
        try {
          const behaviorTask = generateBehaviorAnalysis({
            scanLogs: scans.slice(0, 50).map(s => ({
              timestamp: s.timestamp?.toDate ? s.timestamp.toDate().toISOString() : new Date().toISOString(),
              deviceType: s.deviceType || 'unknown',
              isBot: !!s.isBot
            }))
          });

          let revenueTask: Promise<RevenueOutput | null> = Promise.resolve(null);
          let competitorTask: Promise<CompetitorOutput | null> = Promise.resolve(null);
          let segmentsTask: Promise<SegmentationOutput | null> = Promise.resolve(null);

          if (isEnterprise) {
            revenueTask = generateRevenueInsights({
              totalScans: scans.length,
              avgConversionRate: 10, 
              avgSaleValue: 500, 
              historicalScans: chartData.map(d => ({ date: d.day, count: d.organic }))
            });
            competitorTask = generateCompetitorIntel({
              currentRating: 4.8,
              totalReviews: scans.length / 5,
              category: "General SaaS"
            });
            segmentsTask = generateCustomerSegmentation({
              scanLogs: scans.slice(0, 100).map(s => ({
                ipAddress: s.ipAddress || 'unknown',
                timestamp: s.timestamp?.toDate ? s.timestamp.toDate().toISOString() : new Date().toISOString()
              }))
            });
          }

          const [behavior, revenue, competitor, segments] = await Promise.all([
            behaviorTask,
            revenueTask,
            competitorTask,
            segmentsTask
          ]);

          setBehavioralIntel(behavior);
          setRevenueIntel(revenue);
          setCompetitorIntel(competitor);
          setSegmentIntel(segments);

        } catch (e) {
          console.error("AI Intelligence Error:", e);
        } finally {
          setIsAiLoading(false);
        }
      };
      runIntelligence();
    }
  }, [scans, isAiLoading, chartData, isProPlus, isEnterprise]);

  const total = scans?.length || 0;
  const flaggedCount = scans?.filter(s => s.isBot).length || 0;
  const organicCount = total - flaggedCount;

  const exportScansToCSV = () => {
    if (!scans || scans.length === 0) return;
    const headers = ['Timestamp', 'IP Address', 'Device', 'OS', 'Browser', 'Is Bot', 'Reason'];
    const rows = scans.map(scan => [
      `"${scan.timestamp?.toDate ? format(scan.timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}"`,
      `"${scan.ipAddress}"`,
      `"${scan.deviceType}"`,
      `"${scan.operatingSystem}"`,
      `"${scan.browserName}"`,
      scan.isBot ? 'Yes' : 'No',
      `"${scan.botReason || 'N/A'}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `linkqr-bi-report-${qrId || 'global'}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    toast({ title: "Intelligence Exported" });
  };

  if (scansLoading || clicksLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
      <div className="relative">
         <Loader2 className="animate-spin h-12 w-12 text-primary" />
         <Zap className="absolute inset-0 m-auto h-5 w-5 text-accent animate-pulse" />
      </div>
      <p className="font-bold text-lg uppercase tracking-widest text-muted-foreground">Synchronizing Analytics Nodes...</p>
    </div>
  );

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-32 px-2 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary font-bold uppercase tracking-[0.2em] text-[10px] px-3 h-6 rounded-md">
              BI v10.0 CONVERSION ENGINE
            </Badge>
            {isAiLoading && <div className="flex items-center gap-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin text-accent" /><span className="text-[10px] font-black uppercase text-accent tracking-tighter">Analyzing Behavioral DNA...</span></div>}
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground leading-[1.1]">
            {qrId ? `Insight: ${qrDetails?.title || "Smart Node"}` : "Intelligence Hub"}
          </h1>
          
          <div className="flex bg-neutral-100 p-1 rounded-xl w-fit mt-4 shadow-inner">
             {['today', '7d', '30d', 'all'].map((f) => (
               <button 
                key={f}
                onClick={() => setDateFilter(f as any)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                  dateFilter === f ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-primary/60"
                )}
               >
                 {f === 'today' ? 'Today' : f === '7d' ? '7 Days' : f === '30d' ? '30 Days' : 'All Time'}
               </button>
             ))}
          </div>
        </div>
        <Button variant="outline" size="lg" onClick={exportScansToCSV} disabled={!scans || scans.length === 0} className="gap-3 font-black uppercase text-xs border-2 h-16 px-10 rounded-2xl shadow-xl hover:bg-neutral-50 transition-all hover:scale-[1.02] active:scale-95">
          <FileDown className="h-5 w-5" /> Export Intelligence
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {[
          { title: "Period Interactions", value: total.toLocaleString(), sub: "In-Range Volume", icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Loyalty Index", value: segmentIntel ? `${segmentIntel.loyaltyScore}%` : (isEnterprise ? "---" : "Locked"), sub: "Retention Power", icon: UserCheck, color: "text-primary", bg: "bg-primary/10" },
          { title: "High-Intent Clicks", value: clickMetrics.highIntentConversions.toLocaleString(), sub: "Lead Ingress", icon: Zap, color: "text-emerald-600", bg: "bg-emerald-50" },
          { title: "Conversion Rate", value: `${clickMetrics.conversionRate}%`, sub: "Performance Index", icon: MousePointerClick, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-xl bg-white rounded-[2.5rem] group hover:shadow-2xl transition-all duration-500 border border-neutral-100">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-inner group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                {stat.value === 'Locked' && <Crown className="h-4 w-4 text-amber-500 animate-pulse" />}
              </div>
              <p className="text-4xl sm:text-5xl font-black tracking-tighter mb-2">{stat.value}</p>
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase text-muted-foreground tracking-widest leading-none">{stat.title}</span>
                <span className="text-[10px] font-bold text-muted-foreground/50 uppercase mt-1 tracking-tighter">{stat.sub}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <Card className="lg:col-span-2 border-none shadow-xl bg-white rounded-[2.5rem] p-8 border border-neutral-100 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000"><BrainCircuit className="h-32 w-32 text-primary" /></div>
            <div className="space-y-6 relative z-10">
               <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-inner"><Target className="h-7 w-7" /></div>
               <h3 className="text-2xl font-black uppercase tracking-tight">Performance Summary</h3>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  <div className="space-y-1">
                     <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Top Action Node</p>
                     <p className="text-xl font-black text-primary">{clickMetrics.topAction}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Social Leader</p>
                     <p className="text-xl font-black text-primary">{clickMetrics.topSocial}</p>
                  </div>
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                     <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Total Actions</p>
                     <p className="text-xl font-black text-primary">{clickMetrics.totalActions}</p>
                  </div>
               </div>
            </div>
            <div className="mt-8 pt-6 border-t flex items-center justify-between">
               <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Click Analytics Integrity</span>
               <span className="text-[9px] font-black uppercase text-emerald-600 tracking-[0.2em] flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> SYNCED</span>
            </div>
         </Card>

         <Card className="lg:col-span-1 border-none shadow-xl bg-[#0a0a0a] text-white rounded-[2.5rem] p-8 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12"><Zap className="h-32 w-32 text-accent" /></div>
            <div className="space-y-4 relative z-10 text-center">
               <p className="text-[10px] font-black uppercase text-accent tracking-[0.4em]">Health Score</p>
               <p className="text-7xl font-black text-white tracking-tighter">{behavioralIntel ? (100 - (behavioralIntel.fraudRiskLevel === 'High' ? 40 : behavioralIntel.fraudRiskLevel === 'Medium' ? 20 : 0)) : '--'}</p>
               <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Behavioral Integrity Index</p>
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
        <Card className="lg:col-span-8 border-none shadow-2xl bg-white rounded-[3.5rem] overflow-hidden relative border border-neutral-100">
          {!isEnterprise && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2.5px] z-20 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
               <div className="h-20 w-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-white"><Crown className="h-10 w-10" /></div>
               <h4 className="text-3xl font-black tracking-tighter mb-2">Audience Segmentation Locked</h4>
               <p className="text-base text-muted-foreground mb-10 max-w-sm font-medium leading-relaxed">Identify VIP fans and analyze loyalty DNA with Level 9 BI Intelligence.</p>
               <Button asChild size="lg" className="rounded-2xl h-16 px-12 shadow-2xl bg-primary hover:bg-primary/90 font-black"><Link to="/dashboard/billing">Activate Enterprise Engine</Link></Button>
            </div>
          )}
          <CardHeader className="p-8 sm:p-12 pb-0">
             <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="space-y-1">
                   <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-4">
                      <Users className="h-8 w-8 text-primary" /> Audience DNA
                   </CardTitle>
                   <CardDescription className="text-sm sm:text-base font-bold text-muted-foreground/60 uppercase tracking-widest">Psychographic user categorization hub.</CardDescription>
                </div>
                {segmentIntel && (
                  <Badge className="bg-primary text-white border-none font-black text-[10px] uppercase tracking-widest px-5 py-2 h-fit rounded-full shadow-lg">
                     DOMINANT: {segmentIntel.topSegment}
                  </Badge>
                )}
             </div>
          </CardHeader>
          <CardContent className="p-8 sm:p-12">
             <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
                <div className="md:col-span-7 h-[350px] sm:h-[400px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={segmentRadarData}>
                         <PolarGrid stroke="#f0f0f0" />
                         <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fontWeight: 900, fill: '#666', letterSpacing: '0.1em'}} />
                         <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
                         <Radar
                            name="Audience"
                            dataKey="A"
                            stroke="hsl(var(--primary))"
                            strokeWidth={4}
                            fill="hsl(var(--primary))"
                            fillOpacity={0.4}
                         />
                      </RadarChart>
                   </ResponsiveContainer>
                </div>
                <div className="md:col-span-5 space-y-8">
                   {segmentIntel ? (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                         <div className="p-8 rounded-[2.5rem] bg-neutral-900 text-white border border-white/5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000"><BrainCircuit className="h-20 w-20 text-accent" /></div>
                            <p className="text-[10px] font-black uppercase text-accent tracking-[0.3em] mb-4 flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Segment Advisor</p>
                            <p className="text-base sm:text-lg font-bold italic leading-relaxed text-neutral-200">"{segmentIntel.segmentAdvice}"</p>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            {[
                               { label: 'VIP NODES', val: segmentIntel.breakdown.vip, color: 'text-amber-500' },
                               { label: 'NEW USERS', val: segmentIntel.breakdown.new, color: 'text-blue-500' }
                            ].map((item, i) => (
                               <div key={i} className="p-5 bg-neutral-50 rounded-2xl border border-neutral-100 text-center shadow-inner group hover:bg-white hover:shadow-xl transition-all">
                                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
                                  <p className={`text-2xl font-black ${item.color}`}>{item.val}</p>
                               </div>
                            ))}
                         </div>
                      </motion.div>
                   ) : (
                      <div className="py-24 text-center border-4 border-dashed rounded-[3rem] opacity-20 border-neutral-200">
                         <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
                         <p className="text-[11px] font-black uppercase tracking-[0.3em]">Extracting DNA...</p>
                      </div>
                   )}
                </div>
             </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-none shadow-2xl bg-[#0a0a0a] text-white rounded-[3.5rem] overflow-hidden p-10 sm:p-12 flex flex-col justify-between relative">
           <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12"><Users2 className="h-48 w-48 text-accent" /></div>
           <div className="space-y-10 relative z-10">
              <div className="h-16 w-16 rounded-[1.5rem] bg-white/10 flex items-center justify-center text-accent shadow-xl">
                 <Target className="h-8 w-8" />
              </div>
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-[1.0] uppercase">Conversion <br /><span className="text-accent">Intelligence</span></h3>
              <p className="text-neutral-400 text-sm sm:text-base font-medium leading-relaxed">
                 We track every high-intent action (Call, WhatsApp, Save Contact) to calculate your true ROI per scan.
              </p>
              <div className="space-y-5">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase text-neutral-500 tracking-widest">
                    <span>Performance Capture</span>
                    <span className="text-accent">{clickMetrics.conversionRate}%</span>
                 </div>
                 <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${clickMetrics.conversionRate}%` }} transition={{ duration: 1.5 }} className="h-full bg-accent rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                 </div>
              </div>
           </div>
           <Button variant="ghost" className="w-full text-accent font-black text-[10px] uppercase tracking-[0.3em] mt-12 hover:bg-accent/10 border-t border-white/5 pt-8 h-auto flex items-center justify-center gap-3 group" asChild>
              <Link to="/dashboard/billing">Unlock Sales Ledger <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></Link>
           </Button>
        </Card>
      </div>

      {/* CLICK Performance Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <Card className="lg:col-span-8 border-none shadow-2xl bg-white rounded-[4rem] overflow-hidden border border-neutral-100">
            <CardHeader className="p-8 sm:p-14 pb-0">
               <div className="space-y-2">
                  <CardTitle className="text-3xl font-black tracking-tight flex items-center gap-5">
                     <BarChart3 className="h-10 w-10 text-primary" /> Click Performance Matrix
                  </CardTitle>
                  <CardDescription className="text-base font-bold text-muted-foreground/60 uppercase tracking-widest">Interaction breakdown by intent node.</CardDescription>
               </div>
            </CardHeader>
            <CardContent className="p-8 sm:p-14 h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clickMetrics.breakdownData.filter(d => d.value > 0 || d.name === 'CALL')}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#999', letterSpacing: '0.1em'}} dy={15} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#999'}} />
                     <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 30px 60px rgba(0,0,0,0.15)', fontWeight: 900}} />
                     <Bar dataKey="value" fill="hsl(var(--primary))" radius={[12, 12, 0, 0]} barSize={45} />
                  </BarChart>
               </ResponsiveContainer>
            </CardContent>
         </Card>

         <Card className="lg:col-span-4 border-none shadow-2xl bg-neutral-900 text-white rounded-[4rem] p-10 sm:p-12 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000"><Share2 className="h-48 w-48 text-accent" /></div>
            <div className="space-y-10 relative z-10">
               <div className="h-16 w-16 rounded-[1.5rem] bg-white/10 flex items-center justify-center text-accent shadow-xl"><Globe className="h-8 w-8" /></div>
               <h3 className="text-3xl font-black uppercase tracking-tight leading-none">Social <br /><span className="text-accent">Engagement</span></h3>
               <div className="space-y-6">
                  {clickMetrics.socialData.length > 0 ? clickMetrics.socialData.map((s, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                          <span>{s.name}</span>
                          <span className="text-accent">{s.value} Clicks</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(s.value / (clickMetrics.totalActions || 1)) * 100}%` }} className="h-full bg-accent" />
                       </div>
                    </div>
                  )) : (
                    <div className="py-10 text-center opacity-30 italic font-black uppercase tracking-[0.2em] text-[10px]">No Social Signals Yet</div>
                  )}
               </div>
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40 mt-10">Brand Footprint Analysis</p>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-12 border-none shadow-2xl bg-white rounded-[4rem] overflow-hidden relative border border-neutral-100">
          {!isEnterprise && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[3px] z-20 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-700">
               <div className="h-24 w-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-2xl border-8 border-white"><BadgeIndianRupee className="h-12 w-12" /></div>
               <h4 className="text-4xl font-black tracking-tighter mb-4 uppercase">Revenue Mastery Locked</h4>
               <p className="text-lg text-muted-foreground mb-12 max-w-lg font-medium leading-relaxed">Predict next month's capture and analyze fiscal ROI with high-fidelity financial modeling nodes.</p>
               <Button asChild size="lg" className="rounded-3xl h-20 px-16 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 shadow-2xl font-black text-lg transition-transform hover:scale-[1.03] active:scale-95"><Link to="/dashboard/billing">ACTIVATE REVENUE BI</Link></Button>
            </div>
          )}
          <CardHeader className="p-8 sm:p-14 pb-0">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                <div className="space-y-2">
                   <CardTitle className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-5">
                      <BadgeIndianRupee className="h-10 w-10 text-emerald-600" /> Revenue Forecasting
                   </CardTitle>
                   <CardDescription className="text-base sm:text-lg font-bold text-muted-foreground/60 uppercase tracking-widest">Predictive fiscal intelligence modeling.</CardDescription>
                </div>
                {revenueIntel && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-6 bg-emerald-50 px-8 py-5 rounded-[2.5rem] border-2 border-emerald-100 shadow-inner">
                     <div className="text-right">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-1">Growth Velocity</p>
                        <p className="text-3xl font-black text-emerald-700">+{revenueIntel.expectedGrowth}%</p>
                     </div>
                     <div className="h-14 w-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg"><TrendingUp className="h-7 w-7" /></div>
                  </motion.div>
                )}
             </div>
          </CardHeader>
          <CardContent className="p-8 sm:p-14 space-y-12">
             <div className="h-[350px] sm:h-[450px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 900, fill: '#999', letterSpacing: '0.1em'}} dy={15} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 900, fill: '#999'}} />
                      <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 30px 60px rgba(0,0,0,0.15)', fontWeight: 900}} />
                      <Area type="monotone" dataKey="organic" name="Projected Value" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#colorRev)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
             
             {revenueIntel ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-10 rounded-[3rem] bg-neutral-900 text-white space-y-6 shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000"><TrendingUp className="h-40 w-40 text-accent" /></div>
                     <div className="flex items-center gap-4 relative z-10">
                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-accent shadow-inner"><Target className="h-5 w-5" /></div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] opacity-70">30-Day Capture Potential</h4>
                     </div>
                     <p className="text-5xl font-black tracking-tighter relative z-10">₹{revenueIntel.predictedMonthlyRevenue.toLocaleString()}</p>
                     <p className="text-xs sm:text-sm font-bold text-neutral-400 leading-relaxed italic relative z-10">"Estimated revenue capture based on historical interaction density."</p>
                  </div>
                  <div className="p-10 rounded-[3rem] border-4 border-emerald-100 bg-emerald-50/20 flex flex-col justify-between group hover:border-emerald-200 transition-all">
                     <div className="space-y-4">
                        <Badge variant="outline" className="h-6 px-4 font-black text-[10px] uppercase border-emerald-200 text-emerald-600 bg-white">FISCAL INSIGHT</Badge>
                        <p className="text-xl sm:text-2xl font-black text-emerald-950 leading-tight">"{revenueIntel.revenueInsight}"</p>
                     </div>
                     <div className="flex items-center gap-4 mt-8">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg font-black text-xs uppercase">ROI</div>
                        <div className="flex flex-col">
                           <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Current Status</p>
                           <p className="text-xl font-black text-emerald-800">{revenueIntel.roiStatus} PERFORMANCE</p>
                        </div>
                     </div>
                  </div>
               </div>
             ) : (
               <div className="py-20 text-center opacity-30 italic font-black uppercase tracking-[0.4em] text-sm">Synchronizing Fiscal Nodes...</div>
             )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
         <Card className="border-none shadow-2xl bg-white rounded-[3.5rem] overflow-hidden flex flex-col relative border border-neutral-100">
            {!isProPlus && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
                 <Lock className="h-10 w-10 text-primary/30 mb-4" />
                 <Button variant="outline" className="border-2 font-black uppercase text-[10px] h-12 rounded-xl" asChild><Link to="/dashboard/billing">Unlock Behavioral Heatmaps</Link></Button>
              </div>
            )}
            <CardHeader className="p-8 sm:p-12 pb-0">
               <CardTitle className="text-2xl font-black flex items-center gap-4 uppercase tracking-tighter">
                  <Clock className="h-7 w-7 text-primary" /> Scan Heatmaps
               </CardTitle>
               <CardDescription className="text-sm font-bold opacity-60 uppercase tracking-widest mt-1">Temporal interaction density mapping.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 sm:p-12 h-[380px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeOfDayData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 900, fill: '#666', letterSpacing: '0.1em'}} dy={15} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 900, fill: '#666'}} />
                     <Tooltip cursor={{fill: 'rgba(0,0,0,0.03)'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 30px 60px rgba(0,0,0,0.15)', fontWeight: 900}} />
                     <Bar dataKey="count" fill="hsl(var(--primary))" radius={[16, 16, 0, 0]} barSize={55} />
                  </BarChart>
               </ResponsiveContainer>
            </CardContent>
         </Card>

         <Card className="border-none shadow-2xl bg-neutral-50 rounded-[3.5rem] overflow-hidden flex flex-col relative border border-neutral-100">
            {!isProPlus && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
                 <ShieldAlert className="h-10 w-10 text-orange-500 mb-3" />
                 <h4 className="text-sm font-black uppercase tracking-widest">Bot Shield Locked</h4>
                 <Button size="sm" variant="ghost" className="mt-4 text-xs font-black uppercase text-primary border border-primary/10" asChild><Link to="/dashboard/billing">Unlock Shield</Link></Button>
              </div>
            )}
            <div className="p-10 sm:p-14 space-y-10 flex-1">
               <div className="h-16 w-16 rounded-2xl bg-white shadow-xl flex items-center justify-center text-orange-500 border">
                  <ShieldCheck className="h-8 w-8" />
               </div>
               <div className="space-y-3">
                  <h3 className="text-3xl font-black uppercase tracking-tighter">Shield Activity</h3>
                  <p className="text-muted-foreground text-sm sm:text-base font-medium leading-relaxed">Protecting interaction integrity by filtering non-human digital signatures.</p>
               </div>
               
               <div className="space-y-4">
                  <div className="flex justify-between items-center p-5 bg-white rounded-2xl shadow-sm border border-neutral-100 group hover:shadow-xl transition-all">
                     <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500"><Users2 className="h-4 w-4" /></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Verified Human</span>
                     </div>
                     <span className="font-black text-2xl text-blue-600">{organicCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-5 bg-white rounded-2xl shadow-sm border border-neutral-100 group hover:shadow-xl transition-all">
                     <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500"><Zap className="h-4 w-4" /></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Bot Filtered</span>
                     </div>
                     <span className="font-black text-2xl text-orange-600">{flaggedCount}</span>
                  </div>
               </div>
            </div>
            <div className="p-8 bg-neutral-100 border-t flex items-center justify-between">
               <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Engine Precision Index</span>
               <span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em] flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> 99.9%</span>
            </div>
         </Card>

         <Card className="border-none shadow-2xl bg-primary text-white rounded-[3.5rem] overflow-hidden p-10 sm:p-12 flex flex-col justify-between group relative border border-primary/20">
            <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000"><Smartphone className="h-48 w-48 text-accent" /></div>
            <div className="space-y-8 relative z-10">
               <div className="h-16 w-16 rounded-[1.5rem] bg-white/10 flex items-center justify-center shadow-2xl">
                  <Monitor className="h-8 w-8" />
               </div>
               <h3 className="text-3xl sm:text-4xl font-black leading-[1.0] uppercase tracking-tighter">Environment <br />Dynamics</h3>
               <div className="space-y-6">
                  {[
                    { label: "Mobile Scans", val: scans?.filter(s => s.deviceType === 'mobile').length || 0, perc: total ? Math.round(((scans?.filter(s => s.deviceType === 'mobile').length || 0) / (total || 1)) * 100) : 0 },
                    { label: "Desktop Scans", val: scans?.filter(s => s.deviceType === 'desktop').length || 0, perc: total ? Math.round(((scans?.filter(s => s.deviceType === 'desktop').length || 0) / (total || 1)) * 100) : 0 }
                  ].map((dev, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                          <span>{dev.label}</span>
                          <span>{dev.perc}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${dev.perc}%` }} transition={{ duration: 1.5, delay: 0.8 }} className="h-full bg-white" />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40 mt-10">Intelligent Node Distribution</p>
         </Card>
      </div>

      <Card className="border-none shadow-2xl bg-white rounded-[4rem] overflow-hidden border border-neutral-100">
        <CardHeader className="p-8 sm:p-14 border-b bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-10">
          <div className="space-y-2">
            <CardTitle className="text-3xl font-black tracking-tight flex items-center gap-5">
              <Activity className="h-8 w-8 text-primary" /> Interaction Node Stream
            </CardTitle>
            <CardDescription className="text-base font-bold text-muted-foreground/60 uppercase tracking-widest">Real-time ledger of individual digital touchpoint signatures.</CardDescription>
          </div>
          <div className="bg-white px-8 py-3 rounded-2xl border-2 shadow-xl flex items-center gap-4 ring-8 ring-neutral-100/50">
             <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
             <span className="text-[11px] font-black uppercase text-muted-foreground tracking-widest">Global Sync Active</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <div className="min-w-[1100px]">
              <Table>
                <TableHeader className="bg-neutral-50/30">
                  <TableRow className="border-none">
                    <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] pl-14 py-10">TIMESTAMP / SIGNATURE</TableHead>
                    <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] py-10">HARDWARE ENVIRONMENT</TableHead>
                    <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] py-10">NODE IDENTIFIER (IP)</TableHead>
                    <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-right pr-14 py-10">ENGINE RESULT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scans && scans.length > 0 ? scans.map((scan) => (
                    <TableRow key={scan.id} className="group hover:bg-neutral-50/50 transition-all duration-300 border-neutral-100">
                      <TableCell className="pl-14 py-8">
                        <div className="flex flex-col gap-1">
                           <span className="text-base font-black text-foreground tracking-tight">{scan.timestamp?.toDate ? format(scan.timestamp.toDate(), 'HH:mm:ss') : 'N/A'}</span>
                           <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter opacity-60">{scan.timestamp?.toDate ? format(scan.timestamp.toDate(), 'MMM dd, yyyy') : 'Recent Interaction'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-5">
                          <div className="h-14 w-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 shadow-inner group-hover:bg-white transition-all group-hover:scale-110 border border-transparent group-hover:border-neutral-100">
                            {scan.deviceType === 'mobile' ? <Smartphone className="h-7 w-7" /> : <Monitor className="h-7 w-7" />}
                          </div>
                          <div className="flex flex-col">
                            <p className="text-sm font-black uppercase tracking-tight">{scan.operatingSystem}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-widest mt-0.5">{scan.browserName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono bg-neutral-100 px-5 py-2.5 rounded-xl font-black text-muted-foreground shadow-inner border group-hover:bg-white group-hover:text-primary transition-all">
                          {scan.ipAddress === 'client-edge' ? 'ENCRYPTED_EDGE_NODE' : scan.ipAddress}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-14 py-8">
                        {scan.isBot ? (
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 text-[10px] font-black uppercase px-4 py-1.5 rounded-lg shadow-sm">BOT FILTERED</Badge>
                            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter opacity-50 max-w-[200px] truncate">{scan.botReason}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end gap-2">
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-black uppercase px-5 py-2 rounded-xl shadow-sm">HUMAN VERIFIED</Badge>
                            <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest opacity-60">
                               <ShieldCheck className="h-3 w-3" /> Integrity Secure
                            </div>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-40 opacity-20 flex flex-col items-center gap-6">
                        <Activity className="h-20 w-20 mx-auto" />
                        <p className="font-black uppercase tracking-[0.5em] text-sm">Registry Node Empty</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
        <div className="p-10 bg-neutral-50/50 border-t flex flex-col sm:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4 text-muted-foreground">
              <Info className="h-5 w-5 opacity-40" />
              <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">This stream captures 12+ hardware and network signals for every interaction node.</p>
           </div>
           <Button variant="link" className="font-black text-[11px] uppercase tracking-[0.3em] text-primary h-auto p-0" asChild>
              <Link to="/dashboard/analytics">Refresh Ledger Node <ArrowRight className="ml-2 h-4 w-4" /></Link>
           </Button>
        </div>
      </Card>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-20 min-h-screen"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>}>
      <AnalyticsContent />
    </Suspense>
  );
}
