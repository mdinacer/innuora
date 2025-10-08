import { Session } from "@/domains/open-chat/open-chat.types";
import { AdvancedDiagnostic } from "@/lib/zod/advanced-diagnostic.schema";
import { BasicDiagnostic } from "@/lib/zod/basic-diagnostic.schema";

export const mockSession: Session = {
  id: "102b811b-3ee4-41ba-b793-0c503924117c",
  userId: "cmgglrem900006k7qpwoshnww",
  title: "Test with DeepSeek",
  subtitle: "",
  autoUpdateTitle: true,
  createdAt: new Date("2025-10-07T16:29:21.058Z"),
  updatedAt: new Date("2025-10-07T16:42:32.857Z"),
  messages: [
    {
      id: "initial-message",
      role: "assistant",
      content:
        "Hi there. I'm here to listen. What's been on your mind lately? Take your time. Just start wherever feels right.",
      timestamp: 1759854564594,
    },
    {
      id: "msg_WUSilnWrpe",
      role: "user",
      content:
        "I just feel like I'm constantly behind, you know? Like I have this mental checklist a mile long and no matter how many things I check off, it just gets longer. I lie in bed at night and my brain just won't shut off, replaying everything I said, everything I didn't do, everything I need to do tomorrow. It's exhausting.",
      timestamp: 1759854602494,
    },
    {
      id: "msg_QUVDyrIzTW",
      role: "assistant",
      content:
        "That sounds really heavy, like your mind is running a nonstop race you can’t pause. When you notice your brain replaying those moments, what feelings or sensations show up in your body?",
      timestamp: 1759854610007,
      creditsUsed: 0,
    },
    {
      id: "msg_7vmoeAJ9Mw",
      role: "user",
      content:
        "It's like a tightness in my shoulders and this... restless energy in my chest. I just feel wound up, like a spring. My jaw is always clenched by the end of the day. It's like my body is braced for the next thing to go wrong, even when I'm supposedly \"relaxing.\"",
      timestamp: 1759854630132,
    },
    {
      id: "msg_hYMX0qlJ2t",
      role: "assistant",
      content:
        "That tight, braced feeling sounds so draining, like your body is carrying worry even when you want peace. I wonder if your mind is trying to protect you by staying alert, but it’s keeping you stuck in tension instead. How does it feel to notice that urge to brace?",
      timestamp: 1759854638182,
      creditsUsed: 0,
    },
    {
      id: "msg_Yud2vCZst4",
      role: "user",
      content:
        "It feels... familiar, honestly. Like a default setting. The idea that it's trying to protect me is new, though. I always just saw it as a sign I wasn't strong enough to handle things. But if it's protection... that makes it feel less like a personal failure and more like a habit. A really exhausting habit.",
      timestamp: 1759854660945,
    },
    {
      id: "msg_shmgwAirPM",
      role: "assistant",
      content:
        "That shift from self-blame to seeing it as a habit of protection is really important, even if it feels tiring. What do you think it might feel like to treat that habit with a bit of curiosity, instead of judgment?",
      timestamp: 1759854668095,
      creditsUsed: 0,
    },
    {
      id: "msg_2RrYg3Hafi",
      role: "user",
      content:
        "I don't know... foreign, probably. A little scary. Curiosity feels passive, like I'm not doing anything to fix it. But the judgment... God, the judgment is so loud. It's exhausting too, in its own way. Maybe curiosity would be a quieter kind of tired.",
      timestamp: 1759854684992,
    },
    {
      id: "msg_KXxQsOMB45",
      role: "assistant",
      content:
        "That’s a powerful insight—curiosity as a quieter kind of tired. It’s okay to feel scared about shifting from judgment to curiosity; it feels unfamiliar because it asks you to slow down rather than push harder. What might a small moment of gentle curiosity look like for you today?",
      timestamp: 1759854691676,
      creditsUsed: 0,
    },
    {
      id: "msg_UY84CCzHF9",
      role: "user",
      content:
        "Maybe... just noticing the clenching in my jaw when I'm at my desk and taking one real, slow breath instead of just powering through. Not to make it go away, but just to acknowledge it's there. That feels... manageable. And strangely vulnerable.",
      timestamp: 1759854709354,
    },
    {
      id: "msg_d5ofUBLDMx",
      role: "assistant",
      content:
        "That’s a meaningful step—simply noticing without fixing, letting yourself be with the tension. That vulnerability shows real strength, even if it feels fragile. How does your body respond when you take that slow breath and allow the clenching to be present?",
      timestamp: 1759854715082,
      creditsUsed: 0,
    },
    {
      id: "msg_1TjXHbqSmF",
      role: "user",
      content:
        "It's... weird. For a second, the tightness actually gets more intense, like it's protesting. But then, if I stay with it for just one more breath, there's this tiny release. It doesn't go away, but it stops feeling like a threat. It just feels like a feeling. That's... new.",
      timestamp: 1759854735705,
    },
    {
      id: "msg_dscNXpu8x5",
      role: "assistant",
      content:
        "That’s such a clear, brave observation—feeling the protest before the release shows how your body is used to guarding you. Noticing it shift from threat to just a feeling is a small but powerful way of building trust with yourself. How does that new feeling sit with you right now?",
      timestamp: 1759854741639,
      creditsUsed: 0,
    },
    {
      id: "msg_15ZfhNowTt",
      role: "user",
      content:
        "It feels... quiet. A little strange, but in a good way. Like I've put down a weight I didn't even know I was carrying. It makes me wonder what else I'm holding onto that doesn't actually need to be a fight.",
      timestamp: 1759854758963,
    },
    {
      id: "msg_Zpg7e9AmZB",
      role: "assistant",
      content:
        "That’s a gentle, important realization—letting go of unseen weights can open space for unexpected calm. What might it feel like to explore one small worry or tension with that same quiet curiosity, without trying to fix it right away?",
      timestamp: 1759854765534,
      creditsUsed: 0,
    },
    {
      id: "msg_fcPFPD2HpP",
      role: "user",
      content:
        "I could try it with the constant worry about my inbox. Instead of immediately scrambling to clear it to zero, maybe I could just notice the anxious pull I feel toward it... and let it sit for five minutes while I just drink my tea. See what that's really about.",
      timestamp: 1759854782346,
    },
    {
      id: "msg_YXRJtgD6iR",
      role: "assistant",
      content:
        "That’s a thoughtful way to meet your anxiety with curiosity instead of urgency. Noticing the pull without reacting can reveal what’s underneath—maybe a need for control or connection. How do you feel about trying that pause with your tea right now?",
      timestamp: 1759854787749,
      creditsUsed: 0,
    },
    {
      id: "msg_GT4ET7jYCF",
      role: "user",
      content:
        "Okay. I'm doing it now. The phone is face down... and I'm just holding my mug. The urge to check is... loud. But underneath it, I think there's just this fear of missing something crucial. Of not being on top of things. It's not about the emails, is it? It's about... being enough.",
      timestamp: 1759854881247,
    },
    {
      id: "msg_0Nf5RKsWtI",
      role: "assistant",
      content:
        "You’ve touched something really tender there—the fear of not being enough beneath the urge. That’s a heavy feeling to carry quietly. How does it feel to name that fear without rushing to fix it?",
      timestamp: 1759854887961,
      creditsUsed: 0,
    },
    {
      id: "msg_52Qm1pIqGc",
      role: "user",
      content:
        "It hurts... but it's a clean hurt. Like finally acknowledging a bruise I've been poking at for years. It's scary to say it out loud, but it also feels... truer. More honest than just feeling constantly frantic.",
      timestamp: 1759855003061,
    },
    {
      id: "msg_1V9uNebfYW",
      role: "assistant",
      content:
        "That’s a deeply **brave** place to be, facing that hurt with honesty. Sometimes the clearest pain feels like a kind of truth we’ve needed to see all along. What do you notice in your body as you sit with this clean hurt?",
      timestamp: 1759855011805,
      creditsUsed: 0,
    },
    {
      id: "msg_fTZnauUQTk",
      role: "user",
      content:
        "The tightness in my chest is still there... but it's softer now. Like it's finally being heard, so it doesn't have to scream anymore. There's a quiet ache, but also this weird sense of relief. Like I can finally just be tired, without having to fix it.",
      timestamp: 1759855031107,
    },
    {
      id: "msg_vkpSRzzA5s",
      role: "assistant",
      content:
        "That softening tightness sounds like your body’s way of saying it’s ready to rest, not fight. Letting yourself feel tired without fixing it is a small act of **self-compassion** that might open space for gentle healing. How does that quiet ache invite you to care for yourself right now?",
      timestamp: 1759855037404,
      creditsUsed: 0,
    },
    {
      id: "msg_fa6LZ7gQqe",
      role: "user",
      content:
        "It makes me want to just... close my eyes for a minute. Not to sleep, but just to let everything be still. To put a hand on my own chest and just let it all be exactly as it is, even for just a moment.",
      timestamp: 1759855054304,
    },
    {
      id: "msg_gxVW1nz4NA",
      role: "assistant",
      content:
        "That’s a beautiful, tender wish—to hold yourself with calm and stillness. Closing your eyes and placing a hand on your chest can be a quiet way to say, “I see you, and I’m here.” How do you imagine that moment feeling in your body?",
      timestamp: 1759855060752,
      creditsUsed: 0,
    },
    {
      id: "msg_2eSGRMRQb3",
      role: "user",
      content:
        "It feels... like a homecoming. A gentle weight, like a blanket settling. The pressure of my own hand feels like an anchor, and for the first time all day, my thoughts aren't screaming... they're just... quiet. It's a relief to just be here, without needing to be anywhere else.",
      timestamp: 1759855115180,
    },
    {
      id: "msg_J2nEy6Zpp2",
      role: "assistant",
      content:
        "That sense of a gentle homecoming is so **grounding** and rare. Holding that quiet space where your thoughts soften feels like a small but powerful refuge. What do you notice about yourself in this moment of calm that feels different from your usual pace?",
      timestamp: 1759855121800,
      creditsUsed: 0,
    },
    {
      id: "msg_CBXBSeqPte",
      role: "user",
      content:
        "I feel... younger. Not in a bad way, but... lighter. Like the weight of all those expectations I carry isn't mine to hold so tightly. The world feels slower. And for once, that doesn't feel scary—it feels like a gift.",
      timestamp: 1759855159551,
    },
    {
      id: "msg_WGUQavzyef",
      role: "assistant",
      content:
        "That feeling of being lighter and younger, like shedding heavy expectations, is a kind of **freedom** you might not have allowed yourself before. It’s interesting how slowing down can shift fear into something gentle, even like a gift. What do you think this lighter you needs most right now?",
      timestamp: 1759855166012,
      creditsUsed: 0,
    },
    {
      id: "msg_MrhKw10z2Z",
      role: "user",
      content:
        "She needs... permission. Permission to not have all the answers. To sometimes just be quiet and still, and for that to be enough. She needs me to stop treating her like a problem to be solved.",
      timestamp: 1759855181769,
    },
    {
      id: "msg_sjH5vshMwH",
      role: "assistant",
      content:
        "That need for **permission** to simply be, without fixing or figuring it all out, holds such deep kindness. It sounds like you’re craving a gentler way of relating to yourself—what would it feel like to start offering that permission in small, quiet moments?",
      timestamp: 1759855188969,
      creditsUsed: 0,
    },
    {
      id: "msg_tUwMHGw3Q4",
      role: "user",
      content:
        'It would feel... like learning a new language. A little clumsy at first, but honest. Like whispering "it\'s okay" to myself when I feel the old panic rise, instead of scolding myself for feeling it. It would be a quiet rebellion against the constant pressure to perform.',
      timestamp: 1759855208035,
    },
    {
      id: "msg_HYEWxFPJa9",
      role: "assistant",
      content:
        "That image of a quiet rebellion through gentle whispers is deeply **brave**. It’s like planting a seed of kindness where harshness once grew. What small moment today might feel like a good chance to practice this new language with yourself?",
      timestamp: 1759855215219,
      creditsUsed: 0,
    },
    {
      id: "msg_4UOD08tFzp",
      role: "user",
      content:
        'When I feel that first jolt of anxiety about my to-do list tomorrow morning... instead of grabbing my phone, I could just stay in bed for one extra minute. Just one breath, and a quiet "it\'s okay" to myself. That feels like a real, tangible place to start.',
      timestamp: 1759855240375,
    },
    {
      id: "msg_Id97ujOs2r",
      role: "assistant",
      content:
        'That small pause, just one breath and a soft "it\'s okay," is a powerful way to **interrupt** the rush before it takes over. It’s like giving yourself a gentle anchor before the day begins. How do you imagine that moment might shift your morning energy?',
      timestamp: 1759855246984,
      creditsUsed: 0,
    },
    {
      id: "msg_DFzESEhOIZ",
      role: "user",
      content:
        "It would feel like... starting the day on my own terms. Like I'm setting the tone instead of letting anxiety set it for me. That one minute could be a tiny pocket of peace I carry with me, even when the busyness begins.",
      timestamp: 1759855275860,
    },
    {
      id: "msg_vDX6QYNvCf",
      role: "assistant",
      content:
        "That sense of **ownership** over your morning feels grounding and strong. That tiny pocket of peace could quietly remind you that you have a choice, even in the busiest moments. What might it feel like to carry that calm into a particularly hectic part of your day?",
      timestamp: 1759855283493,
      creditsUsed: 0,
    },
    {
      id: "msg_4r3xOOlmOC",
      role: "user",
      content:
        "It would feel like having a secret source of steadiness. Like I could touch my hand to my chest in the middle of a stressful meeting or a crowded inbox and remember that underneath it all, there's a part of me that is still, and enough.",
      timestamp: 1759855300160,
    },
    {
      id: "msg_AxtjON43t6",
      role: "assistant",
      content:
        "That image of a secret source of steadiness is truly **comforting**. It’s like a quiet refuge you can visit anytime, reminding you of your inner strength beneath the surface noise. How do you think it might feel to connect with that part of you in a moment when stress feels overwhelming?",
      timestamp: 1759855305911,
      creditsUsed: 0,
    },
    {
      id: "msg_AKH4fjH4Tj",
      role: "user",
      content:
        "It would feel like... coming back to myself. Like finding solid ground in the middle of a storm. The stress might not disappear, but it wouldn't be in control anymore. I'd be the one holding the anchor.",
      timestamp: 1759855345025,
    },
    {
      id: "msg_ABt1FH5bvy",
      role: "assistant",
      content:
        "That feeling of **coming back to yourself** is deeply grounding, like reclaiming your calm amid chaos. Holding the anchor means you’re not just surviving the storm, but choosing how to meet it. What small sign would remind you in those moments that you’re still in charge?",
      timestamp: 1759855352857,
      creditsUsed: 0,
    },
  ],
  memoryStore: null,
  continuitySummary: null,
  aggregatedAnalysis: null,
  analysisSnapshots: [
    {
      core_module: "mindfulness",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [
        {
          type: "mental_filter",
          severity: "moderate",
        },
        {
          type: "overgeneralization",
          severity: "moderate",
        },
      ],
      themes: [
        {
          theme: "rumination",
          frequency: "frequent",
        },
      ],
      core_beliefs: [],
      silent_rules: [],
      behavioral_patterns: [
        {
          type: "rumination",
          severity: "moderate",
        },
      ],
      state: "first_time",
      therapeutic_readiness: "ready",
      update_memory: false,
      recall_memory: false,
      analysis_value: "high",
      messageId: "msg_WUSilnWrpe",
    },
    {
      core_module: "mindfulness",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [
        {
          type: "mental_filter",
          severity: "moderate",
        },
      ],
      themes: [
        {
          theme: "physical tension related to stress",
          frequency: "frequent",
        },
      ],
      core_beliefs: [],
      silent_rules: [],
      behavioral_patterns: [
        {
          type: "rumination",
          severity: "moderate",
        },
      ],
      state: "returning",
      therapeutic_readiness: "engaged",
      update_memory: false,
      recall_memory: true,
      analysis_value: "medium",
      messageId: "msg_7vmoeAJ9Mw",
    },
    {
      core_module: "mindfulness",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [
        {
          type: "labeling",
          severity: "mild",
        },
        {
          type: "personalization",
          severity: "mild",
        },
      ],
      themes: [
        {
          theme: "habitual emotional response",
          frequency: "frequent",
        },
      ],
      core_beliefs: [],
      silent_rules: [],
      behavioral_patterns: [
        {
          type: "rumination",
          severity: "moderate",
        },
      ],
      state: "returning",
      therapeutic_readiness: "engaged",
      update_memory: false,
      recall_memory: true,
      analysis_value: "medium",
      messageId: "msg_Yud2vCZst4",
    },
    {
      core_module: "mindfulness",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [
        {
          type: "labeling",
          severity: "moderate",
        },
      ],
      themes: [
        {
          theme: "judgment",
          frequency: "frequent",
        },
      ],
      core_beliefs: [],
      silent_rules: [],
      behavioral_patterns: [
        {
          type: "rumination",
          severity: "moderate",
        },
      ],
      state: "returning",
      therapeutic_readiness: "engaged",
      update_memory: false,
      recall_memory: false,
      analysis_value: "medium",
      messageId: "msg_2RrYg3Hafi",
    },
    {
      core_module: "mindfulness",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [],
      themes: [],
      core_beliefs: [],
      silent_rules: [],
      behavioral_patterns: [],
      state: "returning",
      therapeutic_readiness: "engaged",
      update_memory: false,
      recall_memory: false,
      analysis_value: "medium",
      messageId: "msg_UY84CCzHF9",
    },
    {
      core_module: "mindfulness",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [],
      themes: [],
      core_beliefs: [],
      silent_rules: [],
      behavioral_patterns: [],
      state: "returning",
      therapeutic_readiness: "engaged",
      update_memory: false,
      recall_memory: false,
      analysis_value: "medium",
      messageId: "msg_1TjXHbqSmF",
    },
    {
      core_module: "mindfulness",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [],
      themes: [],
      core_beliefs: [],
      silent_rules: [],
      behavioral_patterns: [],
      state: "returning",
      therapeutic_readiness: "engaged",
      update_memory: false,
      recall_memory: false,
      analysis_value: "medium",
      messageId: "msg_15ZfhNowTt",
    },
    {
      core_module: "mindfulness",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [],
      themes: [],
      core_beliefs: [],
      silent_rules: [],
      behavioral_patterns: [
        {
          type: "rumination",
          severity: "mild",
        },
      ],
      state: "returning",
      therapeutic_readiness: "engaged",
      update_memory: false,
      recall_memory: true,
      analysis_value: "medium",
      messageId: "msg_fcPFPD2HpP",
    },
    {
      core_module: "core_beliefs",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [
        {
          type: "personalization",
          severity: "moderate",
        },
      ],
      themes: [
        {
          theme: "fear of inadequacy",
          frequency: "frequent",
        },
      ],
      core_beliefs: [
        {
          belief: "not being enough",
        },
      ],
      silent_rules: [],
      behavioral_patterns: [
        {
          type: "rumination",
          severity: "moderate",
        },
      ],
      state: "established",
      therapeutic_readiness: "engaged",
      update_memory: false,
      recall_memory: false,
      analysis_value: "high",
      messageId: "msg_GT4ET7jYCF",
    },
    {
      core_module: "mindfulness",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [],
      themes: [
        {
          theme: "acknowledgment of long-term emotional pain",
          frequency: "frequent",
        },
      ],
      core_beliefs: [],
      silent_rules: [],
      behavioral_patterns: [
        {
          type: "rumination",
          severity: "moderate",
        },
      ],
      state: "established",
      therapeutic_readiness: "engaged",
      update_memory: false,
      recall_memory: false,
      analysis_value: "medium",
      messageId: "msg_52Qm1pIqGc",
    },
    {
      core_module: "mindfulness",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [],
      themes: [
        {
          theme: "emotional regulation and acceptance",
          frequency: "frequent",
        },
      ],
      core_beliefs: [],
      silent_rules: [],
      behavioral_patterns: [
        {
          type: "rumination",
          severity: "moderate",
        },
      ],
      state: "returning",
      therapeutic_readiness: "engaged",
      update_memory: false,
      recall_memory: true,
      analysis_value: "medium",
      messageId: "msg_fTZnauUQTk",
    },
    {
      core_module: "mindfulness",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [],
      themes: [],
      core_beliefs: [],
      silent_rules: [],
      behavioral_patterns: [],
      state: "returning",
      therapeutic_readiness: "engaged",
      update_memory: false,
      recall_memory: false,
      analysis_value: "medium",
      messageId: "msg_fa6LZ7gQqe",
    },
    {
      core_module: "mindfulness",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [],
      themes: [],
      core_beliefs: [],
      silent_rules: [],
      behavioral_patterns: [],
      state: "returning",
      therapeutic_readiness: "engaged",
      update_memory: false,
      recall_memory: false,
      analysis_value: "medium",
      messageId: "msg_2eSGRMRQb3",
    },
    {
      core_module: "mindfulness",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [],
      themes: [],
      core_beliefs: [],
      silent_rules: [],
      behavioral_patterns: [],
      state: "returning",
      therapeutic_readiness: "engaged",
      update_memory: false,
      recall_memory: false,
      analysis_value: "medium",
      messageId: "msg_CBXBSeqPte",
    },
    {
      core_module: "validate",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [],
      themes: [
        {
          theme: "acceptance and permission",
          frequency: "frequent",
        },
      ],
      core_beliefs: [],
      silent_rules: [],
      behavioral_patterns: [],
      state: "returning",
      therapeutic_readiness: "engaged",
      update_memory: false,
      recall_memory: false,
      analysis_value: "medium",
      messageId: "msg_MrhKw10z2Z",
    },
    {
      core_module: "mindfulness",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [],
      themes: [
        {
          theme: "self-compassion and emotional regulation",
          frequency: "frequent",
        },
        {
          theme: "pressure to perform",
          frequency: "frequent",
        },
      ],
      core_beliefs: [],
      silent_rules: [
        {
          rule: "must not show weakness or panic",
          rigidity: "moderate",
        },
      ],
      behavioral_patterns: [
        {
          type: "rumination",
          severity: "mild",
        },
      ],
      state: "established",
      therapeutic_readiness: "engaged",
      update_memory: false,
      recall_memory: true,
      analysis_value: "medium",
      messageId: "msg_tUwMHGw3Q4",
    },
    {
      core_module: "mindfulness",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [],
      themes: [
        {
          theme: "anxiety management",
          frequency: "frequent",
        },
      ],
      core_beliefs: [],
      silent_rules: [],
      behavioral_patterns: [
        {
          type: "rumination",
          severity: "mild",
        },
      ],
      state: "returning",
      therapeutic_readiness: "engaged",
      update_memory: false,
      recall_memory: true,
      analysis_value: "medium",
      messageId: "msg_4UOD08tFzp",
    },
    {
      core_module: "mindfulness",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [],
      themes: [
        {
          theme: "seeking calm and control",
          frequency: "frequent",
        },
      ],
      core_beliefs: [],
      silent_rules: [],
      behavioral_patterns: [
        {
          type: "rumination",
          severity: "mild",
        },
      ],
      state: "returning",
      therapeutic_readiness: "engaged",
      update_memory: false,
      recall_memory: true,
      analysis_value: "medium",
      messageId: "msg_DFzESEhOIZ",
    },
    {
      core_module: "mindfulness",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [],
      themes: [],
      core_beliefs: [],
      silent_rules: [],
      behavioral_patterns: [],
      state: "returning",
      therapeutic_readiness: "engaged",
      update_memory: false,
      recall_memory: true,
      analysis_value: "medium",
      messageId: "msg_4r3xOOlmOC",
    },
    {
      core_module: "mindfulness",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [],
      themes: [],
      core_beliefs: [],
      silent_rules: [],
      behavioral_patterns: [],
      state: "returning",
      therapeutic_readiness: "engaged",
      update_memory: false,
      recall_memory: true,
      analysis_value: "medium",
      messageId: "msg_AKH4fjH4Tj",
    },
  ],
  sessionDiagnostics: null,
  metadata: {
    messageCount: 41,
    tokenCount: 112012,
    inputTokens: 103616,
    outputTokens: 8396,
    costUSD: 0,
    creditsUsed: 16,
    activeDurationMs: 582884,
    lastActiveAt: new Date("2025-10-07T16:54:48.765Z"),
    tokenUsage: [],
  },
  persistOnCloud: false,
};

