
"use client";

import { Target, Zap, BrainCircuit, Sparkles, ShieldCheck, Rocket } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

/**
 * About Page - Updated for Enterprise positioning and dynamic sync.
 */
export default function AboutPage() {
  const db = useFirestore();
  const siteConfigRef = useMemoFirebase(() => db ? doc(db, "config", "site") : null, [db]);
  const { data: config } = useDoc(siteConfigRef);

  const businessName = config?.businessName || "LinkQR AI";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />

      <main className="flex-1">
        <section className="py-20 lg:py-32 bg-white">
          <div className="container px-6 mx-auto">
            <div className="max-w-4xl mx-auto text-center mb-20 space-y-6">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-6 py-2 uppercase tracking-[0.3em] text-[10px] font-black rounded-full">Our Core DNA</Badge>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-7xl mb-6">Beyond Redirection: <span className="text-primary">Intelligence.</span></h1>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium">
                LinkQR AI is the world's first "Privacy-First" Business Intelligence ecosystem built for the physical-to-digital bridge. Operated by <strong>{businessName}</strong>, we empower businesses with high-fidelity analytics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-32">
              <div className="space-y-8">
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">The Problem with <br /><span className="text-red-500 italic">Silent Data.</span></h2>
                <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                  Traditional QR codes are blind—they don't tell you the identity, intent, or integrity of the scanner. We solve this by injecting AI intelligence into every node.
                </p>
              </div>
              <div className="bg-neutral-50 p-10 rounded-[3rem] shadow-2xl border relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                    <BrainCircuit className="h-40 w-40 text-primary" />
                 </div>
                 <h3 className="text-2xl font-black mb-8 uppercase tracking-tight">Our 2026 Roadmap</h3>
                 <ul className="space-y-6">
                    <li className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0"><ShieldCheck className="h-4 w-4" /></div>
                      <div>
                        <p className="font-black text-sm uppercase">Global Shield Protocol</p>
                        <p className="text-xs text-muted-foreground">Eliminating 100% of bot activity from your datasets.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0"><Sparkles className="h-4 w-4" /></div>
                      <div>
                        <p className="font-black text-sm uppercase">Generative Aesthetics</p>
                        <p className="text-xs text-muted-foreground">AI that designs QRs based on brand psychology.</p>
                      </div>
                    </li>
                 </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
