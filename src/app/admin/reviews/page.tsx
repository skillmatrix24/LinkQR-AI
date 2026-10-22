"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { Loader2, MessageSquare, Star, Trash2, User as UserIcon, Calendar, Quote } from "lucide-react";
import { format, isValid } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ReviewsManagement() {
  const db = useFirestore();
  const { toast } = useToast();

  const reviewsRef = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "reviews"), orderBy("submittedAt", "desc"));
  }, [db]);
  
  const { data: reviews, isLoading } = useCollection(reviewsRef);

  const handleDelete = (id: string) => {
    if (!db) return;
    deleteDocumentNonBlocking(doc(db, "reviews", id));
    toast({ title: "Review Removed" });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-muted-foreground font-medium">Fetching public feedback...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
             <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <MessageSquare className="h-6 w-6" />
             </div>
             Testimonials Hub
          </h1>
          <p className="text-muted-foreground font-medium">Manage user reviews displayed on the landing page.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-2">
               <CardTitle className="text-xs font-black uppercase text-muted-foreground tracking-widest">Total Reviews</CardTitle>
            </CardHeader>
            <CardContent>
               <p className="text-4xl font-black">{reviews?.length || 0}</p>
            </CardContent>
         </Card>
         <Card className="border-none shadow-sm bg-emerald-600 text-white">
            <CardHeader className="pb-2">
               <CardTitle className="text-xs font-black uppercase text-emerald-100 tracking-widest">Avg Rating</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black">4.9</p>
                  <Star className="h-5 w-5 fill-white text-white" />
               </div>
            </CardContent>
         </Card>
      </div>

      <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-neutral-50/50">
              <TableRow className="border-none">
                <TableHead className="pl-10 py-6 text-[10px] font-black uppercase tracking-widest">User Profile</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest">Rating</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest">Feedback Comment</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest">Submitted At</TableHead>
                <TableHead className="pr-10 py-6 text-right text-[10px] font-black uppercase tracking-widest">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews && reviews.length > 0 ? reviews.map((r) => {
                const date = r.submittedAt?.toDate ? r.submittedAt.toDate() : new Date();
                return (
                  <TableRow key={r.id} className="group hover:bg-neutral-50/50 transition-colors border-neutral-100">
                    <TableCell className="pl-10 py-5">
                      <div className="flex items-center gap-3">
                         <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                            <AvatarImage src={r.userPhoto} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">{r.userName?.[0]}</AvatarFallback>
                         </Avatar>
                         <div className="flex flex-col min-w-0">
                            <span className="font-bold text-sm truncate">{r.userName}</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Verified User</span>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'fill-amber-500' : 'text-neutral-200'}`} />
                          ))}
                       </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                       <p className="text-xs text-muted-foreground font-medium leading-relaxed italic line-clamp-2">
                          "{r.comment}"
                       </p>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2 text-muted-foreground font-bold text-[10px]">
                          <Calendar className="h-3 w-3" />
                          {isValid(date) ? format(date, 'MMM dd, yyyy') : 'Recently'}
                       </div>
                    </TableCell>
                    <TableCell className="pr-10 py-5 text-right">
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                         onClick={() => handleDelete(r.id)}
                       >
                          <Trash2 className="h-4 w-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-32 opacity-30">
                    <Quote className="h-12 w-12 mx-auto mb-4" />
                    <p className="font-black uppercase tracking-widest text-sm">No Public Reviews Yet</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}