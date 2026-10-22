"use client";

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Check, 
  Zap, 
  Crown, 
  CreditCard, 
  ShieldCheck, 
  Gem, 
  Info, 
  Clock, 
  FileText, 
  ArrowRight, 
  CheckCircle2,
  HelpCircle,
  Receipt,
  Quote,
  Star,
  Lock,
  ArrowUpRight,
  Sparkles,
  Smartphone,
  BrainCircuit,
  ShieldAlert,
  Rocket,
  Layers,
  Shield,
  IdCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { cn } from "@/lib/utils";

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

const PUBLIC_PLANS = [
  { 
    id: "free_plan", 
    name: "Free (Ignition)", 
    description: "Experience basic smart links", 
    maxQRCodes: 5, 
    priceMonthly: 0, 
    priceMonthlyINR: 0, 
    priceYearly: 0, 
    priceYearlyINR: 0, 
    features: ["5 Dynamic Smart Links", "1 AI Smart Page", "1 Digital ID Card", "Standard Analytics", "Community Support", "Expiry Block Protection"] 
  },
  { 
    id: "starter_plan", 
    name: "Starter (BI L1-2)", 
    description: "For small local businesses", 
    maxQRCodes: 20, 
    priceMonthly: 7, 
    priceMonthlyINR: 299, 
    priceYearly: 70, 
    priceYearlyINR: 2990, 
    features: ["20 Dynamic Smart Links", "5 AI Smart Pages", "5 Digital ID Cards", "BI L1: Real-time Health Score", "HD Poster Downloads", "7-Day Renewal Alerts"] 
  },
  { 
    id: "pro_plan", 
    name: "Pro (BI L5)", 
    description: "The Growth Engine tier", 
    maxQRCodes: 100, 
    priceMonthly: 19, 
    priceMonthlyINR: 799, 
    priceYearly: 190, 
    priceYearlyINR: 7990, 
    features: ["100 Dynamic Smart Links", "Unlimited AI Smart Pages", "Unlimited Digital ID Cards", "BI L5: AI Bot Shield", "AI Magic Studio (Imagen 3)", "Automated Expiry Block"] 
  },
  { 
    id: "ent_plan", 
    name: "Enterprise (BI L10)", 
    description: "The Global Intelligence Suite", 
    maxQRCodes: 9999, 
    priceMonthly: 49, 
    priceMonthlyINR: 1999, 
    priceYearly: 490, 
    priceYearlyINR: 19990, 
    features: ["Unlimited Infrastructure", "Fleet Identity Deployment", "BI L10: Executive Master View", "Predictive Revenue Forecasts", "Bulk Injection Suite (CSV)", "Global Expiry Protection"] 
  },
];

