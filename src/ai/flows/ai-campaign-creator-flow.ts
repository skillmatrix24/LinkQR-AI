'use server';
/**
 * @fileOverview Advanced Marketing Strategist Agent.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CampaignInputSchema = z.object({
  businessType: z.string(),
  goal: z.string(),
});

const CampaignOutputSchema = z.object({
  campaignName: z.string(),
  executiveSummary: z.string(),
  targetPersona: z.object({
    name: z.string(),
    ageGroup: z.string(),
    painPoint: z.string(),
  }),
  recommendedQRType: z.string(),
  qrDesignTips: z.string(),
  sevenDayTimeline: z.array(z.object({
    day: z.number(),
    task: z.string(),
    impact: z.string(),
  })),
  socialMediaKit: z.array(z.object({
    platform: z.string(),
    content: z.string(),
    action: z.string(),
  })),
  physicalMaterial: z.array(z.object({
    item: z.string(),
    instruction: z.string(),
  })),
  successTip: z.string(),
  successMetric: z.string(),
});

export type CampaignOutput = z.infer<typeof CampaignOutputSchema>;

const campaignPrompt = ai.definePrompt({
  name: 'advancedCampaignAgentPrompt',
  model: 'googleai/gemini-flash-latest',
  input: {schema: CampaignInputSchema},
  output: {schema: CampaignOutputSchema},
  prompt: `Create a marketing blueprint for {{{businessType}}}.`,
});

export async function generateCampaignBlueprint(input: {businessType: string, goal: string}): Promise<CampaignOutput> {
  const {output} = await campaignPrompt(input);
  if (!output) throw new Error("Campaign Agent failed.");
  return output;
}
