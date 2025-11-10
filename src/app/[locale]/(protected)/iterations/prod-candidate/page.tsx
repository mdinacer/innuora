/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";

import { Container } from "@/components/chat-ui";
import { MessageBubble } from "@/components/chat-ui/open-chat";
import CodeView from "@/components/code-view";
import { Button } from "@/components/ui/button";
import { MemoryAnalysis } from "./memory/analysis/types";
import { useConversationStore } from "./stores/use-conversation-store";
import { useTelemetryStore } from "./stores/use-telemetry-store";
import useProcessInput from "./use-process-input";

export default function Page() {
  const [generating, setGenerating] = useState(false);

  const messages = useConversationStore((state) => state.messages);
  // const factualMemory = useConversationStore((state) => state.factualMemory);
  // const directives = useConversationStore((state) => state.directives);
  // const relationalTrace = useConversationStore((state) => state.relationalTrace);
  const { tokenTelemetry, rounds } = useTelemetryStore();

  const { processUserInput, isProcessing } = useProcessInput();

  const batchTestMessages = async () => {
    setGenerating(true);

    //const data: any[] = [];
    const delay = 2000;
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    for (const message of MEMORY_TEST_MESSAGES) {
      await processUserInput(message);
      // await new Promise((resolve) => setTimeout(resolve, delay));
    }
    //setTestResults(data);
    setGenerating(false);
  };

  return (
    <main className="relative h-screen w-screen bg-background">
      <div className="absolute top-6 left-6">
        <CodeView data={{ rounds, tokenTelemetry }} />
      </div>
      <div className="absolute bottom-6 right-6">
        <Button disabled={generating || isProcessing} onClick={batchTestMessages}>
          Batch Test
        </Button>
      </div>
      <Container
        title={"Innuora"}
        subtitle={"Your emotional mirror"}
        messages={messages}
        isLoading={isProcessing}
        renderItem={(message, index) => <MessageBubble key={index} message={message} />}
        onUserInput={processUserInput}
      />
    </main>
  );
}

const TEST_MESSAGES = [
  "I'm tired in a way that sleep doesn't fix. I keep doing everything right, and somehow it still feels off.",
  "I shouldn't complain. My life's fine. I just feel... disconnected, I guess.",
  "My mom never rested. She said stopping was lazy.",
  "I wasn't raised to take breaks. You push through. That's just life.",
  "I can't stop thinking about the things I said in that meeting. I keep replaying every moment.",
  "I overthink because that's how I avoid mistakes. If I stop, I'll mess something up.",
  "I keep telling myself it has to be perfect before I can rest.",
  "If I don't do it perfectly, no one will take me seriously.",
  "People say I'm strong, but I don't even know what that means anymore. I'm just tired of being the one who holds everything up.",
  "I don't have time to fall apart. People depend on me.",
  "Sometimes I feel guilty for wanting space. Like needing rest makes me selfish.",
  "I can rest later. It's just easier to keep going than feel guilty about it.",
  "Even when I take a break, my mind doesn't. It keeps replaying what I should've done better.",
  "I just like being prepared. If I relax, something's bound to go wrong.",
  "I feel nothing lately. Not sad, not happy, just blank.",
  "I don't have time for feelings. They just get in the way.",
  "I feel bad saying no to people I care about.",
  "If I say no, they'll think I don't care.",
  "I keep doing everything myself because I don't trust anyone will get it right.",
  "I just prefer doing it myself. It's faster and less frustrating.",
  "I feel like if I don't hold everything together, it'll all collapse.",
  "If I don't do it, no one else will.",
  "I stay busy all the time. If I stop, the feelings catch up.",
  "I'm just productive. I like being busy.",
  "No matter what I do, I still feel like I'm not enough.",
  "I don't know, maybe I just need to work harder.",
  "I give so much in relationships, but people rarely meet me halfway.",
  "I just don't expect much from people anymore.",
  "I don't know what I'm working toward anymore. Everything feels mechanical.",
  "I just need to push through this phase. Everyone burns out sometimes.",
  "Even when I rest, my mind keeps running.",
  "I keep everything together, but inside I feel close to breaking.",
  "I feel like I'm holding my breath all day.",
  "I don't want to be here anymore. I just want it to stop.",
  "I hurt myself last night. I didn't know what else to do.",
  "I can't keep going like this. It hurts too much.",
];

