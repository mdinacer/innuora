// import { Session } from "@/domains/open-chat/open-chat.types";
// import { AdvancedDiagnostic } from "@/lib/zod/advanced-diagnostic.schema";
// import { BasicDiagnostic } from "@/lib/zod/basic-diagnostic.schema";

import { AdvancedDiagnostic } from "@/lib/zod/advanced-diagnostic.schema";
import { BasicDiagnostic } from "@/lib/zod/basic-diagnostic.schema";

export const sampleSession = {
  id: "4f0cb31c-cba4-4930-9ea5-2de6b81b4f22",
  userId: "cmgglrem900006k7qpwoshnww",
  title: "Care Network Check-in",
  subtitle: "",
  autoUpdateTitle: true,
  createdAt: new Date("2024-09-12T14:18:03.000Z"),
  updatedAt: new Date("2024-09-12T14:29:45.000Z"),
  messages: [
    {
      id: "initial-message",
      role: "assistant",
      content:
        "Hi there. I'm here to listen. What's been on your mind lately? Take your time. Just start wherever feels right.",
      timestamp: 1759854500000,
    },
    {
      id: "msg_A1S3kL0pQn",
      role: "user",
      content:
        "I don't really know how to answer that. Everyone says I'm \"handling it,\" but I feel like I'm sleepwalking through the week. I get up, do the meetings, send the emails, and meanwhile my chest feels like it's holding a fuse that's almost out. I can't even explain what exactly is wrong.",
      timestamp: 1759854540000,
    },
    {
      id: "msg_Bz9EwLf0Tr",
      role: "assistant",
      content:
        "It sounds like you're keeping everything moving on the outside while carrying a lot of pressure inside. When that fuse-in-your-chest feeling shows up, what do you notice happening around you or inside your body?",
      timestamp: 1759854555000,
    },
    {
      id: "msg_Q4mDzXe7Us",
      role: "user",
      content:
        "Usually nothing dramatic. I'm just sitting in a meeting nodding along, or finishing slide decks at midnight. On the outside I'm fine. Inside it feels jittery and hollow, like I'm waiting for someone to notice I'm not okay, but if they did I'd probably freeze because I don't know how to explain it.",
      timestamp: 1759854598000,
    },
    {
      id: "msg_Km7SdH4pQa",
      role: "assistant",
      content:
        "That sounds so lonely—craving someone to notice while also not having words ready. Your body sounds like it's on high alert even in calm moments. How long have you been carrying that restless, hollow feeling?",
      timestamp: 1759854613000,
    },
    {
      id: "msg_Zp8LmN2cHr",
      role: "user",
      content:
        "I think it started when Mom had her surgery last winter. I volunteered to organize everything for a few months. It's almost a year later, and I'm still the one keeping everyone on track at home and at work. I keep telling myself it's temporary, but nothing is easing.",
      timestamp: 1759854657000,
    },
    {
      id: "msg_Uv1JaX5lPr",
      role: "assistant",
      content:
        "You stepped in to hold so much for everyone, and it never really paused. No wonder your system is tired. What happens inside you when you imagine letting some of those plates slow down, even for a minute?",
      timestamp: 1759854672000,
    },
    {
      id: "msg_Mg5LnA7wCe",
      role: "user",
      content:
        "If I even hint at slowing down, everyone looks at me like I have the master plan. My siblings ping me for updates, my team asks if I signed off. It's easier to just keep saying yes than feel the panic in the room when I pause.",
      timestamp: 1759854688000,
    },
    {
      id: "msg_Vc4TpQ9nLs",
      role: "assistant",
      content:
        "Staying on point sounds like the quickest way to keep everyone calm, even if it drains you. When you give that quick yes, what signals show up in your body afterward?",
      timestamp: 1759854696000,
    },
    {
      id: "msg_Fw6LaQ0sYd",
      role: "user",
      content:
        "I hear myself doing these tiny sighs all day. I keep extra lists hidden in my notebook so my team doesn't see me scrambling. At night I scroll until my eyes burn because if I put the phone down the quiet gets too loud and I start thinking about everything I missed.",
      timestamp: 1759854715000,
    },
    {
      id: "msg_Yn3FgD8sWt",
      role: "assistant",
      content:
        "Those hidden lists and late-night scrolling sound like ways to keep the volume down on that loud quiet. When the quiet sneaks in, what feelings or memories start to show up?",
      timestamp: 1759854730000,
    },
    {
      id: "msg_Jt5PwV9kRb",
      role: "user",
      content:
        "The quiet reminds me of promises I made to myself. Paint more. Call my sister back. Sleep eight hours. Instead I end up re-washing dishes or double-checking calendars. Then I feel guilty for even wanting rest when people are counting on me.",
      timestamp: 1759854772000,
    },
    {
      id: "msg_Po2VzK7dLc",
      role: "assistant",
      content:
        "There's such a tender mix there—wanting simple care for yourself and then feeling guilty for even considering it. That guilt sounds heavy. What does your body do when you notice it?",
      timestamp: 1759854787000,
    },
    {
      id: "msg_Ct9HdE4sVm",
      role: "user",
      content:
        "It spikes up through my shoulders and into my throat. I start rubbing the back of my neck so hard it stings, and I chew the inside of my cheek until I taste metal. It's like my body is bracing for someone to be disappointed.",
      timestamp: 1759854808000,
    },
    {
      id: "msg_Xk6NsR2oPw",
      role: "assistant",
      content:
        "That bracing shows how prepared you are for backlash, even when no one is actually upset. Can you remember a recent moment when that tension took over the rest of your day?",
      timestamp: 1759854815000,
    },
    {
      id: "msg_Ne3CxL8vTs",
      role: "user",
      content:
        'I tried taking a Friday off last month. I spent the morning checking email "just in case," then I reorganized the pantry, then I cleaned the garage. By dinner I was more exhausted than if I\'d gone to work.',
      timestamp: 1759854831000,
    },
    {
      id: "msg_Se4XcM2hBn",
      role: "assistant",
      content:
        "That day off turned into another full shift of caretaking and control. It makes sense your body didn't get the rest it craved. If rest felt safer, what might you have needed most that day?",
      timestamp: 1759854846000,
    },
    {
      id: "msg_Ko1RfT6nYq",
      role: "user",
      content:
        "Yeah. Last Sunday I tried to nap while the laundry ran, and my daughter walked in asking where her uniform was. I snapped, then spent the rest of the night re-folding everything so no one would think I was slacking.",
      timestamp: 1759854868000,
    },
    {
      id: "msg_Yt7PwL4fDs",
      role: "assistant",
      content:
        "Snapping and then over-correcting sounds exhausting and lonely, like you had to prove the kindness again. What did that part of you need in that moment besides refolding everything?",
      timestamp: 1759854882000,
    },
    {
      id: "msg_Bh7QwP1zLf",
      role: "user",
      content:
        "Part of me wishes I'd just wake up with a fever so I could stay in bed and no one would argue. Then I feel awful for even thinking that because people deal with real emergencies.",
      timestamp: 1759854890000,
    },
    {
      id: "msg_Tq6LbG9fHv",
      role: "assistant",
      content:
        "That wish shows how much permission your body is begging for, and how quickly you judge yourself for needing it. There's a voice that says rest has to be justified by illness. What do you think that voice is trying to protect?",
      timestamp: 1759854905000,
    },
    {
      id: "msg_Rv4MnK6sTd",
      role: "user",
      content:
        "I keep picturing myself sitting in the car for a minute before walking inside, just breathing. But immediately I hear, \"don't be dramatic, dinner won't cook itself.\" I don't know how to disagree with that voice without feeling lazy.",
      timestamp: 1759854948000,
    },
    {
      id: "msg_Wa5NdP3rJc",
      role: "assistant",
      content:
        "That voice sounds strict and familiar, maybe an old rule about proving your worth by always moving. If you could give that voice a gentle nod, what might another, quieter part of you say about pausing in the car?",
      timestamp: 1759854963000,
    },
    {
      id: "msg_Lc2HgF5yUn",
      role: "user",
      content:
        "Maybe it would say it's only two minutes and no one will even notice. I could just sit there with my phone off and feel the steering wheel and check in with my shoulders. I'm scared I'll fail at relaxing too, which sounds ridiculous even as I say it.",
      timestamp: 1759855007000,
    },
    {
      id: "msg_Hd8KvS4mLp",
      role: "assistant",
      content:
        "It isn't ridiculous at all—it shows how rest has been turned into another performance. Sitting in the car for two quiet minutes, just noticing your shoulders, could be a small experiment, not a test. How would it be to treat that pause like a gift you're allowed to receive, even if it feels unfamiliar?",
      timestamp: 1759855022000,
    },
    {
      id: "msg_Sv8YcQ3pNd",
      role: "user",
      content:
        "Even hearing that, there's a voice rolling its eyes. It says, \"two minutes won't fix years of backlog, you're being dramatic.\" That voice is louder than anything else.",
      timestamp: 1759855038000,
    },
    {
      id: "msg_Bk6RfT1wUz",
      role: "assistant",
      content:
        "That eye-roll is so sharp, and it has probably kept you moving for years. If we thanked it for working so hard, what tiny sign would let you know it's safe to ease for just a moment?",
      timestamp: 1759855050000,
    },
    {
      id: "msg_Pd4LmJ7qXs",
      role: "user",
      content:
        "Maybe my hands would stop buzzing. Last weekend I dropped a pot and just stood there shaking. If they could rest on my lap without twitching, that would feel like proof I'm not about to lose control.",
      timestamp: 1759855064000,
    },
    {
      id: "msg_Gn9UtE5vQh",
      role: "assistant",
      content:
        "Hands resting without buzzing sounds like the permission you're craving. Who, if anyone, could sit beside you in that pause or help guard that space so it doesn't get filled immediately?",
      timestamp: 1759855072000,
    },
    {
      id: "msg_Wq2FsH8cRt",
      role: "user",
      content:
        "My sister actually offered to handle Thursday dinners but I told her I had it. Asking now feels so late, like I'm admitting I never had it together.",
      timestamp: 1759855086000,
    },
    {
      id: "msg_Tm7ZcP6yVd",
      role: "assistant",
      content:
        "Admitting it now could also be you trusting her with the truth. Would you be open to testing it here—maybe drafting the text while we breathe—and noticing how your body responds?",
      timestamp: 1759855098000,
    },
    {
      id: "msg_Qm2JxS9fYp",
      role: "user",
      content:
        "While you were talking I let my hands rest in my lap and typed out the text to my sister without sending it. The fuse feeling didn't disappear, but it flickered softer for a second. Maybe two minutes in the car won't make everything fall apart.",
      timestamp: 1759855112000,
    },
    {
      id: "msg_Xr4LfA2vBn",
      role: "assistant",
      content:
        "That flicker softening shows your body can respond even to a single breath. If you were to honor that pause after work, what could remind you to take it and who might help carry one small piece while you do?",
      timestamp: 1759855122000,
    },
    {
      id: "msg_Ds7PoK4mZe",
      role: "user",
      content:
        "I can set a little reminder that pops up before I park—I'll call it my \"two-minute defrost.\" And I'm going to text my sister to take Thursday dinner next week. Saying it is wobbly, but it feels like air getting back in.",
      timestamp: 1759855136000,
    },
    {
      id: "msg_Gh5WtN8qYs",
      role: "assistant",
      content:
        "You just gave yourself permission in real time and lined up support to protect it. Notice how your chest and shoulders feel as you imagine that reminder and your sister stepping in—what do you want to hold onto from this moment?",
      timestamp: 1759855150000,
    },
    {
      id: "msg_Fr6NyL2dWp",
      role: "user",
      content:
        "There's still a tired ache around my ribs, but it's steadier. I'm going to send the text after we finish and actually wait for her reply instead of filling the space. I'm holding onto how my hands feel heavier, not buzzing.",
      timestamp: 1759855162000,
    },
    {
      id: "msg_Lr3QwB8nUz",
      role: "assistant",
      content:
        'That steadier ache and the heavier hands are signals that your body believes this pause is real. Keep checking in with that "defrost" reminder tonight, and let the help you invited in stay beside you.',
      timestamp: 1759855175000,
    },
  ],
  continuitySummary: `
The user shared detailed accounts of their experiences with social anxiety, describing feelings of avoidance, discomfort in social settings, and the impact on their daily life. They expressed concerns about judgment from others and difficulties initiating conversations. The assistant reflected on these challenges, validating the user's feelings and highlighting the commonality of such experiences. It offered insights into the cognitive patterns underlying social anxiety, such as negative self-talk and anticipatory fear. The assistant suggested micro-actions like practicing small social interactions, mindfulness exercises, and gradual exposure to anxiety-provoking situations to build confidence. Throughout, the assistant emphasized patience and self-compassion, encouraging the user to recognize progress in manageable steps. The conversation maintained a supportive tone, focusing on understanding the user's emotional landscape and promoting incremental behavioral experiments.`.trim(),
  aggregatedAnalysis: `
Distortions identified: emotional_reasoning (moderate), mental_filter (moderate), jumping_conclusions (moderate), personalization (moderate), catastrophizing (moderate), overgeneralization (moderate), should_statements (moderate), all_or_nothing (mild), labeling (mild)
Recurring themes: emotional exhaustion while high functioning (frequent), sustained caregiving load (frequent), avoidance through busyness and scrolling (frequent), guilt around rest and creativity (frequent), internalized shoulds about productivity (frequent), longing for sanctioned rest (frequent), pressure to stay indispensable (frequent), fear of burdening others (occasional), hyper-responsibility rebound after slips (occasional), experimenting with micro-rest rituals (occasional), accepting shared support (occasional), body awareness and regulation (occasional)
Core beliefs emerged: If I slow down, everything falls apart; My worth depends on keeping everything running
Silent rules detected: rest must be earned by crisis (rigid), don't add to anyone else's load (moderate)
Behavioral patterns: perfectionism (moderate), rumination (moderate), perfectionism (moderate), perfectionism (moderate), rumination (mild), perfectionism (moderate), rumination (mild), avoidance (moderate), perfectionism (moderate), rumination (mild), perfectionism (moderate), rumination (mild), perfectionism (moderate), rumination (mild), perfectionism (moderate), rumination (mild), avoidance (mild), rumination (mild)`.trim(),
  analysisSnapshots: [
    {
      core_module: "validate",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [
        {
          type: "emotional_reasoning",
          severity: "moderate",
        },
        {
          type: "mental_filter",
          severity: "moderate",
        },
      ],
      themes: [
        {
          theme: "emotional exhaustion while appearing composed",
          frequency: "frequent",
        },
        {
          theme: "body holding chronic tension",
          frequency: "frequent",
        },
      ],
      core_beliefs: [],
      silent_rules: [],
      behavioral_patterns: [
        {
          type: "perfectionism",
          severity: "moderate",
        },
      ],
      state: "first_time",
      therapeutic_readiness: "ambivalent",
      update_memory: true,
      recall_memory: false,
      analysis_value: "high",
      messageId: "msg_A1S3kL0pQn",
    },
    {
      core_module: "validate",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [
        {
          type: "jumping_conclusions",
          severity: "moderate",
        },
        {
          type: "personalization",
          severity: "moderate",
        },
      ],
      themes: [
        {
          theme: "loneliness behind competence",
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
      therapeutic_readiness: "ambivalent",
      update_memory: false,
      recall_memory: false,
      analysis_value: "medium",
      messageId: "msg_Q4mDzXe7Us",
    },
    {
      core_module: "validate",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [
        {
          type: "catastrophizing",
          severity: "moderate",
        },
        {
          type: "overgeneralization",
          severity: "moderate",
        },
      ],
      themes: [
        {
          theme: "sustained caregiving responsibility",
          frequency: "frequent",
        },
      ],
      core_beliefs: [
        {
          belief: "If I slow down, everything falls apart",
        },
      ],
      silent_rules: [],
      behavioral_patterns: [
        {
          type: "perfectionism",
          severity: "moderate",
        },
      ],
      state: "returning",
      therapeutic_readiness: "engaged",
      update_memory: true,
      recall_memory: false,
      analysis_value: "medium",
      messageId: "msg_Zp8LmN2cHr",
    },
    {
      core_module: "shoulds",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [
        {
          type: "should_statements",
          severity: "moderate",
        },
        {
          type: "emotional_reasoning",
          severity: "mild",
        },
      ],
      themes: [
        {
          theme: "pressure to stay indispensable",
          frequency: "frequent",
        },
      ],
      core_beliefs: [],
      silent_rules: [],
      behavioral_patterns: [
        {
          type: "avoidance",
          severity: "mild",
        },
      ],
      state: "returning",
      therapeutic_readiness: "ambivalent",
      update_memory: true,
      recall_memory: false,
      analysis_value: "medium",
      messageId: "msg_Mg5LnA7wCe",
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
          severity: "mild",
        },
      ],
      themes: [
        {
          theme: "avoidance through late-night scrolling",
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
      recall_memory: false,
      analysis_value: "medium",
      messageId: "msg_Fw6LaQ0sYd",
    },
    {
      core_module: "shoulds",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [
        {
          type: "should_statements",
          severity: "moderate",
        },
        {
          type: "emotional_reasoning",
          severity: "mild",
        },
      ],
      themes: [
        {
          theme: "guilt when prioritizing rest",
          frequency: "frequent",
        },
      ],
      core_beliefs: [
        {
          belief: "My worth depends on keeping everything running",
        },
      ],
      silent_rules: [],
      behavioral_patterns: [
        {
          type: "perfectionism",
          severity: "moderate",
        },
      ],
      state: "returning",
      therapeutic_readiness: "engaged",
      update_memory: true,
      recall_memory: false,
      analysis_value: "medium",
      messageId: "msg_Jt5PwV9kRb",
    },
    {
      core_module: "mindfulness",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [
        {
          type: "emotional_reasoning",
          severity: "mild",
        },
      ],
      themes: [
        {
          theme: "body bracing for disappointment",
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
      update_memory: true,
      recall_memory: false,
      analysis_value: "medium",
      messageId: "msg_Ct9HdE4sVm",
    },
    {
      core_module: "mindfulness",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [
        {
          type: "all_or_nothing",
          severity: "mild",
        },
      ],
      themes: [
        {
          theme: "difficulty unplugging during planned rest",
          frequency: "frequent",
        },
      ],
      core_beliefs: [],
      silent_rules: [],
      behavioral_patterns: [
        {
          type: "avoidance",
          severity: "moderate",
        },
      ],
      state: "returning",
      therapeutic_readiness: "ambivalent",
      update_memory: true,
      recall_memory: false,
      analysis_value: "medium",
      messageId: "msg_Ne3CxL8vTs",
    },
    {
      core_module: "validate",
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
          theme: "hyper-responsibility rebound",
          frequency: "occasional",
        },
      ],
      core_beliefs: [],
      silent_rules: [],
      behavioral_patterns: [
        {
          type: "perfectionism",
          severity: "moderate",
        },
      ],
      state: "returning",
      therapeutic_readiness: "engaged",
      update_memory: true,
      recall_memory: false,
      analysis_value: "medium",
      messageId: "msg_Ko1RfT6nYq",
    },
    {
      core_module: "validate",
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
          type: "should_statements",
          severity: "moderate",
        },
      ],
      themes: [
        {
          theme: "longing for sanctioned rest",
          frequency: "frequent",
        },
      ],
      core_beliefs: [],
      silent_rules: [
        {
          rule: "Rest must be earned by crisis",
          rigidity: "rigid",
        },
      ],
      behavioral_patterns: [
        {
          type: "rumination",
          severity: "mild",
        },
      ],
      state: "returning",
      therapeutic_readiness: "ambivalent",
      update_memory: true,
      recall_memory: false,
      analysis_value: "medium",
      messageId: "msg_Bh7QwP1zLf",
    },
    {
      core_module: "shoulds",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [
        {
          type: "should_statements",
          severity: "moderate",
        },
      ],
      themes: [
        {
          theme: "inner critic resisting pauses",
          frequency: "frequent",
        },
      ],
      core_beliefs: [],
      silent_rules: [
        {
          rule: "Don't add to anyone else's load",
          rigidity: "moderate",
        },
      ],
      behavioral_patterns: [
        {
          type: "perfectionism",
          severity: "moderate",
        },
      ],
      state: "established",
      therapeutic_readiness: "engaged",
      update_memory: false,
      recall_memory: true,
      analysis_value: "medium",
      messageId: "msg_Rv4MnK6sTd",
    },
    {
      core_module: "shoulds",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [
        {
          type: "should_statements",
          severity: "moderate",
        },
        {
          type: "labeling",
          severity: "mild",
        },
      ],
      themes: [
        {
          theme: "protective inner critic",
          frequency: "frequent",
        },
      ],
      core_beliefs: [],
      silent_rules: [
        {
          rule: "Rest must be earned by crisis",
          rigidity: "rigid",
        },
      ],
      behavioral_patterns: [
        {
          type: "perfectionism",
          severity: "moderate",
        },
      ],
      state: "established",
      therapeutic_readiness: "engaged",
      update_memory: true,
      recall_memory: false,
      analysis_value: "medium",
      messageId: "msg_Sv8YcQ3pNd",
    },
    {
      core_module: "mindfulness",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [
        {
          type: "emotional_reasoning",
          severity: "mild",
        },
      ],
      themes: [
        {
          theme: "body awareness and regulation",
          frequency: "occasional",
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
      state: "established",
      therapeutic_readiness: "engaged",
      update_memory: true,
      recall_memory: false,
      analysis_value: "medium",
      messageId: "msg_Pd4LmJ7qXs",
    },
    {
      core_module: "guidance",
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
          theme: "fear of burdening others",
          frequency: "occasional",
        },
      ],
      core_beliefs: [],
      silent_rules: [
        {
          rule: "Don't add to anyone else's load",
          rigidity: "moderate",
        },
      ],
      behavioral_patterns: [
        {
          type: "perfectionism",
          severity: "moderate",
        },
      ],
      state: "established",
      therapeutic_readiness: "engaged",
      update_memory: true,
      recall_memory: true,
      analysis_value: "medium",
      messageId: "msg_Wq2FsH8cRt",
    },
    {
      core_module: "mindfulness",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [
        {
          type: "catastrophizing",
          severity: "mild",
        },
        {
          type: "emotional_reasoning",
          severity: "mild",
        },
      ],
      themes: [
        {
          theme: "experimenting with gentle pauses",
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
      state: "established",
      therapeutic_readiness: "engaged",
      update_memory: false,
      recall_memory: true,
      analysis_value: "medium",
      messageId: "msg_Lc2HgF5yUn",
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
          severity: "mild",
        },
      ],
      themes: [
        {
          theme: "experimenting with micro-rest rituals",
          frequency: "occasional",
        },
        {
          theme: "body awareness and regulation",
          frequency: "occasional",
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
      state: "established",
      therapeutic_readiness: "engaged",
      update_memory: true,
      recall_memory: true,
      analysis_value: "medium",
      messageId: "msg_Qm2JxS9fYp",
    },
    {
      core_module: "guidance",
      process_module: null,
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [],
      themes: [
        {
          theme: "accepting shared support",
          frequency: "occasional",
        },
        {
          theme: "experimenting with micro-rest rituals",
          frequency: "occasional",
        },
      ],
      core_beliefs: [],
      silent_rules: [
        {
          rule: "Don't add to anyone else's load",
          rigidity: "moderate",
        },
      ],
      behavioral_patterns: [
        {
          type: "perfectionism",
          severity: "moderate",
        },
      ],
      state: "established",
      therapeutic_readiness: "engaged",
      update_memory: true,
      recall_memory: true,
      analysis_value: "high",
      messageId: "msg_Ds7PoK4mZe",
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
          theme: "body awareness and regulation",
          frequency: "occasional",
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
      state: "established",
      therapeutic_readiness: "engaged",
      update_memory: false,
      recall_memory: false,
      analysis_value: "medium",
      messageId: "msg_Fr6NyL2dWp",
    },
  ],
  sessionDiagnostics: null,
  metadata: {
    messageCount: 37,
    tokenCount: 30840,
    inputTokens: 27920,
    outputTokens: 2920,
    costUSD: 0,
    creditsUsed: 0,
    activeDurationMs: 780000,
    lastActiveAt: new Date("2024-09-12T14:29:45.000Z"),
    tokenUsage: [],
  },
  persistOnCloud: false,
};

export const sampleSessionSummary = `
The user shared detailed accounts of their experiences with social anxiety, describing feelings of avoidance, discomfort in social settings, and the impact on their daily life. They expressed concerns about judgment from others and difficulties initiating conversations. The assistant reflected on these challenges, validating the user's feelings and highlighting the commonality of such experiences. It offered insights into the cognitive patterns underlying social anxiety, such as negative self-talk and anticipatory fear. The assistant suggested micro-actions like practicing small social interactions, mindfulness exercises, and gradual exposure to anxiety-provoking situations to build confidence. Throughout, the assistant emphasized patience and self-compassion, encouraging the user to recognize progress in manageable steps. The conversation maintained a supportive tone, focusing on understanding the user's emotional landscape and promoting incremental behavioral experiments.`.trim();

export const sampleSessionMemory: string[] = [
  "Organized family and work responsibilities since mother's surgery last winter, continuing for almost a year",
  "Maintains multiple hidden to-do lists to manage work tasks and family updates",
  "Experiences physical tension including shoulder and throat tightness, neck rubbing, and cheek biting",
  "Tried taking a day off but spent time checking emails and doing household chores instead of resting",
  "Snapped at daughter during an attempted nap and then re-folded laundry to avoid appearing negligent",
  "Avoids asking sister for help with Thursday dinners but recently typed a text to request assistance",
  "Plans to implement a two-minute pause in the car before entering the house as a relaxation strategy",
  "Notices reduced physical tension and plans to wait for sister’s reply after sending the dinner help request",
];

export const sampleSessionAnalysis = `
- Total analyses: 18
- Emotional intensity patterns: moderate, moderate, moderate, moderate, moderate, moderate, moderate, moderate, moderate, moderate, moderate, moderate, moderate, moderate, moderate, moderate, moderate, moderate
- Crisis levels observed: none, none, none, none, none, none, none, none, none, none, none, none, none, none, none, none, none, none
- Therapeutic readiness: ambivalent, ambivalent, engaged, ambivalent, engaged, engaged, engaged, ambivalent, engaged, ambivalent, engaged, engaged, engaged, engaged, engaged, engaged, engaged, engaged

Distortions identified: emotional_reasoning (moderate), mental_filter (moderate), jumping_conclusions (moderate), personalization (moderate), catastrophizing (moderate), overgeneralization (moderate), should_statements (moderate), emotional_reasoning (mild), mental_filter (mild), should_statements (moderate), emotional_reasoning (mild), emotional_reasoning (mild), all_or_nothing (mild), personalization (moderate), labeling (mild), should_statements (moderate), should_statements (moderate), should_statements (moderate), labeling (mild), emotional_reasoning (mild), personalization (moderate), catastrophizing (mild), emotional_reasoning (mild), mental_filter (mild)
Recurring themes: emotional exhaustion while appearing composed (frequent), body holding chronic tension (frequent), loneliness behind competence (frequent), sustained caregiving responsibility (frequent), pressure to stay indispensable (frequent), avoidance through late-night scrolling (frequent), guilt when prioritizing rest (frequent), body bracing for disappointment (frequent), difficulty unplugging during planned rest (frequent), hyper-responsibility rebound (occasional), longing for sanctioned rest (frequent), inner critic resisting pauses (frequent), protective inner critic (frequent), body awareness and regulation (occasional), fear of burdening others (occasional), experimenting with gentle pauses (frequent), experimenting with micro-rest rituals (occasional), body awareness and regulation (occasional), accepting shared support (occasional), experimenting with micro-rest rituals (occasional), body awareness and regulation (occasional)
Core beliefs emerged: If I slow down, everything falls apart; My worth depends on keeping everything running
Silent rules detected: Rest must be earned by crisis (rigid); Don't add to anyone else's load (moderate); Rest must be earned by crisis (rigid); Don't add to anyone else's load (moderate); Don't add to anyone else's load (moderate)
Behavioral patterns: perfectionism (moderate), rumination (moderate), perfectionism (moderate), avoidance (mild), rumination (mild), perfectionism (moderate), rumination (mild), avoidance (moderate), perfectionism (moderate), rumination (mild), perfectionism (moderate), perfectionism (moderate), rumination (mild), perfectionism (moderate), rumination (mild), rumination (mild), perfectionism (moderate), rumination (mild)`.trim();

export const advancedDiagnosisResult: AdvancedDiagnostic = {
  themes: [
    {
      id: "emotional_exhaustion_while_composed",
      title: "Emotional Exhaustion Under a Composed Exterior",
      description:
        "User frequently experiences significant emotional fatigue while maintaining an appearance of competence and control, leading to internal strain.",
      severity: "high",
      trajectory: "stable",
      evidence: [
        "Sustained caregiving responsibility since mother's surgery lasting almost a year",
        "Snapped at daughter during attempted rest, then engaged in chores to avoid appearing negligent",
        "Guilt when prioritizing rest and difficulty unplugging during planned rest",
      ],
    },
    {
      id: "chronic_physical_tension",
      title: "Chronic Physical Tension and Somatic Holding Patterns",
      description:
        "Persistent bodily tension manifests as shoulder and throat tightness, neck rubbing, and cheek biting, often correlating with psychological stress and hypervigilance.",
      severity: "high",
      trajectory: "stable",
      evidence: [
        "Reports of shoulder and throat tightness, neck rubbing, cheek biting",
        "Notices reduced tension after micro-rest rituals like pausing in the car",
        "Body bracing for anticipated disappointment noted",
      ],
    },
    {
      id: "overresponsibility_and_indispensability_beliefs",
      title: "Overresponsibility and Indispensability Beliefs",
      description:
        "User holds core beliefs that slowing down leads to collapse and that self-worth depends on maintaining all family and work systems without burdening others.",
      severity: "high",
      trajectory: "stable",
      evidence: [
        "Maintains multiple hidden to-do lists to manage responsibilities",
        "Avoids asking sister for help despite recent effort to request assistance",
        "Silent rules: 'Rest must be earned by crisis' and 'Don't add to anyone else's load'",
      ],
    },
    {
      id: "avoidance_and_inner_critic_resistance",
      title: "Avoidance Behaviors and Inner Critic Resistance to Rest",
      description:
        "User exhibits avoidance through late-night scrolling and struggles with an inner critic that resists pauses and rest, reinforcing perfectionism and rumination.",
      severity: "medium",
      trajectory: "stable",
      evidence: [
        "Avoids asking for help and experiences guilt when attempting rest",
        "Inner critic described as protective but also obstructive to self-care",
        "Experimenting with micro-rest rituals but with ambivalence",
      ],
    },
  ],
  cognitive_distortions: [
    {
      id: "should_statements",
      title: "Should Statements",
      description:
        "User frequently applies rigid 'should' rules about rest and responsibilities, e.g., 'Rest must be earned by crisis,' which perpetuates guilt and overwork.",
      frequency: 6,
      severity: "moderate",
    },
    {
      id: "personalization",
      title: "Personalization",
      description:
        "User internalizes family and work burdens as solely their responsibility, e.g., avoiding imposing on sister or fearing that slowing down causes collapse.",
      frequency: 5,
      severity: "moderate",
    },
    {
      id: "emotional_reasoning",
      title: "Emotional Reasoning",
      description:
        "User interprets physical tension and emotional exhaustion as evidence of failure or impending breakdown, reinforcing negative self-judgments.",
      frequency: 5,
      severity: "moderate",
    },
    {
      id: "mental_filter",
      title: "Mental Filter",
      description:
        "Focuses on negative aspects such as perceived failures or risks of rest, overshadowing progress or positive coping attempts.",
      frequency: 4,
      severity: "moderate",
    },
    {
      id: "catastrophizing",
      title: "Catastrophizing",
      description:
        "Anticipates worst-case outcomes if responsibilities are delegated or rest is prioritized, e.g., 'If I slow down, everything falls apart.'",
      frequency: 3,
      severity: "moderate",
    },
  ],
  emotional_state: {
    primary: "moderate emotional exhaustion",
    secondary: ["guilt", "anxiety about burdening others", "ambivalence about rest"],
    congruence: "aligned",
  },
  risk_assessment: {
    level: "low",
    notes:
      "No crisis or acute risk identified; emotional intensity is moderate and user demonstrates engagement with therapeutic strategies and insight.",
  },
  therapist_focus: [
    "Address maladaptive core beliefs around indispensability and rest",
    "Enhance self-compassion to reduce guilt linked to rest and help-seeking",
    "Develop and reinforce micro-rest and body regulation strategies",
    "Challenge cognitive distortions such as should statements and catastrophizing",
    "Support gradual delegation and acceptance of shared support",
  ],
  clinical_interpretations: [
    "User's sustained caregiving role and perfectionistic tendencies contribute to chronic emotional exhaustion and somatic tension.",
    "Rigid silent rules and core beliefs maintain a maladaptive cycle of overresponsibility and avoidance of rest.",
    "Cognitive distortions exacerbate internal pressure, guilt, and difficulty disengaging from tasks.",
    "Emerging experimentation with micro-rest and help-seeking indicates therapeutic readiness and leverage points.",
  ],
  treatment_recommendations: [
    "Implement cognitive restructuring targeting should statements and catastrophizing related to rest and delegation.",
    "Introduce compassion-focused interventions to soften inner critic and reduce guilt.",
    "Encourage consistent practice of micro-rest rituals and body awareness techniques to alleviate physical tension.",
    "Facilitate behavioral experiments in asking for and accepting help to dismantle overresponsibility beliefs.",
    "Monitor emotional intensity and ambivalence toward rest to tailor pacing and intervention intensity.",
  ],
  professional_language: [
    "The patient exhibits a pattern of sustained caregiving burden with concomitant perfectionism and rumination, maintaining chronic physiological arousal.",
    "Core schemas of indispensability and conditional self-worth underlie avoidance of rest and help-seeking behaviors.",
    "Cognitive distortions including should statements, personalization, and catastrophizing perpetuate maladaptive coping.",
    "Therapeutic engagement is moderate to high, with evidence of emerging behavioral activation and cognitive insight.",
    "Low acute risk supports a focus on cognitive-behavioral and compassion-based approaches to improve self-care and reduce distress.",
  ],
  clinical_insights: [
    "The intersection of emotional exhaustion and physical tension highlights the importance of integrated mind-body interventions.",
    "User's ambivalence toward rest reflects internalized silent rules that can be gently challenged through psychoeducation and behavioral experiments.",
    "Progress in micro-rest practices and help-seeking requests signals potential for positive shifts in core beliefs and symptom reduction.",
    "Continued monitoring of emotional intensity and engagement will inform adaptive pacing of therapeutic interventions.",
  ],
};

export const basicDiagnosisResult: BasicDiagnostic = {
  whats_happening: [
    {
      text: "**Sustained caregiving and work demands coexist with chronic physical tension and emotional exhaustion**, yet you maintain a composed exterior. This mix fuels a *quiet loneliness* behind competence, alongside a persistent pressure to stay indispensable and avoid burdening others.",
      confidence: "high",
    },
    {
      text: "You experience a pattern of *inner conflict* where the desire to rest is met with guilt and an inner critic urging productivity, leading to avoidance of true rest and hyper-responsibility rebound.",
      confidence: "high",
    },
    {
      text: "Micro-actions like pausing before entering the house and reaching out for help show emerging shifts toward *experimentation with gentle self-care* and *accepting shared support*, which reduce physical tension and emotional load.",
      confidence: "high",
    },
  ],
  hidden_rules: [
    {
      rule: "Rest must be earned by crisis",
      description:
        "This rigid internal rule means *you feel only justified in slowing down when things break down*, reinforcing a cycle where rest is postponed until exhaustion peaks. It fuels perfectionism and rumination as you push to keep everything running flawlessly.",
      rigidity: "rigid",
      confidence: "high",
    },
    {
      rule: "Don't add to anyone else's load",
      description:
        "A moderately rigid rule that fosters hesitation in asking for help, even when overwhelmed. It *silences your needs* to protect others, which paradoxically increases your isolation and internal pressure to perform.",
      rigidity: "moderate",
      confidence: "high",
    },
  ],
  why_heavy: [
    {
      title: "The Weight of Invisible Load",
      description:
        "Carrying sustained caregiving and work responsibilities triggers *chronic physical tension* and emotional exhaustion. The inner critic’s voice whispers that slowing down means failure, so you push through, avoiding rest and connection. This loop cycles through *guilt → tension → avoidance of rest → increased exhaustion*, making the heaviness feel inescapable.",
      confidence: "high",
    },
  ],
  meta_patterns: [
    {
      title: "The Hidden Caretaker Cycle",
      description:
        "Across sessions, your story repeats: managing multiple roles silently, holding tension in body and mind, resisting rest due to inner rules, and experimenting cautiously with small self-care pauses. This pattern reinforces the belief that *your worth depends on keeping everything running* and that rest is a risk, not a refuge.",
      confidence: "high",
    },
  ],
  leverage_points: [
    {
      title: "The Two-Minute Pause Before Home",
      description:
        "This emerging ritual is a powerful moment to *interrupt automatic tension and self-judgment*. It creates a small, safe space to breathe, notice your body, and shift from ‘doing’ to ‘being’. Embracing this pause can slowly loosen the grip of perfectionism and guilt.",
      confidence: "high",
    },
    {
      title: "Asking for Help",
      description:
        "Reaching out to your sister for dinner help cracks open the silent rule of not adding burden. This act models *permission to share load* and invites connection, reducing isolation and emotional weight.",
      confidence: "high",
    },
  ],
  where_to_start: [
    {
      title: "Practice the Two-Minute Pause",
      description:
        "Starting with just two minutes of mindful breathing before entering your home offers a *gentle, non-demanding way to notice tension and invite calm*. It feels safer because it’s brief and self-directed, building trust in slowing down.",
      difficulty: "gentle",
    },
    {
      title: "Send One Simple Help Request",
      description:
        "Typing and sending a text to ask for support (like dinner help) is a concrete step toward *breaking the ‘don’t burden others’ rule*. It’s manageable and opens space for shared care, easing your internal pressure.",
      difficulty: "gentle",
    },
    {
      title: "Notice One Moment of Physical Tension",
      description:
        "Briefly bringing awareness to areas like shoulders or throat when you notice tightness creates a bridge between body and mind, cultivating *self-compassion through body awareness*. It’s a small step that honors your experience without overwhelming you.",
      difficulty: "gentle",
    },
  ],
  relevant_resources: [
    {
      category: "self-compassion",
      goal: "Cultivating kindness toward your inner critic and exhaustion",
      difficulty: "beginner",
    },
    {
      category: "mindfulness-techniques",
      goal: "Practicing brief pauses to reduce physical tension and emotional overwhelm",
      difficulty: "beginner",
    },
    {
      category: "anxiety-management",
      goal: "Understanding and gently challenging negative self-talk and anticipatory fear",
      difficulty: "intermediate",
    },
  ],
};
