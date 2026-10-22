'use server';
/**
 * @fileOverview AI Bio Writer for Digital ID Cards.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BioInputSchema = z.object({
  name: z.string().describe('Full name of the person'),
  designation: z.string().describe('Professional title'),
  company: z.string().describe('Organization name'),
  keywords: z.string().describe('Key skills or interests to include'),
  tone: z.enum(['Professional', 'Creative', 'Minimalist', 'Urgent']).default('Professional'),
});

const BioOutputSchema = z.object({
  bioEn: z.string().describe('A professional bio in English'),
  bioHi: z.string().describe('A professional bio in Hindi (Devanagari)'),
  tagline: z.string().describe('A short magnetic tagline'),
});

export type BioOutput = z.infer<typeof BioOutputSchema>;

const bioPrompt = ai.definePrompt({
  name: 'generateProfessionalBio',
  model: 'googleai/gemini-flash-latest',
  input: {schema: BioInputSchema},
  output: {schema: BioOutputSchema},
  prompt: `You are a High-End Executive Ghostwriter.
Create an impressive professional bio for:
Name: {{{name}}}
Title: {{{designation}}} @ {{{company}}}
Context: {{{keywords}}}
Tone: {{{tone}}}

Requirements:
1. English bio should be punchy and focused on value proposition.
2. Hindi bio should be high-fidelity and professional (not robotic).
3. Create a 1-sentence magnetic tagline.
4. Use Hinglish nuances if the tone is Creative.`,
});

export async function generateAIBio(input: z.infer<typeof BioInputSchema>): Promise<BioOutput> {
  const {output} = await bioPrompt(input);
  if (!output) throw new Error("AI failed to craft the bio.");
  return output;
}
