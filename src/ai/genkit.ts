import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const apiKey = process.env.GEMINI_API_KEY;

/**
 * Genkit initialization with Google AI (Gemini).
 * Standardized to 'googleai/gemini-flash-latest' as per validated API tests.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  model: 'googleai/gemini-flash-latest',
});
