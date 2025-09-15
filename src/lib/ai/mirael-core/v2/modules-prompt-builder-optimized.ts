import { ChatCompletionMessageParam } from "openai/resources";

import { MODULES_INSTRUCTIONS_MAP_ASYNC } from "@/lib/ai/mirael-core/v1/modules";
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

    const generalInstructions =
      `≤120 words. Reflect user's words, apply guidance naturally, offer insight/question, maintain flow.`.trim();

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

  private injectAnalysis(template: string, analysis: StateAnalysis): string {
    return template
      .replace(/{{CRISIS}}/g, analysis.crisis ?? "none")
      .replace(/{{DISTORTIONS}}/g, analysis.distortions?.length ? analysis.distortions.join(", ") : "none")
      .replace(/{{CORE_BELIEFS}}/g, analysis.core_beliefs?.length ? analysis.core_beliefs.join(", ") : "none")
      .replace(/{{SILENT_RULES}}/g, analysis.silent_rules?.length ? analysis.silent_rules.join(", ") : "none")
      .replace(/{{THEMES}}/g, analysis.themes?.length ? analysis.themes.join(", ") : "none")
      .replace(/{{STATE}}/g, analysis.state ?? "unknown")
      .replace(/{{INTENSITY}}/g, analysis.intensity ?? "medium")
      .replace(/{{IN_SCOPE_CHALLENGES}}/g, IN_SCOPE_CHALLENGES.join("\n- "))
      .replace(/{{OUT_OF_SCOPE_CHALLENGES}}/g, OUT_OF_SCOPE_CHALLENGES.join("\n- "));
  }
}
