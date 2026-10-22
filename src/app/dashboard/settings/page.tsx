"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Loader2, CheckCircle2, AlertCircle, Camera, Trash2, Mail, ShieldAlert, Star, MessageSquare, Globe, ArrowRight } from "lucide-react";
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase";
import { updateProfile, updatePassword } from "firebase/auth";
import { doc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";

export default function SettingsPage() {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Review State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(userProfileRef);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || user?.displayName || "");
      setPhotoURL(profile.photoURL || "");
    }
  }, [profile, user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select an image smaller than 1MB for optimal performance.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoURL(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPhotoURL("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.currentUser || !userProfileRef) return;

    setIsUpdatingProfile(true);
    try {
      await updateProfile(auth.currentUser, { 
        displayName
      });

      updateDocumentNonBlocking(userProfileRef, {
        displayName: displayName,
        photoURL: photoURL,
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: "Profile Updated",
        description: "Your personal information has been successfully changed.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not update profile.",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.currentUser) return;

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Mismatch",
        description: "Passwords do not match.",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Too Short",
        description: "Password must be at least 6 characters.",
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updatePassword(auth.currentUser, newPassword);
      toast({
        title: "Password Updated",
        description: "Your security credentials have been updated.",
      });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.code === 'auth/requires-recent-login' 
          ? "Please sign out and sign in again to change your password for security reasons."
          : (error.message || "Could not update password."),
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!db || !user?.uid || !reviewComment.trim()) return;
    setIsSubmittingReview(true);
    
    try {
      const reviewId = crypto.randomUUID();
      const reviewRef = doc(db, "reviews", reviewId);
      
      setDocumentNonBlocking(reviewRef, {
        id: reviewId,
        userId: user.uid,
        userName: displayName || "Anonymous",
        userPhoto: photoURL || "",
        rating: reviewRating,
        comment: reviewComment,
        submittedAt: serverTimestamp()
      }, { merge: true });

      toast({ title: "Feedback Received!", description: "Thank you for helping us improve LinkQR AI." });
      setReviewComment("");
    } catch (err) {
      toast({ variant: "destructive", title: "Review Failed" });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const initials = displayName
    ? displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : user?.email?.[0].toUpperCase() || "U";

  return (
    <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12 px-2 sm:px-6 pb-24 md:pb-12">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Account Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground font-normal">Manage your personal information, profile picture, and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
        <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]">
          <CardHeader className="p-6 sm:p-8">
            <CardTitle className="flex items-center gap-3 text-xl font-bold tracking-tight">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <User className="h-5 w-5" />
              </div>
              Personal Information
            </CardTitle>
            <CardDescription className="text-sm font-normal">Update your public profile details.</CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdateProfile}>
            <CardContent className="px-6 sm:px-8 space-y-8">
              <div className="flex flex-col items-center gap-5 py-2">
                <div className="relative group">
                  <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-white shadow-2xl ring-1 ring-neutral-100">
                    <AvatarImage src={photoURL} className="object-cover" />
                    <AvatarFallback className="text-3xl font-bold bg-primary/5 text-primary">{initials}</AvatarFallback>
                  </Avatar>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 h-9 w-9 bg-primary text-white rounded-full flex items-center justify-center shadow-xl border-2 border-white hover:scale-110 transition-transform"
                    aria-label="Upload photo"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex flex-wrap justify-center gap-3 w-full">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 h-10 px-6 rounded-xl font-bold text-xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Identity Photo
                  </Button>
                  {photoURL && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:bg-destructive/5 gap-2 h-10 px-6 rounded-xl font-bold text-xs"
                      onClick={handleRemoveImage}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2.5">
                  <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" value={user?.email || ""} disabled className="pl-10 bg-neutral-50 h-12 border-neutral-200 rounded-xl font-medium" />
                  </div>
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Display Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="name" 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)} 
                      placeholder="Your Name"
                      className="pl-10 h-12 border-neutral-200 focus:bg-white transition-all rounded-xl font-medium"
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-neutral-50/50 p-6 sm:p-8">
              <Button type="submit" disabled={isUpdatingProfile} className="w-full h-12 font-bold gap-3 shadow-xl shadow-primary/10 rounded-xl transition-all hover:scale-[1.01]">
                {isUpdatingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Sync Profile Changes
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="space-y-6 sm:space-y-10">
          <Card className="border-none shadow-xl bg-neutral-900 text-white overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]">
            <CardHeader className="p-6 sm:p-8">
              <CardTitle className="flex items-center gap-3 text-xl font-bold tracking-tight">
                <div className="bg-primary/20 p-2 rounded-lg text-primary">
                  <Globe className="h-5 w-5" />
                </div>
                White-labeling
              </CardTitle>
              <CardDescription className="text-sm font-normal text-neutral-400">Configure your custom hostname and CNAME records.</CardDescription>
            </CardHeader>
            <CardContent className="px-6 sm:px-8 pb-8">
               <p className="text-sm text-neutral-300 leading-relaxed mb-6">
                 Use your own domain (e.g. <strong>links.mybrand.com</strong>) instead of linkqr.in for all your redirection nodes.
               </p>
               <Button asChild className="w-full h-12 font-bold gap-2 rounded-xl bg-white text-black hover:bg-neutral-200">
                  <Link to="/dashboard/settings/domains">
                    Manage Custom Domains <ArrowRight className="h-4 w-4" />
                  </Link>
               </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]">
            <CardHeader className="p-6 sm:p-8">
              <CardTitle className="flex items-center gap-3 text-xl font-bold tracking-tight">
                <div className="bg-accent/10 p-2 rounded-lg text-accent">
                  <Lock className="h-5 w-5" />
                </div>
                Security Protocol
              </CardTitle>
              <CardDescription className="text-sm font-normal">Change your secure account credentials.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdatePassword}>
              <CardContent className="px-6 sm:px-8 space-y-6">
                <div className="space-y-2.5">
                  <Label htmlFor="new-password" title="At least 6 characters" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="new-password" 
                      type="password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      placeholder="Minimum 6 characters"
                      className="pl-10 h-12 border-neutral-200 focus:bg-white transition-all rounded-xl"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="confirm-password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Confirm Security Key</Label>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      placeholder="Repeat password"
                      className="pl-10 h-12 border-neutral-200 focus:bg-white transition-all rounded-xl"
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 sm:p-8">
                <Button type="submit" variant="outline" disabled={isUpdatingPassword} className="w-full h-12 font-bold gap-3 border-2 border-accent text-accent hover:bg-accent/5 rounded-xl transition-all hover:scale-[1.01]">
                  {isUpdatingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  Update Security Key
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      {/* Review Section */}
      <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem] border-2 border-primary/10">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <MessageSquare className="h-6 w-6" />
            </div>
            Help Us Improve
          </CardTitle>
          <CardDescription>Share your experience with LinkQR AI. Your review may be featured on our landing page.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-6">
          <div className="flex flex-col gap-4">
            <Label className="font-bold text-sm">Rate your experience</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button 
                  key={s} 
                  type="button"
                  onClick={() => setReviewRating(s)}
                  className={`p-2 rounded-lg transition-all ${reviewRating >= s ? 'text-amber-500 scale-110' : 'text-neutral-200'}`}
                >
                  <Star className={`h-8 w-8 ${reviewRating >= s ? 'fill-amber-500' : ''}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Label className="font-bold text-sm">Your Feedback</Label>
            <Textarea 
              placeholder="What do you love most? Any suggestions for our AI team?" 
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="min-h-[120px] rounded-2xl bg-neutral-50 focus:bg-white transition-all border-neutral-200"
            />
          </div>
          <Button 
            onClick={handleSubmitReview} 
            disabled={isSubmittingReview || !reviewComment.trim()} 
            className="w-full sm:w-auto px-10 h-12 font-bold rounded-xl gap-2"
          >
            {isSubmittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Submit Public Review
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
