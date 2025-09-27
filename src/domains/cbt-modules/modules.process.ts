import { ProcessModule, SESSION_MODULES } from "@/domains/cbt-modules/constants";
import { AppLocales } from "@/lib/i18n";

// const PROCESS_MODULE_INSTRUCTIONS = {
//   [SESSION_MODULES.OVERWHELM]: `
// - Slow pace; contain with short, steady, clear language.
// - Validate intensity ({{INTENSITY}}) without judgment.
// - Include connections to in-scope challenges ({{IN_SCOPE_CHALLENGES}}) and recurring themes ({{THEMES}}).
// - Avoid introducing new analysis, tasks, or reframes; prioritize safety and clarity.
// `.trim(),

//   [SESSION_MODULES.RESISTANCE_OVERWHELM]: `
// - Acknowledge withdrawal/shutdown directly.
// - Normalize difficulty of engaging without pushing.
// - Include references to in-scope challenges ({{IN_SCOPE_CHALLENGES}}), current state ({{STATE}}), and intensity ({{INTENSITY}}).
// - Keep language minimal, reflective, and safe.
// `.trim(),

//   [SESSION_MODULES.RESISTANCE_PUSHBACK]: `
// - Name the pushback openly (e.g., “This doesn't seem to resonate.”).
// - Validate perspective before offering any new angle.
// - Stay curious, non-defensive, and non-corrective.
// - Focus on one point only, tied to {{THEMES}} and in-scope challenges ({{IN_SCOPE_CHALLENGES}}).
// `.trim(),

//   [SESSION_MODULES.VALIDATE]: `
// - Mirror emotional core directly ({{STATE}}, {{INTENSITY}}), referencing in-scope challenges ({{IN_SCOPE_CHALLENGES}}).
// - Use user's own words to reflect fear, sadness, shame, anger.
// - Keep reflections simple, concise, and free of interpretation unless openness is clear.
// - Prioritize clarity of emotion over reassurance.
// `.trim(),
// };

const PROCESS_MODULE_INSTRUCTIONS_EN: Record<ProcessModule, string> = {
  [SESSION_MODULES.OVERWHELM]: `
Contain user overwhelm:
- Note intensity.
- Reference in-scope challenges ({{IN_SCOPE_CHALLENGES}}) and recurring themes.
- Avoid new analysis, tasks, or reframes.
`.trim(),

  [SESSION_MODULES.RESISTANCE_OVERWHELM]: `
Address withdrawal/shutdown:
- Acknowledge disengagement.
- Reference in-scope challenges ({{IN_SCOPE_CHALLENGES}}).
- Maintain a reflective, safe, and minimal language.
`.trim(),

  [SESSION_MODULES.RESISTANCE_PUSHBACK]: `
Address pushback:
- Name the pushback.
- Reference relevant in-scope challenges ({{IN_SCOPE_CHALLENGES}}) and recurring themes.
- Stay curious and non-defensive.
`.trim(),

  [SESSION_MODULES.VALIDATE]: `
Reflect user emotions:
- Mirror emotional state and intensity.
- Use user's words to highlight core feelings.
- Reference in-scope challenges ({{IN_SCOPE_CHALLENGES}}) when relevant.
- Focus on clarity of emotion over reassurance.
`.trim(),
};

// === Arabic ===
const PROCESS_MODULE_INSTRUCTIONS_AR: Record<ProcessModule, string> = {
  [SESSION_MODULES.OVERWHELM]: `
احتواء شعور المستخدم بالإرهاق:
- ملاحظة شدة المشاعر.
- الإشارة إلى التحديات ضمن النطاق ({{IN_SCOPE_CHALLENGES}}) والمواضيع المتكررة.
- تجنب تقديم تحليلات جديدة أو مهام أو إعادة صياغة.
`.trim(),

  [SESSION_MODULES.RESISTANCE_OVERWHELM]: `
معالجة الانسحاب/التوقف:
- الاعتراف بعدم المشاركة.
- الإشارة إلى التحديات ضمن النطاق ({{IN_SCOPE_CHALLENGES}}).
- استخدام لغة عاكسة، آمنة وبسيطة.
`.trim(),

  [SESSION_MODULES.RESISTANCE_PUSHBACK]: `
معالجة المقاومة أو الرفض:
- تسمية المقاومة بشكل واضح.
- الإشارة إلى التحديات ضمن النطاق ({{IN_SCOPE_CHALLENGES}}) والمواضيع المتكررة.
- الحفاظ على فضولية وعدم الدفاعية.
`.trim(),

  [SESSION_MODULES.VALIDATE]: `
عكس مشاعر المستخدم:
- عكس الحالة العاطفية وشدة المشاعر.
- استخدام كلمات المستخدم لتسليط الضوء على المشاعر الأساسية.
- الإشارة إلى التحديات ضمن النطاق ({{IN_SCOPE_CHALLENGES}}) عند الحاجة.
- التركيز على وضوح المشاعر أكثر من تقديم الطمأنة.
`.trim(),
};

