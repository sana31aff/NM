
/**
 * @fileOverview Types related to saved reports for model comparisons.
 */

export interface ModelReportDetails {
  name: string; // e.g., "Model 1", "Model 2", or user-defined
  selectedModel: string; // Name of the selected base model or "Custom"
  selectedFramework?: string; // e.g., "tensorflow", "pytorch", "scikit-learn"
  architecture: string;
  dataSize: string;
  predictedEnergyConsumption: string; // e.g., "150 kWh"
  confidenceLevel: string;
  parsedEnergyValue: number; // Numerical value of energy
  energyUnit: string; // e.g., "kWh"
}

export interface ReportChartData {
  name: string; // "Model 1", "Model 2", etc.
  energy: number;
  unit: string;
}

export interface SavedReport {
  id: string; // Unique identifier for the report
  reportTitle: string;
  generatedAt: string; // ISO date string
  models: ModelReportDetails[]; // Array of models being compared
  comparisonSummary: {
    chartData: ReportChartData[]; // Chart data will be derived from the models array
  };
}

