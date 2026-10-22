
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "react-router-dom";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Loader2, AlertCircle } from "lucide-react";
import DigitalIDEditor from "../builder-component";

function EditDigitalIDContent() {
  const searchParams = useSearchParams();
  const cardId = searchParams.get("id");
  const { user } = useUser();
  const db = useFirestore();
  const router = useNavigate();

  const cardRef = useMemoFirebase(() => {
    if (!db || !user?.uid || !cardId) return null;
    return doc(db, "users", user.uid, "digitalIDs", cardId);
  }, [db, user?.uid, cardId]);

  const { data: existingData, isLoading } = useDoc(cardRef);

  if (!cardId) return <div className="p-20 text-center">Invalid Card Identifier.</div>;

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em]">Retrieving Identity Node...</p>
    </div>
  );

  if (!existingData) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center">
      <AlertCircle className="h-12 w-12 text-red-500" />
      <h2 className="text-2xl font-black uppercase">Card Not Found</h2>
      <p className="text-muted-foreground">The digital identity you are trying to edit does not exist or has been moved.</p>
      <button onClick={() => navigate("/dashboard/vcards")} className="text-primary font-bold underline">Return to Hub</button>
    </div>
  );

  return <DigitalIDEditor existingData={existingData} />;
}

export default function EditDigitalIDPage() {
  return (
    <Suspense fallback={<div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
      <EditDigitalIDContent />
    </Suspense>
  );
}
