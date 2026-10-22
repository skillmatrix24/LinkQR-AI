"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Save, 
  Bold, 
  UploadCloud, 
  Eye,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Quote,
  Link as LinkIcon,
  Sparkles,
  ArrowLeft,
  Globe,
  Languages,
  ExternalLink,
  SearchCode,
  Zap,
  BrainCircuit,
  List,
  ListOrdered
} from "lucide-react";
import { 
  useFirestore, 
  useDoc, 
  useMemoFirebase, 
  setDocumentNonBlocking,
  useStorage 
} from "@/firebase";
import { doc, serverTimestamp, Timestamp } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { generateBlogSuggestions, type BlogAIOutput } from "@/ai/flows/blog-ai-assistant-flow";
import { cn } from "@/lib/utils";

interface BlogEditorFormProps {
  id?: string;
}

const CATEGORIES = ["Marketing", "Technology", "Design", "Tutorials", "Business", "AI & Trends"];

export default function BlogEditorForm({ id }: BlogEditorFormProps) {
  const db = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const router = useNavigate();
  
  const [activeLang, setActiveLang] = useState<"en" | "hi">("en");
  const [postData, setPostData] = useState<any>({
    id: id || crypto.randomUUID(),
    titleEn: "",
    titleHi: "",
    slug: "",
    excerptEn: "",
    excerptHi: "",
    contentEn: "",
    contentHi: "",
    category: "Marketing",
    image: "https://picsum.photos/seed/blog/800/400",
    author: "Admin Team",
    readTime: "5 min read",
    status: "draft",
    indexingStatus: "pending",
    seoKeywords: "",
    scheduledAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    createdAt: null
  });

  const postRef = useMemoFirebase(() => (db && id) ? doc(db, "blogPosts", id) : null, [db, id]);
  const { data: existingPost, isLoading: isPostLoading } = useDoc(postRef);

  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<BlogAIOutput | null>(null);
  const [aiHint, setAiHint] = useState("");
  
  const coverImageRef = useRef<HTMLInputElement>(null);
  const visualEditorEnRef = useRef<HTMLDivElement>(null);
  const visualEditorHiRef = useRef<HTMLDivElement>(null);

  // CRITICAL: Robust Content Initialization for Edit Mode
  useEffect(() => {
    if (existingPost) {
      const p = { ...existingPost };
      if (p.scheduledAt?.toDate) {
        p.scheduledAt = format(p.scheduledAt.toDate(), "yyyy-MM-dd'T'HH:mm");
      }
      setPostData(p);
      
      // Inject content directly into DOM to ensure it shows up in the contentEditable area
      if (visualEditorEnRef.current) visualEditorEnRef.current.innerHTML = p.contentEn || "";
      if (visualEditorHiRef.current) visualEditorHiRef.current.innerHTML = p.contentHi || "";
    }
  }, [existingPost]);

  const forceSyncFromDOM = () => {
    const enContent = visualEditorEnRef.current?.innerHTML || "";
    const hiContent = visualEditorHiRef.current?.innerHTML || "";
    return { enContent, hiContent };
  };

  const handleSave = async () => {
    if (!db || !postData.titleEn || !postData.slug) {
      toast({ variant: "destructive", title: "Missing Information", description: "Headline and Slug are required." });
      return;
    }

    setIsSaving(true);
    try {
      const { enContent, hiContent } = forceSyncFromDOM();
      const saveRef = doc(db, "blogPosts", postData.id);
      
      let finalScheduledAt = null;
      if (postData.status === 'scheduled' && postData.scheduledAt) {
        finalScheduledAt = Timestamp.fromDate(new Date(postData.scheduledAt));
      }

      const dataToSave = {
        ...postData,
        contentEn: enContent,
        contentHi: hiContent,
        updatedAt: serverTimestamp(),
        createdAt: postData.createdAt || serverTimestamp(),
        scheduledAt: finalScheduledAt,
      };

      setDocumentNonBlocking(saveRef, dataToSave, { merge: true });
      toast({ title: "Deployment Successful", description: "Changes saved to registry." });
      navigate("/admin/blog");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Save Failed", description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Executive Command logic: uses onMouseDown preventDefault to prevent focus loss
   */
  const execCmd = (command: string, value: string = "") => {
    const activeRef = activeLang === 'en' ? visualEditorEnRef : visualEditorHiRef;
    if (activeRef.current) {
      activeRef.current.focus();
    }
    
    if (command === 'formatBlock') {
      document.execCommand(command, false, `<${value}>`);
    } else {
      document.execCommand(command, false, value);
    }
  };

  const insertCustomHtml = (html: string) => {
    const activeRef = activeLang === 'en' ? visualEditorEnRef : visualEditorHiRef;
    activeRef.current?.focus();
    const selection = window.getSelection();
    if (selection?.rangeCount) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const el = document.createElement("div");
      el.innerHTML = html;
      const frag = document.createDocumentFragment();
      let node;
      while ((node = el.firstChild)) frag.appendChild(node);
      range.insertNode(frag);
    } else if (activeRef.current) {
      activeRef.current.innerHTML += html;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: "destructive", title: "Size Limit", description: "Max 2MB per asset." });
      return;
    }

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const imageId = crypto.randomUUID();
      const storageRef = ref(storage, `blog/${postData.id}/${imageId}`);
      await uploadString(storageRef, dataUrl, 'data_url');
      const url = await getDownloadURL(storageRef);

      const imgHtml = `<img src="${url}" alt="blog asset" style="border-radius:1.5rem; margin:2rem 0; width:100%; height:auto; display:block; box-shadow:0 20px 40px rgba(0,0,0,0.1);" />`;
      insertCustomHtml(imgHtml);
      toast({ title: "Visual Injected" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload Fault", description: err.message });
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = ''; 
    }
  };

  const handleAddButton = () => {
    const text = prompt("Button Label:", "Learn More");
    const link = prompt("Target URL:", "https://");
    if (!text || !link) return;
    
    const btnHtml = `<div style="text-align:center; margin:2rem 0;"><a to="${link}" target="_blank" style="display:inline-block; background-color:hsl(var(--primary)); color:white; padding:14px 32px; border-radius:1rem; font-weight:800; text-decoration:none; text-transform:uppercase; letter-spacing:0.1em; font-size:0.75rem; box-shadow:0 12px 24px rgba(0,0,0,0.2);">${text}</a></div>`;
    insertCustomHtml(btnHtml);
  };

  const handleRunAI = async () => {
    const { enContent, hiContent } = forceSyncFromDOM();
    const content = activeLang === 'en' ? enContent : hiContent;
    
    if (!content && !aiHint) {
      toast({ variant: "destructive", title: "Input Required", description: "Provide content for the AI to analyze." });
      return;
    }
    setIsAiLoading(true);
    try {
      const result = await generateBlogSuggestions({
        content: (content || "").substring(0, 5000),
        currentTitle: activeLang === 'en' ? postData.titleEn : postData.titleHi,
        hint: aiHint + ` (Context: ${activeLang === 'hi' ? 'Hindi Content' : 'English Content'})`
      });
      setAiSuggestions(result);
      toast({ title: "Intelligence Generated" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "AI Sync Fault", description: err.message });
    } finally {
      setIsAiLoading(false);
    }
  };

  if (id && isPostLoading) return (
    <div className="flex flex-col items-center justify-center p-32 gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Synchronizing CMS Node...</p>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-32 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-white shadow-sm border" onClick={() => navigate("/admin/blog")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Enterprise CMS</h1>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Secure Writing Environment
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-xl h-12 px-6 gap-2 border-2 hover:bg-white" onClick={() => window.open(`/blog/${postData.slug}`, '_blank')}>
            <Eye className="h-4 w-4" /> Preview Live
          </Button>
          <Button onClick={handleSave} disabled={isSaving || uploadingImage} className="h-12 px-8 rounded-xl font-black gap-2 shadow-2xl shadow-primary/20">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Deploy Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Tabs value={activeLang} onValueChange={(v: any) => setActiveLang(v)} className="w-full">
            <TabsList className="bg-neutral-100 h-16 p-1.5 rounded-2xl grid grid-cols-2 mb-8 shadow-inner">
              <TabsTrigger value="en" className="rounded-xl font-black gap-2 text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg"><Globe className="h-4 w-4" /> English</TabsTrigger>
              <TabsTrigger value="hi" className="rounded-xl font-black gap-2 text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg"><Languages className="h-4 w-4" /> हिंदी (Hindi)</TabsTrigger>
            </TabsList>

            <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8 sm:p-12 space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Headline Translation ({activeLang.toUpperCase()})</Label>
                  <Input 
                    value={activeLang === 'en' ? postData.titleEn : postData.titleHi} 
                    onChange={e => {
                      const val = e.target.value;
                      if (activeLang === 'en') {
                        const slug = val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                        setPostData({...postData, titleEn: val, slug});
                      } else {
                        setPostData({...postData, titleHi: val});
                      }
                    }} 
                    placeholder={`Enter ${activeLang === 'en' ? 'English' : 'Hindi'} headline...`} 
                    className="h-20 text-2xl sm:text-4xl font-black border-none bg-neutral-50/50 rounded-[1.5rem] shadow-inner focus:ring-2 focus:ring-primary px-8"
                  />
                </div>

                <div className="space-y-4">
                  {/* COMPREHENSIVE TOOLBAR: Based on user image */}
                  <div className="flex flex-wrap items-center justify-center gap-2 bg-white p-3 rounded-2xl border shadow-xl sticky top-4 z-[100] mx-auto w-fit">
                    <div className="flex items-center gap-1 px-1 border-r pr-3">
                      {['H1', 'H2', 'H3', 'H4', 'H5'].map(h => (
                        <Button key={h} variant="ghost" size="sm" onMouseDown={(e) => { e.preventDefault(); execCmd('formatBlock', h.toLowerCase()); }} className="h-9 px-3 font-black text-[10px] hover:bg-neutral-100 rounded-lg">{h}</Button>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-1 px-1 border-r pr-3">
                      <Button variant="ghost" size="sm" onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }} className="h-9 w-9 p-0 hover:bg-neutral-100 rounded-lg"><Bold className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onMouseDown={(e) => { e.preventDefault(); execCmd('formatBlock', 'blockquote'); }} className="h-9 w-9 p-0 hover:bg-neutral-100 rounded-lg"><Quote className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onMouseDown={(e) => { e.preventDefault(); const url = prompt("Destination URL:"); if(url) execCmd('createLink', url); }} className="h-9 w-9 p-0 hover:bg-neutral-100 rounded-lg"><LinkIcon className="h-4 w-4" /></Button>
                    </div>

                    <div className="flex items-center gap-1 px-1 border-r pr-3">
                      <Button variant="ghost" size="sm" onMouseDown={(e) => { e.preventDefault(); execCmd('insertUnorderedList'); }} className="h-9 w-9 p-0 hover:bg-neutral-100 rounded-lg"><List className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onMouseDown={(e) => { e.preventDefault(); execCmd('insertOrderedList'); }} className="h-9 w-9 p-0 hover:bg-neutral-100 rounded-lg"><ListOrdered className="h-4 w-4" /></Button>
                    </div>
                    
                    <div className="flex items-center gap-1 px-1 border-r pr-3">
                      <Button variant="ghost" size="sm" onMouseDown={(e) => { e.preventDefault(); document.getElementById('contentImageUpload')?.click(); }} className="h-9 w-9 p-0 text-primary hover:bg-primary/5 rounded-lg"><UploadCloud className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onMouseDown={(e) => { e.preventDefault(); handleAddButton(); }} className="h-9 w-9 p-0 text-accent hover:bg-accent/5 rounded-lg"><ExternalLink className="h-4 w-4" /></Button>
                    </div>
                    
                    <div className="flex items-center gap-1 px-1">
                      <Button variant="ghost" size="sm" onMouseDown={(e) => { e.preventDefault(); execCmd('justifyLeft'); }} className="h-9 w-9 p-0 hover:bg-neutral-100 rounded-lg"><AlignLeft className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onMouseDown={(e) => { e.preventDefault(); execCmd('justifyCenter'); }} className="h-9 w-9 p-0 hover:bg-neutral-100 rounded-lg"><AlignCenter className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onMouseDown={(e) => { e.preventDefault(); execCmd('justifyRight'); }} className="h-9 w-9 p-0 hover:bg-neutral-100 rounded-lg"><AlignRight className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onMouseDown={(e) => { e.preventDefault(); execCmd('justifyFull'); }} className="h-9 w-9 p-0 hover:bg-neutral-100 rounded-lg"><AlignJustify className="h-4 w-4" /></Button>
                    </div>
                  </div>

                  {/* VISUAL CANVAS: Always present in DOM to prevent blank loads */}
                  <div className="mt-8 border-4 border-dashed border-neutral-100 rounded-[2.5rem] bg-neutral-50/20 overflow-hidden min-h-[700px] shadow-inner relative">
                    <div 
                      ref={visualEditorEnRef} 
                      contentEditable 
                      className={cn(
                        "min-h-[700px] p-12 focus:outline-none prose prose-neutral max-w-none prose-headings:font-black prose-p:text-muted-foreground prose-p:text-lg prose-img:rounded-[2rem] prose-img:shadow-2xl",
                        activeLang !== 'en' && "hidden"
                      )} 
                    />
                    <div 
                      ref={visualEditorHiRef} 
                      contentEditable 
                      className={cn(
                        "min-h-[700px] p-12 focus:outline-none prose prose-neutral max-w-none prose-headings:font-black prose-p:text-muted-foreground prose-p:text-lg prose-img:rounded-[2rem] prose-img:shadow-2xl",
                        activeLang !== 'hi' && "hidden"
                      )} 
                    />
                  </div>
                  
                  <input type="file" id="contentImageUpload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
              </CardContent>
            </Card>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-2xl bg-[#0a0a0a] text-white rounded-[2rem] overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><BrainCircuit className="h-6 w-6 text-accent" /><h3 className="font-bold text-sm uppercase tracking-[0.2em]">AI Intelligence</h3></div>
                {isAiLoading && <Loader2 className="h-4 w-4 animate-spin text-accent" />}
              </div>
              <div className="space-y-3">
                <Label className="text-[9px] font-bold uppercase text-accent tracking-[0.3em] ml-1">Assistant Context</Label>
                <Textarea 
                  value={aiHint} 
                  onChange={e => setAiHint(e.target.value)} 
                  placeholder="Ask for titles, keywords, or summary..." 
                  className="text-xs rounded-xl bg-white/5 border-white/10 h-24 text-white focus:ring-accent focus:border-transparent placeholder:text-white/20" 
                />
              </div>
              <Button onClick={handleRunAI} disabled={isAiLoading} className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20">
                <Sparkles className="h-4 w-4" /> Analyze Semantic Data
              </Button>
              
              {aiSuggestions && (
                <div className="space-y-4 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-3">
                    <p className="text-[9px] font-black uppercase text-neutral-500 tracking-widest">Suggested Headlines</p>
                    {aiSuggestions.suggestedTitles.map((t, i) => (
                      <button 
                        key={i} 
                        onClick={() => { 
                          if(activeLang === 'en') setPostData((prev: any) => ({...prev, titleEn: t, slug: t.toLowerCase().replace(/[^a-z0-9]/g, '-')})); 
                          else setPostData((prev: any) => ({...prev, titleHi: t})); 
                          toast({title: "Strategy Applied"}); 
                        }} 
                        className="w-full text-left text-[11px] bg-white/5 p-4 rounded-xl border border-white/5 hover:border-accent transition-all font-bold group flex items-center justify-between"
                      >
                        <span className="line-clamp-2">{t}</span> <Zap className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 text-accent transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                  <SearchCode className="h-3.5 w-3.5" /> SEO Keywords
                </Label>
                <Input 
                  value={postData.seoKeywords} 
                  onChange={e => setPostData({...postData, seoKeywords: e.target.value})} 
                  placeholder="e.g. dynamic qr, marketing tech..." 
                  className="h-12 bg-neutral-50 border-none rounded-xl text-xs font-bold shadow-inner" 
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Persistent URL Slug</Label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                  <Input 
                    value={postData.slug} 
                    onChange={e => setPostData({...postData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
                    className="h-12 pl-11 bg-neutral-50 border-none rounded-xl text-xs font-mono shadow-inner text-primary" 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Classification</Label>
                <Select value={postData.category} onValueChange={v => setPostData({...postData, category: v})}>
                  <SelectTrigger className="h-12 rounded-xl bg-neutral-50 border-none font-bold text-xs shadow-inner">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">SEO Excerpt ({activeLang.toUpperCase()})</Label>
                <Textarea 
                  value={activeLang === 'en' ? postData.excerptEn : postData.excerptHi} 
                  onChange={e => activeLang === 'en' ? setPostData({...postData, excerptEn: e.target.value}) : setPostData({...postData, excerptHi: e.target.value})} 
                  placeholder="Concise summary for search engines..."
                  className="min-h-[100px] bg-neutral-50 border-none rounded-[1.25rem] text-xs leading-relaxed shadow-inner" 
                />
              </div>

              <div className="pt-6 border-t space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Lifecycle Status</Label>
                  <Select value={postData.status} onValueChange={v => setPostData({...postData, status: v})}>
                    <SelectTrigger className="h-14 rounded-xl bg-neutral-50 border-none font-black text-xs shadow-inner">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft" className="font-bold">Private Draft</SelectItem>
                      <SelectItem value="published" className="font-bold">Public Launch (Live)</SelectItem>
                      <SelectItem value="scheduled" className="font-bold">Scheduled Ingress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {postData.status === 'scheduled' && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                    <Label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">Launch Date/Time</Label>
                    <Input 
                      type="datetime-local" 
                      value={postData.scheduledAt} 
                      onChange={e => setPostData({...postData, scheduledAt: e.target.value})}
                      className="h-12 bg-primary/5 border-primary/20 rounded-xl text-xs font-bold"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden">
            <CardContent className="p-8 space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Story Hero Asset</Label>
              <div 
                className="relative aspect-video rounded-[1.5rem] overflow-hidden border-2 border-dashed border-neutral-100 bg-neutral-50 flex flex-col items-center justify-center cursor-pointer group hover:bg-neutral-100 transition-colors" 
                onClick={() => coverImageRef.current?.click()}
              >
                {postData.image ? (
                  <>
                    <img src={postData.image} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" alt="" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <UploadCloud className="h-8 w-8 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="text-center opacity-40">
                    <UploadCloud className="h-10 w-10 mx-auto" />
                    <p className="text-[10px] font-black uppercase mt-3 tracking-widest">Select Narrative Image</p>
                  </div>
                )}
                {uploadingImage && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}
              </div>
              <input type="file" ref={coverImageRef} className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file || !storage) return;
                setUploadingImage(true);
                const reader = new FileReader();
                reader.onloadend = async () => {
                  const storageRef = ref(storage, `blog/${postData.id}/cover`);
                  await uploadString(storageRef, reader.result as string, 'data_url');
                  const url = await getDownloadURL(storageRef);
                  setPostData((prev: any) => ({ ...prev, image: url }));
                  setUploadingImage(false);
                };
                reader.readAsDataURL(file);
              }} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