export const mockSessionSummary = `
The conversation centered on the user's experience of persistent anxiety, physical tension, and mental exhaustion from feeling constantly behind. They explored sensations like shoulder tightness, jaw clenching, and restless energy, and began shifting their perspective from self-judgment to curiosity and self-compassion. The user described practicing mindful awareness of their tension and anxiety triggers, such as the urge to check emails, and recognizing underlying fears of not being enough. They reflected on allowing themselves to feel tired and vulnerable without needing to fix it, imagining gentle moments of stillness and permission to simply be. The discussion concluded with the user envisioning small daily practices, like taking a slow breath and quietly affirming "it's okay," as ways to create pockets of calm and reclaim a sense of control amid stress.`.trim();

export const mockSessionMemory: string[] = [
  "Mental checklist grows longer despite checking off tasks",
  "Difficulty falling asleep due to persistent replaying of thoughts",
  "Physical symptoms include shoulder tightness, chest restlessness, and jaw clenching",
  "Body remains tense even during relaxation periods",
  "Practice of mindful breathing at desk leads to temporary increase then release of physical tension",
  "Deliberate pause before responding to email anxiety, holding mug instead of checking phone",
  "Acknowledgment of fear related to feeling 'enough' beneath task-related anxiety",
  "Use of hand on chest and quiet self-affirmation as grounding techniques during stress",
];

