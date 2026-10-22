'use server';
/**
 * @fileOverview Strategic Market Analyst Agent.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CompetitorInputSchema = z.object({
  currentRating: z.number(),
  totalReviews: z.number(),
  category: z.string(),
});

export type CompetitorInput = z.infer<typeof CompetitorInputSchema>;

const CompetitorOutputSchema = z.object({
  marketAverageRating: z.number(),
  competitorAvgReviews: z.number(),
  rankPercentile: z.number(),
  reviewGap: z.number(),
  marketStanding: z.enum(['Laggard', 'Average', 'Rising Star', 'Market Leader']),
  competitiveInsight: z.string(),
});

export type CompetitorOutput = z.infer<typeof CompetitorOutputSchema>;

const competitorPrompt = ai.definePrompt({
  name: 'analyzeCompetitorStandingPrompt',
  model: 'googleai/gemini-flash-latest',
  input: {schema: CompetitorInputSchema},
  output: {schema: CompetitorOutputSchema},
  prompt: `Analyze competitor standing for a {{{category}}} business.`,
});

export async function generateCompetitorIntel(
  input: CompetitorInput
): Promise<CompetitorOutput> {
  const {output} = await competitorPrompt(input);
  if (!output) throw new Error("Competitor Intelligence failed.");
  return output;
}
