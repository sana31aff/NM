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

interface Model {
  id: string;
  name: string;
  framework: string;
}

const models: Model[] = [
  { id: "tf_resnet50", name: "ResNet50", framework: "TensorFlow" },
  { id: "tf_mobilenetv2", name: "MobileNetV2", framework: "TensorFlow" },
  { id: "pt_bert_base", name: "BERT-base", framework: "PyTorch" },
  { id: "pt_gpt2_small", name: "GPT-2 small", framework: "PyTorch" },
  { id: "skl_logreg", name: "Logistic Regression", framework: "scikit-learn" },
  { id: "skl_rf", name: "Random Forest", framework: "scikit-learn" },
];

interface ModelSelectorProps {
  selectedModel: string | undefined;
  onModelChange: (modelId: string) => void;
  label?: string;
}

export function ModelSelector({ selectedModel, onModelChange, label = "Select AI Model" }: ModelSelectorProps) {
  const frameworks = React.useMemo(() => {
    const uniqueFrameworks = new Set(models.map(m => m.framework));
    return Array.from(uniqueFrameworks);
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor="model-selector" className="text-sm font-medium text-foreground">{label}</Label>
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger id="model-selector" className="w-full bg-input text-foreground border-border">
          <SelectValue placeholder="Choose a model..." />
        </SelectTrigger>
        <SelectContent className="bg-popover text-popover-foreground border-border">
          {frameworks.map(framework => (
            <SelectGroup key={framework}>
              <SelectLabel className="text-muted-foreground">{framework}</SelectLabel>
              {models.filter(m => m.framework === framework).map(model => (
                <SelectItem key={model.id} value={model.id} className="focus:bg-accent focus:text-accent-foreground">
                  {model.name}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
