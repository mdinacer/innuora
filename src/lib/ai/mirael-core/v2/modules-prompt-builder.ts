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
      const coreModuleInstructions = this.injectAnalysis(await this.getModuleInstructions(core_module), analysis);
      moduleLines.push(`- Core: ${capitalize(core_module)}\nInstructions: ${coreModuleInstructions}`);
    }

    if (process_module) {
      const processModuleInstructions = this.injectAnalysis(await this.getModuleInstructions(process_module), analysis);
      moduleLines.push(`- Process: ${capitalize(process_module)}\nInstructions: ${processModuleInstructions}`);
    }

    if (utility_module) {
      const utilityModuleInstructions = this.injectAnalysis(await this.getModuleInstructions(utility_module), analysis);
      moduleLines.push(`- Utility: ${capitalize(utility_module)}\nInstructions: ${utilityModuleInstructions}`);
    }

    const generalInstructions = `
General Instructions:
- Output must be a single short paragraph (≤120 words). Only extend to two concise paragraphs if absolutely necessary.  
- The core module drives the response. Process and utility modules act as subtle modifiers, never standalone sections.  
- Reflect the user's words and emotions directly, showing you understand their inner experience.  
- Highlight cognitive, emotional, or thematic patterns tied to the active modules.  
- Suggest small, actionable next steps only if aligned with the user’s readiness.  
- Keep tone and intensity calibrated to analysis (calm, moderate, or high).  
- Maintain continuity with prior messages for a natural conversational flow.
`.trim();

    const instructions = `Active Modules:\n${moduleLines.join("\n")}\n\n${generalInstructions}`;

    return {
      role: "system",
      content: instructions,
    } as ChatCompletionMessageParam;
  }
  //   async buildModulesPrompt(analysis: StateAnalysis): Promise<ChatCompletionMessageParam> {
  //     const { core_module, process_module, utility_module } = analysis;

  //     let instructions = `
  //     Active Modules:
  // - Core: ${core_module ? capitalize(core_module) : "None"}
  // {{core_module_instructions}}
  // - Process: ${process_module ? capitalize(process_module) : "None"}
  // {{process_module_instructions}}
  // - Utility: ${utility_module ? capitalize(utility_module) : "None"}
  // {{utility_module_instructions}}

  // General Instructions:
  // - Output must be a single short paragraph (≤120 words). Only extend to two concise paragraphs if absolutely necessary.
  // - The core module drives the response. Process and utility modules act as subtle modifiers, never standalone sections.
  // - Reflect the user's words and emotions directly, showing you understand their inner experience.
  // - Highlight cognitive, emotional, or thematic patterns tied to the active modules.
  // - Suggest small, actionable next steps only if aligned with the user’s readiness.
  // - Keep tone and intensity calibrated to analysis (calm, moderate, or high).
  // - Maintain continuity with prior messages for a natural conversational flow.`.trim();

  //     const coreModuleInstructions = core_module
  //       ? this.injectAnalysis(await this.getModuleInstructions(core_module), analysis)
  //       : null;

  //     const processModuleInstructions = process_module
  //       ? this.injectAnalysis(await this.getModuleInstructions(process_module), analysis)
  //       : null;

  //     const utilityModuleInstructions = utility_module
  //       ? this.injectAnalysis(await this.getModuleInstructions(utility_module), analysis)
  //       : null;

  //     // Replace placeholders correctly
  //     instructions = instructions
  //       .replace("{{core_module_instructions}}", coreModuleInstructions ? `Instructions: ${coreModuleInstructions}` : "")
  //       .trim()
  //       .replace(
  //         "{{process_module_instructions}}",
  //         processModuleInstructions ? `Instructions: ${processModuleInstructions}` : ""
  //       )
  //       .trim()
  //       .replace(
  //         "{{utility_module_instructions}}",
  //         utilityModuleInstructions ? `Instructions: ${utilityModuleInstructions}` : ""
  //       )
  //       .trim();

  //     //     const prompts: ChatCompletionMessageParam[] = [
  //     //       {
  //     //         role: "system",
  //     //         content: `
  //     // Active Modules:
  //     // - Core: ${core_module ? capitalize(core_module) : "None"}
  //     // - Process: ${process_module ? capitalize(process_module) : "None"}
  //     // - Utility: ${utility_module ? capitalize(utility_module) : "None"}

  //     // Instructions:
  //     // - Output must be a single short paragraph (≤120 words). Only extend to two concise paragraphs if absolutely necessary.
  //     // - The core module drives the response. Process and utility modules act as subtle modifiers, never standalone sections.
  //     // - Reflect the user's words and emotions directly, showing you understand their inner experience.
  //     // - Highlight cognitive, emotional, or thematic patterns tied to the active modules.
  //     // - Suggest small, actionable next steps only if aligned with the user’s readiness.
  //     // - Keep tone and intensity calibrated to analysis (calm, moderate, or high).
  //     // - Maintain continuity with prior messages for a natural conversational flow.
  //     // `.trim(),
  //     //       },
  //     //     ];

  //     //     if (core_module) {
  //     //       const coreModule = await this.buildModuleSection(core_module, analysis);
  //     //       prompts.push(coreModule);
  //     //     }

  //     //     if (process_module) {
  //     //       const processModule = await this.buildModuleSection(process_module, analysis);
  //     //       prompts.push(processModule);
  //     //     }
  //     //     if (utility_module) {
  //     //       const utilityModule = await this.buildModuleSection(utility_module, analysis);
  //     //       prompts.push(utilityModule);
  //     //     }

  //     return {
  //       role: "system",
  //       content: instructions,
  //     } as ChatCompletionMessageParam;
  //   }
  async getModuleInstructions(module: SessionModule): Promise<string> {
    return await MODULES_INSTRUCTIONS_MAP_ASYNC[module]();
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
      .replace(/{{CORE_BELIEFS}}/g, analysis.core_beliefs?.length ? analysis.core_beliefs.join(", ") : "none")
      .replace(/{{SILENT_RULES}}/g, analysis.silent_rules?.length ? analysis.silent_rules.join(", ") : "none")
      .replace(/{{THEMES}}/g, analysis.themes?.length ? analysis.themes.join(", ") : "none")
      .replace(/{{STATE}}/g, analysis.state ?? "unknown")
      .replace(/{{INTENSITY}}/g, analysis.intensity ?? "medium")
      .replace(/{{IN_SCOPE_CHALLENGES}}/g, IN_SCOPE_CHALLENGES.join("\n- "))
      .replace(/{{OUT_OF_SCOPE_CHALLENGES}}/g, OUT_OF_SCOPE_CHALLENGES.join("\n- "));
  }
}
