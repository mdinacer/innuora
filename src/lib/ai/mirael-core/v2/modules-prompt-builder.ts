import { ChatCompletionMessageParam } from "openai/resources";

import { MODULES_INSTRUCTIONS_MAP_ASYNC } from "@/lib/ai/mirael-core/v2/modules";
import { StateAnalysis } from "@/lib/ai/mirael-core/v2/state-analysis/state-analysis.schema";
import { IN_SCOPE_CHALLENGES, OUT_OF_SCOPE_CHALLENGES, SessionModule } from "@/lib/ai/shared/session-modules";
import { capitalize } from "@/utils/capitalize-word";

export class ModulesPromptBuilder {
  async buildModulesPrompt(analysis: StateAnalysis): Promise<ChatCompletionMessageParam> {
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

  async buildModuleSection(module: SessionModule, analysis: StateAnalysis): Promise<ChatCompletionMessageParam> {
    const instructions = await MODULES_INSTRUCTIONS_MAP_ASYNC[module]();
    const injectedInstructions = this.injectAnalysis(instructions, analysis);

    return {
      role: "system",
      content: `${capitalize(module)} Module: \n${injectedInstructions}`,
    };
  }

  private injectAnalysis(template: string, analysis: StateAnalysis): string {
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

  private formatDistortions(distortions: StateAnalysis["distortions"]): string {
    if (!distortions?.length) return "none";
    return distortions.map((d) => `${d.type}(${d.severity})`).join(", ");
  }

  private formatThemes(themes: StateAnalysis["themes"]): string {
    if (!themes?.length) return "none";
    return themes.map((t) => `${t.theme}(${t.frequency})`).join(", ");
  }

  private formatCoreBeliefs(beliefs: StateAnalysis["core_beliefs"]): string {
    if (!beliefs?.length) return "none";
    return beliefs.map((b) => `"${b.belief}"`).join(", ");
  }

  private formatSilentRules(rules: StateAnalysis["silent_rules"]): string {
    if (!rules?.length) return "none";
    return rules.map((r) => `"${r.rule}"(${r.rigidity})`).join(", ");
  }

  private formatBehavioralPatterns(patterns: StateAnalysis["behavioral_patterns"]): string {
    if (!patterns?.length) return "none";
    return patterns.map((p) => `${p.type}(${p.severity})`).join(", ");
  }
}
