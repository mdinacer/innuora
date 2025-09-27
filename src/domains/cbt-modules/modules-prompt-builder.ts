import { ChatCompletionMessageParam } from "openai/resources";

import { MODULES_INSTRUCTIONS_MAP_ASYNC } from "@/domains/cbt-modules";
import { SESSION_MODULES, SessionModule } from "@/domains/cbt-modules/constants";
import { MODULES_INSTRUCTIONS_LOCALIZED } from "@/domains/cbt-modules/modules-instructions-localized";
import { TherapeuticAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { AppLocales } from "@/lib/i18n";
import { capitalize } from "@/lib/utils/capitalize-word";

export class ModulesPromptBuilder {
  private locale: AppLocales;

  constructor(locale: AppLocales = "en") {
    this.locale = locale;
  }
  async buildModulesPrompt(analysis: TherapeuticAnalysis): Promise<ChatCompletionMessageParam> {
    const { crisis, core_module, process_module, utility_module, intensity } = analysis;

    // 1. ABSOLUTE PRIORITY: IMMEDIATE CRISIS (from analysis.crisis)
    if (crisis === "immediate") {
      const analysisContext = this.buildAnalysisContext(analysis, this.locale);
      const instructions = await this.getModuleInstructions(SESSION_MODULES.CRISIS);
      const localizedInstructions = MODULES_INSTRUCTIONS_LOCALIZED[this.locale];

      const content = `${localizedInstructions.crisis_override}

${localizedInstructions.analysis_context}
${analysisContext}

${localizedInstructions.crisis_instructions}
${instructions}`;
      return { role: "system", content } as ChatCompletionMessageParam;
    }

    // 2. HIGH INTENSITY PRIORITY: OVERWHELM & RESISTANCE (from analysis.process_module)
    // Check if the analyzer has already determined that a containment process module is the highest priority.
    if (
      intensity === "high" &&
      (process_module === SESSION_MODULES.OVERWHELM || process_module === SESSION_MODULES.RESISTANCE_OVERWHELM)
    ) {
      const analysisContext = this.buildAnalysisContext(analysis, this.locale);
      const curiosityInstructions = await this.getModuleInstructions(SESSION_MODULES.CURIOSITY);
      const instructions = await this.getModuleInstructions(process_module);
      const localizedInstructions = MODULES_INSTRUCTIONS_LOCALIZED[this.locale];

      const content = `${localizedInstructions.high_intensity_containment}

${localizedInstructions.analysis_context}
${analysisContext}

${localizedInstructions.active_modules}
${localizedInstructions.curiosity_foundation} ${curiosityInstructions}

${capitalize(process_module)} ${localizedInstructions.processing} ${instructions}`;
      return { role: "system", content } as ChatCompletionMessageParam;
    }

    // Build analysis context once (shared across all modules to avoid triplication)
    const analysisContext = this.buildAnalysisContext(analysis, this.locale);
    const localizedInstructions = MODULES_INSTRUCTIONS_LOCALIZED[this.locale];

    // Build unified module instructions instead of separate sections
    const activeModules: string[] = [];

    // ALWAYS include curiosity as the foundation
    const curiosityInstructions = await this.getModuleInstructions(SESSION_MODULES.CURIOSITY);
    activeModules.push(`${localizedInstructions.curiosity_foundation} ${curiosityInstructions}`);

    // Add therapeutic modules as integrated guidance
    if (core_module) {
      const instructions = await this.getModuleInstructions(core_module);
      activeModules.push(`${capitalize(core_module)} ${localizedInstructions.focus} ${instructions}`);
    }

    if (process_module) {
      const instructions = await this.getModuleInstructions(process_module);
      activeModules.push(`${capitalize(process_module)} ${localizedInstructions.processing} ${instructions}`);
    }

    if (utility_module) {
      const instructions = await this.getModuleInstructions(utility_module);
      activeModules.push(`${capitalize(utility_module)} ${localizedInstructions.support} ${instructions}`);
    }

    const unifiedInstructions = `
${localizedInstructions.analysis_context}
${analysisContext}

${localizedInstructions.active_therapeutic_modules}
${activeModules.join("\n\n")}
`.trim();

    const content = unifiedInstructions;

    return { role: "system", content } as ChatCompletionMessageParam;
  }

  async getModuleInstructions(module: SessionModule): Promise<string> {
    return await MODULES_INSTRUCTIONS_MAP_ASYNC[module](this.locale);
  }

  private buildAnalysisContext(analysis: TherapeuticAnalysis, locale: AppLocales): string {
    const coreBeliefs = analysis.core_beliefs.map((b) => `"${b.belief}"`).join(", ") || "none";
    const distortions = analysis.distortions.map((d) => `${d.type}(${d.severity})`).join(", ") || "none";
    const silentRules = analysis.silent_rules.map((r) => `"${r.rule}"(${r.rigidity})`).join(", ") || "none";
    const behavioral = analysis.behavioral_patterns.map((b) => `${b.type}(${b.severity})`).join(", ") || "none";
    const themes = analysis.themes.map((t) => `${t.theme}(${t.frequency})`).join(", ") || "none";

    switch (locale) {
      case "ar":
        return `
الحالة العاطفية للمستخدم:
- شدة المشاعر: ${analysis.intensity}
- مستوى الأزمة: ${analysis.crisis}
- الحالة الحالية: ${analysis.state}

الأنماط المعرفية والمعتقدات:
- المعتقدات الجوهرية: ${coreBeliefs}
- الانحرافات المعرفية: ${distortions}
- القواعد الصامتة: ${silentRules}

الأنماط السلوكية:
- ${behavioral}

الموضوعات المتكررة:
- ${themes}
      `.trim();

      case "fr":
        return `
État émotionnel de l’utilisateur:
- Intensité: ${analysis.intensity}
- Niveau de crise: ${analysis.crisis}
- État actuel: ${analysis.state}

Schémas cognitifs et croyances:
- Croyances fondamentales: ${coreBeliefs}
- Distorsions cognitives: ${distortions}
- Règles silencieuses: ${silentRules}

Schémas comportementaux:
- ${behavioral}

Thèmes récurrents:
- ${themes}
      `.trim();

      default:
        return `
User Emotional State:
- Intensity: ${analysis.intensity}
- Crisis Level: ${analysis.crisis}
- Current state: ${analysis.state}

Cognitive Patterns & Beliefs:
- Core beliefs: ${coreBeliefs}
- Distortions: ${distortions}
- Silent rules: ${silentRules}

Behavioral Patterns:
- ${behavioral}

Recurring Themes:
- ${themes}
      `.trim();
    }
  }
}
