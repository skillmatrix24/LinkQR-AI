"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, Loader2, Send, Mail, CheckCircle2, RefreshCw, AlertTriangle, CalendarClock } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { format, differenceInDays, addDays, isAfter, isBefore } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { generateExpiryEmail } from "@/ai/flows/generate-expiry-email-flow";
import { sendEmailAction } from "@/app/actions/email";

export default function NotificationsAdmin() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState<string | null>(null);

  // Real-time query for all users
  const usersRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "users");
  }, [db]);
  const { data: allUsers, isLoading } = useCollection(usersRef);

  // Memoized filter for users expiring within 10 days
  const expiringUsers = useMemo(() => {
    if (!allUsers) return [];
    const now = new Date();
    const threshold = addDays(now, 10);

    return allUsers.filter(user => {
      // Exclude free plan users or users with no expiry date set
      if (!user.planExpiryDate || user.currentPlanId === 'free_plan') return false;
      
      const expiry = user.planExpiryDate.toDate ? user.planExpiryDate.toDate() : new Date(user.planExpiryDate);
      
      // Return users whose plan is active but expires soon
      return isAfter(expiry, now) && isBefore(expiry, threshold);
    }).sort((a, b) => {
      const dateA = a.planExpiryDate.toDate ? a.planExpiryDate.toDate() : new Date(a.planExpiryDate);
      const dateB = b.planExpiryDate.toDate ? b.planExpiryDate.toDate() : new Date(b.planExpiryDate);
      return dateA.getTime() - dateB.getTime();
    });
  }, [allUsers]);

  const handleSendReminder = async (user: any) => {
    if (!user.email) {
      toast({ variant: "destructive", title: "Email Missing", description: "User record has no email address." });
      return;
    }

    setIsSending(user.id);
    try {
      const expiryDate = user.planExpiryDate.toDate ? user.planExpiryDate.toDate() : new Date(user.planExpiryDate);
      const daysLeft = differenceInDays(expiryDate, new Date());

      // 1. Generate Content with GenAI
      const emailContent = await generateExpiryEmail({
        userName: user.displayName || "Valued Customer",
        planName: user.currentPlanId.replace('_', ' ').toUpperCase(),
        expiryDate: format(expiryDate, 'PPP'),
        daysRemaining: daysLeft
      });

      // 2. Dispatch real email via Gmail SMTP (Server Action)
      await sendEmailAction({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.htmlBody,
        text: emailContent.plainTextBody
      });

      // 3. Update Firestore (Triggers real-time UI refresh)
      if (db) {
        const userRef = doc(db, "users", user.id);
        updateDocumentNonBlocking(userRef, {
          lastExpiryNotificationSent: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      toast({
        title: "Notification Dispatched",
        description: `AI-crafted reminder sent to ${user.email} successfully.`,
      });
    } catch (err: any) {
      console.error("Email Dispatch Error:", err);
      toast({
        variant: "destructive",
        title: "Dispatch Failed",
        description: err.message || "Ensure SMTP kyc is completed in Site Settings."
      });
    } finally {
      setIsSending(null);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-24 space-y-4">
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
      <p className="text-muted-foreground font-medium">Scanning subscription states...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <Bell className="h-6 w-6" />
            </div>
            Notification Hub
          </h1>
          <p className="text-muted-foreground font-medium">Automated subscription health and expiry engine.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border shadow-sm flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Real-time Cloud Sync Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase text-muted-foreground tracking-widest">Expiring (10 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black">{expiringUsers.length}</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-xl bg-primary text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <CalendarClock className="h-20 w-20" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase opacity-70 tracking-widest text-white">AI Engine Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              <p className="font-black text-xl">READY TO NOTIFY</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-neutral-900 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase text-neutral-500 tracking-widest">Global Reach</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-emerald-400 border-emerald-900 bg-emerald-950/30 font-black h-8 px-4">SMTP: OPERATIONAL</Badge>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
        <CardHeader className="border-b bg-neutral-50/50 p-8">
          <CardTitle className="text-xl font-black">Expiring Subscriptions</CardTitle>
          <CardDescription className="font-medium">Direct actions for users with approaching plan termination dates.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-neutral-50/30">
              <TableRow className="border-none">
                <TableHead className="pl-8 py-6 text-[10px] font-black uppercase tracking-widest">Customer</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest">Plan Tier</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest">Expiry Insight</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest">Last Notified</TableHead>
                <TableHead className="pr-8 py-6 text-right text-[10px] font-black uppercase tracking-widest">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expiringUsers.length > 0 ? expiringUsers.map((user) => {
                const expiry = user.planExpiryDate.toDate ? user.planExpiryDate.toDate() : new Date(user.planExpiryDate);
                const daysLeft = differenceInDays(expiry, new Date());
                const wasNotified = !!user.lastExpiryNotificationSent;

                return (
                  <TableRow key={user.id} className="group hover:bg-neutral-50/50 transition-colors border-neutral-100">
                    <TableCell className="pl-8 py-4">
                      <div className="flex flex-col">
                        <span className="font-black text-sm text-foreground">{user.displayName}</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold uppercase tracking-tighter">
                          <Mail className="h-3 w-3" /> {user.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="uppercase text-[9px] font-black tracking-widest px-2 py-0.5">
                        {user.currentPlanId.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-foreground">{format(expiry, 'MMM dd, yyyy')}</span>
                        <span className={`text-[10px] font-black uppercase tracking-tighter ${daysLeft <= 3 ? 'text-red-500' : 'text-orange-500'}`}>
                          Terminating in {daysLeft} Days
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {wasNotified ? (
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-black uppercase tracking-tighter">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Sent {format(user.lastExpiryNotificationSent.toDate ? user.lastExpiryNotificationSent.toDate() : new Date(user.lastExpiryNotificationSent), 'MMM dd')}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
                          <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
                          Pending Dispatch
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="pr-8 py-4 text-right">
                      <Button 
                        size="sm" 
                        variant={wasNotified ? "outline" : "default"} 
                        className="gap-2 h-9 px-4 font-black text-[10px] uppercase rounded-xl transition-all hover:scale-105" 
                        onClick={() => handleSendReminder(user)}
                        disabled={isSending === user.id}
                      >
                        {isSending === user.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        {wasNotified ? "Resend Alert" : "Send AI Reminder"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-32">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                       <CalendarClock className="h-12 w-12" />
                       <div className="space-y-1">
                          <p className="font-black text-xl">System Healthy</p>
                          <p className="text-sm font-medium">No users are within the 10-day expiry threshold.</p>
                       </div>
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
