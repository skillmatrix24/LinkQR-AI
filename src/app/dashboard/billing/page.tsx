
"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Zap, 
  Crown, 
  CreditCard, 
  Loader2, 
  ShieldCheck, 
  Gem, 
  Info, 
  Clock, 
  FileText, 
  ArrowRight, 
  CheckCircle2,
  HelpCircle,
  Headphones,
  History,
  Receipt,
  Quote,
  Star,
  Lock,
  ArrowUpRight,
  Smartphone,
  BrainCircuit,
  Rocket,
  ShieldAlert,
  Target,
  Layers,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking, setDocumentNonBlocking, useCollection } from "@/firebase";
import { doc, serverTimestamp, collection, Timestamp, query, orderBy } from "firebase/firestore";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addMonths, addYears, format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "react-router-dom";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const GST_RATE = 0.18; 

const BILLING_FAQS = [
  {
    q: "क्या मैं अपना प्लान कभी भी बदल सकता हूँ?",
    a: "हाँ, आप किसी भी समय अपने डैशबोर्ड से प्लान को अपग्रेड या डाउनग्रेड कर सकते हैं। अपग्रेड तुरंत लागू होता है।"
  },
  {
    q: "लिमिट खत्म होने पर क्या होगा?",
    a: "आपकी वर्तमान लिंक काम करती रहेंगी, लेकिन आप नए स्मार्ट लिंक तब तक नहीं बना पाएंगे जब तक आप अपग्रेड नहीं करते या अगला बिलिंग साइकिल शुरू नहीं होता।"
  },
  {
    q: "क्या मुझे टैक्स इनवॉइस (GST) मिलेगा?",
    a: "हाँ, हर सफल पेमेंट के बाद आपको आपके रजिस्टर्ड ईमेल पर GST कंप्लेंट इनवॉइस भेजा जाता है।"
  },
  {
    q: "रिफंड पॉलिसी क्या है?",
    a: "अगर आप सेवा से संतुष्ट नहीं हैं, तो आप खरीद के 7 दिनों के भीतर रिफंड का अनुरोध कर सकते हैं, बशर्ते आपने लिमिट का 10% से ज़्यादा उपयोग न किया हो।"
  }
];

