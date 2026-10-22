"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collectionGroup, query, orderBy, limit } from "firebase/firestore";
import { 
  Loader2, 
  Calendar as CalendarIcon, 
  CreditCard, 
  DollarSign, 
  BadgeIndianRupee, 
  User as UserIcon,
  Filter,
  X,
  Receipt
} from "lucide-react";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";

export default function AdminPayments() {
  const db = useFirestore();
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const subsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collectionGroup(db, "subscriptions"), 
      orderBy("paymentDate", "desc"),
      limit(500)
    );
  }, [db]);

  const { data: allPayments, isLoading } = useCollection(subsQuery);

  // Filtering Logic
  const filteredPayments = useMemo(() => {
    if (!allPayments) return [];
    if (!date?.from) return allPayments;

    const start = startOfDay(date.from);
    const end = date.to ? endOfDay(date.to) : endOfDay(date.from);

    return allPayments.filter(pay => {
      const pDate = pay.paymentDate?.toDate ? pay.paymentDate.toDate() : new Date(pay.paymentDate);
      return isWithinInterval(pDate, { start, end });
    });
  }, [allPayments, date]);

  // Statistics Calculation
  const stats = useMemo(() => {
    return filteredPayments.reduce((acc, pay) => {
      const amount = pay.amountPaid || 0;
      const gst = pay.gstAmount || 0;
      
      if (pay.currency === "INR") {
        acc.totalINR += amount;
        acc.totalGST += gst;
      } else {
        acc.totalUSD += amount;
      }
      acc.count++;
      return acc;
    }, { totalUSD: 0, totalINR: 0, totalGST: 0, count: 0 });
  }, [filteredPayments]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-muted-foreground font-medium">Fetching transaction ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
          <p className="text-muted-foreground">Monitor platform revenue and individual transaction details.</p>
        </div>

        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={`h-12 border-2 gap-2 font-bold px-5 ${date?.from ? 'border-primary text-primary bg-primary/5' : ''}`}>
                <CalendarIcon className="h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd")} - {format(date.to, "LLL dd")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, yyyy")
                  )
                ) : (
                  <span>Filter by Date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          
          {date?.from && (
            <Button variant="ghost" size="icon" onClick={() => setDate(undefined)} className="h-12 w-12 text-muted-foreground hover:text-destructive">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-primary text-white overflow-hidden">
          <CardContent className="p-6 relative">
             <DollarSign className="absolute -right-4 -bottom-4 h-24 w-24 opacity-10" />
            <div className="flex items-center gap-3 mb-2 opacity-80 text-[10px] font-black uppercase tracking-widest">
              Revenue (USD)
            </div>
            <p className="text-3xl font-black">${stats.totalUSD.toLocaleString()}</p>
            <p className="text-[10px] mt-2 opacity-60 font-medium italic">Filtered results</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-neutral-900 text-white overflow-hidden">
          <CardContent className="p-6 relative">
            <BadgeIndianRupee className="absolute -right-4 -bottom-4 h-24 w-24 opacity-10" />
            <div className="flex items-center gap-3 mb-2 opacity-80 text-[10px] font-black uppercase tracking-widest">
              Revenue (INR)
            </div>
            <p className="text-3xl font-black">₹{stats.totalINR.toLocaleString()}</p>
            <p className="text-[10px] mt-2 opacity-60 font-medium italic">Incl. all taxes</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-emerald-600 text-white overflow-hidden">
          <CardContent className="p-6 relative">
            <Receipt className="absolute -right-4 -bottom-4 h-24 w-24 opacity-10" />
            <div className="flex items-center gap-3 mb-2 opacity-80 text-[10px] font-black uppercase tracking-widest">
              GST Collected (INR)
            </div>
            <p className="text-3xl font-black">₹{stats.totalGST.toLocaleString()}</p>
            <p className="text-[10px] mt-2 opacity-60 font-black uppercase tracking-tighter">18% Tax Component</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6 relative">
             <CreditCard className="absolute -right-4 -bottom-4 h-24 w-24 text-neutral-100" />
            <div className="flex items-center gap-3 mb-2 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
              Total Sales
            </div>
            <p className="text-3xl font-black">{stats.count}</p>
            <p className="text-[10px] mt-2 text-muted-foreground font-medium italic">Successful payments</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
        <CardHeader className="bg-neutral-50/50 border-b">
           <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-black uppercase tracking-tighter">Transaction Ledger</CardTitle>
              <Badge variant="outline" className="font-bold border-primary/20 text-primary">
                {filteredPayments.length} records found
              </Badge>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-neutral-50/30">
              <TableRow className="border-neutral-100">
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">User Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Plan & Cycle</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-right">Amount (Excl. Tax)</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-right">GST (18%)</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-right">Total Paid</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-right">Payment Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length > 0 ? filteredPayments.map((pay) => {
                const currencySym = pay.currency === 'INR' ? '₹' : '$';
                return (
                  <TableRow key={pay.id} className="group hover:bg-neutral-50/50 transition-colors border-neutral-50">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                          <UserIcon className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase">{pay.userId.substring(0, 12)}...</span>
                          <span className="text-[9px] text-primary/50 font-black uppercase tracking-tighter">Customer ID</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="w-fit uppercase text-[9px] py-0 border-primary/20 text-primary font-bold">
                          {pay.planId?.replace('_', ' ')}
                        </Badge>
                        <span className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter opacity-60">{pay.billingCycle} billing</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-xs font-bold text-muted-foreground">
                        {currencySym}{pay.baseAmount || (pay.amountPaid - (pay.gstAmount || 0))}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-xs font-bold text-emerald-600">
                        {pay.currency === 'INR' ? `₹${pay.gstAmount || 0}` : '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-black text-sm">
                        {currencySym}{pay.amountPaid}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-foreground">
                          {pay.paymentDate?.toDate ? format(pay.paymentDate.toDate(), 'MMM dd, yyyy') : 'N/A'}
                        </span>
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tabular-nums">
                          ID: {pay.paymentProviderTransactionId?.substring(0, 10) || "INTERNAL"}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-24">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                       <Filter className="h-10 w-10" />
                       <p className="font-black uppercase tracking-widest text-sm">No Transactions Found</p>
                       <p className="text-xs">Adjust your date filter and try again.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
