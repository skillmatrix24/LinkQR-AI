
"use client";

import React, { useMemo, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  QrCode,
  Sparkles,
  ArrowRight,
  Zap,
  Globe,
  BarChart3,
  SearchCode,
  Palette,
  BrainCircuit,
  ShieldCheck,
  Activity,
  Target,
  Trophy,
  Calculator,
  Rocket,
  Users,
  MessageSquare,
  Gauge,
  Timer,
  CheckCircle2,
  RefreshCcw,
  Layout,
  Mail,
  Layers,
  Headphones,
  Shield,
  Star,
  XCircle,
  Utensils,
  Building2,
  School,
  ShoppingBag,
  Hospital,
  Dumbbell,
  BadgeIndianRupee,
  Check,
  Smartphone,
  ExternalLink,
  ShieldAlert,
  IdCard,
  UserCircle,
  MessageCircle,
  Phone,
  Server,
  ContactRound as ContactIcon,
  Wrench as WrenchIcon,
  Search,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useFirestore, useCollection, useMemoFirebase, useDoc, useUser } from "@/firebase";
import { collection, query, orderBy, doc, limit } from "firebase/firestore";
import { format, subDays, isToday } from "date-fns";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";

const INDUSTRIES = [
  { name: "Restaurants", icon: Utensils, desc: "Digital Menu & UPI Pay" },
  { name: "Real Estate", icon: Building2, desc: "Property Virtual Tours" },
  { name: "Education", icon: School, desc: "Direct Admission Leads" },
  { name: "Retail", icon: ShoppingBag, desc: "Discount & Coupon QRs" },
  { name: "Healthcare", icon: Hospital, desc: "Appointment Booking" },
  { name: "Gyms", icon: Dumbbell, desc: "Direct Membership Sales" }
];

const ENTERPRISE_FEATURES = [
  { title: "Bulk Injection", desc: "1000+ QR codes in one click.", icon: Layers },
  { title: "White Label", desc: "Use your own custom domain.", icon: Globe },
  { title: "Advanced Webhooks", desc: "Connect with 1000+ apps.", icon: Zap },
  { title: "Role Management", desc: "Team access & permissions.", icon: Users }
];

const BI_LEVELS = [
  { title: "Health Index", icon: BrainCircuit, desc: "0-100 real-time score.", color: "text-blue-500" },
  { title: "Predictive", icon: Rocket, desc: "30-day growth forecasts.", color: "text-purple-500" },
  { title: "Copilot", icon: Sparkles, desc: "Personal daily strategy.", color: "text-amber-500" },
  { title: "Bot Shield", icon: ShieldCheck, desc: "Fraudulent scan protection.", color: "text-orange-500" },
  { title: "Revenue", icon: BadgeIndianRupee, desc: "ROI per scan tracking.", color: "text-emerald-500" }
];

const FAQS = [
  { q: "What is a Dynamic QR Code?", a: "Dynamic QRs use a short URL that redirects the user to your destination. This allows you to change the destination URL anytime without changing the actual QR code image." },
  { q: "Does the QR code image change when I update the link?", a: "No, that's the primary benefit! You can print your QR once and change the destination a thousand times." },
  { q: "Can I track scans in real-time?", a: "Yes! Every scan is tracked instantly. You can see the IP address, device type, and location of your scanners directly in your dashboard." },
  { q: "How does AI Bot Filtering work?", a: "Our GenAI engine analyzes scan signatures to detect and filter out automated crawlers and bots, ensuring your marketing data represents real human interactions only." },
  { q: "What happens if my plan expires?", a: "All your Smart Links and Pages are automatically protected and blocked from access until renewal. You will receive alerts 7 days before expiry." },
  { q: "Can I customize QR codes with my brand logo and colors?", a: "Absolutely! Our AI Design Studio lets you customize colors, patterns, frames, and embed your brand logo while maintaining 100% scan reliability." },
  { q: "What are Smart Pages and Digital ID Cards?", a: "Smart Pages are mobile-optimized microsites for menus, catalogs, lead forms, and UPI payments, while Digital ID Cards let you share your contact details with one-tap VCF saving." },
  { q: "Can I generate QR codes in bulk for my business?", a: "Yes! With our Enterprise Bulk Injection tool, you can generate and manage 1,000+ dynamic QR codes simultaneously in a single click." }
];

const HOW_IT_WORKS = [
  { step: "01", title: "Paste Link", desc: "Enter any URL or choose a preset.", icon: Globe },
  { step: "02", title: "AI Design", desc: "Speak to generate brand aesthetics.", icon: Sparkles },
  { step: "03", title: "Deploy Node", desc: "Download HD posters instantly.", icon: QrCode },
  { step: "04", title: "Analyze BI", desc: "Track conversions & block bots.", icon: Activity }
];