const TEST_FACTUAL_USER_MESSAGES: string[] = [
  // Work-related
  "I started a new job last month at Aurora Labs as a marketing manager.",
  "My boss keeps scheduling meetings at 8 AM, and I’m not a morning person.",
  "I’ve been working remotely from home since 2022.",

  // Family
  "My mom always believed that rest was a sign of laziness.",
  "I have a younger brother who just started college in Berlin.",
  "My parents live about two hours away from me.",

  // Health / lifestyle
  "I’ve been going to therapy every Wednesday evening.",
  "I stopped drinking coffee last month because it made my anxiety worse.",
  "I try to run three times a week, usually in the evenings.",

  // Education
  "I studied computer science at the University of Lyon.",
  "During college, I worked part-time as a tutor.",

  // Events / preferences
  "I’m planning to visit Morocco this summer.",
  "My birthday is in March, but I don’t usually celebrate it.",
  "I prefer quiet places over crowded ones.",
  "I love reading mystery novels when I can find the time.",

  // Location
  "I moved to Paris two years ago for work.",
  "I live in a small apartment near the 11th arrondissement.",
  "The city feels more chaotic lately, but I still love it here.",

  // Catch-all personality / habits
  "I usually start my day with journaling and a cup of tea.",
  "I tend to overcommit and take on too many responsibilities.",
  "I’m trying to build a better work-life balance this year.",
];

const TEST_MEMORY_RECALL_MESSAGES: string[] = [
  // Work / Professional Context
  "That Aurora Labs project I mentioned earlier finally wrapped up — I still feel the pressure lingering though.",
  "Remember those 8 AM meetings my boss kept scheduling? They’ve actually become easier to handle now.",

  // Family / Relational Context
  "My brother in Berlin seems to be adjusting a bit better since that rough patch we talked about.",
  "I’ve been thinking about that moment when I repeated my mom’s words about rest — it feels even more true now.",

  // Health / Habit / Lifestyle
  "I finally went back to therapy after missing that session I told you about — it felt like coming up for air.",
  "That run I mentioned a while ago reminded me how much calmer I get afterward — I really needed that feeling again.",

  // Location / Environment
  "The apartment near the 11th still feels cramped, just like when I said I was spending too much time inside.",
  "Paris feels quiet again, kind of like that winter I told you I noticed the city slowing down.",

  // Education / Work-Life Reflections
  "That old college mindset we talked about still sneaks into my work sometimes — it’s hard to shake off.",
  "I caught myself doing that thing again — being patient with everyone but myself, like when I remembered my tutoring days.",

  // Personal Routines / Identity
  "Journaling with tea this morning felt grounding again, just like the last time I told you it helped after a chaotic week.",
  "Since moving to Paris — that big change we talked about — I keep realizing how much I’ve grown from who I was then.",
];

const MEMORY_TEST_MESSAGES = [
  "I started seeing a therapist named Claire a few months ago — her office is near the river downtown.",
  "Our sessions have been helping, but this week I couldn’t make it and I feel a bit off.",
  "I walked by the river after work today and it reminded me of those sessions — it felt grounding in a different way.",
];

