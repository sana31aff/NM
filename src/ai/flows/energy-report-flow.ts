'use server';
/**
 * @fileOverview Generates an energy efficiency optimization report based on user-provided "before" metrics.
 *
 * - generateEnergyReport - Calculates "after" metrics and improvement percentages.
 * - EnergyReportInput - The input type for the generateEnergyReport function.
 * - EnergyReportOutput - The return type for the generateEnergyReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnergyReportInputSchema = z.object({
  averageEnergyConsumptionBefore: z.number().positive({ message: "Average energy consumption must be positive." }),
  peakLoadBefore: z.number().positive({ message: "Peak load must be positive." }),
  co2EmissionsBefore: z.number().positive({ message: "CO₂ emissions must be positive." }),
});
export type EnergyReportInput = z.infer<typeof EnergyReportInputSchema>;

const EnergyReportOutputSchema = z.object({
  averageEnergyConsumptionBefore: z.number(),
  peakLoadBefore: z.number(),
  co2EmissionsBefore: z.number(),
  averageEnergyConsumptionAfter: z.number(),
  peakLoadAfter: z.number(),
  co2EmissionsAfter: z.number(),
  energyImprovementPercent: z.number(),
  peakLoadImprovementPercent: z.number(),
  co2EmissionsImprovementPercent: z.number(),
  predictionAccuracyPercent: z.number(),
});
export type EnergyReportOutput = z.infer<typeof EnergyReportOutputSchema>;

export async function generateEnergyReport(input: EnergyReportInput): Promise<EnergyReportOutput> {
  return energyReportFlow(input);
}

// Constants from the Python script
const ENERGY_IMPROVE_PERCENT = 35.0;
const PEAK_IMPROVE_PERCENT = 38.0;
const CO2_IMPROVE_PERCENT = 38.5;
const PRED_ACCURACY_PERCENT = 92.3;

const energyReportFlow = ai.defineFlow(
  {
    name: 'energyReportFlow',
    inputSchema: EnergyReportInputSchema,
    outputSchema: EnergyReportOutputSchema,
  },
  async (input) => {
    const {
      averageEnergyConsumptionBefore,
      peakLoadBefore,
      co2EmissionsBefore,
    } = input;

    const averageEnergyConsumptionAfter = parseFloat((averageEnergyConsumptionBefore * (1 - ENERGY_IMPROVE_PERCENT / 100)).toFixed(2));
    const peakLoadAfter = parseFloat((peakLoadBefore * (1 - PEAK_IMPROVE_PERCENT / 100)).toFixed(2));
    const co2EmissionsAfter = parseFloat((co2EmissionsBefore * (1 - CO2_IMPROVE_PERCENT / 100)).toFixed(2));

    return {
      averageEnergyConsumptionBefore,
      peakLoadBefore,
      co2EmissionsBefore,
      averageEnergyConsumptionAfter,
      peakLoadAfter,
      co2EmissionsAfter,
      energyImprovementPercent: ENERGY_IMPROVE_PERCENT,
      peakLoadImprovementPercent: PEAK_IMPROVE_PERCENT,
      co2EmissionsImprovementPercent: CO2_IMPROVE_PERCENT,
      predictionAccuracyPercent: PRED_ACCURACY_PERCENT,
    };
  }
);
