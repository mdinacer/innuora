import { ChatCompletionMessageParam } from "openai/resources";

import { MODULES_INSTRUCTIONS_MAP_ASYNC } from "@/lib/ai/mirael-core/v1/modules";
import { StateAnalysis } from "@/lib/ai/mirael-core/v1/state-analysis/state-analysis.schema";
import { IN_SCOPE_CHALLENGES, OUT_OF_SCOPE_CHALLENGES, SessionModule } from "@/lib/ai/shared/session-modules";
import { capitalize } from "@/utils/capitalize-word";

export class ModulesPromptBuilder {
  async buildModulesPrompt(analysis: StateAnalysis): Promise<ChatCompletionMessageParam[]> {
    const { primary_module, secondary_module } = analysis;

    //     const prompts: ChatCompletionMessageParam[] = [
    //       {
    //         role: "system",
    //         content: `
    //   Primary Module: ${capitalize(primary_module)}
    //   Secondary Module: ${secondary_module ? capitalize(secondary_module) : "None"}

    //   Instructions:
    // - Combine all active modules into a single, cohesive response.
    // - Integrate validation, pattern recognition, guidance, and cognitive insights seamlessly.
    // - **Important:** Keep the response short—**1 to 2 paragraphs only**.
    // - Reflect the user's words and emotions clearly, highlighting key patterns or insights.
    // - Suggest small, practical, actionable steps if relevant, without over-explaining.
    // - Avoid separating the response by module; it should read naturally as one message.
    // - Maintain continuity with the user's previous messages and emotional state.
    // - Match the tone and intensity based on analysis (calm, moderate, or high).
    //   `.trim(),
    //       },
    //     ];
    const prompts: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `
Active Modules: ${capitalize(primary_module)} (primary)${secondary_module ? `, ${capitalize(secondary_module)} (secondary lens)` : ""}

Instructions:
- Limit output to one short paragraph (≤120 words). If absolutely needed, two concise paragraphs only.  
- Produce a single, cohesive reflection — never separate by module.  
- Weave secondary modules as subtle modifiers to the primary, not as standalone sections.  
- Reflect the user's words and emotions clearly, highlighting key patterns or insights.  
- Suggest small, practical, actionable steps if relevant, without over-explaining.  
- Maintain continuity with the user's previous messages and emotional state.  
- Match the tone and intensity based on analysis (calm, moderate, or high).  
`.trim(),
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
