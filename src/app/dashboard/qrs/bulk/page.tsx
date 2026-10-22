"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  FileUp, 
  Download, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Layers,
  UploadCloud,
  FileSpreadsheet,
  Link as LinkIcon,
  Table as TableIcon,
  Crown,
  Lock,
  Trash2,
  ShieldCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import Papa from "papaparse";
import * as XLSX from 'xlsx';
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser, useDoc, useMemoFirebase, setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { doc, increment, serverTimestamp, collection } from "firebase/firestore";

export default function BulkQRPage() {
  const [file, setFile] = useState<File | null>(null);
  const [googleSheetUrl, setGoogleSheetUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ success: number; failed: number; total: number } | null>(null);
  const [activeTab, setActiveTab] = useState("file");
  
  const router = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const db = useFirestore();
  const { user } = useUser();

  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(userProfileRef);

  const isEnterprise = useMemo(() => {
    return profile?.currentPlanId === 'ent_plan' || user?.email === 'admin@test.com';
  }, [profile, user]);

  const downloadTemplate = () => {
    const csvContent = "title,url\nPortfolio,https://example.com\nCompany Menu,https://myrestaurant.com/menu\nSpecial Discount,https://store.com/promo";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "linkqr_ai_bulk_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setResults(null);
      setProgress(0);
    }
  };

  const parseData = async (): Promise<any[]> => {
    if (activeTab === 'file' && file) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        const extension = file.name.split('.').pop()?.toLowerCase();

        if (extension === 'csv') {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data),
          });
        } else {
          reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            resolve(XLSX.utils.sheet_to_json(firstSheet));
          };
          reader.readAsArrayBuffer(file);
        }
      });
    } else if (activeTab === 'sheets' && googleSheetUrl) {
      try {
        const sheetIdMatch = googleSheetUrl.match(/\/d\/(.*?)(\/|$)/);
        if (!sheetIdMatch) throw new Error("Invalid Google Sheets URL");
        const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetIdMatch[1]}/export?format=csv`;
        
        const response = await fetch(exportUrl);
        const csvText = await response.text();
        return new Promise((resolve) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data),
          });
        });
      } catch (err) {
        toast({ variant: "destructive", title: "Sync Error", description: "Could not fetch data from Google Sheet. Ensure it is public." });
        return [];
      }
    }
    return [];
  };

  const processBulk = async () => {
    if (!isEnterprise) {
      toast({ 
        variant: "destructive", 
        title: "Enterprise Only", 
        description: "Bulk QR Generation is an Enterprise feature.",
        action: <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/billing')}>View Plans</Button>
      });
      return;
    }

    if (!user || !db || !userProfileRef) return;

    setIsProcessing(true);
    setProgress(5);
    
    try {
      const dataRows = await parseData();
      if (dataRows.length === 0) {
        throw new Error("No data found in the source.");
      }

      if (dataRows.length > 1000) {
        throw new Error("Maximum 1,000 items allowed per batch.");
      }

      const limit = profile?.currentPlanId === 'ent_plan' ? 99999 : 5;
      const currentCount = profile?.qrCodeCount || 0;
      
      if (currentCount + dataRows.length > limit) {
        throw new Error(`Limit Exceeded. You can only create ${limit - currentCount} more QRs.`);
      }

      let successCount = 0;
      let failedCount = 0;

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        const title = row.title || row.Name || row.Label || `Bulk QR ${i + 1}`;
        const targetUrl = row.url || row.URL || row.Link || row.Destination;

        if (!targetUrl || !targetUrl.toString().startsWith('http')) {
          failedCount++;
          continue;
        }

        const qrCodeId = crypto.randomUUID();
        const shortCode = Math.random().toString(36).substring(2, 12);
        const timestamp = serverTimestamp();

        const qrRef = doc(db, "users", user.uid, "qrcodes", qrCodeId);
        setDocumentNonBlocking(qrRef, {
          id: qrCodeId,
          userId: user.uid,
          title: title.toString(),
          originalUrl: targetUrl.toString(),
          shortCode: shortCode,
          createdAt: timestamp,
          updatedAt: timestamp,
          isActive: true,
          totalScans: 0,
          fgColor: "0-0-0",
          bgColor: "255-255-255",
        }, { merge: true });

        const publicRef = doc(db, "publicShortLinks", shortCode);
        setDocumentNonBlocking(publicRef, {
          shortCode: shortCode,
          qrCodeId,
          userId: user.uid,
          originalUrl: targetUrl.toString(),
          isActive: true,
          updatedAt: timestamp
        }, { merge: true });

        successCount++;
        setProgress(Math.round(((i + 1) / dataRows.length) * 100));
      }

      updateDocumentNonBlocking(userProfileRef, {
        qrCodeCount: increment(successCount),
        updatedAt: serverTimestamp()
      });

      setResults({ success: successCount, failed: failedCount, total: dataRows.length });
      toast({ title: "Batch Complete", description: `Successfully generated ${successCount} dynamic links.` });

    } catch (err: any) {
      toast({ variant: "destructive", title: "Bulk Error", description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 mb-24">
      <Link to="/dashboard/qrs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors font-medium">
        <ArrowLeft className="h-4 w-4" /> Back to My QRs
      </Link>

      {!isEnterprise && (
        <Card className="mb-10 border-none bg-[#111111] text-white shadow-2xl overflow-hidden relative rounded-[2rem]">
          <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 group-hover:rotate-0 transition-transform">
            <Crown className="h-40 w-40" />
          </div>
          <CardContent className="p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 text-center md:text-left">
              <Badge className="bg-amber-500/20 text-amber-400 border-none px-4 py-1 font-bold text-[10px] uppercase tracking-widest rounded-full">Enterprise Tier</Badge>
              <h3 className="text-2xl sm:text-3xl font-bold flex items-center justify-center md:justify-start gap-3">
                Bulk Tools Restricted
              </h3>
              <p className="text-neutral-400 text-sm sm:text-base font-normal max-w-md leading-relaxed">Upgrade to Enterprise to scale your marketing and generate thousands of smart links in one click.</p>
            </div>
            <Button className="bg-white text-neutral-900 hover:bg-neutral-100 font-bold h-14 px-10 rounded-2xl shadow-2xl transition-transform hover:scale-[1.02]" asChild>
              <Link to="/dashboard/billing">Unlock Now</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[2.5rem] relative">
        {!isEnterprise && <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-20 pointer-events-none" />}
        <CardHeader className="p-8 sm:p-10 pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary font-bold px-4 py-1 text-[10px] uppercase tracking-tighter">Injection Suite v2.0</Badge>
              <CardTitle className="text-2xl sm:text-4xl font-bold flex items-center gap-3">
                <Layers className="h-7 w-7 text-primary" />
                Bulk Generator Pro
              </CardTitle>
              <CardDescription className="text-sm sm:text-base font-normal">Scale your physical-to-digital connections instantly.</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2 font-bold h-12 px-6 rounded-xl border-2" onClick={downloadTemplate}>
              <Download className="h-4 w-4" /> Template
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 sm:p-10 space-y-10">
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setResults(null); setFile(null); }} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-14 bg-neutral-100 p-1.5 rounded-2xl shadow-inner mb-8">
              <TabsTrigger value="file" className="rounded-xl gap-2 font-bold text-sm"><FileSpreadsheet className="h-4 w-4" /> CSV/Excel</TabsTrigger>
              <TabsTrigger value="sheets" className="rounded-xl gap-2 font-bold text-sm"><TableIcon className="h-4 w-4" /> Google Sheets</TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="pt-2">
              {!file ? (
                <div 
                  className="border-4 border-dashed border-neutral-50 rounded-[2.5rem] p-12 text-center hover:border-primary/20 transition-all cursor-pointer group bg-neutral-50/50 shadow-inner"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="h-20 w-20 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-10 w-10 text-primary" />
                  </div>
                  <h4 className="font-bold text-xl mb-2 text-foreground">Select Source File</h4>
                  <p className="text-sm text-muted-foreground font-normal">Drop your spreadsheet here or click to browse local files.</p>
                  <div className="mt-8 flex justify-center gap-4">
                     <Badge variant="secondary" className="bg-white text-sm font-bold py-1 px-3">CSV Supported</Badge>
                     <Badge variant="secondary" className="bg-white text-sm font-bold py-1 px-3">XLSX Supported</Badge>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} />
                </div>
              ) : (
                <div className="p-8 bg-primary/5 border-2 border-primary/10 rounded-[2rem] flex items-center justify-between group animate-in zoom-in-95">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary">
                      <FileSpreadsheet className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="font-bold text-lg truncate max-w-[250px]">{file.name}</p>
                      <p className="text-sm text-primary font-bold uppercase tracking-widest">{(file.size / 1024).toFixed(1)} KB • Ready to Inject</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="h-12 w-12 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sheets" className="pt-2 space-y-6">
              <div className="space-y-4">
                <Label className="font-bold text-sm sm:text-base flex items-center gap-2">
                   <LinkIcon className="h-4 w-4 text-primary" /> Public Google Sheet URL
                </Label>
                <Input 
                  placeholder="https://docs.google.com/spreadsheets/d/..." 
                  value={googleSheetUrl}
                  onChange={(e) => { setGoogleSheetUrl(e.target.value); setResults(null); }}
                  className="h-14 rounded-2xl bg-neutral-50/50 border-neutral-200 focus:bg-white transition-all text-sm font-medium"
                />
                <div className="p-6 rounded-[1.5rem] bg-amber-50 border border-amber-100 flex gap-4">
                  <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm text-amber-900 font-bold">Privacy Check Required</p>
                    <p className="text-sm text-amber-800 leading-relaxed font-normal">
                      Ensure the sheet is set to <strong>"Anyone with the link can view"</strong>. Header row must include <code>title</code> and <code>url</code> columns.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {isProcessing && (
            <div className="space-y-5 p-8 bg-[#111111] text-white rounded-[2rem] shadow-2xl animate-in fade-in">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="flex items-center gap-3 animate-pulse">
                   <Loader2 className="h-4 w-4 animate-spin text-accent" /> 
                   Injecting dynamic entries into registry...
                </span>
                <span className="text-accent">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2.5 bg-white/10" />
            </div>
          )}

          {results && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500">
              <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-[2rem] text-center shadow-sm">
                <p className="text-4xl font-bold text-emerald-600 mb-1">{results.success}</p>
                <p className="text-[10px] font-bold uppercase text-emerald-500 tracking-[0.2em]">Ready to Scan</p>
              </div>
              <div className="p-8 bg-red-50 border border-red-100 rounded-[2rem] text-center shadow-sm">
                <p className="text-4xl font-bold text-red-600 mb-1">{results.failed}</p>
                <p className="text-[10px] font-bold uppercase text-red-500 tracking-[0.2em]">Skipped</p>
              </div>
              <div className="p-8 bg-neutral-100 border border-neutral-200 rounded-[2rem] text-center shadow-sm">
                <p className="text-4xl font-bold text-neutral-600 mb-1">{results.total}</p>
                <p className="text-[10px] font-bold uppercase text-neutral-500 tracking-[0.2em]">Total Entries</p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-neutral-50/50 p-8 sm:p-10 border-t flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-start gap-4">
             <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-primary" />
             </div>
             <p className="text-sm text-muted-foreground font-normal leading-relaxed max-w-sm">
               By using Bulk Generator, you agree to our fair use policy. Redirection is limited by your plan's total capacity.
             </p>
          </div>
          <Button 
            className="w-full sm:w-auto h-16 px-12 font-bold shadow-2xl shadow-primary/20 gap-3 text-sm sm:text-base rounded-2xl transition-all hover:scale-[1.02]"
            onClick={processBulk}
            disabled={isProcessing || (!file && !googleSheetUrl)}
          >
            {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Layers className="h-5 w-5" />}
            Start Bulk Injection
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
