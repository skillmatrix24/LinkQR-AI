'use client';

import { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  QrCode,
  Globe,
  ArrowLeft,
  Loader2,
  Palette,
  Image as ImageIcon,
  MessageSquare,
  Instagram,
  Youtube,
  Facebook,
  Linkedin,
  Wifi,
  Hash,
  Send,
  Music,
  Ghost,
  Pin,
  Video,
  Twitter,
  MessageCircle,
  Lock,
  Crown,
  Sparkles,
  Trash2,
  Wand2,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  useFirestore,
  useUser,
  useDoc,
  useMemoFirebase,
  setDocumentNonBlocking,
  updateDocumentNonBlocking,
  useStorage,
} from '@/firebase';
import { doc, increment, serverTimestamp, collection } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { useCollection } from '@/firebase';
import { QRCodeSVG } from 'qrcode.react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

const SOCIAL_PRESETS = {
  whatsapp: {
    name: 'WhatsApp',
    color: '#25D366',
    icon: MessageSquare,
    placeholder: 'Phone number (e.g. 919876543210)',
    logo: 'https://cdn.simpleicons.org/whatsapp/25D366',
    formatUrl: (val: string, msg: string) =>
      `https://wa.me/${val.replace(/\D/g, '')}${
        msg ? `?text=${encodeURIComponent(msg)}` : ''
      }`,
  },
  instagram: {
    name: 'Instagram',
    color: 'linear:#405DE6:#E1306C',
    icon: Instagram,
    placeholder: 'Username',
    logo: 'https://cdn.simpleicons.org/instagram/E4405F',
    formatUrl: (val: string) => `https://instagram.com/${val}`,
  },
  youtube: {
    name: 'YouTube',
    color: '#FF0000',
    icon: Youtube,
    placeholder: 'Channel handle (e.g. @channel)',
    logo: 'https://cdn.simpleicons.org/youtube/FF0000',
    formatUrl: (val: string) =>
      `https://youtube.com/${val.startsWith('@') ? val : `@${val}`}`,
  },
  x: {
    name: 'X / Twitter',
    color: '#000000',
    icon: Twitter,
    placeholder: 'Username',
    logo: 'https://cdn.simpleicons.org/x/000000',
    formatUrl: (val: string) => `https://x.com/${val}`,
  },
  facebook: {
    name: 'Facebook',
    color: '#1877F2',
    icon: Facebook,
    placeholder: 'Profile/Page ID',
    logo: 'https://cdn.simpleicons.org/facebook/1877F2',
    formatUrl: (val: string) => `https://facebook.com/${val}`,
  },
  linkedin: {
    name: 'LinkedIn',
    color: '#0A66C2',
    icon: Linkedin,
    placeholder: 'Vanity URL name',
    logo: 'https://cdn.simpleicons.org/linkedin/0A66C2',
    formatUrl: (val: string) => `https://linkedin.com/in/${val}`,
  },
  tiktok: {
    name: 'TikTok',
    color: '#000000',
    icon: Video,
    placeholder: 'Username',
    logo: 'https://cdn.simpleicons.org/tiktok/000000',
    formatUrl: (val: string) => `https://tiktok.com/@${val}`,
  },
  telegram: {
    name: 'Telegram',
    color: '#0088cc',
    icon: Send,
    placeholder: 'Username',
    logo: 'https://cdn.simpleicons.org/telegram/26A5E4',
    formatUrl: (val: string) => `https://t.me/${val}`,
  },
  spotify: {
    name: 'Spotify',
    color: '#1DB954',
    icon: Music,
    placeholder: 'Artist/Playlist URL',
    logo: 'https://cdn.simpleicons.org/spotify/1DB954',
    formatUrl: (val: string) => val,
  },
  snapchat: {
    name: 'Snapchat',
    color: '#FFFC00',
    icon: Ghost,
    placeholder: 'Username',
    logo: 'https://cdn.simpleicons.org/snapchat/FFFC00',
    formatUrl: (val: string) => `https://snapchat.com/add/${val}`,
  },
  pinterest: {
    name: 'Pinterest',
    color: '#E60023',
    icon: Pin,
    placeholder: 'Username',
    logo: 'https://cdn.simpleicons.org/pinterest/E60023',
    formatUrl: (val: string) => `https://pinterest.com/${val}`,
  },
  sharechat: {
    name: 'ShareChat',
    color: '#D83025',
    icon: MessageCircle,
    placeholder: 'Profile ID',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/ShareChat_2022.svg',
    formatUrl: (val: string) => `https://sharechat.com/profile/${val}`,
  },
};

