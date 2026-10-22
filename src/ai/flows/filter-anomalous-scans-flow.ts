'use server';
/**
 * @fileOverview Bot Activity & Anomaly Detection Agent.
 * Analyzes traffic patterns to identify non-human digital signatures.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FilterAnomalousScansInputSchema = z.object({
  ipAddress: z.string(),
  userAgent: z.string(),
});

const FilterAnomalousScansOutputSchema = z.object({
  isAnomalous: z.boolean(),
  reason: z.string(),
});

const anomalyPrompt = ai.definePrompt({
  name: 'filterAnomalousScansPrompt',
  model: 'googleai/gemini-flash-latest',
  input: {schema: FilterAnomalousScansInputSchema},
  output: {schema: FilterAnomalousScansOutputSchema},
  prompt: `You are a Cyber Security Expert. 
Analyze this interaction node:
IP: {{{ipAddress}}}
User-Agent: {{{userAgent}}}

Identify if this is a human or an automated bot/crawler.
If isAnomalous is true, provide the reason (e.g., Blacklisted Crawler, Brute Force Attempt).`,
});

export async function filterAnomalousScans(input: any) {
  const {output} = await anomalyPrompt(input);
  return output;
}
