"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Github, 
  Terminal, 
  UploadCloud, 
  Key, 
  AlertTriangle,
  Info,
  CheckCircle2,
  FileCode,
  Sparkles,
  ArrowRight,
  Cpu,
  Layout,
  ExternalLink,
  Laptop
} from "lucide-react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function MigrationPage() {
  const db = useFirestore();
  const siteConfigRef = useMemoFirebase(() => db ? doc(db, "config", "site") : null, [db]);
  const { data: config } = useDoc(siteConfigRef);

  const steps = [
    {
      title: "Step 1: Download Source Code",
      desc: "Studio बंद होने से पहले 'Download Zip' बटन (Studio UI के ऊपरी दाएं कोने में) का उपयोग करके अपना पूरा कोड अपने कंप्यूटर पर सेव करें।",
      icon: Download,
      action: "Click 'Download Zip' in Header"
    },
    {
      title: "Step 2: Setup GitHub Repository",
      desc: "एक नया GitHub रिपोजिटरी बनाएं और अपने कोड को वहां 'Push' करें। यह आपके प्रोजेक्ट का स्थायी और सुरक्षित बैकअप होगा।",
      icon: Github,
      action: "Create GitHub Repo"
    },
    {
      title: "Step 3: Connect App Hosting",
      desc: "Firebase Console में जाकर 'App Hosting' को सीधे अपने GitHub से लिंक करें। इससे भविष्य में ऑटो-डिप्लॉयमेंट चालू रहेगा।",
      icon: UploadCloud,
      action: "Link to App Hosting"
    },
    {
      title: "Step 4: Secure Your Secrets",
      desc: "सुनिश्चित करें कि आपकी Razorpay Keys और Gemini API Key 'Firebase Secrets Manager' में सुरक्षित रूप से सेट हैं।",
      icon: Key,
      action: "Manage Secrets"
    }
  ];

  const aiAlternatives = [
    { name: "Cursor IDE", desc: "Best AI Code Editor. यह बिल्कुल स्टूडियो जैसा अनुभव देता है जहाँ आप चैट करके कोड बदल सकते हैं।", link: "https://cursor.com" },
    { name: "Bolt.new", desc: "Browser-based AI builder. स्टूडियो की तरह ही ब्राउज़र में कोडिंग और डिप्लॉयमेंट के लिए बेहतरीन।", link: "https://bolt.new" },
    { name: "Lovable", desc: "Next-gen Full Stack AI tool. बहुत तेज़ और इंटेलिजेंट वेब ऐप बिल्डर।", link: "https://lovable.dev" }
  ];

  return (
    <div className="space-y-8 pb-32 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3 text-orange-600">
             <div className="bg-orange-100 p-2 rounded-xl"><AlertTriangle className="h-6 w-6" /></div>
             Project Migration Hub
          </h1>
          <p className="text-muted-foreground font-medium">Follow these steps to secure your business before March 27th.</p>
        </div>
        <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-600 font-bold px-4 py-1.5 rounded-full animate-pulse">
           MOVE NOW REQUIRED
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step, i) => (
          <Card key={i} className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem] hover:shadow-2xl transition-all group">
            <CardHeader className="pb-4">
              <div className="h-12 w-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <step.icon className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-bold">{step.title}</CardTitle>
              <CardDescription className="font-medium text-sm leading-relaxed">{step.desc}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
               <div className="p-4 bg-neutral-50 rounded-xl border border-dashed text-xs font-mono font-bold text-primary">
                  Status: {i === 0 ? "ACTION PENDING" : "WAITING FOR ZIP"}
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6 pt-10">
        <h2 className="text-2xl font-black flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-primary" /> Future AI Platforms (Where to code?)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aiAlternatives.map((tool, i) => (
            <Card key={i} className="border-none shadow-lg bg-primary/5 rounded-3xl overflow-hidden border-2 border-primary/10">
               <CardContent className="p-6 space-y-4">
                  <h4 className="font-black text-lg text-primary">{tool.name}</h4>
                  <p className="text-xs font-medium text-neutral-600 leading-relaxed">{tool.desc}</p>
                  <Button variant="link" className="p-0 h-auto font-black text-[10px] uppercase tracking-widest text-primary gap-1" asChild>
                    <a to={tool.link} target="_blank">Launch Platform <ExternalLink className="h-3 w-3" /></a>
                  </Button>
               </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-neutral-900 text-white rounded-[3rem] overflow-hidden relative">
         <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12"><Laptop className="h-48 w-48 text-accent" /></div>
         <CardHeader className="p-10 border-b border-white/5 text-center sm:text-left">
            <CardTitle className="text-2xl font-bold flex items-center justify-center sm:justify-start gap-3">
               <Laptop className="h-7 w-7 text-accent" /> Ready to go Local?
            </CardTitle>
            <CardDescription className="text-neutral-400 font-medium italic">स्टुडियो के बाद, आप अपने कंप्यूटर पर कोडिंग जारी रख सकते हैं।</CardDescription>
         </CardHeader>
         <CardContent className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[
                 { t: "Download Cursor", d: "यह दुनिया का सबसे अच्छा AI कोड एडिटर है। आज ही इंस्टॉल करें।" },
                 { t: "Setup VS Code", d: "प्रोफेशनल डेवलपर्स का पसंदीदा एडिटर। कोडिंग के लिए अनिवार्य।" },
                 { t: "Node.js & Firebase CLI", d: "प्रोजेक्ट को लोकल पर रन करने और डिप्लॉय करने के लिए ज़रूरी।" },
                 { t: "Cloud Shell Access", d: "अगर आप ऑनलाइन ही रहना चाहते हैं, तो Google Cloud Shell का इस्तेमाल करें।" }
               ].map((item, idx) => (
                 <div key={idx} className="flex items-start gap-4 group">
                    <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-accent shrink-0 mt-1"><CheckCircle2 className="h-4 w-4" /></div>
                    <div>
                       <h4 className="font-bold text-white group-hover:text-accent transition-colors">{item.t}</h4>
                       <p className="text-xs text-neutral-400 font-medium leading-relaxed">{item.d}</p>
                    </div>
                 </div>
               ))}
            </div>
            <div className="p-6 bg-accent/10 border border-accent/20 rounded-2xl flex gap-4">
               <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
               <p className="text-xs text-neutral-300 leading-relaxed italic">
                 आपका डेटाबेस (Firestore) और यूज़र्स (Auth) पूरी तरह सुरक्षित रहेंगे। केवल यह "ऑनलाइन एडिटर" बंद हो रहा है।
               </p>
            </div>
         </CardContent>
      </Card>
    </div>
  );
}
