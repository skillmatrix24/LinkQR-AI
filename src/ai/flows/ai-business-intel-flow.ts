'use server';
/**
 * @fileOverview AI Business Intelligence Copilot.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MetricSchema = z.object({
  score: z.number().min(0).max(100),
  trend: z.enum(['up', 'down', 'stable']),
});

const AIBusinessIntelInputSchema = z.object({
  userName: z.string(),
  totalScans: z.number(),
  qrCodeCount: z.number(),
  recentScansHistory: z.array(z.object({
    date: z.string(),
    count: z.number()
  })),
  planTier: z.string(),
});

export type AIBusinessIntelInput = z.infer<typeof AIBusinessIntelInputSchema>;

const AIBusinessIntelOutputSchema = z.object({
  healthScore: z.number(),
  status: z.string(),
  metrics: z.object({
    traffic: MetricSchema,
    engagement: MetricSchema,
    growthPotential: MetricSchema,
  }),
  morningBriefing: z.string(),
  recommendations: z.array(z.string()),
  prediction: z.string(),
});

export type AIBusinessIntelOutput = z.infer<typeof AIBusinessIntelOutputSchema>;

const intelPrompt = ai.definePrompt({
  name: 'generateBusinessIntelPrompt',
  model: 'googleai/gemini-flash-latest',
  input: {schema: AIBusinessIntelInputSchema},
  output: {schema: AIBusinessIntelOutputSchema},
  prompt: `Analyze the business metrics for {{{userName}}}.`,
});

export async function generateBusinessIntel(
  input: AIBusinessIntelInput
): Promise<AIBusinessIntelOutput> {
  const {output} = await intelPrompt(input);
  if (!output) throw new Error("BI Engine failed.");
  return output;
}
