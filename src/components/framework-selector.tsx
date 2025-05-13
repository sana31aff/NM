
"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Framework {
  id: string;
  name: string;
}

const frameworks: Framework[] = [
  { id: "tensorflow", name: "TensorFlow" },
  { id: "pytorch", name: "PyTorch" },
  { id: "scikit-learn", name: "scikit-learn" },
  { id: "other", name: "Other/Custom" },
];

interface FrameworkSelectorProps {
  selectedFramework: string | undefined;
  onFrameworkChange: (frameworkId: string) => void;
  label?: string;
  idSuffix?: string; // To ensure unique IDs if multiple selectors are on one page
}

export function FrameworkSelector({ 
  selectedFramework, 
  onFrameworkChange, 
  label = "Select AI Framework",
  idSuffix = "" 
}: FrameworkSelectorProps) {
  const selectId = `framework-selector-${idSuffix}`;
  return (
    <div className="space-y-2">
      <Label htmlFor={selectId} className="text-sm font-medium text-foreground">{label}</Label>
      <Select value={selectedFramework} onValueChange={onFrameworkChange}>
        <SelectTrigger id={selectId} className="w-full bg-input text-foreground border-border">
          <SelectValue placeholder="Choose a framework..." />
        </SelectTrigger>
        <SelectContent className="bg-popover text-popover-foreground border-border">
          <SelectGroup>
            <SelectLabel className="text-muted-foreground">Frameworks</SelectLabel>
            {frameworks.map(framework => (
              <SelectItem key={framework.id} value={framework.id} className="focus:bg-accent focus:text-accent-foreground">
                {framework.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
