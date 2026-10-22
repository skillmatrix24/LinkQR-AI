
"use client";

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  MessageCircle, 
  Zap, 
  ShieldCheck, 
  Smartphone, 
  ArrowRight, 
  Play, 
  Star, 
  Layout, 
  Users, 
  Headphones,
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import LeadForm from "./LeadForm";

const BENEFITS = [
  { title: "Fast Setup", desc: "Start in 60 seconds", icon: Zap, color: "text-blue-500", bg: "bg-blue-50" },
  { title: "Secure", icon: ShieldCheck, desc: "Bank-level encryption", color: "text-emerald-500", bg: "bg-emerald-50" },
  { title: "Mobile Friendly", icon: Smartphone, desc: "Optimized for all screens", color: "text-purple-500", bg: "bg-purple-50" },
  { title: "Lifetime Support", icon: Headphones, desc: "We are here 24/7", color: "text-orange-500", bg: "bg-orange-50" },
];

const FEATURES = [
  { title: "Dynamic Redirection", desc: "Update your link without changing the QR code image.", icon: Layers },
  { title: "AI Visual Studio", desc: "Create stunning branded QR codes with our AI magic tool.", icon: Sparkles },
  { title: "Real-time Analytics", desc: "Track scans, devices, and locations as they happen.", icon: Layout },
  { title: "Bot Protection", desc: "Filter out fake scans with advanced bot shield technology.", icon: ShieldCheck },
];

const FAQS = [
  { q: "What is a Dynamic QR Code?", a: "Dynamic QRs use a redirect link, allowing you to change the target URL anytime without re-printing the QR image." },
  { q: "Can I use my own logo?", a: "Yes! Our AI Studio allows you to upload and position your brand logo inside any QR code." },
  { q: "Is there a limit on scans?", a: "Our premium plans offer unlimited scans to ensure your business never stops growing." },
  { q: "How long is the setup?", a: "You can generate and deploy your first Smart QR in less than a minute." },
  { q: "Do you offer GST invoices?", a: "Yes, all our INR payments are GST compliant and invoices are sent automatically." },
];

