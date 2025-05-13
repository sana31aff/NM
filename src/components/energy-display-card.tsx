import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface EnergyDisplayCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon?: LucideIcon;
  description?: string;
  colorClass?: string; // e.g., text-primary, text-accent
}

export function EnergyDisplayCard({
  title,
  value,
  unit,
  icon: Icon,
  description,
  colorClass = "text-primary",
}: EnergyDisplayCardProps) {
  return (
    <Card className="bg-card text-card-foreground shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className={`h-5 w-5 ${colorClass}`} />}
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${colorClass}`}>
          {value} <span className="text-xl font-medium text-muted-foreground">{unit}</span>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground pt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
