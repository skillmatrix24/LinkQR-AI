"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Loader2, 
  Target, 
  Megaphone, 
  Instagram, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2, 
  BrainCircuit, 
  Rocket,
  ArrowLeft,
  Smartphone,
  MapPin,
  Trophy,
  Zap,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { generateCampaignBlueprint, type CampaignOutput } from "@/ai/flows/ai-campaign-creator-flow";

export default function CampaignAgentPage() {
  const [businessType, setBusinessType] = useState("");
  const [goal, setGoal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<CampaignOutput | null>(null);
  
  const { toast } = useToast();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessType || !goal) {
      toast({ variant: "destructive", title: "Input Required", description: "Please provide both business type and goal." });
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateCampaignBlueprint({ businessType, goal });
      setBlueprint(result);
      toast({ title: "Blueprint Ready!", description: "AI has finished planning your campaign." });
    } catch (err: any) {
      console.error("Campaign Generation Error:", err);
      toast({ variant: "destructive", title: "AI Error", description: err.message || "Failed to generate strategy." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-10 mb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1 font-black text-[10px] uppercase tracking-widest">
               <BrainCircuit className="h-3 w-3 mr-1.5" /> THE INTELLIGENT AGENT
             </Badge>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">AI Campaign Agent</h1>
          <p className="text-muted-foreground font-medium text-lg">बताइए आप क्या हासिल करना चाहते हैं, AI आपके लिए पूरी रणनीति तैयार करेगा।</p>
        </div>
        <Button variant="ghost" asChild className="gap-2 font-bold text-muted-foreground hover:text-primary">
          <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</Link>
        </Button>
      </div>

      {!blueprint ? (
        <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
           <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary animate-gradient"></div>
           <CardContent className="p-8 sm:p-12 space-y-10">
              <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                <div className="space-y-4">
                  <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">आपका बिज़नेस क्या है?</Label>
                  <Input 
                    placeholder="e.g. My New Cafe in Mumbai" 
                    value={businessType}
                    onChange={e => setBusinessType(e.target.value)}
                    className="h-16 rounded-2xl bg-neutral-50 border-neutral-200 text-lg font-bold shadow-inner focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">आपका मुख्य लक्ष्य (Goal) क्या है?</Label>
                  <Input 
                    placeholder="e.g. Get 100 Google Reviews in 7 days" 
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                    className="h-16 rounded-2xl bg-neutral-50 border-neutral-200 text-lg font-bold shadow-inner focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div className="md:col-span-2">
                   <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-16 rounded-2xl font-black text-lg shadow-2xl shadow-primary/20 gap-3 group"
                   >
                     {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6" />}
                     START CAMPAIGN PLANNING
                     <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                   </Button>
                </div>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-neutral-100">
                 {[
                   { label: "Specific QR Strategy", icon: Target, color: "text-blue-500" },
                   { label: "Social Media Kit", icon: Instagram, color: "text-accent" },
                   { label: "Physical Placement Guide", icon: MapPin, color: "text-emerald-500" }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50/50 border border-neutral-100">
                      <div className={`h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center ${item.color}`}><item.icon className="h-5 w-5" /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</span>
                   </div>
                 ))}
              </div>
           </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Main Blueprint */}
          <div className="lg:col-span-8 space-y-8">
             <Card className="border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden">
                <CardHeader className="p-8 sm:p-12 pb-0">
                   <div className="flex items-center justify-between">
                      <Badge className="bg-primary text-white border-none px-4 py-1.5 font-black uppercase text-[10px] tracking-widest rounded-full">PLANNING COMPLETE</Badge>
                      <Button variant="ghost" size="icon" onClick={() => setBlueprint(null)} className="h-10 w-10 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"><Zap className="h-5 w-5" /></Button>
                   </div>
                   <CardTitle className="text-4xl font-black mt-6 tracking-tight leading-tight">{blueprint.campaignName}</CardTitle>
                   <CardDescription className="text-lg font-medium leading-relaxed italic text-muted-foreground mt-4">"{blueprint.executiveSummary}"</CardDescription>
                </CardHeader>
                <CardContent className="p-8 sm:p-12 space-y-12">
                   {/* Timeline Section */}
                   <div className="space-y-8">
                      <h3 className="text-2xl font-black flex items-center gap-3"><Calendar className="h-7 w-7 text-primary" /> 7-Day Strategy Timeline</h3>
                      <div className="space-y-4">
                         {blueprint.sevenDayTimeline.map((item, idx) => (
                           <div key={idx} className="flex items-start gap-6 p-6 rounded-2xl bg-neutral-50 border border-neutral-100 group hover:bg-white hover:shadow-xl transition-all">
                              <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 font-black shadow-lg">D{item.day}</div>
                              <div>
                                 <h4 className="font-black text-sm uppercase tracking-tight text-foreground">{item.task}</h4>
                                 <p className="text-sm font-medium text-muted-foreground leading-relaxed mt-1">Impact: <span className="text-primary font-bold">{item.impact}</span></p>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* QR Strategy Section */}
                   <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/10 space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg"><Rocket className="h-6 w-6" /></div>
                         <h3 className="text-2xl font-black uppercase tracking-tight">QR Design Strategy</h3>
                      </div>
                      <div className="space-y-4">
                         <p className="text-sm font-bold text-primary uppercase tracking-[0.2em]">Recommended QR Type: {blueprint.recommendedQRType}</p>
                         <p className="text-base font-medium leading-relaxed">{blueprint.qrDesignTips}</p>
                      </div>
                   </div>

                   {/* Social Kit Section */}
                   <div className="space-y-8">
                      <h3 className="text-2xl font-black flex items-center gap-3"><Instagram className="h-7 w-7 text-accent" /> Social Media Kit</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {blueprint.socialMediaKit.map((item, idx) => (
                           <div key={idx} className="p-6 rounded-[2rem] border border-neutral-100 bg-neutral-50/50 hover:bg-white hover:shadow-xl transition-all group">
                              <div className="flex items-center gap-3 mb-4">
                                 <Badge variant="outline" className="font-black text-[9px] uppercase border-accent/20 text-accent bg-accent/5">{item.platform}</Badge>
                              </div>
                              <p className="text-sm font-bold italic mb-6 leading-relaxed">"{item.content}"</p>
                              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary tracking-widest mt-auto opacity-70 group-hover:opacity-100 transition-opacity">
                                 <CheckCircle2 className="h-4 w-4" /> {item.action}
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* Physical Placement Section */}
                   <div className="space-y-8">
                      <h3 className="text-2xl font-black flex items-center gap-3"><MapPin className="h-7 w-7 text-emerald-600" /> Physical Activation</h3>
                      <div className="space-y-4">
                         {blueprint.physicalMaterial.map((item, idx) => (
                           <div key={idx} className="flex items-start gap-6 p-6 rounded-2xl hover:bg-emerald-50/50 transition-colors">
                              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner font-black">{idx + 1}</div>
                              <div>
                                 <h4 className="font-black text-sm uppercase tracking-tight text-emerald-700">{item.item}</h4>
                                 <p className="text-sm font-medium text-muted-foreground leading-relaxed mt-1">{item.instruction}</p>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </CardContent>
             </Card>
          </div>

          {/* Sidebar Tips */}
          <div className="lg:col-span-4 space-y-8">
             <Card className="border-none shadow-xl bg-[#0a0a0a] text-white rounded-[2.5rem] overflow-hidden p-10 flex flex-col justify-between relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000"><Trophy className="h-40 w-40 text-accent" /></div>
                <div className="space-y-8 relative z-10">
                   <div className="h-14 w-14 rounded-2xl bg-accent text-white flex items-center justify-center shadow-2xl"><Zap className="h-7 w-7" /></div>
                   <h3 className="text-3xl font-black leading-tight uppercase tracking-tight">The <br />Golden Tip</h3>
                   <p className="text-neutral-400 text-lg font-bold italic leading-relaxed">
                      "{blueprint.successTip}"
                   </p>
                </div>
                <Button className="w-full mt-10 h-14 rounded-xl font-black bg-white text-black hover:bg-neutral-200 transition-all shadow-2xl" asChild>
                   <Link to="/dashboard/qrcodes/ai">GO TO MAGIC STUDIO</Link>
                </Button>
             </Card>

             <Card className="border-none shadow-xl bg-white rounded-[2rem] p-8 space-y-6">
                <div className="flex items-center gap-3">
                   <Megaphone className="h-6 w-6 text-primary" />
                   <h4 className="font-black text-sm uppercase tracking-widest">Next Steps</h4>
                </div>
                <div className="space-y-4">
                   {[
                     "AI Magic Studio में अपना QR डिजाइन करें।",
                     "ऊपर दिए गए सोशल पोस्ट्स कॉपी करें।",
                     "फिजिकल पोस्टर्स प्रिंट करके प्लेस करें।",
                     "एनालिटिक्स में रिज़ल्ट ट्रैक करें।"
                   ].map((step, i) => (
                     <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 text-xs font-bold leading-relaxed border border-neutral-100">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0"></div>
                        {step}
                     </div>
                   ))}
                </div>
             </Card>
          </div>
        </div>
      )}
    </div>
  );
}
