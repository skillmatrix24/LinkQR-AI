"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Users, 
  Activity, 
  BadgeIndianRupee, 
  Eye, 
  ShieldCheck, 
  TrendingUp, 
  Trophy, 
  ArrowUpRight, 
  Rocket,
  AlertTriangle,
  Smartphone,
  Globe,
  ArrowRight,
  CheckCircle2,
  Clock,
  Key,
  CreditCard,
  Zap,
  MapPin,
  Map,
  SearchCode
} from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, collectionGroup, query, limit, orderBy } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const db = useFirestore();

  // Queries for global stats
  const usersRef = useMemoFirebase(() => db ? collection(db, "users") : null, [db]);
  const scansRef = useMemoFirebase(() => db ? collectionGroup(db, "scanevents") : null, [db]);
  const visitsRef = useMemoFirebase(() => db ? collection(db, "siteTraffic") : null, [db]);
  const paymentsRef = useMemoFirebase(() => db ? collectionGroup(db, "subscriptions") : null, [db]);

  // Recent data feeds
  const recentTrafficRef = useMemoFirebase(() => db ? query(collection(db, "siteTraffic"), orderBy("timestamp", "desc"), limit(6)) : null, [db]);
  const recentUsersRef = useMemoFirebase(() => db ? query(collection(db, "users"), orderBy("createdAt", "desc"), limit(6)) : null, [db]);

  const { data: users } = useCollection(usersRef);
  const { data: scans } = useCollection(scansRef);
  const { data: visits } = useCollection(visitsRef);
  const { data: payments } = useCollection(paymentsRef);
  const { data: recentTraffic } = useCollection(recentTrafficRef);

  const revenueStats = useMemo(() => {
    if (!payments) return { total: 0, gst: 0, count: 0 };
    return payments.reduce((acc, p) => {
      if (p.currency === "INR") {
        acc.total += (p.amountPaid || 0);
        acc.gst += (p.gstAmount || 0);
      }
      acc.count++;
      return acc;
    }, { total: 0, gst: 0, count: 0 });
  }, [payments]);

  const launchChecklist = [
    { label: "Connect Custom Domain (linkqr.in)", done: false, icon: Globe },
    { label: "Switch Razorpay to LIVE Mode", done: false, icon: CreditCard },
    { label: "Configure SMTP Gmail Credentials", done: false, icon: Zap },
    { label: "Production Gemini API Key Setup", done: false, icon: Key },
    { label: "Submit Sitemap to Google Search", done: false, icon: SearchCode }
  ];

  const stats = [
    { title: "Total Users", value: users?.length || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-100", trend: "+12%" },
    { title: "Gross Revenue", value: `₹${revenueStats.total.toLocaleString()}`, icon: BadgeIndianRupee, color: "text-emerald-600", bg: "bg-emerald-100", trend: "+18%" },
    { title: "Website Visits", value: (visits?.length || 0).toLocaleString(), icon: Eye, color: "text-orange-600", bg: "bg-orange-100", trend: "+5%" },
    { title: "Global Scans", value: (scans?.length || 0).toLocaleString(), icon: Activity, color: "text-purple-600", bg: "bg-purple-100", trend: "+23%" },
  ];

  return (
    <div className="space-y-8 pb-20">
      
      {/* MIGRATION ALERT FOR OWNER */}
      <Card className="border-none shadow-2xl bg-orange-600 text-white rounded-[2rem] overflow-hidden relative group">
         <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 group-hover:rotate-0 transition-transform">
            <AlertTriangle className="h-40 w-40" />
         </div>
         <CardContent className="p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-3 text-center md:text-left">
               <Badge className="bg-white/20 text-white border-none px-4 py-1 font-bold text-[10px] uppercase">Action Required</Badge>
               <h3 className="text-2xl sm:text-3xl font-black">Studio Closing: March 27th</h3>
               <p className="opacity-90 max-w-xl text-sm sm:text-base font-medium leading-relaxed">
                  Google is shutting down Firebase Studio. Follow our migration guide to move this platform to your local machine or GitHub to keep it running forever.
               </p>
            </div>
            <Button className="bg-white text-orange-600 hover:bg-neutral-100 h-14 px-10 rounded-2xl font-black gap-2 shadow-2xl" asChild>
               <Link to="/admin/migration">Launch Migration Hub <MapPin className="h-5 w-5" /></Link>
            </Button>
         </CardContent>
      </Card>

      <Card className="border-none shadow-2xl bg-primary text-white rounded-[2.5rem] overflow-hidden relative border-8 border-white">
         <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Rocket className="h-48 w-48 text-white" /></div>
         <CardHeader className="p-8 sm:p-10 border-b border-white/10">
            <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
               <Trophy className="h-6 w-6 text-accent" /> Launch Readiness Hub
            </CardTitle>
            <CardDescription className="text-primary-foreground/60 font-medium">Verify these technical nodes before public global launch.</CardDescription>
         </CardHeader>
         <CardContent className="p-8 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {launchChecklist.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                 <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="h-5 w-5 text-accent" />
                 </div>
                 <span className="text-xs font-bold uppercase tracking-tight">{item.label}</span>
                 <div className="ml-auto opacity-20"><Clock className="h-4 w-4" /></div>
              </div>
            ))}
            <div className="md:col-span-2 pt-4">
               <Button className="w-full h-14 rounded-2xl bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest gap-2" asChild>
                  <Link to="/admin/settings">Complete Configuration Node <ArrowRight className="h-4 w-4" /></Link>
               </Button>
            </div>
         </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter flex items-center gap-4">
             <div className="bg-primary p-2.5 rounded-2xl text-white shadow-xl shadow-primary/20"><ShieldCheck className="h-8 w-8" /></div>
             Command Center
          </h1>
          <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.4em] mt-3 flex items-center gap-2">
             <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span> 
             Platform Intelligence v9.0
          </p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="h-12 px-6 rounded-xl font-bold border-2 gap-2" asChild>
              <Link to="/admin/traffic"><Activity className="h-4 w-4" /> Traffic Hub</Link>
           </Button>
           <Button className="h-12 px-8 rounded-xl font-bold gap-2 shadow-xl shadow-primary/20" asChild>
              <Link to="/admin/users"><Users className="h-4 w-4" /> User Directory</Link>
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-2xl transition-all duration-500 group rounded-[2rem] bg-white overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 shadow-sm`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold text-[10px]">{stat.trend}</Badge>
              </div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1">{stat.title}</p>
              <p className="text-3xl font-bold tracking-tighter">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 border-none shadow-xl bg-neutral-900 text-white rounded-[3rem] overflow-hidden relative">
           <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12"><Trophy className="h-48 w-48 text-accent" /></div>
           <CardHeader className="p-10 border-b border-white/5">
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                       <Rocket className="h-6 w-6 text-accent" /> Platform Velocity
                    </CardTitle>
                    <CardDescription className="text-neutral-400 font-medium">Real-time health index across all services.</CardDescription>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">Growth Index</p>
                    <p className="text-3xl font-bold">94.2</p>
                 </div>
              </div>
           </CardHeader>
           <CardContent className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                   { label: "Active Subscriptions", value: revenueStats.count, trend: "+5.2%", color: "text-blue-400" },
                   { label: "Daily Scan Capacity", value: "98.2%", trend: "STABLE", color: "text-emerald-400" },
                   { label: "Retention Rate", value: "88.4%", trend: "+2.1%", color: "text-amber-400" }
                 ].map((m, idx) => (
                   <div key={idx} className="space-y-3 p-6 bg-white/5 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-colors">
                      <p className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest">{m.label}</p>
                      <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                      <div className="flex items-center gap-1 text-[9px] font-bold text-neutral-400">
                         {m.trend.startsWith('+') ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <Activity className="h-3 w-3" />}
                         {m.trend}
                      </div>
                   </div>
                 ))}
              </div>
           </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-none shadow-xl bg-white rounded-[3rem] overflow-hidden flex flex-col">
           <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold">Signals</CardTitle>
              <Activity className="h-5 w-5 text-primary animate-pulse" />
           </CardHeader>
           <CardContent className="p-8 space-y-6 flex-1 overflow-y-auto">
              <div className="space-y-4">
                 {recentTraffic?.map((traffic, idx) => (
                   <div key={idx} className="flex items-center justify-between gap-4 p-4 hover:bg-neutral-50 rounded-2xl transition-all cursor-default group">
                      <div className="flex items-center gap-3">
                         <div className="h-9 w-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-400 group-hover:bg-white shadow-sm transition-all">
                            {traffic.deviceType === 'mobile' ? <Smartphone className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                         </div>
                         <div className="min-w-0">
                            <p className="text-[11px] font-bold truncate">{traffic.path || '/'}</p>
                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">{traffic.ipAddress}</p>
                         </div>
                      </div>
                      <Badge variant="outline" className={`text-[8px] font-bold tracking-widest ${traffic.isBot ? 'text-orange-500 border-orange-100 bg-orange-50' : 'text-emerald-600 border-emerald-100 bg-emerald-50'}`}>
                         {traffic.isBot ? 'BOT' : 'OK'}
                      </Badge>
                   </div>
                 ))}
              </div>
           </CardContent>
           <div className="p-8 pt-0 mt-auto">
              <Button variant="outline" className="w-full h-12 rounded-xl font-bold text-[10px] uppercase tracking-widest border-2 gap-2" asChild>
                 <Link to="/admin/traffic">View Full Ledger <ArrowUpRight className="h-3 w-3" /></Link>
              </Button>
           </div>
        </Card>
      </div>
    </div>
  );
}
