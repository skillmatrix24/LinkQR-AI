
"use client";

import { useEffect } from "react";
import { useRouter } from "react-router-dom";
import { Loader2 } from "lucide-react";

/**
 * Redirection Node for Unified Digital ID Creation.
 * Sends the user to the Smart Page Studio with VCard pre-selected and TYPE=VCARD.
 */
export default function NewDigitalIDPage() {
  const router = useNavigate();

  useEffect(() => {
    const newId = crypto.randomUUID();
    // Pass type=vcard to trigger dedicated storage logic in handleSave
    router.replace(`/dashboard/qrs/microsite?id=${newId}&template=vcard&type=vcard`);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-neutral-50">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Initializing Identity Studio...</p>
    </div>
  );
}
