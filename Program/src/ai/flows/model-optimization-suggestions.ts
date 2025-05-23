// This is an autogenerated file from Firebase Studio.
'use server';

/**
 * @fileOverview Provides AI-powered suggestions for optimizing AI models to reduce size while maintaining accuracy.
 *
 * - getModelOptimizationSuggestions - A function that takes a model description and suggests optimization techniques.
 * - ModelOptimizationInput - The input type for the getModelOptimizationSuggestions function.
 * - ModelOptimizationOutput - The return type for the getModelOptimizationSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModelOptimizationInputSchema = z.object({
  modelDescription: z
    .string()
    .describe('A detailed description of the AI model, including its architecture, layers, and intended use case.'),
});
export type ModelOptimizationInput = z.infer<typeof ModelOptimizationInputSchema>;

const ModelOptimizationOutputSchema = z.object({
  suggestedTechniques: z
    .string()
    .describe(
      'A list of suggested optimization techniques, such as pruning, quantization, knowledge distillation, etc., tailored to the input model description.'
    ),
  expectedBenefits: z
    .string()
    .describe(
      'A description of the expected benefits of applying the suggested optimization techniques, including estimated size reduction and potential impact on accuracy.'
    ),
});
export type ModelOptimizationOutput = z.infer<typeof ModelOptimizationOutputSchema>;

export async function getModelOptimizationSuggestions(input: ModelOptimizationInput): Promise<ModelOptimizationOutput> {
  return modelOptimizationSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'modelOptimizationSuggestionsPrompt',
  input: {schema: ModelOptimizationInputSchema},
  output: {schema: ModelOptimizationOutputSchema},
  prompt: `You are an AI model optimization expert. Given the description of an AI model, suggest optimization techniques to reduce its size while maintaining acceptable accuracy.

Model Description: {{{modelDescription}}}

Consider techniques such as pruning, quantization, knowledge distillation, and other relevant methods.  Explain the expected benefits of each suggested technique, including estimated size reduction and potential impact on accuracy.

Format your response as a list of suggested techniques, followed by a description of the expected benefits.
`,
});

const modelOptimizationSuggestionsFlow = ai.defineFlow(
  {
    name: 'modelOptimizationSuggestionsFlow',
    inputSchema: ModelOptimizationInputSchema,
    outputSchema: ModelOptimizationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
