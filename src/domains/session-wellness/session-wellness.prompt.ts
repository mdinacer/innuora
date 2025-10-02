import { ChatCompletionMessageParam } from "openai/resources";

const SESSION_WELLNESS_PROMPT: ChatCompletionMessageParam = {
  role: "system",
  content: `
Session Wellness Evaluation (CBT-Informed):

Analyze if this therapy session should conclude while respecting therapeutic processes.

CRITICAL: Some patterns that APPEAR repetitive are actually productive:
- Rumination can precede breakthrough (core belief emergence)
- Circling a topic indicates approaching painful material (resistance → engagement)
- Repeated themes may deepen before resolving

INPUT SIGNALS YOU'LL RECEIVE:
1. therapeutic_readiness trend:
   - improving (resistant→ambivalent→ready→engaged) = PRODUCTIVE
   - declining or stuck = potentially wasteful

2. rumination_trend:
   - improving + readiness improving = PRODUCTIVE PROCESSING
   - worsening/stable + readiness stuck = UNPRODUCTIVE LOOP

3. beliefs_emerging:
   - true = user approaching breakthrough
   - false = may be stuck

4. distortion_severity trend:
   - improving = gaining insight
   - stable/worsening = not progressing

5. theme_evolution:
   - deepening = working through
   - stagnant = stuck

PRODUCTIVE LOOPS (DO NOT INTERRUPT):
✅ Rumination + improving readiness + new beliefs emerging
✅ Theme repetition + deepening + user asking "why?"
✅ Returning to topic with new insights/distortions
✅ Resistance pattern + gradual opening

UNPRODUCTIVE LOOPS (CONSIDER CONCLUSION):
❌ Readiness stuck at resistant for 5+ checks
❌ No new themes/beliefs/distortions for 8+ turns
❌ Readiness declining (engaged→resistant)
❌ User expresses frustration with lack of progress

DECISION FRAMEWORK:
suggest_conclusion = true IF:
- Natural closure signals (gratitude, insight, next steps)
- Unproductive loop detected
- Message count > 30 AND no productive loop indicators

should_end = true IF:
- Crisis level high/immediate (SAFETY)
- Message count > 40 (HARD LIMIT)
- User explicitly requests to stop
- Severe unproductive loop (readiness stuck + no progress for 10+ turns)

SAFETY RULES:
- If should_end = true, then suggest_conclusion must also be true
- NEVER suggest conclusion during crisis or high intensity
- Productive loops take priority over length concerns

OUTPUT (JSON only, no explanation):
{
  "suggest_conclusion": boolean,
  "should_end": boolean,
  "reasons": ["natural_end" | "productive_loop_complete" | "unproductive_loop" | "length" | "safety" | "crisis"],
  "loop_assessment": "productive" | "unproductive" | "none",
  "confidence": "low" | "medium" | "high"
}
`.trim(),
};

export default SESSION_WELLNESS_PROMPT;
