'use server';
/**
 * @fileOverview Professional Content Editor Agent for Blog assistance.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BlogAIInputSchema = z.object({
  content: z.string(),
  currentTitle: z.string().optional(),
  hint: z.string().optional(),
});

export type BlogAIInput = z.infer<typeof BlogAIInputSchema>;

const BlogAIOutputSchema = z.object({
  suggestedTitles: z.array(z.string()),
  suggestedExcerpt: z.string(),
  keywords: z.array(z.string()),
  tone: z.string(),
});

export type BlogAIOutput = z.infer<typeof BlogAIOutputSchema>;

const blogAssistantPrompt = ai.definePrompt({
  name: 'blogAssistantPrompt',
  model: 'googleai/gemini-flash-latest',
  input: {schema: BlogAIInputSchema},
  output: {schema: BlogAIOutputSchema},
  prompt: `Analyze this blog content: {{{content}}}.`,
});

export async function generateBlogSuggestions(
  input: BlogAIInput
): Promise<BlogAIOutput> {
  const {output} = await blogAssistantPrompt(input);
  if (!output) throw new Error("Blog AI Assistant failed.");
  return output;
}
