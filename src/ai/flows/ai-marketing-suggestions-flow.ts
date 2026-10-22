'use server';
/**
 * @fileOverview Expert Digital Marketing Consultant Agent.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MarketingInputSchema = z.object({
  scanHistory: z.array(z.object({
    date: z.string(),
    count: z.number()
  })),
  industry: z.string().optional(),
  qrTypesUsed: z.array(z.string()).optional(),
});

export type MarketingInput = z.infer<typeof MarketingInputSchema>;

const MarketingOutputSchema = z.object({
  campaignTitle: z.string(),
  description: z.string(),
  channel: z.enum(['WhatsApp', 'Instagram', 'Physical Poster', 'Email', 'Google Review']),
  targetDay: z.string(),
  expectedGrowth: z.number(),
  logic: z.string(),
});

export type MarketingOutput = z.infer<typeof MarketingOutputSchema>;

const marketingPrompt = ai.definePrompt({
  name: 'generateMarketingSuggestionsPrompt',
  model: 'googleai/gemini-flash-latest',
  input: {schema: MarketingInputSchema},
  output: {schema: MarketingOutputSchema},
  prompt: `Generate marketing suggestions for industry: {{{industry}}}.`,
});

export async function generateMarketingSuggestions(
  input: MarketingInput
): Promise<MarketingOutput> {
  const {output} = await marketingPrompt(input);
  if (!output) throw new Error("Marketing Suggestion Engine failed.");
  return output;
}
