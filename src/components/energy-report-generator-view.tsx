"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { generateEnergyReport, type EnergyReportInput, type EnergyReportOutput } from "@/ai/flows/energy-report-flow";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ClipboardList } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  averageEnergyConsumptionBefore: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Must be a positive number.",
  }),
  peakLoadBefore: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Must be a positive number.",
  }),
  co2EmissionsBefore: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Must be a positive number.",
  }),
});

type ReportGeneratorFormValues = z.infer<typeof formSchema>;

const aiTechniques = [
  "Linear Regression & Random Forest for consumption prediction",
  "K-Means Clustering for load pattern detection",
  "Reinforcement Learning for real-time energy control",
  "Isolation Forest for anomaly detection"
];

export function EnergyReportGeneratorView() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [reportData, setReportData] = React.useState<EnergyReportOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<ReportGeneratorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      averageEnergyConsumptionBefore: "",
      peakLoadBefore: "",
      co2EmissionsBefore: "",
    },
  });

  async function onSubmit(values: ReportGeneratorFormValues) {
    setIsLoading(true);
    setReportData(null);
    try {
      const inputData: EnergyReportInput = {
        averageEnergyConsumptionBefore: parseFloat(values.averageEnergyConsumptionBefore),
        peakLoadBefore: parseFloat(values.peakLoadBefore),
        co2EmissionsBefore: parseFloat(values.co2EmissionsBefore),
      };
      const result = await generateEnergyReport(inputData);
      setReportData(result);
      toast({
        title: "Report Generated Successfully",
        description: "AI energy efficiency optimization report is ready.",
      });
    } catch (error) {
      console.error("Report generation error:", error);
      toast({
        title: "Report Generation Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="w-full max-w-3xl mx-auto bg-card text-card-foreground shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <ClipboardList className="w-6 h-6"/> AI Energy Efficiency Report Generator
          </CardTitle>
          <CardDescription>
            Enter your system's 'Before Optimization' values to generate a report.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="averageEnergyConsumptionBefore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Average Energy Consumption (kWh/month)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="e.g., 5000" {...field} className="bg-input text-foreground border-border"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="peakLoadBefore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peak Load (kW)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="e.g., 100" {...field} className="bg-input text-foreground border-border"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="co2EmissionsBefore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CO₂ Emissions (tons/year)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="e.g., 50" {...field} className="bg-input text-foreground border-border"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  "Generate Report"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {reportData && (
        <Card className="w-full max-w-3xl mx-auto bg-card text-card-foreground shadow-xl mt-8 animate-in fade-in-0 zoom-in-95 duration-500">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Final Output Report: AI in Energy Efficiency Optimization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-accent mb-2">Project Objective</h3>
              <p className="text-sm text-muted-foreground">
                To develop an AI-driven system that analyzes, predicts, and optimizes energy consumption
                across selected systems or environments, leading to significant energy savings and improved sustainability.
              </p>
            </section>
            <Separator />
            <section>
              <h3 className="text-lg font-semibold text-accent mb-2">AI Techniques Used</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {aiTechniques.map((tech, index) => <li key={index}>{tech}</li>)}
              </ul>
            </section>
            <Separator />
            <section>
              <h3 className="text-lg font-semibold text-accent mb-2">Performance Metrics</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parameter</TableHead>
                    <TableHead>Before AI</TableHead>
                    <TableHead>After AI</TableHead>
                    <TableHead>Improvement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Average Energy Consumption</TableCell>
                    <TableCell>{reportData.averageEnergyConsumptionBefore} kWh/month</TableCell>
                    <TableCell>{reportData.averageEnergyConsumptionAfter} kWh/month</TableCell>
                    <TableCell>{reportData.energyImprovementPercent}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Peak Load</TableCell>
                    <TableCell>{reportData.peakLoadBefore} kW</TableCell>
                    <TableCell>{reportData.peakLoadAfter} kW</TableCell>
                    <TableCell>{reportData.peakLoadImprovementPercent}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Prediction Accuracy</TableCell>
                    <TableCell>N/A</TableCell>
                    <TableCell>{reportData.predictionAccuracyPercent}%</TableCell>
                    <TableCell>—</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>CO₂ Emissions</TableCell>
                    <TableCell>{reportData.co2EmissionsBefore} tons/year</TableCell>
                    <TableCell>{reportData.co2EmissionsAfter} tons/year</TableCell>
                    <TableCell>{reportData.co2EmissionsImprovementPercent}%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </section>
            <Separator />
            <section>
              <h3 className="text-lg font-semibold text-accent mb-2">Conclusion</h3>
              <p className="text-sm text-muted-foreground">
                The AI-based energy efficiency system significantly outperforms traditional manual optimization by providing
                data-driven, automated, and adaptive strategies. The model can be scaled to buildings, data centers, or industrial setups.
              </p>
            </section>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
