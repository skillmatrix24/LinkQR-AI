"use client";

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  UserCircle, 
  Plus, 
  Loader2, 
  ArrowRight, 
  QrCode, 
  Eye, 
  Share2, 
  Trash2, 
  Edit2, 
  Target,
  Sparkles,
  Smartphone,
  IdCard,
  CreditCard,
  Layers,
  Activity,
  RefreshCcw,
  Globe,
  FileDown,
  Download,
  Users2,
  Users
} from "lucide-react";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, doc, getDocs } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

/**
 * Digital ID Management Hub.
 * Unified experience: Fetches from dedicated 'digitalIDs' collection.
 */
export default function DigitalIDManagement() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // DEDICATED FETCH: Look into digitalIDs collection
  const vcardsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, "users", user.uid, "digitalIDs"), orderBy("updatedAt", "desc"));
  }, [db, user?.uid]);

  const { data: vcards, isLoading } = useCollection(vcardsRef);

  const handleDelete = (id: string) => {
    if (!db || !user?.uid) return;
    if (!window.confirm("Permanently delete this Digital Identity node? This action is irreversible.")) return;
    
    deleteDocumentNonBlocking(doc(db, "users", user.uid, "digitalIDs", id));
    toast({ title: "Node Purged", description: "Identity removed from global registry." });
  };

  const handleExportLeads = async (cardId: string, cardName: string) => {
    if (!db || !user?.uid) return;
    setIsExporting(cardId);
    try {
      // Look for leads associated with this specific ID card
      const leadsRef = collection(db, "users", user.uid, "digitalIDs", cardId, "leads");
      const snap = await getDocs(leadsRef);
      
      if (snap.empty) {
        toast({ title: "Archive Empty", description: "No inquiries recorded for this node yet." });
        return;
      }

      const headers = "Customer Name,Email Address,Mobile,Inquiry/Note,Date Recorded\n";
      const rows = snap.docs.map(d => {
        const data = d.data();
        const date = data.createdAt?.toDate ? format(data.createdAt.toDate(), 'yyyy-MM-dd HH:mm') : 'N/A';
        return `"${data.name}","${data.email || ''}","${data.phone || data.mobile || ''}","${(data.business || data.note || '').replace(/"/g, '""')}","${date}"`;
      }).join("\n");

      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `identity-leads-${cardName.replace(/\s+/g, '-')}.csv`;
      a.click();
      toast({ title: "Intelligence Exported" });
    } catch (e) {
      toast({ variant: "destructive", title: "Extraction Failed" });
    } finally {
      setIsExporting(null);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
      <div className="relative">
         <Loader2 className="animate-spin h-14 w-14 text-primary" />
         <UserCircle className="absolute inset-0 m-auto h-6 w-6 text-accent animate-pulse" />
      </div>
      <p className="font-black text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Synchronizing Identity Registry...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-12 mb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-4">
        <div className="space-y-3 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
             <Badge className="bg-accent/10 text-accent border-none px-4 py-1 font-black text-[10px] uppercase tracking-widest rounded-full">Identity Fleet Hub v9.0</Badge>
          </div>
          <h1 className="text-4xl sm:text-7xl font-black tracking-tighter text-foreground leading-[1.1]">
            Digital <span className="text-primary">IDs.</span>
          </h1>
          <p className="text-sm sm:text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
            Professional business identities built on our unified studio engine. Branded, trackable, and optimized for instant network capture.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="h-16 px-8 rounded-2xl font-black gap-3 border-2" asChild>
            <Link to="/dashboard/vcards/bulk"><Layers className="h-5 w-5" /> FLEET INJECTOR</Link>
          </Button>
          <Button className="h-16 px-10 rounded-2xl font-black gap-3 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white" asChild>
            <Link to={`/dashboard/vcards/new`}><Plus className="h-6 w-6" /> REGISTER NEW ID</Link>
          </Button>
        </div>
      </div>

      {vcards && vcards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vcards.map((card) => {
            const vcardData = card.sections?.find((s: any) => s.type === 'vcard')?.data || {};
            const photoUrl = vcardData.photoUrl || `https://picsum.photos/seed/${card.id}/200/200`;
            const fullName = vcardData.fullName || card.businessName || "Untitled Persona";
            const designation = vcardData.designation || "Executive Node";

            return (
              <Card key={card.id} className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden group hover:shadow-2xl transition-all duration-500 border border-neutral-100/50">
                <div className="p-8 pb-4 flex flex-col items-center text-center space-y-6 bg-neutral-50/50 border-b">
                   <div className={cn(
                       "h-24 w-24 border-4 border-white shadow-xl overflow-hidden bg-white ring-8 ring-neutral-100/50 transition-all duration-700 group-hover:rotate-6",
                       vcardData.photoShape === 'circle' ? 'rounded-full' : vcardData.photoShape === 'rounded' ? 'rounded-2xl' : 'rounded-none'
                   )}>
                      <img src={photoUrl} className="h-full w-full object-cover" alt="" />
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-2xl font-black tracking-tight truncate max-w-[240px] uppercase">{fullName}</h3>
                      <p className="text-[10px] font-black uppercase text-primary tracking-widest truncate max-w-[200px] opacity-60">{designation}</p>
                   </div>
                </div>
                <CardContent className="p-8 space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-neutral-50 rounded-2xl text-center shadow-inner border border-neutral-100">
                         <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Total Hits</p>
                         <p className="text-2xl font-black">{(card.views || 0).toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-neutral-50 rounded-2xl text-center shadow-inner border border-neutral-100">
                         <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Saves</p>
                         <p className="text-2xl font-black">{(card.stats?.saves || 0).toLocaleString()}</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3 pt-2">
                      <Button variant="outline" className="rounded-xl font-black h-12 border-2 text-[10px] uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all" asChild>
                         <Link to={`/dashboard/qrs/microsite?id=${card.id}&type=vcard`}><Edit2 className="h-3.5 w-3.5 mr-2" /> BUILDER</Link>
                      </Button>
                      <Button variant="outline" className="rounded-xl font-black h-12 border-2 text-[10px] uppercase tracking-widest" asChild>
                         <a to={`/s/${card.slug || card.id}`} target="_blank"><Eye className="h-3.5 w-3.5 mr-2" /> LIVE</a>
                      </Button>
                      <Button 
                        variant="secondary"
                        disabled={isExporting === card.id}
                        onClick={() => handleExportLeads(card.id, fullName)}
                        className="col-span-1 h-12 rounded-xl font-black text-[10px] uppercase gap-2 bg-neutral-100 hover:bg-neutral-200"
                      >
                         {isExporting === card.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} EXPORT
                      </Button>
                      <Button className="col-span-1 h-12 rounded-xl font-black gap-2 shadow-lg group" asChild>
                         <Link to={`/dashboard/analytics?id=${card.id}`}>
                            <Activity className="h-4 w-4 group-hover:animate-pulse" /> STATS
                         </Link>
                      </Button>
                   </div>

                   <div className="flex items-center justify-between pt-4 border-t opacity-30 group-hover:opacity-100 transition-opacity">
                      <p className="text-[8px] font-black uppercase tracking-[0.2em]">Registry Node: {card.id.substring(0, 12)}</p>
                      <button onClick={() => handleDelete(card.id)} className="text-red-500 hover:text-red-600 transition-all hover:scale-110">
                         <Trash2 className="h-4 w-4" />
                      </button>
                   </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="py-40 text-center flex flex-col items-center gap-10 bg-white rounded-[4rem] border-4 border-dashed border-neutral-100 shadow-inner">
           <div className="h-32 w-32 bg-primary/5 rounded-full flex items-center justify-center text-primary/20 relative">
              <IdCard className="h-16 w-16" />
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary/10 animate-spin-slow"></div>
           </div>
           <div className="space-y-3">
              <h3 className="text-3xl font-black uppercase tracking-tighter">Identity Hub Offline</h3>
              <p className="text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">
                 You haven't deployed any professional identity nodes yet. Launch your digital business card now.
              </p>
           </div>
           <Button size="lg" className="h-16 px-16 rounded-2xl font-black gap-4 shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 text-lg transition-transform hover:scale-[1.03] active:scale-95" asChild>
              <Link to={`/dashboard/vcards/new`}><Plus className="h-7 w-7" /> DEPLOY MY FIRST ID</Link>
           </Button>
        </div>
      )}
      
      <style>{`
        .animate-spin-slow { animation: spin 12s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
