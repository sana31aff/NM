
'use server';
/**
 * @fileOverview Predicts the energy consumption of AI models based on architecture and data size.
 *
 * - energyPrediction - Predicts energy consumption of a given AI model.
 * - EnergyPredictionInput - Input type for the energyPrediction function.
 * - EnergyPredictionOutput - Return type for the energyPrediction function.
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';

const EnergyPredictionInputSchema = z.object({
  modelArchitecture: z
    .string()
    .describe('The architecture of the AI model (e.g., CNN, Transformer).'),
  dataSize: z
    .string()
    .describe('The size of the input data used by the model (e.g., 1GB, 100MB).'),
});
export type EnergyPredictionInput = z.infer<typeof EnergyPredictionInputSchema>;

const EnergyPredictionOutputSchema = z.object({
  predictedEnergyConsumption: z
    .string()
    .describe('The predicted energy consumption of the AI model (e.g., in Watts, kWh). This prediction must be solely derived from the input modelArchitecture and dataSize.'),
  confidenceLevel: z
    .string()
    .describe('The confidence level of the prediction (e.g., high, medium, low).'),
});
export type EnergyPredictionOutput = z.infer<typeof EnergyPredictionOutputSchema>;

export async function energyPrediction(input: EnergyPredictionInput): Promise<EnergyPredictionOutput> {
  return energyPredictionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'energyPredictionPrompt',
  input: {schema: EnergyPredictionInputSchema},
  output: {schema: EnergyPredictionOutputSchema},
  prompt: `You are an expert in AI model energy consumption prediction.

Your task is to predict the energy consumption of an AI model.
You will be given:
1. Model Architecture: {{{modelArchitecture}}}
2. Data Size: {{{dataSize}}}

Strictly using only the provided Model Architecture and Data Size, predict the energy consumption.
Also, provide a confidence level for your prediction (e.g., high, medium, low).

Respond in a JSON format with the following keys:
- predictedEnergyConsumption: The predicted energy consumption of the AI model (e.g., in Watts, kWh). Ensure this prediction is solely derived from the input modelArchitecture and dataSize.
- confidenceLevel: The confidence level of your prediction.
`,
});

const energyPredictionFlow = ai.defineFlow(
  {
    name: 'energyPredictionFlow',
    inputSchema: EnergyPredictionInputSchema,
    outputSchema: EnergyPredictionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

