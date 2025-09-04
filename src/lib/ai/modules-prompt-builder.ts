import { ChatCompletionMessageParam } from "openai/resources";

import { MODULES_INSTRUCTIONS_MAP_ASYNC } from "@/lib/ai/modules";
import { IN_SCOPE_CHALLENGES, OUT_OF_SCOPE_CHALLENGES, SessionModule } from "@/lib/ai/session-modules";
import { StateAnalysis } from "@/lib/zod/state-analysis.schema";
import { capitalize } from "@/utils/capitalize-word";

export class ModulesPromptBuilder {
  async buildModulesPrompt(analysis: StateAnalysis): Promise<ChatCompletionMessageParam[]> {
    const { primary_module, secondary_module } = analysis;

    const prompts: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `
  Primary Module: ${capitalize(primary_module)}
  Secondary Module: ${secondary_module ? capitalize(secondary_module) : "None"}
  
  Instructions:
  - Combine the modules into a single, cohesive, human-like response.
  - Integrate validation, guidance, and cognitive insights seamlessly.
  - Avoid clearly separating the response by module.
  - Ensure the flow feels natural, warm, and conversational.
  - Maintain continuity with the user's previous messages.
  `,
      },
    ];

    const primary = await this.buildModuleSection(primary_module, analysis);
    if (primary) prompts.push(primary);

    if (secondary_module) {
      const secondary = await this.buildModuleSection(secondary_module, analysis);
      prompts.push(secondary);
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
