
"use client";

import * as React from "react";
import { simulateModelTraining, type ModelTrainingSimulationOutput } from "@/ai/flows/model-training-simulation-flow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrainCircuit, Loader2, Play, TrendingUp, LineChart as LineChartLucide, BarChartBig, BarChart2, PieChart as PieChartIconLucide } from "lucide-react"; // Removed Star
import { useToast } from "@/hooks/use-toast";
import { ResponsiveContainer, BarChart, Bar, LineChart as RechartsLineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HistogramDataPoint {
  binName: string;
  count: number;
}

// Define theme colors for Pie chart or use a predefined array
const PIE_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];


export function ModelTrainingSimulationView() {
  const [simulationOutput, setSimulationOutput] = React.useState<ModelTrainingSimulationOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleStartSimulation = async () => {
    setIsLoading(true);
    setSimulationOutput(null);
    try {
      const result = await simulateModelTraining({}); // Pass empty object for optional input
      setSimulationOutput(result);
      toast({
        title: "Simulation Complete",
        description: "Model training simulation finished successfully.",
      });
    } catch (error) {
      console.error("Simulation error:", error);
      toast({
        title: "Simulation Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred during simulation.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const epochChartData = React.useMemo(() => {
    if (!simulationOutput?.epochLogs) return [];
    return simulationOutput.epochLogs.map(log => ({
      name: `Epoch ${log.epoch}`,
      energy: log.estimatedEnergyUsage,
      unit: "kWh",
    }));
  }, [simulationOutput]);

  const histogramData = React.useMemo((): HistogramDataPoint[] => {
    if (!simulationOutput?.epochLogs || simulationOutput.epochLogs.length === 0) return [];

    const energyValues = simulationOutput.epochLogs.map(log => log.estimatedEnergyUsage);
    const minEnergy = Math.min(...energyValues);
    const maxEnergy = Math.max(...energyValues);

    const numBins = Math.min(Math.max(3, Math.floor(energyValues.length / 2)), 5);
    if (numBins <= 0 || minEnergy === maxEnergy) {
      // Handle edge case with single value or very few distinct values
      if (energyValues.length > 0) {
         return [{ binName: `${energyValues[0].toFixed(2)} kWh`, count: energyValues.length }];
      }
      return [];
    }

    const binWidth = (maxEnergy - minEnergy) / numBins;
     // If binWidth is 0 (e.g. all values are the same), create a single bin
    if (binWidth === 0) {
        return [{ binName: `${minEnergy.toFixed(2)} kWh`, count: energyValues.length }];
    }


    const bins: HistogramDataPoint[] = Array(numBins).fill(null).map((_, i) => {
      const binStart = minEnergy + i * binWidth;
      const binEnd = minEnergy + (i + 1) * binWidth;
      return {
        binName: `${binStart.toFixed(2)}-${binEnd.toFixed(2)} kWh`,
        count: 0
      };
    });

    if (bins.length > 0) {
      const lastBinParts = bins[bins.length - 1].binName.split('-');
      // Ensure the last bin covers up to maxEnergy
      bins[bins.length - 1].binName = `${lastBinParts[0]}-${maxEnergy.toFixed(2)} kWh`;
    }

    energyValues.forEach(value => {
      let binIndex = Math.floor((value - minEnergy) / binWidth);
      // Ensure values equal to maxEnergy fall into the last bin
      if (value === maxEnergy) {
        binIndex = numBins - 1;
      }
      binIndex = Math.max(0, Math.min(binIndex, numBins - 1)); // Clamp index
      if (bins[binIndex]) {
        bins[binIndex].count++;
      }
    });

    return bins; // Return all bins, even if count is 0, for consistent histogram structure
  }, [simulationOutput]);


  return (
    <div className="space-y-8">
      <Card className="w-full max-w-3xl mx-auto bg-card text-card-foreground shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <BrainCircuit className="w-6 h-6" /> Model Training Simulation
          </CardTitle>
          <CardDescription>
            Simulate a PyTorch model training process including pruning and energy logging.
            This demonstrates conceptual steps and does not perform actual GPU/CPU intensive training.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <TrendingUp className="h-4 w-4" />
            <AlertTitle>Simulation Overview</AlertTitle>
            <AlertDescription>
              This tool simulates key aspects of an energy-aware model training pipeline:
              loading a pre-trained model (MobileNetV2), applying pruning, running a mock training loop
              with Automatic Mixed Precision (AMP) if CUDA were present, and logging estimated energy usage.
              The actual training calculations and GPU operations are not performed.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartSimulation} disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Simulating...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Simulation
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {simulationOutput && (
        <Card className="w-full max-w-3xl mx-auto bg-card text-card-foreground shadow-xl mt-8 animate-in fade-in-0 zoom-in-95 duration-500">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Simulation Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-accent mb-2">Model & Pruning Details</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line"><strong>Model:</strong> {simulationOutput.modelDetails}</p>
              <p className="text-sm text-muted-foreground whitespace-pre-line"><strong>Pruning:</strong> {simulationOutput.pruningDetails}</p>
            </section>
            <Separator />
            <section>
              <h3 className="text-lg font-semibold text-accent mb-2">Simulated Training Process</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{simulationOutput.trainingProcessSummary}</p>
            </section>
            <Separator />
            <section>
              <h3 className="text-lg font-semibold text-accent mb-2">Epoch Energy Logs</h3>
              <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-background/30">
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {simulationOutput.epochLogs.map((log) => (
                    <li key={log.epoch}>
                      Epoch {log.epoch}: Estimated Energy Usage - {log.estimatedEnergyUsage.toFixed(2)} kWh
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </section>
            <Separator />

            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-accent mb-2">Energy Consumption Visualizations</h3>
              <Tabs defaultValue="bar" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4">
                  <TabsTrigger value="bar">Bar Chart</TabsTrigger>
                  <TabsTrigger value="line">Line Chart</TabsTrigger>
                  <TabsTrigger value="histogram">Histogram</TabsTrigger>
                  <TabsTrigger value="pie">Pie Chart</TabsTrigger>
                </TabsList>

                <TabsContent value="bar">
                  <Card className="bg-background/30">
                    <CardHeader>
                      <CardTitle className="text-md text-primary flex items-center gap-2">
                        <BarChartBig className="w-5 h-5" /> Energy per Epoch
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={epochChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))', style: { textAnchor: 'middle' } }}
                          />
                          <Tooltip
                            cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--popover))',
                              borderColor: 'hsl(var(--border))',
                              borderRadius: 'var(--radius)',
                              color: 'hsl(var(--popover-foreground))'
                            }}
                            formatter={(value: number, name: string, entry: any) => {
                              const { payload } = entry;
                              return [`${value.toFixed(2)} ${payload.unit}`, name === "energy" ? "Est. Energy" : name];
                            }}
                            labelStyle={{ color: 'hsl(var(--popover-foreground))', marginBottom: '4px', fontWeight: 'bold' }}
                          />
                          <Legend wrapperStyle={{ paddingTop: '20px', color: 'hsl(var(--foreground))' }} />
                          <Bar dataKey="energy" name="Est. Energy" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} barSize={Math.max(20, 80 / epochChartData.length)} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="line">
                  <Card className="bg-background/30">
                    <CardHeader>
                      <CardTitle className="text-md text-primary flex items-center gap-2">
                        <LineChartLucide className="w-5 h-5" /> Energy Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={epochChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))', style: { textAnchor: 'middle' } }}
                          />
                          <Tooltip
                            cursor={{ strokeDasharray: '3 3', stroke: 'hsl(var(--muted)/0.5)' }}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--popover))',
                              borderColor: 'hsl(var(--border))',
                              borderRadius: 'var(--radius)',
                              color: 'hsl(var(--popover-foreground))'
                            }}
                            formatter={(value: number, name: string, entry: any) => {
                              const { payload } = entry;
                              return [`${value.toFixed(2)} ${payload.unit}`, name === "energy" ? "Est. Energy" : name];
                            }}
                            labelStyle={{ color: 'hsl(var(--popover-foreground))', marginBottom: '4px', fontWeight: 'bold' }}
                          />
                          <Legend wrapperStyle={{ paddingTop: '20px', color: 'hsl(var(--foreground))' }} />
                          <Line type="monotone" dataKey="energy" name="Est. Energy" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--chart-1))" }} activeDot={{ r: 6 }} />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="histogram">
                   <Card className="bg-background/30">
                    <CardHeader>
                      <CardTitle className="text-md text-primary flex items-center gap-2">
                         <BarChart2 className="w-5 h-5" /> Energy Distribution (Histogram)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px] w-full"> {/* Increased height for better x-axis label visibility */}
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={histogramData} margin={{ top: 5, right: 20, left: 0, bottom: 70 }}> {/* Increased bottom margin */}
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="binName" stroke="hsl(var(--muted-foreground))" interval={0} angle={-45} textAnchor="end" height={60} /* Adjusted angle and height */ />
                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            allowDecimals={false}
                            label={{ value: 'Frequency (Epochs)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))', style: { textAnchor: 'middle' } }}
                          />
                          <Tooltip
                            cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--popover))',
                              borderColor: 'hsl(var(--border))',
                              borderRadius: 'var(--radius)',
                              color: 'hsl(var(--popover-foreground))'
                            }}
                            formatter={(value: number) => [value, "Frequency"]}
                            labelStyle={{ color: 'hsl(var(--popover-foreground))', marginBottom: '4px', fontWeight: 'bold' }}
                          />
                          <Legend wrapperStyle={{ paddingTop: '20px', color: 'hsl(var(--foreground))' }} />
                          <Bar dataKey="count" name="Epoch Count" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} barSize={Math.max(20, 120 / (histogramData.length || 1) )} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="pie">
                  <Card className="bg-background/30">
                    <CardHeader>
                      <CardTitle className="text-md text-primary flex items-center gap-2">
                        <PieChartIconLucide className="w-5 h-5" /> Energy Proportion per Epoch
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={epochChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="energy"
                            nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {epochChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--popover))',
                              borderColor: 'hsl(var(--border))',
                              borderRadius: 'var(--radius)',
                              color: 'hsl(var(--popover-foreground))'
                            }}
                            formatter={(value: number, name: string, entry: any) => {
                              const { payload } = entry;
                              return [`${value.toFixed(2)} ${payload.unit}`, name];
                            }}
                            labelStyle={{ color: 'hsl(var(--popover-foreground))', marginBottom: '4px', fontWeight: 'bold' }}
                          />
                          <Legend wrapperStyle={{ paddingTop: '20px', color: 'hsl(var(--foreground))' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </section>

            <Separator />
            <section>
              <h3 className="text-lg font-semibold text-accent mb-2">Final Message</h3>
              <p className="text-sm font-semibold text-primary">{simulationOutput.finalMessage}</p>
            </section>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

