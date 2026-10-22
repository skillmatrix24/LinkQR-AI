
"use client";

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QrCode, Home, ArrowLeft, Search } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Custom 404 Page - Branded for LinkQR AI.
 * Ensures users don't drop off on broken links.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2EFF7] p-6">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 sm:p-14 text-center border border-neutral-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12">
          <QrCode className="h-40 w-40 text-primary" />
        </div>

        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8 relative z-10"
        >
          <Search className="h-10 w-10 text-primary" />
        </motion.div>

        <h1 className="text-6xl font-black text-primary mb-4 tracking-tighter">404</h1>
        <h2 className="text-2xl font-black text-neutral-900 mb-4">Node Not Found</h2>
        <p className="text-muted-foreground mb-10 text-sm leading-relaxed font-medium">
          The intelligence link you are looking for might have been moved, renamed, or temporarily suspended.
        </p>

        <div className="flex flex-col gap-3 relative z-10">
          <Button asChild className="h-14 rounded-2xl font-black gap-3 shadow-xl shadow-primary/20 bg-primary text-white">
            <Link to="/">
              <Home className="h-4 w-4" /> Return to Safe Hub
            </Link>
          </Button>
          <Button variant="ghost" asChild className="h-12 rounded-xl font-bold gap-2 text-muted-foreground">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" /> Go to Dashboard
            </Link>
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-50">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-300">LinkQR AI • Global Redirection Engine</p>
        </div>
      </div>
    </div>
  );
}
