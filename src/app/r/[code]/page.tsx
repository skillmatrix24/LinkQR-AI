"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "react-router-dom";
import { Loader2, AlertCircle, ShieldCheck, ZapOff, Database, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useFirestore } from "@/firebase";
import { doc, getDoc, collection, addDoc, updateDoc, increment, serverTimestamp, query, where, getDocs, limit } from "firebase/firestore";

/**
 * Robust Client-Side Redirection Page (v9.0 - Enhanced Resilience).
 * Corrected to fix "Redirection Failure" by using multi-stage lookup and better error handling.
 */
export default function RedirectionPage() {
  const params = useParams();
  const router = useNavigate();
  const rawCode = params.code as string;
  const db = useFirestore();
  
  const [status, setStatus] = useState<"loading" | "error" | "inactive" | "success" | "expired">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const hasProcessed = useRef(false);

  useEffect(() => {
    async function handleRedirection() {
      if (hasProcessed.current || !db || !rawCode) return;
      
      const code = rawCode.trim().split('?')[0].replace(/\/$/, "");
      
      if (code === 'preview') {
        setStatus("success");
        return;
      }

      hasProcessed.current = true;

      try {
        let finalUrl = "";
        let masterQrId = "";
        let masterUserId = "";
        let resolvedData = null;
        let isActive = true;

        // --- LOOKUP STAGE 1: Direct Document ID (Preferred) ---
        const publicRef = doc(db, "publicShortLinks", code);
        const publicSnap = await getDoc(publicRef);
        if (publicSnap.exists()) {
          resolvedData = publicSnap.data();
        }

        // --- LOOKUP STAGE 2: Registry Search (Field Fallback) ---
        if (!resolvedData) {
          const qPublic = query(collection(db, "publicShortLinks"), where("shortCode", "==", code), limit(1));
          const qPublicSnap = await getDocs(qPublic);
          if (!qPublicSnap.empty) {
            resolvedData = qPublicSnap.docs[0].data();
          }
        }

        // --- LOOKUP STAGE 3: Case-Insensitive Fallback ---
        if (!resolvedData && code !== code.toLowerCase()) {
           const lowerRef = doc(db, "publicShortLinks", code.toLowerCase());
           const lowerSnap = await getDoc(lowerRef);
           if (lowerSnap.exists()) resolvedData = lowerSnap.data();
        }

        if (!resolvedData) {
          setStatus("error");
          setErrorMsg("This link is not registered in our intelligence hub.");
          return;
        }

        masterQrId = resolvedData.qrCodeId;
        masterUserId = resolvedData.userId;
        finalUrl = resolvedData.originalUrl;
        isActive = resolvedData.isActive !== false;

        // --- VERIFICATION & SUBSCRIPTION CHECK ---
        try {
          const userRef = doc(db, "users", masterUserId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            
            if (userData?.planExpiryDate) {
              const expiry = userData.planExpiryDate.toDate ? userData.planExpiryDate.toDate() : new Date(userData.planExpiryDate);
              const isAdmin = userData.isAdmin === true || userData.email === 'admin@test.com' || userData.email === 'skillmatrix24@gmail.com';
              if (!isAdmin && expiry < new Date()) {
                setStatus("expired");
                return;
              }
            }

            const qrRef = doc(db, "users", masterUserId, "qrcodes", masterQrId);
            const qrSnap = await getDoc(qrRef);
            if (qrSnap.exists()) {
              const qrData = qrSnap.data();
              if (qrData?.isActive === false) isActive = false;
              if (qrData?.originalUrl) finalUrl = qrData.originalUrl;
            }
          }
        } catch (e) {
          console.warn("[Link Engine] Subscription verify bypassed.");
        }

        if (!isActive) {
          setStatus("inactive");
          return;
        }

        // --- EXECUTE REDIRECTION & LOGGING ---
        if (finalUrl) {
          const userAgent = window.navigator.userAgent;
          const isBot = /bot|crawler|spider|curl|wget|lighthouse|googlebot|headless|facebookexternalhit|twitterbot|adsbot|bingbot|yandex|baiduspider/i.test(userAgent);
          
          let scannerId = localStorage.getItem('lqr_scanner_id');
          let isReturning = true;
          if (!scannerId) {
             scannerId = crypto.randomUUID();
             localStorage.setItem('lqr_scanner_id', scannerId);
             isReturning = false;
          }

          sessionStorage.setItem('lqr_attribution_qr', masterQrId);
          sessionStorage.setItem('lqr_attribution_user', masterUserId);

          if (masterQrId && masterUserId) {
            // FIRE AND FORGET LOGGING: Don't let logging slow down redirect
            addDoc(collection(db, "users", masterUserId, "qrcodes", masterQrId, "scanevents"), {
              qrCodeId: masterQrId,
              userId: masterUserId,
              timestamp: serverTimestamp(),
              ipAddress: "client-edge",
              userAgent,
              scannerId,
              isReturning,
              isBot,
              deviceType: userAgent.toLowerCase().includes('mobile') ? 'mobile' : 'desktop'
            }).catch(() => null);

            updateDoc(doc(db, "users", masterUserId, "qrcodes", masterQrId), {
              totalScans: increment(1),
              updatedAt: serverTimestamp()
            }).catch(() => null);
          }

          setStatus("success");
          const destination = finalUrl.startsWith('http') ? finalUrl : `https://${finalUrl}`;
          window.location.replace(destination);
        } else {
          setStatus("error");
          setErrorMsg("Invalid redirection target.");
        }

      } catch (err: any) {
        console.error("[Link Engine] Resolution Error:", err);
        setStatus("error");
        setErrorMsg("Network timeout while reaching redirection cluster.");
      }
    }

    handleRedirection();
  }, [rawCode, db, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2EFF7] p-6 text-center">
      <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[4rem] shadow-2xl border border-neutral-100 flex flex-col items-center gap-10 max-w-sm w-full">
        
        {status === "loading" && (
          <>
            <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center relative">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="absolute -bottom-1 -right-1 bg-white p-2.5 rounded-full shadow-lg border">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Resolving Link</h1>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em] animate-pulse">Intelligent Redirect Active</p>
            </div>
            <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
               <div className="h-full w-full bg-primary animate-progress"></div>
            </div>
          </>
        )}

        {status === "inactive" && (
          <>
            <div className="h-24 w-24 bg-orange-50 rounded-full flex items-center justify-center">
              <PowerOff className="h-10 w-10 text-orange-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-neutral-900">Link Paused</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">The owner has temporarily deactivated this link.</p>
            </div>
            <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-2" asChild><Link to="/">Go to Homepage</Link></Button>
          </>
        )}

        {status === "expired" && (
          <>
            <div className="h-24 w-24 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black">Plan Expired</h1>
              <p className="text-sm text-muted-foreground">The owner's subscription has expired and requires renewal.</p>
            </div>
            <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-2" asChild><Link to="/">Go to Homepage</Link></Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="h-24 w-24 bg-red-50 rounded-full flex items-center justify-center">
              <Search className="h-10 w-10 text-red-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black">Not Found</h1>
              <p className="text-sm text-muted-foreground mt-2">{errorMsg}</p>
            </div>
            <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-2" asChild><Link to="/">Go to Homepage</Link></Button>
          </>
        )}

        {status === "success" && (
          <>
            <div className="h-24 w-24 bg-emerald-50 rounded-full flex items-center justify-center">
              <ShieldCheck className="h-12 w-12 text-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-2xl font-black text-emerald-700">Opening Destination...</h1>
          </>
        )}
      </div>

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress {
          animation: progress 1.5s infinite linear;
        }
      `}</style>
    </div>
  );
}

function PowerOff(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18.36 6.64A9 9 0 1 1 5.64 17.36" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  )
}
