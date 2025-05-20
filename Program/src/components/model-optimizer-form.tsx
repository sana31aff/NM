
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getModelOptimizationSuggestions, type ModelOptimizationInput, type ModelOptimizationOutput } from "@/ai/flows/model-optimization-suggestions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { ModelSelector } from "./model-selector";
import { FrameworkSelector } from "./framework-selector"; // Import FrameworkSelector

const formSchema = z.object({
  selectedModel: z.string().optional(),
  selectedFramework: z.string().optional(), // Added selectedFramework
  modelDescription: z.string().min(20, {
    message: "Model description must be at least 20 characters.",
  }).max(2000, {
    message: "Model description must not exceed 2000 characters."
  }),
});

type ModelOptimizerFormValues = z.infer<typeof formSchema>;

interface ModelOptimizerFormProps {
  onOptimizationSuggestions: (suggestions: ModelOptimizationOutput) => void;
}

export function ModelOptimizerForm({ onOptimizationSuggestions }: ModelOptimizerFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<ModelOptimizerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      modelDescription: "",
      selectedModel: undefined,
      selectedFramework: undefined, // Default value for framework
    },
  });

  const selectedModelValue = form.watch("selectedModel");
  const selectedFrameworkValue = form.watch("selectedFramework");

  React.useEffect(() => {
    let baseDescription = "";
    let frameworkToSet = selectedFrameworkValue;

    if (selectedModelValue) {
      baseDescription = `Model: ${selectedModelValue}\n`;
      if (selectedModelValue.includes("resnet")) {
        baseDescription += "Architecture: CNN (ResNet-like)\nDataset: [Specify dataset]\nTask: Image Classification\nThis is a Convolutional Neural Network commonly used for image classification.";
        if (!frameworkToSet) frameworkToSet = "tensorflow";
      } else if (selectedModelValue.includes("bert")) {
        baseDescription += "Architecture: Transformer (BERT-like)\nDataset: [Specify dataset]\nTask: NLP (e.g., Text Classification)\nThis is a Transformer-based model often used for Natural Language Processing tasks.";
        if (!frameworkToSet) frameworkToSet = "pytorch";
      } else if (selectedModelValue.includes("gpt")) {
        baseDescription += "Architecture: Transformer (GPT-like)\nDataset: [Specify dataset]\nTask: NLP (e.g., Text Generation)\nThis is a Transformer-based model often used for Natural Language Processing tasks.";
        if (!frameworkToSet) frameworkToSet = "pytorch";
      } else if (selectedModelValue.includes("skl_")) {
        baseDescription += "Architecture: [Specify scikit-learn model type, e.g., Logistic Regression, Random Forest]\nDataset: [Specify dataset]\nTask: [Specify task]\nThis is a scikit-learn model.";
        if (!frameworkToSet) frameworkToSet = "scikit-learn";
      } else {
         baseDescription += "Architecture: [Specify architecture, e.g., Transformer with 12 layers, 768 hidden units]\nDataset: [Specify dataset used for training/fine-tuning]\nTask: [Specify task, e.g., text classification, image generation]\n";
      }
    }
    
    if (frameworkToSet && frameworkToSet !== selectedFrameworkValue) {
      form.setValue("selectedFramework", frameworkToSet);
    }
    
    let fullDescription = "";
    if (frameworkToSet) {
       const frameworkName = frameworkToSet.charAt(0).toUpperCase() + frameworkToSet.slice(1).replace("-", " ");
       fullDescription = `Framework: ${frameworkName}\n${baseDescription || form.getValues("modelDescription") || "Architecture: [Specify architecture]\nDataset: [Specify dataset]\nTask: [Specify task]\n"}`;
    } else {
      fullDescription = baseDescription || form.getValues("modelDescription") || "Architecture: [Specify architecture]\nDataset: [Specify dataset]\nTask: [Specify task]\n";
    }
    
    if (selectedModelValue || frameworkToSet) { // Only update if model or framework changes, to avoid overwriting user edits
        form.setValue("modelDescription", fullDescription.trim());
    }

  }, [selectedModelValue, selectedFrameworkValue, form]);

  async function onSubmit(values: ModelOptimizerFormValues) {
    setIsLoading(true);
    try {
      let description = values.modelDescription;
      if (values.selectedFramework && !description.toLowerCase().includes(`framework: ${values.selectedFramework.toLowerCase()}`)) {
        const frameworkName = values.selectedFramework.charAt(0).toUpperCase() + values.selectedFramework.slice(1).replace("-", " ");
        description = `Framework: ${frameworkName}\n${description}`;
      }

      const optimizationInput: ModelOptimizationInput = {
        modelDescription: description,
      };
      const result = await getModelOptimizationSuggestions(optimizationInput);
      onOptimizationSuggestions(result);
      toast({
        title: "Optimization Suggestions Received",
        description: "AI has provided model optimization tips.",
      });
    } catch (error) {
      console.error("Optimization suggestion error:", error);
      toast({
        title: "Suggestion Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl bg-card text-card-foreground shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Model Optimizer</CardTitle>
        <CardDescription>
          Describe your AI model to receive optimization suggestions.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="selectedFramework"
              render={({ field }) => (
                <FormItem>
                  <FrameworkSelector
                    selectedFramework={field.value}
                    onFrameworkChange={field.onChange}
                  />
                  <FormDescription>
                    Select the primary framework. This helps tailor suggestions and may pre-fill parts of the description.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="selectedModel"
              render={({ field }) => (
                <FormItem>
                  <ModelSelector 
                    selectedModel={field.value} 
                    onModelChange={field.onChange}
                    label="Optionally, select a base model"
                    // currentFramework={selectedFrameworkValue}
                  />
                  <FormDescription>
                    Selecting a model may pre-fill parts of the description and suggest a framework.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="modelDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a detailed description of your AI model, including its framework, architecture, layers, parameters, and intended use case..."
                      className="min-h-[150px] bg-input text-foreground border-border"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The more details you provide (including framework if not selected above), the better the suggestions.
                  </FormDescription>
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
                  Analyzing...
                </>
              ) : (
                "Get Optimization Suggestions"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
