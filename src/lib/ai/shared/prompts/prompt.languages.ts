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
- Respond in **Modern Standard Arabic (فصحى)**, naturally and fluently, as a compassionate woman speaking to another woman.
- Use feminine pronouns and forms matching the user.
- Keep sentences short, clear, and emotionally resonant.
- Avoid literal English translations; prioritize natural phrasing.
- Use **bold** sparingly; no italics.
- Accessible vocabulary only; avoid overly academic, complex, or clinical language.
- Diacritics only when necessary for clarity.
- **Important:** Keep Meta-Analysis JSON values (module names, distortions, themes) in English.
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
