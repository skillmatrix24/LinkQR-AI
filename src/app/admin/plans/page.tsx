
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogTrigger,
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  Edit, 
  Package, 
  CheckCircle2, 
  Loader2, 
  RefreshCcw, 
  Plus, 
  DollarSign, 
  BadgeIndianRupee, 
  X, 
  Trash2, 
  BrainCircuit, 
  Save 
} from "lucide-react";
import { 
  useFirestore, 
  useCollection, 
  useMemoFirebase, 
  updateDocumentNonBlocking, 
  setDocumentNonBlocking 
} from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const DEFAULT_PLANS = [
  { 
    id: "free_plan", 
    name: "Free Trial (Ignition)", 
    description: "Experience basic smart links", 
    maxQRCodes: 5, 
    priceMonthly: 0, 
    priceMonthlyINR: 0, 
    priceYearly: 0, 
    priceYearlyINR: 0, 
    currency: "USD", 
    features: ["5 Dynamic Smart Links", "1 AI Smart Page", "1 Digital ID Card", "Standard Analytics", "Community Support", "Expiry Block Protection"] 
  },
  { 
    id: "starter_plan", 
    name: "Starter (BI L1-2)", 
    description: "For small local businesses", 
    maxQRCodes: 20, 
    priceMonthly: 7, 
    priceMonthlyINR: 299, 
    priceYearly: 70, 
    priceYearlyINR: 2990, 
    currency: "USD", 
    features: ["20 Dynamic Smart Links", "5 AI Smart Pages", "5 Digital ID Cards", "BI Level 1: Business Health Score", "HD Poster Downloads (PNG)", "Device & OS Analytics", "7-Day Renewal Alerts"] 
  },
  { 
    id: "pro_plan", 
    name: "Pro (BI Level 5)", 
    description: "The Growth Engine tier", 
    maxQRCodes: 100, 
    priceMonthly: 19, 
    priceMonthlyINR: 799, 
    priceYearly: 190, 
    priceYearlyINR: 7990, 
    currency: "USD", 
    features: ["100 Dynamic Smart Links", "Unlimited AI Smart Pages", "Unlimited Digital ID Cards", "BI Level 5: AI Bot Shield Protection", "AI Magic Studio (Imagen 3)", "AI Campaign Agent Strategy", "Results Hub: CRM & Sales Ledger"] 
  },
  { 
    id: "ent_plan", 
    name: "Enterprise (BI Level 10)", 
    description: "The Global Intelligence Suite", 
    maxQRCodes: 9999, 
    priceMonthly: 49, 
    priceMonthlyINR: 1999, 
    priceYearly: 490, 
    priceYearlyINR: 19990, 
    currency: "USD", 
    features: ["Unlimited Infrastructure", "Fleet Identity Deployment", "BI Level 10: Executive Master View", "Predictive Revenue Forecasting", "Competitor Market Radar", "Bulk CSV/Sheets Injection", "Webhooks & Automation API"] 
  },
];

