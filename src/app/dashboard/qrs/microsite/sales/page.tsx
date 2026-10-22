'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Download, CreditCard, BadgeIndianRupee, Calendar, UserCheck, TrendingUp, CheckCircle2, ShieldCheck, History, User as UserIcon } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { collectionGroup, query, where, orderBy, doc } from "firebase/firestore";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useToast } from '@/hooks/use-toast';

export default function MicroSiteSales() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const salesQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collectionGroup(db, "payments"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
  }, [db, user?.uid]);

  const { data: allSales, isLoading } = useCollection(salesQuery);

  const stats = useMemo(() => {
    if (!allSales) return { total: 0, count: 0, pending: 0 };
    return allSales.reduce((acc, s) => ({
      total: acc.total + (s.status === 'verified' ? (s.amount || 0) : 0),
      count: acc.count + (s.status === 'verified' ? 1 : 0),
      pending: acc.pending + (s.status === 'pending' ? 1 : 0)
    }), { total: 0, count: 0, pending: 0 });
  }, [allSales]);

  const handleVerify = async (payment: any) => {
    if (!db || !user?.uid) return;
    setVerifyingId(payment.id);
    try {
      const payRef = doc(db, "users", user.uid, "microsites", payment.micrositeId, "payments", payment.id);
      updateDocumentNonBlocking(payRef, { 
        status: 'verified',
        updatedAt: new Date().toISOString()
      });
      toast({ title: "Payment Verified", description: "Successfully added to gross revenue." });
    } finally {
      setVerifyingId(null);
    }
  };

  const exportSales = () => {
    if (!allSales || !allSales.length) return;
    const headers = "Customer,Mobile,Product,Amount,Status,Date,TransactionID\n";
    const rows = allSales.map(s => `${s.customerName},${s.customerMobile},${s.productName},${s.amount},${s.status},${s.createdAt?.toDate ? format(s.createdAt.toDate(), 'PPP') : 'N/A'},${s.razorpayPaymentId}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-page-sales-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast({ title: "Export Complete" });
  };

  if (isLoading) return <div className="flex flex-col items-center justify-center p-32 gap-4"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Syncing Sales Ledger...</p></div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-10 mb-24 text-foreground">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Link to="/dashboard/qrs/microsite" className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Builder
          </Link>
          <h1 className="text-3xl sm:text-5xl font-black flex items-center gap-4 tracking-tight">
             <div className="bg-emerald-100 p-2.5 rounded-2xl text-emerald-600 shadow-inner"><BadgeIndianRupee className="h-8 w-8" /></div>
             Sales Ledger
          </h1>
          <p className="text-muted-foreground font-medium text-lg leading-relaxed">Verify reports and manage revenue from your Smart Pages.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" onClick={exportSales} disabled={!allSales?.length} className="h-14 px-8 rounded-2xl font-bold gap-3 border-2 shadow-sm">
             <Download className="h-5 w-5" /> Export Intelligence
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden group col-span-1 md:col-span-2">
            <CardHeader className="pb-2 border-b bg-neutral-50/50">
               <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2"><TrendingUp className="h-3 w-3" /> Verified Revenue</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
               <p className="text-5xl font-black text-emerald-600">₹{stats.total.toLocaleString()}</p>
               <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2">Gross Verified Capture</p>
            </CardContent>
         </Card>
         <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden">
            <CardHeader className="pb-2 border-b bg-neutral-50/50">
               <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2"><CheckCircle2 className="h-3 w-3" /> Total Orders</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
               <p className="text-5xl font-black text-primary">{stats.count}</p>
               <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2">Verified Count</p>
            </CardContent>
         </Card>
         <Card className="border-none shadow-xl bg-orange-500 text-white rounded-[2rem] overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12"><ShieldCheck className="h-20 w-20" /></div>
            <CardHeader className="pb-2 border-white/10">
               <CardTitle className="text-[10px] font-black uppercase opacity-70 tracking-widest text-white">Pending Action</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
               <p className="text-5xl font-black">{stats.pending}</p>
               <p className="text-[10px] font-bold uppercase mt-2 opacity-80">Awaiting Verification</p>
            </CardContent>
         </Card>
      </div>

      <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[2.5rem]">
        <CardHeader className="p-8 border-b bg-neutral-50/50 flex flex-row items-center justify-between">
           <div className="flex items-center gap-3">
              <History className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-black">Transaction Stream</CardTitle>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-neutral-50/50">
                <TableRow className="border-none">
                  <TableHead className="pl-10 py-8 text-[10px] font-black uppercase tracking-widest">Transaction / Date</TableHead>
                  <TableHead className="py-8 text-[10px] font-black uppercase tracking-widest">Customer</TableHead>
                  <TableHead className="py-8 text-[10px] font-black uppercase tracking-widest">Product / Amount</TableHead>
                  <TableHead className="pr-10 py-8 text-right text-[10px] font-black uppercase tracking-widest">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allSales && allSales.length > 0 ? allSales.map((s) => (
                  <TableRow key={s.id} className="hover:bg-neutral-50/50 transition-colors border-neutral-100 group">
                    <TableCell className="pl-10 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded w-fit uppercase">{s.razorpayPaymentId || 'REPORTED'}</span>
                        <div className="flex items-center gap-2 text-foreground font-black text-xs mt-1">
                          <Calendar className="h-3.5 w-3.5 text-primary/40" />
                          {s.createdAt?.toDate ? format(s.createdAt.toDate(), 'MMM dd, yyyy HH:mm') : 'Recently'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-3">
                         <div className="h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 group-hover:bg-white shadow-inner"><UserIcon className="h-4 w-4" /></div>
                         <div className="flex flex-col">
                            <span className="font-black text-sm">{s.customerName}</span>
                            <span className="text-[10px] text-muted-foreground font-bold tracking-tighter uppercase">{s.customerMobile}</span>
                         </div>
                       </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                         <Badge variant="outline" className="font-black text-[9px] uppercase px-3 py-1 border-primary/20 text-primary bg-primary/5 rounded-md w-fit">
                           {s.productName}
                         </Badge>
                         <p className="text-lg font-black text-emerald-600">₹{s.amount}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                       {s.status === 'pending' ? (
                         <Button 
                          onClick={() => handleVerify(s)} 
                          disabled={verifyingId === s.id}
                          className="h-10 px-6 rounded-xl font-black text-[10px] uppercase gap-2 bg-orange-500 hover:bg-orange-600"
                         >
                            {verifyingId === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                            Verify Entry
                         </Button>
                       ) : (
                         <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 uppercase text-[10px] font-black h-10 px-6 rounded-xl">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Verified
                         </Badge>
                       )}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-40 opacity-30">
                      <CreditCard className="h-16 w-16 mx-auto mb-6" />
                      <p className="font-black uppercase tracking-[0.3em] text-sm">Ledger is Empty</p>
                      <p className="text-xs font-medium mt-2">Reported payments will appear here for verification.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
