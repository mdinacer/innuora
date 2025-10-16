import { AppLocales } from "@/lib/i18n";

// •	temperature: 0.7–0.85
// •	max_tokens: 90–120
// •	top_p: 0.9
// •	frequency_penalty: 0.3
// •	presence_penalty: 0.4

export const SESSION_TITLE_GENERATE_PROMPT_LOCALIZED: Record<AppLocales, string> = {
  en: `
  Generate a concise, emotionally intelligent **title (3–6 words)** and **subtitle (8–15 words)** for an Innuora session.

## Context
{{session_messages}} 

## Objective
- Reflect the main emotional theme and user insight
- Titles: natural, short, introspective (no clichés)
- Subtitles: describe the emotional shift or realization
- No clinical or diagnostic terms
- No explanations — output only JSON:
{
  \"title\": \"string\",
  \"subtitle\": \"string\"
}

## Examples
{
  \"title\": \"When Doing Isn’t Living\",
  \"subtitle\": \"Exploring the quiet exhaustion beneath constant achievement.\"
}
{
  \"title\": \"Letting the Guard Down\",
  \"subtitle\": \"From cautious control to a moment of honesty.\"
}
  `.trim(),
  fr: `
  Génère un titre concis et émotionnellement intelligent (3 à 6 mots) et un sous-titre (8 à 15 mots) pour une session Innuora.

## Contexte
{{session_messages}} 

## Objectif
- Refléter le thème émotionnel principal et la prise de conscience de l’utilisatrice
- Titres : naturels, courts, introspectifs (sans clichés)
- Sous-titres : décrivent le changement émotionnel ou la réalisation vécue
- Pas de termes cliniques ou diagnostiques
- Aucune explication — renvoie uniquement le JSON suivant :
{
  \"title\": \"string\",
  \"subtitle\": \"string\"
}

## Exemples
{
  \"title\": \"Quand faire ne suffit plus\",
  \"subtitle\": \"Explorer l’épuisement silencieux caché derrière la performance constante.\"
}
{
  \"title\": \"Baisser la garde\",
  \"subtitle\": \"Du contrôle prudent à un moment d’honnêteté.\"
}
  `.trim(),
  ar: `

أنشئ عنوانًا موجزًا وذكيًا عاطفيًا (من 3 إلى 6 كلمات) وعبارة فرعية (من 8 إلى 15 كلمة) لجلسة Innuora.


## السياق
{{session_messages}}

## الهدف
- عكس الموضوع العاطفي الرئيسي والبصيرة التي توصّل إليها المستخدم
- العناوين: طبيعية، قصيرة، تأملية، دون عبارات مبتذلة
- العبارات الفرعية: تصف التحول العاطفي أو الوعي الذي حدث
- لا تستخدم مصطلحات سريرية أو تشخيصية
- لا تقدم أي تفسيرات — أعد المخرجات بصيغة JSON فقط:
{
  \"title\": \"string\",
  \"subtitle\": \"string\"
}

## أمثلة
{
  \"title\": \"عندما لا يعني الإنجاز الحياة\",
  \"subtitle\": \"اكتشاف الإرهاق الهادئ خلف السعي المستمر.\"
}
{
  \"title\": \"حين نخفّض الحراسة\",
  \"subtitle\": \"من تحكمٍ حذر إلى لحظة صدق.\"
}
  `.trim(),
};
