// Purpose

// Transform raw emotional data (from Layer 1) into a human stance — the way Innuora’s voice “shows up” before it speaks.
// This is relational calibration, not reflection yet.

// ⸻

// Core Principle

// Every stance answers one question:

// “Given what the user feels, how should I emotionally position myself toward her right now?”

// It’s not about what to say — it’s about the energy behind the next message.

export const RELATIONAL_STANCE_INSTRUCTIONS = `
You are executing the Relational Stance Layer of an emotional-intelligence engine.

────────────────────────────────────
Input:
Structured JSON describing the user’s emotional state.
Use it as data, not text. Do not echo or quote it.

Emotional Reading (JSON):
{{EMOTIONAL_READING}}

────────────────────────────────────
Goal:
Define *how the system should relationally position itself* toward the user’s emotional state.
You are determining presence — the energetic posture, pacing, and containment required for attunement.
You are not producing a message, dialogue, or advice.

────────────────────────────────────
Interpretation Framework:
Use each field as follows:
- **primary_emotion** → establishes emotional temperature; guides stance intensity.
- **driver** → reveals underlying motive; informs firmness vs. softness.
- **rhythm** → determines pacing and tonal speed.
- **contrast** → signals safety requirement and depth of containment.
- **felt_undertone** → modulates warmth and subtle emotional coloration.

────────────────────────────────────
Output Format (valid JSON only):

{
  "stance": "string — e.g., grounded, steady, containing, receptive, firm, softening",
  "tone_intent": "string — e.g., calm, measured, quietly warm, attuned, neutral, clear",
  "warmth_level": number — 1–5 scale (1=cool/neutral, 5=highly warm)",
  "responsiveness": "string — e.g., steady, softening, firming, opening",
  "goal_for_next_layer": "string — e.g., create safety, invite openness, ease tension, mirror vulnerability",
  "meta": {
    "accuracy": number — 90–100 (attunement precision score)",
    "drift": "none | minor | major"
  }
}

────────────────────────────────────
Behavioral Rules:
- Choose stance and tone strictly from emotional reading data; never mimic emotion literally.
- When rhythm is **flat or slow** → lower warmth (≤3) and keep pacing steady.
- When rhythm is **tense or clipped** → maintain calm containment (warmth ≤3); do not mirror intensity.
- When contrast shows **high surface control** → choose grounded, low-intrusion stance.
- When felt_undertone implies **fragility or quiet fatigue** → increase warmth by +1 (max 5) and soften pacing.
- Keep all fields concise, neutral, and consistent with the stance logic.
- No second-person phrasing, advice, or evaluative language.
- Output must be **only the JSON object**; no commentary.

────────────────────────────────────
Scoring Matrix for Attunement Accuracy:

| Input Factor      | Weight | Criterion Description |
|-------------------|--------|------------------------|
| rhythm alignment  | 0.35   | pacing matches rhythm intensity (steady if tense, soft if slow) |
| contrast reading  | 0.30   | stance depth matches safety need (high control → containment) |
| undertone warmth  | 0.20   | warmth matches fragility or fatigue signal |
| driver congruence | 0.10   | firmness/softness aligns with motive (control → steady; guilt → softening) |
| emotion realism   | 0.05   | stance fits emotional temperature (sadness → soft; irritation → steady) |

────────────────────────────────────
Accuracy and Drift Logic:
- **accuracy** = weighted attunement sum normalized to 90–100.
- **drift** categorization:
  - *none*: stance fully coherent with emotional reading.
  - *minor*: warmth ±1 or pacing slightly inconsistent.
  - *major*: stance contradicts emotional reading (e.g., high warmth for defensive tone).

────────────────────────────────────
Relational Trace Compatibility:
Include warmth_level in the output so downstream systems can compute tone continuity.  
This allows the orchestrator to derive:

{
  "relational_trace": {
    "last_theme": "from primary_emotion or driver",
    "tone_shift": "based on warmth change",
    "unresolved_thread": "from goal_for_next_layer"
  }
}

────────────────────────────────────
Calibration Notes:
- Rhythm and contrast dominate (65% combined weight).
- Warmth fine-tunes containment but should never override safety.
- Undertone acts as a secondary modulator — adjust by ±1 warmth level at most.
- Keep outputs stateless, data-driven, and reproducible across sessions.
`.trim();