export default function BillingPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const router = useNavigate();
  const [isINR, setIsINR] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  
  const [pendingPlan, setPendingPlan] = useState<any>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const plansRef = useMemoFirebase(() => db ? collection(db, "plans") : null, [db]);
  const siteConfigRef = useMemoFirebase(() => db ? doc(db, "config", "site") : null, [db]);
  const historyRef = useMemoFirebase(() => (db && user?.uid) ? query(collection(db, "users", user.uid, "subscriptions"), orderBy("paymentDate", "desc")) : null, [db, user?.uid]);
  
  const { data: profile, isLoading: isProfileLoading } = useDoc(userProfileRef);
  const { data: plans, isLoading: isPlansLoading } = useCollection(plansRef);
  const { data: siteConfig } = useDoc(siteConfigRef);
  const { data: billingHistory } = useCollection(historyRef);

  const { paidPlans, freePlan } = useMemo(() => {
    if (!plans) return { paidPlans: [], freePlan: null };
    const sorted = [...plans].sort((a, b) => a.priceMonthly - b.priceMonthly);
    return {
      paidPlans: sorted.filter(p => p.id !== 'free_plan'),
      freePlan: sorted.find(p => p.id === 'free_plan')
    };
  }, [plans]);

  const currentPlan = useMemo(() => {
    const planId = profile?.currentPlanId || "free_plan";
    if (!plans) return null;
    return plans.find(p => p.id === planId) || freePlan;
  }, [profile, plans, freePlan]);

  const usagePercent = useMemo(() => {
    if (!profile || !currentPlan) return 0;
    const limit = currentPlan.maxQRCodes || 5;
    if (limit >= 9999) return 0;
    return Math.min(((profile.qrCodeCount || 0) / limit) * 100, 100);
  }, [profile, currentPlan]);

  const handleUpgradeClick = (plan: any) => {
    setPendingPlan(plan);
    setIsSummaryOpen(true);
  };

  const handleProceedToPayment = () => {
    if (!pendingPlan) return;
    setIsSummaryOpen(false);
    
    if (typeof window.Razorpay === 'undefined') {
      toast({
        variant: "destructive",
        title: "Payment Gateway Offline",
        description: "Razorpay secure module is taking time to load. Please wait a moment and try again.",
      });
      return;
    }

    const razorpayKey = siteConfig?.razorpayKeyId;
    if (!razorpayKey) {
      toast({ variant: "destructive", title: "Config Error", description: "Admin has not configured Razorpay Key ID." });
      return;
    }

    const plan = pendingPlan;
    setIsProcessing(plan.id);

    const isYearly = billingCycle === "yearly";
    let basePrice = 0;
    
    if (isINR) {
      basePrice = isYearly ? (plan.priceYearlyINR || plan.priceYearly * 80) : (plan.priceMonthlyINR || plan.priceMonthly * 80);
    } else {
      basePrice = isYearly ? (plan.priceYearly || plan.priceMonthly * 10) : plan.priceMonthly;
    }

    const gstAmount = isINR ? Math.round(basePrice * GST_RATE) : 0;
    const finalAmount = basePrice + gstAmount;
    const currencyCode = isINR ? "INR" : "USD";

    const options = {
      key: razorpayKey, 
      amount: finalAmount * 100, 
      currency: currencyCode,
      name: "LinkQR AI",
      description: `${plan.name} Upgrade`,
      image: siteConfig?.logoUrl || "",
      notes: {
        userId: user?.uid || "",
        planId: plan.id,
        billingCycle: billingCycle,
        baseAmount: basePrice,
        gstAmount: gstAmount,
        totalAmount: finalAmount,
        currency: currencyCode
      },
      handler: function (response: any) {
        if (!user?.uid || !db || !userProfileRef) return;

        const transactionId = response.razorpay_payment_id;
        const subRef = doc(db, "users", user.uid, "subscriptions", transactionId);
        
        const now = new Date();
        const expiryDate = isYearly ? addYears(now, 1) : addMonths(now, 1);

        setDocumentNonBlocking(subRef, {
          id: transactionId,
          userId: user.uid,
          planId: plan.id,
          billingCycle,
          startDate: serverTimestamp(),
          expiryDate: Timestamp.fromDate(expiryDate),
          status: "active",
          paymentProviderTransactionId: transactionId,
          amountPaid: finalAmount,
          baseAmount: basePrice,
          gstAmount: gstAmount,
          currency: currencyCode,
          paymentDate: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });

        updateDocumentNonBlocking(userProfileRef, {
          currentPlanId: plan.id,
          planExpiryDate: Timestamp.fromDate(expiryDate),
          updatedAt: serverTimestamp(),
        });

        setShowSuccessScreen(true);
        setIsProcessing(null);
        
        toast({
          title: "Payment Verified!",
          description: `Successfully moved to ${plan.name} level.`,
        });
      },
      modal: {
        ondismiss: function() {
          setIsProcessing(null);
        }
      },
      prefill: {
        name: profile?.displayName || "",
        email: profile?.email || user?.email || "",
      },
      theme: {
        color: "hsl(var(--primary))",
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        toast({ variant: "destructive", title: "Payment Failed", description: resp.error.description });
        setIsProcessing(null);
      });
      rzp.open();
    } catch (e) {
      console.error("Razorpay Open Error:", e);
      setIsProcessing(null);
    }
  };

  const calculatedSummary = useMemo(() => {
    if (!pendingPlan) return null;
    const plan = pendingPlan;
    const isYearly = billingCycle === "yearly";
    let basePrice = 0;
    
    if (isINR) {
      basePrice = isYearly ? (plan.priceYearlyINR || plan.priceYearly * 80) : (plan.priceMonthlyINR || plan.priceMonthly * 80);
    } else {
      basePrice = isYearly ? (plan.priceYearly || plan.priceMonthly * 10) : plan.priceMonthly;
    }

    const gstAmount = isINR ? Math.round(basePrice * GST_RATE) : 0;
    const finalAmount = basePrice + gstAmount;
    
    return { basePrice, gstAmount, finalAmount };
  }, [pendingPlan, billingCycle, isINR]);

  if (showSuccessScreen) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-2xl rounded-[2.5rem] p-10 sm:p-14 text-center animate-in zoom-in-95 duration-700 bg-white">
           <div className="h-24 w-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-emerald-100">
             <CheckCircle2 className="h-12 w-12" />
           </div>
           <h2 className="text-3xl font-extrabold mb-4 tracking-tight">Level Activated!</h2>
           <p className="text-muted-foreground font-normal mb-8 leading-relaxed text-sm sm:text-base">
             Transaction complete. Your business intelligence tier has been upgraded and premium nodes are now active.
           </p>
           <Button className="w-full h-14 rounded-2xl font-bold text-base shadow-xl shadow-primary/20 hover:scale-[1.01] transition-transform" onClick={() => window.location.href = '/dashboard'}>
             Enter Command Center
           </Button>
        </Card>
      </div>
    );
  }

  if (isProfileLoading || isPlansLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
        <div className="relative">
           <Loader2 className="h-12 w-12 animate-spin text-primary" />
           <Target className="absolute inset-0 m-auto h-5 w-5 text-accent animate-pulse" />
        </div>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Synchronizing Intelligence Gateway...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-32 px-2 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-4">
        <div className="space-y-3 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
             <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-4 py-1 font-black text-[10px] uppercase tracking-widest rounded-full">BI ARCHITECTURE v1.0</Badge>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground">Intelligence <span className="text-primary">Tiers.</span></h1>
          <p className="text-sm sm:text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">Upgrade your business intelligence nodes to unlock automated growth and advanced bot protection.</p>
        </div>
        <Button variant="outline" className="rounded-2xl h-14 px-8 font-black gap-3 border-2 shadow-sm text-[10px] uppercase tracking-widest" onClick={() => document.getElementById('billing-history')?.scrollIntoView({ behavior: 'smooth' })}>
          <History className="h-4 w-4" /> Billing Ledger
        </Button>
      </div>

      <div className="flex flex-col items-center gap-10">
        <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as any)} className="w-full max-w-[320px]">
          <TabsList className="grid w-full grid-cols-2 h-14 p-1.5 rounded-2xl bg-neutral-100 shadow-inner">
            <TabsTrigger value="monthly" className="rounded-xl font-black text-[10px] uppercase tracking-widest">Monthly</TabsTrigger>
            <TabsTrigger value="yearly" className="relative rounded-xl font-black text-[10px] uppercase tracking-widest">
              Yearly
              <span className="absolute -top-3 -right-2 bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg border-2 border-white">
                SAVE 20%
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-6 bg-white p-3 rounded-2xl border shadow-xl ring-8 ring-neutral-100/50">
            <Label className={cn("font-black text-[10px] uppercase tracking-widest transition-all", !isINR ? "text-primary scale-110" : "text-muted-foreground")}>Global (USD)</Label>
            <Switch 
              checked={isINR} 
              onCheckedChange={setIsINR}
              className="data-[state=checked]:bg-emerald-600 scale-110"
            />
            <Label className={cn("font-black text-[10px] uppercase tracking-widest transition-all", isINR ? "text-emerald-600 scale-110" : "text-muted-foreground")}>India (INR)</Label>
          </div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">*GST (18%) applicable for domestic payments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        {paidPlans.map((plan) => {
          const isCurrent = (profile?.currentPlanId || "free_plan") === plan.id;
          const isPro = plan.id === 'pro_plan';
          const Icon = plan.id === 'ent_plan' ? Gem : isPro ? Rocket : Zap;
          
          const isYearly = billingCycle === "yearly";
          let priceDisplay = 0;
          if (isINR) {
            priceDisplay = isYearly ? (plan.priceYearlyINR || 0) : (plan.priceMonthlyINR || 0);
          } else {
            priceDisplay = isYearly ? (plan.priceYearly || 0) : (plan.priceMonthly || 0);
          }

          const currencySymbol = isINR ? "₹" : "$";
          
          return (
            <Card key={plan.id} className={cn(
              "relative border-none shadow-2xl bg-white flex flex-col transition-all duration-700 hover:-translate-y-4 rounded-[3rem]",
              isPro ? 'ring-4 ring-primary/20 md:scale-105 z-10' : 'border border-neutral-100'
            )}>
              {isPro && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[9px] font-black uppercase tracking-[0.3em] px-6 py-2.5 rounded-full shadow-2xl z-20 border-4 border-white animate-in zoom-in-50">
                  The Growth Machine
                </div>
              )}
              <CardHeader className="p-8 sm:p-10 pb-4 text-center items-center">
                <div className={cn(
                  "h-16 w-16 rounded-[1.25rem] flex items-center justify-center mb-8 shadow-inner transition-transform group-hover:rotate-12",
                  isPro ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-neutral-50 text-neutral-400 border-2'
                )}>
                  <Icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-3xl sm:text-4xl font-black tracking-tighter uppercase">{plan.name}</CardTitle>
                <CardDescription className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-widest max-w-[180px] leading-relaxed">{plan.description}</CardDescription>
                <div className="mt-10 flex flex-col items-center">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-6xl font-black tracking-tighter">{currencySymbol}{priceDisplay.toLocaleString()}</span>
                    <span className="text-muted-foreground text-[10px] font-black uppercase opacity-60">/{isYearly ? "year" : "mo"}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 sm:p-10 pt-4 flex-1">
                <div className="h-px bg-neutral-100 mb-8 w-full" />
                <ul className="space-y-5">
                  {plan.features?.map((f: string, j: number) => {
                    const isIntelligence = f.includes('BI L');
                    const isShield = f.includes('Shield');
                    return (
                      <li key={j} className="flex items-start gap-4 text-sm group/item">
                        <div className={cn(
                          "mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 border-2",
                          isIntelligence ? "bg-primary/10 border-primary/20 text-primary" : 
                          isShield ? "bg-orange-50 border-orange-200 text-orange-600" :
                          "bg-emerald-50 border-emerald-100 text-emerald-600"
                        )}>
                          {isShield ? <ShieldAlert className="h-2.5 w-2.5" /> : isIntelligence ? <BrainCircuit className="h-2.5 w-2.5" /> : <Check className="h-3 w-3 stroke-[3px]" />}
                        </div>
                        <span className={cn(
                          "font-bold leading-tight text-xs",
                          isIntelligence ? "text-primary" : "text-neutral-600"
                        )}>{f}</span>
                      </li>
                    );
                  })}
                  <li className="flex items-start gap-4 text-sm pt-4 border-t border-neutral-50">
                    <div className="mt-0.5 h-5 w-5 rounded-full bg-accent/10 border-accent/20 flex items-center justify-center shrink-0 text-accent">
                      <Layers className="h-2.5 w-2.5" />
                    </div>
                    <span className="text-xs font-black uppercase text-accent">{plan.maxQRCodes >= 9999 ? "Unlimited Infrastructure" : `${plan.maxQRCodes} Total Nodes`}</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="p-8 sm:p-10 pt-0 mt-auto">
                <Button 
                  onClick={() => handleUpgradeClick(plan)}
                  disabled={isCurrent || (isProcessing !== null)}
                  variant={isPro ? "default" : "outline"} 
                  className={cn(
                    "w-full h-16 font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95",
                    isPro && !isCurrent ? 'bg-primary hover:bg-primary/90 text-white' : 'border-4'
                  )}
                >
                  {isProcessing === plan.id ? <Loader2 className="h-5 w-5 animate-spin" /> : isCurrent ? "Current Level Active" : "Initialize Level"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-12">
         {[
           { t: "Secure Encryption", d: "Bank-level 256-bit SSL protection.", i: ShieldCheck, c: "text-emerald-500" },
           { t: "Instant Delivery", d: "Intelligence nodes active within seconds.", i: Zap, c: "text-amber-500" },
           { t: "24/7 Command", d: "Global VIP support for agencies.", i: Headphones, c: "text-primary" },
           { t: "Tax Compliant", d: "GST invoices dispatched on every capture.", i: Receipt, c: "text-blue-500" }
         ].map((item, idx) => (
           <div key={idx} className="flex flex-col items-center text-center space-y-4 p-8 bg-white rounded-[2.5rem] shadow-xl border border-neutral-100 hover:shadow-2xl transition-all group">
              <div className={cn("h-14 w-14 rounded-2xl bg-neutral-50 flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner", item.c)}>
                 <item.i className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                 <h4 className="font-black text-xs uppercase tracking-widest">{item.t}</h4>
                 <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">{item.d}</p>
              </div>
           </div>
         ))}
      </div>

      <Dialog open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
        <DialogContent className="sm:max-w-md rounded-[3rem] p-0 overflow-hidden border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)]">
          <div className="bg-neutral-900 p-10 text-white relative">
            <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
               <FileText className="h-24 w-24 text-accent" />
            </div>
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-3xl font-black uppercase tracking-tight flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-accent text-white flex items-center justify-center shadow-lg"><Rocket className="h-5 w-5" /></div>
                 Secure Checkout
              </DialogTitle>
              <DialogDescription className="text-accent/60 font-black uppercase text-[10px] tracking-[0.4em] mt-3">
                INTELLIGENCE HUB v4.0 • TRANSACTION SECURE
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-10 space-y-8 bg-white">
            <div className="flex justify-between items-start border-b pb-8">
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Upgrade Package</p>
                <h4 className="text-2xl font-black text-primary uppercase tracking-tighter">{pendingPlan?.name}</h4>
                <div className="flex items-center gap-3 mt-4">
                   <Badge variant="outline" className="h-6 font-black text-[10px] uppercase border-primary/20 text-primary px-4 rounded-xl bg-primary/5">{billingCycle}</Badge>
                   <Badge variant="outline" className="h-6 font-black text-[10px] uppercase border-emerald-200 text-emerald-600 bg-emerald-50 px-4 rounded-xl">Verified Node</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex justify-between items-center text-sm font-bold text-neutral-600">
                <span className="uppercase tracking-widest text-[10px]">Tier Base Fee</span>
                <span className="font-black text-base">{isINR ? "₹" : "$"}{calculatedSummary?.basePrice.toLocaleString()}</span>
              </div>
              {isINR && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                    GST Component (18%) <Info className="h-3.5 w-3.5 opacity-30" />
                  </span>
                  <span className="text-emerald-600 font-black text-sm">₹{calculatedSummary?.gstAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="pt-8 border-t-4 border-dashed border-neutral-100 flex justify-between items-end">
                <div className="flex flex-col">
                   <span className="text-[11px] font-black uppercase text-muted-foreground tracking-[0.3em] mb-2">Final Investment</span>
                   <span className="text-5xl font-black text-foreground tracking-tighter">
                    {isINR ? "₹" : "$"}{calculatedSummary?.finalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 p-6 rounded-[1.5rem] flex gap-4 items-start border-2 border-neutral-100">
               <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
               <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase">
                 Your data is protected. All payments are secured via **Razorpay Secure Nodes**.
               </p>
            </div>
          </div>
          <DialogFooter className="p-10 pt-0 bg-white">
            <button 
              className="w-full h-18 rounded-[2rem] font-black text-lg shadow-2xl shadow-primary/30 gap-4 group bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition-all"
              onClick={handleProceedToPayment}
            >
              INITIALIZE TRANSACTION
              <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform ml-4" />
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
         <div className="lg:col-span-8 space-y-12">
            <Card className="p-10 sm:p-14 rounded-[4rem] border-8 border-white bg-white shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12 group-hover:rotate-0 transition-all duration-1000">
                 <Zap className="h-64 w-64 text-primary" />
               </div>
               <div className="space-y-4 w-full lg:w-auto text-center lg:text-left relative z-10">
                 <div className="flex items-center justify-center lg:justify-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/20"><Activity className="h-6 w-6" /></div>
                    <h3 className="font-black text-3xl tracking-tighter text-foreground">Capacity Node</h3>
                 </div>
                 <div className="text-base font-bold text-muted-foreground uppercase tracking-widest pl-16">
                   Active Links: <span className="text-foreground font-black">{(profile?.qrCodeCount || 0)}</span> / <span className="text-primary font-black">{currentPlan?.maxQRCodes >= 9999 ? "∞" : currentPlan?.maxQRCodes || 5}</span>
                 </div>
                 {profile?.planExpiryDate && (
                   <div className="text-[10px] text-primary font-black flex flex-col gap-1 items-center lg:items-start pl-16">
                      <div className="bg-primary/5 w-fit px-4 py-2 rounded-xl border border-primary/10 tracking-[0.2em] uppercase flex items-center gap-3">
                        <Clock className="h-4 w-4" />
                        Expires: {(() => {
                          const date = profile.planExpiryDate.toDate ? profile.planExpiryDate.toDate() : new Date(profile.planExpiryDate);
                          return format(date, 'MMM dd, yyyy');
                        })()}
                      </div>
                   </div>
                 )}
               </div>
               <div className="flex-1 max-w-xl w-full px-2 relative z-10">
                 <div className="flex justify-between text-[11px] font-black text-muted-foreground mb-4 uppercase tracking-[0.2em]">
                   <span>Node Consumption</span>
                   <span className={cn("font-black", usagePercent > 80 ? 'text-orange-600' : 'text-primary')}>{Math.round(usagePercent)}% Peak</span>
                 </div>
                 <div className="h-6 bg-neutral-100 rounded-full overflow-hidden p-1.5 ring-4 ring-neutral-50 shadow-inner">
                   <div 
                     className={cn(
                       "h-full rounded-full transition-all duration-1000",
                       usagePercent > 90 ? 'bg-orange-500 shadow-[0_0_20px_#f97316]' : 'bg-primary shadow-[0_0_20px_#6750A4]'
                     )}
                     style={{ width: `${usagePercent}%` }}
                   />
                 </div>
               </div>
            </Card>

            <div className="space-y-8">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner"><HelpCircle className="h-6 w-6" /></div>
                  <h3 className="text-3xl font-black tracking-tight">Intelligence Support</h3>
               </div>
               <Accordion type="single" collapsible className="w-full space-y-4">
                  {BILLING_FAQS.map((faq, i) => (
                    <AccordionItem key={i} value={`item-${i}`} className="bg-white border-2 border-neutral-100 rounded-[2.5rem] px-8 sm:px-10 overflow-hidden transition-all hover:shadow-xl hover:border-primary/20">
                     <AccordionTrigger className="text-left font-black text-lg py-8 hover:no-underline">{faq.q}</AccordionTrigger>
                     <AccordionContent className="text-muted-foreground leading-relaxed pb-10 font-medium text-lg italic">"{faq.a}"</AccordionContent>
                    </AccordionItem>
                  ))}
               </Accordion>
            </div>
         </div>

         <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
            <Card className="border-none shadow-2xl bg-neutral-900 text-white rounded-[3rem] overflow-hidden flex flex-col group">
               <div className="p-10 bg-white/5 border-b border-white/5 flex flex-row items-center gap-5">
                  <div className="h-12 w-12 rounded-2xl bg-accent text-white flex items-center justify-center shadow-2xl shadow-accent/40 group-hover:scale-110 transition-transform">
                     <Headphones className="h-6 w-6" />
                  </div>
                  <div>
                     <h4 className="font-black text-sm uppercase tracking-widest">Enterprise Support</h4>
                     <p className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Direct Command</p>
                  </div>
               </div>
               <CardContent className="p-10 space-y-8">
                  <p className="text-base font-medium text-neutral-400 leading-relaxed">
                     Need more than 10,000 links, white-labeling, or dedicated account nodes for your agency?
                  </p>
                  <Button variant="outline" className="w-full h-16 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-white/10 hover:bg-white/5 text-white gap-3 group" asChild>
                     <a to="mailto:enterprise@skillmatrix.in">Talk to Enterprise Ops <ArrowUpRight className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></a>
                  </Button>
               </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-emerald-600 text-white rounded-[3rem] p-10 text-center space-y-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><ShieldCheck className="h-32 w-32" /></div>
               <ShieldCheck className="h-12 w-12 mx-auto relative z-10" />
               <div className="space-y-2 relative z-10">
                  <h4 className="font-black text-xl uppercase tracking-tight">Trust Protocol</h4>
                  <p className="text-xs opacity-80 font-medium leading-relaxed">We offer a 7-day money back guarantee for all tiers. No questions asked.</p>
               </div>
            </Card>
         </div>
      </div>

      <div id="billing-history" className="pt-24 space-y-10">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner"><History className="h-7 w-7" /></div>
               <h3 className="text-4xl font-black tracking-tight">Intelligence Ledger</h3>
            </div>
            {billingHistory && (
              <Badge className="bg-emerald-50 text-emerald-700 font-black px-5 py-1.5 rounded-full border-2 border-emerald-100 text-[10px] uppercase tracking-widest">Registry: {billingHistory.length} SUCCESS NODES</Badge>
            )}
         </div>
         
         <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[3.5rem]">
            <CardContent className="p-0">
               {billingHistory && billingHistory.length > 0 ? (
                  <Table>
                    <TableHeader className="bg-neutral-50/50">
                      <TableRow className="border-none">
                        <TableHead className="pl-14 py-10 text-[11px] font-black uppercase tracking-[0.2em]">NODE DESCRIPTION</TableHead>
                        <TableHead className="py-10 text-[11px] font-black uppercase tracking-[0.2em] text-center">PROTOCOL STATUS</TableHead>
                        <TableHead className="py-10 text-[11px] font-black uppercase tracking-[0.2em] text-right">FISCAL IMPACT</TableHead>
                        <TableHead className="pr-14 py-10 text-[11px] font-black uppercase tracking-[0.2em] text-right">TIMESTAMP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billingHistory.map((sub) => {
                        const date = sub.paymentDate?.toDate ? sub.paymentDate.toDate() : new Date();
                        const currency = sub.currency === 'INR' ? '₹' : '$';
                        return (
                          <TableRow key={sub.id} className="group hover:bg-neutral-50/50 transition-all duration-300 border-neutral-100">
                            <TableCell className="pl-14 py-8">
                               <div className="flex items-center gap-6">
                                  <div className="h-12 w-12 rounded-2xl bg-primary/5 border flex items-center justify-center text-primary group-hover:scale-110 transition-all shadow-inner"><Receipt className="h-6 w-6" /></div>
                                  <div>
                                     <p className="font-black text-lg uppercase tracking-tight">{sub.planId?.replace('_', ' ')} Plan</p>
                                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">TXID: {sub.paymentProviderTransactionId?.substring(0, 14)}...</p>
                                  </div>
                               </div>
                            </TableCell>
                            <TableCell className="text-center">
                               <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[10px] uppercase tracking-widest px-6 h-9 rounded-xl">NODE VERIFIED</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                               <p className="font-black text-2xl tracking-tighter text-foreground">{currency}{sub.amountPaid.toLocaleString()}</p>
                               <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40">Gross Investment</p>
                            </TableCell>
                            <TableCell className="pr-14 text-right">
                               <p className="font-black text-sm text-foreground">{format(date, 'MMM dd, yyyy')}</p>
                               <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-40">{format(date, 'HH:mm:ss')}</p>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
               ) : (
                  <div className="py-48 text-center opacity-20 flex flex-col items-center gap-8">
                     <History className="h-24 w-24 mx-auto" />
                     <div className="space-y-2">
                        <p className="font-black uppercase tracking-[0.5em] text-sm">Ledger Node Empty</p>
                        <p className="text-xs font-bold uppercase tracking-widest">Awaiting first fiscal synchronization.</p>
                     </div>
                  </div>
               )}
            </CardContent>
         </Card>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
      `}</style>
    </div>
  );
}
