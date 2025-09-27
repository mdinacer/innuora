import { SESSION_MODULES, UtilityModule } from "@/domains/cbt-modules/constants";
import { AppLocales } from "@/lib/i18n";

// const UTILITY_MODULE_INSTRUCTIONS = {
//   [SESSION_MODULES.GUIDANCE]: `
// - Suggest 1-3 small, concrete, optional steps aligned with {{THEMES}}, {{STATE}}, and in-scope challenges ({{IN_SCOPE_CHALLENGES}}).
// - Keep low-effort, realistic, and non-demanding (micro-actions, grounding, journaling).
// - Present as invitations, not prescriptions.
// `.trim(),

//   [SESSION_MODULES.PATTERN]: `
// - Identify one recurring theme, feeling, or behavior across situations ({{THEMES}}), including in-scope challenges ({{IN_SCOPE_CHALLENGES}}).
// - Name it clearly in user's own words, avoiding abstraction.
// - End with one concise, open-ended question that invites reflection.
// `.trim(),

//   [SESSION_MODULES.PSYCHOEDUCATION]: `
// - Provide a short, plain explanation (2-3 sentences) of one relevant concept from in-scope challenges ({{IN_SCOPE_CHALLENGES}}).
// - Tie it directly to current struggle or {{THEMES}} for resonance.
// - Keep conversational; avoid jargon or over-teaching.
// - End with one reflective question linking the concept to their experience.
// `.trim(),

//   [SESSION_MODULES.FIRST_TIME]: `
// Acknowledge the start of a new session with warmth that feels human but not generic.
// Offer a simple reflection if the user shares anything, even brief, to establish ${APP_CONFIG.name}'s role as a mirror.
// Invite them to share what feels most present, without pressure.
// Use only one open-ended question, and always after a reflection.
// Avoid analysis-heavy responses, multiple questions, or broad advice at this stage.
// Tone should be calm, grounded, and emotionally attuned - warm but not saccharine.
// `.trim(),

//   [SESSION_MODULES.BEHAVIORAL]: `
// Identify a distorted belief or fear in the user's words ({{DISTORTIONS}}, {{CORE_BELIEFS}}).
// Suggest one small, concrete, optional action that could gently test the belief in real life.
// Frame the action as an experiment, not a demand; emphasize curiosity over success/failure.
// Keep the step very small and realistic (e.g., one follow-up, one conversation, one note).
// Reflect how taking this step might bring new evidence or relief, while validating current fears.
// Never overwhelm the user with multiple tasks; limit to a single suggestion.
// `.trim(),

//   [SESSION_MODULES.PATTERN_WHY]: `
// Identify recurring connections between {{THEMES}}, {{CORE_BELIEFS}}, and {{BEHAVIORAL_PATTERNS}} in the user's experience.
// Formulate a single, clear observation about a potential link. NEVER state it as a fact or diagnosis.
// Pose it as a curious, open-ended question for the user to reflect upon.
// Example: "I've noticed you often mention feeling like a burden [THEME] after you've helped others [BEHAVIORAL PATTERN]. I wonder if there's a connection there for you between giving help and feeling drained?"
// This must feel like a gentle invitation to explore, not a pronouncement from the AI.`,
// };

const UTILITY_MODULE_INSTRUCTIONS_EN: Record<UtilityModule, string> = {
  [SESSION_MODULES.GUIDANCE]: `
Suggest 1-3 small, optional steps.
Steps should be low-effort and realistic (micro-actions, grounding, journaling).
Present actions as optional, not required.
Reference in-scope challenges ({{IN_SCOPE_CHALLENGES}}) when relevant.
`.trim(),

  [SESSION_MODULES.PATTERN]: `
Identify one recurring theme, feeling, or behavior across situations.
Name it clearly in user's own words.
End with one concise, open-ended reflection question.
Reference in-scope challenges ({{IN_SCOPE_CHALLENGES}}) when relevant.
`.trim(),

  [SESSION_MODULES.PSYCHOEDUCATION]: `
Provide a brief explanation (2-3 sentences) of a relevant concept.
Tie it directly to the user's current struggle.
End with one reflective question linking the concept to their experience.
Reference in-scope challenges ({{IN_SCOPE_CHALLENGES}}) when relevant.
`.trim(),

  [SESSION_MODULES.FIRST_TIME]: `
Acknowledge start of session.
Offer a simple reflection if user shares anything.
Invite them to share what feels most present.
Use only one open-ended question after a reflection.
Avoid analysis-heavy responses, multiple questions, or broad advice at this stage.
`.trim(),

  [SESSION_MODULES.BEHAVIORAL]: `
Identify a distorted belief or fear in user's words.
Suggest one small, optional action to test the belief in real life.
Frame the action as an experiment, not a demand.
Keep the step small and realistic (one follow-up, conversation, or note).
Reflect how the step might provide new insight or relief.
Limit to a single suggestion; avoid multiple tasks.
Reference in-scope challenges ({{IN_SCOPE_CHALLENGES}}) when relevant.
`.trim(),

  [SESSION_MODULES.PATTERN_WHY]: `
Identify recurring connections between experiences, beliefs, and behavioral patterns.
Formulate a single, clear observation about a potential link without stating it as fact or diagnosis.
Pose one open-ended reflection question for the user.
Reference in-scope challenges ({{IN_SCOPE_CHALLENGES}}) when relevant.
`.trim(),
};

