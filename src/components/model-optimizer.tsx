"use client";

import * as React from "react";
import { ModelOptimizerForm } from "./model-optimizer-form";
import { ModelOptimizerResults } from "./model-optimizer-results";
import type { ModelOptimizationOutput } from "@/ai/flows/model-optimization-suggestions";

export function ModelOptimizer() {
  const [optimizationSuggestions, setOptimizationSuggestions] = React.useState<ModelOptimizationOutput | null>(null);

  const handleOptimizationSuggestions = (suggestions: ModelOptimizationOutput) => {
    setOptimizationSuggestions(suggestions);
  };

  return (
    <div className="space-y-8 flex flex-col items-center">
      <ModelOptimizerForm onOptimizationSuggestions={handleOptimizationSuggestions} />
      {optimizationSuggestions && (
        <div className="w-full max-w-2xl animate-in fade-in-0 zoom-in-95 duration-500">
          <ModelOptimizerResults suggestions={optimizationSuggestions} />
        </div>
      )}
    </div>
  );
}