export const mockSessionAnalysis = `
Distortions identified: mental_filter (moderate), overgeneralization (moderate), mental_filter (moderate), labeling (mild), personalization (mild), labeling (moderate), personalization (moderate)
Recurring themes: rumination (frequent), physical tension related to stress (frequent), habitual emotional response (frequent), judgment (frequent), fear of inadequacy (frequent), acknowledgment of long-term emotional pain (frequent), emotional regulation and acceptance (frequent), acceptance and permission (frequent), self-compassion and emotional regulation (frequent), pressure to perform (frequent), anxiety management (frequent), seeking calm and control (frequent)
Core beliefs emerged: not being enough
Silent rules detected: must not show weakness or panic (moderate)
Behavioral patterns: rumination (moderate), rumination (moderate), rumination (moderate), rumination (moderate), rumination (mild), rumination (moderate), rumination (moderate), rumination (moderate), rumination (mild), rumination (mild), rumination (mild)`.trim();

export const mockAdvancedDiagnosis: AdvancedDiagnostic = {
  themes: [
    {
      id: "T1",
      title: "Persistent Anxiety and Rumination",
      description:
        "User experiences ongoing mental replay of worries and task-related thoughts, leading to difficulty in sleep and sustained cognitive overload.",
      severity: "high",
      trajectory: "stable",
      evidence: [
        "Mental checklist grows longer despite checking off tasks",
        "Difficulty falling asleep due to persistent replaying of thoughts",
        "Rumination identified as frequent behavioral pattern",
      ],
    },
    {
      id: "T2",
      title: "Physical Tension Linked to Stress",
      description:
        "Chronic bodily tension manifests as shoulder tightness, jaw clenching, chest restlessness, and sustained muscle contraction even during relaxation attempts.",
      severity: "high",
      trajectory: "stable",
      evidence: [
        "Physical symptoms include shoulder tightness, chest restlessness, and jaw clenching",
        "Body remains tense even during relaxation periods",
        "Mindful breathing temporarily increases then releases physical tension",
      ],
    },
    {
      id: "T3",
      title: "Fear of Inadequacy and Self-Judgment",
      description:
        "Underlying core belief of 'not being enough' drives self-criticism and pressure to perform, reinforced by silent rule of not showing weakness or panic.",
      severity: "high",
      trajectory: "stable",
      evidence: [
        "Acknowledgment of fear related to feeling 'enough' beneath task-related anxiety",
        "Judgment and labeling cognitive distortions present",
        "Silent rule: must not show weakness or panic (moderate)",
      ],
    },
    {
      id: "T4",
      title: "Emerging Self-Compassion and Emotional Regulation",
      description:
        "User begins shifting from judgment to curiosity and self-compassion, practicing mindful awareness and gentle self-affirmation to create calm.",
      severity: "medium",
      trajectory: "increasing",
      evidence: [
        "Practice of mindful breathing and deliberate pause before responding to email anxiety",
        "Use of hand on chest and quiet self-affirmation as grounding techniques",
        "Envisioning small daily practices to reclaim calm and control",
      ],
    },
  ],
  cognitive_distortions: [
    {
      id: "CD1",
      title: "Mental Filter",
      description:
        "User focuses primarily on what is incomplete or stressful, filtering out completed tasks and positive moments, contributing to a sense of constant failure.",
      frequency: 2,
      severity: "moderate",
    },
    {
      id: "CD2",
      title: "Overgeneralization",
      description:
        "Drawing broad negative conclusions from specific incidents, such as feeling 'not enough' based on task delays or anxiety episodes.",
      frequency: 2,
      severity: "moderate",
    },
    {
      id: "CD3",
      title: "Labeling",
      description: "Applying negative labels to self, e.g., feeling inadequate or weak, reinforcing low self-esteem.",
      frequency: 2,
      severity: "moderate",
    },
    {
      id: "CD4",
      title: "Personalization",
      description:
        "Taking responsibility for outcomes or feelings beyond control, contributing to self-blame and increased anxiety.",
      frequency: 2,
      severity: "moderate",
    },
  ],
  emotional_state: {
    primary: "anxiety",
    secondary: ["tension", "self-judgment", "vulnerability", "hopefulness"],
    congruence: "aligned",
  },
  risk_assessment: {
    level: "moderate_concern",
    notes:
      "No explicit suicidal ideation or self-harm noted; however, persistent high anxiety, sleep disturbances, and physical tension warrant monitoring and intervention.",
  },
  therapist_focus: [
    "Address core belief of 'not being enough' through cognitive restructuring",
    "Develop strategies to reduce rumination and improve sleep hygiene",
    "Enhance self-compassion and acceptance practices to counteract judgment",
    "Monitor physical tension and incorporate body-based relaxation techniques",
    "Support gradual exposure to vulnerability and permission to experience emotions without immediate fixing",
  ],
  clinical_interpretations: [
    "The interplay of cognitive distortions sustains a maladaptive loop of anxiety and self-criticism.",
    "Physical symptoms are somatic expressions of chronic psychological stress and unprocessed emotional states.",
    "Emerging self-compassion indicates therapeutic leverage to disrupt negative cycles and build resilience.",
    "Silent rules about weakness contribute to emotional suppression and heightened internal pressure.",
  ],
  treatment_recommendations: [
    "Cognitive Behavioral Therapy focused on identifying and modifying cognitive distortions",
    "Mindfulness-Based Stress Reduction to increase present-moment awareness and reduce rumination",
    "Progressive muscle relaxation or biofeedback to alleviate physical tension",
    "Sleep hygiene education and cognitive techniques to improve sleep onset",
    "Compassion-Focused Therapy elements to foster self-kindness and reduce shame",
  ],
  professional_language: [
    "The client demonstrates pervasive cognitive distortions including mental filtering and overgeneralization that maintain a chronic anxiety state.",
    "Somatic manifestations such as sustained muscle tension reflect prolonged sympathetic activation.",
    "The client's emerging capacity for self-compassion represents a critical therapeutic resource.",
    "Interventions should prioritize cognitive restructuring alongside somatic regulation and emotional acceptance.",
    "Continued assessment of risk is recommended given sleep disturbance and emotional exhaustion.",
  ],
  clinical_insights: [
    "Targeting the core belief of inadequacy can reduce self-judgment and anxiety.",
    "Interrupting rumination through behavioral and mindfulness strategies may improve sleep and cognitive load.",
    "Incorporating grounding and self-affirmation techniques supports emotional regulation.",
    "Validating vulnerability and permitting emotional experience without immediate problem-solving can decrease internal pressure.",
    "Physical tension serves as a somatic indicator of psychological distress and a point of intervention.",
  ],
};

