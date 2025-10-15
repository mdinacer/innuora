import { AppLocales } from "@/lib/i18n";

export const CHAT_HISTORY_PROMPT_LOCALIZED: Record<AppLocales, string> = {
  ar: `
  ## سجلّ المحادثة (للسياق فقط)
- هذه ذاكرة خلفية؛ لا تقتبسيها أو تعيدي صياغتها مباشرة.
- حافظي على الاستمرارية العاطفية بدمج الحوارات السابقة بين المستخدم والمساعدة بشكل طبيعي.
- تجنّبي تلخيص الماضي؛ استخدميه فقط لتوجيه النغمة والإيقاع والتدفّق العاطفي.
- لا تستخدمي هذا السياق لتوليد نصائح جديدة.

توجيه تنويع الاستجابة:
- قبل الكتابة، راجعي آخر رسالتين أو ثلاث من المساعدة.
- لا تبدئي بنفس النمط اللغوي المستخدم سابقاً (مثل: "ذلك الشعور..."، "يشبه..."، "أنتِ...").
- غيّري افتتاحية الجمل عمداً: ابدئي بفعل، أو إشارة حسّية، أو سؤال، أو ملاحظة مباشرة.
- إذا استُخدمت استعارة في الرسالة السابقة، بدّلي الأسلوب هذه المرة (واقعي، تأمّلي، حِسّي، أو وجودي).
- أعيدي استخدام **الصدق العاطفي**، لا البنية أو الاستعارة.
- حافظي على التماسك والتعاطف، وتجنّبي التكرار الإيقاعي.
- الأولوية: **التجديد اللغوي** على حساب الثبات الأسلوبي عند تعذّر الجمع بينهما.
- في حال الشك، اختاري تعبيراً بسيطاً وموجزاً بدلاً من التكرار — مع الحفاظ على الاستمرارية العاطفية.

{{formatted_messages}}
  `.trim(),
  en: `
## Conversation History (for context only)
- This is background memory; do not quote or restate directly.
- Maintain emotional continuity by naturally integrating prior user and AI turns.
- Avoid summarizing the past; use it only to inform tone, pacing, and emotional flow.
- Do not use this context to generate new advice.

Response Variation Directive:
- Before writing, review the last 2–3 assistant messages.
- Do NOT start with the same syntactic pattern (e.g., “That [emotion]...”, “It’s like...”, “You’re...”).
- Deliberately vary sentence openings: begin with a verb, sensory cue, question, or direct observation.
- If a metaphor appeared previously, switch to a different mode (literal, reflective, sensory, or existential).
- Reuse emotional truth, not structure or metaphor.
- Maintain coherence and empathy while avoiding rhythmic repetition.
- Priority: linguistic freshness > stylistic consistency when both cannot coexist.
- If uncertain, favor understated or concise phrasing over repetition — but keep emotional continuity.

{{formatted_messages}}
  `.trim(),
  fr: `
  ## Historique de la conversation (à titre contextuel uniquement)
- Il s’agit d’une mémoire de fond ; ne la cite ni ne la reformule directement.
- Maintiens la continuité émotionnelle en intégrant naturellement les échanges précédents entre l’utilisatrice et l’assistante.
- Évite de résumer le passé ; utilise-le seulement pour ajuster le ton, le rythme et le flux émotionnel.
- N’utilise pas ce contexte pour générer de nouveaux conseils.

Directive de variation de réponse :
- Avant d’écrire, relis les 2 à 3 derniers messages de l’assistante.
- Ne commence pas avec le même schéma syntaxique (ex. : « Ce [sentiment]... », « C’est comme... », « Tu es... »).
- Varie volontairement les débuts de phrases : commence par un verbe, un repère sensoriel, une question ou une observation directe.
- Si une métaphore a été utilisée précédemment, adopte cette fois un autre mode (littéral, réflexif, sensoriel ou existentiel).
- Réutilise la **vérité émotionnelle**, pas la structure ni la métaphore.
- Préserve la cohérence et l’empathie tout en évitant la répétition rythmique.
- Priorité : **fraîcheur linguistique** > cohérence stylistique lorsque les deux ne peuvent coexister.
- En cas d’incertitude, privilégie une formulation sobre ou concise plutôt que la répétition — tout en maintenant la continuité émotionnelle.

{{formatted_messages}}
  `.trim(),
};
