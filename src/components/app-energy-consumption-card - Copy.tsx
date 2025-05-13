
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EnergyDisplayCard } from "./energy-display-card";
import { Cpu, Zap } from "lucide-react"; 

export function AppEnergyConsumptionCard() {
  return (
    <Card className="bg-card text-card-foreground shadow-lg col-span-1 md:col-span-2 lg:col-span-1 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2 text-primary">
          <Cpu className="w-5 h-5" />
          App Development Footprint
        </CardTitle>
        <CardDescription>Estimated energy for Aura's creation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This card provides an illustrative estimate of the energy consumed during the development of the Aura application.
        </p>
        <EnergyDisplayCard
          title="Estimated Development Energy"
          value={25} // Placeholder value
          unit="kWh"
          icon={Zap}
          description="Based on typical development hardware and hours."
          colorClass="text-accent"
        />
        <p className="text-xs text-muted-foreground">
          Note: This is a conceptual estimate and not based on real-time measurement.
        </p>
      </CardContent>
    </Card>
  );
}
