
'use client';

import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Zap, X, Settings, Save, Loader2, BookmarkPlus, Layers, Layout, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUser, useFirestore, setDocumentNonBlocking } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { VCardTab } from "./tabs/VCardTab";
import { BioTab } from "./tabs/BioTab";
import { HeroTab } from "./tabs/HeroTab";
import { DetailsTab } from "./tabs/DetailsTab";
import { FeaturesTab } from "./tabs/FeaturesTab";
import { ProductsTab } from "./tabs/ProductsTab";
import { StepsTab } from "./tabs/StepsTab";
import { CTATab } from "./tabs/CTATab";
import { GalleryTab } from "./tabs/GalleryTab";
import { SocialTab } from "./tabs/SocialTab";
import { FAQTab } from "./tabs/FAQTab";
import { ReviewsTab } from "./tabs/ReviewsTab";
import { LeadFormTab } from "./tabs/LeadFormTab";
import { VideoTab } from "./tabs/VideoTab";
import { CountdownTab } from "./tabs/CountdownTab";
import { PaymentsTab } from "./tabs/PaymentsTab";
import { LegalTab } from "./tabs/LegalTab";
import { FooterTab } from "./tabs/FooterTab";
import { ContactTab } from "./tabs/ContactTab";

const TEMPLATE_CATEGORIES = ["Business", "Real Estate", "Restaurant", "Personal", "Event", "Luxury", "Sales"];

/**
 * The Inspector Panel is the right sidebar where individual block settings are edited.
 */
