import { ChatCompletionMessageParam } from "openai/resources";

import { MODULES_INSTRUCTIONS_MAP_ASYNC } from "@/domains/cbt-modules";
import { IN_SCOPE_CHALLENGES, OUT_OF_SCOPE_CHALLENGES, SessionModule } from "@/domains/cbt-modules/constants";
import { TherapeuticAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { capitalize } from "@/lib/utils/capitalize-word";

export class ModulesPromptBuilder {
  async buildModulesPrompt(analysis: TherapeuticAnalysis): Promise<ChatCompletionMessageParam> {
    const { core_module, process_module, utility_module } = analysis;

    const moduleLines: string[] = [];

    if (core_module) {
      const instructions = this.injectAnalysis(await this.getModuleInstructions(core_module), analysis);
      moduleLines.push(`${capitalize(core_module)}: ${instructions}`);
    }

    if (process_module) {
      const instructions = this.injectAnalysis(await this.getModuleInstructions(process_module), analysis);
      moduleLines.push(`${capitalize(process_module)}: ${instructions}`);
    }

    if (utility_module) {
      const instructions = this.injectAnalysis(await this.getModuleInstructions(utility_module), analysis);
      moduleLines.push(`${capitalize(utility_module)}: ${instructions}`);
    }

    const generalInstructions = `
Response: Single paragraph ≤120 words. Core module drives response.
- Reflect user's exact words and emotions
- Apply active module guidance naturally
- Offer one specific insight or question when appropriate
- Maintain conversational flow and supportive tone
`.trim();

    const content =
      moduleLines.length > 0 ? `${moduleLines.join("\n")}\n\n${generalInstructions}` : generalInstructions;

    return {
      role: "system",
      content,
    } as ChatCompletionMessageParam;
  }

  async getModuleInstructions(module: SessionModule): Promise<string> {
    return await MODULES_INSTRUCTIONS_MAP_ASYNC[module]();
  }

  async buildModuleSection(module: SessionModule, analysis: TherapeuticAnalysis): Promise<ChatCompletionMessageParam> {
    const instructions = await MODULES_INSTRUCTIONS_MAP_ASYNC[module]();
    const injectedInstructions = this.injectAnalysis(instructions, analysis);

    return {
      role: "system",
      content: `${capitalize(module)} Module: \n${injectedInstructions}`,
    };
  }

  private injectAnalysis(template: string, analysis: TherapeuticAnalysis): string {
    return template
      .replace(/{{CRISIS}}/g, analysis.crisis ?? "none")
      .replace(/{{INTENSITY}}/g, analysis.intensity ?? "medium")
      .replace(/{{STATE}}/g, analysis.state ?? "unknown")
      .replace(/{{THERAPEUTIC_READINESS}}/g, analysis.therapeutic_readiness ?? "ambivalent")
      .replace(/{{DISTORTIONS}}/g, this.formatDistortions(analysis.distortions))
      .replace(/{{THEMES}}/g, this.formatThemes(analysis.themes))
      .replace(/{{CORE_BELIEFS}}/g, this.formatCoreBeliefs(analysis.core_beliefs))
      .replace(/{{SILENT_RULES}}/g, this.formatSilentRules(analysis.silent_rules))
      .replace(/{{BEHAVIORAL_PATTERNS}}/g, this.formatBehavioralPatterns(analysis.behavioral_patterns))
      .replace(/{{IN_SCOPE_CHALLENGES}}/g, IN_SCOPE_CHALLENGES.join("\n- "))
      .replace(/{{OUT_OF_SCOPE_CHALLENGES}}/g, OUT_OF_SCOPE_CHALLENGES.join("\n- "));
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
}
