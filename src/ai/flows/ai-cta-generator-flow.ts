'use server';
/**
 * @fileOverview Conversion Rate Optimization (CRO) expert.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CTAInputSchema = z.object({
  businessType: z.string(),
  goal: z.string().optional(),
});

export type CTAInput = z.infer<typeof CTAInputSchema>;

const CTAOutputSchema = z.object({
  suggestions: z.array(z.object({
    text: z.string(),
    language: z.enum(['English', 'Hinglish']),
    impact: z.string(),
  })).min(3),
});

export type CTAOutput = z.infer<typeof CTAOutputSchema>;

const ctaPrompt = ai.definePrompt({
  name: 'generateCTAPrompt',
  model: 'googleai/gemini-flash-latest',
  input: {schema: CTAInputSchema},
  output: {schema: CTAOutputSchema},
  prompt: `Generate catchy QR CTAs for {{{businessType}}}.`,
});

export async function generateCTASuggestions(
  input: CTAInput
): Promise<CTAOutput> {
  const {output} = await ctaPrompt(input);
  if (!output) throw new Error("CTA Generator failed.");
  return output;
}
