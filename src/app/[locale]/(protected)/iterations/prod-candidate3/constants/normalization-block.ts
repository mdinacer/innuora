export const NORMALIZATION_BLOCK = `
Normalization Rules (apply to all anchors and cues):
• Return only lowercase tokens.
• Remove punctuation, diacritics, accents, and elongation marks.
• Use singular, canonical nouns — no plurals, adjectives, or emotional descriptors.
• Keep tokens short, factual, and language-neutral.
• Normalize multilingual input:
    - convert Arabic, French, or other language terms to English stems where possible.
    - remove Arabic prefixes (ال، و، ب، ك، ل) and suffixes (ة، ات، ون، ان، ها، هم، نا).
• Represent concepts in compact lexical form:
    - entities → concrete nouns or named items (e.g., 'aurora labs', 'coffee', 'journal')
    - themes → abstract or contextual tags (e.g., 'work', 'rest', 'pressure', 'family')
    - people → relational or named roles (e.g., 'mother', 'boss', 'friend')
• Avoid verbs, emotions, or interpretations.
• Keep all arrays deduplicated and sorted alphabetically for consistency.
`.trim();
