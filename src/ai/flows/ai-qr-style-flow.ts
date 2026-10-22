'use server';
/**
 * @fileOverview High-End Visual Identity Designer for QR Codes.
 *
 * - generateQRStyle - Generates aesthetic QR styles based on brand prompts.
 * - AIQRStyleOutput - The schema for the generated style metadata.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIQRStyleOutputSchema = z.object({
  fgType: z.enum(['solid', 'linear']).describe('Color fill type for foreground'),
  fgColor1: z.string().describe('Primary hex color for foreground (e.g. #FF0000)'),
  fgColor2: z.string().optional().describe('Secondary hex color for linear gradient'),
  bgType: z.enum(['solid', 'linear']).describe('Color fill type for background'),
  bgColor1: z.string().describe('Primary hex color for background'),
  bgColor2: z.string().optional().describe('Secondary hex color for linear background'),
  contrastRatio: z.number().describe('Calculated contrast percentage (0-100)'),
  readabilityScore: z.number().describe('Expected scan success rate (0-100)'),
  designerNote: z.string().describe('A short sentence explaining the design choice'),
});

export type AIQRStyleOutput = z.infer<typeof AIQRStyleOutputSchema>;

const qrStylePrompt = ai.definePrompt({
  name: 'generateQRStylePrompt',
  model: 'googleai/gemini-flash-latest',
  input: {schema: z.object({prompt: z.string()})},
  output: {schema: AIQRStyleOutputSchema},
  prompt: `You are an elite Visual Identity Designer specializing in high-contrast scannable art.
  
Generate a professional QR style based on this brand prompt: "{{{prompt}}}".

Guidelines:
1. Ensure the contrast between foreground and background is high enough for mobile cameras.
2. Return hex codes (e.g. #6750A4).
3. If linear gradient is chosen, ensure the colors blend harmoniously.`,
});

/**
 * High-conversion QR Style Generator.
 */
export async function generateQRStyle(input: {prompt: string}): Promise<AIQRStyleOutput> {
  const {output} = await qrStylePrompt(input);
  if (!output) {
    throw new Error("AI Studio failed to generate a style for this prompt.");
  }
  return output;
}
