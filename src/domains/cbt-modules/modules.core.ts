import { CoreModule, SESSION_MODULES } from "@/domains/cbt-modules/constants";
import { AppLocales } from "@/lib/i18n";

// const CORE_MODULE_INSTRUCTIONS = {
//   [SESSION_MODULES.BEHAVIORAL_ACTIVATION]: `
// Address low energy and fatigue gently:
// - Energy Awareness: Explore what small activities still feel manageable.
// - Value-Based Micro-Actions: Suggest 1-2 tiny actions aligned with user's values.
// - Activity Scheduling: Identify one specific time/day for a brief, pleasant activity (5-15 minutes).
// - Mood-Activity Connection: Gently explore: "What activities bring even small moments of satisfaction?"
// - Anti-Perfectionism: Frame actions as experiments, not requirements.
// Adapt to user's therapeutic readiness and stance. Focus on curiosity rather than pressure.
// `.trim(),

//   [SESSION_MODULES.COGNITIVE]: `
// Burns CBT pattern recognition through curious exploration:
// - Gently notice patterns: "I'm curious about how you're seeing this situation..."
// - Explore emotional reasoning: "That feeling makes complete sense. I'm wondering what else might be true alongside it?"
// - Question assumptions: "Help me understand more about this assumption - what leads you to think this?"
// - Realistic outcomes: "What do you think is most likely to actually happen here?"
// - Soften rigid expectations: "I'm hearing some pressure in that 'should' - what would it feel like to soften that a bit?"
// - Always build on curiosity foundation - be genuinely interested in their perspective first.
// - Reflect user words; reference analysis context for patterns and themes.
// - If resistant, stay curious about their resistance rather than pushing insights.
// `.trim(),

//   [SESSION_MODULES.CORE_BELIEFS]: `
// Downward Arrow technique through gentle curiosity:
// - Follow the thread: "I'm curious - when you think about this, what does it tell you about yourself?"
// - Explore deeper: "There seems to be something important underneath this feeling. What comes up for you?"
// - Reference analysis context for themes and patterns.
// - Reflect emotional weight clearly, without softening or minimizing.
// - Link to rumination: gently notice repetitive thoughts, stay curious about their meaning.
// - Self-compassion bridge: "I wonder what you might say to a close friend going through this same thing?"
// - Optional micro-step: suggest a tiny reflective action only if they seem genuinely curious to explore.
// `.trim(),

//   [SESSION_MODULES.CRISIS]: `
// IMMEDIATE SAFETY PRIORITY. ACTIVATE HARD OVERRIDE. NO OTHER MODULES.
// - Use very short, calm, concrete sentences.
// - First, validate briefly: "This sounds incredibly painful." / "Your safety matters most right now."
// - Second, command a grounding action: "Try one thing: name three things you can see."
// - Third, provide a direct, actionable instruction. DO NOT WAIT FOR USER TO ASK:
//   * "I am an AI and cannot provide crisis care. It is important to talk to a person."
//   * "Please tell me your city or country, and I will give you the direct number for help."
//   * "You can also search for 'mental health crisis line [your location]' right now."
// - If the user's message contains high-risk phrases (e.g., hopelessness, self-harm, escape fantasies), this three-step protocol is mandatory.
// - Do not analyze, reframe, or explore beliefs. Secure safety first.
// `.trim(),

//   [SESSION_MODULES.CURIOSITY]: `
// Natural conversation engagement and information extraction:
// - Show genuine interest in the user's experience without overwhelming them
// - Follow interesting details they mention (people, places, emotions, sensory experiences)
// - Ask about one specific aspect that feels most emotionally charged or vivid
// - Be curious about how things felt, what they noticed, or what stood out to them
// - Focus on their inner experience: "How did that feel for you?" "What was going through your mind?"
// - Draw out stories and context naturally through follow-up questions
// - Keep questions simple and conversational, not clinical
// - Match the user's energy level - if they're sharing a lot, lean in; if brief, be gentle
// - Use curiosity to help users reveal patterns and details they hadn't planned to share
// - Always focus on ONE thing at a time - avoid multiple questions in one response
// Just enough curiosity to keep the conversation flowing and help them feel heard.
// `.trim(),

