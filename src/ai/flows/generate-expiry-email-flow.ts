'use server';
/**
 * @fileOverview Friendly Reminder Email Agent.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExpiryEmailInputSchema = z.object({
  userName: z.string(),
  planName: z.string(),
  expiryDate: z.string(),
  daysRemaining: z.number().int(),
});

export type GenerateExpiryEmailInput = z.infer<typeof GenerateExpiryEmailInputSchema>;

const GenerateExpiryEmailOutputSchema = z.object({
  subject: z.string(),
  htmlBody: z.string(),
  plainTextBody: z.string(),
});

export type GenerateExpiryEmailOutput = z.infer<typeof GenerateExpiryEmailOutputSchema>;

const emailPrompt = ai.definePrompt({
  name: 'generateExpiryEmailPrompt',
  model: 'googleai/gemini-flash-latest',
  input: {schema: GenerateExpiryEmailInputSchema},
  output: {schema: GenerateExpiryEmailOutputSchema},
  prompt: `Create a friendly reminder email for {{{userName}}}.`,
});

export async function generateExpiryEmail(
  input: GenerateExpiryEmailInput
): Promise<GenerateExpiryEmailOutput> {
  const {output} = await emailPrompt(input);
  if (!output) throw new Error("Email Engine failed.");
  return output;
}
