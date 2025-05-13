
"use client";

import * as React from "react";
import { AppLayout } from "@/components/app-layout";
import { EnergyPredictor } from "@/components/energy-predictor";
import { ModelOptimizer } from "@/components/model-optimizer";
import { AppEnergyConsumptionCard } from "@/components/app-energy-consumption-card";
import { SavingTipsView } from "@/components/saving-tips-view";
import { ModelComparisonView } from "@/components/model-comparison-view";
import { ChatbotView } from "@/components/chatbot-view";
import { ReportsView } from "@/components/reports-view";
import { EnergyReportGeneratorView } from "@/components/energy-report-generator-view";
import { ModelTrainingSimulationView } from "@/components/model-training-simulation-view";
import { SettingsView } from "@/components/settings-view"; // Added SettingsView
import { BarChartBig, Settings2, Lightbulb, GitCompareArrows, MessageCircle, Home, FileText, ClipboardList, BrainCircuit, Zap, Settings as SettingsIcon } from "lucide-react"; // Added SettingsIcon
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { SavedReport } from "@/types/reports";

type View = "dashboard" | "predictor" | "optimizer" | "savingTips" | "modelComparison" | "chatbot" | "reports" | "reportGenerator" | "trainingSimulation" | "settings"; // Added 'settings'

interface NavItem {
  id: View;
  label: string;
  icon: LucideIcon;
  action: () => void;
}

function DashboardView({ setActiveView }: { setActiveView: (view: View) => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold text-primary flex items-center justify-center md:justify-start gap-2 mb-2">
          <Zap className="w-8 h-8" /> Welcome to Aura
        </h1>
        <p className="text-muted-foreground max-w-3xl mx-auto md:mx-0">
          Aura is your AI Energy Efficiency Companion. It helps you understand and optimize the energy consumption of your AI models.
          Use the navigation menu or click the cards below to explore features like Energy Prediction, Model Optimization, Training Simulations, and more.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card className="bg-card text-card-foreground shadow-lg hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease-in-out cursor-pointer" onClick={() => setActiveView("predictor")}>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-primary"><BarChartBig className="w-5 h-5"/>Energy Predictor</CardTitle>
            <CardDescription>Estimate model energy usage</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Input your model's architecture, framework, and data size to get an AI-powered prediction of its energy footprint.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground shadow-lg hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease-in-out cursor-pointer" onClick={() => setActiveView("optimizer")}>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-primary"><Settings2 className="w-5 h-5"/>Model Optimizer</CardTitle>
            <CardDescription>Get tips to shrink your models</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Describe your model and receive AI suggestions like pruning and quantization to make it smaller and more efficient.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground shadow-lg hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease-in-out cursor-pointer" onClick={() => setActiveView("chatbot")}>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-primary"><MessageCircle className="w-5 h-5"/>Aura Chat</CardTitle>
            <CardDescription>Ask questions and get assistance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Interact with AuraChat for help with AI energy optimization, application features, or general queries.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground shadow-lg hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease-in-out cursor-pointer" onClick={() => setActiveView("savingTips")}>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-primary"><Lightbulb className="w-5 h-5"/>Energy Saving Tips</CardTitle>
            <CardDescription>Learn how to optimize your AI</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Explore AI-powered explanations and practical advice on various strategies to reduce the energy footprint of your models.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground shadow-lg hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease-in-out cursor-pointer" onClick={() => setActiveView("modelComparison")}>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-primary"><GitCompareArrows className="w-5 h-5"/>Model Comparison</CardTitle>
            <CardDescription>Compare energy of different models</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Input details for multiple AI models to see a side-by-side comparison of their estimated energy consumption. Save and export reports.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground shadow-lg hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease-in-out cursor-pointer" onClick={() => setActiveView("reports")}>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-primary"><FileText className="w-5 h-5"/>Saved Reports</CardTitle>
            <CardDescription>Access your saved reports</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Review all your previously saved energy predictions and model comparison reports in one place.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground shadow-lg hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease-in-out cursor-pointer" onClick={() => setActiveView("reportGenerator")}>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-primary"><ClipboardList className="w-5 h-5"/>Energy Report Generator</CardTitle>
            <CardDescription>Generate AI efficiency reports</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Input 'before' metrics to generate a report showing potential energy savings and CO₂ reductions after simulated AI optimization.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground shadow-lg hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease-in-out cursor-pointer" onClick={() => setActiveView("trainingSimulation")}>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-primary"><BrainCircuit className="w-5 h-5"/>Training Simulation</CardTitle>
            <CardDescription>Simulate training energy usage</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Observe a conceptual model training process, including pruning and energy logging, with visualizations.
            </p>
          </CardContent>
        </Card>
        <AppEnergyConsumptionCard />
      </div>
    </div>
  );
}


