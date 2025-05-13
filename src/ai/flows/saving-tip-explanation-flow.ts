
'use server';
/**
 * @fileOverview Generates explanations for energy saving tips using an AI model.
 *
 * - getSavingTipExplanation - Fetches an AI-generated explanation for a given saving tip topic.
 * - SavingTipExplanationInput - Input type for the getSavingTipExplanation function.
 * - SavingTipExplanationOutput - Return type for the getSavingTipExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SavingTipExplanationInputSchema = z.object({
  topic: z.string().describe('The energy saving strategy topic for which an explanation is needed.'),
});
export type SavingTipExplanationInput = z.infer<typeof SavingTipExplanationInputSchema>;

const SavingTipExplanationOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation and actionable tips for the given energy saving strategy topic.'),
});
export type SavingTipExplanationOutput = z.infer<typeof SavingTipExplanationOutputSchema>;

export async function getSavingTipExplanation(input: SavingTipExplanationInput): Promise<SavingTipExplanationOutput> {
  return savingTipExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'savingTipExplanationPrompt',
  input: {schema: SavingTipExplanationInputSchema},
  output: {schema: SavingTipExplanationOutputSchema},
  prompt: `You are an expert in AI energy efficiency and sustainability.
Your task is to provide a comprehensive and actionable explanation for the following energy saving strategy topic.
The explanation should be detailed, practical, and highlight both the 'why' (importance) and 'how' (implementation steps or considerations).

Energy Saving Strategy Topic: {{{topic}}}

Provide your explanation below:
`,
});

const savingTipExplanationFlow = ai.defineFlow(
  {
    name: 'savingTipExplanationFlow',
    inputSchema: SavingTipExplanationInputSchema,
    outputSchema: SavingTipExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
