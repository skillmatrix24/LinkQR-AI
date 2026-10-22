"use client";

import React from 'react';
import { Link } from "react-router-dom";
import { 
  BrainCircuit, 
  Sparkles, 
  Layers, 
  BarChart3, 
  ShieldCheck, 
  Rocket, 
  Trophy, 
  BadgeIndianRupee, 
  Target, 
  Activity, 
  Zap, 
  Smartphone, 
  Globe, 
  Palette, 
  Table as TableIcon,
  SearchCode,
  ArrowRight,
  Layout,
  Timer,
  UserCheck,
  Check,
  Mail,
  Bot,
  Lock,
  Server,
  ShieldAlert,
  Fingerprint,
  UserCircle,
  Contact2,
  Users
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const BI_LEVELS_DETAILED = [
  { 
    level: "Level 1-2", 
    title: "Health & Velocity Index", 
    desc: "एक 0-100 का रीयल-टाइम स्कोर जो आपके बिज़नेस की वर्तमान स्थिति और भविष्य के स्कैन्स का सटीक अनुमान बताता है।", 
    icon: BrainCircuit,
    color: "text-blue-500",
    bg: "bg-blue-50"
  },
  { 
    level: "Level 3-5", 
    title: "AI Bot Shield Defense", 
    desc: "हमारा AI इंजन फर्जी स्कैन्स और ऑटोमेटेड बॉट्स को रोकता है, ताकि आपको हमेशा 100% शुद्ध (Human Only) डेटा मिले।", 
    icon: ShieldCheck,
    color: "text-orange-500",
    bg: "bg-orange-50"
  },
  { 
    level: "Level 6", 
    title: "Revenue Forecasting", 
    desc: "स्कैन्स को पैसों में बदलिए। AI आपके कन्वर्जन डेटा के आधार पर अगले 30 दिनों की संभावित कमाई (Revenue) प्रेडिक्ट करता है।", 
    icon: BadgeIndianRupee,
    color: "text-emerald-500",
    bg: "bg-emerald-50"
  },
  { 
    level: "Level 7-8", 
    title: "Marketing Strategy AI", 
    desc: "AI आपको हर सुबह 'Hinglish' में रणनीतिक सुझाव देता है कि आपको सेल्स बढ़ाने के लिए आज क्या ऑफर निकालना चाहिए।", 
    icon: Target,
    color: "text-amber-500",
    bg: "bg-amber-50"
  },
  { 
    level: "Level 9-10", 
    title: "Executive CEO Dashboard", 
    desc: "पूरे बिज़नेस का 'Master View'। ग्राहकों को VIP और Inactive ग्रुप्स में बाँटें और अपनी पूरी डिजिटल साम्राज्य को यहाँ से कंट्रोल करें।", 
    icon: Trophy,
    color: "text-purple-500",
    bg: "bg-purple-50"
  }
];

const CONVERSION_TOOLS = [
  { title: "Modular Page Builder", desc: "Hero, Benefits, FAQ ब्लॉक्स को अपनी मर्ज़ी से जोड़ें और ऊपर-नीचे करें।", icon: Layout },
  { title: "Memory Logic AI", desc: "AI के साथ डिज़ाइन बदलते समय अपने मैन्युअल चेंजेस को सुरक्षित रखें।", icon: Fingerprint },
  { title: "FOMO Countdown Timer", desc: "ऑफर खत्म होने का टाइमर लगाकर ग्राहकों में 'Urgency' पैदा करें।", icon: Timer },
  { title: "Verified Lead CRM", desc: "पूछताछ करने वालों को रीयल-टाइम में मार्क करें और व्हाट्सएप पर जुड़ें।", icon: UserCheck }
];

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />

      <main className="flex-1 py-16 lg:py-32 px-4">
        <div className="max-w-7xl mx-auto space-y-32">
          
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-6 py-2 uppercase tracking-[0.4em] text-[10px] font-black rounded-full">Evolutionary SaaS Node</Badge>
            <h1 className="text-4xl lg:text-7xl font-extrabold tracking-tight leading-tight">Beyond QRs: A Full <span className="text-primary">Intelligence</span> Suite.</h1>
            <p className="text-lg sm:text-xl text-muted-foreground font-medium leading-relaxed">
              LinkQR AI केवल कोड्स नहीं, बल्कि एक भविष्य के बिज़नेस के लिए ज़रूरी सभी टूल्स का संगम है। हम भारत के सबसे आधुनिक **Multi-Product** ईकोसिस्टम का निर्माण कर रहे हैं।
            </p>
            <div className="flex flex-wrap justify-center gap-4">
               <Button size="lg" className="h-16 px-10 rounded-2xl font-bold shadow-xl shadow-primary/20" asChild><Link to="/signup">Start Free Journey <ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
               <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl font-bold border-2" asChild><Link to="/contact">Talk to Expert</Link></Button>
            </div>
          </div>

          {/* PRODUCT 1: DIGITAL ID CARDS */}
          <section id="digital-id" className="py-20 sm:py-32 bg-neutral-900 text-white rounded-[4rem] p-8 sm:p-20 relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 p-20 opacity-5 rotate-12"><UserCircle className="h-96 w-96 text-primary" /></div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                <div className="space-y-8">
                   <Badge className="bg-accent text-white border-none px-6 py-2 rounded-full font-black text-[10px] tracking-widest uppercase">New Product Line</Badge>
                   <h2 className="text-4xl sm:text-6xl font-black leading-tight">Digital <br /><span className="text-accent italic">Business Cards.</span></h2>
                   <p className="text-xl text-neutral-400 font-medium leading-relaxed">
                      कागज़ के कार्ड्स अब बीते ज़माने की बात हैं। अपना प्रीमियम **Digital ID Card** बनाइये जो एक क्लिक में कस्टमर के फ़ोन में आपका कॉन्टैक्ट सेव कर दे। 
                   </p>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {[
                        { t: "VCF Instant Sync", d: "Save to Contacts बटन के साथ रीयल-टाइम सिंक।", i: Contact2 },
                        { t: "AI Bio Writer", d: "Professional 'About Me' ऑटो-जेनरेट करें।", i: Sparkles },
                        { t: "Identity Analytics", d: "देखें कितने लोगों ने आपका कार्ड सेव किया।", i: BarChart3 },
                        { t: "Brand Portal", d: "पूरी टीम के लिए एक जैसा कार्ड डिज़ाइन करें।", i: Users }
                      ].map((f, i) => (
                        <div key={i} className="flex gap-4">
                           <div className="h-10 w-10 rounded-xl bg-white/10 shadow-sm flex items-center justify-center text-accent shrink-0"><f.i className="h-5 w-5" /></div>
                           <div>
                              <h4 className="font-bold text-white text-sm uppercase tracking-tight">{f.t}</h4>
                              <p className="text-[10px] text-neutral-500 font-medium leading-tight">{f.d}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                   <div className="pt-4">
                      <Button size="lg" className="h-14 px-10 rounded-2xl font-black text-sm gap-3 bg-accent hover:bg-accent/90 shadow-2xl shadow-accent/20" asChild>
                         <Link to="/dashboard/vcards">Setup My Digital ID <ArrowRight className="h-5 w-5" /></Link>
                      </Button>
                   </div>
                </div>
                <div className="relative flex justify-center">
                   <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                    <Card className="relative border-8 border-white/5 bg-white shadow-2xl rounded-[3.5rem] overflow-hidden aspect-[9/16] max-w-[280px] sm:max-w-[320px]">
                       <div className="p-8 flex flex-col items-center text-center space-y-6">
                          <div className="h-32 w-32 rounded-full border-4 border-primary p-1 shadow-xl">
                             <img src="https://picsum.photos/seed/user/200/200" className="h-full w-full rounded-full object-cover" alt="User" />
                          </div>
                          <div className="space-y-2">
                             <h3 className="text-2xl font-black text-black">Rajesh Kumar</h3>
                             <p className="text-xs font-bold text-primary uppercase tracking-widest">Growth Strategist</p>
                          </div>
                          <Button className="w-full h-12 rounded-xl font-black text-[10px] uppercase shadow-lg">Save to Contacts</Button>
                       </div>
                    </Card>
                   </motion.div>
                </div>
             </div>
          </section>

          {/* PRODUCT 2: SMART PAGES */}
          <section id="smart-pages" className="py-20 sm:py-32 bg-primary/5 rounded-[4rem] p-8 sm:p-20 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-20 opacity-5 rotate-12"><Smartphone className="h-96 w-96 text-primary" /></div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                <div className="space-y-8">
                   <Badge className="bg-primary text-white border-none px-6 py-2 rounded-full font-black text-[10px] tracking-widest uppercase">Micro-Landing Pages v2.0</Badge>
                   <h2 className="text-4xl sm:text-6xl font-black leading-tight">Modular <br /><span className="text-primary">Studio Builder.</span></h2>
                   <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                      बिना किसी कोडिंग के अपना हाई-कन्वर्जन मोबाइल सेल्स फनल बनाएं। हमारा नया **3-Column Studio** आपको रीयल-टाइम प्रिव्यू और AI टूल्स के साथ पूर्ण नियंत्रण देता है।
                   </p>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {CONVERSION_TOOLS.map((f, i) => (
                        <div key={i} className="flex gap-4">
                           <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary shrink-0"><f.icon className="h-5 w-5" /></div>
                           <div>
                              <h4 className="font-bold text-foreground text-sm uppercase tracking-tight">{f.title}</h4>
                              <p className="text-[10px] text-muted-foreground font-medium leading-tight">{f.desc}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                   <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Button size="lg" className="h-14 px-10 rounded-2xl font-black text-sm gap-3 shadow-xl" asChild>
                         <Link to="/dashboard/qrs/microsite">Launch Builder Studio <ArrowRight className="h-4 w-4" /></Link>
                      </Button>
                      <Button size="lg" variant="ghost" className="h-14 px-10 rounded-2xl font-black text-sm gap-3 bg-white" asChild>
                         <Link to="/signup">Create Free Account</Link>
                      </Button>
                   </div>
                </div>
                <div className="relative">
                   <div className="bg-neutral-900 rounded-[3rem] p-4 shadow-2xl relative overflow-hidden group">
                      <img src="https://images.unsplash.com/photo-1748609160056-7b95f30041f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800" className="rounded-[2.5rem] w-full h-auto opacity-90 transition-transform group-hover:scale-105 duration-700" alt="Smart Studio Preview" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                         <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-4">
                            <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                            <p className="font-black text-xs uppercase tracking-widest text-primary">AI Magic Build Active</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </section>

          {/* WHITE-LABEL INFRASTRUCTURE */}
          <section id="white-label" className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <div className="order-last lg:order-first relative">
                <Card className="border-none shadow-2xl bg-neutral-900 text-white rounded-[3rem] p-10 space-y-8 overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-10 opacity-5"><Globe className="h-64 w-64 text-primary" /></div>
                   <div className="space-y-6 relative z-10">
                      <div className="p-5 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-black uppercase text-emerald-400">DNS Node Verified</span>
                         </div>
                         <Badge variant="outline" className="text-white border-white/20">SSL ACTIVE</Badge>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Branded Redirection</p>
                         <p className="text-2xl font-black font-mono text-primary truncate">links.yourbrand.com/summer-sale</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-[8px] font-bold text-neutral-500 uppercase">Trust Index</p>
                            <p className="text-2xl font-black">99.9%</p>
                         </div>
                         <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-[8px] font-bold text-neutral-500 uppercase">CTR Lift</p>
                            <p className="text-2xl font-black text-emerald-400">+34%</p>
                         </div>
                      </div>
                   </div>
                </Card>
             </div>
             <div className="space-y-8">
                <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-4 py-1.5 font-bold uppercase text-[10px]">Branded Infrastructure</Badge>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">Your Brand. <br /><span className="text-primary italic">Our Intelligence.</span></h2>
                <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                   "linkqr.in" को पूरी तरह हटा दें। अपने खुद के डोमेन (links.yourbrand.com) का उपयोग करें। हमारा सिस्टम रियल-टाइम **DNS CNAME वेरिफिकेशन** के साथ आपके डोमेन को सुरक्षित और लाइव करता है।
                </p>
                <div className="space-y-4">
                   {[
                     { t: "Real DNS Lookup", d: "असली CNAME रिकॉर्ड की जांच और रीयल-टाइम एक्टिवेशन।", i: Server },
                     { t: "Automated SSL", d: "आपके हर कस्टम डोमेन के लिए फ्री SSL सर्टिफिकेट हमारी तरफ से।", i: Lock },
                     { t: "Trust Protocol", d: "ब्रांडेड लिंक्स से क्लिक्स और प्रोफेशनल इमेज बढ़ती है।", i: ShieldCheck }
                   ].map((item, i) => (
                     <div key={i} className="flex gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-sm"><item.i className="h-5 w-5" /></div>
                        <div>
                           <h4 className="font-bold text-foreground text-sm uppercase tracking-tight">{item.t}</h4>
                           <p className="text-xs text-muted-foreground font-medium">{item.d}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </section>

          <section id="ai-bi" className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b pb-12">
               <div className="space-y-4">
                  <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight flex items-center gap-4">
                     <BrainCircuit className="h-8 w-8 text-primary" /> 10 Levels of Intelligence
                  </h2>
                  <p className="text-muted-foreground text-lg font-medium max-w-2xl">हमारा 10-लेवल BI इंजन डेटा को "निर्णय" (Decisions) में बदलता है।</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {BI_LEVELS_DETAILED.map((item, i) => (
                 <Card key={i} className="border-none shadow-xl bg-white rounded-[2.5rem] p-10 flex flex-col gap-6 group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className={`h-16 w-16 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                       <item.icon className="h-8 w-8" />
                    </div>
                    <div className="space-y-3">
                       <span className="text-[10px] font-bold uppercase text-primary tracking-[0.3em]">{item.level}</span>
                       <h3 className="text-2xl font-bold tracking-tight">{item.title}</h3>
                       <p className="text-sm text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
                    </div>
                 </Card>
               ))}
            </div>
          </section>

          <section id="automation" className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <div className="space-y-8">
                <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 px-4 py-1.5 font-bold uppercase text-[10px]">Workflow Automation</Badge>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">मार्केटिंग ऑटोमेशन <br /><span className="text-emerald-600 font-bold">24/7 चालू रहेगा।</span></h2>
                <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                   जब आप सो रहे होंगे, तब भी आपका स्मार्ट पेज ग्राहकों को जानकारी दे रहा होगा और लीड्स कैप्चर कर रहा होगा। रीयल-टाइम ईमेल अलर्ट्स और बाहरी सिंक के साथ एक भी मौका नहीं छूटेगा।
                </p>
                <div className="grid grid-cols-1 gap-4">
                   {[
                     { t: "Instant Email Alerts", d: "नयी लीड आते ही सीधे आपके इनबॉक्स में विस्तृत रिपोर्ट।", i: Mail },
                     { t: "Google Sheets Sync", d: "लीड्स को सीधे अपनी एक्सेल शीट में रीयल-टाइम अपडेट करें।", i: TableIcon },
                     { t: "Zapier / Webhook Hub", d: "1,000+ ऐप्स के साथ जुड़ें और मार्केटिंग ऑटोमेट करें।", i: Zap }
                   ].map((item, i) => (
                     <div key={i} className="flex gap-4 p-5 bg-neutral-50 rounded-2xl border border-neutral-100">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg"><item.i className="h-5 w-5" /></div>
                        <div>
                           <h4 className="font-bold text-foreground text-sm uppercase tracking-tight">{item.t}</h4>
                           <p className="text-xs text-muted-foreground font-medium">{item.d}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             <Card className="border-8 border-white shadow-2xl rounded-[3rem] overflow-hidden bg-neutral-900 p-10 space-y-8">
                <div className="flex items-center justify-between">
                   <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white"><Zap className="h-6 w-6" /></div>
                   <Badge className="bg-emerald-500 text-white font-bold text-[9px] uppercase tracking-widest px-3 py-1">Flow: ACTIVE</Badge>
                </div>
                <div className="space-y-6">
                   <div className="flex items-center gap-4 text-white/40">
                      <Smartphone className="h-6 w-6" />
                      <ArrowRight className="h-4 w-4" />
                      <Mail className="h-6 w-6 text-accent" />
                   </div>
                </div>
                <p className="text-xs text-neutral-400 font-medium italic text-center">"Zero delay between inquiry and notification."</p>
             </Card>
          </section>

          <section className="py-24 rounded-[4rem] bg-primary text-white text-center relative overflow-hidden shadow-2xl border-4 border-white/10">
             <div className="absolute top-0 right-0 p-20 opacity-10 -rotate-12"><Zap className="h-64 w-64" /></div>
             <div className="relative z-10 max-w-3xl mx-auto space-y-12">
                <h2 className="text-4xl sm:text-7xl font-extrabold tracking-tight leading-tight">Ready to unlock <br /><span className="text-accent">Enterprise Power?</span></h2>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                   <Button size="lg" className="h-16 px-12 rounded-2xl font-extrabold text-lg bg-white text-primary hover:bg-neutral-100 shadow-2xl" asChild>
                      <Link to="/signup">Start Free Trial Now</Link>
                   </Button>
                   <Button size="lg" variant="outline" className="h-16 px-12 rounded-2xl font-extrabold text-lg border-2 border-white/20 text-white hover:bg-white/10" asChild>
                      <Link to="/contact">Book Demo</Link>
                   </Button>
                </div>
             </div>
          </section>

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