function NewQRPageContent() {
  const [activeTab, setActiveTab] = useState('link');
  const [platform, setPlatform] = useState<keyof typeof SOCIAL_PRESETS | ''>('');

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [socialValue, setSocialValue] = useState('');
  const [socialMessage, setSocialMessage] = useState('');

  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState('WPA');

  const [qrSize, setQrSize] = useState(220);
  const [logoSize, setLogoSize] = useState(55);

  // Fix 1: Hydration Mismatch Safety
  const [stableShortCode, setStableShortCode] = useState("");

  const [fgType, setFgType] = useState<'solid' | 'linear'>('solid');
  const [fgColor1, setFgColor1] = useState('#000000');
  const [fgColor2, setFgColor2] = useState('#000000');
  const [bgType, setBgType] = useState<'solid' | 'linear'>('solid');
  const [bgColor1, setBgColor1] = useState('#ffffff');
  const [bgColor2, setBgColor2] = useState('#ffffff');

  const [logoBase64, setLogoBase64] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useNavigate();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const storage = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Generate code only on client mount
    setStableShortCode(Math.random().toString(36).substring(2, 12));
    
    const urlParam = searchParams.get('url');
    if (urlParam) {
      setUrl(decodeURIComponent(urlParam));
    }
  }, [searchParams]);

  useEffect(() => {
    const updateSize = () => {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
      setQrSize(isMobile ? 140 : 220);
      setLogoSize(isMobile ? 35 : 55);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const siteConfigRef = useMemoFirebase(() => db ? doc(db, "config", "site") : null, [db]);
  const { data: siteConfig } = useDoc(siteConfigRef);

  const baseUrl = useMemo(() => {
    if (siteConfig?.publicBaseUrl) return siteConfig.publicBaseUrl.replace(/\/$/, "");
    return "https://linkqr.in";
  }, [siteConfig]);

  const { data: profile } = useDoc(userProfileRef);
  const plansRef = useMemoFirebase(() => db ? collection(db, 'plans') : null, [db]);
  const { data: plans } = useCollection(plansRef);

  const isFree = useMemo(() => {
    const pid = profile?.currentPlanId;
    return !pid || pid === 'free_plan';
  }, [profile]);

  const currentPlan = useMemo(() => {
    if (!profile || !plans) return null;
    return (
      plans.find(p => p.id === profile.currentPlanId) ||
      plans.find(p => p.id === 'free_plan')
    );
  }, [profile, plans]);

  const maxLimit = useMemo(() => {
    return currentPlan?.maxQRCodes || 5;
  }, [currentPlan]);

  const hexToRgbDash = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0-0-0';
    return `${parseInt(result[1], 16)}-${parseInt(result[2], 16)}-${parseInt(result[3], 16)}`;
  };

  const getEncodedColor = (type: 'solid' | 'linear', c1: string, c2: string) => {
    if (type === 'solid') return hexToRgbDash(c1);
    return `linear:${hexToRgbDash(c1)}:${hexToRgbDash(c2)}`;
  };

  useEffect(() => {
    if (activeTab === 'social' && platform) {
      const preset = SOCIAL_PRESETS[platform as keyof typeof SOCIAL_PRESETS];
      if (!preset) return;

      if (preset.color.startsWith('linear:')) {
        const parts = preset.color.split(':');
        setFgType('linear');
        setFgColor1(parts[1]);
        setFgColor2(parts[2]);
      } else {
        setFgType('solid');
        setFgColor1(preset.color);
        setFgColor2(preset.color);
      }
      setBgType('solid');
      setBgColor1('#ffffff');
      setBgColor2('#ffffff');
      setLogoBase64(preset.logo);
      setName(`${preset.name} QR`);
    } else if (activeTab === 'link') {
      setFgType('solid');
      setFgColor1('#000000');
      setFgColor2('#000000');
      setBgType('solid');
      setBgColor1('#ffffff');
      setBgColor2('#ffffff');
      setLogoBase64('');
      setName('');
    } else if (activeTab === 'utility') {
      setFgType('solid');
      setFgColor1('#000000');
      setFgColor2('#000000');
      setBgType('solid');
      setBgColor1('#ffffff');
      setBgColor2('#ffffff');
      setLogoBase64('https://cdn.simpleicons.org/wi-fi/000000');
      setName('WiFi Access QR');
    }
  }, [activeTab, platform]);

  const finalUrl = useMemo(() => {
    if (activeTab === 'link') return url;
    if (activeTab === 'social' && platform) {
      return SOCIAL_PRESETS[platform].formatUrl(socialValue, socialMessage);
    }
    if (activeTab === 'utility') {
      return `WIFI:T:${wifiEncryption};S:${wifiSSID};P:${wifiPassword};;`;
    }
    return url;
  }, [activeTab, url, platform, socialValue, socialMessage, wifiSSID, wifiPassword, wifiEncryption]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFree) {
      toast({
        variant: 'destructive',
        title: 'Premium Required',
        description: 'Center branding is a premium feature. Please upgrade to unlock.',
      });
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 800 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Logo too large',
        description: 'Max 800KB allowed.',
      });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setLogoBase64(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (!user || !db || !userProfileRef) return;
    if (!finalUrl) {
      toast({ variant: 'destructive', title: 'URL Missing', description: 'Please provide a destination.' });
      return;
    }

    setLoading(true);
    const qrCodeId = crypto.randomUUID();
    const timestamp = serverTimestamp();

    const fg = getEncodedColor(fgType, fgColor1, fgColor2);
    const bg = getEncodedColor(bgType, bgColor1, bgColor2);

    const qrData: any = {
      id: qrCodeId,
      userId: user.uid,
      title: name || 'New QR Code',
      originalUrl: finalUrl,
      shortCode: stableShortCode,
      createdAt: timestamp,
      updatedAt: timestamp,
      isActive: true,
      totalScans: 0,
      fgColor: fg,
      bgColor: bg,
      logoUrl: logoBase64,
    };

    setDocumentNonBlocking(doc(db, 'users', user.uid, 'qrcodes', qrCodeId), qrData, { merge: true });
    setDocumentNonBlocking(doc(db, 'publicShortLinks', stableShortCode), {
      shortCode: stableShortCode,
      qrCodeId,
      userId: user.uid,
      originalUrl: finalUrl,
      isActive: true,
      updatedAt: timestamp
    }, { merge: true });

    updateDocumentNonBlocking(userProfileRef, {
      qrCodeCount: increment(1),
      updatedAt: timestamp,
    });

    if (!isFree && logoBase64 && logoBase64.startsWith('data:') && storage) {
      uploadString(ref(storage, `users/${user.uid}/logos/${qrCodeId}`), logoBase64, 'data_url')
        .then(async (res) => {
          const downloadUrl = await getDownloadURL(res.ref);
          updateDocumentNonBlocking(doc(db, 'users', user.uid, 'qrcodes', qrCodeId), { logoUrl: downloadUrl });
        })
        .catch(err => console.warn("Background Storage Upload failed.", err));
    }

    toast({ title: 'Deploying...', description: 'Your Smart QR is being optimized and saved.' });
    navigate('/dashboard/qrs');
  };

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 px-2 sm:px-6 mb-20">
      <div className="flex items-center justify-between mb-8">
        <Link to="/dashboard/qrs" className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to My QRs
        </Link>
        <Button variant="outline" size="sm" className="gap-2 font-bold text-xs h-9 rounded-xl border-accent text-accent hover:bg-accent/5" asChild>
          <Link to="/dashboard/qrcodes/ai">
             <Sparkles className="h-3.5 w-3.5" /> AI Magic Studio
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
        <div className="lg:col-span-1 order-first lg:order-last">
          <Card className="border-none shadow-2xl bg-white overflow-hidden lg:sticky lg:top-24">
            <div className="h-1.5 bg-accent"></div>
            <CardHeader className="p-4 text-center">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Smart AI Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6 sm:p-10 pt-0">
              <div className="bg-white p-4 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border-2 sm:border-8 border-neutral-50 shadow-inner flex items-center justify-center relative overflow-hidden group">
                <svg width="0" height="0" className="absolute pointer-events-none">
                  <defs>
                    <linearGradient id="p-fg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={fgColor1} />
                      <stop offset="100%" stopColor={fgColor2} />
                    </linearGradient>
                    <linearGradient id="p-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={bgColor1} />
                      <stop offset="100%" stopColor={bgColor2} />
                    </linearGradient>
                  </defs>
                </svg>
                <QRCodeSVG
                  value={stableShortCode ? `${baseUrl}/r/${stableShortCode}` : "LINKQR"}
                  size={qrSize}
                  fgColor={fgType === 'linear' ? 'url(#p-fg)' : fgColor1}
                  bgColor={bgType === 'linear' ? 'url(#p-bg)' : bgColor1}
                  level="H"
                  imageSettings={logoBase64 ? { 
                    src: logoBase64, 
                    height: logoSize, 
                    width: logoSize, 
                    excavate: true 
                  } : undefined}
                />
              </div>

              <div className="mt-8 w-full space-y-2 hidden sm:block">
                <div className="p-3 rounded-xl bg-neutral-50 border text-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Redirection Target</p>
                  <p className="text-xs font-mono truncate px-2 text-primary">{finalUrl || 'Waiting for input...'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-xl bg-white overflow-hidden">
            <div className="h-1.5 bg-primary"></div>
            <CardHeader className="p-6 sm:p-8">
              <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <QrCode className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                Configure Link
              </CardTitle>
              <CardDescription>Choose a source type to generate your dynamic QR.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 pt-0">
              <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setPlatform(''); }} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-12 mb-8 bg-neutral-100 p-1 rounded-xl items-stretch overflow-hidden">
                  <TabsTrigger value="link" className="rounded-lg gap-2 text-xs font-bold"><Globe className="h-3.5 w-3.5" /> Link</TabsTrigger>
                  <TabsTrigger value="social" className="rounded-lg gap-2 text-xs font-bold relative">
                    <Hash className="h-3.5 w-3.5" /> Social {isFree && <Lock className="h-2.5 w-2.5 absolute top-1 right-1 opacity-40" />}
                  </TabsTrigger>
                  <TabsTrigger value="utility" className="rounded-lg gap-2 text-xs font-bold relative">
                    <Wifi className="h-3.5 w-3.5" /> Utility {isFree && <Lock className="h-2.5 w-2.5 absolute top-1 right-1 opacity-40" />}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="link" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">QR Title</Label>
                      <Input placeholder="e.g. My Portfolio" value={name} onChange={e => setName(e.target.value)} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">Destination URL</Label>
                      <Input placeholder="https://example.com" value={url} onChange={e => setUrl(e.target.value)} className="h-12 rounded-xl" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="social" className="space-y-8 relative">
                  {isFree && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 p-6 text-center">
                       <Crown className="h-8 w-8 text-amber-500 mb-3" />
                       <h4 className="font-bold text-lg">Social QRs are Premium</h4>
                       <Button size="sm" asChild><Link to="/dashboard/billing">Upgrade to Unlock</Link></Button>
                    </div>
                  )}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {Object.entries(SOCIAL_PRESETS).map(([id, p]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPlatform(id as any)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                          platform === id ? 'border-primary bg-primary/5 shadow-md scale-105' : 'hover:border-primary/20 hover:bg-white'
                        }`}
                      >
                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: p.color.startsWith('linear:') ? p.color.split(':')[2] : p.color }}>
                          <p.icon className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] font-bold uppercase truncate w-full text-center">{p.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>

                  {platform && (
                    <div className="space-y-4 p-6 bg-neutral-50 rounded-2xl border animate-in slide-in-from-top-2">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold">{SOCIAL_PRESETS[platform].name} Details</Label>
                          <Input placeholder={SOCIAL_PRESETS[platform].placeholder} value={socialValue} onChange={e => setSocialValue(e.target.value)} className="h-12 rounded-xl bg-white" />
                        </div>
                        {platform === 'whatsapp' && (
                          <div className="space-y-2">
                            <Label className="text-xs font-bold">Default Message (Optional)</Label>
                            <Textarea placeholder="Hi! I am interested in..." className="bg-white rounded-xl" value={socialMessage} onChange={e => setSocialMessage(e.target.value)} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="utility" className="space-y-6 relative">
                  {isFree && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 p-6 text-center">
                       <Crown className="h-8 w-8 text-amber-500 mb-3" />
                       <h4 className="font-bold text-lg">Utility QRs are Premium</h4>
                       <Button size="sm" asChild><Link to="/dashboard/billing">Upgrade to Unlock</Link></Button>
                    </div>
                  )}
                  <div className="p-6 bg-neutral-50 rounded-2xl border space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Wifi className="h-5 w-5" /></div>
                      <h4 className="font-bold">WiFi Direct Access</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold">Network Name (SSID)</Label>
                        <Input placeholder="Home_WiFi" value={wifiSSID} onChange={e => setWifiSSID(e.target.value)} className="h-12 rounded-xl bg-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold">Password</Label>
                        <Input type="password" placeholder="********" value={wifiPassword} onChange={e => setWifiPassword(e.target.value)} className="h-12 rounded-xl bg-white" />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white overflow-hidden">
            <header className="p-6 sm:p-8 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" /> Visual Customization
              </CardTitle>
            </header>
            <CardContent className="p-6 sm:p-8 pt-0 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Foreground</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium">Linear</span>
                      <Switch checked={fgType === 'linear'} onCheckedChange={v => setFgType(v ? 'linear' : 'solid')} />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Input type="color" value={fgColor1} onChange={e => setFgColor1(e.target.value)} className="h-11 cursor-pointer p-1 rounded-lg border-2" />
                    {fgType === 'linear' && <Input type="color" value={fgColor2} onChange={e => setFgColor2(e.target.value)} className="h-11 cursor-pointer p-1 rounded-lg border-2" />}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Background</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium">Linear</span>
                      <Switch checked={bgType === 'linear'} onCheckedChange={v => setBgType(v ? 'linear' : 'solid')} />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Input type="color" value={bgColor1} onChange={e => setBgColor1(e.target.value)} className="h-11 cursor-pointer p-1 rounded-lg border-2" />
                    {bgType === 'linear' && <Input type="color" value={bgColor2} onChange={e => setBgColor2(e.target.value)} className="h-11 cursor-pointer p-1 rounded-lg border-2" />}
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t space-y-4 relative">
                {isFree && <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-primary/20"><Button variant="outline" size="sm" asChild><Link to="/dashboard/billing">Unlock Branding</Link></Button></div>}
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-primary" /> Central Branding Logo
                  </Label>
                  {logoBase64 && (
                    <Button variant="ghost" size="sm" className="text-destructive h-8 px-2 font-bold text-xs" onClick={() => setLogoBase64('')}>
                       <Trash2 className="h-3.5 w-3.5" /> Clear
                    </Button>
                  )}
                </div>
                
                {!logoBase64 ? (
                  <Button variant="outline" className="w-full h-16 border-2 border-dashed rounded-2xl gap-3 text-muted-foreground hover:text-primary transition-all font-bold" onClick={() => fileInputRef.current?.click()} disabled={isFree}>
                    <ImageIcon className="h-5 w-5" /> Upload Brand Icon
                  </Button>
                ) : (
                  <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border-2 border-primary/10 animate-in zoom-in-95">
                     <div className="h-14 w-14 bg-white rounded-xl shadow-sm border p-2 flex items-center justify-center">
                        <img src={logoBase64} className="max-h-full max-w-full object-contain" alt="QR Logo" />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-primary">Branding Active</p>
                        <p className="text-[10px] font-medium text-primary/60 uppercase">High-contrast center positioning</p>
                     </div>
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </div>
            </CardContent>
            <CardFooter className="bg-neutral-50 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t">
              <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-primary/40" />
                Slots: <span className="font-bold text-foreground">{(profile?.qrCodeCount || 0)} / {maxLimit >= 9999 ? 'Unlimited' : maxLimit}</span>
              </div>
              <Button onClick={handleCreate} disabled={loading || !finalUrl || !stableShortCode} className="w-full sm:w-auto h-14 px-12 font-bold shadow-xl shadow-primary/20 rounded-2xl gap-3">
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <QrCode className="h-5 w-5" />}
                {loading ? "Saving Smart Link..." : "Deploy Smart QR"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function NewQRPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <NewQRPageContent />
    </Suspense>
  );
}
