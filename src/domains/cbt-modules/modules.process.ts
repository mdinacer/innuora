import { ProcessModule, SESSION_MODULES } from "@/domains/cbt-modules/constants";
import { AppLocales } from "@/lib/i18n";

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
Reflect user emotions AND identify potential growth edges:
- Mirror emotional state using user's words
- Note underlying patterns or tensions
- End with ONE forward-moving question
- Avoid pure repetition; add slight reframe or curiosity
- Example: Instead of "That sounds heavy" try "That heaviness seems to connect to your pattern of [theme] - what's that like?"
`.trim(),

  [SESSION_MODULES.REFLECTIVE_CATALYST]: `
Reignite engagement when insight becomes intellectualized:
- Gently challenge the *cost* of over-analysis, not the person
- Use concrete, sensory language instead of abstract metaphors
- Bridge cognitive understanding to direct bodily awareness
- Introduce unexpected perspectives to disrupt analytical loops
- Maintain warm, curious tone; end with present-moment noticing
- Example approach: "When thinking replaces feeling, what happens in your body right now?"
`.trim(),
};

// === Arabic ===
const PROCESS_MODULE_INSTRUCTIONS_AR: Record<ProcessModule, string> = {
  [SESSION_MODULES.OVERWHELM]: `
احتواء حالة الإرهاق العاطفي:
- لاحِظ مستوى الشدة.
- أشر إلى التحديات ذات الصلة ضمن النطاق ({{IN_SCOPE_CHALLENGES}}) والأنماط المتكررة.
- تجنّب التحليل الجديد أو المهام أو إعادة الصياغة.
`.trim(),

  [SESSION_MODULES.RESISTANCE_OVERWHELM]: `
معالجة الانسحاب أو الإغلاق العاطفي:
- اعترف بحالة الانفصال أو التراجع.
- أشر إلى التحديات ذات الصلة ضمن النطاق ({{IN_SCOPE_CHALLENGES}}).
- حافظ على لغة هادئة، عاكسة، ومحدودة قدر الإمكان.
`.trim(),

  [SESSION_MODULES.RESISTANCE_PUSHBACK]: `
معالجة المقاومة أو الرفض:
- سمِّ المقاومة بوضوح.
- أشر إلى التحديات ذات الصلة ضمن النطاق ({{IN_SCOPE_CHALLENGES}}) والأنماط المتكررة.
- ابقَ فضولياً وغير دفاعي في النبرة والأسلوب.
`.trim(),

  [SESSION_MODULES.VALIDATE]: `
عكس المشاعر والتجارب العاطفية:
- اعكس الحالة الشعورية ومستوى شدتها.
- استخدم كلمات المستخدم لتوضيح المشاعر الأساسية.
- أشر إلى التحديات ذات الصلة ضمن النطاق ({{IN_SCOPE_CHALLENGES}}) عند الاقتضاء.
- ركّز على وضوح الشعور بدلاً من التطمين.
`.trim(),

  [SESSION_MODULES.REFLECTIVE_CATALYST]: `
إعادة إشعال التواصل عندما يتحوّل الوعي إلى تحليل ذهني:
- تحدَّ بلطف *ثمن* الإفراط في التحليل، وليس الشخص ذاته.
- استخدم لغة حسية ملموسة بدلاً من الاستعارات المجردة.
- اربط الفهم العقلي بالوعي الجسدي المباشر.
- قدّم وجهات نظر غير متوقعة لكسر دوائر التحليل المتكرر.
- حافظ على نبرة دافئة وفضولية، واختم بملاحظة للحظة الحاضرة.
- مثال: "عندما يحل التفكير محل الشعور، ماذا تلاحظين في جسدك الآن؟"
`.trim(),
};

// === French ===
const PROCESS_MODULE_INSTRUCTIONS_FR: Record<ProcessModule, string> = {
  [SESSION_MODULES.OVERWHELM]: `
Contenir le débordement émotionnel :
- Observer le niveau d’intensité.
- Faire référence aux difficultés concernées ({{IN_SCOPE_CHALLENGES}}) et aux thèmes récurrents.
- Éviter toute nouvelle analyse, tâche ou reformulation.
`.trim(),

  [SESSION_MODULES.RESISTANCE_OVERWHELM]: `
Aborder le retrait ou la fermeture émotionnelle :
- Reconnaître le désengagement.
- Faire référence aux difficultés concernées ({{IN_SCOPE_CHALLENGES}}).
- Maintenir un langage réfléchi, sécurisant et minimaliste.
`.trim(),

  [SESSION_MODULES.RESISTANCE_PUSHBACK]: `
Aborder la résistance ou l’opposition :
- Nommer clairement la résistance.
- Faire référence aux difficultés concernées ({{IN_SCOPE_CHALLENGES}}) et aux thèmes récurrents.
- Rester curieux et non défensif.
`.trim(),

  [SESSION_MODULES.VALIDATE]: `
Refléter les émotions de l’utilisateur :
- Reproduire l’état émotionnel et son intensité.
- Utiliser les mots de l’utilisateur pour souligner les sentiments essentiels.
- Faire référence aux difficultés concernées ({{IN_SCOPE_CHALLENGES}}) lorsque c’est pertinent.
- Se concentrer sur la clarté émotionnelle plutôt que sur le réconfort.
`.trim(),

  [SESSION_MODULES.REFLECTIVE_CATALYST]: `
Réanimer l’engagement lorsque la réflexion devient trop intellectuelle :
- Remettre doucement en question le *coût* de la suranalyse, pas la personne.
- Utiliser un langage concret et sensoriel plutôt que des métaphores abstraites.
- Relier la compréhension cognitive à la conscience corporelle directe.
- Introduire des perspectives inattendues pour rompre les boucles d’analyse.
- Maintenir un ton chaleureux et curieux ; conclure par une observation de l’instant présent.
- Exemple : « Quand la pensée remplace le ressenti, que remarques-tu dans ton corps maintenant ? »
`.trim(),
};

const PROCESS_MODULE_INSTRUCTIONS: Record<AppLocales, Record<ProcessModule, string>> = {
  ar: PROCESS_MODULE_INSTRUCTIONS_AR,
  en: PROCESS_MODULE_INSTRUCTIONS_EN,
  fr: PROCESS_MODULE_INSTRUCTIONS_FR,
};
export default PROCESS_MODULE_INSTRUCTIONS;
