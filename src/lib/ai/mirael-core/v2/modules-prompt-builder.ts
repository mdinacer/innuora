import { ChatCompletionMessageParam } from "openai/resources";

import { MODULES_INSTRUCTIONS_MAP_ASYNC } from "@/lib/ai/mirael-core/v1/modules";
import { StateAnalysis } from "@/lib/ai/mirael-core/v2/state-analysis/state-analysis.schema";
import { IN_SCOPE_CHALLENGES, OUT_OF_SCOPE_CHALLENGES, SessionModule } from "@/lib/ai/shared/session-modules";
import { capitalize } from "@/utils/capitalize-word";

export class ModulesPromptBuilder {
  async buildModulesPrompt(analysis: StateAnalysis): Promise<ChatCompletionMessageParam[]> {
    const { core_module, process_module, utility_module } = analysis;

    const prompts: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `
Active Modules: 
- Core: ${core_module ? capitalize(core_module) : "None"}
- Process: ${process_module ? capitalize(process_module) : "None"}
- Utility: ${utility_module ? capitalize(utility_module) : "None"}

Instructions:
- Output must be a single short paragraph (≤120 words). Only extend to two concise paragraphs if absolutely necessary.  
- The core module drives the response. Process and utility modules act as subtle modifiers, never standalone sections.  
- Reflect the user's words and emotions directly, showing you understand their inner experience.  
- Highlight cognitive, emotional, or thematic patterns tied to the active modules.  
- Suggest small, actionable next steps only if aligned with the user’s readiness.  
- Keep tone and intensity calibrated to analysis (calm, moderate, or high).  
- Maintain continuity with prior messages for a natural conversational flow.  
`.trim(),
      },
    ];

    if (core_module) {
      const coreModule = await this.buildModuleSection(core_module, analysis);
      prompts.push(coreModule);
    }

    if (process_module) {
      const processModule = await this.buildModuleSection(process_module, analysis);
      prompts.push(processModule);
    }
    if (utility_module) {
      const utilityModule = await this.buildModuleSection(utility_module, analysis);
      prompts.push(utilityModule);
    }

    return prompts;
  }
  async buildModuleSection(module: SessionModule, analysis: StateAnalysis): Promise<ChatCompletionMessageParam> {
    const instructions = await MODULES_INSTRUCTIONS_MAP_ASYNC[module]();
    const injectedInstructions = this.injectAnalysis(instructions, analysis);
    const content = `${capitalize(module)} Module: \n${injectedInstructions}`;

    return {
      role: "system",
      content,
    };
  }

  private injectAnalysis(template: string, analysis: StateAnalysis): string {
    return template
      .replace(/{{CRISIS}}/g, analysis.crisis ?? "none")
      .replace(/{{DISTORTIONS}}/g, analysis.distortions?.length ? analysis.distortions.join(", ") : "none")
      .replace(/{{THEMES}}/g, analysis.themes?.length ? analysis.themes.join(", ") : "none")
      .replace(/{{STATE}}/g, analysis.state ?? "unknown")
      .replace(/{{INTENSITY}}/g, analysis.intensity ?? "medium")
      .replace(/{{IN_SCOPE_CHALLENGES}}/g, IN_SCOPE_CHALLENGES.join("\n- "))
      .replace(/{{OUT_OF_SCOPE_CHALLENGES}}/g, OUT_OF_SCOPE_CHALLENGES.join("\n- "));
  }
}
