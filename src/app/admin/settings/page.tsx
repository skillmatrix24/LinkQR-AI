"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Globe, 
  Mail, 
  Construction, 
  CreditCard, 
  Lock, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Trash2, 
  UploadCloud, 
  ShieldAlert, 
  ExternalLink, 
  Smartphone, 
  Monitor, 
  CheckCircle2, 
  SearchCode,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  QrCode,
  Type,
  Zap,
  Info,
  Building2
} from "lucide-react";
import { cleanupExpiredStorageAction, getMaintenanceStatsAction } from "@/app/actions/maintenance";

export default function SiteSettings() {
  const db = useFirestore();
  const { toast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  
  const siteConfigRef = useMemoFirebase(() => db ? doc(db, "config", "site") : null, [db]);
  const { data: config, isLoading } = useDoc(siteConfigRef);
  
  const [isPurging, setIsPurging] = useState(false);
  const [maintenanceCount, setMaintenanceCount] = useState(0);

  const [formData, setFormData] = useState<any>({
    businessName: "LinkQR AI",
    legalEmail: "legal@linkqr.in",
    heroTitle: "",
    heroSubtitle: "",
    supportEmail: "",
    maintenanceMode: false,
    razorpayKeyId: "",
    razorpayKeySecret: "",
    razorpayWebhookSecret: "",
    gmailUser: "",
    gmailAppPassword: "",
    publicBaseUrl: "https://linkqr.in",
    logoUrl: "",
    faviconUrl: "",
    logoHeight: 32,
    logoHeightMobile: 28,
    seoKeywords: "dynamic qr code, qr code generator, trackable qr codes, ai qr code, bulk qr generator",
    metaDescription: "Create smart, branded, and trackable dynamic QR codes with AI."
  });

  useEffect(() => {
    if (config) {
      setFormData({
        businessName: config.businessName || "LinkQR AI",
        legalEmail: config.legalEmail || "legal@linkqr.in",
        heroTitle: config.heroTitle || "",
        heroSubtitle: config.heroSubtitle || "",
        supportEmail: config.supportEmail || "",
        maintenanceMode: !!config.maintenanceMode,
        razorpayKeyId: config.razorpayKeyId || "",
        razorpayKeySecret: config.razorpayKeySecret || "",
        razorpayWebhookSecret: config.razorpayWebhookSecret || "",
        gmailUser: config.gmailUser || "",
        gmailAppPassword: config.gmailAppPassword || "",
        publicBaseUrl: config.publicBaseUrl || "https://linkqr.in",
        logoUrl: config.logoUrl || "",
        faviconUrl: config.faviconUrl || "",
        logoHeight: config.logoHeight || 32,
        logoHeightMobile: config.logoHeightMobile || 28,
        seoKeywords: config.seoKeywords || "dynamic qr code, qr code generator, trackable qr codes, ai qr code, bulk qr generator",
        metaDescription: config.metaDescription || "Create smart, branded, and trackable dynamic QR codes with AI."
      });
    }
    
    getMaintenanceStatsAction().then(res => setMaintenanceCount(res.count));
  }, [config]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'faviconUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select an image smaller than 500KB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, [field]: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!siteConfigRef) return;
    setDocumentNonBlocking(siteConfigRef, formData, { merge: true });
    toast({ title: "Settings Saved", description: "Website configuration updated successfully." });
  };

  const handleRunPurge = async () => {
    if (!window.confirm("क्या आप वाकई 30 दिनों से पुराने एक्सपायर्ड डेटा को हटाना चाहते हैं? ध्यान दें: QR Logos को सुरक्षित रखा जाएगा।")) return;
    
    setIsPurging(true);
    try {
      const result = await cleanupExpiredStorageAction();
      if (result.success) {
        toast({ title: "Purge Complete", description: result.message });
        setMaintenanceCount(0);
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } finally {
      setIsPurging(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground">Manage landing page content, brand identity, and system nodes.</p>
        </div>
        <Button onClick={handleSave} className="h-12 px-8 rounded-xl font-bold shadow-xl shadow-primary/20 gap-2">
           <CheckCircle2 className="h-4 w-4" /> Deploy Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Business Identity Node */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Global Business Identity
              </CardTitle>
              <CardDescription>Changes here sync across legal pages and footers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label>Registered Company Name</Label>
                <Input 
                  value={formData.businessName} 
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  placeholder="e.g. Skill Matrix Solutions"
                />
              </div>
              <div className="space-y-2">
                <Label>Legal / Compliance Email</Label>
                <Input 
                  value={formData.legalEmail} 
                  onChange={(e) => setFormData({...formData, legalEmail: e.target.value})}
                  placeholder="legal@yourdomain.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Maintenance & Storage Module */}
          <Card className="border-none shadow-xl bg-neutral-900 text-white overflow-hidden rounded-[2rem]">
            <CardHeader className="bg-white/5 border-b border-white/5 p-8">
               <CardTitle className="flex items-center gap-3 text-lg font-black uppercase tracking-tight">
                  <HardDrive className="h-6 w-6 text-accent" /> Storage Guard
               </CardTitle>
               <CardDescription className="text-neutral-400 font-medium">Protect server capacity by removing dead assets.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
               <div className="flex items-center justify-between bg-white/5 p-6 rounded-2xl border border-white/10">
                  <div>
                     <p className="text-[10px] font-black uppercase text-accent tracking-[0.2em] mb-1">Target Accounts</p>
                     <p className="text-3xl font-black">{maintenanceCount}</p>
                     <p className="text-[10px] text-neutral-500 font-bold uppercase mt-1">Expired {'>'} 30 Days</p>
                  </div>
                  <div className="h-12 w-px bg-white/10 mx-4"></div>
                  <div className="flex-1">
                     <p className="text-xs font-medium text-neutral-400 leading-relaxed italic">
                        "इन यूज़र्स के भारी मीडिया एसेट्स को हटाकर स्पेस खाली किया जाएगा।"
                     </p>
                  </div>
               </div>

               <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                  <QrCode className="h-5 w-5 text-emerald-400" />
                  <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-tight">
                    Safety Lock: QR Logos are never deleted.
                  </p>
               </div>

               <Button 
                onClick={handleRunPurge} 
                disabled={isPurging || maintenanceCount === 0}
                className="w-full h-14 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 bg-accent hover:bg-accent/90 text-white shadow-2xl shadow-accent/20"
               >
                  {isPurging ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Purge Heavy Media
               </Button>
            </CardContent>
          </Card>

          {/* Landing Page Content */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-neutral-50/50">
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5 text-primary" />
                Landing Page Content
              </CardTitle>
              <CardDescription>Update main website headline and subtext.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label>Hero Title</Label>
                <Input 
                  value={formData.heroTitle} 
                  onChange={(e) => setFormData({...formData, heroTitle: e.target.value})}
                  placeholder="Grow Your Business with AI-Powered QRs."
                />
              </div>
              <div className="space-y-2">
                <Label>Hero Subtitle</Label>
                <Textarea 
                  value={formData.heroSubtitle} 
                  onChange={(e) => setFormData({...formData, heroSubtitle: e.target.value})}
                  placeholder="Professional dynamic QR management for brands."
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                <div className="space-y-0.5">
                  <Label className="text-orange-900">Maintenance Mode</Label>
                  <p className="text-xs text-orange-800 opacity-70">Block public access to the landing page.</p>
                </div>
                <Switch 
                  checked={formData.maintenanceMode} 
                  onCheckedChange={(v) => setFormData({...formData, maintenanceMode: v})}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Brand Identity */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-neutral-50/50">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Official Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Site Logo</Label>
                  <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-2xl bg-neutral-50">
                    {formData.logoUrl ? (
                      <div className="relative group">
                        <img src={formData.logoUrl} alt="Logo" style={{ height: `${formData.logoHeight}px` }} className="object-contain" />
                        <button onClick={() => setFormData({...formData, logoUrl: ""})} className="absolute -top-2 -right-2 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    ) : (
                      <div className="h-16 flex items-center justify-center text-muted-foreground opacity-30"><ImageIcon className="h-10 w-10" /></div>
                    )}
                    <Button variant="outline" size="sm" className="w-full gap-2 h-9" onClick={() => logoInputRef.current?.click()}><UploadCloud className="h-4 w-4" /> Upload</Button>
                    <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logoUrl')} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase opacity-60">Desktop Height: {formData.logoHeight}px</Label>
                    <Slider value={[formData.logoHeight]} min={10} max={120} step={1} onValueChange={(v) => setFormData({...formData, logoHeight: v[0]})} />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Favicon</Label>
                  <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-2xl bg-neutral-50">
                    {formData.faviconUrl ? (
                      <div className="relative group">
                        <img src={formData.faviconUrl} alt="Favicon" className="h-10 w-10 object-contain shadow-sm border rounded bg-white" />
                        <button onClick={() => setFormData({...formData, faviconUrl: ""})} className="absolute -top-2 -right-2 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    ) : (
                      <div className="h-10 w-10 flex items-center justify-center text-muted-foreground opacity-30 border rounded bg-white"><Globe className="h-5 w-5" /></div>
                    )}
                    <Button variant="outline" size="sm" className="w-full gap-2 h-9" onClick={() => faviconInputRef.current?.click()}><UploadCloud className="h-4 w-4" /> Upload</Button>
                    <input type="file" ref={faviconInputRef} className="hidden" accept="image/x-icon,image/png" onChange={(e) => handleImageUpload(e, 'faviconUrl')} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SMTP & Notifications */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Communications (SMTP)
              </CardTitle>
              <CardDescription>Configure Gmail SMTP for lead alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label>Support Email (Public Display)</Label>
                <Input 
                  value={formData.supportEmail} 
                  onChange={(e) => setFormData({...formData, supportEmail: e.target.value})}
                  placeholder="support@linkqr.in"
                />
              </div>
              <div className="space-y-2">
                <Label>Gmail User (Sender)</Label>
                <Input 
                  value={formData.gmailUser} 
                  onChange={(e) => setFormData({...formData, gmailUser: e.target.value})}
                  placeholder="yourname@gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Gmail App Password</Label>
                <Input 
                  type="password"
                  value={formData.gmailAppPassword} 
                  onChange={(e) => setFormData({...formData, gmailAppPassword: e.target.value})}
                  placeholder="xxxx xxxx xxxx xxxx"
                />
              </div>
              <div className="p-4 bg-neutral-50 rounded-xl border flex gap-3">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">Use a **Gmail App Password**, not your account password. Enable 2FA first in Google settings.</p>
              </div>
            </CardContent>
          </Card>

          {/* SEO Optimization */}
          <Card className="border-none shadow-sm border-2 border-primary/20">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <SearchCode className="h-5 w-5 text-primary" />
                Search & SEO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label>Public Base URL</Label>
                <Input 
                  value={formData.publicBaseUrl} 
                  onChange={(e) => setFormData({...formData, publicBaseUrl: e.target.value})}
                  placeholder="https://linkqr.in"
                />
              </div>
              <div className="space-y-2">
                <Label>Global Meta Keywords</Label>
                <Textarea 
                  value={formData.seoKeywords} 
                  onChange={(e) => setFormData({...formData, seoKeywords: e.target.value})}
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Global Meta Description</Label>
                <Textarea 
                  value={formData.metaDescription} 
                  onChange={(e) => setFormData({...formData, metaDescription: e.target.value})}
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Razorpay Integration */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Razorpay Secure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Razorpay Key ID</Label>
                  <Input value={formData.razorpayKeyId} onChange={(e) => setFormData({...formData, razorpayKeyId: e.target.value})} placeholder="rzp_live_..." />
                </div>
                <div className="space-y-2">
                  <Label>Razorpay Key Secret</Label>
                  <Input type="password" value={formData.razorpayKeySecret} onChange={(e) => setFormData({...formData, razorpayKeySecret: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Webhook Secret</Label>
                  <Input type="password" value={formData.razorpayWebhookSecret} onChange={(e) => setFormData({...formData, razorpayWebhookSecret: e.target.value})} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
