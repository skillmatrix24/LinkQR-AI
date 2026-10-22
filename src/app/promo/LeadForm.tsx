
"use client";

import React, { useState } from "react";
import { useFirestore } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Send, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LeadForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    business: ""
  });

  const db = useFirestore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple Validation
    if (!formData.name || !formData.mobile) {
      toast({ variant: "destructive", title: "Missing Info", description: "Name and Mobile are required." });
      return;
    }

    if (!/^\d{10}$/.test(formData.mobile)) {
      toast({ variant: "destructive", title: "Invalid Number", description: "Please enter a 10-digit mobile number." });
      return;
    }

    if (!db) return;

    setLoading(true);
    try {
      const leadId = crypto.randomUUID();
      const leadRef = doc(db, "leads", leadId);
      
      setDocumentNonBlocking(leadRef, {
        id: leadId,
        ...formData,
        source: "Landing Page",
        createdAt: serverTimestamp()
      }, { merge: true });

      setSuccess(true);
      toast({ title: "Lead Captured!", description: "We will contact you within 24 hours." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "System Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-20 text-center space-y-6 animate-in zoom-in-95 duration-500">
        <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black">Inquiry Received!</h2>
          <p className="text-muted-foreground font-medium">One of our experts will call you shortly.</p>
        </div>
        <Button onClick={() => setSuccess(false)} variant="outline" className="rounded-xl px-8 h-12 font-bold">Send Another Request</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-4">
        <div className="space-y-2.5">
          <Label className="font-bold ml-1">Full Name</Label>
          <Input 
            placeholder="e.g. John Doe" 
            required 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="h-14 rounded-2xl bg-neutral-50/50 border-neutral-200 focus:bg-white transition-all font-medium" 
          />
        </div>
        
        <div className="space-y-2.5">
          <Label className="font-bold ml-1">Mobile Number (10 digits)</Label>
          <Input 
            type="tel"
            placeholder="9876543210" 
            required 
            maxLength={10}
            value={formData.mobile}
            onChange={e => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')})}
            className="h-14 rounded-2xl bg-neutral-50/50 border-neutral-200 focus:bg-white transition-all font-mono text-lg" 
          />
        </div>

        <div className="space-y-2.5">
          <Label className="font-bold ml-1">Business Name (Optional)</Label>
          <Input 
            placeholder="e.g. Royal Cafe" 
            value={formData.business}
            onChange={e => setFormData({...formData, business: e.target.value})}
            className="h-14 rounded-2xl bg-neutral-50/50 border-neutral-200 focus:bg-white transition-all font-medium" 
          />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3 items-start">
         <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
         <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
           By submitting, you agree to be contacted for a free consultation. Your data is encrypted and secure.
         </p>
      </div>

      <Button 
        type="submit" 
        disabled={loading} 
        className="w-full h-16 rounded-2xl font-black text-lg shadow-2xl shadow-primary/20 gap-3 group"
      >
        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
        Get Free Demo
      </Button>
    </form>
  );
}
