
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { energyPrediction, type EnergyPredictionOutput } from "@/ai/flows/energy-prediction-flow";
import { useToast } from "@/hooks/use-toast";
import { GitCompareArrows, Loader2, FileDown, Save, Sheet, ImageDown, PlusCircle, XCircle } from "lucide-react";
import { ModelSelector } from "./model-selector";
import { FrameworkSelector } from "./framework-selector";
import { Separator } from "@/components/ui/separator";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { SavedReport, ModelReportDetails, ReportChartData } from "@/types/reports";
import { convertReportToCsvDataArray, arrayToCsv, downloadCsv } from "@/lib/csv-utils";

const MIN_MODELS_TO_COMPARE = 1; 
const DEFAULT_MODELS_COUNT = 2; 

const modelInputSchema = z.object({
  id: z.string().optional(), 
  selectedModel: z.string().optional(),
  selectedFramework: z.string().optional(), 
  architecture: z.string().min(3, { message: "Model architecture must be at least 3 characters." }),
  dataSize: z.string().min(1, { message: "Data size is required (e.g., 1GB, 100MB)." }),
});

type ModelInputValue = z.infer<typeof modelInputSchema>;

const comparisonFormSchema = z.object({
  models: z.array(modelInputSchema).min(MIN_MODELS_TO_COMPARE, `Please configure at least ${MIN_MODELS_TO_COMPARE} model.`),
});

type ComparisonFormValues = z.infer<typeof comparisonFormSchema>;

interface ExtendedPredictionResult extends EnergyPredictionOutput {
  parsedEnergyValue: number;
  energyUnit: string;
}

const parseEnergyValueAndUnit = (energyString: string): { value: number; unit: string } => {
  const valueMatch = energyString.match(/(\d+(\.\d+)?)/);
  const value = valueMatch ? parseFloat(valueMatch[1]) : 0;
  const unit = energyString.replace(/[\d\.\s,]/g, '') || "units";
  return { value, unit };
};

interface ModelComparisonViewProps {
  onSaveReport?: (report: Omit<SavedReport, 'id'>) => void; 
}

const createDefaultModelInput = (): ModelInputValue => ({
  architecture: "",
  dataSize: "",
  selectedModel: undefined,
  selectedFramework: undefined,
});


