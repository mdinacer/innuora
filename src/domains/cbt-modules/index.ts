import { SessionModule } from "@/domains/cbt-modules/constants/types";
import CORE_MODULE_INSTRUCTIONS from "@/domains/cbt-modules/modules.core";
import PROCESS_MODULE_INSTRUCTIONS from "@/domains/cbt-modules/modules.process";
import UTILITY_MODULE_INSTRUCTIONS from "@/domains/cbt-modules/modules.utility";

// Combine all modules into a single map
const ALL_MODULE_INSTRUCTIONS = {
  ...CORE_MODULE_INSTRUCTIONS,
  ...PROCESS_MODULE_INSTRUCTIONS,
  ...UTILITY_MODULE_INSTRUCTIONS,
};

// Create async map compatible with v1 interface
export const MODULES_INSTRUCTIONS_MAP_ASYNC: Record<SessionModule, () => Promise<string>> = Object.keys(
  ALL_MODULE_INSTRUCTIONS
).reduce(
  (acc, module) => {
    acc[module as SessionModule] = async () => ALL_MODULE_INSTRUCTIONS[module as SessionModule];
    return acc;
  },
  {} as Record<SessionModule, () => Promise<string>>
);

// Export individual modules for direct use
export { CORE_MODULE_INSTRUCTIONS, PROCESS_MODULE_INSTRUCTIONS, UTILITY_MODULE_INSTRUCTIONS };
export default ALL_MODULE_INSTRUCTIONS;
