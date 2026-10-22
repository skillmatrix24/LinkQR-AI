'use server';
/**
 * @fileOverview Enterprise Brand Identity Engine.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BrandKitInputSchema = z.object({
  businessName: z.string(),
  industry: z.string(),
  vibe: z.string(),
});

const BrandKitOutputSchema = z.object({
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    psychology: z.string().describe('Why these colors work for the customers.'),
  }),
  motto: z.string(),
  brandVoice: z.string().describe('Tone of communication'),
  logoPrompt: z.string(),
  typography: z.object({
    heading: z.string(),
    body: z.string(),
    pairingLogic: z.string(),
  }),
});

export type BrandKitOutput = z.infer<typeof BrandKitOutputSchema>;

const brandPrompt = ai.definePrompt({
  name: 'enterpriseBrandKitPrompt',
  model: 'googleai/gemini-flash-latest',
  input: {schema: BrandKitInputSchema},
  output: {schema: BrandKitOutputSchema},
  prompt: `You are a Global Branding Expert.
Business: {{{businessName}}} ({{{industry}}})
Vibe: {{{vibe}}}

Generate a professional Brand Dossier.`,
});

export async function generateBrandIdentity(input: {businessName: string, industry: string, vibe: string}): Promise<BrandKitOutput> {
  const {output} = await brandPrompt(input);
  if (!output) throw new Error("Branding Engine failed.");
  return output;
}