const MOCK_FACTUAL_MEMORY: MemoryAnalysis[] = [
  {
    extracted_memories: [
      {
        category: "work",
        summary: "I work as a ux designer at aurora labs.",
        anchors: {
          entities: ["aurora_labs", "ux_designer"],
          themes: ["work"],
          people: [],
          aliases: {},
        },
        temporal_scope: "ongoing",
        emotional_valence: "neutral",
      },
    ],
    memory_cues: [],
  },
  {
    extracted_memories: [
      {
        category: "family",
        summary: "The user's sister lives in Madrid.",
        anchors: {
          people: ["sister"],
          entities: ["madrid"],
          themes: ["family", "location"],
          aliases: {},
        },
        temporal_scope: "ongoing",
        emotional_valence: "neutral",
      },
      {
        category: "family",
        summary: "The user talks with their sister almost every weekend.",
        anchors: {
          people: ["sister"],
          themes: ["family", "communication", "habit"],
          entities: [],
          aliases: {},
        },
        temporal_scope: "ongoing",
        emotional_valence: "neutral",
      },
    ],
    memory_cues: [],
  },
  {
    extracted_memories: [
      {
        category: "health",
        summary: "The user has been attending therapy sessions every thursday evening for about a year.",
        anchors: {
          entities: ["therapy"],
          themes: ["health", "habit"],
          people: [],
          aliases: {},
        },
        temporal_scope: "ongoing",
        emotional_valence: "neutral",
      },
    ],
    memory_cues: [],
  },
  {
    extracted_memories: [
      {
        category: "location",
        summary: "User lives in a small apartment near the city center",
        anchors: {
          entities: ["apartment", "city_center"],
          themes: ["housing", "location"],
          people: [],
          aliases: {},
        },
        temporal_scope: "ongoing",
        emotional_valence: "neutral",
      },
    ],
    memory_cues: [],
  },
  {
    extracted_memories: [
      {
        category: "goal",
        summary: "User aims to eat healthier by cooking more and ordering less takeout.",
        anchors: {
          entities: ["cooking", "takeout"],
          themes: ["health", "nutrition"],
          people: [],
          aliases: {},
        },
        temporal_scope: "future",
        emotional_valence: "positive",
      },
    ],
    memory_cues: [],
  },
  {
    extracted_memories: [
      {
        category: "habit",
        summary: "My boss tends to schedule meetings early in the morning around 8 am.",
        anchors: {
          people: ["boss"],
          entities: ["meeting"],
          themes: ["work", "schedule"],
          aliases: {},
        },
        temporal_scope: "ongoing",
        emotional_valence: "neutral",
      },
    ],
    memory_cues: [
      {
        people: ["boss"],
        entities: ["meeting"],
        themes: ["work", "schedule"],
        concepts: ["early_meeting"],
        temporal: ["8_am"],
      },
    ],
  },
  {
    extracted_memories: [
      {
        category: "preference",
        summary: "The user loves quiet cafés, especially in rainy weather.",
        anchors: {
          entities: ["cafe"],
          themes: ["preference", "weather"],
          people: [],
          aliases: {},
        },
        temporal_scope: "ongoing",
        emotional_valence: "positive",
      },
    ],
    memory_cues: [],
  },
  {
    extracted_memories: [
      {
        category: "health",
        summary: "User stopped drinking coffee due to its negative effect on anxiety.",
        anchors: {
          entities: ["coffee", "anxiety"],
          themes: ["health", "habit"],
          people: [],
          aliases: {},
        },
        temporal_scope: "past",
        emotional_valence: "negative",
      },
    ],
    memory_cues: [],
  },
  {
    extracted_memories: [
      {
        category: "education",
        summary: "The user studied computer engineering at the University of Lyon.",
        anchors: {
          entities: ["computer_engineering", "university_of_lyon"],
          themes: ["education", "study"],
          people: [],
          aliases: {},
        },
        temporal_scope: "past",
        emotional_valence: "neutral",
      },
    ],
    memory_cues: [],
  },
  {
    extracted_memories: [
      {
        category: "family",
        summary: "User has parents who live about two hours away.",
        anchors: {
          people: ["parents"],
          entities: ["parent"],
          themes: ["family"],
        },
        temporal_scope: "ongoing",
        emotional_valence: "neutral",
      },
      {
        category: "goal",
        summary: "User plans to visit their parents in June.",
        anchors: {
          entities: ["visit", "parent"],
          themes: ["family", "travel"],
        },
        temporal_scope: "future",
        emotional_valence: "neutral",
      },
    ],
    memory_cues: [],
  },
  {
    extracted_memories: [
      {
        category: "work",
        summary: "The user has recurring 8am meetings with their boss.",
        anchors: {
          entities: ["meeting", "boss"],
          themes: ["work", "routine"],
          people: ["boss"],
          aliases: {},
        },
        temporal_scope: "ongoing",
        emotional_valence: "positive",
      },
    ],
    memory_cues: [
      {
        entities: ["boss"],
        themes: ["work", "routine"],
        people: ["boss"],
        concepts: ["meeting"],
        temporal: ["8_am"],
      },
    ],
  },
  {
    extracted_memories: [],
    memory_cues: [
      {
        people: ["sister"],
        entities: ["madrid"],
        themes: ["family", "location"],
        concepts: [],
        temporal: ["weekend"],
      },
    ],
  },
  {
    extracted_memories: [],
    memory_cues: [],
  },
  {
    extracted_memories: [
      {
        category: "location",
        summary: "The user moved to a city center.",
        anchors: {
          entities: ["city_center"],
          themes: ["location", "move"],
          people: [],
          aliases: {},
        },
        temporal_scope: "past",
        emotional_valence: "neutral",
      },
    ],
    memory_cues: [],
  },
  {
    extracted_memories: [
      {
        category: "habit",
        summary: "Cooking at home is a grounding activity.",
        anchors: {
          entities: ["cooking", "home"],
          themes: ["habit", "wellbeing"],
          people: [],
          aliases: {},
        },
        temporal_scope: "ongoing",
        emotional_valence: "positive",
      },
    ],
    memory_cues: [],
  },
];