export const mockBasicDiagnosis: BasicDiagnostic = {
  whats_happening: [
    {
      text: "**Persistent mental checklist and rumination** keep the mind in a state of overwhelm, feeding a cycle of anxiety and exhaustion. This is paired with **chronic physical tension**—tight shoulders, clenched jaw, restless chest—that signals a body braced for threat even during rest. The user’s experience reveals a deep **fear of not being enough** beneath the surface of task-related stress.",
      confidence: "high",
    },
    {
      text: "There is a strong pattern of **self-judgment and internal criticism**, which amplifies anxiety and physical tension. Yet, moments of mindful awareness and gentle curiosity toward these sensations create *small pockets of relief* and shift the relationship from resistance to acceptance.",
      confidence: "high",
    },
  ],
  hidden_rules: [
    {
      rule: "I must never show weakness or panic",
      description:
        "This rule creates a **pressure to perform flawlessly and hide vulnerability**, leading to constant tension and self-judgment. The body’s physical bracing and the mental checklist reflect this silent demand to stay 'strong' at all costs, making rest and acceptance feel unsafe or like failure.",
      rigidity: "moderate",
      confidence: "high",
    },
    {
      rule: "I have to keep fixing things to be okay",
      description:
        "The user’s urge to 'power through' and immediately resolve anxiety triggers (like clearing the inbox) reveals a **habit of problem-solving as a way to earn safety and self-worth**. This blocks permission to simply *be* with discomfort and fuels exhaustion.",
      rigidity: "moderate",
      confidence: "high",
    },
  ],
  why_heavy: [
    {
      title: "The Endless Checklist Loop",
      description:
        "The mental checklist triggers anxiety → anxiety fuels physical tension and restlessness → tension and restlessness increase the urgency to check and fix → failing to fully catch up triggers self-judgment and fear of inadequacy → this fear feeds back into the checklist growing longer. This loop keeps the user feeling perpetually behind and worn down.",
      confidence: "high",
    },
    {
      title: "The Silent Weight of Not Enough",
      description:
        "Beneath task anxiety lies a quiet but persistent fear: 'I am not enough.' This belief colors all stress and fuels self-criticism, making every moment of tension feel like personal failure. Attempts to suppress or fix this feeling only deepen exhaustion and disconnection from self.",
      confidence: "high",
    },
  ],
  meta_patterns: [
    {
      title: "Recurring Rumination and Physical Brace",
      description:
        "Across sessions, the user repeatedly returns to **rumination about tasks and self-worth**, paired with **chronic body tension**. This pattern reinforces anxiety and exhaustion, yet also reveals emerging awareness and willingness to experiment with self-compassion and mindful pauses.",
      confidence: "high",
    },
  ],
  leverage_points: [
    {
      title: "Pausing Before Reacting to Anxiety Triggers",
      description:
        "Choosing to hold a mug instead of immediately checking the phone, or taking a slow breath before responding to an email, interrupts the automatic 'fix it now' response. This pause creates space to notice underlying feelings of fear and inadequacy, allowing the user to respond with curiosity instead of judgment.",
      confidence: "high",
    },
    {
      title: "Gentle Self-Affirmation in Moments of Tension",
      description:
        "Placing a hand on the chest and quietly affirming 'it's okay' offers a tangible anchor that soothes the nervous system and challenges the silent rule that weakness must be hidden. This small act embodies permission to feel tired and vulnerable without needing to fix it immediately.",
      confidence: "high",
    },
  ],
  where_to_start: [
    {
      title: "One Slow Breath at the Desk",
      description:
        "Taking one real, slow breath when noticing jaw clenching or tension is a gentle, accessible step that shifts the relationship to discomfort from resistance to acceptance. It feels manageable and introduces the possibility of release without pressure.",
      difficulty: "gentle",
    },
    {
      title: "Holding the Mug Instead of Checking the Phone",
      description:
        "When the urge to check emails arises, simply holding the mug and noticing the anxious pull creates a moment of choice and curiosity. This micro-step softens the urgency and opens space to explore underlying fears, making it feel safer to pause.",
      difficulty: "gentle",
    },
    {
      title: "Quietly Whispering 'It's Okay' in the Morning",
      description:
        "Starting the day with a mindful breath and a soft self-affirmation sets a tone of self-compassion and grounding. This small ritual offers a secret source of steadiness and a loving counterweight to the pressure to perform.",
      difficulty: "gentle",
    },
  ],
  relevant_resources: [
    {
      category: "mindfulness-techniques",
      goal: "cultivating awareness and acceptance of physical tension and anxious thoughts",
      difficulty: "beginner",
    },
    {
      category: "self-compassion",
      goal: "learning to soothe self-judgment and embrace vulnerability",
      difficulty: "beginner",
    },
    {
      category: "anxiety-management",
      goal: "developing practical strategies to interrupt rumination and reduce overwhelm",
      difficulty: "beginner",
    },
  ],
};

