'use server';
/**
 * @fileOverview Customer Relationship Management (CRM) specialist.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SegmentationInputSchema = z.object({
  scanLogs: z.array(z.object({
    ipAddress: z.string(),
    timestamp: z.string(),
  })),
});

export type SegmentationInput = z.infer<typeof SegmentationInputSchema>;

const SegmentationOutputSchema = z.object({
  breakdown: z.object({
    vip: z.number(),
    frequent: z.number(),
    new: z.number(),
    inactive: z.number(),
  }),
  topSegment: z.string(),
  segmentAdvice: z.string(),
  loyaltyScore: z.number().min(0).max(100),
});

export type SegmentationOutput = z.infer<typeof SegmentationOutputSchema>;

const segmentationPrompt = ai.definePrompt({
  name: 'generateSegmentationPrompt',
  model: 'googleai/gemini-flash-latest',
  input: {schema: SegmentationInputSchema},
  output: {schema: SegmentationOutputSchema},
  prompt: `Segment customers based on these logs: {{{scanLogs}}}.`,
});

export async function generateCustomerSegmentation(
  input: SegmentationInput
): Promise<SegmentationOutput> {
  const {output} = await segmentationPrompt(input);
  if (!output) throw new Error("Segmentation Engine failed.");
  return output;
}
