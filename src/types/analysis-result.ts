import { TherapeuticAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { ModelTokenUsage } from "./ai-model.types";

export interface AnalysisResult {
  analysis: TherapeuticAnalysis;
  modelTokenUsage: ModelTokenUsage | null;
}
