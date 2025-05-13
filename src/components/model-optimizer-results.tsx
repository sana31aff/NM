"use client";

import type { ModelOptimizationOutput } from "@/ai/flows/model-optimization-suggestions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Lightbulb, TrendingUp } from "lucide-react"; 

interface ModelOptimizerResultsProps {
  suggestions: ModelOptimizationOutput;
}

// Helper to format text with newlines for better readability
const formatMultilineText = (text: string) => {
  return text.split('\n').map((line, index) => (
    <span key={index}>
      {line}
      <br />
    </span>
  ));
};

export function ModelOptimizerResults({ suggestions }: ModelOptimizerResultsProps) {
  const { suggestedTechniques, expectedBenefits } = suggestions;

  return (
    <Card className="w-full bg-card text-card-foreground shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center">
          <Lightbulb className="w-7 h-7 mr-2 text-accent" /> Optimization Suggestions
        </CardTitle>
        <CardDescription>
          AI-powered recommendations to improve your model's efficiency.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-lg hover:no-underline text-accent hover:text-accent/90">
              <div className="flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Suggested Techniques
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
              {formatMultilineText(suggestedTechniques)}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-lg hover:no-underline text-accent hover:text-accent/90">
              <div className="flex items-center">
                 <TrendingUp className="w-5 h-5 mr-2" />
                Expected Benefits
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
              {formatMultilineText(expectedBenefits)}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
