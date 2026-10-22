'use client';

import { useMemo, useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  Users, 
  Phone, 
  Calendar, 
  ArrowLeft, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Search, 
  MessageCircle, 
  Smartphone, 
  TrendingUp, 
  ArrowUpRight, 
  Target, 
  Clock, 
  Filter,
  Users2,
  Activity,
  Zap,
  Mail,
  MoreVertical,
  Edit2,
  XCircle
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  useMemoFirebase, 
  deleteDocumentNonBlocking, 
  updateDocumentNonBlocking
} from "@/firebase";
import { collectionGroup, query, where, orderBy, doc, collection, serverTimestamp } from "firebase/firestore";
import { format, subDays, isToday, startOfDay, endOfDay } from "date-fns";
import { Link } from "react-router-dom";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function LeadsPageContent() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [siteFilter, setSiteFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const sitesRef = useMemoFirebase(() => (db && user?.uid) ? query(collection(db, "users", user.uid, "microsites")) : null, [db, user?.uid]);
  const { data: allSites } = useCollection(sitesRef);

  const leadsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collectionGroup(db, "leads"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
  }, [db, user?.uid]);

  const { data: allLeads, isLoading } = useCollection(leadsQuery);

  const filteredLeads = useMemo(() => {
    if (!allLeads) return [];
    return allLeads.filter(l => {
      const searchStr = `${l.name} ${l.mobile} ${l.email} ${l.business}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesSite = siteFilter === "all" || l.micrositeId === siteFilter;
      return matchesSearch && matchesSite;
    });
  }, [allLeads, searchTerm, siteFilter]);

  const stats = useMemo(() => {
    if (!allLeads) return { total: 0, today: 0, growth: "Stable", pending: 0 };
    const today = allLeads.filter(l => l.createdAt?.toDate && isToday(l.createdAt.toDate())).length;
    const pending = allLeads.filter(l => l.status === 'new' || !l.status).length;
    return {
      total: allLeads.length,
      today,
      pending,
      growth: today > 0 ? "Rising" : "Stable"
    };
  }, [allLeads]);

  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return {
        date: format(d, 'MMM dd'),
        fullDate: format(d, 'yyyy-MM-dd'),
        count: 0
      };
    });

    if (allLeads) {
      allLeads.forEach(l => {
        if (!l.createdAt?.toDate) return;
        const dStr = format(l.createdAt.toDate(), 'yyyy-MM-dd');
        const dayObj = days.find(d => d.fullDate === dStr);
        if (dayObj) dayObj.count++;
      });
    }
    return days;
  }, [allLeads]);

  const handleUpdateStatus = async (lead: any, newStatus: string) => {
    if (!db || !user?.uid || !lead.micrositeId) return;
    setUpdatingId(lead.id);
    try {
      const leadRef = doc(db, "users", user.uid, "microsites", lead.micrositeId, "leads", lead.id);
      updateDocumentNonBlocking(leadRef, { 
        status: newStatus,
        updatedAt: serverTimestamp() 
      });
      toast({ title: `Lead marked as ${newStatus.toUpperCase()}` });
    } catch (err) {
      toast({ variant: "destructive", title: "Update Failed" });
    } finally {
      setUpdatingId(null);
    }
  };

  const exportLeads = () => {
    if (!filteredLeads.length) return;
    const headers = "Name,Mobile,Email,Business/Note,Status,PageID,Date\n";
    const rows = filteredLeads.map(l => 
      `${l.name},${l.mobile},${l.email || 'N/A'},"${(l.business || '').replace(/"/g, '""')}",${l.status || 'new'},${l.micrositeId},${l.createdAt?.toDate ? format(l.createdAt.toDate(), 'yyyy-MM-dd HH:mm') : 'N/A'}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-intelligence-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast({ title: "Intelligence Exported" });
  };

  const handleDeleteLead = (lead: any) => {
    if (!db || !user?.uid) return;
    if (!window.confirm("क्या आप इस लीड को हमेशा के लिए हटाना चाहते हैं?")) return;
    
    if (lead.micrositeId) {
      const leadRef = doc(db, "users", user.uid, "microsites", lead.micrositeId, "leads", lead.id);
      deleteDocumentNonBlocking(leadRef);
      toast({ title: "Node Purged from Registry" });
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-40 gap-6">
      <div className="relative">
         <Loader2 className="h-14 w-14 animate-spin text-primary" />
         <Target className="absolute inset-0 m-auto h-6 w-6 text-accent animate-pulse" />
      </div>
      <p className="font-black text-xs uppercase tracking-[0.4em] text-muted-foreground text-center">Syncing Lead Registry...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-10 mb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <Link to="/dashboard/qrs/microsite" className="inline-flex items-center gap-2 text-xs font-black uppercase text-muted-foreground tracking-widest transition-colors">
            <ArrowLeft className="h-4 w-4" /> The Builder Studio
          </Link>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight flex items-center gap-5">
             <div className="bg-primary/10 p-3 rounded-2xl text-primary shadow-inner"><Users2 className="h-10 w-10" /></div>
             Leads <span className="text-primary">CRM</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed">
             Manage inquiries and automation triggers in real-time. Direct access to customer intents.
          </p>
        </div>
        <Button variant="outline" size="lg" onClick={exportLeads} disabled={!filteredLeads.length} className="h-16 px-10 rounded-2xl font-black gap-3 border-2 shadow-sm">
          <Download className="h-5 w-5" /> Export Intelligence
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <Card className="border-none shadow-xl bg-white p-8 rounded-[2.5rem] flex flex-col justify-between group hover:shadow-2xl transition-all">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-4">Total Interactions</p>
            <h3 className="text-5xl font-black text-foreground">{stats.total}</h3>
         </Card>
         <Card className="border-none shadow-xl bg-orange-500 text-white p-8 rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden group hover:shadow-2xl transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700"><Zap className="h-20 w-20" /></div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-70">Awaiting Action</p>
            <h3 className="text-5xl font-black">{stats.pending}</h3>
         </Card>
         <div className="md:col-span-2">
            <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden h-full">
               <CardContent className="p-4 sm:p-6 h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                       <defs>
                         <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <XAxis dataKey="date" hide />
                       <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px rgba(0,0,0,0.1)', fontWeight: 800}} />
                       <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#leadGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </CardContent>
            </Card>
         </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-6 rounded-[2rem] shadow-xl border border-neutral-100">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
            <Input 
              placeholder="Search by name, mobile, email or business..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="h-14 pl-12 bg-neutral-50 border-none rounded-2xl font-bold placeholder:font-medium"
            />
         </div>
         <select 
           value={siteFilter}
           onChange={e => setSiteFilter(e.target.value)}
           className="h-14 px-6 bg-neutral-50 border-none rounded-2xl text-xs font-black uppercase outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
         >
            <option value="all">All Pages</option>
            {allSites?.map(s => <option key={s.id} value={s.id}>{s.businessName}</option>)}
         </select>
      </div>

      <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[3rem]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-neutral-50/50">
                <TableRow className="border-none">
                  <TableHead className="pl-12 py-8 text-[10px] font-black uppercase tracking-widest">Customer Profile</TableHead>
                  <TableHead className="py-8 text-[10px] font-black uppercase tracking-widest">Digital Touchpoint</TableHead>
                  <TableHead className="py-8 text-[10px] font-black uppercase tracking-widest">Inquiry Context</TableHead>
                  <TableHead className="py-8 text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
                  <TableHead className="pr-12 py-8 text-right text-[10px] font-black uppercase tracking-widest">Intelligence Controls</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length > 0 ? filteredLeads.map((l) => (
                  <TableRow key={l.id} className="hover:bg-neutral-50/50 transition-all border-neutral-100 group">
                    <TableCell className="pl-12 py-7">
                      <div className="flex items-center gap-5">
                         <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase shadow-inner">{l.name?.[0] || 'L'}</div>
                         <div className="flex flex-col">
                           <span className="font-black text-lg tracking-tight">{l.name}</span>
                           <span className="text-[10px] text-muted-foreground font-black flex items-center gap-1 uppercase tracking-tighter">
                              <Phone className="h-2.5 w-2.5" /> {l.mobile}
                           </span>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-foreground flex items-center gap-2">
                             <Mail className="h-3 w-3 text-primary/40" /> {l.email || "No Email Provided"}
                          </span>
                          <Badge variant="outline" className="w-fit text-[8px] font-black uppercase border-primary/20 text-primary bg-primary/5">
                             {l.source || "Smart Page"}
                          </Badge>
                       </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                       <div className="flex flex-col gap-1">
                          <p className="text-xs font-medium text-muted-foreground line-clamp-2 italic leading-relaxed">
                             "{l.business || "General Inquiry"}"
                          </p>
                          <span className="text-[9px] font-bold text-neutral-400 flex items-center gap-1 uppercase">
                             <Clock className="h-2.5 w-2.5" /> {l.createdAt?.toDate ? format(l.createdAt.toDate(), 'MMM dd, HH:mm') : 'Recently'}
                          </span>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                            <button className="outline-none">
                               {l.status === 'contacted' ? (
                                 <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black text-[9px] uppercase h-8 px-4 rounded-xl cursor-pointer hover:bg-emerald-100 transition-all">Verified</Badge>
                               ) : l.status === 'rejected' ? (
                                 <Badge className="bg-red-50 text-red-700 border-red-100 font-black text-[9px] uppercase h-8 px-4 rounded-xl cursor-pointer">Rejected</Badge>
                               ) : (
                                 <Badge className="bg-orange-50 text-orange-600 border-orange-100 font-black text-[9px] uppercase h-8 px-4 rounded-xl cursor-pointer animate-pulse">New Lead</Badge>
                               )}
                            </button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="center" className="rounded-xl border shadow-2xl p-2 w-48">
                            <DropdownMenuItem onClick={() => handleUpdateStatus(l, 'new')} className="font-bold text-xs uppercase h-10 cursor-pointer rounded-lg"><Zap className="h-3.5 w-3.5 mr-2 text-orange-500" /> Mark as New</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(l, 'contacted')} className="font-bold text-xs uppercase h-10 cursor-pointer rounded-lg"><CheckCircle2 className="h-3.5 w-3.5 mr-2 text-emerald-500" /> Mark Contacted</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(l, 'rejected')} className="font-bold text-xs uppercase h-10 cursor-pointer rounded-lg"><XCircle className="h-3.5 w-3.5 mr-2 text-red-500" /> Mark Rejected</DropdownMenuItem>
                         </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="text-right pr-12">
                       <div className="flex items-center justify-end gap-3">
                          <Button size="icon" className="h-11 w-11 rounded-2xl bg-emerald-500 hover:bg-emerald-600 shadow-lg text-white group/wa transition-all active:scale-95" asChild title="Direct WhatsApp">
                            <a to={`https://wa.me/${l.mobile?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${l.name}, this is regarding your inquiry on our Smart Page for ${l.business || 'your requirements'}. How can I help you today?`)}`} target="_blank">
                               <MessageCircle className="h-6 w-6 fill-current group-hover/wa:rotate-12 transition-transform" />
                            </a>
                          </Button>
                          <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl border-2 hover:bg-neutral-100"><MoreVertical className="h-5 w-5" /></Button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent align="end" className="rounded-xl border shadow-2xl p-2 w-48">
                                <DropdownMenuItem className="font-bold text-xs uppercase h-10 cursor-pointer rounded-lg" asChild>
                                   <a to={`tel:${l.mobile}`}><Phone className="h-3.5 w-3.5 mr-2" /> Direct Call</a>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="font-bold text-xs uppercase h-10 cursor-pointer rounded-lg" asChild>
                                   <a to={`mailto:${l.email}`}><Mail className="h-3.5 w-3.5 mr-2" /> Send Email</a>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDeleteLead(l)} className="font-bold text-xs uppercase h-10 cursor-pointer rounded-lg text-destructive hover:bg-red-50"><Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Node</DropdownMenuItem>
                             </DropdownMenuContent>
                          </DropdownMenu>
                       </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} className="text-center py-40 opacity-30 font-black uppercase text-sm tracking-[0.2em]">Registry Node Empty</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MicroSiteLeads() {
  return <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}><LeadsPageContent /></Suspense>;
}