const BENEFITS = [
  { feature: "Flexibility", good: "Update destination link anytime.", bad: "Fixed destination, re-print needed.", icon: RefreshCcw },
  { feature: "Analytics", good: "Deep BI insights per scan.", bad: "Zero scan data available.", icon: BarChart3 },
  { feature: "Design", good: "Custom AI branding & logos.", bad: "Generic industrial look.", icon: Palette },
  { feature: "Security", good: "AI Bot Shield blocks 100% fraud.", bad: "Vulnerable to bot spam.", icon: ShieldCheck },
  { feature: "Conversion", good: "Connect to Smart Landing Pages.", bad: "Simple, cold redirection only.", icon: Smartphone },
  { feature: "Maintenance", good: "Auto-pause expired links & alerts.", bad: "Broken links damage brand.", icon: ShieldAlert }
];

const LIVE_DEMOS = [
  { title: "Digital Menu", category: "Restaurant", image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", url: "/s/demo-menu" },
  { title: "Property Tour", category: "Real Estate", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", url: "/s/demo-property" },
  { title: "Event RSVP", category: "Events", image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", url: "/s/demo-event" },
  { title: "vCard Plus", category: "Personal", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", url: "/s/demo-vcard" },
  { title: "E-Commerce", category: "Sales", image: "https://images.unsplash.com/photo-1557821552-17105176677c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", url: "/s/demo-shop" },
  { title: "Review Node", category: "Marketing", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", url: "/s/demo-review" }
];

const INDIAN_TESTIMONIALS = [
  { userName: "Rajesh Kumar", role: "Cafe Owner, Bangalore", comment: "LinkQR AI ne hamare restaurant ka menu setup bahut asaan bana diya. WhatsApp alerts se order miss nahi hote!", userPhoto: "https://picsum.photos/seed/rajesh/100/100", rating: 5 },
  { userName: "Sneha Kapoor", role: "Marketing Head, Delhi", comment: "Bulk QR generator features mere agency business ke liye life-saver hai. 1000+ codes ek saath sync ho jaate hain!", userPhoto: "https://picsum.photos/seed/sneha/100/100", rating: 5 },
  { userName: "Aniket Verma", role: "Freelance Designer, Mumbai", comment: "AI design studio se bane QRs bahut hi premium lagte hain. Clients ko branded colors pasand aaye.", userPhoto: "https://picsum.photos/seed/aniket/100/100", rating: 5 },
  { userName: "Dr. Sameer", role: "Dental Clinic, Pune", comment: "Google Reviews collect karne ka best tool. Hamara store rating 4.2 se 4.9 ho gaya 1 month mein. Superb!", userPhoto: "https://picsum.photos/seed/sameer/100/100", rating: 5 },
  { userName: "Vikram Singh", role: "E-commerce Store, Jaipur", comment: "Analytics se humein pata chalta hai ki scans kahan se aa rahe hain. Budget bachane mein madad mili.", userPhoto: "https://picsum.photos/seed/vikram/100/100", rating: 5 },
  { userName: "Priya Mehta", role: "Boutique Owner, Ahmedabad", comment: "Smart Pages builder itna easy hai ki mere business ke liye pro landing page ready ho gaya. Best for SME.", userPhoto: "https://picsum.photos/seed/priya/100/100", rating: 5 },
  { userName: "Manish Jain", role: "Real Estate Agent, Hyderabad", comment: "Properties ke liye dynamic QRs use kar raha hoon. Jab site link badalta hai, QR change nahi karna potta.", userPhoto: "https://picsum.photos/seed/manish/100/100", rating: 5 },
  { userName: "Rahul Gupta", role: "Retail Store, Lucknow", comment: "Bilingual support ki wajah se hamare local customers ko usage mein koi problem nahi hoti. Best tool.", userPhoto: "https://picsum.photos/seed/rahul/100/100", rating: 5 },
  { userName: "Sunil", role: "Gym Owner, Chandigarh", comment: "UPI payment integration feature se seedha account mein paise aate hain. Zero processing fee.", userPhoto: "https://picsum.photos/seed/sunil/100/100", rating: 5 },
  { userName: "Pooja Das", role: "Education Consultant, Kolkata", comment: "LinkQR AI dashboard se lead capture karna bahut simple hai. BI levels se daily insights milte hain.", userPhoto: "https://picsum.photos/seed/pooja/100/100", rating: 5 },
];

export default function LandingPage() {
  const [url, setUrl] = useState("");
  const [typed, setTyped] = useState("");
  const navigate = useNavigate();
  const db = useFirestore();
  const { user } = useUser();

  const [scansSlider, setScansSlider] = useState(1000);
  const [conv, setConv] = useState(10);
  const [saleValue, setSaleValue] = useState(500);

  const estimatedRevenue = (scansSlider * (conv / 100)) * saleValue;

  const siteConfigRef = useMemoFirebase(() => db ? doc(db, "config", "site") : null, [db]);
  const { data: siteConfig } = useDoc(siteConfigRef);
  
  const reviewsQuery = useMemoFirebase(() => db ? query(collection(db, "reviews"), orderBy("submittedAt", "desc"), limit(10)) : null, [db]);
  const { data: dynamicReviews } = useCollection(reviewsQuery);

  const isAdmin = !!(user?.email === 'admin@test.com' || user?.email === 'skillmatrix24@gmail.com' || user?.email === 'thegingerleaf77@gmail.com');

  const placeholders = useMemo(() => ["Paste your link here...", "https://wa.me/yournumber", "https://g.page/yourbusiness/review", "https://your-menu-link.com"], []);

  useEffect(() => {
    let index = 0; let char = 0; let deleting = false;
    const interval = setInterval(() => {
      const current = placeholders[index];
      if (!deleting) {
        setTyped(current.substring(0, char + 1)); char++;
        if (char === current.length) deleting = true;
      } else {
        setTyped(current.substring(0, char - 1)); char--;
        if (char === 0) { deleting = false; index = (index + 1) % placeholders.length; }
      }
    }, deleting ? 40 : 80);
    return () => clearInterval(interval);
  }, [placeholders]);

  const handleCreateStandard = () => {
    const target = url ? `/dashboard/qrs/new?url=${encodeURIComponent(url)}` : "/dashboard/qrs/new";
    navigate(target);
  };

  const renderRichText = (text: string | undefined) => {
    if (!text) return null;
    const parts = text.split(/(\{.*?\})/g);
    return parts.map((part, i) => {
      if (part.startsWith('{') && part.endsWith('}')) {
        return <span key={i} className="text-primary font-black">{part.slice(1, -1)}</span>;
      }
      return part;
    });
  };

  if (siteConfig?.maintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2EFF7] p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 sm:p-14 border border-neutral-100">
          <div className="h-20 w-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <WrenchIcon className="h-10 w-10 text-orange-600" />
          </div>
          <h1 className="text-3xl font-black text-neutral-900 mb-4">Under Maintenance</h1>
          <p className="text-muted-foreground mb-10 text-sm leading-relaxed font-medium">
            We are currently optimizing our intelligence nodes. Please check back in a few minutes.
          </p>
          <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center gap-3">
             <Shield className="h-5 w-5 text-orange-600" />
             <p className="text-[10px] font-black uppercase text-orange-700 tracking-widest">Protocol Offline</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20">
      <SiteHeader />

      {/* HERO SECTION */}
      <section className="relative pt-12 sm:pt-32 pb-16 sm:pb-32 px-4 bg-white overflow-hidden border-b">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] h-[400px] w-[400px] bg-primary/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] h-[400px] w-[400px] bg-accent/10 blur-[120px] rounded-full"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary font-black text-[10px] uppercase tracking-widest mb-8">
            <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}><Sparkles className="h-4 w-4" /></motion.div> {siteConfig?.businessName || "LinkQR AI"} Global Ecosystem
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[1.0] mb-8 px-2">
            {siteConfig?.heroTitle ? renderRichText(siteConfig.heroTitle) : <>Grow Your Business <br />with {renderRichText("{AI-Powered}")} QRs.</>}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-5xl mx-auto text-sm sm:text-xl text-muted-foreground font-medium mb-12 px-4 leading-relaxed whitespace-pre-wrap">
            {siteConfig?.heroSubtitle || `अपने बिज़नेस के लिए Branded, Trackable और AI-Powered Dynamic QR Codes बनाइए। Website, WhatsApp, Google Review, Menu, Payment, Social Media, PDF, Contact Card सहित 25+ QR Solutions के साथ High-Converting Landing Pages तैयार करें।`}
          </motion.p>
          
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="max-w-4xl mx-auto bg-white rounded-3xl p-2 sm:p-3 shadow-[0_48px_96px_-16px_rgba(103,80,164,0.2)] border border-neutral-100 flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center px-4 sm:px-6 gap-3 min-h-[56px] sm:min-h-[64px]">
              <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder={typed} className="w-full h-full outline-none text-sm sm:text-lg font-black bg-transparent placeholder:text-muted-foreground/30" />
            </div>
            <Button size="lg" className="h-14 sm:h-16 px-8 sm:px-12 rounded-2xl font-black text-xs sm:text-sm gap-2 shadow-xl bg-primary hover:bg-primary/90 text-white" onClick={handleCreateStandard}>
              CREATE FREE QR <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* TRUST STATS SECTION */}
      <section className="py-8 sm:py-12 bg-white border-b border-neutral-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12">
            {[
              { label: "RATED BY BUSINESSES", value: "⭐⭐⭐⭐⭐", sub: "TOP RATED" },
              { label: "QR CODES GENERATED", value: "10,000+", sub: "TRUST BY USERS" },
              { label: "BUSINESS OWNERS", value: "500+", sub: "ACTIVE CLIENTS" },
              { label: "SYSTEM AVAILABILITY", value: "99.9%", sub: "CLOUD GUARANTEED" }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{stat.label}</p>
                {stat.value === "⭐⭐⭐⭐⭐" ? (
                  <div className="flex gap-0.5 text-amber-400 py-1">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-5 w-5 fill-amber-400 text-amber-600 drop-shadow-[0_2px_1px_rgba(0,0,0,0.3)]" />)}
                  </div>
                ) : (
                  <p className="text-xl sm:text-3xl font-black text-foreground tracking-tighter">{stat.value}</p>
                )}
                <p className="text-[9px] font-bold uppercase text-accent tracking-widest">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REALITY CHECK */}
      <section className="py-16 bg-white px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-16 space-y-3">
             <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50 px-4 py-1.5 font-bold uppercase text-[9px]">The Reality Check</Badge>
             <h2 className="text-3xl sm:text-6xl font-black tracking-tight leading-tight">Static QRs are <span className="text-red-500 italic">Dead.</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 max-w-7xl mx-auto">
            {BENEFITS.map((b, i) => (
              <div key={i} className="p-6 sm:p-8 bg-neutral-50 rounded-[2rem] border border-neutral-100 space-y-6 group hover:bg-white hover:shadow-2xl transition-all duration-500">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><b.icon className="h-6 w-6 sm:h-7 sm:w-7" /></div>
                <div className="space-y-4">
                   <h4 className="text-lg sm:text-xl font-black tracking-tight text-primary uppercase">{b.feature}</h4>
                   <div className="space-y-3">
                      <div className="flex items-start gap-3 opacity-40"><XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" /><p className="text-xs font-bold line-through italic">{b.bad}</p></div>
                      <div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /><p className="text-xs font-black text-neutral-800">{b.good}</p></div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI CALCULATOR */}
      <section className="py-16 bg-primary/5 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12 space-y-3">
             <Badge variant="outline" className="text-primary border-primary/20 px-4 py-1.5 font-black uppercase text-[9px]">Profitability Matrix</Badge>
             <h2 className="text-3xl sm:text-6xl font-black tracking-tight">Calculate Your <span className="text-primary">ROI</span></h2>
          </div>
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-stretch bg-white rounded-[2.5rem] p-5 sm:p-12 border border-neutral-100 shadow-2xl overflow-hidden">
             <div className="space-y-8 flex flex-col justify-center">
                <div className="space-y-4"><div className="flex justify-between items-center"><Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">Monthly Scans</Label><Badge className="bg-primary text-white font-black px-3">{scansSlider}</Badge></div><Slider value={[scansSlider]} onValueChange={(v) => setScansSlider(v[0])} min={100} max={10000} step={100} /></div>
                <div className="space-y-4"><div className="flex justify-between items-center"><Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">Conversion Rate (%)</Label><Badge className="bg-primary text-white font-black px-3">{conv}%</Badge></div><Slider value={[conv]} onValueChange={(v) => setConv(v[0])} min={1} max={50} step={1} /></div>
                <div className="space-y-4"><div className="flex justify-between items-center"><Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">Order Value (₹)</Label><Badge className="bg-primary text-white font-black px-3">₹{saleValue}</Badge></div><Slider value={[saleValue]} onValueChange={(v) => setSaleValue(v[0])} min={100} max={10000} step={100} /></div>
             </div>
             <div className="bg-primary p-8 rounded-[2rem] text-white flex flex-col items-center justify-center text-center space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Calculator className="h-40 w-40" /></div>
                <div className="space-y-2 relative z-10"><p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-70">Estimated Monthly Revenue</p><h3 className="text-4xl sm:text-7xl font-black tracking-tighter">₹{estimatedRevenue.toLocaleString()}</h3></div>
                <div className="w-full pt-6 border-t border-white/20 relative z-10"><Button size="lg" className="w-full h-14 sm:h-16 bg-white text-primary hover:bg-neutral-100 rounded-2xl font-black text-sm" asChild><Link to="/signup">CLAIM THIS GROWTH</Link></Button></div>
             </div>
          </div>
        </div>
      </section>

      {/* DIGITAL ID CARDS SECTION */}
      <section id="digital-id" className="py-20 sm:py-32 bg-neutral-50 px-4 scroll-mt-20 border-y">
        <div className="container mx-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
             <div className="relative order-last lg:order-first flex justify-center">
                <div className="relative bg-white p-6 sm:p-10 rounded-[3rem] sm:rounded-[4rem] shadow-2xl border-8 border-white group">
                  <div className="absolute inset-0 bg-primary/5 rounded-[3rem] sm:rounded-[4rem] pointer-events-none transition-all group-hover:bg-primary/10"></div>
                  <div className="relative flex flex-col items-center text-center space-y-6">
                    <div className="h-32 w-32 rounded-full border-4 border-primary p-1 bg-white shadow-xl overflow-hidden">
                       <img src="https://picsum.photos/seed/idcard/200/200" className="h-full w-full rounded-full object-cover" alt="User Profile" />
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center justify-center gap-2">
                          <h3 className="text-2xl font-black text-foreground">Rahul Sharma</h3>
                          <CheckCircle2 className="h-5 w-5 text-blue-500 fill-current" />
                       </div>
                       <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Strategy Consultant @ Tech Corp</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 w-full">
                       <div className="p-3 bg-neutral-50 rounded-2xl border flex flex-col items-center justify-center gap-1 shadow-inner">
                          <Phone className="h-4 w-4 text-primary" />
                          <span className="text-[8px] font-black uppercase">Call</span>
                       </div>
                       <div className="p-3 bg-neutral-50 rounded-2xl border flex flex-col items-center justify-center gap-1 shadow-inner">
                          <MessageCircle className="h-4 w-4 text-emerald-500" />
                          <span className="text-[8px] font-black uppercase">WhatsApp</span>
                       </div>
                    </div>
                    <Button className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl" asChild>
                       <Link to="/dashboard/vcards/new">SAVE CONTACT</Link>
                    </Button>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 h-24 w-24 bg-accent text-white rounded-3xl flex items-center justify-center shadow-2xl rotate-12 animate-in zoom-in duration-700">
                   <IdCard className="h-10 w-10" />
                </div>
             </div>

             <div className="space-y-8">
                <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-4 py-2 font-black uppercase text-[9px] tracking-widest rounded-full">Professional Identity Node</Badge>
                <h2 className="text-3xl sm:text-7xl font-black tracking-tighter leading-[1.0]">Digital <span className="text-primary">ID Cards.</span></h2>
                <p className="text-sm sm:text-xl text-muted-foreground font-medium leading-relaxed">
                   कागज़ के कार्ड्स अब बीते ज़माने की बात हैं। अपना प्रीमियम **Digital Business Card** बनाइये जो एक टैप में कस्टमर के फ़ोन में आपका कॉन्टैक्ट सेव कर दे। पोर्टफोलियो, सोशल लिंक्स और रीयल-टाइम एनालिटिक्स के साथ।
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   {[
                     { t: "Instant VCF Sync", d: "एक क्लिक में कॉन्टैक्ट सेव करें।", i: ContactIcon },
                     { t: "AI Professional Bio", d: "AI से अपनी दमदार कहानी लिखवाएं।", i: Sparkles },
                     { t: "Live Stats Hub", d: "देखें कार्ड कितनी बार सेव हुआ।", i: BarChart3 },
                     { t: "Social Presence", d: "सभी हैंडल्स एक ही जगह पर।", i: Globe }
                   ].map((f, i) => (
                     <div key={i} className="flex gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white shadow-xl flex items-center justify-center text-primary shrink-0 transition-transform hover:scale-110"><f.i className="h-5 w-5" /></div>
                        <div>
                           <h4 className="font-black text-foreground text-xs uppercase tracking-tight">{f.t}</h4>
                           <p className="text-[10px] text-muted-foreground font-medium">{f.d}</p>
                        </div>
                     </div>
                   ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                   <Button size="lg" className="h-14 sm:h-16 px-10 rounded-2xl font-black text-sm gap-3 shadow-xl" asChild>
                      <Link to="/dashboard/vcards/new">CREATE MY DIGITAL ID <ArrowRight className="h-5 w-5" /></Link>
                   </Button>
                   <Button size="lg" variant="ghost" className="h-14 sm:h-16 px-10 rounded-2xl font-black text-sm gap-3 bg-white border-2" asChild>
                      <Link to="/features#digital-id">Explore Features</Link>
                   </Button>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* SCALE YOUR OPERATIONS - ENTERPRISE FEATURES */}
      <section className="py-20 bg-white px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="text-primary border-primary/20 px-6 py-2 uppercase tracking-widest text-[10px] font-black rounded-full">SCALING FOR ENTERPRISES</Badge>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase">Scale Your <span className="text-primary">Operations.</span></h2>
            <p className="text-muted-foreground font-medium text-lg">Enterprise-grade tools for agencies and global brands.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
             {ENTERPRISE_FEATURES.map((f, i) => (
               <Card key={i} className="border-none shadow-xl bg-white rounded-[2rem] p-8 flex flex-col gap-6 group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="h-14 w-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><f.icon className="h-6 w-6" /></div>
                  <div className="space-y-2">
                     <h4 className="font-black text-sm uppercase tracking-widest text-foreground">{f.title}</h4>
                     <p className="text-xs text-muted-foreground font-medium leading-relaxed">{f.desc}</p>
                  </div>
               </Card>
             ))}
          </div>
        </div>
      </section>

      {/* BUILT FOR EVERY VENTURE - INDUSTRIES */}
      <section className="py-20 bg-white px-4 border-t border-neutral-50">
        <div className="container mx-auto">
           <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl sm:text-7xl font-black tracking-tighter uppercase">Built for <span className="text-primary">Every Venture.</span></h2>
              <p className="text-muted-foreground font-medium text-lg">See how specific industries use LinkQR to scale.</p>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-7xl mx-auto">
              {INDUSTRIES.map((ind, i) => (
                <div key={i} className="p-8 sm:p-10 bg-neutral-50 rounded-[2.5rem] border border-neutral-100 flex flex-col items-center text-center gap-4 group hover:bg-white hover:shadow-2xl transition-all duration-500">
                   <div className="h-14 w-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner"><ind.icon className="h-6 w-6" /></div>
                   <div className="space-y-1">
                      <h4 className="font-black text-[10px] sm:text-xs uppercase tracking-[0.2em]">{ind.name}</h4>
                      <p className="text-[9px] font-bold text-muted-foreground opacity-70 leading-tight">{ind.desc}</p>
                   </div>
                </div>
              ))}
           </div>
           <div className="mt-16 text-center">
              <Button variant="outline" className="rounded-xl h-14 px-10 border-2 font-black text-xs uppercase tracking-widest bg-neutral-50 hover:bg-white hover:text-primary shadow-sm" asChild>
                 <Link to="/dashboard/qrs/new">CREATE MY INDUSTRY QR</Link>
              </Button>
           </div>
        </div>
      </section>

      {/* EASY STEPS - HOW IT WORKS */}
      <section className="py-20 bg-primary/5 px-4">
        <div className="container mx-auto">
           <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl sm:text-7xl font-black tracking-tighter uppercase">Easy Steps</h2>
              <p className="text-muted-foreground font-medium text-lg">Simple 4-step process to digital excellence.</p>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {HOW_IT_WORKS.map((item, i) => (
                <div key={i} className="relative p-10 bg-white rounded-[3rem] border border-neutral-100 text-center shadow-xl group hover:shadow-2xl transition-all duration-500">
                   <div className="absolute -top-5 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-black shadow-lg border-4 border-white text-xs">{item.step}</div>
                   <item.icon className="h-10 w-10 text-primary mx-auto mb-6 transition-transform group-hover:rotate-12" />
                   <h4 className="font-black text-lg mb-2 uppercase tracking-tight">{item.title}</h4>
                   <p className="text-xs text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
           </div>
           <div className="mt-16 text-center">
              <Button size="lg" className="h-16 px-12 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl bg-primary text-white" asChild>
                 <Link to="/signup">GET STARTED IN 60s</Link>
              </Button>
           </div>
        </div>
      </section>

      {/* LIVE DEMOS SECTION */}
      <section className="py-16 bg-white px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12 space-y-3">
             <Badge variant="outline" className="text-primary border-primary/20 px-4 py-1.5 font-black uppercase text-[9px]">Experience The Studio</Badge>
             <h2 className="text-2xl sm:text-5xl font-black tracking-tight">Live <span className="text-primary">Studio Demos</span></h2>
             <p className="text-muted-foreground font-medium text-sm sm:text-base">Explore what you can build with LinkQR AI.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {LIVE_DEMOS.map((demo, i) => (
              <Card key={i} className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden group hover:shadow-2xl transition-all duration-500">
                 <div className="aspect-video relative overflow-hidden bg-neutral-100">
                    <img src={demo.image} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt={demo.title} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Button size="sm" className="rounded-xl font-bold" asChild><a to={demo.url} target="_blank">VIEW LIVE DEMO <ExternalLink className="ml-2 h-3 w-3" /></a></Button>
                    </div>
                    <div className="absolute top-4 left-4">
                       <Badge className="bg-white/95 text-primary border-none shadow-lg font-black uppercase text-[9px] tracking-widest">{demo.category}</Badge>
                    </div>
                 </div>
                 <div className="p-6">
                    <h4 className="font-black text-lg uppercase tracking-tight">{demo.title}</h4>
                    <p className="text-xs text-muted-foreground font-medium mt-1">High-conversion layout node.</p>
                 </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SMART PAGES */}
      <section id="smart-pages" className="py-16 bg-white px-4">
        <div className="container mx-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
             <div className="space-y-8">
                <Badge variant="outline" className="text-primary border-primary/20 bg-primary/10 px-4 py-2 font-black uppercase text-[9px] tracking-widest rounded-full">Convert Scans to Sales</Badge>
                <h2 className="text-3xl sm:text-7xl font-black tracking-tighter leading-[1.0]">Launch Your <span className="text-primary">Smart Page</span> in 60s.</h2>
                <p className="text-sm sm:text-xl text-muted-foreground font-medium leading-relaxed">वेबसाइट के लिए पैसे क्यों खर्च करना? हमारे **Modular Builder** के साथ अपना खुद ka mobile sales funnel बनाएं। रीयल-टाइम लीड्स, रिव्यूज और पेमेंट के साथ।</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                   {[ { t: "FOMO Timer", d: "सेल्स बढ़ाने के लिए ऑफर टाइमर।" }, { t: "UPI Direct Pay", d: "बिना फीस के पेमेंट लें।" }, { t: "Lead CRM", d: "तुरंत व्हाट्सएप अलर्ट।" }, { t: "Modular Blocks", d: "अपनी मर्ज़ी से ब्लॉक्स बदलें।" } ].map((f, i) => (
                     <div key={i} className="flex gap-3"><div className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center mt-0.5 shrink-0"><Check className="h-3 w-3 stroke-[4px]" /></div><div><h4 className="font-black text-foreground text-xs sm:text-sm uppercase tracking-tight">{f.t}</h4><p className="text-[10px] sm:text-xs text-muted-foreground font-medium">{f.d}</p></div></div>
                   ))}
                </div>
                <Button size="lg" className="h-14 sm:h-16 px-8 sm:px-10 rounded-2xl font-black text-xs sm:text-base gap-2 shadow-2xl" asChild><Link to="/dashboard/qrs/microsite">BUILD MY SMART PAGE <Smartphone className="h-4 w-4" /></Link></Button>
             </div>
             <div className="relative"><Card className="relative border-4 sm:border-8 border-neutral-50 shadow-2xl rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden bg-white aspect-[9/16] max-w-[280px] sm:max-w-[340px] mx-auto"><img src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800" className="w-full h-full object-cover" alt="Smart Page" /><div className="absolute top-10 right-4 z-20"><div className="bg-red-600 text-white px-3 py-1 rounded-lg shadow-2xl flex items-center gap-2 text-[9px] font-black animate-pulse"><Timer className="h-3 w-3" /> 02:45:00</div></div></Card></div>
          </div>
        </div>
      </section>

      {/* BI ENGINE */}
      <section id="bi-engine" className="py-16 bg-[#0a0a0a] text-white relative overflow-hidden px-4">
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16 space-y-3">
            <Badge className="bg-emerald-500 text-white border-none px-6 py-2 font-black uppercase text-[9px] tracking-widest rounded-full">System Intelligence</Badge>
            <h2 className="text-3xl sm:text-8xl font-black tracking-tighter leading-none">Your <span className="text-emerald-500">CEO Copilot.</span></h2>
            <p className="text-neutral-400 font-medium max-w-2xl mx-auto text-sm sm:text-xl leading-relaxed mt-4">10 लेयर्स वाला रीयल-टाइम बिज़नेस इंटेलिजेंस जो आपके हर एक पैसे का हिसाब रखता है।</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 max-w-7xl mx-auto">
             {BI_LEVELS.map((level, i) => (
               <Card key={i} className="bg-white/5 border-white/10 rounded-[2rem] p-4 sm:p-8 flex flex-col gap-4 hover:bg-white/10 transition-all group duration-500">
                  <div className={`h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center ${level.color}`}><level.icon className="h-6 w-6" /></div>
                  <div className="space-y-1"><h4 className="font-black text-[10px] sm:text-xs uppercase tracking-widest text-white">{level.title}</h4><p className="text-[9px] sm:text-[10px] text-neutral-400 leading-relaxed font-medium">{level.desc}</p></div>
               </Card>
             ))}
          </div>
          <div className="mt-16 text-center"><Button size="lg" className="h-14 sm:h-16 px-10 rounded-2xl font-black text-xs sm:text-sm gap-2 shadow-2xl shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 text-white" asChild><Link to="/signup">ACTIVATE INTELLIGENCE <ArrowRight className="h-4 w-4" /></Link></Button></div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 sm:py-24 bg-white overflow-hidden px-4">
        <div className="container mx-auto text-center">
          <Badge className="bg-primary/10 text-primary border-none px-6 py-2 mb-6 font-black uppercase text-[9px] tracking-widest rounded-full">Success Stories</Badge>
          <h2 className="text-3xl sm:text-6xl font-black tracking-tighter mb-12 sm:mb-16">Trusted by <span className="text-primary">Entrepreneurs.</span></h2>
          
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[ Autoplay({ delay: 3000 }) ]}
            className="w-full max-w-6xl mx-auto"
          >
            <CarouselContent className="-ml-2 sm:-ml-4">
              {(dynamicReviews?.length ? dynamicReviews : INDIAN_TESTIMONIALS).map((review, i) => (
                <CarouselItem key={i} className="pl-2 sm:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                  <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-sm border border-neutral-100 flex flex-col gap-6 text-left h-full group hover:shadow-2xl transition-all duration-500">
                    <div className="flex gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((_, j) => (
                        <Star key={j} className={cn("h-4 w-4", j < (review.rating || 5) ? "fill-current" : "text-neutral-200")} />
                      ))}
                    </div>
                    <p className="text-base sm:text-lg font-bold italic text-muted-foreground leading-relaxed flex-1">
                      "{review.comment}"
                    </p>
                    <div className="flex items-center gap-4 pt-4 border-t border-neutral-100">
                      <div className="h-12 w-12 rounded-full border-2 border-white shadow-lg overflow-hidden shrink-0 bg-neutral-100">
                        <img src={review.userPhoto || `https://picsum.photos/seed/${i}/100/100`} alt={review.userName} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-sm truncate">{review.userName}</p>
                        <p className="text-[9px] text-muted-foreground font-black uppercase truncate">{review.role || "Verified Client"}</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-neutral-50/50 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-3"><h2 className="text-2xl sm:text-5xl font-black">Help Center</h2></div>
          <Accordion type="single" collapsible className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-start">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-neutral-50 border border-neutral-100 rounded-xl sm:rounded-2xl px-5 sm:px-8 overflow-hidden transition-all hover:shadow-md">
                <AccordionTrigger className="font-bold text-sm sm:text-lg text-left hover:no-underline py-4 sm:py-6">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-xs sm:text-base pb-6">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 sm:py-40 bg-primary text-white relative overflow-hidden text-center px-4">
        <div className="absolute top-0 right-0 p-20 opacity-10 rotate-12"><QrCode className="h-96 w-96" /></div>
        <div className="container mx-auto relative z-10 max-w-4xl space-y-10 sm:space-y-12">
           <Badge className="bg-white/10 text-white border-white/20 px-4 sm:px-6 py-2 mb-4 font-black uppercase text-[8px] sm:text-[10px] tracking-widest rounded-full">NO CREDIT CARD • 14-DAY TRIAL • INSTANT SETUP</Badge>
           <h2 className="text-3xl sm:text-8xl font-black tracking-tighter leading-[1.0] mb-8">Ready to <span className="text-accent italic">Automate</span> Your Growth?</h2>
           <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <Button size="lg" className="h-16 sm:h-20 px-8 sm:px-16 rounded-2xl sm:rounded-[2rem] font-black text-base sm:text-xl shadow-2xl bg-white text-primary hover:bg-neutral-100 gap-3" asChild><Link to="/signup">START FREE TRIAL <Zap className="h-6 w-5 fill-current" /></Link></Button>
              <Button size="lg" variant="outline" className="h-16 sm:h-20 px-8 sm:px-16 rounded-2xl sm:rounded-[2rem] font-black text-base sm:text-xl border-2 sm:border-4 border-white/30 bg-transparent text-white hover:bg-white/15 hover:text-white hover:border-white/50 transition-all" asChild><Link to="/contact">BOOK EXPERT DEMO</Link></Button>
           </div>
           <p className="text-[10px] sm:text-sm font-bold opacity-60 uppercase tracking-[0.3em]">Join 5,000+ successful business owners today.</p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
