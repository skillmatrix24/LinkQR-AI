"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  X, 
  Send, 
  Loader2, 
  Sparkles, 
  Bot, 
  User as UserIcon,
  Maximize2,
  Minimize2
} from "lucide-react";
import { getChatResponse } from "@/ai/flows/chatbot-flow";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
  role: 'user' | 'model';
  content: string;
}

/**
 * AI ChatBot Component - Floating UI.
 * Visibility: Hidden on Smart Pages (/s/*) as they have their own FAB logic.
 */
export function ChatBot() {
  const pathname = useLocation().pathname;
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Namaste! I am your LinkQR AI Assistant. How can I help you grow your business today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // CRITICAL: Hide ChatBot on Smart Page routes to prevent UI overlap
  if (pathname?.startsWith('/s/')) {
    return null;
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const history = messages.slice(-4).map(m => ({ role: m.role, content: m.content }));
      const result = await getChatResponse({ message: userMsg, history });
      setMessages([...newMessages, { role: 'model', content: result.response }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'model', content: "I'm sorry, my neural nodes are a bit busy. Please try asking again in a moment!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 md:bottom-6 right-6 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "mb-4 w-[90vw] sm:w-[380px] shadow-2xl rounded-[2rem] overflow-hidden border-none bg-white flex flex-col",
              isMinimized ? "h-16" : "h-[500px]"
            )}
          >
            <Card className="h-full flex flex-col border-none shadow-none">
              <CardHeader className="bg-primary p-4 text-white flex flex-row items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-black uppercase tracking-tight">AI Assistant</CardTitle>
                    <p className="text-[8px] font-bold text-primary-foreground/60 uppercase tracking-widest">Protocol Active</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10" onClick={() => setIsMinimized(!isMinimized)}>
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              {!isMinimized && (
                <>
                  <CardContent ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-neutral-50/50">
                    {messages.map((msg, i) => (
                      <div key={i} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                          msg.role === 'user' 
                            ? "bg-primary text-white rounded-tr-none" 
                            : "bg-white text-foreground border border-neutral-100 rounded-tl-none"
                        )}>
                          <div className="flex items-center gap-2 mb-1.5 opacity-40">
                             {msg.role === 'user' ? <UserIcon className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                             <span className="text-[9px] font-black uppercase tracking-widest">{msg.role === 'user' ? 'You' : 'LinkQR AI'}</span>
                          </div>
                          <p className="font-medium">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border shadow-sm flex items-center gap-2">
                           <Loader2 className="h-3 w-3 animate-spin text-primary" />
                           <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Processing Node...</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 bg-white border-t">
                    <form 
                      onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                      className="flex w-full gap-2"
                    >
                      <Input 
                        placeholder="Ask me anything..." 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="rounded-xl bg-neutral-50 border-none shadow-inner h-11 text-sm"
                        disabled={isLoading}
                      />
                      <Button type="submit" size="icon" className="h-11 w-11 rounded-xl shrink-0" disabled={isLoading || !input.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </CardFooter>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button 
        onClick={() => { setIsOpen(true); setIsMinimized(false); }}
        className={cn(
          "h-16 w-16 rounded-full shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95",
          isOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
        )}
      >
        <Bot className="h-12 w-12" />
      </Button>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
      `}</style>
    </div>
  );
}
