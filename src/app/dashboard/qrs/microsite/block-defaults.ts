
import { 
  IdCard, 
  SmartphoneIcon, 
  Target, 
  ShoppingBag, 
  Navigation, 
  Zap, 
  Users, 
  Clock, 
  BadgeIndianRupee, 
  ImageIcon, 
  Globe, 
  Monitor, 
  Star, 
  Info, 
  ShieldCheck, 
  Layout,
  MousePointer2,
  FileText,
  Phone
} from "lucide-react";

/**
 * Registry for all available block types in the builder.
 */
export const AVAILABLE_BLOCKS = [
  { id: 'vcard', icon: IdCard },
  { id: 'bio', icon: FileText },
  { id: 'hero', icon: SmartphoneIcon },
  { id: 'contact', icon: Phone },
  { id: 'benefits', icon: Target },
  { id: 'products', icon: ShoppingBag },
  { id: 'steps', icon: Navigation },
  { id: 'features', icon: Zap },
  { id: 'cta', icon: MousePointer2 },
  { id: 'leadForm', icon: Users },
  { id: 'countdown', icon: Clock },
  { id: 'payments', icon: BadgeIndianRupee },
  { id: 'gallery', icon: ImageIcon },
  { id: 'social', icon: Globe },
  { id: 'video', icon: Monitor },
  { id: 'reviews', icon: Star },
  { id: 'faq', icon: Info },
  { id: 'legal', icon: ShieldCheck },
  { id: 'footer', icon: Layout }
];

/**
 * Returns the default configuration data for a new block.
 * Enhanced to include new profile and action fields.
 */
