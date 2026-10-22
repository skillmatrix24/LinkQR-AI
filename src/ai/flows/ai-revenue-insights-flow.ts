'use server';
/**
 * @fileOverview Senior Financial Analyst Agent for Revenue Insights.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RevenueInputSchema = z.object({
  totalScans: z.number(),
  avgConversionRate: z.number(),
  avgSaleValue: z.number(),
  historicalScans: z.array(z.object({
    date: z.string(),
    count: z.number()
  })),
});

export type RevenueInput = z.infer<typeof RevenueInputSchema>;

const RevenueOutputSchema = z.object({
  currentEstimatedRevenue: z.number(),
  predictedMonthlyRevenue: z.number(),
  expectedGrowth: z.number(),
  revenueInsight: z.string(),
  roiStatus: z.enum(['Low', 'Medium', 'High']),
});

export type RevenueOutput = z.infer<typeof RevenueOutputSchema>;

const revenuePrompt = ai.definePrompt({
  name: 'generateRevenueInsightsPrompt',
  model: 'googleai/gemini-flash-latest',
  input: {schema: RevenueInputSchema},
  output: {schema: RevenueOutputSchema},
  prompt: `Analyze revenue potential for scans: {{{totalScans}}}.`,
});

export async function generateRevenueInsights(
  input: RevenueInput
): Promise<RevenueOutput> {
  const {output} = await revenuePrompt(input);
  if (!output) throw new Error("Revenue Engine failed.");
  return output;
}
