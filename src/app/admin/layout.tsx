"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRouter, usePathname } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Settings, 
  ChevronLeft,
  Loader2,
  Banknote,
  Menu,
  X,
  Map,
  Bell,
  Activity,
  MessageSquare,
  AlertTriangle,
  Newspaper
} from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ADMIN_EMAILS = ['skillmatrix24@gmail.com'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useNavigate();
  const pathname = useLocation().pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  const siteConfigRef = useMemoFirebase(() => db ? doc(db, "config", "site") : null, [db]);
  const { data: siteConfig } = useDoc(siteConfigRef);

  // Cast to strict boolean to prevent build errors
  const isAdmin = !!(profile?.isAdmin === true || (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())));

  useEffect(() => {
    if (!isUserLoading && !isProfileLoading) {
      if (!user || !isAdmin) {
        navigate("/dashboard");
      }
    }
  }, [user, isAdmin, isUserLoading, isProfileLoading, router]);

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const navItems = [
    { name: "Admin Home", icon: LayoutDashboard, href: "/admin" },
    { name: "Traffic Monitor", icon: Activity, href: "/admin/traffic" },
    { name: "User Directory", icon: Users, href: "/admin/users" },
    { name: "Public Reviews", icon: MessageSquare, href: "/admin/reviews" },
    { name: "Bilingual CMS", icon: Newspaper, href: "/admin/blog" },
    { name: "Payment History", icon: Banknote, href: "/admin/payments" },
    { name: "Notifications", icon: Bell, href: "/admin/notifications" },
    { name: "Manage Plans", icon: Package, href: "/admin/plans" },
    { name: "Site Content", icon: Settings, href: "/admin/settings" },
    { name: "App Blueprint", icon: Map, href: "/admin/blueprint" },
    { name: "Migration Hub", icon: AlertTriangle, href: "/admin/migration" },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-50 relative">
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

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-white border-b z-40 flex items-center justify-between px-6">
        <Link to="/admin" className="flex items-center gap-2 font-bold text-lg text-primary min-h-[24px]">
          {siteConfig?.logoUrl ? (
            <img 
              src={siteConfig.logoUrl} 
              alt="Logo" 
              className="w-auto object-contain"
              style={{ 
                '--logo-h-mobile': `${siteConfig.logoHeightMobile || 28}px`,
                '--logo-h-desktop': `${siteConfig.logoHeight || 32}px`,
              } as any}
              css-h-var="true"
            />
          ) : (
            <span className="font-black tracking-tighter">ADMIN</span>
          )}
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-screen bg-white border-r border-border flex flex-col transition-transform duration-300 w-64",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-20 flex items-center px-6 border-b">
          <Link to="/admin" className="flex items-center gap-2 font-bold text-xl text-primary min-h-[32px]" onClick={() => setIsMobileMenuOpen(false)}>
            {siteConfig?.logoUrl ? (
              <img 
                src={siteConfig.logoUrl} 
                alt="Logo" 
                className="w-auto object-contain"
                style={{ 
                  '--logo-h-mobile': `${siteConfig.logoHeightMobile || 28}px`,
                  '--logo-h-desktop': `${siteConfig.logoHeight || 32}px`,
                } as any}
                css-h-var="true"
              />
            ) : (
              <span className="font-black tracking-tighter uppercase">Command Center</span>
            )}
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                pathname === item.href 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full gap-2" asChild onClick={() => setIsMobileMenuOpen(false)}>
            <Link to="/dashboard">
              <ChevronLeft className="h-4 w-4" />
              Back to User App
            </Link>
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-8 mt-16 lg:mt-0">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}