export function getBlockDefaults(type: string, profile?: any, user?: any) {
  switch (type) {
    case 'vcard':
      return { 
        fullName: profile?.displayName || "Identity Name", 
        nameFontSize: 32,
        designation: "Professional", 
        company: "", 
        tagline: "", 
        introduction: "", 
        businessLogoUrl: "", 
        mobile: profile?.phoneNumber || "", 
        mobileSecondary: "", // NEW: Phase 6C
        mobileWhatsApp: "",  // NEW: Phase 6C
        showMobile: true,
        showMobileSecondary: false,
        showMobileWhatsApp: false,
        email: user?.email || "", 
        website: "",
        address: "", 
        locationUrl: "", 
        showLocation: true, 
        showMapPreview: false, 
        photoUrl: profile?.photoURL || "", 
        photoShape: 'circle', 
        photoScale: 1.0,
        photoInnerX: 0,
        photoInnerY: 0,
        fontType: 'font-body',
        layout: 'modern', 
        paddingTop: 80, 
        paddingBottom: 80, 
        cardPaddingX: 40,
        cardPaddingY: 60,
        showEmail: true,
        showWebsite: true,
        showQuickActions: true, 
        stickyActionsEnabled: true, // NEW: Phase 6C
        btnColor: '#6750A4',
        btnText: 'Save Contact',
        btnIcon: 'download',
        btnRadius: 20,
        btnBorderWidth: 0,
        btnBorderColor: '#6750A4',
        secondaryBtnEnabled: false,
        secondaryBtnText: 'Book Meeting',
        secondaryBtnIcon: 'calendar',
        secondaryBtnUrl: '',
        secondaryBtnColor: '#f3f4f6',
        secondaryBtnBorderColor: '#e5e7eb',
        secondaryBtnTextColor: '#111827',
        glassEnabled: false,
        nameColor: '#111827',
        titleColor: '#6750A4',
        taglineColor: '#6b7280', 
        introColor: '#4b5563', 
        cardShadow: 'xl',
        shadowColor: '#000000',
        cardRadius: 32,
        cardBorderWidth: 0,
        cardBorderColor: '#eeeeee',
        cardBorderColor2: '#eeeeee',
        cardBorderType: 'solid',
        cardBorderStyle: 'solid',
        photoBorderWidth: 4,
        photoBorderColor: '#ffffff',
        photoBorderColor2: '#ffffff',
        photoBorderType: 'solid',
        photoBorderStyle: 'solid',
        bgType: 'solid', 
        bgColor1: '#ffffff',
        cardBgImage: '',
        cardBgOpacity: 100,
        cardBgOverlayOpacity: 20,
        cardBgOverlayColor: '#000000',
        sectionBgType: 'solid',
        sectionBgColor1: 'transparent',
        vcfNote: 'Digital ID powered by LinkQR AI',
        verificationEnabled: false,
        verificationType: 'blue',
        workingHours: {
          monday: { enabled: true, start: "09:00", end: "18:00" },
          tuesday: { enabled: true, start: "09:00", end: "18:00" },
          wednesday: { enabled: true, start: "09:00", end: "18:00" },
          thursday: { enabled: true, start: "09:00", end: "18:00" },
          friday: { enabled: true, start: "09:00", end: "18:00" },
          saturday: { enabled: false, start: "10:00", end: "16:00" },
          sunday: { enabled: false, start: "10:00", end: "16:00" }
        }
      };
    case 'contact':
        return {
            sectionTitle: "Contact Hub",
            sectionDescription: "Direct connectivity nodes.",
            mobile: profile?.phoneNumber || "",
            email: user?.email || "",
            website: "",
            showMobile: true,
            showEmail: true,
            showWebsite: true,
            titleAlign: 'center',
            cardBgType: 'solid',
            cardBgColor1: '#ffffff',
            cardShadow: 'xl',
            cardRadius: 32,
            iconBgColor: '#6750A4',
            iconColor: '#ffffff',
            sectionPaddingTop: 60,
            sectionPaddingBottom: 60
        };
    case 'bio':
        return { 
          content: "Experienced professional dedicated to innovative solutions.", 
          contentHi: "",
          titleAlign: 'center',
          paddingTop: 40,
          paddingBottom: 40,
          sectionBgType: 'solid',
          sectionBgColor1: 'transparent',
          textColor: '#111827',
          hiTextColor: '#6750A4'
        };
    case 'hero':
      return { headline: "Headline Here", subheadline: "Compelling subtext", heroImage: "https://picsum.photos/seed/hero/800/600", ctaText: "Get Started", heroAlign: 'center', heroBgType: 'solid', heroBgColor1: '#ffffff', heroPaddingTop: 80, heroPaddingBottom: 80, heroImageRadius: 32 };
    case 'benefits':
      return { sectionTitle: "Our Benefits", layout: 'grid3', items: [{ title: "Excellence", desc: "Premium quality.", icon: 'check', titleColor: '#111827', cardBgType: 'solid', cardBgColor1: '#ffffff', iconBgType: 'solid', iconBgColor1: '#6750A4', cardRadius: 32, cardShadow: 'xl' }] };
    case 'features':
      return { sectionTitle: "Key Features", layout: 'grid3', items: [{ title: "Innovation", content: "Details here.", icon: 'zap', showImage: true, image: 'https://picsum.photos/seed/feat/800/500', cardRadius: 32, cardShadow: 'xl', btnEnabled: false }] };
    case 'products':
      return { sectionTitle: "Our Catalog", columns: 3, itemGap: 24, items: [{ title: 'Premium Item', price: 999, salePrice: 799, inStock: true, image: 'https://picsum.photos/seed/prod/600/600', badgeEnabled: true, badgeText: 'HOT', showDetailPopup: true }] };
    case 'steps':
      return { stepsSectionTitle: "Process", stepsLayout: 'grid3', howItWorks: [{ title: 'Step 1', desc: 'Starting point.', stepType: 'solid', stepColor1: '#6750A4', stepShape: 'rounded' }] };
    case 'leadForm':
      return { sectionTitle: "Contact Us", sectionDescription: "Leave a message.", buttonText: "Submit Inquiry", showName: true, showEmail: true, showMobile: true, showBusiness: false, successMessage: "Thank you!", formRadius: 32 };
    case 'countdown':
      return { sectionTitle: "Limited Offer", targetDate: new Date(Date.now() + 86400000).toISOString(), scarcityEnabled: true, scarcityText: "Spots Left", scarcityPercent: 85, timerCardRadius: 24, timerValueColor: '#ef4444' };
    case 'payments':
      return { sectionTitle: "Checkout", productName: "Premium Package", productPrice: 1999, paymentEnabled: true, paymentType: 'upi', upiId: '', confirmationEnabled: true };
    case 'gallery':
      return { gallerySectionTitle: "Visuals", galleryLayout: 'grid', columns: 3, gallery: [{ image: 'https://picsum.photos/seed/gal/800/600', caption: 'Moment 1', hoverEffect: 'zoom' }] };
    case 'social':
      return { 
        socialSectionTitle: "Network", 
        iconOnlyMode: false, 
        socialLinks: [{ platform: 'instagram', url: '', showLabel: true, iconBgColor1: '#E4405F' }],
        whatsappMessage: "Hello, I found your Digital Business Card on LinkQR and I am interested in your services." 
      };
    case 'reviews':
      return { reviewsSectionTitle: "Testimonials", reviews: [{ name: 'Client Name', comment: 'Great!', rating: 5, image: '' }] };
    case 'faq':
      return { faqSectionTitle: "FAQs", faqs: [{ question: 'How it works?', answer: 'Details here.', cardBgType: 'solid', cardBgColor1: '#ffffff' }] };
    case 'video':
      return { sectionTitle: "Watch Demo", videoUrl: "", videoAspectRatio: 'video', playerRadius: 24, playerShadow: 'xl' };
    case 'cta':
      return { sectionTitle: "Ready to Start?", ctaButtonText: "Get Started", ctaButtonColor: '#6750A4', sectionPaddingTop: 80 };
    case 'legal':
      return { legalSectionTitle: "Compliance", privacyPolicyContent: "Privacy details...", termsOfServiceContent: "Terms details..." };
    case 'footer':
      return { footerDescription: "Mission statement", footerCopyrightText: "© 2026", footerPadding: 80 };
    default:
      return {};
  }
}
