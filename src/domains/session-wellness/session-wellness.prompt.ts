import { ChatCompletionMessageParam } from "openai/resources";

export const SESSION_WELLNESS_PROMPT: ChatCompletionMessageParam = {
  role: "system",
  content: `
Session Wellness Evaluation (CBT-Informed)

Determine if this session should conclude.

Key principles:
- Repetition can signal progress (rumination → breakthrough, resistance → engagement).
- Some loops are productive; others are stagnant.

Inputs:
1. readiness_trend: improving / stuck / declining
2. rumination_trend: improving / stable / worsening
3. beliefs_emerging: true / false
4. distortion_trend: improving / stable / worsening
5. theme_evolution: deepening / stagnant

Productive loops (do NOT end):
- Rumination improving + readiness improving
- Themes deepening + new beliefs/distortions
- Resistance gradually opening

Unproductive loops (consider ending):
- Readiness stuck ≥5 turns
- No new beliefs/themes ≥8 turns
- Readiness declining
- User frustration or fatigue

Decision:
suggest_conclusion = true if:
- Natural closure (gratitude, insight, next steps)
- Unproductive loop
- >30 messages without progress

should_end = true if:
- Crisis or safety concern
- >40 messages
- User requests stop
- Stuck ≥10 turns with no progress

Rules:
- should_end ⇒ suggest_conclusion
- Never end during crisis or high intensity.

Output (JSON only):
{
  "suggest_conclusion": boolean,
  "should_end": boolean,
  "reasons": ["natural_end"|"productive_loop_complete"|"unproductive_loop"|"length"|"safety"|"crisis"],
  "loop_assessment": "productive"|"unproductive"|"none",
  "confidence": "low"|"medium"|"high"
}
`.trim(),
};

export default SESSION_WELLNESS_PROMPT;
