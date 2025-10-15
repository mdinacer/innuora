import { SESSION_MODULES, UtilityModule } from "@/domains/cbt-modules/constants";
import { AppLocales } from "@/lib/i18n";

// === English ===
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
اقترح من ١ إلى ٣ خطوات صغيرة اختيارية.
يُفَضَّل أن تكون الخطوات بسيطة وواقعية (مثل إجراءات صغيرة، تمارين تهدئة، أو كتابة تأملية).
قدِّم الأفعال كخيارات، وليست التزامات.
أشِر إلى التحديات ذات الصلة ({{IN_SCOPE_CHALLENGES}}) عند الاقتضاء.
`.trim(),

  [SESSION_MODULES.PATTERN]: `
حدِّد نمطاً متكرراً واحداً — شعوراً أو سلوكاً أو موضوعاً يظهر عبر مواقف مختلفة.
سمِّه بوضوح باستخدام كلمات المستخدم نفسها.
اختم بسؤال تأملي مفتوح وموجز.
أشِر إلى التحديات ذات الصلة ({{IN_SCOPE_CHALLENGES}}) عند الاقتضاء.
`.trim(),

  [SESSION_MODULES.PSYCHOEDUCATION]: `
قدِّم شرحاً موجزاً (في ٢ إلى ٣ جمل) لمفهوم ذي صلة.
اربط المفهوم مباشرة بما يواجهه المستخدم حالياً.
اختم بسؤال تأملي يربط المفهوم بتجربة المستخدم.
أشِر إلى التحديات ذات الصلة ({{IN_SCOPE_CHALLENGES}}) عند الاقتضاء.
`.trim(),

  [SESSION_MODULES.FIRST_TIME]: `
اعترف ببداية الجلسة.
قدِّم انعكاساً بسيطاً إذا شارك المستخدم أي شيء.
ادعه لمشاركة ما يشعر أنه الأهم في هذه اللحظة.
استخدم سؤالاً واحداً مفتوحاً فقط بعد الانعكاس.
تجنّب الردود التحليلية المفرطة، أو الأسئلة المتعددة، أو النصائح الواسعة في هذه المرحلة.
`.trim(),

  [SESSION_MODULES.BEHAVIORAL]: `
حدِّد اعتقاداً مشوَّهاً أو خوفاً يظهر في كلمات المستخدم.
اقترح خطوة صغيرة اختيارية لاختبار هذا الاعتقاد في الحياة الواقعية.
قدِّم الخطوة كتجربة، لا كواجب.
اجعلها بسيطة وواقعية (مثل متابعة واحدة، محادثة، أو ملاحظة قصيرة).
اشرح كيف يمكن أن توفر هذه الخطوة فهماً جديداً أو شعوراً بالارتياح.
اقتصر على اقتراح واحد فقط؛ تجنّب إعطاء مهام متعددة.
أشِر إلى التحديات ذات الصلة ({{IN_SCOPE_CHALLENGES}}) عند الاقتضاء.
`.trim(),

  [SESSION_MODULES.PATTERN_WHY]: `
حدِّد الروابط المتكررة بين التجارب والمعتقدات والأنماط السلوكية.
كوِّن ملاحظة واحدة واضحة حول علاقة محتملة دون تقديمها كحقيقة أو تشخيص.
اطرح سؤالاً واحداً مفتوحاً للتأمل من جانب المستخدم.
أشِر إلى التحديات ذات الصلة ({{IN_SCOPE_CHALLENGES}}) عند الاقتضاء.
`.trim(),
};

// === French ===
const UTILITY_MODULE_INSTRUCTIONS_FR: Record<UtilityModule, string> = {
  [SESSION_MODULES.GUIDANCE]: `
Suggérer 1 à 3 petites étapes optionnelles.  
Les étapes doivent être simples et réalistes (micro-actions, ancrage, écriture réflexive).  
Présenter les actions comme des choix, non comme des obligations.  
Faire référence aux défis concernés ({{IN_SCOPE_CHALLENGES}}) lorsque pertinent.
`.trim(),

  [SESSION_MODULES.PATTERN]: `
Identifier un thème, un sentiment ou un comportement récurrent à travers différentes situations.  
Le nommer clairement en utilisant les mots de l’utilisateur.  
Terminer par une question réflexive ouverte et concise.  
Faire référence aux défis concernés ({{IN_SCOPE_CHALLENGES}}) lorsque pertinent.
`.trim(),

  [SESSION_MODULES.PSYCHOEDUCATION]: `
Fournir une brève explication (2 à 3 phrases) d’un concept pertinent.  
La relier directement à la difficulté actuelle de l’utilisateur.  
Terminer par une question réflexive reliant le concept à son expérience.  
Faire référence aux défis concernés ({{IN_SCOPE_CHALLENGES}}) lorsque pertinent.
`.trim(),

  [SESSION_MODULES.FIRST_TIME]: `
Reconnaître le début de la session.  
Offrir une brève réflexion si l’utilisateur partage quelque chose.  
L’inviter à exprimer ce qui lui semble le plus présent.  
Utiliser une seule question ouverte après la réflexion.  
Éviter les réponses analytiques, les multiples questions ou les conseils généraux à ce stade.
`.trim(),

  [SESSION_MODULES.BEHAVIORAL]: `
Identifier une croyance déformée ou une peur dans les propos de l’utilisateur.  
Proposer une petite action optionnelle pour tester cette croyance dans la vie réelle.  
Présenter l’action comme une expérience, non comme une exigence.  
Garder l’étape simple et réaliste (un suivi, une conversation ou une note).  
Montrer comment cette action pourrait offrir une nouvelle compréhension ou un soulagement.  
Se limiter à une seule suggestion ; éviter de multiples tâches.  
Faire référence aux défis concernés ({{IN_SCOPE_CHALLENGES}}) lorsque pertinent.
`.trim(),

  [SESSION_MODULES.PATTERN_WHY]: `
Identifier les liens récurrents entre les expériences, les croyances et les schémas comportementaux.  
Formuler une seule observation claire sur un lien possible sans la présenter comme un fait ou un diagnostic.  
Poser une question réflexive ouverte à l’utilisateur.  
Faire référence aux défis concernés ({{IN_SCOPE_CHALLENGES}}) lorsque pertinent.
`.trim(),
};

const UTILITY_MODULE_INSTRUCTIONS: Record<AppLocales, Record<UtilityModule, string>> = {
  ar: UTILITY_MODULE_INSTRUCTIONS_AR,
  en: UTILITY_MODULE_INSTRUCTIONS_EN,
  fr: UTILITY_MODULE_INSTRUCTIONS_FR,
};

export default UTILITY_MODULE_INSTRUCTIONS;
