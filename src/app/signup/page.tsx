"use client";

import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "react-router-dom";
import {
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  Phone,
  QrCode,
  User,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { 
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider, 
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, Timestamp, Firestore } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { addDays } from "date-fns";

const ADMIN_EMAILS = ['skillmatrix24@gmail.com'];

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
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

  // Cleanup reCAPTCHA on unmount
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

  const createProfile = async (db: Firestore, user: any, customName?: string) => {
    const userProfileRef = doc(db, "users", user.uid);
    const profileSnap = await getDoc(userProfileRef);

    if (!profileSnap.exists()) {
      const isAdmin = user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
      const expiryDate = addDays(new Date(), 14);

      await setDoc(userProfileRef, {
        id: user.uid,
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        displayName: customName || user.displayName || "User",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        currentPlanId: isAdmin ? "ent_plan" : "free_plan",
        planExpiryDate: Timestamp.fromDate(expiryDate),
        qrCodeCount: 0,
        isAdmin: !!isAdmin
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    setLoading(true);

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(result.user, { displayName: name });
      }
      await createProfile(db, result.user, name);
      toast({ title: "Account Created", description: "Welcome! Starting your 14-day trial." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Signup Failed", description: error.message });
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
      await createProfile(db, result.user);
      toast({ title: "Welcome!", description: "Successfully signed in with Google." });
    } catch (error: any) {
      console.error("Google Signup Error:", error);
      let errorMsg = error.message;

      if (error.code === 'auth/unauthorized-domain') {
        errorMsg = "Domain not authorized. Please add this URL to 'Authorized Domains' in Firebase Console (Auth > Settings).";
      }

      toast({ 
        variant: "destructive", 
        title: "Google Sign-In Failed", 
        description: errorMsg 
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!auth) return;
    
    // Normalize phone number for E.164 (handle with/without prefix, spaces)
    let formattedPhone = phone.trim().replace(/\s+/g, '');
    
    if (formattedPhone.length < 10) {
      toast({ variant: "destructive", title: "Invalid Number", description: "Please enter a valid 10-digit number." });
      return;
    }

    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.length === 10) {
        // Auto-prepend +91 for 10-digit numbers
        formattedPhone = '+91' + formattedPhone;
      } else if (formattedPhone.startsWith('91') && formattedPhone.length === 12) {
        formattedPhone = '+' + formattedPhone;
      } else {
        formattedPhone = '+' + formattedPhone;
      }
    }

    setIsPhoneLoading(true);

    try {
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container-signup', {
          'size': 'invisible'
        });
      }

      const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifierRef.current);
      setConfirmationResult(result);
      setShowOtpInput(true);
      toast({ title: "OTP Sent", description: `A verification code has been sent to ${formattedPhone}` });
    } catch (error: any) {
      console.error("Recaptcha error:", error);
      toast({ variant: "destructive", title: "Error", description: error.message });
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setIsPhoneLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !confirmationResult || !db) return;
    setIsPhoneLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      await createProfile(db, result.user, name);
      toast({ title: "Success", description: "Mobile account verified." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Invalid OTP", description: "Verification failed." });
    } finally {
      setIsPhoneLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div id="recaptcha-container-signup"></div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 min-h-[40px]">
            {siteConfig?.logoUrl && (
              <img 
                src={siteConfig.logoUrl} 
                alt="Logo" 
                style={{ height: `${siteConfig.logoHeight || 40}px` }} 
                className="w-auto object-contain" 
              />
            )}
          </Link>
          <h2 className="text-3xl font-bold text-foreground">
            Create Account
          </h2>
          <p className="text-muted-foreground mt-2">
            Join thousands of users scaling their physical connections.
          </p>
        </div>

        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <div className="h-1.5 bg-accent"></div>

          <CardHeader className="p-8 pb-0">
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="email">
                  Email
                </TabsTrigger>
                <TabsTrigger value="phone">
                  Mobile
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email">
                <CardTitle className="text-xl">Get Started</CardTitle>
                <CardDescription>
                  Join our 14-day trial to experience the power of smart QRs.
                </CardDescription>

                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="John Doe"
                        required
                        className="pl-10 h-12"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        required
                        className="pl-10 h-12"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        required
                        className="pl-10 h-12"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full h-12 bg-primary">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Create Free Account"}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="phone">
                <CardTitle className="text-xl">Mobile Signup</CardTitle>
                <CardDescription>Join using your mobile number and OTP.</CardDescription>
                <div className="space-y-4 mt-6">
                  {!showOtpInput ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Full Name (Optional)</Label>
                        <Input placeholder="John Doe" className="h-11" value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Mobile Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="9876543210" className="pl-10 h-12 font-mono" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                        <p className="text-[10px] text-muted-foreground ml-1">Tip: Auto-normalizes +91 for you</p>
                      </div>
                      <Button onClick={handleSendOtp} disabled={isPhoneLoading} className="w-full h-12">
                        {isPhoneLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Send Verification OTP"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Enter 6-digit OTP</Label>
                        <Input placeholder="XXXXXX" className="h-12 text-center text-lg tracking-widest font-black" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
                      </div>
                      <Button onClick={handleVerifyOtp} disabled={isPhoneLoading} className="w-full h-12">
                        {isPhoneLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Verify & Complete Signup"}
                      </Button>
                      <button onClick={() => setShowOtpInput(false)} className="text-xs text-muted-foreground hover:text-primary w-full text-center">Use a different number</button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>

          <CardContent className="p-8 pt-0 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><Separator className="w-full" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">Or signup with</span></div>
            </div>
            <Button type="button" variant="outline" className="w-full h-12 gap-2" onClick={handleGoogleSignIn} disabled={googleLoading}>
              {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Google
            </Button>
          </CardContent>
          <CardFooter className="p-8 pt-0 text-center block border-t border-border/50 bg-background/30">
            <p className="text-sm text-muted-foreground mt-4">
              Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}