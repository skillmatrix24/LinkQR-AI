"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, Smartphone, Laptop, Loader2, FileDown, Activity, Globe, Zap, Search, Filter, Monitor, ArrowRight, User as UserIcon, AlertTriangle, ShieldAlert } from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collectionGroup, query, orderBy, limit as firestoreLimit, collection } from "firebase/firestore";
import { format, isValid, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

export default function AdminTrafficMonitor() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // Real-time queries for both types of traffic
  const scansQuery = useMemoFirebase(() => db ? query(collectionGroup(db, "scanevents"), orderBy("timestamp", "desc"), firestoreLimit(250)) : null, [db]);
  const visitsQuery = useMemoFirebase(() => db ? query(collection(db, "siteTraffic"), orderBy("timestamp", "desc"), firestoreLimit(250)) : null, [db]);

  const { data: scans, isLoading: scansLoading } = useCollection(scansQuery);
  const { data: visits, isLoading: visitsLoading } = useCollection(visitsQuery);

  // Merge and Sort Traffic Data
  const unifiedTraffic = useMemo(() => {
    const all = [...(scans || []), ...(visits || [])];
    return all.sort((a, b) => {
      const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
      const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
      return timeB - timeA;
    });
  }, [scans, visits]);

  const filteredTraffic = useMemo(() => {
    if (!searchTerm) return unifiedTraffic;
    return unifiedTraffic.filter(t => 
      t.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.path?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.operatingSystem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.browserName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [unifiedTraffic, searchTerm]);

  const chartData = useMemo(() => {
    const days: Record<string, any> = {};
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, 'dd MMM');
      days[dateStr] = { day: dateStr, scan: 0, visit: 0 };
    }
    
    unifiedTraffic.forEach(t => {
      let dateObj;
      if (t.timestamp?.toDate) dateObj = t.timestamp.toDate();
      if (dateObj && isValid(dateObj)) {
        const dateStr = format(dateObj, 'dd MMM');
        if (days[dateStr]) {
          if (t.type === 'visit') days[dateStr].visit++;
          else days[dateStr].scan++;
        }
      }
    });

    return Object.values(days);
  }, [unifiedTraffic]);

  const stats = useMemo(() => {
    return {
      total: unifiedTraffic.length,
      scans: scans?.length || 0,
      visits: visits?.length || 0,
      bots: unifiedTraffic.filter(t => t.isBot).length,
      highRisk: unifiedTraffic.filter(t => t.isBot && t.botReason?.includes('Scam')).length
    };
  }, [unifiedTraffic, scans, visits]);

  const exportToCSV = () => {
    const headers = ['Type', 'Timestamp', 'Path/QR', 'IP', 'Device', 'OS', 'Is Bot'];
    const rows = unifiedTraffic.map(t => [
      t.type === 'visit' ? 'Organic Visit' : 'QR Scan',
      t.timestamp?.toDate ? format(t.timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss') : 'N/A',
      t.type === 'visit' ? t.path : t.qrCodeId,
      t.ipAddress,
      t.deviceType,
      t.operatingSystem,
      t.isBot ? 'Yes' : 'No'
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `global-traffic-ledger-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    toast({ title: "Ledger Exported" });
  };

  if (scansLoading || visitsLoading) return (
    <div className="flex flex-col items-center justify-center p-24 space-y-4">
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
      <p className="text-muted-foreground font-medium">Synchronizing global traffic nodes...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
             <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <Activity className="h-6 w-6" />
             </div>
             Unified Traffic Hub
          </h1>
          <p className="text-muted-foreground font-medium">Monitoring QR scans and organic website visitors.</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search IP, Path, OS..." 
                className="pl-10 h-11 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <Button variant="outline" className="h-11 gap-2 font-bold" onClick={exportToCSV}>
              <FileDown className="h-4 w-4" /> Export Ledger
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Global Traffic", value: stats.total, icon: Activity, color: "text-blue-600", bg: "bg-blue-100" },
          { title: "Organic Visits", value: stats.visits, icon: Globe, color: "text-emerald-600", bg: "bg-emerald-100" },
          { title: "QR Scans", value: stats.scans, icon: Zap, color: "text-purple-600", bg: "bg-purple-100" },
          { title: "Content Shield", value: stats.bots, icon: ShieldAlert, color: "text-orange-600", bg: "bg-orange-100" },
        ].map((s, i) => (
          <Card key={i} className="border-none shadow-sm bg-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{s.title}</p>
                <p className="text-2xl font-black">{s.value.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats.highRisk > 0 && (
        <Card className="border-none shadow-2xl bg-orange-50 border-2 border-orange-200 overflow-hidden rounded-[2rem]">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4 text-orange-800">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <div>
                <p className="font-black text-sm uppercase tracking-tight">Abuse Detection Alert</p>
                <p className="text-xs font-medium">Found {stats.highRisk} suspicious interaction nodes containing blacklisted patterns.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="bg-white border-orange-200 text-orange-600 hover:bg-orange-100 font-bold rounded-xl" onClick={() => setSearchTerm("Scam")}>Inspect Nodes</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="text-xl font-black">Interaction Dynamics</CardTitle>
            <CardDescription className="font-medium">Organic Visits vs QR Engagement.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVisit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="visit" name="Organic Visits" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorVisit)" />
                <Area type="monotone" dataKey="scan" name="QR Scans" stroke="#BF5AF2" strokeWidth={3} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-neutral-900 text-white rounded-[2rem] overflow-hidden p-8 flex flex-col justify-between">
           <div className="space-y-6">
              <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-accent">
                 <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-black">Site Intelligence</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                We are now tracking every page visit on <strong>LinkQR.in</strong>. This allows you to measure marketing campaign effectiveness beyond just QR scans.
              </p>
           </div>
           <div className="pt-6 border-t border-white/10">
              <div className="flex items-center justify-between text-[10px] font-black uppercase text-neutral-500 mb-2">
                 <span>System Precision</span>
                 <span>99.9%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full w-full bg-accent animate-pulse"></div>
              </div>
           </div>
        </Card>
      </div>

      <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
        <CardHeader className="p-8 border-b bg-neutral-50/50">
          <CardTitle className="text-xl font-black">Live Traffic Stream</CardTitle>
          <CardDescription className="text-xs">Real-time combined event logs.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <div className="min-w-[1100px]">
              <Table>
                <TableHeader className="bg-neutral-50/30">
                  <TableRow className="border-none">
                    <TableHead className="pl-10 py-6 text-[10px] font-black uppercase tracking-widest">TIMESTAMP / TYPE</TableHead>
                    <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest">PATH / QR IDENTIFIER</TableHead>
                    <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest">ENVIRONMENT</TableHead>
                    <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest">IDENTIFIER (IP)</TableHead>
                    <TableHead className="pr-10 py-6 text-right text-[10px] font-black uppercase tracking-widest">RESULT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTraffic.length > 0 ? filteredTraffic.map((t, idx) => (
                    <TableRow key={t.id || idx} className="group hover:bg-neutral-50/50 transition-colors border-neutral-100">
                      <TableCell className="pl-10 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-black">{t.timestamp?.toDate ? format(t.timestamp.toDate(), 'HH:mm:ss') : 'N/A'}</span>
                          <Badge variant="outline" className={`w-fit text-[8px] h-4 mt-1 font-black uppercase ${t.type === 'visit' ? 'text-emerald-600 bg-emerald-50' : 'text-purple-600 bg-purple-50'}`}>
                             {t.type === 'visit' ? 'VISIT' : 'SCAN'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex flex-col max-w-[200px]">
                            <span className="text-xs font-mono font-bold text-muted-foreground truncate">{t.type === 'visit' ? t.path : t.qrCodeId}</span>
                            <span className="text-[9px] font-black text-primary/40 uppercase tracking-tighter">Event Location</span>
                         </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400 group-hover:bg-white transition-all shadow-inner">
                              {t.deviceType === 'mobile' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                           </div>
                           <div className="flex flex-col">
                              <span className="text-xs font-bold">{t.operatingSystem}</span>
                              <span className="text-[10px] font-black text-muted-foreground/60 uppercase">{t.browserName}</span>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono bg-neutral-100 px-2 py-1 rounded-lg font-bold text-muted-foreground">{t.ipAddress}</span>
                      </TableCell>
                      <TableCell className="pr-10 py-5 text-right">
                        {t.isBot ? (
                          <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 text-[10px] font-black uppercase tracking-tighter">Bot Filtered</Badge>
                        ) : (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50 text-[10px] font-black uppercase tracking-tighter">Verified Human</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-32 opacity-20">
                         <Activity className="h-12 w-12 mx-auto mb-4" />
                         <p className="font-black uppercase tracking-widest text-sm">No Events Recorded</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