// === Arabic ===
const UTILITY_MODULE_INSTRUCTIONS_AR: Record<UtilityModule, string> = {
  [SESSION_MODULES.GUIDANCE]: `
اقترح 1-3 خطوات صغيرة اختيارية.
يجب أن تكون الخطوات منخفضة الجهد وواقعية (تجارب صغيرة، تمارين تأمل، كتابة يومية).
اعرضها كخيارات، وليست متطلبات.
أشر إلى التحديات ضمن النطاق ({{IN_SCOPE_CHALLENGES}}) عند الحاجة.
`.trim(),

  [SESSION_MODULES.PATTERN]: `
حدد نمطًا متكررًا واحدًا من المشاعر أو السلوكيات عبر المواقف.
سميه بوضوح بكلمات المستخدم.
اختم بسؤال مفتوح قصير للتفكير.
أشر إلى التحديات ضمن النطاق ({{IN_SCOPE_CHALLENGES}}) عند الحاجة.
`.trim(),

  [SESSION_MODULES.PSYCHOEDUCATION]: `
قدّم شرحًا مختصرًا (2-3 جمل) لمفهوم ذي صلة.
اربطه مباشرة بصراع المستخدم الحالي.
اختم بسؤال تأملي يربط المفهوم بتجربته.
أشر إلى التحديات ضمن النطاق ({{IN_SCOPE_CHALLENGES}}) عند الحاجة.
`.trim(),

  [SESSION_MODULES.FIRST_TIME]: `
اعترف ببداية الجلسة.
قدّم انعكاسًا بسيطًا إذا شارك المستخدم أي شيء.
ادعه لمشاركة ما يشعر به أكثر في الوقت الحالي.
استخدم سؤالًا مفتوحًا واحدًا فقط بعد الانعكاس.
تجنب الردود التحليلية الثقيلة، الأسئلة المتعددة، أو النصائح العامة في هذه المرحلة.
`.trim(),

  [SESSION_MODULES.BEHAVIORAL]: `
حدد معتقدًا مشوهًا أو خوفًا في كلمات المستخدم.
اقترح خطوة صغيرة اختيارية لاختبار المعتقد في الحياة الواقعية.
اعرضها كتجربة، وليس كمتطلب.
اجعل الخطوة صغيرة وواقعية (متابعة واحدة، محادثة، أو تدوين).
اعكس كيف يمكن أن توفر هذه الخطوة فهمًا جديدًا أو راحة.
حدّد اقتراحًا واحدًا فقط؛ تجنب تعدد المهام.
أشر إلى التحديات ضمن النطاق ({{IN_SCOPE_CHALLENGES}}) عند الحاجة.
`.trim(),

  [SESSION_MODULES.PATTERN_WHY]: `
حدد الروابط المتكررة بين التجارب والمعتقدات والأنماط السلوكية.
صغ ملاحظة واحدة واضحة عن علاقة محتملة بدون تقديمها كحقيقة أو تشخيص.
اطرح سؤالًا مفتوحًا للتفكير على المستخدم.
أشر إلى التحديات ضمن النطاق ({{IN_SCOPE_CHALLENGES}}) عند الحاجة.
`.trim(),
};

