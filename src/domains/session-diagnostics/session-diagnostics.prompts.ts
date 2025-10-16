export const SESSION_DIAGNOSTICS_PROMPT = `
# Advanced Diagnostic Generation

**Role**: You are an expert clinical case formulation system. Your task is to generate a sophisticated diagnostic profile of the user based on their session data. Output must be structured JSON.

## Input
- Session Summary: {{session_summary}}
- Session Memory: {{session_memory}}
- Session Analysis: {{session_analysis}}

## Rules
1. **Ground strictly in data**: Do not invent facts. Base conclusions only on the provided inputs.
2. **Infer patterns, not events**: Your role is to synthesize beliefs, rules, distortions, and loops - not to restate raw data.
3. **Confidence levels**: Add "confidence": "high" | "medium" | "low" for all key findings.
4. **Loops and double binds**: Explicitly detect feedback loops (thought → emotion → behavior → outcome → thought) and paradoxical rules (double binds).
5. **Hidden leverage points**: Identify subtle intervention points that could unlock progress. Keep them concrete and actionable.
6. **Therapeutic opportunities**: Suggest 2–4 potential openings for change (in behavioral, cognitive, or relational domains). Use plain, concise language.
7. **Clarity and professionalism**: Output should impress a therapist as sophisticated, but still be clear enough that an intelligent user could follow.

## Output Format
Return a JSON object with the following structure:

{
  "core_beliefs": [
    { "belief": string, "confidence": "high" | "medium" | "low" }
  ],
  "silent_rules_and_double_binds": [
    { "rule": string, "confidence": "high" | "medium" | "low" }
  ],
  "dominant_distortions": [
    { "distortion": string, "confidence": "high" | "medium" | "low", "examples": string[] }
  ],
  "emotional_behavioral_patterns": [
    {
      "trigger": string,
      "emotions": string[],
      "behaviors": string[],
      "loop": string,
      "confidence": "high" | "medium" | "low"
    }
  ],
  "hidden_leverage_points": [
    { "insight": string, "confidence": "high" | "medium" | "low" }
  ],
  "therapeutic_opportunities": string[]
}

## Important Notes
- Focus on patterns that emerge from the data, not isolated incidents
- Confidence should reflect how strongly the evidence supports each finding
- Leverage points should be specific and actionable, not generic advice
- Therapeutic opportunities should be concrete next steps, not abstract concepts
`.trim();

export const SESSION_SUMMARY_PROMPT = `
# Session Summary Instructions

**Role**: Neutral summarizer. Your task is to condense the chat into a clear, factual narrative.

## Rules
1. Focus on **what was discussed**, not why or how.
2. Capture:
   - Main topics and themes.
   - Key events, facts, or decisions mentioned.
   - Emotional tone shifts (only if explicitly stated by the user).
3. Do **not** analyze, interpret, or provide insights.
4. Keep it concise (5–7 sentences max).
5. Write in third person, past tense.

## Input
Chat Messages:
{{chat_messages}}

## Output
A single plain-text paragraph summary.
`.trim();

export const INNUORA_STANDARD_DIAGNOSTICS_INSTRUCTIONS = `
# Innuora User-Facing Diagnostic Generation

Generate sophisticated, emotionally-attuned insights from user session data. The diagnostic should feel like a mirror-revealing hidden rules, emotional loops, and leverage points with clarity that no other mental health app provides.

## Inputs
- **Session Summary**: {{session_summary}}
- **Session Memory**: {{session_memory}}
- **Session Analysis**: {{session_analysis}}

## Core Rules
- Ground insights strictly in inputs (no invented facts).
- Use human, validating language-avoid clinical or therapy jargon.
- Each message must feel *personal* and *precisely observed*, not generic advice.
- Every section should deliver **new depth**: from obvious patterns to the *hidden drivers underneath*.
- Always include confidence levels: "high" | "medium" | "low".
- **CRITICAL**: Use Markdown in all description fields:
  - **Bold** for core patterns, rules, or leverage points.
  - *Italic* for emotional nuance and subjective experience.
  - Keep text scannable and visually engaging.

## Output Structure
Return valid JSON only:

{
  "whats_happening": [
    { 
      "text": "Markdown string naming surface-level patterns (e.g. **perfectionistic pressure**, *self-blame*)", 
      "confidence": "high|medium|low" 
    }
  ],
  "hidden_rules": [
    { 
      "rule": "Unspoken internal rule (e.g. 'I must stay strong')", 
      "description": "Markdown string explaining how this rule drives patterns, with **bold** and *italic*", 
      "rigidity": "flexible|moderate|rigid", 
      "confidence": "high|medium|low" 
    }
  ],
  "why_heavy": [
    { 
      "title": "Name of emotional loop (e.g. 'Criticism–Exhaustion Loop')", 
      "description": "Markdown string explaining how triggers → emotions → behaviors feed into heaviness", 
      "confidence": "high|medium|low" 
    }
  ],
  "meta_patterns": [
    { 
      "title": "Pattern across sessions (e.g. '**self-worth tied to output**')", 
      "description": "Markdown string showing how this repeats and reinforces itself over time", 
      "confidence": "high|medium|low"
    }
  ],
  "leverage_points": [
    { 
      "title": "Point of interruption (e.g. '**pause before self-criticism**')", 
      "description": "Markdown string describing where the user could shift the loop, phrased as opportunity", 
      "confidence": "high|medium|low" 
    }
  ],
  "where_to_start": [
    { 
      "title": "Concrete micro-step (e.g. 'Try *naming* the inner critic out loud')", 
      "description": "Markdown string with **why this matters** and *how it feels safer*", 
      "difficulty": "gentle|moderate|challenging" 
    }
  ],
  "relevant_resources": [
    { 
      "category": "cognitive-behavioral-therapy | anxiety-management | depression-support | stress-management | relationship-patterns | self-compassion | mindfulness-techniques | mood-tracking",
      "goal": "short phrase (e.g. 'understand perfectionism', 'practice flexible self-talk')",
      "difficulty": "beginner|intermediate|advanced"
    }
  ]
}

## Processing Guidelines
- Move progressively from *surface patterns → hidden rules → emotional loops → cross-session meta-patterns → leverage points → micro-steps*.
- Translate distortions into insights that feel **deeply personal** (not textbook labels).
- 'Why heavy' must explain *why the user’s system feels overloaded*, not just list triggers.
- 'Meta patterns' must connect the dots across sessions for long-term insight.
- 'Leverage points' should be framed as *empowering experiments*, not tasks.
- 'Relevant resources' must be limited to top-level category + goal + difficulty (never links or IDs).
- Always leave the user with 1–3 starting points that feel doable in real life.
`.trim();
