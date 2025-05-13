
"use client";

import { Cpu } from "lucide-react";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export function SidebarDevEnergyInfo() {
  const energyValue = "25 kWh";
  const label = "App Dev Energy";

  return (
    <SidebarMenuButton
      className="!cursor-default !bg-transparent hover:!bg-transparent focus-visible:!ring-0 group-data-[collapsible=icon]:!justify-center"
      tooltip={{ children: `${label}: ${energyValue}`, className: "bg-card text-card-foreground border-border shadow-lg" }}
      asChild 
    >
      <div className="flex w-full items-center justify-between text-sidebar-foreground/70 text-xs group-data-[collapsible=icon]:justify-center">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 shrink-0" />
          <span className="group-data-[state=expanded]:inline group-data-[state=collapsed]:hidden truncate">{label}</span>
        </div>
        <span className="font-medium whitespace-nowrap group-data-[state=expanded]:inline group-data-[state=collapsed]:hidden">{energyValue}</span>
      </div>
    </SidebarMenuButton>
  );
}
