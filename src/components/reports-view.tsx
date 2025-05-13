
"use client";

import * as React from "react";
import type { SavedReport, ModelReportDetails } from "@/types/reports";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText, Eye, Download, Sheet, ImageDown } from "lucide-react";
import { format } from 'date-fns';
import { convertReportToCsvDataArray, arrayToCsv, downloadCsv, frameworkNameMapping } from "@/lib/csv-utils";
import { useToast } from "@/hooks/use-toast";


interface ReportsViewProps {
  reports: SavedReport[];
}

const ReportDetailItem: React.FC<{ label: string; value: string | number | undefined | null }> = ({ label, value }) => (
  <p className="text-sm">
    <strong className="text-muted-foreground">{label}:</strong> {value ?? 'N/A'}
  </p>
);

const ModelDetailsCard: React.FC<{ model: ModelReportDetails, title: string }> = ({ model, title }) => (
  <Card className="bg-background/50 flex-1 min-w-[280px]"> {/* Added min-w for better layout in flex */}
    <CardHeader>
      <CardTitle className="text-lg text-accent">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-1">
      <ReportDetailItem label="Framework" value={model.selectedFramework ? frameworkNameMapping[model.selectedFramework] || model.selectedFramework : 'N/A'} />
      <ReportDetailItem label="Base Model" value={model.selectedModel} />
      <ReportDetailItem label="Architecture" value={model.architecture} />
      <ReportDetailItem label="Data Size" value={model.dataSize} />
      <Separator className="my-2" />
      <ReportDetailItem label="Predicted Energy" value={model.predictedEnergyConsumption} />
      <ReportDetailItem label="Parsed Value" value={`${model.parsedEnergyValue} ${model.energyUnit}`} />
      <ReportDetailItem label="Confidence" value={model.confidenceLevel} />
    </CardContent>
  </Card>
);


export function ReportsView({ reports }: ReportsViewProps) {
  const [selectedReport, setSelectedReport] = React.useState<SavedReport | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);
  const dialogChartContainerRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleViewDetails = (report: SavedReport) => {
    setSelectedReport(report);
    setIsDetailDialogOpen(true);
  };

  const handleDownloadReportCSV = (report: SavedReport) => {
    const csvDataArray = convertReportToCsvDataArray(report);
    const csvString = arrayToCsv(csvDataArray);
    downloadCsv(csvString, `aura_report_${report.id.substring(0,8)}_${new Date(report.generatedAt).toISOString().split('T')[0]}.csv`);
    toast({ title: "Report Exported", description: "The report has been downloaded as a CSV file." });
  };
  
  const handleDownloadDialogChartImage = () => {
    if (!selectedReport) {
      toast({ title: "Chart Export Failed", description: "No report selected.", variant: "destructive" });
      return;
    }
    if (dialogChartContainerRef.current) {
      const svgElement = dialogChartContainerRef.current.querySelector('svg');
      if (svgElement) {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const svgClientRect = svgElement.getBoundingClientRect();
          canvas.width = svgClientRect.width;
          canvas.height = svgClientRect.height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            const isDarkMode = document.documentElement.classList.contains('dark');
            ctx.fillStyle = isDarkMode ? 'hsl(var(--card))' : 'hsl(var(--card))';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            const pngDataUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = pngDataUrl;
            a.download = `aura_report_chart_${selectedReport.id.substring(0,8)}_${new Date(selectedReport.generatedAt).toISOString().split('T')[0]}.png`;
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
        toast({ title: "Chart Export Failed", description: "SVG element not found in dialog.", variant: "destructive" });
      }
    } else {
      toast({ title: "Chart Export Failed", description: "Dialog chart container not found.", variant: "destructive" });
    }
  };
  
  const primaryUnit = selectedReport?.models[0]?.energyUnit || "units";


  if (reports.length === 0) {
    return (
      <Card className="bg-card text-card-foreground shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <FileText className="w-6 h-6" /> Saved Reports
          </CardTitle>
          <CardDescription>All your saved model comparison reports will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No reports saved yet. Compare some models and save the results to see them here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card text-card-foreground shadow-lg">
         <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <FileText className="w-6 h-6" /> Saved Reports
          </CardTitle>
          <CardDescription>Review your saved model comparison reports.</CardDescription>
        </CardHeader>
        <CardContent>
            <ScrollArea className="h-[calc(100vh-280px)]"> {/* Adjust height as needed */}
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reports.map((report) => (
                <Card key={report.id} className="bg-background/30 hover:shadow-md transition-shadow">
                    <CardHeader>
                    <CardTitle className="text-lg text-primary truncate" title={report.reportTitle}>
                        {report.reportTitle}
                    </CardTitle>
                    <CardDescription>
                        Generated: {format(new Date(report.generatedAt), "PPP p")}
                    </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-end gap-2 flex-wrap">
                     <Button variant="outline" size="sm" onClick={() => handleDownloadReportCSV(report)}>
                        <Sheet className="mr-2 h-4 w-4" /> CSV
                      </Button>
                    <Button variant="default" size="sm" onClick={() => handleViewDetails(report)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                    </Button>
                    </CardFooter>
                </Card>
                ))}
            </div>
            </ScrollArea>
        </CardContent>
      </Card>

      {selectedReport && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl w-[90vw] h-[90vh] flex flex-col p-0">
            <DialogHeader className="p-6 border-b">
              <DialogTitle className="text-2xl text-primary">{selectedReport.reportTitle}</DialogTitle>
              <DialogDescription>
                Generated on: {format(new Date(selectedReport.generatedAt), "PPP p")}
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row flex-wrap gap-6"> {/* Added flex-wrap */}
                  {selectedReport.models.map((model, index) => (
                     <ModelDetailsCard key={index} model={model} title={model.name || `Model ${index + 1}`} />
                  ))}
                </div>

                <Separator />

                <div>
                  <h4 className="text-xl font-semibold text-primary mb-4">Energy Consumption Chart</h4>
                  {selectedReport.comparisonSummary.chartData.length > 0 ? (
                    <div className="h-[300px] w-full" ref={dialogChartContainerRef}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={selectedReport.comparisonSummary.chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
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
                            }}
                             formatter={(value: number, name: string, entry: any) => {
                                const { payload } = entry;
                                return [`${value} ${payload.unit}`, name === "energy" ? "Energy" : name];
                            }}
                            labelStyle={{ color: 'hsl(var(--popover-foreground))', marginBottom: '4px', fontWeight: 'bold' }}
                          />
                          <Legend wrapperStyle={{ paddingTop: '20px', color: 'hsl(var(--foreground))' }} />
                          <Bar dataKey="energy" name="Energy" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} barSize={Math.max(20, 80 / selectedReport.comparisonSummary.chartData.length)} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center">No chart data available for this report.</p>
                  )}
                   <p className="text-xs text-muted-foreground mt-2 text-center">
                    Note: If energy units differ between models, the Y-axis shows the unit of the first model. Tooltips display individual units.
                  </p>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="p-6 border-t sm:justify-start gap-2 flex-wrap">
              <Button variant="outline" onClick={() => handleDownloadReportCSV(selectedReport)}>
                <Sheet className="mr-2 h-4 w-4" /> Export CSV
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDownloadDialogChartImage}
                disabled={!selectedReport || !selectedReport.comparisonSummary.chartData.length}
              >
                <ImageDown className="mr-2 h-4 w-4" /> Download Chart (PNG)
              </Button>
              <DialogClose asChild className="sm:ml-auto mt-2 sm:mt-0">
                <Button variant="secondary">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

