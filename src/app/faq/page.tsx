"use client";

import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const FAQS = [
  {
    question: "What is a Dynamic QR Code?",
    answer: "Unlike static QR codes, dynamic QR codes use a short URL that redirects the user to your destination. This allows you to change the destination URL anytime without changing the actual QR code image."
  },
  {
    question: "Does the QR code image change when I update the link?",
    answer: "No, that's the beauty of dynamic links! You can print your QR code on thousands of flyers, and if you need to update the website it points to, you can do it instantly from your dashboard."
  },
  {
    question: "Can I track scans in real-time?",
    answer: "Yes! Every scan is tracked instantly. You can see the IP address, device type, and location of your scanners directly in your dashboard."
  },
  {
    question: "How does AI Bot Filtering work?",
    answer: "Our GenAI engine analyzes scan signatures to detect and filter out automated crawlers and bots, ensuring your marketing data represents real human interactions only."
  }
];

export default function FAQPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />

      <main className="flex-1 py-20 px-4">
        <div className="container px-6 mx-auto max-w-4xl">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-6 py-2 uppercase tracking-widest text-[10px] font-black rounded-full">Support Knowledge Base</Badge>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-muted-foreground font-medium">Everything you need to know about our dynamic intelligence platform.</p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {FAQS.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-white border border-neutral-100 rounded-[1.5rem] px-6 sm:px-8 overflow-hidden shadow-sm hover:shadow-xl transition-all">
                <AccordionTrigger className="text-left font-bold text-lg py-6 hover:no-underline">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-8 text-base">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-20 p-10 rounded-[2.5rem] bg-primary/5 border border-primary/10 text-center space-y-6">
             <h3 className="font-bold text-2xl">Still have questions?</h3>
             <p className="text-muted-foreground font-medium max-w-md mx-auto">Our global support team is available 24/7 to help you get the most out of our platform.</p>
             <Button className="rounded-xl h-12 px-10 font-bold" asChild>
                <Link to="/contact">Contact Support →</Link>
             </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