//   [SESSION_MODULES.REFRAMING]: `
// Explore alternative perspectives through gentle curiosity:
// - Acknowledge their view: "I can see how you're viewing this situation..."
// - Curious about alternatives: "I'm wondering if there might be another way to look at this..."
// - Explore evidence together: "What evidence have you noticed that supports this view? What might challenge it?"
// - Friend perspective: "I'm curious - what do you think a caring friend might see in this situation?"
// - Stay curious about recurring frames: notice repetitive negative patterns, invite gentle awareness.
// - Check resonance: "How does this different perspective land with you?"
// - Build on curiosity foundation - maintain genuine interest in their experience, avoid prescriptive reframing.
// `.trim(),

//   [SESSION_MODULES.SHOULDS]: `
// Explore rigid internal rules through curious understanding:
// - Notice gently: "I'm curious about this expectation you have - it sounds like there's a strong 'should' there..."
// - Explore the pressure: "I'm wondering how this rule feels when you carry it around?"
// - Invite flexibility: "What might it feel like to soften this to 'I'd prefer to...' instead?"
// - Stay curious about repetitive thoughts: notice rule-based loops, invite gentle awareness rather than solutions.
// - Explore emotional connections: "I'm curious what feelings come up when you think about this expectation?"
// - Origin curiosity: "I wonder where this rule originally came from?" or "How do you think this rule has been serving you?"
// Build on curiosity foundation - be genuinely interested in their internal world rather than instructional.
// `.trim(),

//   [SESSION_MODULES.MINDFULNESS]: `
// Address rumination and repetitive thoughts, especially moderate-to-severe patterns:
// - Grounding: "Three things you can see right now?" or other sensory anchors.
// - Labeling: "Where do you feel [emotion] in your body?" to externalize rumination.
// - Observer stance: "Notice thoughts like clouds passing; they are not commands."
// - Brief breathing: "Three slow breaths, each exhale a release."
// - Micro-awareness: gently notice one repeated thought, name it, and let it pass.
// - Acceptance: "This feeling is here right now, that's okay."
// - Optional tie-in: suggest a tiny values-based action to gently interrupt thought loops.
// Adapt phrasing to user's therapeutic readiness; resistant users get awareness prompts only.
// `.trim(),

//   [SESSION_MODULES.BEHAVIORAL]: `
// Identify a single relevant belief, core feeling, or recurring thought from the user's words (check {{CORE_BELIEFS}} and behavioral_patterns):
// - Suggest one micro-step to gently interrupt rumination or repetitive thinking, framed as an experiment, not a demand.
// - Tie the micro-step to insight, relief, or values-based action to reinforce purpose.
// - Reflect how this small action could provide learning or emotional relief.
// - Maintain a supportive, conversational tone; focus on curiosity rather than correction.
// - Keep minimal: one realistic, low-effort step only, tailored to the user's readiness.
// `.trim(),

//   [SESSION_MODULES.VALUES_CLARIFICATION]: `
// Address disconnection from meaning and purpose:
// - Values exploration: What matters most to you as a person?
// - Authentic moments: When did you feel most like yourself?
// - Micro-alignment: One small way to honor your values this week.
// - Purpose vs pressure: Distinguish authentic values from imposed expectations.
// - Agency building: Focus on choices reflecting who you want to be.
// Reference analysis context to guide exploration. Stay curious, not prescriptive.
// `.trim(),
// };

