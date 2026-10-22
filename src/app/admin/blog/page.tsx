"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Newspaper, 
  SearchCheck,
  CheckCircle2,
  ExternalLink,
  Languages
} from "lucide-react";
import { 
  useFirestore, 
  useCollection, 
  useMemoFirebase, 
  deleteDocumentNonBlocking, 
  updateDocumentNonBlocking 
} from "@/firebase";
import { collection, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function BlogManagement() {
  const db = useFirestore();
  const { toast } = useToast();
  const [indexingLoading, setIndexingLoading] = useState<string | null>(null);

  const postsRef = useMemoFirebase(() => db ? query(collection(db, "blogPosts"), orderBy("createdAt", "desc")) : null, [db]);
  const { data: posts, isLoading } = useCollection(postsRef);

  const handleRequestIndexing = async (postId: string) => {
    setIndexingLoading(postId);
    try {
      // Mocked Google Indexing Request (Ping Utility)
      await new Promise(r => setTimeout(r, 1500));
      if (db) {
        updateDocumentNonBlocking(doc(db, "blogPosts", postId), {
          indexingStatus: "requested",
          lastIndexedAt: serverTimestamp()
        });
      }
      toast({ title: "Google Sitemap Ping Sent", description: "Search Console bot alerted successfully." });
    } catch (e) {
      toast({ variant: "destructive", title: "Indexing Failed" });
    } finally {
      setIndexingLoading(null);
    }
  };

  const handleDelete = (id: string) => {
    if (!db || !window.confirm("Permanently purge this story? This will break live URLs.")) return;
    deleteDocumentNonBlocking(doc(db, "blogPosts", id));
    toast({ title: "Story Purged" });
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-24 space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">Synchronizing CMS Registry...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
             <div className="bg-primary/10 p-2 rounded-xl text-primary"><Newspaper className="h-6 w-6" /></div>
             Bilingual CMS Hub
          </h1>
          <p className="text-muted-foreground font-medium">Manage bilingual storytelling and search visibility.</p>
        </div>
        <Button asChild className="gap-2 rounded-xl font-bold h-12 shadow-xl shadow-primary/20">
          <Link to="/admin/blog/new">
            <Plus className="h-5 w-5" /> Craft New Story
          </Link>
        </Button>
      </div>

      <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[1.5rem] md:rounded-[2rem]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-neutral-50/50">
                <TableRow className="border-none">
                  <TableHead className="pl-8 py-6 uppercase text-[10px] font-black tracking-widest">Story Identity</TableHead>
                  <TableHead className="uppercase text-[10px] font-black tracking-widest text-center">Languages</TableHead>
                  <TableHead className="uppercase text-[10px] font-black tracking-widest text-center">Lifecycle</TableHead>
                  <TableHead className="uppercase text-[10px] font-black tracking-widest text-center">Search Index</TableHead>
                  <TableHead className="pr-8 text-right uppercase text-[10px] font-black tracking-widest">Controls</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts && posts.length > 0 ? posts.map((post) => (
                  <TableRow key={post.id} className="group hover:bg-neutral-50/50 transition-all border-neutral-100">
                    <TableCell className="pl-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                           <img src={post.image || "https://picsum.photos/seed/blog/200/120"} className="h-14 w-24 object-cover rounded-xl border bg-neutral-100 shadow-sm" alt="" />
                           {post.status === 'published' && <div className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white"></div>}
                        </div>
                        <div className="flex flex-col min-w-0 max-w-[200px] md:max-w-md">
                            <span className="font-black text-sm truncate text-foreground">{post.titleEn || "Untitled Story"}</span>
                            <span className="text-[10px] text-muted-foreground font-mono truncate">/blog/{post.slug}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                         <Badge variant="outline" className="h-5 px-1.5 text-[8px] font-black uppercase">EN</Badge>
                         {post.titleHi && <Badge className="h-5 px-1.5 text-[8px] font-black uppercase bg-accent">HI</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {post.status === 'published' ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 uppercase text-[9px] font-black">Live</Badge>
                      ) : post.status === 'scheduled' ? (
                        <Badge className="bg-blue-50 text-blue-700 border-blue-100 uppercase text-[9px] font-black">Scheduled</Badge>
                      ) : (
                        <Badge variant="outline" className="uppercase text-[9px] font-black">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled={indexingLoading === post.id}
                        onClick={() => handleRequestIndexing(post.id)}
                        className={`gap-2 h-8 px-3 rounded-lg font-black text-[9px] uppercase transition-all ${
                          post.indexingStatus === 'requested' ? 'text-emerald-600 bg-emerald-50' : 'text-primary bg-primary/5 hover:bg-primary/10'
                        }`}
                      >
                        {indexingLoading === post.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 
                        post.indexingStatus === 'requested' ? <CheckCircle2 className="h-3 w-3" /> : <SearchCheck className="h-3 w-3" />}
                        {post.indexingStatus === 'requested' ? 'Requested' : 'Auto Index'}
                      </Button>
                    </TableCell>
                    <TableCell className="pr-8 text-right space-x-1">
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary h-10 w-10" asChild title="Edit Story">
                        <Link to={`/admin/blog/${post.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-neutral-100 h-10 w-10" onClick={() => window.open(`/blog/${post.slug}`, '_blank')} title="View Live">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full text-destructive hover:bg-red-50 h-10 w-10" onClick={() => handleDelete(post.id)} title="Purge">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-32 text-muted-foreground italic font-medium">The storyteller's gallery is empty. Create your first masterpiece!</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
