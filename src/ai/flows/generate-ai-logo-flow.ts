'use server';
/**
 * @fileOverview Logo Generation Agent using Imagen.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAILogoInputSchema = z.object({
  prompt: z.string(),
});

export type GenerateAILogoInput = z.infer<typeof GenerateAILogoInputSchema>;

const GenerateAILogoOutputSchema = z.object({
  imageUrl: z.string(),
});

export type GenerateAILogoOutput = z.infer<typeof GenerateAILogoOutputSchema>;

export async function generateAILogo(
  input: GenerateAILogoInput
): Promise<GenerateAILogoOutput> {
  // Using the latest available Imagen model
  const { media } = await ai.generate({
    model: 'googleai/imagen-3', 
    prompt: `Generate a squared professional minimalist icon: ${input.prompt}. White background, sharp edges, no text.`,
  });

  if (!media) {
    throw new Error('AI could not generate the logo.');
  }

  return {
    imageUrl: media.url,
  };
}