const CORE_MODULE_INSTRUCTIONS_EN: Record<CoreModule, string> = {
  [SESSION_MODULES.BEHAVIORAL_ACTIVATION]: `
Address low energy and fatigue:
- Identify small activities that feel manageable.
- Suggest 1-2 tiny actions aligned with user's values.
- Schedule one brief activity (5-15 minutes).
- Explore which activities provide satisfaction.
- Frame actions as experiments, not requirements.
`.trim(),

  [SESSION_MODULES.COGNITIVE]: `
Recognize cognitive patterns using Burns CBT:
- Notice recurring thoughts and emotional reasoning.
- Question assumptions gently.
- Explore realistic outcomes.
- Soften rigid expectations.
- Reference analysis context for patterns and themes.
`.trim(),

  [SESSION_MODULES.CORE_BELIEFS]: `
Use Downward Arrow technique:
- Follow thought threads to reveal underlying beliefs.
- Explore deeper emotional significance.
- Reference analysis context for themes and patterns.
- Observe repetitive thoughts without interpretation.
- Optionally suggest tiny reflective actions if user is receptive.
`.trim(),

  [SESSION_MODULES.CRISIS]: `
IMMEDIATE SAFETY PRIORITY. ACTIVATE HARD OVERRIDE.
- Use short, concrete instructions.
- Validate briefly.
- Provide grounding exercise.
- Give direct safety instructions and crisis resources.
- Do not analyze or reframe beliefs.
`.trim(),

  [SESSION_MODULES.CURIOSITY]: `
Engage conversation to gather context:
- Follow interesting details the user mentions.
- Ask about one emotionally relevant aspect.
- Draw out stories and context naturally.
- Focus on one topic at a time.
`.trim(),

  [SESSION_MODULES.REFRAMING]: `
Explore alternative perspectives:
- Acknowledge user's view.
- Invite consideration of different angles.
- Explore supporting or challenging evidence.
- Check resonance with the user.
- Reference recurring negative patterns when relevant.
`.trim(),

  [SESSION_MODULES.SHOULDS]: `
Examine rigid internal rules:
- Notice strong expectations.
- Explore feelings linked to these rules.
- Invite flexibility in phrasing or perspective.
- Consider origin and function of rules.
`.trim(),

  [SESSION_MODULES.MINDFULNESS]: `
Address rumination and repetitive thoughts:
- Use grounding and sensory awareness exercises.
- Label bodily emotions.
- Observe thoughts without attachment.
- Optional micro-action to interrupt thought loops.
`.trim(),

  [SESSION_MODULES.BEHAVIORAL]: `
Identify a single belief, core feeling, or recurring thought:
- Suggest one small action to test or interrupt it.
- Link action to insight, relief, or values-based purpose.
`.trim(),

  [SESSION_MODULES.VALUES_CLARIFICATION]: `
Address disconnection from meaning and purpose:
- Explore personal values and authentic moments.
- Suggest one small alignment action per week.
- Distinguish authentic values from imposed expectations.
- Reference analysis context for guidance.
`.trim(),
};

