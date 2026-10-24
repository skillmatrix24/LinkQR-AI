"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, ArrowRight, Loader2, Phone } from "lucide-react";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  GoogleAuthProvider, 
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, Timestamp, Firestore } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addDays } from "date-fns";

const ADMIN_EMAILS = ['skillmatrix24@gmail.com'];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [showOtpInput, setShowOtpInput] = useState(false);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const auth = useAuth();
  const db = useFirestore();
  const { user } = useUser();
  const router = useNavigate();
  const { toast } = useToast();

  const siteConfigRef = useMemoFirebase(() => db ? doc(db, "config", "site") : null, [db]);
  const { data: siteConfig } = useDoc(siteConfigRef);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {
          console.error("Error clearing recaptcha:", e);
        }
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const createProfileIfNew = async (db: Firestore, user: any) => {
    const userProfileRef = doc(db, "users", user.uid);
    const profileSnap = await getDoc(userProfileRef);

    if (!profileSnap.exists()) {
      const isAdmin = user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
      const expiryDate = addDays(new Date(), 14);

      await setDoc(userProfileRef, {
        id: user.uid,
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        displayName: user.displayName || "User",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        currentPlanId: isAdmin ? "ent_plan" : "free_plan",
        padding: serverTimestamp(),
        planExpiryDate: Timestamp.fromDate(expiryDate),
        qrCodeCount: 0,
        isAdmin: !!isAdmin
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Welcome back!", description: "Successfully signed in." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Authentication Failed", description: error.message || "Invalid credentials." });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth || !db) return;
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(auth, provider);
      await createProfileIfNew(db, result.user);
      toast({ title: "Success", description: "Successfully signed in with Google." });
    } catch (error: any) {
      console.error("Google Login Error:", error);
      toast({ 
        variant: "destructive", 
        title: "Google Sign-In Failed", 
        description: error.message 
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!auth) return;
    let formattedPhone = phone.trim().replace(/\s+/g, '');
    if (formattedPhone.length < 10) {
      toast({ variant: "destructive", title: "Invalid Number", description: "Please enter at least 10 digits." });
      return;
    }
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.length === 10) formattedPhone = '+91' + formattedPhone;
      else formattedPhone = '+' + formattedPhone;
    }
    setIsPhoneLoading(true);
    try {
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', { 'size': 'invisible' });
      }
      const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifierRef.current);
      setConfirmationResult(result);
      setShowOtpInput(true);
      toast({ title: "OTP Sent", description: `A verification code has been sent to ${formattedPhone}` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsPhoneLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !confirmationResult || !db) return;
    setIsPhoneLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      await createProfileIfNew(db, result.user);
      toast({ title: "Welcome!", description: "Mobile verification successful." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Invalid OTP", description: "The code you entered is incorrect." });
    } finally {
      setIsPhoneLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!auth) return;
    if (!resetEmail) {
      toast({ variant: "destructive", title: "Email Required", description: "Please enter your email address." });
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({ title: "Reset Link Sent", description: "Check your inbox for instructions." });
      setIsResetDialogOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <style>{`
        img[css-h-var="true"] {
          height: var(--logo-h-mobile);
        }
        @media (min-width: 1024px) {
          img[css-h-var="true"] {
            height: var(--logo-h-desktop);
          }
        }
      `}</style>
      
      <div id="recaptcha-container"></div>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 min-h-[40px]">
            {siteConfig?.logoUrl && (
              <img 
                src={siteConfig.logoUrl} 
                alt="Logo" 
                className="w-auto object-contain"
                style={{ 
                  '--logo-h-mobile': `${siteConfig.logoHeightMobile || 28}px`,
                  '--logo-h-desktop': `${siteConfig.logoHeight || 32}px`,
                } as any}
                css-h-var="true"
              />
            )}
          </Link>
          <h2 className="text-3xl font-bold text-foreground">Welcome Back</h2>
          <p className="text-muted-foreground mt-2">Sign in to manage your account.</p>
        </div>

        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <div className="h-1.5 bg-primary"></div>
          <CardHeader className="p-8 pb-0">
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Mobile</TabsTrigger>
              </TabsList>
              
              <TabsContent value="email">
                <CardTitle className="text-xl">Login</CardTitle>
                <CardDescription>Enter your credentials to access your account.</CardDescription>
                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="name@company.com" required className="pl-10 h-12" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                        <DialogTrigger asChild><button type="button" className="text-xs text-primary hover:underline font-medium">Forgot password?</button></DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Reset Password</DialogTitle><DialogDescription>Enter your email to receive a reset link.</DialogDescription></DialogHeader>
                          <div className="space-y-4 py-4"><div className="space-y-2"><Label>Email</Label><Input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} /></div></div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleForgotPassword} disabled={resetLoading}>{resetLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Send Reset Link</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="password" type="password" required className="pl-10 h-12" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 bg-primary">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Sign In"}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="phone">
                <CardTitle className="text-xl">Mobile Login</CardTitle>
                <CardDescription>Sign in securely with Phone OTP.</CardDescription>
                <div className="space-y-4 mt-6">
                  {!showOtpInput ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Mobile Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="9876543210" className="pl-10 h-12 font-mono" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                        <p className="text-[10px] text-muted-foreground ml-1">Tip: You can enter with or without +91</p>
                      </div>
                      <Button onClick={handleSendOtp} disabled={isPhoneLoading} className="w-full h-12">
                        {isPhoneLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Send OTP"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Enter 6-digit OTP</Label>
                        <Input placeholder="XXXXXX" className="h-12 text-center text-lg tracking-widest font-black" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
                      </div>
                      <Button onClick={handleVerifyOtp} disabled={isPhoneLoading} className="w-full h-12">
                        {isPhoneLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Verify & Login"}
                      </Button>
                      <button onClick={() => setShowOtpInput(false)} className="text-xs text-muted-foreground hover:text-primary w-full">Use a different number</button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><Separator className="w-full" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">Or continue with</span></div>
            </div>
            <Button type="button" variant="outline" className="w-full h-12 gap-2" onClick={handleGoogleSignIn} disabled={googleLoading}>
              {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Google
            </Button>
          </CardContent>
          <CardFooter className="p-8 pt-0 text-center block border-t border-border/50 bg-background/30">
            <p className="text-sm text-muted-foreground mt-4">
              Don't have an account? <Link to="/signup" className="text-primary font-bold hover:underline">Sign up for free</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}