'use server';
/**
 * @fileOverview AI Customer Behaviour Analysis Agent.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BehaviorInputSchema = z.object({
  scanLogs: z.array(z.object({
    timestamp: z.string(),
    deviceType: z.string(),
    isBot: z.boolean(),
  })),
});

export type BehaviorInput = z.infer<typeof BehaviorInputSchema>;

const BehaviorOutputSchema = z.object({
  peakHours: z.string().describe('Morning, Afternoon, Evening, or Night'),
  deviceDominance: z.string().describe('Mobile vs Desktop percentage breakdown'),
  engagementTrend: z.string().describe('Stable, Rising, or Dropping'),
  humanReadableInsight: z.string().describe('A simple sentence explaining customer behavior'),
  fraudRiskLevel: z.enum(['Low', 'Medium', 'High']).describe('AI assessment of scan patterns'),
});

export type BehaviorOutput = z.infer<typeof BehaviorOutputSchema>;

const behaviorPrompt = ai.definePrompt({
  name: 'analyzeBehaviorPrompt',
  model: 'googleai/gemini-flash-latest',
  input: {schema: BehaviorInputSchema},
  output: {schema: BehaviorOutputSchema},
  prompt: `You are an expert Data Scientist. 
Analyze the following scan logs to identify behavioral patterns:
{{{scanLogs}}}

Identify:
1. Peak interaction periods.
2. Device dominance.
3. Engagement trends.
4. Fraud risk based on bot activity.

Output must be actionable and concise.`,
});

export async function generateBehaviorAnalysis(
  input: BehaviorInput
): Promise<BehaviorOutput> {
  const {output} = await behaviorPrompt(input);
  if (!output) {
    throw new Error("AI failed to analyze behavior.");
  }
  return output;
}
