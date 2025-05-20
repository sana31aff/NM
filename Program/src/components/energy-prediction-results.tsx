
"use client";

import type { EnergyPredictionOutput } from "@/ai/flows/energy-prediction-flow";
import type { EnergyPredictorFormValues } from "./energy-predictor-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnergyDisplayCard } from "./energy-display-card";
import { Zap, Save } from "lucide-react";

interface EnergyPredictionResultsProps {
  formInput: EnergyPredictorFormValues; // To help name the report
  result: EnergyPredictionOutput;
  onSave?: () => void; // Callback to trigger saving the report
}

// Helper to parse numerical value from string like "150 kWh" or "150"
const parseEnergyValue = (energyString: string): number => {
  const match = energyString.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
};

export function EnergyPredictionResults({ formInput, result, onSave }: EnergyPredictionResultsProps) {
  const { predictedEnergyConsumption, confidenceLevel } = result;
  const energyValue = parseEnergyValue(predictedEnergyConsumption);
  // Extract unit if present, default to "units"
  const energyUnit = predictedEnergyConsumption.replace(/[\d\.\s,]/g, '') || "units";

  return (
    <Card className="w-full bg-card text-card-foreground shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Prediction Results</CardTitle>
        <CardDescription>
          Estimated energy consumption for: {formInput.selectedModel || formInput.modelArchitecture}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <EnergyDisplayCard
          title="Predicted Consumption"
          value={energyValue}
          unit={energyUnit}
          icon={Zap}
          description={`Confidence: ${confidenceLevel || "N/A"}`}
          colorClass="text-accent"
        />
      </CardContent>
      {onSave && (
        <CardFooter>
          <Button onClick={onSave} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            <Save className="mr-2 h-4 w-4" />
            Save Prediction to Reports
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
