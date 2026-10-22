'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  ArrowRight,
  Palette,
  Target,
  Copy,
  ChevronDown,
  ChevronUp,
  Save,
  RefreshCcw,
  Maximize2,
  UploadCloud,
  ImageIcon,
  BookmarkPlus,
  CheckCircle2,
  Loader2,
  Filter
} from "lucide-react";
import { 
  useFirestore, 
  useCollection, 
  useMemoFirebase, 
  deleteDocumentNonBlocking, 
  updateDocumentNonBlocking,
  useStorage,
  setDocumentNonBlocking 
} from "@/firebase";
import { collection, query, orderBy, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useUser } from "@/firebase";

interface LibraryTabProps {
  pageData: any;
  setPageData: (data: any) => void;
  isAdmin?: boolean;
  onUpdateContent?: (templateId: string, type: 'full-page' | 'block') => Promise<void>;
}

const CATEGORIES = ["All", "Business", "Real Estate", "Restaurant", "Personal", "Event", "Luxury", "Sales"];
const TEMPLATE_CATEGORIES = ["Business", "Real Estate", "Restaurant", "Personal", "Event", "Luxury", "Sales"];

export function LibraryTab({ pageData, setPageData, isAdmin, onUpdateContent }: LibraryTabProps) {
  const db = useFirestore();
  const storage = useStorage();
  const { user } = useUser();
  const { toast } = useToast();
  const [typeFilter, setTypeFilter] = useState<'full-page' | 'block'>('full-page');
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveType, setSaveType] = useState<'full-page' | 'block'>('full-page');
  const [saveForm, setSaveValues] = useState<any>({ name: '', description: '', category: 'Business' });
  const [isSaving, setIsSaving] = useState(false);

  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSyncingContent, setIsSyncingContent] = useState(false);
  const editThumbnailInputRef = useRef<HTMLInputElement>(null);

  const templatesRef = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "smartTemplates"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: allTemplates, isLoading } = useCollection(templatesRef);

  const filteredTemplates = useMemo(() => {
    if (!allTemplates) return [];
    return allTemplates.filter(t => {
      const matchesType = t.type === typeFilter;
      const templateCats = t.categories || (t.category ? [t.category] : []);
      const matchesCategory = categoryFilter === "All" || templateCats.includes(categoryFilter);
      const matchesSearch = t.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesCategory && matchesSearch;
    });
  }, [allTemplates, typeFilter, categoryFilter, searchTerm]);

  const applyTemplate = (template: any) => {
    if (template.type === 'full-page') {
      if (!window.confirm("क्या आप इस टेम्पलेट को लागू करना चाहते हैं? इससे आपके वर्तमान ब्लॉक्स बदल जाएंगे।")) return;
      
      setPageData({
        ...pageData,
        sections: template.sections || [],
        themeColor: template.design?.themeColor || pageData.themeColor,
        themeVariant: template.design?.themeVariant || pageData.themeVariant,
        cardRadius: template.design?.cardRadius || pageData.cardRadius,
        fontType: template.design?.fontType || pageData.fontType
      });
      toast({ title: "Blueprint Applied", description: `"${template.name}" layout is now active.` });
    } else if (template.type === 'block') {
      const id = `${template.targetBlockType}-${crypto.randomUUID().substring(0, 8)}`;
      const newSections = [...(pageData.sections || []), { 
        id, 
        type: template.targetBlockType, 
        data: template.data 
      }];
      setPageData({ ...pageData, sections: newSections });
      toast({ title: "Block Injected", description: `Added ${template.name} to the bottom.` });
    }
  };

  const handleSaveToLibrary = async () => {
    if (!db || !user?.uid || !saveForm.name) {
      toast({ variant: "destructive", title: "Error", description: "Name is required to save template." });
      return;
    }

    setIsSaving(true);
    try {
      const tid = crypto.randomUUID();
      const tRef = doc(db, "smartTemplates", tid);
      
      const templateData: any = {
        id: tid,
        userId: user.uid,
        name: saveForm.name,
        description: saveForm.description,
        type: saveType,
        categories: [saveForm.category],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (saveType === 'full-page') {
        templateData.sections = JSON.parse(JSON.stringify(pageData.sections || []));
        templateData.design = {
          themeColor: pageData.themeColor || "#6750A4",
          themeVariant: pageData.themeVariant || "light",
          fontType: pageData.fontType || "font-body",
          cardRadius: pageData.cardRadius || 32
        };
      } else {
        const activeBlock = pageData.sections?.[0];
        if (!activeBlock) {
          toast({ variant: "destructive", title: "Empty Page", description: "Add at least one block before saving." });
          setIsSaving(false);
          return;
        }
        templateData.targetBlockType = activeBlock.type;
        templateData.data = JSON.parse(JSON.stringify(activeBlock.data || {}));
      }

      setDocumentNonBlocking(tRef, templateData, { merge: true });
      
      setTimeout(() => {
        toast({ title: "Saved to Library", description: "Design node added to global archive." });
        setIsSaving(false);
        setIsSaveDialogOpen(false);
        setSaveValues({ name: '', description: '', category: 'Business' });
      }, 500);

    } catch (err: any) {
      console.error("Library Tab Save Error:", err);
      toast({ variant: "destructive", title: "Save Failed", description: err.message });
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = (e: React.MouseEvent, tid: string) => {
    e.stopPropagation();
    if (!db) return;
    if (!window.confirm("क्या आप इस टेम्पलेट को हमेशा के लिए हटाना चाहते हैं?")) return;
    
    deleteDocumentNonBlocking(doc(db, "smartTemplates", tid));
    toast({ title: "Template Purged" });
  };

  const handleOpenEdit = (e: React.MouseEvent, template: any) => {
    e.stopPropagation();
    setEditingTemplate({
      ...template,
      categories: template.categories || (template.category ? [template.category] : [])
    });
  };

  const handleEditThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditingTemplate((prev: any) => ({ ...prev, thumbnail: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateTemplate = async () => {
    if (!db || !editingTemplate) return;
    setIsUpdating(true);
    try {
      let finalThumbnailUrl = editingTemplate.thumbnail;
      if (editingTemplate.thumbnail && editingTemplate.thumbnail.startsWith('data:') && storage) {
        const thumbRef = ref(storage, `templates/thumbnails/${editingTemplate.id}`);
        await uploadString(thumbRef, editingTemplate.thumbnail, 'data_url');
        finalThumbnailUrl = await getDownloadURL(thumbRef);
      }

      const tRef = doc(db, "smartTemplates", editingTemplate.id);
      await updateDocumentNonBlocking(tRef, {
        name: editingTemplate.name,
        description: editingTemplate.description,
        categories: editingTemplate.categories,
        thumbnail: finalThumbnailUrl,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Archive Updated" });
      setEditingTemplate(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeepUpdate = async () => {
    if (!editingTemplate || !onUpdateContent) return;
    if (!window.confirm("सावधानी: यह इस टेम्पलेट के पुराने कंटेंट को हटाकर वर्तमान एडिटर के डेटा से बदल देगा। क्या आप सुनिश्चित हैं?")) return;
    
    setIsSyncingContent(true);
    try {
      await onUpdateContent(editingTemplate.id, editingTemplate.type);
      setEditingTemplate(null);
    } finally {
      setIsSyncingContent(false);
    }
  };

  const toggleCategory = (cat: string) => {
    if (!editingTemplate) return;
    const current = editingTemplate.categories || [];
    const newCats = current.includes(cat) 
      ? current.filter((c: string) => c !== cat) 
      : [...current, cat];
    setEditingTemplate((prev: any) => ({ ...prev, categories: newCats }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      <div className="flex items-center justify-between px-1">
         <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Library Hub</p>
         <Button variant="ghost" size="sm" asChild className="h-7 px-2 rounded-lg text-[9px] font-bold gap-1 text-primary hover:bg-primary/5">
            <Link to="/dashboard/qrs/microsite/templates">
               <Maximize2 className="h-3 w-3" /> Full Screen
            </Link>
         </Button>
      </div>

      <div className="p-4 bg-primary/5 border-2 border-dashed border-primary/20 rounded-[2rem] space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg"><BookmarkPlus className="h-5 w-5" /></div>
            <h4 className="font-black text-xs uppercase tracking-tight text-primary">Archive Engine</h4>
          </div>
          <Button onClick={() => setIsSaveDialogOpen(true)} className="w-full h-11 rounded-xl font-black text-[10px] uppercase gap-2 shadow-xl bg-primary text-white">
            <Save className="h-4 w-4" /> Save current to Archive
          </Button>
      </div>

      <div className="bg-neutral-100 p-1 rounded-xl flex gap-1 shadow-inner">
        <button 
          onClick={() => { setTypeFilter('full-page'); setCategoryFilter('All'); }}
          className={cn(
            "flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all",
            typeFilter === 'full-page' ? "bg-white text-primary shadow-md" : "text-muted-foreground hover:bg-white/50"
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <Layout className="h-3 w-3" /> Blueprints
          </div>
        </button>
        <button 
          onClick={() => { setTypeFilter('block'); setCategoryFilter('All'); }}
          className={cn(
            "flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all",
            typeFilter === 'block' ? "bg-white text-primary shadow-md" : "text-muted-foreground hover:bg-white/50"
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <Layers className="h-3 w-3" /> Blocks
          </div>
        </button>
      </div>

      <div className="space-y-4">
         <div className="relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
           <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search templates..." className="h-9 pl-9 rounded-xl text-xs border-none bg-neutral-100" />
         </div>

         <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  "whitespace-nowrap px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 transition-all shrink-0",
                  categoryFilter === cat ? "bg-primary border-primary text-white shadow-lg" : "bg-white border-neutral-100 text-muted-foreground hover:border-primary/20"
                )}
              >
                {cat}
              </button>
            ))}
         </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
           <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Syncing Archive...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTemplates.length > 0 ? filteredTemplates.map((t) => (
            <Card key={t.id} className="border-none shadow-sm bg-white rounded-2xl overflow-hidden group hover:shadow-xl transition-all cursor-pointer border border-neutral-100/50" onClick={() => applyTemplate(t)}>
              <div className="aspect-video relative overflow-hidden bg-neutral-50 flex items-center justify-center border-b">
                 {t.thumbnail ? (
                   <img src={t.thumbnail} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                 ) : (
                   <div className="flex flex-col items-center gap-2 opacity-20 group-hover:opacity-40 transition-opacity">
                      <Palette className="h-12 w-12" />
                      <p className="text-[8px] font-black uppercase tracking-[0.3em]">No Preview</p>
                   </div>
                 )}
                 
                 <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button size="sm" className="rounded-xl font-black text-[10px] uppercase h-10 px-6 shadow-2xl">
                      {typeFilter === 'full-page' ? 'Deploy Blueprint' : 'Inject Block'}
                    </Button>
                 </div>

                 {(isAdmin || (user?.uid && t.userId === user.uid)) && (
                   <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                      <button onClick={(e) => handleOpenEdit(e, t)} className="h-8 w-8 bg-white/90 backdrop-blur-md rounded-lg flex items-center justify-center text-primary shadow-lg hover:bg-white hover:scale-105 transition-all">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={(e) => handleDeleteTemplate(e, t.id)} className="h-8 w-8 bg-red-50/90 backdrop-blur-md rounded-lg flex items-center justify-center text-white shadow-lg hover:bg-red-600 hover:scale-105 transition-all">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                   </div>
                 )}

                 <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 max-w-[80%] z-20">
                    {(t.categories || [t.category]).map((c: string) => (
                      <Badge key={c} className="bg-white/95 text-primary border-none text-[8px] font-black px-2 shadow-sm whitespace-nowrap">{c}</Badge>
                    ))}
                 </div>
              </div>
              <CardContent className="p-5 space-y-2">
                 <h4 className="font-black text-xs uppercase tracking-tight truncate group-hover:text-primary transition-colors">{t.name}</h4>
                 <p className="text-[10px] text-muted-foreground font-medium line-clamp-2 leading-relaxed">{t.description}</p>
              </CardContent>
            </Card>
          )) : (
            <div className="py-24 text-center opacity-30 flex flex-col items-center gap-6">
               <div className="h-16 w-16 bg-neutral-100 rounded-full flex items-center justify-center shadow-inner">
                  <Filter className="h-8 w-8 text-neutral-400" />
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest">Library Empty</p>
                  <p className="text-[9px] font-medium max-w-[200px] mx-auto italic">No {typeFilter} templates found.</p>
               </div>
            </div>
          )}
        </div>
      )}

      {/* SAVE DIALOG */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <Save className="h-6 w-6 text-primary" />
              Archive Template
            </DialogTitle>
            <DialogDescription className="text-sm font-medium">Add this design to your personal or global library.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Template Name</Label>
                  <Input value={saveForm.name} onChange={e => setSaveValues((prev: any) => ({...prev, name: e.target.value}))} placeholder="e.g. Luxury Identity v1" className="h-12 rounded-xl font-bold bg-neutral-50 border-none shadow-inner" />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Archive Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                     <button onClick={() => setSaveType('full-page')} className={cn("h-10 rounded-xl text-[9px] font-black uppercase border-2 transition-all", saveType === 'full-page' ? "bg-primary text-white border-primary shadow-lg" : "bg-white")}>FULL BLUEPRINT</button>
                     <button onClick={() => setSaveType('block')} className={cn("h-10 rounded-xl text-[9px] font-black uppercase border-2 transition-all", saveType === 'block' ? "bg-primary text-white border-primary shadow-lg" : "bg-white")}>SINGLE BLOCK</button>
                  </div>
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Niche Category</Label>
                  <select value={saveForm.category} onChange={e => setSaveValues((prev: any) => ({...prev, category: e.target.value}))} className="w-full h-12 rounded-xl bg-neutral-50 border px-4 text-sm font-bold outline-none">
                     {TEMPLATE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Description</Label>
                  <Textarea value={saveForm.description} onChange={e => setSaveValues((prev: any) => ({...prev, description: e.target.value}))} placeholder="What makes this template special?" className="min-h-[80px] rounded-xl text-sm bg-neutral-50 border-none shadow-inner" />
               </div>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-4 border-t">
            <Button variant="ghost" onClick={() => setIsSaveDialogOpen(false)} className="rounded-xl font-bold h-12 flex-1">Cancel</Button>
            <Button onClick={handleSaveToLibrary} disabled={isSaving || !saveForm.name} className="rounded-xl font-black gap-2 shadow-xl px-8 h-12 bg-primary text-white flex-1">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Publish to Library
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={!!editingTemplate} onOpenChange={(o) => !o && setEditingTemplate(null)}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-8 border-none shadow-2xl overflow-y-auto max-h-[90vh] bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <Edit2 className="h-6 w-6 text-primary" />
              Edit Registry
            </DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-8 py-4">
               <div className="space-y-6">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Cover Asset</Label>
                    <div className="relative aspect-[16/10] bg-neutral-50 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:bg-neutral-100 transition-all" onClick={() => editThumbnailInputRef.current?.click()}>
                      {editingTemplate.thumbnail ? <img src={editingTemplate.thumbnail} className="w-full h-full object-cover" alt="Thumb" /> : <div className="flex flex-col items-center gap-2 opacity-40"><ImageIcon className="h-8 w-8" /><p className="text-[10px] font-black uppercase">Upload Cover</p></div>}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><UploadCloud className="h-6 w-6 text-white" /></div>
                    </div>
                    <input type="file" ref={editThumbnailInputRef} className="hidden" accept="image/*" onChange={handleEditThumbnailSelect} />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Name</Label>
                    <Input value={editingTemplate.name} onChange={e => setEditingTemplate((prev: any) => ({...prev, name: e.target.value}))} className="h-11 rounded-xl font-bold bg-neutral-50 border-none shadow-inner" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Categories</Label>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-neutral-50 rounded-xl border max-h-32 overflow-y-auto">
                        {TEMPLATE_CATEGORIES.map(cat => (
                            <div key={cat} className="flex items-center space-x-2">
                                <Checkbox id={`edit-cat-${cat}`} checked={(editingTemplate.categories || []).includes(cat)} onCheckedChange={() => toggleCategory(cat)} /> 
                                <label htmlFor={`edit-cat-${cat}`} className="text-[10px] font-bold cursor-pointer">{cat}</label>
                            </div>
                        ))}
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Description</Label>
                    <Textarea value={editingTemplate.description} onChange={e => setEditingTemplate((prev: any) => ({...prev, description: e.target.value}))} className="min-h-[80px] rounded-xl text-sm bg-neutral-50 border-none shadow-inner" />
                 </div>
               </div>
               <div className="pt-6 border-t border-dashed">
                  <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg"><RefreshCcw className="h-4 w-4" /></div>
                        <h4 className="font-black text-xs uppercase tracking-tight text-primary">Sync Content</h4>
                    </div>
                    <Button variant="outline" onClick={handleDeepUpdate} disabled={isSyncingContent} className="w-full h-11 rounded-xl font-black text-[10px] uppercase border-2 gap-2 hover:bg-primary/10 transition-all">{isSyncingContent ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Overwrite with Current workspace</Button>
                  </div>
               </div>
            </div>
          )}
          <DialogFooter className="gap-2 pt-4 border-t">
            <Button variant="ghost" onClick={() => setEditingTemplate(null)} className="rounded-xl font-bold h-12 flex-1">Cancel</Button>
            <Button onClick={handleUpdateTemplate} disabled={isUpdating} className="rounded-xl font-black gap-2 shadow-xl px-8 h-12 bg-primary text-white flex-1">
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Save Metadata
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