export default function PublicPricingPage() {
  const [isINR, setIsINR] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />

      <main className="flex-1 py-16 lg:py-32 px-4">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-6 py-2 uppercase tracking-[0.4em] text-[10px] font-black rounded-full">Intelligence Infrastructure v4.0</Badge>
            <h1 className="text-4xl lg:text-8xl font-black tracking-tighter leading-[1.0] text-foreground">Future-Proof Your <span className="text-primary">Business.</span></h1>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">Choose an Intelligence Level that aligns with your operational scale and identity automation needs.</p>
          </div>

          <div className="flex flex-col items-center gap-12">
            <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as any)} className="w-full max-w-[320px]">
              <TabsList className="grid w-full grid-cols-2 h-14 p-1.5 rounded-2xl bg-neutral-100 shadow-inner">
                <TabsTrigger value="monthly" className="rounded-xl font-black text-[10px] uppercase tracking-widest">Monthly</TabsTrigger>
                <TabsTrigger value="yearly" className="relative rounded-xl font-black text-[10px] uppercase tracking-widest">
                  Yearly
                  <span className="absolute -top-3 -right-2 bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg border-2 border-white">SAVE 20%</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-6 bg-white p-3 rounded-2xl border shadow-xl ring-8 ring-neutral-100/50">
                <Label className={cn("font-black text-[10px] uppercase tracking-widest transition-all", !isINR ? "text-primary scale-110" : "text-muted-foreground opacity-50")}>Global (USD)</Label>
                <Switch 
                  checked={isINR} 
                  onCheckedChange={setIsINR}
                  className="data-[state=checked]:bg-emerald-600 scale-110"
                />
                <Label className={cn("font-black text-[10px] uppercase tracking-widest transition-all", isINR ? "text-emerald-600 scale-110" : "text-muted-foreground opacity-50")}>India (INR)</Label>
              </div>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">*GST INVOICING COMPLIANT</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PUBLIC_PLANS.map((plan) => {
              const isPro = plan.id === 'pro_plan';
              const isFree = plan.id === 'free_plan';
              const Icon = isFree ? Zap : plan.id === 'ent_plan' ? Gem : isPro ? Rocket : Zap;
              const isYearly = billingCycle === "yearly";
              const price = isINR 
                ? (isYearly ? plan.priceYearlyINR : plan.priceMonthlyINR) 
                : (isYearly ? plan.priceYearly : plan.priceMonthly);
              const symbol = isINR ? "₹" : "$";

              return (
                <Card key={plan.id} className={cn(
                  "relative border-none shadow-2xl bg-white flex flex-col transition-all duration-700 hover:-translate-y-4 rounded-[3rem] group",
                  isPro ? 'ring-4 ring-primary/20 md:scale-105 z-10' : 'border border-neutral-100',
                  isFree && 'opacity-90'
                )}>
                  {isPro && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[9px] font-black uppercase tracking-[0.3em] px-8 py-3 rounded-full shadow-2xl z-20 border-4 border-white whitespace-nowrap">
                      The Growth Machine
                    </div>
                  )}
                  <CardHeader className="p-8 sm:p-10 pb-4 text-center items-center">
                    <div className={cn(
                      "h-14 w-14 rounded-[1.25rem] flex items-center justify-center mb-8 shadow-inner group-hover:rotate-12 transition-all duration-500",
                      isPro ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-neutral-50 text-neutral-400 border'
                    )}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight uppercase leading-tight">{plan.name}</CardTitle>
                    <CardDescription className="text-[10px] font-black text-muted-foreground/60 mt-2 uppercase tracking-widest leading-relaxed max-w-[180px]">{plan.description}</CardDescription>
                    <div className="mt-8 flex flex-col items-center">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-5xl font-black tracking-tighter">{isFree ? 'FREE' : `${symbol}${price.toLocaleString()}`}</span>
                        {!isFree && <span className="text-muted-foreground text-[10px] font-black uppercase opacity-60">/{isYearly ? "year" : "mo"}</span>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-4 flex-1">
                    <div className="h-px bg-neutral-100 mb-8 w-full" />
                    <ul className="space-y-4">
                      {plan.features?.map((f, j) => {
                        const isBI = f.includes('BI L');
                        const isID = f.includes('ID Card');
                        const isFleet = f.includes('Fleet');
                        return (
                          <li key={j} className="flex items-start gap-3">
                            <div className={cn(
                                "mt-1 h-4 w-4 rounded-full flex items-center justify-center shrink-0 border-2",
                                isBI ? "bg-primary/5 border-primary/20 text-primary" : 
                                (isID || isFleet) ? "bg-accent/5 border-accent/20 text-accent" :
                                "bg-emerald-50 border-emerald-100 text-emerald-600"
                            )}>
                              {isBI ? <BrainCircuit className="h-2 w-2" /> : (isID || isFleet) ? <IdCard className="h-2 w-2" /> : <Check className="h-2.5 w-2.5 stroke-[4px]" />}
                            </div>
                            <span className={cn("text-[11px] font-bold leading-tight", isBI ? "text-primary" : (isID || isFleet) ? "text-accent" : "text-neutral-700")}>{f}</span>
                          </li>
                        );
                      })}
                      <li className="flex items-start gap-3 text-[11px] font-black text-foreground pt-4 border-t border-neutral-50 uppercase tracking-tighter">
                        <div className="mt-1 h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Layers className="h-2 w-2 text-primary" />
                        </div>
                        <span>{plan.maxQRCodes >= 9999 ? "Unlimited Nodes" : `${plan.maxQRCodes} Smart Nodes`}</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="p-8 pt-0 mt-auto">
                    <Button asChild variant="outline" className={cn(
                        "w-full h-16 font-black text-xs rounded-2xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-widest",
                        isPro ? 'bg-primary hover:bg-primary/90 text-white' : 'border-4'
                    )}>
                      <Link to="/signup">{isFree ? 'Start Building' : 'Enter Trial Node'} <ArrowRight className="h-4 w-4 ml-2" /></Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-center gap-12 pt-8 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
             <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Encrypted Data Transmission</span>
             </div>
             <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-primary" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Razorpay Secure Gateway</span>
             </div>
             <div className="flex items-center gap-3">
                <Receipt className="h-6 w-6 text-accent" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Automatic GST Invoicing</span>
             </div>
          </div>

          {/* Master Comparison Table */}
          <div className="pt-24 space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-6xl font-black tracking-tighter uppercase">Intelligence Matrix</h2>
              <p className="text-muted-foreground font-medium max-w-xl mx-auto">A deep look into the capabilities provided at each level of synchronization.</p>
            </div>
            
            <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[4rem] border border-neutral-100">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-neutral-50/50">
                    <TableRow className="border-none">
                      <TableHead className="py-12 pl-14 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Capabilities Node</TableHead>
                      <TableHead className="py-12 text-center text-[10px] font-black uppercase tracking-[0.3em]">Free</TableHead>
                      <TableHead className="py-12 text-center text-[10px] font-black uppercase tracking-[0.3em]">Starter</TableHead>
                      <TableHead className="py-12 text-center text-[10px] font-black uppercase tracking-[0.3em]">Pro</TableHead>
                      <TableHead className="py-12 text-center text-[10px] font-black uppercase tracking-[0.3em] bg-primary text-white">Enterprise</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { name: "Dynamic Smart Link Redirection", free: true, starter: true, pro: true, ent: true },
                      { name: "Digital ID Cards (NFC Ready)", free: "1 Card", starter: "5 Cards", pro: "Unlimited", ent: "Fleet Suite" },
                      { name: "AI Smart Pages (Sales Funnel)", free: "1 Page", starter: "5 Pages", pro: "Unlimited", ent: "Unlimited" },
                      { name: "Automated Expiry Block Protection", free: true, starter: true, pro: true, ent: true },
                      { name: "Intelligent 7-Day Renewal Alerts", free: false, starter: true, pro: true, ent: true },
                      { name: "BI Level 1: Health Score Index", free: false, starter: true, pro: true, ent: true },
                      { name: "AI Fraud & Bot Defense Hub", free: false, starter: false, pro: true, ent: true },
                      { name: "AI Magic Style Studio (Imagen 3)", free: false, starter: false, pro: true, ent: true },
                      { name: "Predictive Revenue Analytics", free: false, starter: false, pro: false, ent: true },
                      { name: "Global Expiry Protection Suite", free: false, starter: false, pro: false, ent: true },
                    ].map((row, i) => (
                      <TableRow key={i} className="border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                        <TableCell className="py-7 pl-14 font-black text-sm sm:text-base uppercase tracking-tight">{row.name}</TableCell>
                        <TableCell className="py-7 text-center">
                          {typeof (row as any).free === 'string' ? <span className="text-[10px] font-black uppercase">{(row as any).free}</span> : (row as any).free ? <CheckCircle2 className="h-5 w-5 text-neutral-400 mx-auto" /> : <Lock className="h-4 w-4 text-neutral-200 mx-auto" />}
                        </TableCell>
                        <TableCell className="py-7 text-center">
                          {typeof row.starter === 'string' ? <span className="text-[10px] font-black uppercase">{row.starter}</span> : row.starter ? <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" /> : <Lock className="h-4 w-4 text-neutral-200 mx-auto" />}
                        </TableCell>
                        <TableCell className="py-7 text-center">
                          {typeof row.pro === 'string' ? <span className="text-[10px] font-black uppercase">{row.pro}</span> : row.pro ? <CheckCircle2 className="h-5 w-5 text-primary mx-auto" /> : <Lock className="h-4 w-4 text-neutral-200 mx-auto" />}
                        </TableCell>
                        <TableCell className="py-7 text-center bg-primary/5">
                          {typeof row.ent === 'string' ? <span className="text-[10px] font-black text-primary uppercase">{row.ent}</span> : row.ent ? <CheckCircle2 className="h-5 w-5 text-primary mx-auto" /> : <Lock className="h-4 w-4 text-neutral-200 mx-auto" />}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>

          <div className="pt-24 max-w-4xl mx-auto space-y-12">
             <div className="text-center">
               <h3 className="text-3xl font-black uppercase tracking-tight">Billing Support</h3>
             </div>
             <Accordion type="single" collapsible className="w-full space-y-4">
                {BILLING_FAQS.map((faq, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="bg-white border-2 border-neutral-100 rounded-[2.5rem] px-10 overflow-hidden transition-all hover:shadow-2xl hover:border-primary/20">
                     <AccordionTrigger className="text-left font-black text-lg py-8 hover:no-underline">{faq.q}</AccordionTrigger>
                     <AccordionContent className="text-muted-foreground leading-relaxed pb-10 font-medium text-lg italic">"{faq.a}"</AccordionContent>
                  </AccordionItem>
                ))}
             </Accordion>
          </div>

          <div className="mt-20 p-12 lg:p-24 rounded-[5rem] bg-primary text-white relative overflow-hidden shadow-2xl shadow-primary/30 border-8 border-white/10">
             <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><Sparkles className="h-80 w-80 text-accent" /></div>
             <div className="relative z-10 text-center max-w-4xl mx-auto space-y-12">
                <h2 className="text-4xl lg:text-7xl font-black leading-[1.0] tracking-tighter">Ready to Deploy <br />Your <span className="text-accent italic">Identity Node?</span></h2>
                <p className="opacity-80 font-medium text-lg lg:text-2xl italic">Join 5,000+ high-growth brands using LinkQR AI to automate their identity and sales networks.</p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                  <Button size="lg" className="bg-white text-primary hover:bg-neutral-100 h-20 px-16 rounded-[2rem] font-black gap-4 shadow-2xl text-xl transition-transform hover:scale-[1.03] active:scale-95" asChild>
                    <Link to="/signup">Start Free Trial <Zap className="h-6 w-6 fill-current" /></Link>
                  </Button>
                  <Button size="lg" variant="outline" className="bg-white/10 border-4 border-white/20 hover:bg-white/20 h-20 px-16 rounded-[2rem] font-black text-xl text-white transition-transform hover:scale-[1.03] active:scale-95" asChild>
                    <Link to="/contact">Talk to Expert</Link>
                  </Button>
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.5em] opacity-40">Zero Commitment • Instant Access • Enterprise Infrastructure</p>
             </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
