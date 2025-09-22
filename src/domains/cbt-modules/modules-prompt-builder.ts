import { ChatCompletionMessageParam } from "openai/resources";

import { MODULES_INSTRUCTIONS_MAP_ASYNC } from "@/domains/cbt-modules";
import { SESSION_MODULES, SessionModule } from "@/domains/cbt-modules/constants";
import { TherapeuticAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { capitalize } from "@/lib/utils/capitalize-word";

export class ModulesPromptBuilder {
  async buildModulesPrompt(analysis: TherapeuticAnalysis): Promise<ChatCompletionMessageParam> {
    const { crisis, core_module, process_module, utility_module, intensity } = analysis;

    // 1. ABSOLUTE PRIORITY: IMMEDIATE CRISIS (from analysis.crisis)
    if (crisis === "immediate") {
      const analysisContext = this.buildAnalysisContext(analysis);
      const instructions = await this.getModuleInstructions(SESSION_MODULES.CRISIS);
      const content = `USER IN IMMEDIATE CRISIS. FOLLOW CRISIS MODULE INSTRUCTIONS EXACTLY. IGNORE ALL OTHER MODULES.

Current Analysis Context:
${analysisContext}

Crisis Module Instructions:
${instructions}`;
      return { role: "system", content } as ChatCompletionMessageParam;
    }

    // 2. HIGH INTENSITY PRIORITY: OVERWHELM & RESISTANCE (from analysis.process_module)
    // Check if the analyzer has already determined that a containment process module is the highest priority.
    if (
      intensity === "high" &&
      (process_module === SESSION_MODULES.OVERWHELM || process_module === SESSION_MODULES.RESISTANCE_OVERWHELM)
    ) {
      const analysisContext = this.buildAnalysisContext(analysis);
      const instructions = await this.getModuleInstructions(process_module);
      const content = `USER STATE: HIGH INTENSITY WITH OVERWHELM/RESISTANCE. PRIORITIZE CONTAINMENT. THE CORE_MODULE (${core_module}) IS TEMPORARILY PAUSED.

Current Analysis Context:
${analysisContext}

Process Module Instructions:
${instructions}`;
      return { role: "system", content } as ChatCompletionMessageParam;
    }

    // Build analysis context once (shared across all modules to avoid triplication)
    const analysisContext = this.buildAnalysisContext(analysis);

    const moduleLines: string[] = [];

    // Add analysis context first
    moduleLines.push(`Current Analysis Context:\n${analysisContext}`);

    if (core_module) {
      const instructions = await this.getModuleInstructions(core_module);
      moduleLines.push(`\n- Core: ${capitalize(core_module)}\nInstructions: ${instructions}`);
    }

    if (process_module) {
      const instructions = await this.getModuleInstructions(process_module);
      moduleLines.push(`\n- Process: ${capitalize(process_module)}\nInstructions: ${instructions}`);
    }

    if (utility_module) {
      const instructions = await this.getModuleInstructions(utility_module);
      moduleLines.push(`\n- Utility: ${capitalize(utility_module)}\nInstructions: ${instructions}`);
    }

    const generalInstructions = `
General Instructions:
- Output must be a single short paragraph (≤120 words). Only extend to two concise paragraphs if absolutely necessary.
- The core module drives the response. Process and utility modules act as subtle modifiers, never standalone sections.
- Reflect the user's words and emotions directly, showing you understand their inner experience.
- Highlight cognitive, emotional, thematic, or behavioral patterns tied to active modules.
- Suggest small, actionable next steps only if aligned with the user’s therapeutic readiness.
- Keep tone and intensity calibrated to analysis (calm, moderate, high).
- Maintain continuity with prior messages for a natural conversational flow.
`.trim();

    const content =
      moduleLines.length > 0 ? `${moduleLines.join("\n")}\n\n${generalInstructions}` : generalInstructions;

    return { role: "system", content } as ChatCompletionMessageParam;
  }

  async getModuleInstructions(module: SessionModule): Promise<string> {
    return await MODULES_INSTRUCTIONS_MAP_ASYNC[module]();
  }

  async buildModuleSection(module: SessionModule, analysis: TherapeuticAnalysis): Promise<ChatCompletionMessageParam> {
    const instructions = await this.getModuleInstructions(module);
    const analysisContext = this.buildAnalysisContext(analysis);

    return {
      role: "system",
      content: `${capitalize(module)} Module:

Current Analysis Context:
${analysisContext}

Instructions:
${instructions}`,
    };
  }

  private formatDistortions(distortions: TherapeuticAnalysis["distortions"]): string {
    if (!distortions?.length) return "none";
    return distortions.map((d) => `${d.type}(${d.severity})`).join(", ");
  }

  private formatThemes(themes: TherapeuticAnalysis["themes"]): string {
    if (!themes?.length) return "none";
    return themes.map((t) => `${t.theme}(${t.frequency})`).join(", ");
  }

  private formatCoreBeliefs(beliefs: TherapeuticAnalysis["core_beliefs"]): string {
    if (!beliefs?.length) return "none";
    return beliefs.map((b) => `"${b.belief}"`).join(", ");
  }

  private formatSilentRules(rules: TherapeuticAnalysis["silent_rules"]): string {
    if (!rules?.length) return "none";
    return rules.map((r) => `"${r.rule}"(${r.rigidity})`).join(", ");
  }

  private formatBehavioralPatterns(patterns: TherapeuticAnalysis["behavioral_patterns"]): string {
    if (!patterns?.length) return "none";
    return patterns.map((p) => `${p.type}(${p.severity})`).join(", ");
  }

  private buildAnalysisContext(analysis: TherapeuticAnalysis): string {
    return `- Crisis: ${analysis.crisis ?? "none"}
- Intensity: ${analysis.intensity ?? "medium"}
- Therapeutic Readiness: ${analysis.therapeutic_readiness ?? "ambivalent"}
- State: ${analysis.state ?? "unknown"}
- Distortions: ${this.formatDistortions(analysis.distortions)}
- Themes: ${this.formatThemes(analysis.themes)}
- Core Beliefs: ${this.formatCoreBeliefs(analysis.core_beliefs)}
- Silent Rules: ${this.formatSilentRules(analysis.silent_rules)}
- Behavioral Patterns: ${this.formatBehavioralPatterns(analysis.behavioral_patterns)}`;
  }
}
