
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Loader2, 
  Server, 
  Settings2, 
  Lock, 
  Cpu, 
  RefreshCcw, 
  Copy, 
  Target, 
  Check,
  ShieldCheck,
  Info
} from "lucide-react";
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  useMemoFirebase, 
  setDocumentNonBlocking, 
  deleteDocumentNonBlocking, 
  updateDocumentNonBlocking 
} from "@/firebase";
import { collection, query, where, doc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { verifyDomainDNSAction } from "@/app/actions/domains";
import { cn } from "@/lib/utils";

/**
 * Professional White-label Domain Management.
 * Updated to use Client SDK for robust CRUD and Server Action for pure DNS lookup.
 */
export default function CustomDomainsSettings() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [newDomain, setNewDomain] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const domainsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, "customDomains"), where("userId", "==", user.uid));
  }, [db, user?.uid]);

  const { data: domains, isLoading, error } = useCollection(domainsRef);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast({ title: "Copied to clipboard" });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain || !user?.uid || !db) return;

    const domainToRegister = newDomain.toLowerCase().trim();
    if (!domainToRegister.includes('.')) {
      toast({ variant: "destructive", title: "Invalid Format", description: "Please enter a subdomain like 'links.brand.com'" });
      return;
    }

    setIsAdding(true);
    try {
      const domainId = domainToRegister.replace(/\./g, '_');
      const domainDocRef = doc(db, "customDomains", domainId);
      
      const domainData = {
        id: domainId,
        userId: user.uid,
        domain: domainToRegister,
        status: 'pending',
        dnsValue: 'cname.linkqr.in',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      setDocumentNonBlocking(domainDocRef, domainData, { merge: true });
      toast({ title: "Node Registered", description: "Domain added to pending queue." });
      setNewDomain("");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Registration Error", description: e.message });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (domainId: string) => {
    if (!db) return;
    if (!window.confirm("Permanently remove this custom domain? Your existing links on this domain will stop working.")) return;
    
    setIsDeleting(domainId);
    try {
      const domainDocRef = doc(db, "customDomains", domainId);
      deleteDocumentNonBlocking(domainDocRef);
      toast({ title: "Registry Node Purged" });
    } catch (e) {
      toast({ variant: "destructive", title: "Action Failed" });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleRealVerify = async (domain: any) => {
    if (!db) return;
    setIsVerifying(domain.id);
    try {
      const result = await verifyDomainDNSAction(domain.domain);
      if (result.success) {
        const domainDocRef = doc(db, "customDomains", domain.id);
        updateDocumentNonBlocking(domainDocRef, {
          status: 'active',
          verifiedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        toast({ 
          title: "Node Activated!", 
          description: "CNAME verified. Your custom domain is now live and SSL protected." 
        });
      } else {
        toast({ 
          variant: "destructive", 
          title: "Verification Failed", 
          description: result.error || "CNAME record not found or incorrect." 
        });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Server Error", description: "Verification timed out. Please try again." });
    } finally {
      setIsVerifying(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-6 mb-32 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3 text-center md:text-left">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight flex items-center justify-center md:justify-start gap-5 text-foreground leading-tight">
             <div className="bg-primary/10 p-3 rounded-2xl text-primary shadow-inner"><Globe className="h-10 w-10 sm:h-12 sm:w-12" /></div>
             Custom <span className="text-primary">Domains</span>
          </h1>
          <p className="text-muted-foreground font-medium text-base sm:text-xl max-w-3xl leading-relaxed">
            Replace "linkqr.in" with your own branded hostname to build ultimate customer trust.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 space-y-12">
          
          <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
            <div className="h-2 bg-primary"></div>
            <CardHeader className="p-8 sm:p-12 pb-4">
              <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-4">
                 <Settings2 className="h-6 w-6 text-primary" /> Register New Host
              </CardTitle>
              <CardDescription className="text-base font-medium">Add your subdomain and point your DNS to our nodes.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 sm:p-12 pt-0">
              <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input 
                    placeholder="e.g. links.mybrand.com" 
                    value={newDomain}
                    onChange={e => setNewDomain(e.target.value)}
                    className="h-16 rounded-2xl bg-neutral-50 border-neutral-200 focus:bg-white transition-all font-black text-lg sm:text-xl placeholder:font-medium shadow-inner"
                  />
                </div>
                <Button type="submit" disabled={isAdding || !newDomain} className="h-16 px-10 rounded-2xl font-black gap-3 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white group">
                  {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-6 w-6 group-hover:scale-110 transition-transform" />}
                  Deploy Node
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.4em] flex items-center gap-2">
                  <Cpu className="h-4 w-4" /> Global Registry Nodes
               </h3>
               {domains && domains.length > 0 && (
                 <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[10px] uppercase h-7 px-4 rounded-xl shadow-sm">
                   {domains.length} Cluster(s) Active
                 </Badge>
               )}
            </div>
            
            {isLoading ? (
              <div className="py-32 flex flex-col items-center justify-center gap-6 bg-white rounded-[3rem] border-2 border-dashed shadow-inner">
                 <Loader2 className="h-14 w-14 animate-spin text-primary" />
                 <p className="text-[11px] font-black uppercase text-muted-foreground tracking-[0.5em] text-center">Synchronizing Clusters...</p>
              </div>
            ) : domains && domains.length > 0 ? (
              <div className="space-y-6">
                {domains.map((d) => (
                  <Card key={d.id} className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden group border border-neutral-100/50 hover:shadow-2xl transition-all duration-700">
                    <CardContent className="p-8 sm:p-10">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                        <div className="flex items-center gap-6 sm:gap-8">
                          <div className={cn(
                            "h-16 w-16 sm:h-20 sm:w-20 rounded-[1.5rem] flex items-center justify-center shadow-inner transition-transform group-hover:rotate-6",
                            d.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-500"
                          )}>
                            <Server className="h-8 w-8 sm:h-10 sm:w-10" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-black text-xl sm:text-3xl text-foreground tracking-tight truncate">{d.domain}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-3">
                               {d.status === 'active' ? (
                                 <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[10px] uppercase h-8 px-5 rounded-xl flex items-center gap-2 shadow-sm">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live & SSL Secure
                                 </Badge>
                               ) : (
                                 <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 font-black text-[10px] uppercase h-8 px-5 rounded-xl animate-pulse flex items-center gap-2 shadow-sm">
                                    <Clock className="h-4 w-4" /> DNS PENDING
                                 </Badge>
                               )}
                               <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-40 hidden sm:inline">Registry Node: {d.id}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          {d.status !== 'active' && (
                             <Button 
                              onClick={() => handleRealVerify(d)} 
                              disabled={isVerifying === d.id}
                              className="h-12 px-8 rounded-xl font-black text-[10px] uppercase gap-2 shadow-xl bg-accent hover:bg-accent/90"
                             >
                               {isVerifying === d.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                               Check DNS Record
                             </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)} disabled={isDeleting === d.id} className="h-12 w-12 rounded-xl text-destructive hover:bg-red-50 transition-colors border border-transparent hover:border-red-100">
                             {isDeleting === d.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                          </Button>
                        </div>
                      </div>

                      {d.status !== 'active' && (
                        <div className="mt-10 p-8 sm:p-12 bg-[#0a0a0a] text-white rounded-[3rem] space-y-8 shadow-2xl border border-white/5 animate-in slide-in-from-top-6 duration-700 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-10 opacity-5"><CheckCircle2 className="h-32 w-32 text-accent" /></div>
                           <div className="flex items-center justify-between relative z-10">
                              <h4 className="text-[11px] font-black uppercase text-accent tracking-[0.4em] flex items-center gap-3">
                                 <Lock className="h-4 w-4" /> DNS INTEGRATION SPECS
                              </h4>
                              <Badge variant="outline" className="text-white/40 border-white/10 text-[8px] font-black tracking-[0.2em] uppercase">Manual Linkage Required</Badge>
                           </div>
                           
                           <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative z-10">
                              <div className="space-y-3 p-6 bg-white/5 rounded-2xl border border-white/5">
                                 <span className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em]">RECORD TYPE</span>
                                 <p className="text-lg font-black text-white">CNAME</p>
                              </div>
                              <div className="space-y-3 p-6 bg-white/5 rounded-2xl border border-white/5 group relative cursor-pointer" onClick={() => handleCopy(d.domain.split('.')[0] === 'links' ? 'links' : '@', 'host')}>
                                 <span className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em]">HOST / NAME</span>
                                 <p className="text-lg font-black text-white">{d.domain.split('.')[0] === 'links' ? 'links' : '@'}</p>
                                 <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {copiedField === 'host' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-white/40" />}
                                 </div>
                              </div>
                              <div className="space-y-3 p-6 bg-white/5 rounded-2xl border border-white/5 group relative cursor-pointer" onClick={() => handleCopy(d.dnsValue, 'target')}>
                                 <span className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em]">VALUE / TARGET</span>
                                 <p className="text-lg font-mono font-black text-accent truncate">{d.dnsValue}</p>
                                 <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {copiedField === 'target' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-white/40" />}
                                 </div>
                              </div>
                           </div>
                           
                           <div className="p-5 bg-accent/10 border border-accent/20 rounded-2xl flex gap-5 relative z-10">
                              <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0 shadow-lg text-accent"><Info className="h-6 w-6" /></div>
                              <div className="space-y-1">
                                 <p className="text-[10px] font-black uppercase text-accent tracking-widest">Propagation Logic</p>
                                 <p className="text-xs text-accent/70 leading-relaxed font-medium">
                                    DNS changes can take **2 to 24 hours** to propagate globally. Click "Check DNS Record" above once you have added the record at your provider.
                                 </p>
                              </div>
                           </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-32 text-center border-4 border-dashed rounded-[4rem] bg-neutral-50/50 opacity-20 flex flex-col items-center gap-8 shadow-inner transition-all hover:opacity-40">
                 <div className="h-24 w-24 bg-neutral-100 rounded-full flex items-center justify-center shadow-inner"><Globe className="h-12 w-12 text-neutral-400" /></div>
                 <div className="space-y-2">
                    <p className="font-black uppercase tracking-[0.6em] text-sm text-foreground">Registry Node Empty</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Register your first custom hostname to begin.</p>
                 </div>
              </div>
            )}
            
            {error && (
               <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <p className="text-xs font-bold uppercase">Cloud Sync Fault: {error.message}</p>
               </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8 order-last lg:order-none lg:sticky lg:top-24">
           
           <Card className="border-none shadow-2xl bg-neutral-900 text-white rounded-[3.5rem] overflow-hidden flex flex-col group relative">
              <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000"><ShieldCheck className="h-56 w-56 text-accent" /></div>
              <CardHeader className="p-10 pb-6 border-b border-white/5 relative z-10">
                 <CardTitle className="text-3xl font-black uppercase tracking-tight flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-accent shadow-xl"><Target className="h-7 w-7" /></div>
                    Setup Roadmap
                 </CardTitle>
                 <CardDescription className="text-neutral-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-3">White-label Protocol v1.0</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-12 relative z-10">
                 {[
                   { step: "01", t: "Identify Host", d: "Choose a subdomain like 'links' or 'qr' on your main domain." },
                   { step: "02", t: "Inject CNAME", d: "Add a CNAME record at GoDaddy/Namecheap pointing to our node." },
                   { step: "03", t: "Wait for Sync", d: "Wait for the global DNS clusters to update (TTL: 300 recommended)." },
                   { step: "04", t: "Verify Node", d: "Click the verification button to finalize the encryption tunnel." }
                 ].map((item, idx) => (
                   <div key={idx} className="flex items-start gap-8 group/step">
                      <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-accent font-black text-sm shrink-0 group-hover/step:bg-white group-hover/step:text-black transition-all shadow-inner">{item.step}</div>
                      <div className="space-y-1.5">
                         <h4 className="font-black text-base uppercase tracking-tight group-hover/step:text-accent transition-colors">{item.t}</h4>
                         <p className="text-[12px] text-neutral-500 leading-relaxed font-medium">{item.d}</p>
                      </div>
                   </div>
                 ))}
                 
                 <div className="pt-8 border-t border-white/5">
                    <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 flex flex-col gap-6 text-center shadow-inner relative overflow-hidden group">
                       <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 relative z-10">Estimated ROI Boost</p>
                       <p className="text-5xl font-black text-emerald-400 relative z-10">+34% <span className="text-lg opacity-40">CTR</span></p>
                       <p className="text-[10px] text-neutral-400 leading-relaxed italic uppercase font-bold relative z-10">
                         "Branded links increase customer confidence by 2x."
                       </p>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <div className="p-8 rounded-[3rem] bg-primary/5 border-2 border-primary/10 flex gap-6 shadow-sm group hover:border-primary/30 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform"><Target className="h-6 w-6" /></div>
              <p className="text-xs text-primary/80 font-black uppercase leading-relaxed italic tracking-tighter">
                 "Professional white-labeling transforms a simple utility into an enterprise asset."
              </p>
           </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
