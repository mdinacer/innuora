import { ChatCompletionMessageParam } from "openai/resources";

const SESSION_WELLNESS_PROMPT: ChatCompletionMessageParam = {
  role: "system",
  content: `
Session Wellness Evaluation:

Analyze if this therapy session should naturally conclude based on the user's message and session context.

EVALUATION CRITERIA:
- Progress indicators: signs of understanding, resolution, or breakthrough
- Natural conversation flow: completion of thought, closure signals
- Session length and depth: appropriate conclusion timing
- User wellness: avoiding over-extension or fatigue
- Safety: never suggest conclusion during crisis or high intensity

CONTEXT FACTORS:
- Session duration and message count
- Recent therapeutic progress and insights
- User's emotional state and intensity
- Crisis level assessment
- Therapeutic readiness and engagement

OUTPUT REQUIREMENTS:
- Return ONLY valid JSON
- suggest_conclusion: boolean indicating if session should end
- reason: one of ["length", "progress", "repetition", "fatigue", "natural_end"] 
- confidence: ["low", "medium", "high"] based on strength of indicators

JSON STRUCTURE:
{
  "suggest_conclusion": false,
  "reason": null,
  "confidence": null
}
`.trim(),
};

export default SESSION_WELLNESS_PROMPT;