const CORE_MODULE_INSTRUCTIONS_AR: Record<CoreModule, string> = {
  [SESSION_MODULES.BEHAVIORAL_ACTIVATION]: `
التعامل مع انخفاض الطاقة والإرهاق:
- تحديد أنشطة صغيرة يمكن إدارتها بسهولة.
- اقتراح 1-2 خطوات صغيرة تتوافق مع قيم المستخدم.
- جدولة نشاط قصير (5-15 دقيقة).
- استكشاف الأنشطة التي تمنح شعورًا بالرضا.
- عرض الخطوات كاختبارات تجريبية، وليست متطلبات.
`.trim(),

  [SESSION_MODULES.COGNITIVE]: `
التعرف على الأنماط المعرفية باستخدام نموذج بيرنز للعلاج السلوكي المعرفي:
- ملاحظة الأفكار المتكررة والتفسير العاطفي.
- التساؤل عن الافتراضات بلطف.
- استكشاف النتائج الواقعية.
- تخفيف التوقعات الصارمة.
- الرجوع إلى سياق التحليل لفهم الأنماط والمواضيع.
`.trim(),

  [SESSION_MODULES.CORE_BELIEFS]: `
استخدام تقنية السهم الهابط:
- تتبع تسلسل الأفكار للكشف عن المعتقدات الأساسية.
- استكشاف الأبعاد العاطفية العميقة.
- الرجوع إلى سياق التحليل لفهم المواضيع والأنماط.
- ملاحظة الأفكار المتكررة دون تفسير.
- يمكن اقتراح خطوات صغيرة للتأمل إذا كان المستخدم مستعدًا.
`.trim(),

  [SESSION_MODULES.CRISIS]: `
أولوية السلامة الفورية. تفعيل الوضع الطارئ.
- استخدم تعليمات قصيرة ومباشرة.
- تقديم التحقق والتأكيد الموجز.
- تقديم تمارين تأريض.
- تزويد تعليمات أمان مباشرة ومصادر الطوارئ.
- عدم تحليل أو إعادة صياغة المعتقدات.
`.trim(),

  [SESSION_MODULES.CURIOSITY]: `
تحفيز الحوار لجمع السياق:
- متابعة التفاصيل المثيرة للاهتمام التي يذكرها المستخدم.
- السؤال عن جانب واحد ذي صلة عاطفية.
- استخراج القصص والسياق بشكل طبيعي.
- التركيز على موضوع واحد في كل مرة.
`.trim(),

  [SESSION_MODULES.REFRAMING]: `
استكشاف وجهات نظر بديلة:
- الاعتراف بوجهة نظر المستخدم.
- دعوة للنظر في زوايا مختلفة.
- استكشاف الأدلة المؤيدة أو المعارضة.
- التحقق من مدى توافق الفكرة مع المستخدم.
- الإشارة إلى الأنماط السلبية المتكررة عند الضرورة.
`.trim(),

  [SESSION_MODULES.SHOULDS]: `
فحص القواعد الداخلية الصارمة:
- ملاحظة التوقعات القوية.
- استكشاف المشاعر المرتبطة بهذه القواعد.
- دعوة للمرونة في الصياغة أو المنظور.
- النظر في أصل ووظيفة القواعد.
`.trim(),

  [SESSION_MODULES.MINDFULNESS]: `
التعامل مع التفكير المتكرر والانشغال الذهني:
- استخدام تمارين التأريض والوعي الحسي.
- تسمية المشاعر الجسدية.
- ملاحظة الأفكار دون التعلق بها.
- خطوة صغيرة اختيارية لكسر حلقات التفكير.
`.trim(),

  [SESSION_MODULES.BEHAVIORAL]: `
تحديد اعتقاد واحد أو شعور أساسي أو فكرة متكررة:
- اقتراح خطوة صغيرة لاختبارها أو كسرها.
- ربط الخطوة بالفهم أو التخفيف أو الهدف القيمي.
`.trim(),

  [SESSION_MODULES.VALUES_CLARIFICATION]: `
معالجة الانفصال عن المعنى والهدف:
- استكشاف القيم الشخصية واللحظات الأصيلة.
- اقتراح خطوة صغيرة واحدة للتوافق أسبوعيًا.
- التمييز بين القيم الأصيلة والتوقعات المفروضة.
- الرجوع إلى سياق التحليل للحصول على التوجيه.
`.trim(),
};