export default function HomePage() {
  const [activeView, setActiveView] = React.useState<View>("dashboard");
  const [savedReports, setSavedReports] = React.useState<SavedReport[]>([]);

  // Load reports from localStorage on component mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedReports = localStorage.getItem("auraSavedReports");
      if (storedReports) {
        try {
          const parsedReports = JSON.parse(storedReports);
          if (Array.isArray(parsedReports)) {
            setSavedReports(parsedReports);
          } else {
            console.warn("Stored reports in localStorage is not an array. Initializing with empty array.");
            setSavedReports([]);
            localStorage.setItem("auraSavedReports", JSON.stringify([]));
          }
        } catch (error) {
          console.error("Failed to parse reports from localStorage:", error);
          setSavedReports([]);
          localStorage.setItem("auraSavedReports", JSON.stringify([]));
        }
      }
    }
  }, []);

  // Save reports to localStorage whenever savedReports state changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("auraSavedReports", JSON.stringify(savedReports));
    }
  }, [savedReports]);


  const handleSaveReport = (reportData: Omit<SavedReport, 'id'>) => {
    const newReport: SavedReport = {
      ...reportData,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `report-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };
    setSavedReports(prevReports => [...prevReports, newReport]);
  };


  const navItems: NavItem[] = [
    { id: "dashboard", label: "Home", icon: Home, action: () => setActiveView("dashboard") },
    { id: "predictor", label: "Energy Predictor", icon: BarChartBig, action: () => setActiveView("predictor") },
    { id: "optimizer", label: "Model Optimizer", icon: Settings2, action: () => setActiveView("optimizer") },
    { id: "chatbot", label: "Aura Chat", icon: MessageCircle, action: () => setActiveView("chatbot") },
    { id: "savingTips", label: "Saving Tips", icon: Lightbulb, action: () => setActiveView("savingTips") },
    { id: "modelComparison", label: "Model Comparison", icon: GitCompareArrows, action: () => setActiveView("modelComparison") },
    { id: "reports", label: "Saved", icon: FileText, action: () => setActiveView("reports") },
    { id: "reportGenerator", label: "Report Generator", icon: ClipboardList, action: () => setActiveView("reportGenerator") },
    { id: "trainingSimulation", label: "Training Simulation", icon: BrainCircuit, action: () => setActiveView("trainingSimulation") },
    { id: "settings", label: "Settings", icon: SettingsIcon, action: () => setActiveView("settings") }, // Added Settings NavItem
  ];

  const renderView = () => {
    let currentViewComponent;
    switch (activeView) {
      case "dashboard":
        currentViewComponent = <DashboardView setActiveView={setActiveView} />;
        break;
      case "predictor":
        currentViewComponent = <EnergyPredictor onSaveReport={handleSaveReport} />;
        break;
      case "optimizer":
        currentViewComponent = <ModelOptimizer />;
        break;
      case "chatbot":
        currentViewComponent = <ChatbotView />;
        break;
      case "savingTips":
        currentViewComponent = <SavingTipsView />;
        break;
      case "modelComparison":
        currentViewComponent = <ModelComparisonView onSaveReport={handleSaveReport} />;
        break;
      case "reports":
        currentViewComponent = <ReportsView reports={savedReports} />;
        break;
      case "reportGenerator":
        currentViewComponent = <EnergyReportGeneratorView />;
        break;
      case "trainingSimulation":
        currentViewComponent = <ModelTrainingSimulationView />;
        break;
      case "settings": // Added Settings case
        currentViewComponent = <SettingsView />;
        break;
      default:
        currentViewComponent = <DashboardView setActiveView={setActiveView} />;
    }
    return <div key={activeView} className="animate-in fade-in-50 duration-500">{currentViewComponent}</div>;
  };

  const activeNavItem = navItems.find(item => item.id === activeView);
  const pageTitle = activeNavItem ? activeNavItem.label : "Aura";


  return (
    <AppLayout navItems={navItems} activeView={activeView} pageTitle={pageTitle}>
      {renderView()}
    </AppLayout>
  );
}

