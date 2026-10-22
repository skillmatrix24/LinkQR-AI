"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { ArrowLeft, Share2, Tag, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFirestore } from "@/firebase";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const db = useFirestore();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewLang, setViewLang] = useState<"en" | "hi">("en");

  useEffect(() => {
    async function fetchPost() {
      if (!db || !slug) return;
      setLoading(true);
      try {
        const q = query(collection(db, "blogPosts"), where("slug", "==", slug), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs[0].data();
          setPost({ ...data, id: snap.docs[0].id });
        }
      } catch (err) {
        console.error("Error fetching post:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [db, slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8">
        <h1 className="text-3xl font-black">Story Not Found</h1>
        <Button asChild className="rounded-xl h-12 px-8"><Link to="/blog">Return to Blog</Link></Button>
      </div>
    );
  }

  const currentTitle = viewLang === 'en' ? post.titleEn : (post.titleHi || post.titleEn);
  const currentContent = viewLang === 'en' ? post.contentEn : (post.contentHi || post.contentEn);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />

      <main className="flex-1 py-12 lg:py-24">
        <article className="container px-6 mx-auto max-w-4xl">
          <div className="flex justify-between items-center mb-8">
             <Button variant="ghost" asChild className="gap-2 font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary">
                <Link to="/blog"><ArrowLeft className="h-4 w-4" /> Back to Blog</Link>
             </Button>
             <div className="bg-neutral-100 p-1 rounded-xl flex items-center shadow-inner">
                <button 
                  onClick={() => setViewLang('en')}
                  className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all", viewLang === 'en' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}
                >
                  EN
                </button>
                <button 
                  onClick={() => setViewLang('hi')}
                  className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all", viewLang === 'hi' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}
                >
                  हिं
                </button>
             </div>
          </div>

          <div className="space-y-6 mb-12">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-primary/10 text-primary border-none px-4 py-1 font-black uppercase text-[9px] tracking-widest">{post.category}</Badge>
              <div className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                {post.readTime}
              </div>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700">{currentTitle}</h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-8 border-y border-neutral-100 gap-6">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center text-primary font-black shadow-inner uppercase">
                     {post.author?.[0] || 'A'}
                  </div>
                  <div>
                     <p className="text-sm font-black">{post.author || 'Admin Team'}</p>
                     <p className="text-[10px] text-muted-foreground font-bold uppercase">{post.createdAt?.toDate ? format(post.createdAt.toDate(), 'PPP') : 'Recently Published'}</p>
                  </div>
               </div>
               <Button variant="outline" size="icon" className="rounded-full h-11 w-11 border-2 shadow-sm">
                  <Share2 className="h-4 w-4" />
               </Button>
            </div>
          </div>

          <div className="rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl mb-16 aspect-video sm:aspect-[2/1] border-4 border-white bg-neutral-100">
             <img src={post.image} alt={currentTitle} className="w-full h-full object-cover" />
          </div>

          <div 
            key={viewLang}
            className="prose prose-neutral lg:prose-xl max-w-none animate-in fade-in duration-500
            prose-headings:font-black prose-headings:tracking-tight
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-base sm:prose-p:text-lg
            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:p-8 prose-blockquote:rounded-[2rem] prose-blockquote:font-bold prose-blockquote:italic
            prose-img:rounded-3xl shadow-none"
            dangerouslySetInnerHTML={{ __html: currentContent }}
          />

          <div className="mt-24 pt-10 border-t flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="flex flex-wrap items-center gap-3">
                <Tag className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Global Intelligence Tags: </span>
                <Badge variant="secondary" className="bg-neutral-100 text-[10px] font-bold py-1 px-3 uppercase">QR STRATEGY</Badge>
                <Badge variant="secondary" className="bg-neutral-100 text-[10px] font-bold py-1 px-3 uppercase">BILINGUAL</Badge>
             </div>
             <Button variant="ghost" className="gap-2 font-black text-[11px] uppercase tracking-widest group text-primary" asChild>
                <Link to="/blog">
                   Browse More Insights <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-all" />
                </Link>
             </Button>
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