// === French ===
const UTILITY_MODULE_INSTRUCTIONS_FR: Record<UtilityModule, string> = {
  [SESSION_MODULES.GUIDANCE]: `
Suggérez 1 à 3 petites étapes optionnelles.
Les étapes doivent être peu exigeantes et réalistes (micro-actions, ancrage, journalisation).
Présentez-les comme des invitations, non des obligations.
Faites référence aux défis dans le périmètre ({{IN_SCOPE_CHALLENGES}}) si pertinent.
`.trim(),

  [SESSION_MODULES.PATTERN]: `
Identifiez un thème, sentiment ou comportement récurrent.
Nommer clairement avec les mots de l'utilisateur.
Terminez par une question ouverte et concise pour réflexion.
Faites référence aux défis dans le périmètre ({{IN_SCOPE_CHALLENGES}}) si pertinent.
`.trim(),

  [SESSION_MODULES.PSYCHOEDUCATION]: `
Fournissez une brève explication (2-3 phrases) d'un concept pertinent.
Reliez-le directement à la lutte actuelle de l'utilisateur.
Terminez par une question réfléchie liant le concept à son expérience.
Faites référence aux défis dans le périmètre ({{IN_SCOPE_CHALLENGES}}) si pertinent.
`.trim(),

  [SESSION_MODULES.FIRST_TIME]: `
Reconnaître le début de la session.
Offrir une réflexion simple si l'utilisateur partage quelque chose.
Invitez-le à partager ce qui est le plus présent pour lui.
Utilisez une seule question ouverte après la réflexion.
Évitez les réponses analytiques lourdes, les multiples questions ou les conseils généraux à ce stade.
`.trim(),

  [SESSION_MODULES.BEHAVIORAL]: `
Identifiez une croyance déformée ou une peur dans les mots de l'utilisateur.
Suggérez une petite action optionnelle pour tester la croyance dans la vie réelle.
Présentez l'action comme une expérience, pas comme une obligation.
Gardez l'étape petite et réaliste (une relance, une conversation ou une note).
Réfléchissez à la façon dont cette étape pourrait apporter un nouvel aperçu ou soulagement.
Limitez à une seule suggestion ; évitez les tâches multiples.
Faites référence aux défis dans le périmètre ({{IN_SCOPE_CHALLENGES}}) si pertinent.
`.trim(),

  [SESSION_MODULES.PATTERN_WHY]: `
Identifiez les liens récurrents entre expériences, croyances et comportements.
Formulez une observation claire sur un lien potentiel sans l'énoncer comme un fait ou un diagnostic.
Posez une question ouverte pour la réflexion de l'utilisateur.
Faites référence aux défis dans le périmètre ({{IN_SCOPE_CHALLENGES}}) si pertinent.
`.trim(),
};

// const UTILITY_MODULE_INSTRUCTIONS = {
//   [SESSION_MODULES.GUIDANCE]: `
// Suggest 1-3 small, optional steps.
// Steps should be low-effort and realistic (micro-actions, grounding, journaling).
// Present actions as optional, not required.
// Reference in-scope challenges ({{IN_SCOPE_CHALLENGES}}) when relevant.
// `.trim(),

//   [SESSION_MODULES.PATTERN]: `
// Identify one recurring theme, feeling, or behavior across situations.
// Name it clearly in user's own words.
// End with one concise, open-ended reflection question.
// Reference in-scope challenges ({{IN_SCOPE_CHALLENGES}}) when relevant.
// `.trim(),

//   [SESSION_MODULES.PSYCHOEDUCATION]: `
// Provide a brief explanation (2-3 sentences) of a relevant concept.
// Tie it directly to the user's current struggle.
// End with one reflective question linking the concept to their experience.
// Reference in-scope challenges ({{IN_SCOPE_CHALLENGES}}) when relevant.
// `.trim(),

//   [SESSION_MODULES.FIRST_TIME]: `
// Acknowledge start of session.
// Offer a simple reflection if user shares anything.
// Invite them to share what feels most present.
// Use only one open-ended question after a reflection.
// Avoid analysis-heavy responses, multiple questions, or broad advice at this stage.
// `.trim(),

//   [SESSION_MODULES.BEHAVIORAL]: `
// Identify a distorted belief or fear in user's words.
// Suggest one small, optional action to test the belief in real life.
// Frame the action as an experiment, not a demand.
// Keep the step small and realistic (one follow-up, conversation, or note).
// Reflect how the step might provide new insight or relief.
// Limit to a single suggestion; avoid multiple tasks.
// Reference in-scope challenges ({{IN_SCOPE_CHALLENGES}}) when relevant.
// `.trim(),

//   [SESSION_MODULES.PATTERN_WHY]: `
// Identify recurring connections between experiences, beliefs, and behavioral patterns.
// Formulate a single, clear observation about a potential link without stating it as fact or diagnosis.
// Pose one open-ended reflection question for the user.
// Reference in-scope challenges ({{IN_SCOPE_CHALLENGES}}) when relevant.
// `.trim(),
// };

const UTILITY_MODULE_INSTRUCTIONS: Record<AppLocales, Record<UtilityModule, string>> = {
  ar: UTILITY_MODULE_INSTRUCTIONS_AR,
  en: UTILITY_MODULE_INSTRUCTIONS_EN,
  fr: UTILITY_MODULE_INSTRUCTIONS_FR,
};

export default UTILITY_MODULE_INSTRUCTIONS;
