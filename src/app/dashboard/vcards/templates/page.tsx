
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  ArrowLeft, 
  Sparkles, 
  Loader2, 
  ArrowRight,
  Palette,
  Target,
  IdCard,
  UserCircle
} from "lucide-react";
import { 
  useFirestore, 
  useCollection, 
  useMemoFirebase,
} from "@/firebase";
import { collection, query, orderBy, where } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function IDTemplatesPage() {
  const router = useNavigate();
  const db = useFirestore();
  
  const [searchTerm, setSearchTerm] = useState("");

  const templatesRef = useMemoFirebase(() => {
    if (!db) return null;
    // Filter for Personal/Professional templates usually used for IDs
    return query(
      collection(db, "smartTemplates"), 
      where("type", "==", "full-page"),
      orderBy("createdAt", "desc")
    );
  }, [db]);

  const { data: templates, isLoading } = useCollection(templatesRef);

  const idTemplates = useMemo(() => {
    if (!templates) return [];
    // Only show templates that likely contain a vCard or are categorized as Personal/Professional
    return templates.filter(t => 
      t.categories?.some((c: string) => ["Personal", "Professional", "Luxury"].includes(c)) ||
      t.sections?.some((s: any) => s.type === 'vcard')
    );
  }, [templates]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground text-center">Syncing ID Archives...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 pb-32 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-4">
        <div className="space-y-4">
          <Link to="/dashboard/vcards" className="inline-flex items-center gap-2 text-xs font-black uppercase text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> BACK TO MY IDs
          </Link>
          <h1 className="text-4xl sm:text-7xl font-black tracking-tight leading-tight">ID <span className="text-primary">Blueprints.</span></h1>
          <p className="text-base sm:text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed">
            Choose a high-fidelity blueprint optimized for digital business cards and executive networking.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {idTemplates.length > 0 ? idTemplates.map((t) => (
           <Card key={t.id} className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <div className="aspect-[16/10] relative bg-neutral-50 flex items-center justify-center border-b">
                 {t.thumbnail ? (
                   <img src={t.thumbnail} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt="" />
                 ) : (
                   <div className="flex flex-col items-center gap-3 opacity-20">
                      <UserCircle className="h-16 w-16" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">Identity Node</p>
                   </div>
                 )}

                 <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 p-4">
                    <Button 
                      className="rounded-2xl h-14 px-10 font-black text-xs uppercase shadow-2xl gap-2"
                      onClick={() => navigate(`/dashboard/qrs/microsite?id=${crypto.randomUUID()}&loadTemplateId=${t.id}&type=vcard`)}
                    >
                       Use This Blueprint <ArrowRight className="h-4 w-4" />
                    </Button>
                 </div>

                 <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-20">
                    {t.categories?.map((c: string) => (
                      <Badge key={c} className="bg-white/95 text-primary border-none text-[8px] font-black px-2.5 py-0.5 shadow-lg rounded-full">{c}</Badge>
                    ))}
                 </div>
              </div>
              <CardContent className="p-8 space-y-4">
                 <h4 className="text-xl font-black tracking-tight uppercase truncate">{t.name}</h4>
                 <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2">
                    {t.description || "A precision-engineered design node optimized for mobile commerce and high-retention audience interaction."}
                 </p>
              </CardContent>
           </Card>
         )) : (
            <div className="col-span-full py-40 text-center opacity-30 flex flex-col items-center gap-6">
               <div className="h-20 w-20 bg-neutral-100 rounded-full flex items-center justify-center shadow-inner">
                  <IdCard className="h-10 w-10 text-neutral-400" />
               </div>
               <h3 className="text-2xl font-black uppercase">No ID Templates Yet</h3>
            </div>
         )}
      </div>
    </div>
  );
}