export function ModelComparisonView({ onSaveReport }: ModelComparisonViewProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [comparisonResults, setComparisonResults] = React.useState<ModelReportDetails[] | null>(null);
  const [numberOfModelsInput, setNumberOfModelsInput] = React.useState<string>(String(DEFAULT_MODELS_COUNT));
  const { toast } = useToast();
  const chartContainerRef = React.useRef<HTMLDivElement>(null);

  const form = useForm<ComparisonFormValues>({
    resolver: zodResolver(comparisonFormSchema),
    defaultValues: {
      models: Array(DEFAULT_MODELS_COUNT).fill(null).map(() => createDefaultModelInput()),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "models",
  });

  // Effect to auto-fill architecture based on selected model and framework
  React.useEffect(() => {
    fields.forEach((_field, index) => {
      const modelPath = `models.${index}.selectedModel` as const;
      const frameworkPath = `models.${index}.selectedFramework` as const;
      const archPath = `models.${index}.architecture` as const;
      
      const selectedModel = form.watch(modelPath);
      const currentFramework = form.watch(frameworkPath);
      
      if (selectedModel) {
        let arch = form.getValues(archPath) || "";
        let frameworkToSet = currentFramework;

        if (selectedModel.includes("resnet")) { arch = "CNN (ResNet-like)"; if(!frameworkToSet) frameworkToSet = "tensorflow"; }
        else if (selectedModel.includes("bert")) { arch = "Transformer (BERT-like)"; if(!frameworkToSet) frameworkToSet = "pytorch"; }
        else if (selectedModel.includes("gpt")) { arch = "Transformer (GPT-like)"; if(!frameworkToSet) frameworkToSet = "pytorch"; }
        else if (selectedModel.includes("skl_")) { if(!frameworkToSet) frameworkToSet = "scikit-learn"; }
        
        form.setValue(archPath, arch, { shouldValidate: true });
        if(frameworkToSet && frameworkToSet !== currentFramework) {
            form.setValue(frameworkPath, frameworkToSet, { shouldValidate: true });
        }
      }
    });
  }, [form, fields]);


  const handleSetNumberOfModels = () => {
    let targetNum = parseInt(numberOfModelsInput, 10);

    if (isNaN(targetNum) || targetNum < MIN_MODELS_TO_COMPARE) {
      toast({
        title: "Invalid Number",
        description: `Number of models must be at least ${MIN_MODELS_TO_COMPARE}. Adjusting to ${MIN_MODELS_TO_COMPARE}.`,
        variant: "destructive",
      });
      targetNum = MIN_MODELS_TO_COMPARE;
      setNumberOfModelsInput(String(targetNum)); // Update input display to reflect validated number
    }

    const currentCount = fields.length;
    if (targetNum === currentCount) return; 

    if (targetNum > currentCount) {
      const diff = targetNum - currentCount;
      for (let i = 0; i < diff; i++) {
        append(createDefaultModelInput(), { shouldFocus: false });
      }
    } else { // targetNum < currentCount
      const diff = currentCount - targetNum;
      for (let i =0; i < diff; i++) {
         remove(fields.length - 1); 
      }
    }
     // Ensure numberOfModelsInput reflects the actual number of models after adjustment
    setNumberOfModelsInput(String(targetNum));
  };


  async function onSubmit(values: ComparisonFormValues) {
    setIsLoading(true);
    setComparisonResults(null);

    try {
      const predictionPromises = values.models.map(modelInput => 
        energyPrediction({ modelArchitecture: modelInput.architecture, dataSize: modelInput.dataSize })
      );
      
      const results = await Promise.all(predictionPromises);
      
      const detailedResults: ModelReportDetails[] = results.map((result, index) => {
        const parsed = parseEnergyValueAndUnit(result.predictedEnergyConsumption);
        const modelInput = values.models[index];
        return {
          name: `${modelInput.selectedModel || modelInput.architecture.split(' ')[0] || 'Model'} ${index + 1}`, // More descriptive name
          selectedModel: modelInput.selectedModel || "Custom",
          selectedFramework: modelInput.selectedFramework,
          architecture: modelInput.architecture,
          dataSize: modelInput.dataSize,
          predictedEnergyConsumption: result.predictedEnergyConsumption,
          confidenceLevel: result.confidenceLevel,
          parsedEnergyValue: parsed.value,
          energyUnit: parsed.unit,
        };
      });

      setComparisonResults(detailedResults);
      toast({ title: "Comparison Ready", description: `Energy predictions for ${detailedResults.length} models are available.` });
    } catch (error) {
      console.error("Comparison error:", error);
      toast({
        title: "Comparison Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const chartData = React.useMemo((): ReportChartData[] => {
    if (!comparisonResults) return [];
    return comparisonResults.map(model => ({
      name: model.name,
      energy: model.parsedEnergyValue,
      unit: model.energyUnit,
    }));
  }, [comparisonResults]);
  
  const primaryUnit = comparisonResults?.[0]?.energyUnit || "units";

  const generateReportObject = (): Omit<SavedReport, 'id'> | null => {
    if (!comparisonResults || comparisonResults.length === 0) return null;
    
    const modelNames = comparisonResults.map(m => m.selectedModel || m.architecture || m.name).join(" vs ");
  
    return {
      reportTitle: `Comparison: ${modelNames.substring(0, 100)}${modelNames.length > 100 ? '...' : ''}`, // Truncate if too long
      generatedAt: new Date().toISOString(),
      models: comparisonResults,
      comparisonSummary: {
        chartData: chartData,
      },
    };
  };

  const handleSaveReportToApp = () => {
    const reportData = generateReportObject();
    if (reportData && onSaveReport) {
      onSaveReport(reportData);
      toast({ title: "Report Saved to App", description: "The comparison report has been saved." });
    } else if (!reportData) {
      toast({ title: "No Data", description: "Please generate a comparison first.", variant: "destructive" });
    } else if (!onSaveReport) {
      toast({ title: "Save Error", description: "Cannot save report to app.", variant: "destructive" });
    }
  };

  const handleExportReportToCSV = () => {
    const reportData = generateReportObject();
    if (reportData) {
      const fullReportDataWithIdForExport: SavedReport = {
        ...reportData,
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `report-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      };
      const csvDataArray = convertReportToCsvDataArray(fullReportDataWithIdForExport);
      const csvString = arrayToCsv(csvDataArray);
      downloadCsv(csvString, `aura_model_comparison_report_${new Date(fullReportDataWithIdForExport.generatedAt).toISOString().split('T')[0]}.csv`);
      toast({ title: "Report Exported to CSV", description: "Downloaded as CSV." });
    } else {
      toast({ title: "No Data", description: "Please generate a comparison first.", variant: "destructive" });
    }
  };

  const handleExportChartImage = () => {
    if (chartContainerRef.current) {
      const svgElement = chartContainerRef.current.querySelector('svg');
      if (svgElement) {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const svgClientRect = svgElement.getBoundingClientRect();
          canvas.width = svgClientRect.width * 2; // Increase resolution for better quality
          canvas.height = svgClientRect.height * 2;
          canvas.style.width = `${svgClientRect.width}px`;
          canvas.style.height = `${svgClientRect.height}px`;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.scale(2,2); // Scale context for higher DPI rendering
            const isDarkMode = document.documentElement.classList.contains('dark');
            ctx.fillStyle = isDarkMode ? 'hsl(var(--card))' : 'hsl(var(--card))'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            const pngDataUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = pngDataUrl;
            a.download = `aura_comparison_chart_${new Date().toISOString().split('T')[0]}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            toast({ title: "Chart Exported", description: "Chart downloaded as PNG." });
          } else {
             toast({ title: "Chart Export Failed", description: "Could not get canvas context.", variant: "destructive" });
          }
          URL.revokeObjectURL(url);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          toast({ title: "Chart Export Failed", description: "Error loading SVG image.", variant: "destructive" });
        };
        img.src = url;
      } else {
        toast({ title: "Chart Export Failed", description: "SVG element not found.", variant: "destructive" });
      }
    } else {
      toast({ title: "Chart Export Failed", description: "Chart container not found.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <Card className="w-full max-w-5xl mx-auto bg-card text-card-foreground shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <GitCompareArrows className="w-6 h-6" /> Model Energy Comparison
          </CardTitle>
          <CardDescription>
            Input details for multiple AI models to compare their estimated energy consumption.
          </CardDescription>
          <div className="flex items-center gap-2 pt-4 flex-wrap">
            <Label htmlFor="numModelsInput" className="text-sm text-muted-foreground whitespace-nowrap">Number of Models:</Label>
            <Input
              id="numModelsInput"
              type="number"
              min={MIN_MODELS_TO_COMPARE}
              value={numberOfModelsInput}
              onChange={(e) => setNumberOfModelsInput(e.target.value)}
              onBlur={handleSetNumberOfModels} 
              className="w-20 bg-input h-9"
            />
            <Button type="button" onClick={handleSetNumberOfModels} variant="outline" size="sm">
              Set
            </Button>
          </div>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {fields.map((field, index) => (
                <Card key={field.id} className="p-4 bg-background/30 shadow-sm relative">
                   <div className="flex justify-between items-center mb-2">
                     <h3 className="text-lg font-semibold text-primary">Model {index + 1}</h3>
                     {fields.length > MIN_MODELS_TO_COMPARE && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-destructive hover:text-destructive/80 absolute top-2 right-2"
                          aria-label={`Remove Model ${index + 1}`}
                        >
                          <XCircle className="w-5 h-5" />
                        </Button>
                      )}
                   </div>
                  <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                    <FormField
                      control={form.control}
                      name={`models.${index}.selectedFramework`}
                      render={({ field: controllerField }) => ( 
                        <FormItem>
                          <FrameworkSelector
                            selectedFramework={controllerField.value}
                            onFrameworkChange={controllerField.onChange}
                            label="Framework"
                            idSuffix={`model${index}`}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`models.${index}.selectedModel`}
                      render={({ field: controllerField }) => (
                        <FormItem>
                          <ModelSelector 
                            selectedModel={controllerField.value} 
                            onModelChange={controllerField.onChange} 
                            label="Optional: Base Model"
                          />
                          <FormDescription>May pre-fill architecture.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`models.${index}.architecture`}
                      render={({ field: controllerField }) => (
                        <FormItem className="md:col-span-1">
                          <FormLabel>Architecture</FormLabel>
                          <FormControl><Input placeholder="e.g., Transformer, CNN" {...controllerField} className="bg-input"/></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`models.${index}.dataSize`}
                      render={({ field: controllerField }) => (
                        <FormItem className="md:col-span-1">
                          <FormLabel>Data Size</FormLabel>
                          <FormControl><Input placeholder="e.g., 1GB, 500MB" {...controllerField} className="bg-input"/></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              ))}
              { fields.length > 0 && ( 
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => append(createDefaultModelInput())}
                    className="w-full mt-4"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Another Model
                </Button>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 items-center">
              <Button type="submit" disabled={isLoading || fields.length < MIN_MODELS_TO_COMPARE} className="w-full sm:w-auto max-w-xs bg-primary hover:bg-primary/90">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Comparing...</> : `Compare ${fields.length} Model(s)`}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {comparisonResults && comparisonResults.length > 0 && (
        <Card className="w-full max-w-5xl mx-auto bg-card text-card-foreground shadow-xl animate-in fade-in-0 zoom-in-95 duration-500">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Comparison Results</CardTitle>
            <CardDescription>Side-by-side energy prediction and key differences for {comparisonResults.length} models.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {comparisonResults.map((modelResult, idx) => (
                <Card key={idx} className="bg-background/30">
                  <CardHeader><CardTitle className="text-lg text-accent">{modelResult.name}</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><strong>Framework:</strong> {modelResult.selectedFramework?.toUpperCase() || "N/A"}</p>
                    <p><strong>Base Model:</strong> {modelResult.selectedModel}</p>
                    <p><strong>Architecture:</strong> {modelResult.architecture}</p>
                    <p><strong>Data Size:</strong> {modelResult.dataSize}</p>
                    <Separator className="my-2"/>
                    <p><strong>Predicted Energy:</strong> <span className="font-semibold text-accent">{modelResult.predictedEnergyConsumption}</span></p>
                    <p><strong>Confidence:</strong> {modelResult.confidenceLevel}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            

            <Separator />

            <div>
              <h4 className="text-xl font-semibold text-primary mb-4">Energy Consumption Chart</h4>
              {chartData.length > 0 ? (
                 <div className="h-[300px] w-full" ref={chartContainerRef}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        label={{ 
                          value: `Energy (${primaryUnit})`, 
                          angle: -90, 
                          position: 'insideLeft', 
                          fill: 'hsl(var(--muted-foreground))', 
                          style: { textAnchor: 'middle' } 
                        }} 
                      />
                       <Tooltip
                        cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))', 
                          borderColor: 'hsl(var(--border))',
                          borderRadius: 'var(--radius)',
                          color: 'hsl(var(--popover-foreground))',
                          boxShadow: '0 2px 10px hsl(var(--shadow, 0 0% 0% / 0.1))'
                        }}
                        formatter={(value: number, name: string, entry: any) => {
                            const { payload } = entry;
                            return [`${value} ${payload.unit}`, name === "energy" ? "Energy" : name];
                        }}
                        labelStyle={{ color: 'hsl(var(--popover-foreground))', marginBottom: '4px', fontWeight: 'bold' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px', color: 'hsl(var(--foreground))' }} />
                      <Bar dataKey="energy" name="Energy" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} barSize={Math.max(20, 80 / chartData.length)} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-muted-foreground text-center">No chart data available. Submit models to see comparison.</p>
              )}
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Note: If energy units differ between models, the Y-axis shows the unit of the first model. Tooltips display individual units.
              </p>
            </div>
            
            <Separator />

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 flex-wrap">
              <Button onClick={handleSaveReportToApp} variant="outline" className="w-full sm:w-auto" disabled={!comparisonResults || !onSaveReport}>
                <Save className="mr-2 h-4 w-4" /> Save Report to App
              </Button>
              <Button onClick={handleExportReportToCSV} variant="outline" className="w-full sm:w-auto" disabled={!comparisonResults}>
                <Sheet className="mr-2 h-4 w-4" /> Export Report (CSV)
              </Button>
              <Button onClick={handleExportChartImage} variant="outline" className="w-full sm:w-auto" disabled={!comparisonResults || !chartData.length}>
                <ImageDown className="mr-2 h-4 w-4" /> Download Chart (PNG)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


    