'use server';
/**
 * @fileOverview AI Assistant for LinkQR AI project.
 * Standardized for stability and "Hinglish" conversational support.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatInputSchema = z.object({
  message: z.string().describe('The user message or question.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string()
  })).optional().describe('Conversation history for context.'),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The AI generated response.'),
});

export type ChatOutput = z.infer<typeof ChatOutputSchema>;

const chatbotPrompt = ai.definePrompt({
  name: 'linkQRAIAssistant',
  model: 'googleai/gemini-flash-latest',
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  prompt: `You are the official AI Assistant for LinkQR AI. 
LinkQR AI is an enterprise-grade Smart QR Ecosystem.

CORE FEATURES TO EXPLAIN:
1. Dynamic QR Codes: Change destination URLs anytime without re-printing.
2. Smart Pages: 3-column modular studio builder for mobile sales funnels. Includes FOMO timers, UPI payments, and Lead CRM.
3. BI Analytics: 10 levels of intelligence including AI Bot Shield, Revenue Forecasting, and Audience Segmentation.
4. White-label Domains: Use custom CNAME domains (e.g., links.mybrand.com) instead of linkqr.in.
5. Pricing: Free (Ignition), Starter (BI L1-2), Pro (BI L5), and Enterprise (BI L10).

TONE:
- Professional yet friendly.
- Use "Hinglish" (Hindi + English) when appropriate to connect with Indian business owners.
- Be concise and actionable.

CONTEXT:
USER MESSAGE: {{{message}}}
{{#if history}}
HISTORY:
{{#each history}}
- {{role}}: {{content}}
{{/each}}
{{/if}}

If the user asks about setup, explain the DNS CNAME record process to 'cname.linkqr.in'.
Always encourage them to start a 14-day free trial.`,
});

/**
 * Server Action to get AI response for the chatbot.
 */
export async function getChatResponse(input: ChatInput): Promise<ChatOutput> {
  const { output } = await chatbotPrompt(input);
  if (!output) throw new Error("AI Assistant node is re-synchronizing.");
  return output;
}
