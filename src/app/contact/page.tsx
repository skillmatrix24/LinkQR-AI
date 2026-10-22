
"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Loader2, 
  Mail, 
  MessageSquare, 
  MapPin, 
  Send, 
  CheckCircle2,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function ContactPage() {
  const db = useFirestore();
  const siteConfigRef = useMemoFirebase(() => db ? doc(db, "config", "site") : null, [db]);
  const { data: config } = useDoc(siteConfigRef);

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const supportEmail = config?.supportEmail || "support@linkqr.in";
  const businessName = config?.businessName || "LinkQR AI";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast({
        title: "Message Dispatched!",
        description: "Your inquiry has been received. Our team will contact you within 24 hours.",
      });
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="flex-1 py-12 lg:py-24">
        <div className="container px-6 mx-auto max-w-6xl">
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-foreground">Get in <span className="text-primary">Touch</span></h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
              Have questions for <strong>{businessName}</strong>? Our team of experts is ready to help you scale.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-1 space-y-6">
              <div className="p-8 rounded-[2rem] bg-white border border-neutral-100 shadow-sm space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Support</p>
                    <p className="font-bold text-foreground truncate">{supportEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Company</p>
                    <p className="font-bold text-foreground text-sm">{businessName}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary to-accent"></div>
                <CardContent className="p-8 lg:p-12">
                  {submitted ? (
                    <div className="py-20 text-center space-y-6 animate-in zoom-in-95 duration-500">
                      <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
                        <CheckCircle2 className="h-10 w-10" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-3xl font-black">Message Received!</h2>
                        <p className="text-muted-foreground font-medium">We'll be in touch very soon.</p>
                      </div>
                      <Button onClick={() => setSubmitted(false)} variant="outline" className="rounded-xl px-8 h-12 font-bold">Send Another Message</Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="font-bold ml-1">Full Name</Label>
                          <Input placeholder="John Doe" required className="h-12 rounded-xl bg-neutral-50/50 border-neutral-200 focus:bg-white transition-all" />
                        </div>
                        <div className="space-y-3">
                          <Label className="font-bold ml-1">Work Email</Label>
                          <Input type="email" placeholder="john@company.com" required className="h-12 rounded-xl bg-neutral-50/50 border-neutral-200 focus:bg-white transition-all" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="font-bold ml-1">Subject</Label>
                        <Input placeholder="Inquiry about Enterprise Pricing" required className="h-12 rounded-xl bg-neutral-50/50 border-neutral-200 focus:bg-white transition-all" />
                      </div>

                      <div className="space-y-3">
                        <Label className="font-bold ml-1">Your Message</Label>
                        <Textarea placeholder="Tell us how we can help your business..." className="min-h-[160px] rounded-2xl bg-neutral-50/50 border-neutral-200 focus:bg-white transition-all resize-none" required />
                      </div>

                      <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl font-black text-base shadow-xl shadow-primary/20 gap-3 group">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        Dispatch Inquiry
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
