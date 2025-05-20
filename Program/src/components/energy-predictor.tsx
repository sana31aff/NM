
"use client";

import * as React from "react";
import { EnergyPredictorForm, type EnergyPredictorFormValues } from "./energy-predictor-form";
import { EnergyPredictionResults } from "./energy-prediction-results";
import type { EnergyPredictionOutput } from "@/ai/flows/energy-prediction-flow";
import type { SavedReport, ModelReportDetails, ReportChartData } from "@/types/reports";
import { useToast } from "@/hooks/use-toast";

// Helper to parse energy value and unit from string like "150 kWh" or "150"
const parseEnergyValueAndUnitFromString = (energyString: string): { value: number; unit: string } => {
  const valueMatch = energyString.match(/(\d+(\.\d+)?)/);
  const value = valueMatch ? parseFloat(valueMatch[1]) : 0;
  const unit = energyString.replace(/[\d\.\s,]/g, "") || "units";
  return { value, unit };
};

interface EnergyPredictorProps {
  onSaveReport?: (report: Omit<SavedReport, 'id'>) => void;
}

export function EnergyPredictor({ onSaveReport }: EnergyPredictorProps) {
  const [predictionResult, setPredictionResult] = React.useState<EnergyPredictionOutput | null>(null);
  const [formValuesForSave, setFormValuesForSave] = React.useState<EnergyPredictorFormValues | null>(null);
  const { toast } = useToast();

  const handlePrediction = (formValues: EnergyPredictorFormValues, result: EnergyPredictionOutput) => {
    setFormValuesForSave(formValues);
    setPredictionResult(result);
  };

  const handleSaveCurrentPrediction = () => {
    if (!predictionResult || !formValuesForSave || !onSaveReport) {
      toast({
        title: "Cannot Save Report",
        description: "No prediction data available or save function not provided.",
        variant: "destructive",
      });
      return;
    }

    const { value: parsedEnergyValue, unit: energyUnit } = parseEnergyValueAndUnitFromString(predictionResult.predictedEnergyConsumption);

    const modelDetails: ModelReportDetails = {
      name: `Prediction: ${formValuesForSave.selectedModel || formValuesForSave.modelArchitecture}`,
      selectedModel: formValuesForSave.selectedModel || "Custom/Manual",
      selectedFramework: formValuesForSave.selectedFramework,
      architecture: formValuesForSave.modelArchitecture,
      dataSize: formValuesForSave.dataSize,
      predictedEnergyConsumption: predictionResult.predictedEnergyConsumption,
      confidenceLevel: predictionResult.confidenceLevel,
      parsedEnergyValue: parsedEnergyValue,
      energyUnit: energyUnit,
    };

    const chartData: ReportChartData[] = [{
      name: modelDetails.name,
      energy: parsedEnergyValue,
      unit: energyUnit,
    }];

    const reportToSave: Omit<SavedReport, 'id'> = {
      reportTitle: `Energy Prediction - ${formValuesForSave.selectedModel || formValuesForSave.modelArchitecture}`,
      generatedAt: new Date().toISOString(),
      models: [modelDetails],
      comparisonSummary: { // Even for a single prediction, we maintain structure
        chartData: chartData,
      },
    };

    onSaveReport(reportToSave);
    toast({
      title: "Prediction Saved",
      description: "The energy prediction has been saved to your reports.",
    });
  };

  return (
    <div className="space-y-8 flex flex-col items-center">
      <EnergyPredictorForm onPrediction={handlePrediction} />
      {predictionResult && formValuesForSave && (
        <div className="w-full max-w-2xl animate-in fade-in-0 zoom-in-95 duration-500">
          <EnergyPredictionResults
            formInput={formValuesForSave}
            result={predictionResult}
            onSave={onSaveReport ? handleSaveCurrentPrediction : undefined}
          />
        </div>
      )}
    </div>
  );
}