export default function PromotionalLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />

      {/* 1. Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] bg-primary/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] bg-accent/10 blur-[120px] rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="space-y-8 text-center lg:text-left"
          >
            <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 font-black uppercase text-[10px] tracking-widest rounded-full">
              Growth Accelerator v2.0
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]">
              Transform your <span className="text-primary">Business</span> with Smart AI QR Technology.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground font-medium max-w-xl mx-auto lg:mx-0">
              Create branded, trackable, and intelligent dynamic links in seconds. Join the future of physical-to-digital marketing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="h-16 px-10 rounded-2xl font-black text-base shadow-2xl shadow-primary/20" asChild>
                <Link to="#get-demo">Get Free Demo <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button variant="outline" size="lg" className="h-16 px-10 rounded-2xl font-black text-base border-2 gap-3" asChild>
                <a to="https://wa.me/919876543210?text=Hi, I want a free demo of LinkQR" target="_blank">
                  <MessageCircle className="h-6 w-6 text-emerald-500 fill-emerald-500" /> WhatsApp
                </a>
              </Button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="relative"
          >
            <div className="relative bg-white p-4 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-8 border-neutral-50">
               <img 
                src="https://images.unsplash.com/photo-1748609160056-7b95f30041f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200" 
                alt="Dashboard Preview" 
                className="rounded-[2rem] w-full h-auto shadow-sm"
               />
               <div className="absolute -bottom-6 -left-6 bg-primary text-white p-6 rounded-3xl shadow-2xl animate-bounce">
                  <Zap className="h-8 w-8" />
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Benefits Section */}
      <section className="py-24 bg-neutral-50/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {BENEFITS.map((b, i) => (
            <Card key={i} className="border-none shadow-xl rounded-[2.5rem] bg-white group hover:-translate-y-2 transition-all duration-500">
              <CardContent className="p-10 flex flex-col items-center text-center space-y-4">
                <div className={`h-16 w-16 rounded-2xl ${b.bg} ${b.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                   <b.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-black">{b.title}</h3>
                <p className="text-sm text-muted-foreground font-medium">{b.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. How It Works */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black">How It Works</h2>
            <p className="text-muted-foreground font-medium">Simple 4-step process to digital excellence.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { step: "01", title: "Contact", desc: "Request a demo via our form or WhatsApp.", icon: Headphones },
              { step: "02", title: "Demo", desc: "Experience our dashboard with an expert.", icon: Play },
              { step: "03", title: "Setup", desc: "We configure your brand nodes instantly.", icon: Wrench },
              { step: "04", title: "Success", desc: "Go live and track your growth.", icon: CheckCircle2 },
            ].map((item, i) => (
              <div key={i} className="relative p-10 bg-neutral-50 rounded-[3rem] border border-neutral-100 text-center">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-black shadow-lg">{item.step}</div>
                <item.icon className="h-10 w-10 text-primary mx-auto mb-6" />
                <h4 className="font-black text-lg mb-2">{item.title}</h4>
                <p className="text-xs text-muted-foreground font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section className="py-24 bg-neutral-50/30">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           <div className="space-y-8">
              <h2 className="text-3xl sm:text-5xl font-black leading-tight">Packed with <br /><span className="text-primary">Enterprise Features.</span></h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {FEATURES.map((f, i) => (
                   <div key={i} className="p-6 bg-white rounded-3xl border shadow-sm space-y-3">
                      <f.icon className="h-8 w-8 text-primary" />
                      <h4 className="font-bold text-lg">{f.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
           <div className="bg-neutral-900 rounded-[3rem] p-4 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1563089145-599997674d42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200" 
                alt="AI Studio Preview" 
                className="rounded-[2.5rem] w-full h-auto opacity-80"
              />
           </div>
        </div>
      </section>

      {/* 5. Testimonials */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
             <h2 className="text-3xl sm:text-5xl font-black">Loved by Businesses</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
               { name: "Rahul Singh", role: "Cafe Owner", text: "LinkQR changed how my customers order. My sales are up by 20%!" },
               { name: "Sita Sharma", role: "Real Estate", text: "Bulk generation saved me days of work. Highly recommended for agencies." },
               { name: "Vikram Malhotra", role: "Fitness Coach", text: "The AI design is incredible. My QRs actually look like my brand now." }
             ].map((t, i) => (
               <Card key={i} className="border-none shadow-xl bg-neutral-50 rounded-[2.5rem] p-10 flex flex-col gap-6">
                  <div className="flex gap-1 text-amber-400">
                    {[1,2,3,4,5].map(j => <Star key={j} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="text-lg font-medium italic text-muted-foreground">"{t.text}"</p>
                  <div className="flex items-center gap-4 border-t pt-6">
                     <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-black">
                        {t.name[0]}
                     </div>
                     <div>
                        <p className="font-black text-sm">{t.name}</p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">{t.role}</p>
                     </div>
                  </div>
               </Card>
             ))}
          </div>
        </div>
      </section>

      {/* 6. Lead Capture Form Section */}
      <section id="get-demo" className="py-24 bg-neutral-50/50 scroll-mt-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-[3rem] shadow-2xl border-none overflow-hidden grid grid-cols-1 lg:grid-cols-12">
             <div className="lg:col-span-5 bg-primary p-12 text-white flex flex-col justify-center space-y-6">
                <h3 className="text-3xl font-black leading-tight">Get Your Free Demo today.</h3>
                <p className="opacity-80 font-medium">See how LinkQR can double your customer engagement.</p>
                <div className="space-y-4 pt-8">
                   <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                      <span className="text-sm font-bold">No Credit Card Required</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                      <span className="text-sm font-bold">Setup in 60 Seconds</span>
                   </div>
                </div>
             </div>
             <div className="lg:col-span-7 p-10 sm:p-14">
                <LeadForm />
             </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
             <h2 className="text-3xl font-black">Common Questions</h2>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-neutral-50 border border-neutral-100 rounded-2xl px-6 overflow-hidden transition-all hover:shadow-md">
                <AccordionTrigger className="font-bold text-lg text-left hover:no-underline">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-base pb-6">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* 8. Final CTA */}
      <section className="py-24 bg-primary text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-10 rotate-12"><Sparkles className="h-64 w-64" /></div>
        <div className="container mx-auto px-6 text-center max-w-3xl relative z-10 space-y-10">
           <h2 className="text-4xl sm:text-6xl font-black leading-tight">Start Your Journey Today.</h2>
           <p className="text-lg sm:text-xl opacity-80 font-medium italic">Join 500+ businesses growing with smart intelligence.</p>
           <Button size="lg" className="h-16 px-12 rounded-2xl font-black text-lg bg-white text-primary hover:bg-neutral-100 shadow-2xl" asChild>
             <Link to="#get-demo">Get Free Demo <Zap className="ml-2 h-5 w-5 fill-current" /></Link>
           </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Wrench(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  )
}