export const mockBasicDiagnosis2 = {
  whats_happening: [
    {
      text: "**Relentless mental checklist** that never feels done, fueling *a sense of always being behind* and overwhelmed",
      confidence: "high",
    },
    {
      text: "**Physical tension as a constant companion**—shoulders tight, jaw clenched, chest restless—even during supposed rest",
      confidence: "high",
    },
    {
      text: "**Habitual rumination and self-judgment** that replay past and future worries, creating a noisy inner world",
      confidence: "high",
    },
    {
      text: "*Fear of not being enough* quietly underpins anxiety about tasks and performance, making pressure feel deeply personal",
      confidence: "high",
    },
    {
      text: "**Emerging curiosity and self-compassion** gently interrupt harsh self-criticism, offering moments of relief and new possibilities",
      confidence: "medium",
    },
  ],
  hidden_rules: [
    {
      rule: "I must not show weakness or panic",
      description:
        "This rule fuels a **quiet pressure to always appear in control**, making it hard to *allow vulnerability* without judgment. It shapes how tension is carried—like bracing for the next challenge—and how self-compassion feels unfamiliar or even risky.",
      rigidity: "moderate",
      confidence: "high",
    },
    {
      rule: "I have to fix or solve my feelings to be okay",
      description:
        "This belief turns *natural tiredness and anxiety* into problems to be eradicated, which feeds the exhausting loop of pushing through and *never fully resting*. It also makes simple noticing feel ‘passive’ or insufficient, even though it’s actually a powerful shift.",
      rigidity: "moderate",
      confidence: "high",
    },
  ],
  why_heavy: [
    {
      title: "The Unstoppable Checklist Loop",
      description:
        "The mental checklist grows longer no matter how many tasks are done, triggering anxiety and physical tension. This fuels a restless body and racing mind that make it hard to rest or feel accomplished. The fear of ‘not being enough’ hides beneath the surface, so every undone item feels like a personal failure, keeping the cycle spinning.",
      confidence: "high",
    },
    {
      title: "Judgment–Tension Trap",
      description:
        "Self-judgment acts like a loud inner critic that exhausts emotional energy and tightens the body. This makes moments of rest feel unsafe or incomplete, so tension stays ‘on’ even during downtime. The user’s emerging curiosity and compassion quietly challenge this trap, but it takes courage to stay with discomfort without trying to fix it.",
      confidence: "high",
    },
  ],
  meta_patterns: [
    {
      title: "**Self-worth tightly linked to productivity and control**",
      description:
        "Across sessions, there’s a clear pattern where *feeling enough* depends on managing tasks perfectly and controlling anxiety triggers like email. When this feels threatened, the body tenses and the mind spirals. Yet, there’s also a growing thread of *allowing imperfection* and *embracing vulnerability* as a new way forward.",
      confidence: "high",
    },
  ],
  leverage_points: [
    {
      title: "**Pause before reacting to anxiety triggers**",
      description:
        "Noticing the urge to check emails or ‘power through’ tension, then choosing to pause—like holding a mug or placing a hand on the chest—creates a *tiny but powerful space* to feel what’s really underneath. This is an experiment in shifting from reacting to responding with kindness and curiosity.",
      confidence: "high",
    },
    {
      title: "**Gentle permission to feel tired without fixing it**",
      description:
        "Allowing the body’s tightness and mental exhaustion to simply be felt, without rushing to release or solve, opens a *quiet space of acceptance*. This challenges the deep-seated rule that feelings must be ‘fixed’ and invites a new kind of strength in stillness.",
      confidence: "medium",
    },
  ],
  where_to_start: [
    {
      title: "Try *noticing* the urge to check your inbox without acting on it",
      description:
        "This matters because it gently interrupts the automatic cycle of anxiety and action, creating a small pocket of calm. It can feel safe and manageable by pairing it with a comforting action—like holding a warm mug—and reminding yourself softly, *‘it’s okay’*.",
      difficulty: "gentle",
    },
    {
      title: "Place a hand on your chest and take one slow, intentional breath",
      description:
        "This micro-step grounds you in the present and connects you to a part of yourself that is steady and enough. It’s a simple way to *invite calm* and *soften tension* without pressure to change anything immediately.",
      difficulty: "gentle",
    },
  ],
  relevant_resources: [
    {
      category: "mindfulness-techniques",
      goal: "practice noticing tension",
      difficulty: "beginner",
    },
    {
      category: "self-compassion",
      goal: "allow small moments of calm",
      difficulty: "beginner",
    },
    {
      category: "anxiety-management",
      goal: "pause before reacting to triggers",
      difficulty: "beginner",
    },
  ],
};
