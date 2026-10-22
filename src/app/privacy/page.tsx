
"use client";

import { ShieldCheck, Lock, Eye, Database, Share2, Fingerprint, Activity, Zap, Mail, ShieldAlert } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

/**
 * Robust Privacy Policy for SaaS Grade Launch.
 */
export default function PrivacyPage() {
  const db = useFirestore();
  const siteConfigRef = useMemoFirebase(() => db ? doc(db, "config", "site") : null, [db]);
  const { data: config } = useDoc(siteConfigRef);

  const businessName = config?.businessName || "LinkQR AI";
  const legalEmail = config?.legalEmail || config?.supportEmail || "privacy@linkqr.in";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />

      <main className="flex-1 py-12 lg:py-20 px-4">
        <div className="container px-6 mx-auto max-w-4xl bg-white p-8 lg:p-20 rounded-[3rem] shadow-2xl border border-neutral-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-16 pb-10 border-b">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Privacy Protocol</h1>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Compliance Node v12.0 • Live Sync</p>
              </div>
            </div>
            <Badge variant="outline" className="h-8 px-5 border-emerald-200 text-emerald-600 bg-emerald-50 font-black text-[10px] uppercase tracking-widest rounded-xl">GDPR & DPDP Ready</Badge>
          </div>
          
          <div className="space-y-16 text-muted-foreground leading-relaxed">
            <section className="space-y-6">
              <div className="flex items-center gap-4 text-foreground">
                <ShieldAlert className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-black uppercase tracking-tight">1. Data Sovereignty</h2>
              </div>
              <p className="text-base font-medium">
                This platform is operated by <strong>{businessName}</strong>. We value your data sovereignty. We collect only the minimum necessary information to provide our smart redirection and business intelligence services. We do not sell your personal information to third-party data brokers.
              </p>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4 text-foreground">
                <Fingerprint className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-black uppercase tracking-tight">2. Behavioral Intelligence Nodes</h2>
              </div>
              <p className="text-base font-medium">When a user interacts with a LinkQR node, we process specific signals to provide you with BI level 1-10 analytics:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                 <div className="p-6 bg-neutral-50 rounded-2xl border space-y-3">
                    <div className="flex items-center gap-2 font-black text-xs text-primary uppercase"><Activity className="h-4 w-4" /> Device Signatures</div>
                    <p className="text-xs leading-relaxed font-medium">We identify device type and OS to optimize landing page rendering. This data is aggregated and anonymized.</p>
                 </div>
                 <div className="p-6 bg-neutral-50 rounded-2xl border space-y-3">
                    <div className="flex items-center gap-2 font-black text-xs text-primary uppercase"><Zap className="h-4 w-4" /> Fraud Shield</div>
                    <p className="text-xs leading-relaxed font-medium">Our AI analyzes IP patterns to filter out automated bot traffic, protecting your marketing budget and data integrity.</p>
                 </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4 text-foreground">
                <Database className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-black uppercase tracking-tight">3. Secure AI Processing</h2>
              </div>
              <p className="text-base font-medium">
                Your business inputs for **AI Magic Studio** are processed via Google Gemini secure API nodes. We operate under Google's enterprise data protection policy—your inputs are **not** used for training public models.
              </p>
            </section>

            <div className="pt-12 border-t border-dashed space-y-8">
              <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10 flex gap-4 items-start shadow-inner">
                 <ShieldCheck className="h-7 w-7 text-primary shrink-0 mt-0.5" />
                 <p className="text-sm font-bold text-primary leading-relaxed italic">
                    "Transparency is the foundation of digital trust. Our protocol ensures your brand identity and scanner data remain shielded."
                 </p>
              </div>
              <div className="text-center space-y-2">
                 <p className="text-sm font-black text-foreground">For compliance inquiries:</p>
                 <a to={`mailto:${legalEmail}`} className="inline-flex items-center gap-2 text-primary font-black hover:underline group">
                    <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" /> {legalEmail}
                 </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
