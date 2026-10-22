"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Search, 
  Layout, 
  Layers, 
  Plus, 
  Trash2, 
  Edit2, 
  ArrowLeft, 
  Sparkles, 
  Loader2, 
  Filter, 
  ArrowRight,
  Palette,
  Briefcase,
  Trophy,
  CheckCircle2,
  BookmarkPlus,
  Target,
  Save,
  ImageIcon,
  UploadCloud,
  Info,
  Maximize2
} from "lucide-react";
import { 
  useFirestore, 
  useCollection, 
  useMemoFirebase, 
  deleteDocumentNonBlocking, 
  updateDocumentNonBlocking,
  useStorage 
} from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useUser, useDoc } from "@/firebase";

const ADMIN_EMAILS = ['admin@test.com', 'skillmatrix24@gmail.com'];
const TEMPLATE_CATEGORIES = ["Business", "Real Estate", "Restaurant", "Personal", "Event", "Luxury", "Sales"];
const TYPE_OPTIONS = [
  { id: 'full-page', label: 'Full Page Blueprints', icon: Layout },
  { id: 'block', label: 'Block Presets', icon: Layers }
];

export default function DedicatedLibraryPage() {
  const router = useNavigate();
  const db = useFirestore();
  const storage = useStorage();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<'full-page' | 'block'>('full-page');
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const editThumbInputRef = useRef<HTMLInputElement>(null);

  const userProfileRef = useMemoFirebase(() => (db && user?.uid) ? doc(db, "users", user.uid) : null, [db, user?.uid]);
  const { data: profile } = useDoc(userProfileRef);
  const isAdmin = !!(profile?.isAdmin === true || (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())));

  const templatesRef = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "smartTemplates"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: templates, isLoading } = useCollection(templatesRef);

  const filteredTemplates = useMemo(() => {
    if (!templates) return [];
    return templates.filter(t => {
      const matchesSearch = t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           t.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = t.type === typeFilter;
      const tCats = t.categories || [t.category];
      const matchesCategory = categoryFilter === "All" || tCats.includes(categoryFilter);
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [templates, searchTerm, typeFilter, categoryFilter]);

  const handleDelete = (id: string) => {
    if (!db || !isAdmin) return;
    if (!window.confirm("Permanently delete this template from the global library?")) return;
    deleteDocumentNonBlocking(doc(db, "smartTemplates", id));
    toast({ title: "Template Purged" });
  };

  const handleEditThumbSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setEditingTemplate({...editingTemplate, thumbnail: reader.result as string});
    reader.readAsDataURL(file);
  };

  const handleUpdateTemplate = async () => {
    if (!db || !editingTemplate) return;
    setIsUpdating(true);
    try {
      let finalThumb = editingTemplate.thumbnail;
      if (editingTemplate.thumbnail && editingTemplate.thumbnail.startsWith('data:') && storage) {
        const uploadPath = `templates/thumbnails/${editingTemplate.id}`;
        const tRef = ref(storage, uploadPath);
        await uploadString(tRef, editingTemplate.thumbnail, 'data_url');
        finalThumb = await getDownloadURL(tRef);
      }

      const tRef = doc(db, "smartTemplates", editingTemplate.id);
      await updateDocumentNonBlocking(tRef, {
        name: editingTemplate.name,
        description: editingTemplate.description,
        categories: editingTemplate.categories,
        thumbnail: finalThumb,
        updatedAt: new Date().toISOString()
      });
      toast({ title: "Registry Updated" });
      setEditingTemplate(null);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Update Failed", description: e.message });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground text-center px-4">Syncing Master Archive...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 pb-32 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-4">
        <div className="space-y-4">
          <Link to="/dashboard/qrs/microsite" className="inline-flex items-center gap-2 text-xs font-black uppercase text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> THE STUDIO BUILDER
          </Link>
          <h1 className="text-4xl sm:text-7xl font-black tracking-tight leading-tight">Smart <span className="text-primary">Library</span> Hub</h1>
          <p className="text-base sm:text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed">
            Browse high-fidelity design blueprints and block presets for your next high-conversion smart page.
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
           <Button className="h-14 flex-1 sm:flex-none px-10 rounded-2xl font-black gap-3 shadow-xl" asChild>
              <Link to="/dashboard/qrs/microsite">
                <Plus className="h-5 w-5" /> START BUILDING
              </Link>
           </Button>
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         
         <div className="lg:col-span-3 space-y-6 lg:space-y-8 lg:sticky lg:top-24 order-1">
            <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden">
               <CardHeader className="p-6 sm:p-8 pb-4">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Filter className="h-3.5 w-3.5" /> Filtering</CardTitle>
               </CardHeader>
               <CardContent className="p-6 sm:p-8 pt-0 space-y-8">
                  <div className="space-y-4">
                     <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Asset Type</Label>
                     <div className="grid grid-cols-1 gap-2">
                        {TYPE_OPTIONS.map(opt => (
                          <button 
                            key={opt.id} 
                            onClick={() => setTypeFilter(opt.id as any)}
                            className={cn(
                              "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                              typeFilter === opt.id ? "bg-primary border-primary text-white shadow-lg" : "bg-neutral-50 border-transparent hover:bg-neutral-100"
                            )}
                          >
                             <opt.icon className="h-5 w-5 shrink-0" />
                             <span className="text-xs font-black uppercase leading-none">{opt.label}</span>
                          </button>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-4 border-t pt-6">
                     <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Categories</Label>
                     <div className="flex flex-wrap lg:flex-col gap-2">
                        {["All", ...TEMPLATE_CATEGORIES].map(cat => (
                          <button 
                            key={cat} 
                            onClick={() => setCategoryFilter(cat)}
                            className={cn(
                              "px-4 py-2 rounded-lg text-xs font-bold text-left transition-all",
                              categoryFilter === cat ? "bg-primary/10 text-primary border-primary/20 border" : "bg-neutral-50 text-muted-foreground hover:bg-neutral-100 border border-transparent"
                            )}
                          >
                             {cat}
                          </button>
                        ))}
                     </div>
                  </div>
               </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-neutral-900 text-white rounded-[2rem] p-8 space-y-4 hidden lg:block">
               <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-accent" />
                  <h4 className="text-xs font-black uppercase text-accent tracking-widest">Global Sync</h4>
               </div>
               <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                  These blueprints are optimized for **retina-display** mobile devices and high-conversion sales funnels.
               </p>
            </Card>
         </div>

         <div className="lg:col-span-9 space-y-8 order-2">
            <div className="relative group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary/30 group-focus-within:text-primary transition-colors" />
               <Input 
                placeholder="Search blueprints by name or niche..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="h-16 pl-16 bg-white border-none shadow-2xl rounded-[1.5rem] sm:rounded-3xl text-sm sm:text-lg font-bold placeholder:font-medium transition-all"
               />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
               {filteredTemplates.length > 0 ? filteredTemplates.map((t) => (
                 <Card key={t.id} className="border-none shadow-xl bg-white rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden group hover:shadow-xl transition-all duration-500">
                    <div className="aspect-[16/10] relative bg-neutral-50 flex items-center justify-center border-b">
                       {t.thumbnail ? (
                         <img src={t.thumbnail} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt="" />
                       ) : (
                         <div className="flex flex-col items-center gap-3 opacity-20 group-hover:opacity-40 transition-opacity">
                            <Palette className="h-12 w-12 sm:h-16 sm:w-16" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Visual Node</p>
                         </div>
                       )}

                       <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 p-4">
                          <Button 
                            className="rounded-2xl h-12 sm:h-14 px-6 sm:px-10 font-black text-[10px] sm:text-xs uppercase shadow-2xl gap-2 w-full sm:w-auto"
                            onClick={() => navigate(`/dashboard/qrs/microsite?id=${crypto.randomUUID()}&loadTemplateId=${t.id}`)}
                          >
                             Use {typeFilter === 'full-page' ? 'Blueprint' : 'Block'} <ArrowRight className="h-4 w-4" />
                          </Button>
                       </div>

                       <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[80%] z-20">
                          {(t.categories || [t.category]).map((c: string) => (
                            <Badge key={c} className="bg-white/95 text-primary border-none text-[8px] font-black px-2.5 py-0.5 shadow-lg rounded-full">{c}</Badge>
                          ))}
                       </div>

                       {isAdmin && (
                         <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <button onClick={() => setEditingTemplate({...t, categories: t.categories || [t.category]})} className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-xl hover:scale-110 active:scale-95 transition-all">
                               <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(t.id)} className="h-10 w-10 bg-red-50 text-white rounded-xl flex items-center justify-center shadow-xl hover:bg-red-600 hover:scale-110 active:scale-95 transition-all">
                               <Trash2 className="h-4 w-4" />
                            </button>
                         </div>
                       )}
                    </div>
                    <CardContent className="p-6 sm:p-10 space-y-4">
                       <div className="flex items-center justify-between gap-4">
                          <h4 className="text-xl sm:text-2xl font-black tracking-tight uppercase truncate flex-1">{t.name}</h4>
                          <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest shrink-0">{t.type}</Badge>
                       </div>
                       <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed line-clamp-3 italic">
                          "{t.description || "A precision-engineered design node optimized for mobile commerce and high-retention audience interaction."}"
                       </p>
                    </CardContent>
                 </Card>
               )) : (
                 <div className="md:col-span-2 py-24 sm:py-40 text-center opacity-30 flex flex-col items-center gap-6">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 bg-neutral-100 rounded-full flex items-center justify-center shadow-inner">
                       <Search className="h-8 w-8 sm:h-10 sm:w-10" />
                    </div>
                    <div className="space-y-1">
                       <h3 className="text-xl sm:text-2xl font-black uppercase">Archive Node Empty</h3>
                       <p className="text-sm sm:text-lg font-medium px-4">No results matching your current filters.</p>
                    </div>
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* EDIT DIALOG */}
      <Dialog open={!!editingTemplate} onOpenChange={o => !o && setEditingTemplate(null)}>
        <DialogContent className="sm:max-w-md w-[95vw] rounded-[2.5rem] p-6 sm:p-8 border-none shadow-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <Edit2 className="h-6 w-6 text-primary" />
              Update Registry
            </DialogTitle>
            <DialogDescription className="text-sm font-medium">Modify template metadata and classification nodes.</DialogDescription>
          </DialogHeader>

          {editingTemplate && (
            <div className="space-y-6 sm:space-y-8 py-6">
               {/* Thumbnail Edit */}
               <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Cover Asset</Label>
                  <div 
                    className="relative aspect-[16/10] bg-neutral-50 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:bg-neutral-100 transition-all"
                    onClick={() => editThumbInputRef.current?.click()}
                  >
                    {editingTemplate.thumbnail ? (
                      <img src={editingTemplate.thumbnail} className="w-full h-full object-cover" alt="Thumb" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-40">
                         <ImageIcon className="h-8 w-8" />
                         <p className="text-[10px] font-black uppercase tracking-widest text-center px-4">Upload Cover</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <UploadCloud className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex gap-3">
                    <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-[9px] font-bold text-primary/70 uppercase leading-relaxed">
                      Guideline: **16:10 Ratio** (e.g. 800x500px).
                    </p>
                  </div>
                  <input type="file" ref={editThumbInputRef} className="hidden" accept="image/*" onChange={handleEditThumbSelect} />
               </div>

               <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Asset Name</Label>
                  <Input value={editingTemplate.name} onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})} className="h-12 rounded-xl font-bold border-2" />
               </div>

               <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Classifications</Label>
                  <div className="grid grid-cols-2 gap-3 p-4 bg-neutral-50 rounded-2xl border max-h-32 overflow-y-auto">
                    {TEMPLATE_CATEGORIES.map(cat => (
                      <div key={cat} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`edit-cat-${cat}`} 
                          checked={(editingTemplate.categories || []).includes(cat)} 
                          onCheckedChange={() => {
                            const cur = editingTemplate.categories || [];
                            const next = cur.includes(cat) ? cur.filter((c:any) => c !== cat) : [...cur, cat];
                            setEditingTemplate({...editingTemplate, categories: next});
                          }}
                        />
                        <label htmlFor={`edit-cat-${cat}`} className="text-[10px] font-bold cursor-pointer">{cat}</label>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Strategy Description</Label>
                  <Textarea 
                    value={editingTemplate.description} 
                    onChange={e => setEditingTemplate({...editingTemplate, description: e.target.value})} 
                    className="min-h-[100px] rounded-2xl text-sm bg-neutral-50 border-none shadow-inner leading-relaxed"
                  />
               </div>
            </div>
          )}

          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setEditingTemplate(null)} className="rounded-xl font-bold h-12 w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleUpdateTemplate} disabled={isUpdating} className="rounded-xl font-black gap-2 shadow-xl px-8 h-12 bg-primary text-white w-full sm:w-auto">
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Commit Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
