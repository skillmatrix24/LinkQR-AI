
"use client";

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  QrCode,
  MoreVertical,
  MousePointer2,
  Loader2,
  Plus,
  Trash2,
  Download,
  Edit2,
  Power,
  Palette,
  Sparkles,
  Lock,
  Layers,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  useFirestore,
  useUser,
  useCollection,
  useMemoFirebase,
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking,
  setDocumentNonBlocking,
  useDoc,
  useStorage,
} from '@/firebase';
import { collection, query, orderBy, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { QRCodeSVG } from "qrcode.react";
import { cn } from '@/lib/utils';

const rgbDashToHex = (dash: string, fallback: string = '#000000') => {
  if (!dash) return fallback;
  if (dash.startsWith('#')) return dash;
  try {
    const parts = dash.split('-').map(p => {
      const hex = parseInt(p).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    });
    return `#${parts.join('')}`;
  } catch (e) {
    return fallback;
  }
};

const parseColorData = (encoded: string, fallback: string) => {
  if (!encoded) return { type: 'solid' as const, c1: fallback, c2: fallback };
  if (encoded.startsWith('linear:')) {
    const parts = encoded.split(':');
    return { 
      type: 'linear' as const, 
      c1: rgbDashToHex(parts[1], fallback), 
      c2: rgbDashToHex(parts[2], fallback) 
    };
  }
  return { 
    type: 'solid' as const, 
    c1: rgbDashToHex(encoded, fallback), 
    c2: rgbDashToHex(encoded, fallback) 
  };
};

export default function QRsPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const storage = useStorage();

  const [activeQR, setActiveQR] = useState<any>(null);
  const [qrToDelete, setQrToDelete] = useState<any>(null);
  const [activeDialog, setActiveDialog] = useState<'edit' | 'design' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloadingId, setIsDownloadingId] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  
  const [fgType, setFgType] = useState<'solid' | 'linear'>('solid');
  const [fgColor1, setFgColor1] = useState('#000000');
  const [fgColor2, setFgColor2] = useState('#000000');
  
  const [bgType, setBgType] = useState<'solid' | 'linear'>('solid');
  const [bgColor1, setBgColor1] = useState('#ffffff');
  const [bgColor2, setBgColor2] = useState('#ffffff');
  
  const [logoUrl, setLogoUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const userProfileRef = useMemoFirebase(() => (db && user?.uid) ? doc(db, "users", user.uid) : null, [db, user?.uid]);
  const siteConfigRef = useMemoFirebase(() => db ? doc(db, "config", "site") : null, [db]);
  
  const { data: profile, isLoading: isProfileLoading } = useDoc(userProfileRef);
  const { data: siteConfig } = useDoc(siteConfigRef);

  const baseUrl = useMemo(() => {
    const configUrl = siteConfig?.publicBaseUrl?.replace(/\/$/, "");
    return configUrl || "https://linkqr.in";
  }, [siteConfig]);

  const isFree = useMemo(() => !profile?.currentPlanId || profile?.currentPlanId === 'free_plan', [profile]);

  const qrsQuery = useMemoFirebase(() => (db && user?.uid) ? query(collection(db, 'users', user.uid, 'qrcodes'), orderBy('createdAt', 'desc')) : null, [db, user?.uid]);
  const { data: qrs, isLoading: isQrsLoading } = useCollection(qrsQuery);

  useEffect(() => {
    if (!isQrsLoading && !isProfileLoading) {
      const timer = setTimeout(() => setIsInitialLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isQrsLoading, isProfileLoading]);

  const handleToggle = useCallback((qr: any) => {
    if (!db || !user?.uid) return;
    const nextStatus = !qr.isActive;
    
    updateDocumentNonBlocking(doc(db, 'users', user.uid, 'qrcodes', qr.id), { 
      isActive: nextStatus, 
      updatedAt: serverTimestamp() 
    });

    if (qr.shortCode) {
      setDocumentNonBlocking(doc(db, "publicShortLinks", qr.shortCode), {
        shortCode: qr.shortCode,
        isActive: nextStatus,
        qrCodeId: qr.id,
        userId: user.uid,
        originalUrl: qr.originalUrl,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
    
    toast({ title: nextStatus ? 'QR Activated' : 'QR Deactivated' });
  }, [db, user, toast]);

  const confirmDelete = async () => {
    if (!qrToDelete || !db || !user?.uid) return;
    deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'qrcodes', qrToDelete.id));
    if (qrToDelete.shortCode) {
      deleteDocumentNonBlocking(doc(db, "publicShortLinks", qrToDelete.shortCode));
    }
    toast({ title: 'QR Permanently Removed' });
    setQrToDelete(null);
  };

  const handleDownload = async (qr: any) => {
    setIsDownloadingId(qr.id);
    const svgEl = document.getElementById(`qr-svg-${qr.id}`) as unknown as SVGSVGElement;
    if (!svgEl) {
      setIsDownloadingId(null);
      return;
    }

    try {
      const width = 2000;
      const height = 3000; 
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#F2EFF7'; 
      ctx.fillRect(0, 0, width, height);

      const cardPadding = 100;
      const cardWidth = width - (cardPadding * 2);
      const cardHeight = height - (cardPadding * 2);
      
      const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
      };

      ctx.fillStyle = '#ffffff';
      drawRoundedRect(cardPadding, cardPadding, cardWidth, cardHeight, 100);
      ctx.fill();

      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#6750A4'; ctx.font = `900 150px Inter, sans-serif`;
      ctx.fillText(qr.title || 'Smart Link', width / 2, cardPadding + 280);

      const qrBoxSize = 1350;
      const qrBoxX = (width - qrBoxSize) / 2;
      const qrBoxY = cardPadding + 500;
      ctx.fillStyle = '#F9F7FF';
      drawRoundedRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 80);
      ctx.fill();

      const qrSize = 1150;
      const svgClone = svgEl.cloneNode(true) as SVGSVGElement;
      svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      const gradDef = document.getElementById(`grad-def-${qr.id}`);
      if (gradDef) {
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        defs.appendChild(gradDef.cloneNode(true));
        svgClone.prepend(defs);
      }

      const svgData = new XMLSerializer().serializeToString(svgClone);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const loadImg = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image(); img.crossOrigin = "anonymous"; img.onload = () => resolve(img); img.onerror = () => reject(new Error('Image load failed')); img.src = src;
        });
      };

      const qrImg = await loadImg(svgUrl);
      ctx.drawImage(qrImg, (width - qrSize) / 2, qrBoxY + (qrBoxSize - qrSize) / 2, qrSize, qrSize);
      URL.revokeObjectURL(svgUrl);

      if (qr.logoUrl) {
        try {
          const logoImg = await loadImg(qr.logoUrl);
          const logoSize = qrSize * 0.22;
          ctx.drawImage(logoImg, (width - logoSize) / 2, qrBoxY + (qrBoxSize - logoSize) / 2, logoSize, logoSize);
        } catch (e) {}
      }

      const boxY = height - cardPadding - 700;
      const boxHeight = 520; const boxWidth = cardWidth - 240; const boxX = cardPadding + 120;
      ctx.fillStyle = '#F9F7FF'; drawRoundedRect(boxX, boxY, boxWidth, boxHeight, 80); ctx.fill();

      ctx.fillStyle = '#6750A4'; ctx.font = '900 80px Inter, sans-serif';
      ctx.fillText('SCAN FOR DESTINATION', width / 2, boxY + 160);

      ctx.font = '700 50px Inter, sans-serif'; ctx.fillStyle = '#6750A4'; ctx.globalAlpha = 0.6;
      const displayUrl = qr.originalUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
      ctx.fillText(displayUrl, width / 2, boxY + 380);

      const pngUrl = canvas.toDataURL('image/png', 1.0);
      const dl = document.createElement('a');
      dl.download = `LinkQR-${qr.shortCode}.png`;
      dl.href = pngUrl;
      dl.click();
      toast({ title: 'HD Poster Ready' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error generating poster' });
    } finally {
      setIsDownloadingId(null);
    }
  };

  const openEditDialog = (qr: any) => {
    setActiveQR(qr);
    setFormTitle(qr.title || '');
    setFormUrl(qr.originalUrl || '');
    setActiveDialog('edit');
  };

  const openDesignDialog = (qr: any) => {
    setActiveQR(qr);
    const f = parseColorData(qr.fgColor || '', '#000000');
    setFgType(f.type);
    setFgColor1(f.c1);
    setFgColor2(f.c2);
    const b = parseColorData(qr.bgColor || '', '#ffffff');
    setBgType(b.type);
    setBgColor1(b.c1);
    setBgColor2(b.c2);
    setLogoUrl(qr.logoUrl || '');
    setActiveDialog('design');
  };

  const saveEdit = async () => {
    if (!activeQR || !db || !user?.uid) return;
    setIsSaving(true);
    try {
      updateDocumentNonBlocking(doc(db, 'users', user.uid, 'qrcodes', activeQR.id), { 
        title: formTitle, 
        originalUrl: formUrl, 
        updatedAt: serverTimestamp() 
      });

      if (activeQR.shortCode) {
        setDocumentNonBlocking(doc(db, "publicShortLinks", activeQR.shortCode), {
          shortCode: activeQR.shortCode,
          originalUrl: formUrl,
          qrCodeId: activeQR.id,
          userId: user.uid,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      
      toast({ title: 'Success', description: 'Destination updated.' });
      setActiveDialog(null);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const saveDesign = async () => {
    if (!activeQR || !db || !user?.uid) return;
    setIsSaving(true);

    const hexToDash = (hex: string) => {
      const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return r ? `${parseInt(r[1], 16)}-${parseInt(r[2], 16)}-${parseInt(r[3], 16)}` : '0-0-0';
    };

    const fg = fgType === 'solid' ? hexToDash(fgColor1) : `linear:${hexToDash(fgColor1)}:${hexToDash(fgColor2)}`;
    const bg = bgType === 'solid' ? hexToDash(bgColor1) : `linear:${hexToDash(bgColor1)}:${hexToDash(bgColor2)}`;
    
    // INSTANT DISPATCH: UI won't wait for storage
    updateDocumentNonBlocking(doc(db, 'users', user.uid, 'qrcodes', activeQR.id), { 
      fgColor: fg, 
      bgColor: bg,
      logoUrl: logoUrl, // Fallback to base64 initially
      updatedAt: serverTimestamp() 
    });

    // ASYNC BACKGROUND STORAGE TASK
    if (logoUrl && logoUrl.startsWith('data:') && logoUrl !== activeQR.logoUrl && storage) {
      uploadString(ref(storage, `users/${user.uid}/logos/${activeQR.id}`), logoUrl, 'data_url')
        .then(async (res) => {
          const downloadUrl = await getDownloadURL(res.ref);
          updateDocumentNonBlocking(doc(db, 'users', user.uid, 'qrcodes', activeQR.id), { logoUrl: downloadUrl });
        })
        .catch(err => console.warn("Background upload failed, keeping base64.", err));
    }
    
    toast({ title: 'Success', description: 'Design deployed instantly.' });
    setActiveDialog(null);
    setIsSaving(false);
  };

  if (isInitialLoading) return <div className="flex flex-col items-center justify-center min-h-[400px] gap-6"><Loader2 className="h-10 w-10 animate-spin text-primary" /><p className="text-muted-foreground font-bold uppercase text-xs">Loading Studio...</p></div>;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 pb-24 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Smart Links</h1>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="h-11 rounded-xl border-2" asChild><Link to="/dashboard/qrcodes/ai"><Sparkles className="h-4 w-4 mr-2" /> AI Magic</Link></Button>
          <Button className="h-11 rounded-xl shadow-xl shadow-primary/20" asChild><Link to="/dashboard/qrs/new"><Plus className="h-5 w-5 mr-2" /> New QR</Link></Button>
        </div>
      </div>

      {qrs && qrs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {qrs.map(qr => {
            const fgData = parseColorData(qr.fgColor || '', '#000000');
            const bgData = parseColorData(qr.bgColor || '', '#ffffff');
            const qrValue = `${baseUrl}/r/${qr.shortCode}`;
            return (
              <Card key={qr.id} className={cn("border-none shadow-sm bg-white overflow-hidden rounded-[2rem] group hover:shadow-xl transition-all duration-500", !qr.isActive && "opacity-90")}>
                <CardContent className="p-0">
                  <div className="p-8 bg-neutral-50/50 flex items-center justify-center border-b aspect-square max-h-72 relative">
                    {!qr.isActive && <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/5 backdrop-blur-[1px]"><div className="bg-white/95 px-5 py-2 rounded-full border-2 flex items-center gap-2 shadow-xl"><Power className="h-3.5 w-3.5 text-orange-500" /><span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">Paused</span></div></div>}
                    <svg width="0" height="0" className="absolute"><defs><linearGradient id={`grad-def-${qr.id}`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={fgData.c1} /><stop offset="100%" stopColor={fgData.c2} /></linearGradient><linearGradient id={`grad-bg-def-${qr.id}`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={bgData.c1} /><stop offset="100%" stopColor={bgData.c2} /></linearGradient></defs></svg>
                    <div className="bg-white p-4 rounded-[1.5rem] shadow-inner h-48 w-48 flex items-center justify-center border-2 border-neutral-100">
                      <QRCodeSVG id={`qr-svg-${qr.id}`} value={qrValue} size={1024} style={{ width: '100%', height: '100%' }} fgColor={fgData.type === 'linear' ? `url(#grad-def-${qr.id})` : fgData.c1} bgColor={bgData.type === 'linear' ? `url(#grad-bg-def-${qr.id})` : bgData.c1} level="H" imageSettings={qr.logoUrl ? { src: qr.logoUrl, height: 220, width: 220, excavate: true } : undefined} includeMargin={false} />
                    </div>
                  </div>
                  <div className="p-6 space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1"><h3 className="font-bold text-lg truncate tracking-tight">{qr.title || 'Untitled'}</h3><p className="text-[11px] text-primary font-bold truncate uppercase tracking-tighter mt-1 opacity-70">/r/{qr.shortCode}</p></div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg border shadow-sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 border shadow-xl">
                          <DropdownMenuItem asChild className="rounded-lg h-10 font-bold text-primary bg-primary/5 cursor-pointer mb-1">
                            <Link to={`/dashboard/analytics?id=${qr.id}`} className="flex items-center w-full">
                              <BarChart3 className="h-4 w-4 mr-3" /> Deep Analytics
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1" />
                          <DropdownMenuItem onSelect={() => openEditDialog(qr)} className="rounded-lg h-10 font-medium cursor-pointer"><Edit2 className="h-4 w-4 mr-3" /> Edit Link</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => openDesignDialog(qr)} className="rounded-lg h-10 font-medium cursor-pointer"><Palette className="h-4 w-4 mr-3" /> Visual Studio</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleToggle(qr)} className="rounded-lg h-10 font-medium cursor-pointer"><Power className={cn("h-4 w-4 mr-3", qr.isActive ? 'text-orange-500' : 'text-emerald-500')} /> {qr.isActive ? 'Deactivate' : 'Reactivate'}</DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1" />
                          <DropdownMenuItem onSelect={() => handleDownload(qr)} className="rounded-lg h-10 font-bold text-emerald-600 bg-emerald-50 cursor-pointer">{isDownloadingId === qr.id ? <Loader2 className="h-4 w-4 mr-3 animate-spin" /> : <Download className="h-4 w-4 mr-3" />} HD Poster</DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1" />
                          <DropdownMenuItem onSelect={() => setQrToDelete(qr)} className="text-destructive rounded-lg h-10 font-medium cursor-pointer"><Trash2 className="h-4 w-4 mr-3" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-4 py-4 border-y border-neutral-100/50">
                      <div className="flex items-center gap-2 text-sm font-bold text-foreground/80 uppercase tracking-tighter">
                        <MousePointer2 className="h-4 w-4 text-primary" />
                        <span>{(qr.totalScans || 0).toLocaleString()} <span className="text-muted-foreground font-normal text-xs">scans</span></span>
                      </div>
                      <Link to={`/dashboard/analytics?id=${qr.id}`} className="ml-auto flex items-center gap-1.5 text-[10px] font-black uppercase text-primary hover:underline group">
                         Stats <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <Badge variant="outline" className={cn("text-[10px] font-bold tracking-widest px-2.5 h-6 rounded-md", qr.isActive ? "border-emerald-200 text-emerald-600 bg-emerald-50" : "border-neutral-200 text-neutral-400 bg-neutral-50")}>{qr.isActive ? "ACTIVE" : "PAUSED"}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-white rounded-[2rem] p-16 text-center border-4 border-dashed border-neutral-50 mx-auto max-w-2xl"><CardContent className="space-y-8"><div className="h-16 w-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto"><QrCode className="h-8 w-8 text-primary/40" /></div><h2 className="text-2xl font-bold">No QRs Created</h2><Button className="rounded-xl h-14 px-8 font-bold" asChild><Link to="/dashboard/qrs/new">Generate Smart Link</Link></Button></CardContent></Card>
      )}

      <AlertDialog open={!!qrToDelete} onOpenChange={(o) => !o && setQrToDelete(null)}><AlertDialogContent className="rounded-[1.5rem] p-8 border-none shadow-2xl"><AlertDialogHeader><AlertDialogTitle className="font-bold text-xl">Confirm Delete?</AlertDialogTitle><AlertDialogDescription>This will permanently remove the link and all historical analytics.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter className="gap-3 mt-6"><AlertDialogCancel className="rounded-xl font-bold h-12">Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white rounded-xl font-bold h-12">Delete Permanently</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>

      <Dialog open={activeDialog === 'edit'} onOpenChange={(o) => !o && setActiveDialog(null)}><DialogContent className="sm:max-w-md rounded-[1.5rem] p-8 border-none shadow-2xl"><DialogHeader><DialogTitle className="text-2xl font-bold">Update Link</DialogTitle></DialogHeader><div className="py-6 space-y-6"><div className="space-y-2"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Reference Title</Label><Input value={formTitle} onChange={e => setFormTitle(e.target.value)} className="h-12 rounded-xl border-2" /></div><div className="space-y-2"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Destination URL</Label><Input value={formUrl} onChange={e => setFormUrl(e.target.value)} className="h-12 rounded-xl border-2 font-mono text-sm" /></div></div><DialogFooter><Button className="w-full h-12 rounded-xl font-bold" onClick={saveEdit} disabled={isSaving}>{isSaving && <Loader2 className="h-5 w-5 animate-spin mr-3" />}Save Changes</Button></DialogFooter></DialogContent></Dialog>

      <Dialog open={activeDialog === 'design'} onOpenChange={(o) => !o && setActiveDialog(null)}><DialogContent className="max-w-3xl rounded-[1.5rem] overflow-hidden p-0 border-none shadow-2xl"><div className="grid grid-cols-1 md:grid-cols-2"><div className="p-8 space-y-8 bg-white"><DialogHeader><DialogTitle className="text-2xl font-bold">Visual Studio</DialogTitle></DialogHeader><div className="space-y-8"><div className="space-y-3"><div className="flex justify-between items-center"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Foreground</Label><Switch checked={fgType === 'linear'} onCheckedChange={v => setFgType(v ? 'linear' : 'solid')} /></div><div className="flex gap-2"><Input type="color" value={fgColor1} onChange={e => setFgColor1(e.target.value)} className="h-10 cursor-pointer rounded-lg border-2 p-1" />{fgType === 'linear' && <Input type="color" value={fgColor2} onChange={e => setFgColor2(e.target.value)} className="h-10 cursor-pointer rounded-lg border-2 p-1" />}</div></div><div className="space-y-3"><div className="flex justify-between items-center"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Background</Label><Switch checked={bgType === 'linear'} onCheckedChange={v => setBgType(v ? 'linear' : 'solid')} /></div><div className="flex gap-2"><Input type="color" value={bgColor1} onChange={e => setBgColor1(e.target.value)} className="h-10 cursor-pointer rounded-lg border-2 p-1" />{bgType === 'linear' && <Input type="color" value={bgColor2} onChange={e => setBgColor2(e.target.value)} className="h-10 cursor-pointer rounded-lg border-2 p-1" />}</div></div><div className="space-y-3 relative">{isFree && <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-primary/20 backdrop-blur-[1px] p-4 text-center"><Button variant="outline" size="sm" asChild><Link to="/dashboard/billing">Unlock Logo</Link></Button></div>}<Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Central Logo</Label><Button variant="outline" className="w-full h-12 rounded-xl border-2 font-bold" onClick={() => fileInputRef.current?.click()} disabled={isFree}>Upload Logo</Button><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; if (f.size > 800 * 1024) { toast({ variant: "destructive", title: "Too Large" }); return; } const r = new FileReader(); r.onloadend = () => setLogoUrl(r.result as string); r.readAsDataURL(f); }} />{logoUrl && <div className="flex items-center gap-3 p-2 bg-primary/5 rounded-xl border border-primary/10"><img src={logoUrl} className="h-8 w-8 object-contain rounded-md bg-white border" alt="Logo" /><Button variant="ghost" size="icon" className="ml-auto h-7 w-7 text-destructive" onClick={() => setLogoUrl('')}><Trash2 className="h-3.5 w-3.5" /></Button></div>}</div></div><Button className="w-full h-12 mt-4 rounded-xl font-bold bg-primary text-white shadow-xl" onClick={saveDesign} disabled={isSaving}>{isSaving && <Loader2 className="h-5 w-5 animate-spin mr-3" />}Deploy Design</Button></div><div className="bg-neutral-50/80 flex items-center justify-center p-8 border-l border-neutral-100 hidden md:flex"><div className="bg-white p-6 rounded-[2rem] shadow-2xl relative overflow-hidden border-4 border-white"><svg width="0" height="0" className="absolute"><defs><linearGradient id="prevFg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={fgColor1} /><stop offset="100%" stopColor={fgColor2} /></linearGradient></defs></svg>{activeQR && <QRCodeSVG value={`${baseUrl}/r/${activeQR.shortCode}`} size={200} fgColor={fgType === 'linear' ? 'url(#prevFg)' : fgColor1} bgColor={bgType === 'linear' ? bgColor1 : bgColor1} level="H" imageSettings={logoUrl ? { src: logoUrl, height: 45, width: 45, excavate: true } : undefined} />}<div className="absolute top-2 right-3"><Badge className="bg-primary text-white text-[8px] font-bold tracking-widest px-2 border-none">PREVIEW</Badge></div></div></div></div></DialogContent></Dialog>
    </div>
  );
}