export function InspectorPanel({ 
  editingSectionId, 
  pageData, 
  updateSectionData, 
  uploadingField, 
  handleImageUpload, 
  addItem, 
  removeItem, 
  updateItem, 
  moveItem,
  setEditingSectionId 
}: any) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveType, setSaveType] = useState<'block' | 'full-page'>('block');
  const [saveForm, setSaveForm] = useState({ name: '', description: '', category: 'Business' });
  const [isSaving, setIsSaving] = useState(false);

  if (!editingSectionId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
        <div className="h-20 w-20 bg-neutral-100 rounded-full flex items-center justify-center shadow-inner">
          <Settings className="h-10 w-10 animate-spin-slow" />
        </div>
        <p className="font-black text-[10px] uppercase tracking-[0.3em] px-4 text-balance">Select a block from the architecture panel to begin editing.</p>
      </div>
    );
  }

  const section = pageData.sections.find((s: any) => s.id === editingSectionId);
  if (!section) return null;

  // Extract Identity Context for AI tools
  const vcardSection = pageData.sections?.find((s: any) => s.type === 'vcard');
  const vcardData = vcardSection?.data || {};

  const commonProps = {
    sectionId: section.id,
    pageData: section.data,
    globalAiContext: {
        businessName: pageData.businessName,
        goal: pageData.aiGoal,
        audience: pageData.aiAudience,
        offer: pageData.aiOffer,
        description: pageData.aiDescription,
        fullName: vcardData.fullName || pageData.businessName || "Identity",
        designation: vcardData.designation || "",
        company: vcardData.company || ""
    },
    setPageData: (data: any) => updateSectionData(section.id, data),
    uploadingField,
    handleImageUpload: (e: any, f: string, idx?: number) => handleImageUpload(e, f, section.id, idx),
    addItem,
    removeItem,
    updateItem,
    moveItem
  };

  const handleSaveToLibrary = async () => {
    if (!db || !user?.uid || !saveForm.name) {
      toast({ variant: "destructive", title: "Wait!", description: "Template name is mandatory for registry." });
      return;
    }

    setIsSaving(true);
    try {
      const templateId = crypto.randomUUID();
      const templateRef = doc(db, "smartTemplates", templateId);
      
      const templateData: any = {
        id: templateId,
        userId: user.uid,
        name: saveForm.name,
        description: saveForm.description,
        type: saveType,
        categories: [saveForm.category],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (saveType === 'full-page') {
        templateData.sections = JSON.parse(JSON.stringify(pageData.sections || []));
        templateData.design = {
          themeColor: pageData.themeColor || "#6750A4",
          themeVariant: pageData.themeVariant || "light",
          fontType: pageData.fontType || "font-body",
          cardRadius: pageData.cardRadius || 32,
        };
      } else {
        templateData.targetBlockType = section.type;
        templateData.data = JSON.parse(JSON.stringify(section.data || {}));
      }

      setDocumentNonBlocking(templateRef, templateData, { merge: true });
      
      // Delay response slightly to feel more synchronous and ensure write is initiated
      setTimeout(() => {
        toast({ title: "Template Saved", description: `"${saveForm.name}" added to your design library.` });
        setIsSaving(false);
        setIsSaveDialogOpen(false);
        setSaveForm({ name: '', description: '', category: 'Business' });
      }, 500);

    } catch (err: any) {
      console.error("Library Save Error:", err);
      toast({ variant: "destructive", title: "Registry Fault", description: err.message || "Could not sync template node." });
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-6 duration-500">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg">
            <Zap className="h-5 w-5" />
          </div>
          <Badge className="bg-primary text-white uppercase text-[9px] font-black h-7 px-4 rounded-lg shadow-sm">
            {section.type}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSaveDialogOpen(true)}
            className="h-9 w-9 rounded-full text-primary hover:bg-primary/5 shadow-inner"
            title="Save as Template"
          >
            <BookmarkPlus className="h-5 w-5" />
          </Button>
          <button onClick={() => setEditingSectionId(null)} className="h-9 w-9 rounded-full hover:bg-neutral-100 flex items-center justify-center text-muted-foreground transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="space-y-10">
        {section.type === 'vcard' && <VCardTab {...commonProps} />}
        {section.type === 'bio' && <BioTab {...commonProps} />}
        {section.type === 'contact' && <ContactTab {...commonProps} />}
        {section.type === 'hero' && <HeroTab {...commonProps} />}
        {section.type === 'benefits' && <DetailsTab {...commonProps} />}
        {section.type === 'features' && <FeaturesTab {...commonProps} />}
        {section.type === 'products' && <ProductsTab {...commonProps} />}
        {section.type === 'steps' && <StepsTab {...commonProps} />}
        {section.type === 'cta' && <CTATab {...commonProps} />}
        {section.type === 'gallery' && <GalleryTab {...commonProps} />}
        {section.type === 'social' && <SocialTab {...commonProps} />}
        {section.type === 'faq' && <FAQTab {...commonProps} />}
        {section.type === 'reviews' && <ReviewsTab {...commonProps} />}
        {section.type === 'leadForm' && <LeadFormTab {...commonProps} />}
        {section.type === 'video' && <VideoTab {...commonProps} />}
        {section.type === 'countdown' && <CountdownTab {...commonProps} />}
        {section.type === 'payments' && <PaymentsTab {...commonProps} />}
        {section.type === 'legal' && <LegalTab {...commonProps} />}
        {section.type === 'footer' && <FooterTab {...commonProps} />}
      </div>

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <BookmarkPlus className="h-6 w-6 text-primary" /> Archive Strategy
            </DialogTitle>
            <DialogDescription className="font-medium">Save this design node to your personal design hub.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
             <div className="space-y-4">
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Archive Mode</Label>
                   <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setSaveType('block')} 
                        className={cn(
                          "h-14 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all",
                          saveType === 'block' ? "bg-primary border-primary text-white shadow-xl scale-[1.02]" : "bg-neutral-50 border-transparent text-muted-foreground"
                        )}
                      >
                         <Layers className="h-5 w-5" />
                         <span className="text-[9px] font-black uppercase">THIS BLOCK</span>
                      </button>
                      <button 
                        onClick={() => setSaveType('full-page')} 
                        className={cn(
                          "h-14 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all",
                          saveType === 'full-page' ? "bg-primary border-primary text-white shadow-xl scale-[1.02]" : "bg-neutral-50 border-transparent text-muted-foreground"
                        )}
                      >
                         <Layout className="h-5 w-5" />
                         <span className="text-[9px] font-black uppercase">FULL BLUEPRINT</span>
                      </button>
                   </div>
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Template Name</Label>
                   <Input 
                      value={saveForm.name} 
                      onChange={e => setSaveForm(prev => ({...prev, name: e.target.value}))} 
                      placeholder="e.g. My Premium Bio" 
                      className="h-12 rounded-xl font-black text-sm bg-neutral-50 border-none shadow-inner"
                   />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Classification</Label>
                   <select 
                      value={saveForm.category} 
                      onChange={e => setSaveForm(prev => ({...prev, category: e.target.value}))}
                      className="w-full h-12 rounded-xl border bg-neutral-50 px-4 text-sm font-bold outline-none"
                   >
                      {TEMPLATE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Description</Label>
                   <Input 
                      value={saveForm.description} 
                      onChange={e => setSaveForm(prev => ({...prev, description: e.target.value}))} 
                      placeholder="Details about this design..." 
                      className="h-12 rounded-xl text-sm bg-neutral-50 border-none shadow-inner"
                   />
                </div>
             </div>
          </div>
          <DialogFooter className="pt-4 border-t gap-2">
             <Button variant="ghost" onClick={() => setIsSaveDialogOpen(false)} className="rounded-xl font-bold h-12 flex-1">Cancel</Button>
             <Button onClick={handleSaveToLibrary} disabled={isSaving || !saveForm.name} className="h-12 rounded-xl font-black gap-2 shadow-xl px-8 flex-1 bg-primary text-white">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Sync to Archive
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
