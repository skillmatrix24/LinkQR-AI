"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Newspaper, Calendar, ArrowRight, BookOpen, Clock, Tag, Send, Loader2, Languages } from "lucide-react";
import { useFirestore, useMemoFirebase, useCollection, setDocumentNonBlocking } from "@/firebase";
import { doc, collection, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isBefore, format } from "date-fns";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function BlogListingPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const blogQuery = useMemoFirebase(() => db ? query(collection(db, "blogPosts"), orderBy("createdAt", "desc")) : null, [db]);
  const { data: allPosts, isLoading } = useCollection(blogQuery);

  const posts = (allPosts || []).filter(post => {
    if (post.status === 'draft') return false;
    if (post.status === 'scheduled' && post.scheduledAt) {
      const scheduleDate = post.scheduledAt.toDate ? post.scheduledAt.toDate() : new Date(post.scheduledAt);
      return isBefore(scheduleDate, new Date());
    }
    return true;
  });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !db) return;
    setIsSubscribing(true);
    try {
      const subId = crypto.randomUUID();
      const subRef = doc(db, "newsletterSubscriptions", subId);
      setDocumentNonBlocking(subRef, {
        id: subId,
        email: email,
        subscribedAt: serverTimestamp(),
        source: "blog_listing"
      }, { merge: true });
      
      toast({ title: "Subscribed!", description: "Welcome to the Bilingual Intelligence network." });
      setEmail("");
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Subscription failed." });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />

      <main className="flex-1 py-16 lg:py-32">
        <div className="container px-6 mx-auto max-w-6xl">
          <div className="text-center mb-20 space-y-4">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-6 py-2 uppercase tracking-widest text-[10px] font-black rounded-full">Global Insights Hub</Badge>
            <h1 className="text-4xl lg:text-7xl font-black tracking-tight leading-[1.1]">Bilingual <span className="text-primary">Intelligence</span> Blog</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">Expert advice on QR marketing, available in English & Hindi.</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="group flex flex-col h-full bg-white rounded-[2rem] border border-neutral-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="relative h-56 overflow-hidden">
                    <img src={post.image} alt={post.titleEn} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className="bg-white/95 text-primary border-none shadow-lg font-black uppercase text-[9px] tracking-widest">{post.category}</Badge>
                      {post.titleHi && <Badge className="bg-accent text-white border-none shadow-lg font-black uppercase text-[9px] tracking-widest gap-1"><Languages className="h-2.5 w-2.5" /> Bilingual</Badge>}
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-4">
                      <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMM dd, yyyy') : 'Recently'}</span>
                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {post.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors leading-tight">{post.titleEn}</h3>
                    {post.titleHi && <p className="text-sm font-bold text-muted-foreground mb-4 line-clamp-1">{post.titleHi}</p>}
                    <p className="text-sm text-muted-foreground font-normal leading-relaxed mb-8 line-clamp-3">{post.excerptEn}</p>
                    <div className="mt-auto flex items-center gap-2 text-primary font-black text-[11px] uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                      Read Insight <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-32 p-10 lg:p-20 rounded-[3rem] bg-primary text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><BookOpen className="h-48 w-48" /></div>
             <div className="relative z-10 text-center max-w-2xl mx-auto space-y-6">
                <h2 className="text-3xl lg:text-4xl font-black">Stay updated with QR trends.</h2>
                <p className="opacity-80 font-medium text-lg">Join 5,000+ marketers receiving our bilingual intelligence digest.</p>
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 mt-10">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Your work email" className="h-14 px-8 rounded-2xl bg-white/10 border border-white/20 outline-none flex-1 placeholder:text-white/40 font-bold" />
                  <Button disabled={isSubscribing} className="bg-white text-primary hover:bg-neutral-100 h-14 px-12 rounded-2xl font-black gap-2 shadow-2xl">
                    {isSubscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Subscribe
                  </Button>
                </form>
             </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