export default function ManagePlans() {
  const db = useFirestore();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [newFeature, setNewFeature] = useState("");

  const plansRef = useMemoFirebase(() => db ? collection(db, "plans") : null, [db]);
  const { data: plans, isLoading } = useCollection(plansRef);

  const handleUpdate = () => {
    if (!selectedPlan || !db) return;
    
    const planRef = doc(db, "plans", selectedPlan.id);
    updateDocumentNonBlocking(planRef, {
      name: selectedPlan.name,
      priceMonthly: Number(selectedPlan.priceMonthly),
      priceMonthlyINR: Number(selectedPlan.priceMonthlyINR),
      priceYearly: Number(selectedPlan.priceYearly),
      priceYearlyINR: Number(selectedPlan.priceYearlyINR),
      maxQRCodes: Number(selectedPlan.maxQRCodes),
      description: selectedPlan.description,
      features: selectedPlan.features
    });

    toast({ title: "Strategy Updated", description: `${selectedPlan.name} is now synchronized.` });
    setIsEditing(false);
    setNewFeature("");
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setSelectedPlan({
      ...selectedPlan,
      features: [...(selectedPlan.features || []), newFeature.trim()]
    });
    setNewFeature("");
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = [...selectedPlan.features];
    updatedFeatures.splice(index, 1);
    setSelectedPlan({
      ...selectedPlan,
      features: updatedFeatures
    });
  };

  const initializePlans = () => {
    if (!db) return;
    setIsInitializing(true);
    DEFAULT_PLANS.forEach(plan => {
      const planRef = doc(db, "plans", plan.id);
      setDocumentNonBlocking(planRef, plan, { merge: true });
    });
    
    setTimeout(() => {
      setIsInitializing(false);
      toast({ title: "Tiers Re-initialized", description: "The platform now uses updated ID & BI levels strategy." });
    }, 1000);
  };

  if (isLoading) return <div className="flex justify-center p-32"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>;

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
             <div className="bg-primary/10 p-2 rounded-xl text-primary"><BrainCircuit className="h-6 w-6" /></div>
             Subscription Strategy
          </h1>
          <p className="text-muted-foreground font-medium">Manage Identity Capacity and operational limits.</p>
        </div>
        <Button onClick={initializePlans} disabled={isInitializing} className="gap-2 rounded-xl font-bold h-12 shadow-xl shadow-primary/20">
          {isInitializing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          Reset to BI Standard Tiers
        </Button>
      </div>

      <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-neutral-50/50">
                <TableRow className="border-none">
                  <TableHead className="pl-8 py-6 uppercase text-[10px] font-black tracking-widest text-primary">Intelligence Tier</TableHead>
                  <TableHead className="uppercase text-[10px] font-black tracking-widest text-center">Monthly (USD/INR)</TableHead>
                  <TableHead className="uppercase text-[10px] font-black tracking-widest text-center">Yearly (USD/INR)</TableHead>
                  <TableHead className="uppercase text-[10px] font-black tracking-widest text-center">Nodes (Limit)</TableHead>
                  <TableHead className="uppercase text-[10px] font-black tracking-widest text-center">Capabilities</TableHead>
                  <TableHead className="pr-8 text-right uppercase text-[10px] font-black tracking-widest">Registry Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans?.sort((a, b) => a.priceMonthly - b.priceMonthly).map((plan) => (
                  <TableRow key={plan.id} className="group hover:bg-neutral-50/50 border-neutral-100">
                    <TableCell className="pl-8 py-5">
                       <div className="flex flex-col">
                          <span className="font-black text-sm text-foreground">{plan.name}</span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 truncate max-w-[150px]">{plan.description}</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex flex-col gap-1 items-center">
                        <Badge variant="outline" className="h-6 font-mono text-[10px] border-primary/20 text-primary bg-primary/5">${plan.priceMonthly}</Badge>
                        <span className="text-[10px] font-bold text-muted-foreground opacity-60">₹{plan.priceMonthlyINR || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex flex-col gap-1 items-center">
                        <Badge variant="outline" className="h-6 font-mono text-[10px] border-emerald-200 text-emerald-600 bg-emerald-50">${plan.priceYearly}</Badge>
                        <span className="text-[10px] font-bold text-muted-foreground opacity-60">₹{plan.priceYearlyINR || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <span className={cn("text-xs font-black", plan.maxQRCodes >= 9999 ? "text-primary" : "text-foreground")}>
                          {plan.maxQRCodes >= 9999 ? "UNLIMITED" : `${plan.maxQRCodes} Nodes`}
                       </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-neutral-100 text-neutral-600 border-none font-bold text-[9px] uppercase h-5">{plan.features?.length || 0} Signals</Badge>
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                      <Dialog open={isEditing && selectedPlan?.id === plan.id} onOpenChange={(open) => {
                        if(open) {
                          setSelectedPlan(plan);
                          setNewFeature("");
                        }
                        setIsEditing(open);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-all">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl flex flex-col max-h-[90vh] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                          <div className="bg-primary p-8 text-white shrink-0">
                             <DialogHeader>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight text-white">Sync Intelligence Level: {plan.id}</DialogTitle>
                                <DialogDescription className="text-primary-foreground/60 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Registry Configuration Node</DialogDescription>
                             </DialogHeader>
                          </div>
                          
                          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10 bg-white overflow-y-auto flex-1 custom-scrollbar">
                            <div className="space-y-8">
                              <div className="space-y-4">
                                <h4 className="text-[11px] font-black uppercase text-primary border-b pb-2 tracking-widest">Base Identity</h4>
                                <div className="space-y-2">
                                   <Label className="text-[9px] font-bold uppercase ml-1">Display Name</Label>
                                   <Input value={selectedPlan?.name || ""} onChange={e => setSelectedPlan({...selectedPlan, name: e.target.value})} className="h-10 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                   <Label className="text-[9px] font-bold uppercase ml-1">Strategy Description</Label>
                                   <Input value={selectedPlan?.description || ""} onChange={e => setSelectedPlan({...selectedPlan, description: e.target.value})} className="h-10 rounded-xl" />
                                </div>
                              </div>

                              <div className="space-y-4 pt-4">
                                <h4 className="text-[11px] font-black uppercase text-primary border-b pb-2 tracking-widest">Monthly Pricing Hub</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label className="text-[9px] font-bold uppercase opacity-60">USD ($)</Label>
                                    <Input type="number" value={selectedPlan?.priceMonthly || 0} onChange={(e) => setSelectedPlan({...selectedPlan, priceMonthly: e.target.value})} className="h-10 rounded-xl" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-[9px] font-bold uppercase opacity-60">INR (₹)</Label>
                                    <Input type="number" value={selectedPlan?.priceMonthlyINR || 0} onChange={(e) => setSelectedPlan({...selectedPlan, priceMonthlyINR: e.target.value})} className="h-10 rounded-xl" />
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4 pt-4">
                                <h4 className="text-[11px] font-black uppercase text-primary border-b pb-2 tracking-widest">Operational Limits</h4>
                                <div className="space-y-2">
                                  <Label className="text-[9px] font-bold uppercase ml-1">Node Redirection Capacity (9999 = INF)</Label>
                                  <Input type="number" value={selectedPlan?.maxQRCodes || 0} onChange={(e) => setSelectedPlan({...selectedPlan, maxQRCodes: e.target.value})} className="h-12 rounded-xl text-lg font-black bg-neutral-50" />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-6 flex flex-col">
                              <h4 className="text-[11px] font-black uppercase text-primary border-b pb-2 tracking-widest">Intelligence Signals</h4>
                              <div className="flex-1 space-y-2">
                                {selectedPlan?.features?.map((feature: string, idx: number) => (
                                  <div key={idx} className="flex items-center gap-2 group animate-in slide-in-from-right-2">
                                    <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 text-primary/40"><CheckCircle2 className="h-3.5 w-3.5" /></div>
                                    <Input 
                                      value={feature || ""} 
                                      onChange={(e) => {
                                        const newFeats = [...selectedPlan.features];
                                        newFeats[idx] = e.target.value;
                                        setSelectedPlan({...selectedPlan, features: newFeats});
                                      }}
                                      className="flex-1 text-[11px] font-bold h-8 border-none bg-neutral-50 shadow-inner rounded-lg"
                                    />
                                    <button onClick={() => removeFeature(idx)} className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
                                  </div>
                                ))}
                              </div>
                              <div className="pt-4 border-t mt-auto">
                                <div className="flex gap-2">
                                  <Input placeholder="New signal..." value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addFeature()} className="h-10 rounded-xl" />
                                  <Button size="icon" onClick={addFeature} className="h-10 w-10 rounded-xl shrink-0"><Plus className="h-4 w-4" /></Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          <DialogFooter className="p-8 bg-neutral-50 border-t flex flex-row justify-end shrink-0">
                            <Button onClick={handleUpdate} className="w-full h-14 rounded-2xl font-black shadow-xl shadow-primary/20 gap-3 bg-primary hover:bg-primary/90 text-white">
                               <Save className="h-5 w-5" /> SYNC REGISTRY NODE
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
      `}</style>
    </div>
  );
}
