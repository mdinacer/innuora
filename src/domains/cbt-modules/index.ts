import { SessionModule } from "@/domains/cbt-modules/constants/types";
import CORE_MODULE_INSTRUCTIONS from "@/domains/cbt-modules/modules.core";
import PROCESS_MODULE_INSTRUCTIONS from "@/domains/cbt-modules/modules.process";
import UTILITY_MODULE_INSTRUCTIONS from "@/domains/cbt-modules/modules.utility";
import { AppLocales } from "@/lib/i18n";

// Combine all modules into a single map
const ALL_MODULE_INSTRUCTIONS: Record<AppLocales, Record<SessionModule, string>> = {
  ar: {
    ...CORE_MODULE_INSTRUCTIONS["ar"],
    ...PROCESS_MODULE_INSTRUCTIONS["ar"],
    ...UTILITY_MODULE_INSTRUCTIONS["ar"],
  },
  en: {
    ...CORE_MODULE_INSTRUCTIONS["en"],
    ...PROCESS_MODULE_INSTRUCTIONS["en"],
    ...UTILITY_MODULE_INSTRUCTIONS["en"],
  },
  fr: {
    ...CORE_MODULE_INSTRUCTIONS["fr"],
    ...PROCESS_MODULE_INSTRUCTIONS["fr"],
    ...UTILITY_MODULE_INSTRUCTIONS["fr"],
  },
};

// Create async map compatible with v1 interface
export const MODULES_INSTRUCTIONS_MAP_ASYNC: Record<SessionModule, (locale: AppLocales) => Promise<string>> = (
  Object.keys(ALL_MODULE_INSTRUCTIONS.en) as SessionModule[]
).reduce(
  (acc, module) => {
    acc[module] = async (locale: AppLocales) => ALL_MODULE_INSTRUCTIONS[locale][module];
    return acc;
  },
  {} as Record<SessionModule, (locale: AppLocales) => Promise<string>>
);

// Export individual modules for direct use
export { CORE_MODULE_INSTRUCTIONS, PROCESS_MODULE_INSTRUCTIONS, UTILITY_MODULE_INSTRUCTIONS };
export default ALL_MODULE_INSTRUCTIONS;
