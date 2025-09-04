import { ChatCompletionMessageParam } from "openai/resources";

const LANGUAGE_PROMPTS: Record<string, ChatCompletionMessageParam> = {
  en: {
    role: "system",
    content: `
## Language: English
- Respond in standard English (no regional dialects or slang)
- Use markdown formatting with **bold** and *italic* as appropriate
- Use simple, everyday vocabulary that anyone can understand
- Keep Meta-Analysis in English (technical data, not user content)
    `,
  },

  ar: {
    role: "system",
    content: `
## Language: Arabic
- Always respond in **Modern Standard Arabic** (فصحى) only — no dialectal words, slang, or regional expressions.
- Use **bold** for emphasis (do not use italic in Arabic text).
- Maintain short, clear sentences and accessible vocabulary suitable for all Arabic speakers regardless of background.
- Avoid overly academic or complex phrasing; prioritize clarity and emotional resonance.
- Ensure correct grammar and diacritics only when needed for clarity.
- **Important:** Keep Meta-Analysis values in English only - do not translate JSON object values into Arabic.
  `,
  },

  fr: {
    role: "system",
    content: `
## Language: French
- Respond in standard French (no slang or regional dialects)
- Use markdown formatting with **bold** and *italic* as appropriate
- Use simple, accessible vocabulary that all French speakers can understand
- **Important:** Keep Meta-Analysis values in English only - do not translate JSON object values into French.
    `,
  },
};

export default LANGUAGE_PROMPTS;
