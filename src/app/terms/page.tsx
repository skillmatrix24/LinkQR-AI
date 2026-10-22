
"use client";

import { FileText, Scale, CreditCard, AlertTriangle, CheckCircle2, ShieldAlert, Zap, Layers, ShieldCheck, Mail, Gavel, Power } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

/**
 * Comprehensive SaaS Terms of Service.
 */
export default function TermsPage() {
  const db = useFirestore();
  const siteConfigRef = useMemoFirebase(() => db ? doc(db, "config", "site") : null, [db]);
  const { data: config } = useDoc(siteConfigRef);

  const businessName = config?.businessName || "LinkQR AI";
  const legalEmail = config?.legalEmail || config?.supportEmail || "legal@linkqr.in";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />

      <main className="flex-1 py-12 lg:py-20 px-4">
        <div className="container px-6 mx-auto max-w-4xl bg-white p-8 lg:p-20 rounded-[3rem] shadow-2xl border border-neutral-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-16 pb-10 border-b">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-inner">
                <Gavel className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Terms of Use</h1>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Master Service Agreement v12.0</p>
              </div>
            </div>
            <Badge className="bg-neutral-900 text-white font-black text-[10px] uppercase tracking-widest h-8 px-5 rounded-xl border-none shadow-lg">Binding Agreement</Badge>
          </div>
          
          <div className="space-y-16 text-muted-foreground leading-relaxed">
            <section className="space-y-6">
              <div className="flex items-center gap-4 text-foreground">
                <Scale className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-black uppercase tracking-tight">1. Services Provided</h2>
              </div>
              <p className="text-base font-medium">
                <strong>{businessName}</strong> provides a digital ecosystem for generating dynamic QR codes, landing pages, and business intelligence. By registering an account, you agree to comply with our acceptable use policy. You are solely responsible for the content redirected to by your Smart Links.
              </p>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4 text-foreground">
                <Power className="h-6 w-6 text-red-500" />
                <h2 className="text-2xl font-black uppercase tracking-tight text-red-600">2. Link Expiry & Deactivation</h2>
              </div>
              <p className="text-base font-medium">
                Our infrastructure requires active synchronization nodes. If your subscription expires:
              </p>
              <div className="p-6 bg-red-50 rounded-2xl border border-red-100 space-y-4">
                 <div className="flex items-start gap-3">
                    <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-red-900 leading-relaxed">
                       All dynamic links and Smart Pages will be automatically **Blocked/Paused**. We are not liable for any business loss or damage resulting from link deactivation due to non-payment.
                    </p>
                 </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4 text-foreground">
                <CreditCard className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-black uppercase tracking-tight">3. Payments & GST</h2>
              </div>
              <p className="text-base font-medium">Payments are handled securely via Razorpay. We offer a 7-day refund policy, applicable only if your node consumption is below 5% of your plan limit. Tax invoices with GST will be automatically generated and sent for all Indian transactions.</p>
            </section>

            <div className="pt-12 border-t border-dashed space-y-8">
              <div className="p-8 bg-neutral-900 text-white rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12"><ShieldCheck className="h-32 w-32 text-accent" /></div>
                 <div className="flex items-center gap-4 mb-4 relative z-10">
                    <CheckCircle2 className="h-6 w-6 text-accent" />
                    <h4 className="font-black text-lg uppercase tracking-tight">Legal Lock</h4>
                 </div>
                 <p className="text-xs font-medium text-neutral-400 leading-relaxed italic relative z-10">
                    "Continued use of LinkQR AI constitutes acceptance of these terms and any future modifications published here."
                 </p>
              </div>
              <div className="text-center space-y-2">
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Compliance Contact:</p>
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
