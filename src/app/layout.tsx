import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { DynamicBranding } from '@/components/DynamicBranding';
import { TrafficTracker } from '@/components/TrafficTracker';
import { ChatBot } from '@/components/ChatBot';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="font-body antialiased selection:bg-primary/20">
      <FirebaseClientProvider>
        <DynamicBranding />
        <TrafficTracker />
        {children}
        <Toaster />
        <ChatBot />
      </FirebaseClientProvider>
    </div>
  );
}
