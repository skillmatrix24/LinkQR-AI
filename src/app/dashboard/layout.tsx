"use client";

import { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarInset, 
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  QrCode, 
  BarChart3, 
  CreditCard, 
  LogOut, 
  ShieldAlert, 
  Menu, 
  Settings,
  User as UserIcon,
  ShieldCheck,
  Sparkles,
  Layers,
  BrainCircuit,
  Palette,
  Smartphone,
  ChevronRight,
  Users,
  BadgeIndianRupee,
  BookmarkPlus,
  Plus,
  Zap,
  Target,
  AlertTriangle,
  Clock,
  X,
  Globe,
  UserCircle,
  IdCard
} from "lucide-react";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { differenceInDays } from "date-fns";

const ADMIN_EMAILS = ['skillmatrix24@gmail.com'];

interface NavItem {
  name: string;
  icon: any;
  href?: string;
  subItems?: { name: string; href: string; icon: any }[];
  highlight?: boolean;
  badge?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

function DashboardSidebar({ profile, user, isAdmin, isProfileLoading }: any) {
  const navigate = useNavigate();
  const db = useFirestore();
  const auth = useAuth();
  const { setOpenMobile, isMobile } = useSidebar();
  const pathname = useLocation().pathname;

  const siteConfigRef = useMemoFirebase(() => db ? doc(db, "config", "site") : null, [db]);
  const { data: siteConfig } = useDoc(siteConfigRef);

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      navigate("/");
    }
  };

  const closeSidebar = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const navigationGroups: NavGroup[] = [
    {
      group: "Primary Products",
      items: [
        { 
          name: "Smart Pages", 
          icon: Smartphone, 
          href: "/dashboard/qrs/microsite",
          subItems: [
            { name: "All Pages", href: "/dashboard/qrs/microsite", icon: Smartphone },
            { name: "Templates", href: "/dashboard/qrs/microsite/templates", icon: BookmarkPlus },
          ]
        },
        { 
          name: "Digital ID Cards", 
          icon: UserCircle, 
          href: "/dashboard/vcards", 
          subItems: [
            { name: "All IDs", href: "/dashboard/vcards", icon: IdCard },
            { name: "Fleet Injector", href: "/dashboard/vcards/bulk", icon: Layers },
            { name: "ID Templates", href: "/dashboard/vcards/templates", icon: BookmarkPlus },
          ],
          highlight: true,
          badge: "NEW" 
        },
        { name: "AI Magic Studio", icon: Sparkles, href: "/dashboard/qrcodes/ai" },
      ]
    },
    {
      group: "The Growth Hub",
      items: [
        { name: "Campaign Agent", icon: BrainCircuit, href: "/dashboard/campaigns/new" },
        { name: "Leads CRM", icon: Users, href: "/dashboard/qrs/microsite/leads" },
        { name: "Sales Ledger", icon: BadgeIndianRupee, href: "/dashboard/qrs/microsite/sales" },
        { name: "BI Analytics", icon: BarChart3, href: "/dashboard/analytics" },
      ]
    },
    {
      group: "Fleet Management",
      items: [
        { name: "My QRs", icon: QrCode, href: "/dashboard/qrs" },
        { name: "Bulk Generator", icon: Layers, href: "/dashboard/qrs/bulk" },
        { name: "Custom Domains", icon: Globe, href: "/dashboard/settings/domains" },
        { name: "Brand Identity", icon: Palette, href: "/dashboard/branding" },
      ]
    },
    {
      group: "Account & Support",
      items: [
        { name: "Billing & Plan", icon: CreditCard, href: "/dashboard/billing" },
        { name: "Settings", icon: Settings, href: "/dashboard/settings" },
      ]
    }
  ];

  return (
    <Sidebar className="border-r border-border/50 bg-white">
      <SidebarHeader className="h-20 flex items-center px-6 border-b border-border/50">
        <Link to="/dashboard" className="flex items-center gap-2 group min-h-[32px]" onClick={closeSidebar}>
          {siteConfig?.logoUrl && (
            <img 
              src={siteConfig.logoUrl} 
              alt="Logo" 
              className="w-auto object-contain transition-transform group-hover:scale-105" 
              style={{ 
                '--logo-h-mobile': `${siteConfig.logoHeightMobile || 28}px`, 
                '--logo-h-desktop': `${siteConfig.logoHeight || 32}px`, 
              } as any}
              css-h-var="true"
            />
          )}
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="p-4 gap-6">
        <div className="px-2 mb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full h-12 rounded-xl font-black gap-3 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white">
                <Plus className="h-5 w-5" /> CREATE NEW
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 mt-2 p-2 rounded-2xl shadow-2xl border-2">
              <DropdownMenuLabel className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-3 py-2">Select Design Node</DropdownMenuLabel>
              <DropdownMenuItem asChild className="cursor-pointer rounded-xl h-11 focus:bg-primary/5 focus:text-primary mb-1">
                 <Link to={`/dashboard/qrs/microsite?id=${crypto.randomUUID()}`} className="flex items-center gap-3 font-bold">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><Smartphone className="h-4 w-4" /></div>
                    AI Smart Page
                 </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer rounded-xl h-11 focus:bg-accent/5 focus:text-accent mb-1">
                 <Link to="/dashboard/vcards/new" className="flex items-center gap-3 font-bold">
                    <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent"><UserCircle className="h-4 w-4" /></div>
                    Digital ID Card
                 </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer rounded-xl h-11 focus:bg-emerald-50 focus:text-emerald-700 mb-1">
                 <Link to="/dashboard/qrcodes/ai" className="flex items-center gap-3 font-bold">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600"><Sparkles className="h-4 w-4" /></div>
                    AI Magic QR
                 </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem asChild className="cursor-pointer rounded-xl h-11 focus:bg-neutral-50 mb-1">
                 <Link to="/dashboard/qrs/new" className="flex items-center gap-3 font-bold">
                    <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600"><QrCode className="h-4 w-4" /></div>
                    Standard QR
                 </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {navigationGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-2">
            <p className="px-4 text-[10px] font-black uppercase text-muted-foreground/50 tracking-[0.2em]">{group.group}</p>
            <SidebarMenu>
              {group.items.map((item: NavItem) => {
                const isActive = pathname === item.href || (item.subItems?.some(sub => pathname === sub.href));
                
                if (item.subItems) {
                  return (
                    <Collapsible key={item.name} defaultOpen={isActive} className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton 
                            className={cn(
                              "hover:bg-primary/5 rounded-xl px-4 py-6 transition-all group",
                              isActive && "text-primary font-bold"
                            )}
                          >
                            <item.icon className={cn("h-5 w-5 text-muted-foreground", isActive && "text-primary")} />
                            <span>{item.name}</span>
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="ml-4 border-l-2 border-primary/10 pl-2 mt-1 space-y-1">
                            {item.subItems.map((sub) => (
                              <SidebarMenuSubItem key={sub.name}>
                                <SidebarMenuSubButton 
                                  asChild 
                                  isActive={pathname === sub.href}
                                  className={cn(
                                    "rounded-lg px-3 py-4 h-auto transition-all",
                                    pathname === sub.href ? "bg-primary/10 text-primary font-black" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                                  )}
                                  onClick={closeSidebar}
                                >
                                  <Link to={sub.href} className="flex items-center gap-2">
                                    <sub.icon className="h-3.5 w-3.5" />
                                    <span className="text-xs">{sub.name}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.href}
                      className={cn(
                        "hover:bg-primary/5 rounded-xl px-4 py-6 transition-all group",
                        pathname === item.href && "bg-primary/10 text-primary font-bold",
                        item.highlight && "bg-accent/5 text-accent hover:bg-accent/10 hover:text-accent border border-accent/10 mb-2"
                      )}
                      onClick={closeSidebar}
                    >
                      <Link to={item.href || "#"} className="flex items-center gap-3">
                        <item.icon className={cn(
                          "h-5 w-5 text-muted-foreground group-hover:text-primary", 
                          pathname === item.href && "text-primary",
                          item.highlight && "text-accent group-hover:text-accent"
                        )} />
                        <span>{item.name}</span>
                        {item.badge && (
                          <Badge className="ml-auto bg-accent text-white border-none text-[8px] font-black px-1.5 h-4 rounded-md">
                            {item.badge}
                          </Badge>
                        )}
                        {item.highlight && !item.badge && <Sparkles className="h-3 w-3 animate-pulse" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </div>
        ))}

        {isAdmin && !isProfileLoading && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  className="bg-red-50 hover:bg-red-100 text-red-700 rounded-xl px-4 py-6 transition-all"
                  onClick={closeSidebar}
                >
                  <Link to="/admin" className="flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5" />
                    <span className="font-bold">Owner Hub</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        )}
      </SidebarContent>

      <div className="mt-auto p-4 border-t border-border/50">
         <SidebarMenuButton 
            onClick={handleSignOut}
            className="hover:bg-destructive/10 hover:text-destructive rounded-xl px-4 py-6 transition-all group w-full justify-start"
          >
              <LogOut className="h-5 w-5 text-muted-foreground group-hover:text-destructive" />
              <span className="font-medium">Sign Out</span>
          </SidebarMenuButton>
      </div>
    </Sidebar>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const [showExpiryBanner, setShowExpiryBanner] = useState(true);

  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  const isAdmin = !!(profile?.isAdmin === true || (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())));

  // Expiry Alert Logic
  const expiryAlert = useMemo(() => {
    if (!profile?.planExpiryDate || isAdmin) return null;
    const expiry = profile.planExpiryDate.toDate ? profile.planExpiryDate.toDate() : new Date(profile.planExpiryDate);
    const daysLeft = differenceInDays(expiry, new Date());
    
    if (daysLeft <= 7) {
      return {
        days: daysLeft,
        isExpired: daysLeft <= 0,
        type: daysLeft <= 0 ? "critical" : daysLeft <= 2 ? "urgent" : "warning"
      };
    }
    return null;
  }, [profile, isAdmin]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      navigate("/login");
    }
  }, [user, isUserLoading, navigate]);

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initials = profile?.displayName
    ? profile.displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : user.email?.[0].toUpperCase() || "U";

  const mobileNavItems = [
    { name: "Home", icon: LayoutDashboard, href: "/dashboard", highlight: false },
    { name: "Digital ID", icon: UserCircle, href: "/dashboard/vcards", highlight: true },
    { name: "Pages", icon: Smartphone, href: "/dashboard/qrs/microsite", highlight: false },
    { name: "Stats", icon: BarChart3, href: "/dashboard/analytics", highlight: false },
    { name: "Billing", icon: CreditCard, href: "/dashboard/billing", highlight: false },
  ];

  return (
    <SidebarProvider>
      <TooltipProvider>
        <div className="flex min-h-screen w-full bg-background overflow-hidden relative">
          <style>{`
            img[css-h-var="true"] {
              height: var(--logo-h-mobile);
            }
            @media (min-width: 1024px) {
              img[css-h-var="true"] {
                height: var(--logo-h-desktop);
              }
            }
          `}</style>

          <DashboardSidebar 
            profile={profile} 
            user={user} 
            isAdmin={isAdmin} 
            isProfileLoading={isProfileLoading} 
          />
          
          <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden pb-20 md:pb-0">
            {/* Top Global Expiry Banner */}
            {expiryAlert && showExpiryBanner && (
              <div className={cn(
                "w-full px-4 sm:px-8 py-3 flex items-center justify-between animate-in slide-in-from-top duration-500 z-[40] relative",
                expiryAlert.type === 'critical' ? "bg-red-600 text-white" : 
                expiryAlert.type === 'urgent' ? "bg-orange-50 text-white" : "bg-amber-100 text-amber-900 border-b border-amber-200"
              )}>
                 <div className="flex items-center gap-3">
                    {expiryAlert.type === 'critical' ? <AlertTriangle className="h-5 w-5 animate-pulse" /> : <Clock className="h-5 w-5" />}
                    <p className="text-xs sm:text-sm font-bold uppercase tracking-tight">
                       {expiryAlert.isExpired 
                        ? "Action Required: Your plan has expired. All links and pages are paused." 
                        : `Synchronization Alert: Your Intelligence Tier expires in ${expiryAlert.days} days.`}
                    </p>
                 </div>
                 <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" className="bg-white/20 border-white/40 text-white hover:bg-white/30 h-8 rounded-lg font-black text-[10px] uppercase hidden sm:flex" asChild>
                       <Link to="/dashboard/billing">Renew Level</Link>
                    </Button>
                    <button onClick={() => setShowExpiryBanner(false)} className="p-1 hover:bg-white/10 rounded-full transition-all">
                       <X className="h-4 w-4" />
                    </button>
                 </div>
              </div>
            )}

            <header className="h-20 border-b border-border/50 bg-white flex items-center justify-between px-4 sm:px-8 sticky top-0 z-[50] shadow-sm">
              <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
                <SidebarTrigger className="flex items-center justify-center p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                  <Menu className="h-6 w-6" />
                </SidebarTrigger>
                <div className="flex flex-col min-w-0">
                  <h2 className="text-[10px] sm:text-sm font-semibold text-muted-foreground truncate">Welcome back,</h2>
                  <p className="font-bold text-foreground text-xs sm:text-base truncate max-w-[100px] sm:max-w-none">{profile?.displayName || user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <Button size="sm" variant="outline" className="hidden xs:flex border-accent text-accent hover:bg-accent/5 font-bold gap-2 text-xs h-8 sm:h-9" asChild>
                  <Link to="/dashboard/vcards">
                    <UserCircle className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">My Digital ID</span>
                  </Link>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="outline-none transition-transform hover:scale-105 active:scale-95 shrink-0">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-primary/10">
                        <AvatarImage src={profile?.photoURL || user?.photoURL || ""} />
                        <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs sm:text-base">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{profile?.displayName || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/vcards" className="cursor-pointer flex items-center gap-2 text-accent font-bold">
                        <UserCircle className="h-4 w-4" />
                        <span>Digital ID Card</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/settings" className="cursor-pointer flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        <span>Profile Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/billing" className="cursor-pointer flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Billing & Plan</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="text-primary font-bold focus:text-primary focus:bg-primary/5">
                          <Link to="/admin" className="cursor-pointer flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Owner Hub</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={async () => { await signOut(auth!); navigate("/"); }} className="text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>
            <main className="flex-1 p-4 sm:p-8 overflow-y-auto w-full">
              {children}
            </main>
          </SidebarInset>

          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-t border-border/50 flex items-center justify-around px-4 h-16 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
            {mobileNavItems.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith('/dashboard/qrs/microsite') && item.name === 'Pages');
              return (
                <Link 
                  key={item.name} 
                  to={item.href}
                  className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all active:scale-90"
                >
                  <div className={cn(
                    "p-1.5 rounded-xl transition-colors",
                    isActive ? (item.highlight ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary") : "text-muted-foreground"
                  )}>
                    <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-tighter",
                    isActive ? (item.highlight ? "text-accent" : "text-primary") : "text-muted-foreground"
                  )}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}