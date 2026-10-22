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
  ShieldCheck,
  IdCard,
  UserPlus
} from "lucide-react";
import { Link } from "react-router-dom";
import Papa from "papaparse";
import * as XLSX from 'xlsx';
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser, useDoc, useMemoFirebase, setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { doc, increment, serverTimestamp, collection } from "firebase/firestore";
// Corrected relative path to block-defaults in qrs/microsite folder
import { getBlockDefaults } from "../../qrs/microsite/block-defaults";

export default function BulkIDPage() {
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
    return profile?.currentPlanId === 'ent_plan' || profile?.isAdmin;
  }, [profile]);

  const downloadTemplate = () => {
    const headers = ["full_name", "designation", "company", "mobile", "email", "website", "bio_english", "bio_hindi", "slug"];
    const sampleData = [
      ["Rahul Sharma", "Manager", "Tech Corp", "919876543210", "rahul@tech.com", "https://tech.com", "Expert in cloud nodes.", "क्लाउड नोड्स में विशेषज्ञ।", "rahul-tech"],
      ["Anjali Gupta", "Founder", "Craft Studio", "919988776655", "anjali@craft.com", "https://craft.in", "Creative design lead.", "क्रिएटिव डिज़ाइन लीड।", "anjali-studio"]
    ];
    
    const csvContent = [headers.join(","), ...sampleData.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "linkqr_bulk_id_template.csv");
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

  const processBulkIDs = async () => {
    if (!isEnterprise) {
      toast({ 
        variant: "destructive", 
        title: "Enterprise Access Required", 
        description: "Bulk ID Generation is an Enterprise feature.",
        action: <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/billing')}>View Plans</Button>
      });
      return;
    }

    if (!user || !db || !userProfileRef) return;

    setIsProcessing(true);
    setProgress(5);
    
    try {
      const dataRows = await parseData();
      if (dataRows.length === 0) throw new Error("No data found in the source.");
      if (dataRows.length > 500) throw new Error("Maximum 500 IDs allowed per batch.");

      let successCount = 0;
      let failedCount = 0;

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        const fullName = row.full_name || row.Name || row.fullName;
        
        if (!fullName) {
          failedCount++;
          continue;
        }

        const id = crypto.randomUUID();
        const timestamp = serverTimestamp();
        const slug = row.slug || `${fullName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;

        // PRE-CONSTRUCT BLOCKS
        const vcardData = getBlockDefaults('vcard', {}, user);
        vcardData.fullName = fullName;
        vcardData.designation = row.designation || "";
        vcardData.company = row.company || "";
        vcardData.mobile = row.mobile || "";
        vcardData.email = row.email || "";
        vcardData.website = row.website || "";

        const bioData = getBlockDefaults('bio', {}, user);
        bioData.content = row.bio_english || row.bio || "";
        bioData.contentHi = row.bio_hindi || "";

        const sections = [
          { id: `vcard-${id.substring(0,8)}`, type: 'vcard', data: vcardData },
          { id: `bio-${id.substring(0,8)}`, type: 'bio', data: bioData },
          { id: `social-${id.substring(0,8)}`, type: 'social', data: { items: [] } },
          { id: `contact-${id.substring(0,8)}`, type: 'contact', data: getBlockDefaults('contact', {}, user) }
        ];

        const cardData = {
          id,
          userId: user.uid,
          type: 'vcard',
          businessName: fullName,
          slug,
          sections,
          themeColor: "#6750A4",
          cardRadius: 32,
          fontType: "font-body",
          createdAt: timestamp,
          updatedAt: timestamp,
          stats: { views: 0, saves: 0 }
        };

        const cardRef = doc(db, "users", user.uid, "digitalIDs", id);
        setDocumentNonBlocking(cardRef, cardData, { merge: true });

        const regRef = doc(db, "publicSmartPages", id);
        setDocumentNonBlocking(regRef, { 
          micrositeId: id, 
          userId: user.uid, 
          collectionName: 'digitalIDs', 
          type: 'vcard',
          slug, 
          updatedAt: timestamp 
        }, { merge: true });

        if (slug) {
            const slugRegRef = doc(db, "publicSmartPages", slug);
            setDocumentNonBlocking(slugRegRef, { micrositeId: id, userId: user.uid, collectionName: 'digitalIDs', type: 'vcard', slug, updatedAt: timestamp }, { merge: true });
        }

        successCount++;
        setProgress(Math.round(((i + 1) / dataRows.length) * 100));
      }

      updateDocumentNonBlocking(userProfileRef, {
        vCardCount: increment(successCount),
        updatedAt: serverTimestamp()
      });

      setResults({ success: successCount, failed: failedCount, total: dataRows.length });
      toast({ title: "Fleet Deployment Complete", description: `Successfully injected ${successCount} identity nodes.` });

    } catch (err: any) {
      toast({ variant: "destructive", title: "Bulk Error", description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 mb-24">
      <div className="flex items-center justify-between mb-8">
        <Link to="/dashboard/vcards" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
          <ArrowLeft className="h-4 w-4" /> BACK TO IDENTITY HUB
        </Link>
        <Button variant="outline" size="sm" className="gap-2 font-black text-[10px] uppercase border-2 h-10 px-6" onClick={downloadTemplate}>
          <Download className="h-4 w-4" /> Download Sample Template
        </Button>
      </div>

      {!isEnterprise && (
        <Card className="mb-10 border-none bg-neutral-900 text-white shadow-2xl overflow-hidden relative rounded-[2rem]">
          <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
            <Crown className="h-40 w-40" />
          </div>
          <CardContent className="p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-3 text-center md:text-left">
              <Badge className="bg-amber-500/20 text-amber-400 border-none px-4 py-1 font-bold text-[10px] uppercase tracking-widest rounded-full">Fleet Deployment Node</Badge>
              <h3 className="text-3xl font-black">Bulk Identity Restricted</h3>
              <p className="text-neutral-400 text-sm font-medium max-w-md leading-relaxed">Upgrade to Enterprise to deploy thousands of Digital IDs for your entire sales fleet instantly.</p>
            </div>
            <Button className="bg-white text-neutral-900 hover:bg-neutral-100 font-black h-16 px-12 rounded-2xl shadow-2xl transition-transform hover:scale-[1.02]" asChild>
              <Link to="/dashboard/billing">Unlock Fleet Suite</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[3rem] relative">
        {!isEnterprise && <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 pointer-events-none" />}
        <CardHeader className="p-8 sm:p-12 pb-0">
          <div className="space-y-2">
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary font-bold px-4 py-1 text-[10px] uppercase tracking-tighter">Injection Node v4.0</Badge>
            <CardTitle className="text-3xl sm:text-5xl font-black flex items-center gap-4">
              <UserPlus className="h-8 w-8 text-primary" />
              ID Fleet Injector
            </CardTitle>
            <CardDescription className="text-sm sm:text-lg font-medium">Mass-deploy professional identities from spreadsheets or sheets.</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 sm:p-12 space-y-12">
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setResults(null); setFile(null); }} className="w-full">
            <TabsList className="grid grid-cols-2 h-14 bg-neutral-100 p-1.5 rounded-2xl shadow-inner mb-8">
              <TabsTrigger value="file" className="rounded-xl gap-2 font-black text-xs uppercase"><FileSpreadsheet className="h-4 w-4" /> CSV/Excel</TabsTrigger>
              <TabsTrigger value="sheets" className="rounded-xl gap-2 font-black text-xs uppercase"><TableIcon className="h-4 w-4" /> Google Sheets</TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="pt-2">
              {!file ? (
                <div 
                  className="border-4 border-dashed border-neutral-100 rounded-[3rem] p-16 text-center hover:border-primary/20 transition-all cursor-pointer group bg-neutral-50/30 shadow-inner"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="h-24 w-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform border">
                    <UploadCloud className="h-10 w-10 text-primary" />
                  </div>
                  <h4 className="font-black text-2xl mb-2 text-foreground">Inject Fleet Registry</h4>
                  <p className="text-sm text-muted-foreground font-medium">Drop your staff directory here or click to browse.</p>
                  <div className="mt-10 flex justify-center gap-4">
                     <Badge variant="secondary" className="bg-white text-[10px] font-black uppercase px-4 py-1 shadow-sm">CSV</Badge>
                     <Badge variant="secondary" className="bg-white text-[10px] font-black uppercase px-4 py-1 shadow-sm">XLSX</Badge>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} />
                </div>
              ) : (
                <div className="p-10 bg-primary/5 border-4 border-dashed border-primary/10 rounded-[3rem] flex items-center justify-between group animate-in zoom-in-95">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-primary border">
                      <FileSpreadsheet className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="font-black text-xl truncate max-w-[280px]">{file.name}</p>
                      <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1">Ready for mass deployment</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="h-12 w-12 rounded-full text-destructive hover:bg-red-50 transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sheets" className="pt-2 space-y-8">
              <div className="space-y-4">
                <Label className="font-black text-xs uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                   <LinkIcon className="h-3.5 w-3.5 text-primary" /> Google Sheet Live Node
                </Label>
                <Input 
                  placeholder="https://docs.google.com/spreadsheets/d/..." 
                  value={googleSheetUrl}
                  onChange={(e) => { setGoogleSheetUrl(e.target.value); setResults(null); }}
                  className="h-16 rounded-2xl bg-neutral-50/50 border-neutral-200 focus:bg-white transition-all text-sm font-bold shadow-inner"
                />
                <div className="p-6 rounded-[2rem] bg-amber-50 border border-amber-100 flex gap-5">
                  <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm text-amber-900 font-black uppercase">Privacy Requirements</p>
                    <p className="text-sm text-amber-800 leading-relaxed font-medium">
                      Ensure the sheet is set to <strong>"Anyone with the link can view"</strong>. Header row MUST match our template exactly for successful injection.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {isProcessing && (
            <div className="space-y-6 p-10 bg-[#0a0a0a] text-white rounded-[3rem] shadow-2xl animate-in fade-in">
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                <span className="flex items-center gap-3">
                   <Loader2 className="h-4 w-4 animate-spin text-accent" /> 
                   Mass Deploying Digital Identities...
                </span>
                <span className="text-accent">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3 bg-white/10" />
            </div>
          )}

          {results && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in zoom-in-95 duration-700">
              <div className="p-10 bg-emerald-50 border-2 border-emerald-100 rounded-[2.5rem] text-center shadow-inner">
                <p className="text-5xl font-black text-emerald-600 mb-1">{results.success}</p>
                <p className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em]">IDs LIVE</p>
              </div>
              <div className="p-10 bg-red-50 border-2 border-red-100 rounded-[2.5rem] text-center shadow-inner">
                <p className="text-5xl font-black text-red-600 mb-1">{results.failed}</p>
                <p className="text-[10px] font-black uppercase text-red-500 tracking-[0.2em]">Skipped</p>
              </div>
              <div className="p-10 bg-neutral-100 border-2 border-neutral-200 rounded-[2.5rem] text-center shadow-inner">
                <p className="text-5xl font-black text-neutral-600 mb-1">{results.total}</p>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Processed</p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-neutral-50 p-10 sm:p-14 border-t flex flex-col sm:flex-row items-center justify-between gap-10">
          <div className="flex items-start gap-5">
             <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 shadow-inner">
                <ShieldCheck className="h-6 w-6 text-primary" />
             </div>
             <p className="text-[11px] text-muted-foreground font-bold uppercase leading-relaxed max-w-sm tracking-tight">
               By using Fleet Injector, you agree to automate identity nodes according to our infrastructure fair-use policy.
             </p>
          </div>
          <Button 
            className="w-full sm:w-auto h-20 px-16 font-black shadow-2xl shadow-primary/30 gap-4 text-sm sm:text-lg rounded-[2rem] transition-all hover:scale-[1.02] active:scale-95"
            onClick={processBulkIDs}
            disabled={isProcessing || (!file && !googleSheetUrl)}
          >
            {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Layers className="h-6 w-6" />}
            LAUNCH FLEET DEPLOYMENT
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
