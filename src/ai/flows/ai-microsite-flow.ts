'use server';
/**
 * @fileOverview Ultra-Advanced Strategic Landing Page Architect.
 * V6: Implemented Memory Logic, Deep Description Analysis, and Strict Safety Guardrails.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Detailed schemas for each section to force the LLM to provide content
const HeroDataSchema = z.object({
  headline: z.string().describe('Magnetic headline in Hinglish'),
  subheadline: z.string().describe('Compelling subtext'),
  ctaText: z.string().describe('Primary button text'),
  heroBadgeEnabled: z.boolean().default(true),
  heroBadgeText: z.string().describe('Short highlight label (e.g. "Limited Offer")'),
  heroAlign: z.enum(['left', 'center', 'right']).default('center'),
});

const BenefitItemSchema = z.object({
  title: z.string().describe('Benefit name'),
  desc: z.string().describe('Detailed description of value proposition'),
  icon: z.string().describe('Icon name: check, zap, star, shield, heart'),
});

const BenefitDataSchema = z.object({
  sectionTitle: z.string().describe('Benefits section header'),
  items: z.array(BenefitItemSchema).min(3).describe('Array of at least 3 detailed benefits'),
});

const FeatureItemSchema = z.object({
  title: z.string().describe('Feature name'),
  content: z.string().describe('Detailed technical or functional highlight'),
  icon: z.string().describe('Icon: zap, settings, layers, monitor'),
});

const FeatureDataSchema = z.object({
  sectionTitle: z.string().describe('Features section header'),
  items: z.array(FeatureItemSchema).min(3).describe('Array of at least 3 detailed features'),
});

const StepItemSchema = z.object({
  title: z.string().describe('Step objective'),
  desc: z.string().describe('How to execute this step'),
});

const StepDataSchema = z.object({
  stepsSectionTitle: z.string().describe('Process section header'),
  howItWorks: z.array(StepItemSchema).min(3).describe('Array of at least 3-4 sequential steps'),
});

const ReviewItemSchema = z.object({
  name: z.string().describe('Customer name'),
  role: z.string().describe('Customer role/city'),
  comment: z.string().describe('Persuasive testimonial in Hinglish'),
  rating: z.number().min(4).max(5),
});

const ReviewDataSchema = z.object({
  reviewsSectionTitle: z.string().describe('Social proof header'),
  reviews: z.array(ReviewItemSchema).min(3).describe('Array of at least 3 detailed reviews'),
});

const FAQItemSchema = z.object({
  question: z.string().describe('Common customer doubt'),
  answer: z.string().describe('Helpful and persuasive resolution'),
});

const FAQDataSchema = z.object({
  faqSectionTitle: z.string().describe('FAQ section header'),
  faqs: z.array(FAQItemSchema).min(3).describe('Array of at least 3-4 FAQs'),
});

const SocialLinkSchema = z.object({
  platform: z.enum(['instagram', 'whatsapp', 'facebook', 'twitter', 'youtube', 'linkedin']),
  url: z.string().describe('Placeholder or specific URL'),
});

const SocialDataSchema = z.object({
  socialSectionTitle: z.string().describe('Social section header'),
  socialLinks: z.array(SocialLinkSchema).min(2),
});

const LeadFormDataSchema = z.object({
  sectionTitle: z.string(),
  sectionDescription: z.string(),
  buttonText: z.string(),
  successMessage: z.string(),
});

const PaymentDataSchema = z.object({
  sectionTitle: z.string(),
  productName: z.string(),
  productPrice: z.number(),
  upiId: z.string().default('pay@upi'),
});

const SectionDataSchema = z.object({
  type: z.enum([
    'hero', 'benefits', 'features', 'steps', 'leadForm', 
    'payments', 'countdown', 'faq', 'reviews', 'cta', 
    'social', 'video', 'gallery', 'legal', 'footer', 'products'
  ]),
  data: z.record(z.any()).describe('Deep granular data for the section following its specific schema'),
});

const MicroSiteInputSchema = z.object({
  businessName: z.string().describe('Name of the business'),
  goal: z.string().describe('Main objective (e.g., Sell Product, Get Leads, Booking)'),
  brandVibe: z.string().optional().describe('General aesthetic (Luxury, Vibrant, Minimalist, Corporate)'),
  audience: z.string().optional().describe('Target persona (Professionals, Gen-Z, Small Business owners)'),
  offer: z.string().optional().describe('The hook (e.g., 50% Off, Free Consultation)'),
  tone: z.enum(['Professional', 'Friendly', 'Urgent', 'Luxury']).optional().describe('Tone of voice'),
  description: z.string().optional().describe('Detailed business description and context'),
  refineInstruction: z.string().optional().describe('Specific instruction for refinement'),
  targetBlockType: z.string().optional().describe('The specific block type to refine'),
});

export type MicroSiteInput = z.infer<typeof MicroSiteInputSchema>;

const MicroSiteOutputSchema = z.object({
  design: z.object({
    themeColor: z.string().describe('Primary brand hex color'),
    fontType: z.string().describe('Font class: font-body, font-serif, font-mukta, font-mono'),
    cardRadius: z.number().describe('Roundness (0-80)'),
    sectionSpacing: z.number().describe('Vertical spacing (16-64)'),
  }),
  sections: z.array(SectionDataSchema).describe('A strategic sequence of sections optimized for the goal'),
});

export type MicroSiteOutput = z.infer<typeof MicroSiteOutputSchema>;

const microSitePrompt = ai.definePrompt({
  name: 'universalMicrositePromptV6',
  model: 'googleai/gemini-flash-latest',
  input: {schema: MicroSiteInputSchema},
  output: {schema: MicroSiteOutputSchema},
  config: {
    // ENHANCEMENT: Strict Built-in Safety Settings (No Extra Cost)
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
    ]
  },
  prompt: `You are the World's #1 Funnel Scientist specialized in the Indian Digital Economy.
Your mission: Architect a "High-Conversion" Smart Page for {{{businessName}}}.

CRITICAL CONTENT REQUIREMENT:
- You MUST incorporate the "Detailed Description" ({{{description}}}) into the copy of all sections. This is the SOUL of the business. 
- Use specific keywords from the description to make the copy hyper-personalized and authentic.
- You MUST provide DEEP CONTENT for all arrays. No generic filler.
- For 'benefits', generate 3-4 items based on the business's specific strengths mentioned in description.
- For 'reviews', generate 3 realistic testimonials reflecting the service/product quality.
- For 'faq', generate 3-4 common doubts specific to the industry and business type.

{{#if refineInstruction}}
ADAPTIVE REFINEMENT COMMAND:
- The user has requested a specific refinement: "{{{refineInstruction}}}"
- If targetBlockType is "{{{targetBlockType}}}", focus heavily on updating that specific block while keeping the rest consistent.
{{/if}}

STRATEGY CONTEXT:
- Business: {{{businessName}}}
- Goal: {{{goal}}}
- Audience: {{{audience}}}
- Hook: {{{offer}}}
- Tone: {{{tone}}}
- Vibe: {{{brandVibe}}}
- Details: {{{description}}}

BLOCK SELECTION LOGIC:
1. If Goal is 'Sales': Order [hero, countdown, benefits, features, payments, reviews, social, footer].
2. If Goal is 'Leads': Order [hero, benefits, leadForm, steps, reviews, faq, social, footer].
3. For ALL goals: Use high-fidelity Hinglish. It should sound like a human expert, not a robot.

VISUAL SYNC:
- Set themeColor, fontType, and cardRadius based on the 'Vibe' ({{{brandVibe}}}).
- 'Luxury' vibe should use deep colors, serif fonts, and high card radius.
- 'Minimalist' should use simple colors and square-ish cards.

Generate the full JSON now.`,
});

export async function generateMicroSiteContent(input: MicroSiteInput): Promise<MicroSiteOutput> {
  const {output} = await microSitePrompt(input);
  if (!output) throw new Error("AI Scientist failed to converge on a strategy. Ensure content follows community guidelines.");
  return output;
}