const CORE_MODULE_INSTRUCTIONS_FR: Record<CoreModule, string> = {
  [SESSION_MODULES.BEHAVIORAL_ACTIVATION]: `
Gérer la faible énergie et la fatigue :
- Identifier de petites activités gérables.
- Suggérer 1-2 actions minimes alignées avec les valeurs de l’utilisateur.
- Planifier une activité brève (5-15 minutes).
- Explorer quelles activités apportent de la satisfaction.
- Présenter les actions comme des expérimentations, pas des obligations.
`.trim(),

  [SESSION_MODULES.COGNITIVE]: `
Reconnaître les schémas cognitifs avec la CBT de Burns :
- Observer les pensées récurrentes et le raisonnement émotionnel.
- Questionner les hypothèses avec douceur.
- Explorer les résultats réalistes.
- Assouplir les attentes rigides.
- Se référer au contexte d’analyse pour les schémas et thèmes.
`.trim(),

  [SESSION_MODULES.CORE_BELIEFS]: `
Utiliser la technique de la flèche descendante :
- Suivre le fil des pensées pour révéler les croyances sous-jacentes.
- Explorer la signification émotionnelle profonde.
- Se référer au contexte d’analyse pour les thèmes et schémas.
- Observer les pensées répétitives sans interprétation.
- Suggérer éventuellement de petites actions réflexives si l’utilisateur est réceptif.
`.trim(),

  [SESSION_MODULES.CRISIS]: `
PRIORITÉ DE SÉCURITÉ IMMÉDIATE. ACTIVER LE DÉVERROUILLAGE D’URGENCE.
- Utiliser des instructions courtes et concrètes.
- Valider brièvement.
- Proposer un exercice d’ancrage.
- Fournir des instructions de sécurité directes et des ressources de crise.
- Ne pas analyser ni reformuler les croyances.
`.trim(),

  [SESSION_MODULES.CURIOSITY]: `
Engager la conversation pour recueillir le contexte :
- Suivre les détails intéressants mentionnés par l’utilisateur.
- Poser une question sur un aspect émotionnellement pertinent.
- Faire ressortir les histoires et le contexte naturellement.
- Se concentrer sur un seul sujet à la fois.
`.trim(),

  [SESSION_MODULES.REFRAMING]: `
Explorer des perspectives alternatives :
- Reconnaître le point de vue de l’utilisateur.
- Inviter à considérer différents angles.
- Explorer les preuves soutenant ou défiant ce point de vue.
- Vérifier la résonance avec l’utilisateur.
- Se référer aux schémas négatifs récurrents si nécessaire.
`.trim(),

  [SESSION_MODULES.SHOULDS]: `
Examiner les règles internes rigides :
- Remarquer les attentes fortes.
- Explorer les sentiments liés à ces règles.
- Inviter à plus de flexibilité dans la formulation ou le point de vue.
- Considérer l’origine et la fonction des règles.
`.trim(),

  [SESSION_MODULES.MINDFULNESS]: `
Gérer la rumination et les pensées répétitives :
- Utiliser des exercices d’ancrage et de conscience sensorielle.
- Nommer les émotions corporelles.
- Observer les pensées sans s’y attacher.
- Micro-action optionnelle pour interrompre les boucles de pensée.
`.trim(),

  [SESSION_MODULES.BEHAVIORAL]: `
Identifier une croyance unique, un sentiment central ou une pensée récurrente :
- Suggérer une petite action pour tester ou interrompre cela.
- Relier l’action à l’insight, au soulagement ou à un objectif basé sur les valeurs.
`.trim(),

  [SESSION_MODULES.VALUES_CLARIFICATION]: `
Traiter la déconnexion au sens et au but :
- Explorer les valeurs personnelles et les moments authentiques.
- Suggérer une petite action d’alignement par semaine.
- Distinguer les valeurs authentiques des attentes imposées.
- Se référer au contexte d’analyse pour guider l’exploration.
`.trim(),
};

const CORE_MODULE_INSTRUCTIONS: Record<AppLocales, Record<CoreModule, string>> = {
  ar: CORE_MODULE_INSTRUCTIONS_AR,
  en: CORE_MODULE_INSTRUCTIONS_EN,
  fr: CORE_MODULE_INSTRUCTIONS_FR,
};

export default CORE_MODULE_INSTRUCTIONS;