// === French ===
const PROCESS_MODULE_INSTRUCTIONS_FR: Record<ProcessModule, string> = {
  [SESSION_MODULES.OVERWHELM]: `
Contenir le sentiment de surcharge de l'utilisateur :
- Noter l'intensité.
- Faire référence aux défis dans le périmètre ({{IN_SCOPE_CHALLENGES}}) et aux thèmes récurrents.
- Éviter les nouvelles analyses, tâches ou reformulations.
`.trim(),

  [SESSION_MODULES.RESISTANCE_OVERWHELM]: `
Gérer le retrait / la fermeture :
- Reconnaître le désengagement.
- Faire référence aux défis dans le périmètre ({{IN_SCOPE_CHALLENGES}}).
- Maintenir un langage réfléchi, sûr et minimaliste.
`.trim(),

  [SESSION_MODULES.RESISTANCE_PUSHBACK]: `
Gérer la résistance :
- Nommer clairement la résistance.
- Faire référence aux défis pertinents dans le périmètre ({{IN_SCOPE_CHALLENGES}}) et aux thèmes récurrents.
- Rester curieux et non défensif.
`.trim(),

  [SESSION_MODULES.VALIDATE]: `
Refléter les émotions de l'utilisateur :
- Refléter l'état émotionnel et l'intensité.
- Utiliser les mots de l'utilisateur pour mettre en avant les sentiments fondamentaux.
- Faire référence aux défis dans le périmètre ({{IN_SCOPE_CHALLENGES}}) si nécessaire.
- Prioriser la clarté des émotions plutôt que la rassurance.
`.trim(),
};
// const PROCESS_MODULE_INSTRUCTIONS = {
//   [SESSION_MODULES.OVERWHELM]: `
// Contain user overwhelm:
// - Note intensity.
// - Reference in-scope challenges ({{IN_SCOPE_CHALLENGES}}) and recurring themes.
// - Avoid new analysis, tasks, or reframes.
// `.trim(),

//   [SESSION_MODULES.RESISTANCE_OVERWHELM]: `
// Address withdrawal/shutdown:
// - Acknowledge disengagement.
// - Reference in-scope challenges ({{IN_SCOPE_CHALLENGES}}).
// - Maintain a reflective, safe, and minimal language.
// `.trim(),

//   [SESSION_MODULES.RESISTANCE_PUSHBACK]: `
// Address pushback:
// - Name the pushback.
// - Reference relevant in-scope challenges ({{IN_SCOPE_CHALLENGES}}) and recurring themes.
// - Stay curious and non-defensive.
// `.trim(),

//   [SESSION_MODULES.VALIDATE]: `
// Reflect user emotions:
// - Mirror emotional state and intensity.
// - Use user's words to highlight core feelings.
// - Reference in-scope challenges ({{IN_SCOPE_CHALLENGES}}) when relevant.
// - Focus on clarity of emotion over reassurance.
// `.trim(),
// };

const PROCESS_MODULE_INSTRUCTIONS: Record<AppLocales, Record<ProcessModule, string>> = {
  ar: PROCESS_MODULE_INSTRUCTIONS_AR,
  en: PROCESS_MODULE_INSTRUCTIONS_EN,
  fr: PROCESS_MODULE_INSTRUCTIONS_FR,
};
export default PROCESS_MODULE_INSTRUCTIONS;
