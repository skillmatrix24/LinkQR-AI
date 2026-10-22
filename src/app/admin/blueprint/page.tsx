"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Clock, 
  Map, 
  Zap, 
  ShieldCheck, 
  CreditCard, 
  LayoutDashboard, 
  QrCode, 
  Sparkles, 
  Smartphone, 
  Layers, 
  ShieldAlert, 
  FileSpreadsheet, 
  Percent, 
  Globe, 
  Search, 
  SearchCode,
  MessageSquare,
  BarChart3,
  Bot,
  Server,
  Cpu,
  BrainCircuit,
  Target,
  Network,
  Palette,
  Layout,
  MousePointer2,
  Users,
  LineChart,
  Shield,
  MessageCircle,
  UserCircle,
  MousePointerClick
} from "lucide-react";

export default function BlueprintPage() {
  const roadmap = [
    {
      title: "Digital ID Card Ecosystem",
      status: "COMPLETED",
      icon: UserCircle,
      items: [
        "Advanced Studio Editor (3-Column Builder)",
        "Multiple Phone Numbers Node (Primary, Secondary, WhatsApp Only)",
        "Mobile Sticky Action Bar (Call, WhatsApp, Save Contact)",
        "Standalone vCard Creator Wizard",
        "Save-to-Contacts (.vcf) Instant Sync",
        "Professional Bio AI Wizard (Gemini 1.5 Flash)",
        "Premium Identity Aesthetics & Glassmorphism",
        "Digital ID Analytics Node (Views vs Saves)",
        "Email Signature & NFC Bridge Infrastructure",
        "Lead Ingress & Excel Export Utility"
      ]
    },
    {
      title: "AI Smart Landing Pages",
      status: "COMPLETED",
      icon: Smartphone,
      items: [
        "Modular 'Add Block' Architecture (Unlimited Repeats)",
        "3-Column Studio Builder UI (Navigator, Stage, Inspector)",
        "Item & Block Reordering Logic (UI Persistence)",
        "Dynamic OG Preview / Social Sharing Metadata Hub",
        "Integrated Sticky Header & Floating Action Buttons",
        "Automated Lead Capture System & Verified CRM",
        "Direct UPI Payment Integration & Sales Ledger",
        "FOMO Countdown Timer Block (Conversion Optimizer)",
        "AI Magic Build: Full-Page Goal-Based Generator",
        "Memory Logic: Option to protect design during AI Re-forge"
      ]
    },
    {
      title: "AI Business Intelligence (BI) Engine",
      status: "COMPLETED",
      icon: BrainCircuit,
      items: [
        "Conversion Tracking Node (8 Canonical Event Types)",
        "Time-Sensitive Conversion Rate (Today, 7D, 30D Metrics)",
        "Social Channel Breakdown & Engagement Analysis",
        "L1-2: AI Business Health Score (0-100 Index)",
        "L3-4: Predictive Scan & Revenue Analytics",
        "L5: AI Bot Shield & Fraud Defense Shield",
        "L7-8: Marketing Suggestion Engine & Growth Copilot",
        "L9: Audience Segmentation (VIP/New/Inactive)",
        "L10: Master Executive CEO Dashboard"
      ]
    },
    {
      title: "Advanced AI Magic Studio Suite",
      status: "COMPLETED",
      icon: Sparkles,
      items: [
        "Module 1: AI Brand Identity Creator (Logo, Colors, Motto)",
        "Module 2: AI Campaign Agent (7-Day Strategy, Social Kit)",
        "Module 3: AI CTA Generator (Smart Engagement Captions)",
        "Module 4: AI Quality Optimizer (Contrast & Readability)",
        "Module 5: AI Micro-Landing Page Builder (Smart Pages)",
        "AI Copywriter: Context-Aware Adaptive Block Refinement",
        "Imagen 3.0 Generative Visual Assets (Logo & Icons)"
      ]
    },
    {
      title: "Platform Infrastructure & Core",
      status: "COMPLETED",
      icon: QrCode,
      items: [
        "Privacy-Minimal Non-blocking Analytics Service",
        "Hardened Firestore Security (Field Whitelisting & Path Validation)",
        "Dynamic QR Code Generation (Dynamic URLs)",
        "AI ChatBot Assistant: Hinglish Conversational Support",
        "Short-link Redirection System (/r/[code])",
        "HD Poster System with Stylish Branding",
        "Global Expiry Protection (Direct Link Blocking)",
        "Intelligent 7-Day Renewal Alerts (Dashboard Banner)",
        "Global Storage Guard: Auto-purge Expired Assets",
        "Bilingual CMS Hub: English & Hindi Storytelling"
      ]
    },
    {
      title: "Enterprise SaaS & Domains",
      status: "COMPLETED",
      icon: ShieldCheck,
      items: [
        "Custom CNAME Domains (White-label Redirection)",
        "Real DNS Verification Node (dns.resolveCname)",
        "Automated SSL Provisioning (Cloud-edge Acceptance)",
        "Google Indexing Suite (Manual & Auto Ping)",
        "Dynamic sitemap.xml & Robots.txt Generation",
        "Razorpay Global Payment Integration (GST Ready)",
        "Comprehensive User Subscription Management Hub"
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-20 px-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          <Map className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black">Project Blueprint</h1>
          <p className="text-muted-foreground font-medium">Tracking our journey from MVP to Enterprise SaaS.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roadmap.map((section, idx) => (
          <Card key={idx} className="border-none shadow-xl bg-white overflow-hidden rounded-[1.5rem] transition-all hover:shadow-2xl hover:-translate-y-1">
            <CardHeader className="pb-4 border-b bg-neutral-50/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-black">{section.title}</CardTitle>
                </div>
                <Badge variant={section.status === 'COMPLETED' ? 'default' : 'secondary'} className={
                  section.status === 'COMPLETED' ? "bg-emerald-500 hover:bg-emerald-600 font-black text-white" : 
                  section.status === 'ACTIVE' ? "bg-blue-600 hover:bg-blue-700 font-black text-white" :
                  section.status === 'IN_PROGRESS' ? "bg-amber-500 hover:bg-amber-600 font-black text-white" : "font-black"
                }>
                  {section.status.replace('_', ' ')}
                </Badge>
              </div>
              <CardDescription className="font-medium text-xs">Strategic capabilities deployed.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    {(section.status === 'COMPLETED' || section.status === 'ACTIVE') ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <span className={(section.status === 'COMPLETED' || section.status === 'ACTIVE') ? 'text-foreground font-medium' : 'text-muted-foreground italic'}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-primary text-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
           <Zap className="h-40 w-40" />
        </div>
        <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-3 text-center md:text-left">
            <h3 className="text-3xl font-black">Current Milestone: Production Stable</h3>
            <p className="opacity-90 max-w-2xl text-lg">
              LinkQR AI is now a **Professional Business Operating System**. All core nodes for conversion tracking, identity networking, and BI intelligence are verified.
            </p>
          </div>
          <div className="flex gap-8 bg-white/10 p-6 rounded-[2rem] backdrop-blur-md border border-white/10">
             <div className="text-center">
                <p className="text-4xl font-black">182</p>
                <p className="text-[10px] uppercase font-black tracking-widest opacity-70">Features Live</p>
             </div>
             <div className="h-12 w-px bg-white/20"></div>
             <div className="text-center">
                <p className="text-4xl font-black">02</p>
                <p className="text-[10px] uppercase font-black tracking-widest opacity-70">Core Products</p>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
