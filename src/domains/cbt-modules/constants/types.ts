import { CORE_MODULES, PROCESS_MODULES, UTILITY_MODULES } from "@/domains/cbt-modules/constants/categories";
import { SESSION_MODULES } from "@/domains/cbt-modules/constants/modules";

export type SessionModule = (typeof SESSION_MODULES)[keyof typeof SESSION_MODULES];
export type CoreModule = (typeof CORE_MODULES)[keyof typeof CORE_MODULES];
export type ProcessModule = (typeof PROCESS_MODULES)[keyof typeof PROCESS_MODULES];
export type UtilityModule = (typeof UTILITY_MODULES)[keyof typeof UTILITY_MODULES];
