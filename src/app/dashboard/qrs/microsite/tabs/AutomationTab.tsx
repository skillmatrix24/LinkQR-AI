'use client';

import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Mail, Zap, Globe, Info, Table as TableIcon, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AutomationTabProps {
  pageData: any;
  setPageData: (data: any) => void;
}

/**
 * AutomationTab: Configure Email Notifications and Webhook/Sheets Sync.
 */
export function AutomationTab({ pageData, setPageData }: AutomationTabProps) {
  return (
    <div className="space-y-10 animate-in fade-in duration-300 pb-12">
      {/* 1. Email Notifications */}
      <div className="p-6 bg-primary/5 rounded-[2rem] border-2 border-primary/10 space-y-6">
        <div className="flex items-center justify-between border-b border-primary/10 pb-4">
           <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg">
                 <Mail className="h-5 w-5" />
              </div>
              <h4 className="font-black text-sm uppercase tracking-tight text-primary">Email Alerts</h4>
           </div>
           <Switch 
            checked={pageData.emailNotificationsEnabled !== false} 
            onCheckedChange={v => setPageData({...pageData, emailNotificationsEnabled: v})} 
           />
        </div>
        
        {pageData.emailNotificationsEnabled !== false && (
          <div className="space-y-4 animate-in slide-in-from-top-2">
            <div className="space-y-2">
              <Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Send Alerts To</Label>
              <Input 
                value={pageData.notificationEmail || ""} 
                onChange={e => setPageData({...pageData, notificationEmail: e.target.value})} 
                placeholder="you@email.com" 
                className="h-11 rounded-xl bg-white border-none shadow-inner text-sm font-bold"
              />
              <p className="text-[9px] text-muted-foreground italic ml-1">New leads will be mailed here instantly.</p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Webhook / Google Sheets Sync */}
      <div className="p-6 bg-neutral-900 text-white rounded-[2.5rem] border space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12"><Zap className="h-20 w-20 text-accent" /></div>
        <div className="flex items-center gap-3 relative z-10">
           <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-accent">
              <Globe className="h-5 w-5" />
           </div>
           <h4 className="font-black text-sm uppercase tracking-tight">External Sync</h4>
        </div>

        <div className="space-y-4 relative z-10">
           <div className="space-y-2">
              <Label className="text-[8px] font-bold uppercase text-white/40 flex items-center gap-2">
                <TableIcon className="h-3 w-3" /> Webhook / Zapier / Sheets URL
              </Label>
              <Input 
                value={pageData.webhookUrl || ""} 
                onChange={e => setPageData({...pageData, webhookUrl: e.target.value})} 
                placeholder="https://hooks.zapier.com/..." 
                className="h-11 bg-white/5 border-white/10 text-white rounded-xl text-xs font-mono"
              />
           </div>
           
           <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                 <Sparkles className="h-3 w-3 text-accent" />
                 <p className="text-[10px] font-bold uppercase text-accent">How to sync Google Sheets?</p>
              </div>
              <p className="text-[9px] text-white/40 leading-relaxed">
                Use **Zapier** or **Make.com** to create a Webhook trigger. Paste the URL here to push lead data to your spreadsheet in real-time.
              </p>
           </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 flex gap-4">
         <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
         <p className="text-[10px] text-emerald-800 font-medium leading-relaxed italic">
           Automated follow-ups increase conversion by **300%**. Don't keep your leads waiting!
         </p>
      </div>
    </div>
  );
}
