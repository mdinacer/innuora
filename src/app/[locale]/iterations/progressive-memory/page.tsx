"use client";

import { Button } from "@/components/ui/button";
import { MemoryDisplay } from "./components/memory-display";
import { MessageInput } from "./components/message-input";
import { MessageList } from "./components/message-list";
import { useConversation } from "./hooks/use-conversation";
import { useConversationStore } from "./stores/conversation.store";

export default function ProgressiveMemoryPage() {
  const { messages, memory, isLoading, sendMessage } = useConversation();
  const { clearConversation } = useConversationStore();

  const handleTestMessages = async () => {
    for (const messages of userMEssages) {
      await sendMessage(messages);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Progressive Memory Test</h1>
              <p className="text-sm text-gray-600 mt-1">Testing gradual understanding over time</p>
            </div>
            <Button onClick={handleTestMessages}>Test Messages</Button>
            <button
              onClick={clearConversation}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Clear Conversation
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm h-[calc(100vh-200px)] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-hidden">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full p-8">
                    <div className="text-center max-w-md">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome</h2>
                      <p className="text-gray-600 mb-4">
                        This is a space for understanding. Share what's on your mind, and I'll gradually build an
                        understanding of your patterns and struggles.
                      </p>
                      <p className="text-sm text-gray-500">
                        Watch the memory panel on the right to see how understanding deepens over time.
                      </p>
                    </div>
                  </div>
                ) : (
                  <MessageList messages={messages} />
                )}
              </div>

              {/* Input */}
              <MessageInput onSend={sendMessage} isLoading={isLoading} />
            </div>
          </div>

          {/* Memory Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <MemoryDisplay memory={memory} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">How Progressive Memory Works:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              <strong>Sessions 1-2:</strong> Captures basic life context (who, what, where)
            </li>
            <li>
              <strong>Sessions 3-5:</strong> Identifies recurring patterns in emotions, relationships, behaviors
            </li>
            <li>
              <strong>Sessions 6-10:</strong> Carefully infers underlying beliefs and protective patterns
            </li>
            <li>
              <strong>Session 10+:</strong> Tracks what's changing and deepens understanding
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const userMEssages = [
  "Honestly, I’m exhausted today. It feels like every little thing is pulling at me.",
  "I woke up already tense, like my body was bracing for something.",
  "I’ve been trying to keep the house together, but it feels like no one sees how much I’m doing.",
  "My partner said he was “busy” and couldn’t help with the kids’ school stuff. I didn’t argue, I just handled it.",
  "I don’t know why I never push back. It’s like I automatically take over.",
  "And then I resent him for not helping, which makes me feel guilty.",
  "At work it’s the same — people hand me tasks because I’m the “organized one.”",
  "I didn’t even finish lunch today. I ate standing up while answering messages.",
  "Sometimes I wonder if I’m doing this to myself. Like maybe I’m just too used to being responsible.",
  "But then I get angry because I *shouldn’t* have to do everything.",
  "I feel invisible a lot. Like people only notice me when they need something.",
  "My mom used to say, “If you want something done right, do it yourself.” I hear that in my head all the time.",
  "I think I internalized that way too much.",
  "I wish I could let go for once and trust someone else to handle things.",
  "But the idea of things falling apart stresses me out even more.",
  "I don't know how to rest without feeling guilty.",
  "Even tonight I told myself I’d relax, but my brain kept replaying the whole day.",
  "I noticed this pattern: the more tired I am, the more I try to control everything.",
  "And then I snap or withdraw, and people ask “what’s wrong?” like they didn’t see the buildup.",
  "I feel bad complaining. I know other people have it harder.",
  "But I’m drowning in quiet ways. Not dramatic, just… tired of carrying everything alone.",
  "I hate asking for help. It feels like I’m admitting failure.",
  "Yesterday my partner said, “Just tell me what you need.”  ",
  "But I’m so tired of managing even that.",
  "I want support without having to coordinate it.",
  "Sometimes I imagine what it would be like if someone anticipated *my* needs for once.",
  "I also feel like I have to be the calm one in the relationship. If I show frustration, it turns into a thing.",
  "I’m scared of conflict, but also scared of exploding one day.",
  "I don't know what I actually need right now. I just feel this heaviness.",
  "Maybe I need permission to not be the strong one all the time.",
  "I’m tired of being reliable. I want to be held for once instead of holding everyone else.",
];

const mockSessionMemory = {
  conversation_topics: {
    primary_topic:
      "Feeling obligated to carry the emotional and practical load at home and work, without feeling seen or supported.",
    secondary_topic:
      "Avoiding conflict and suppressing her needs due to guilt, fear of escalation, and long-held beliefs about responsibility.",
  },

  emotional_signals: [
    { emotion: "exhaustion", confidence: 0.96 },
    { emotion: "overwhelm", confidence: 0.9 },
    { emotion: "resentment", confidence: 0.82 },
    { emotion: "guilt", confidence: 0.75 },
    { emotion: "heaviness", confidence: 0.72 },
    { emotion: "invisibility", confidence: 0.64 },
  ],

  current_load: {
    stressors: [
      {
        value: "feeling solely responsible for home and children",
        evidence: ["manages household and children's needs without support"],
      },
      {
        value: "being the default problem-solver at work",
        evidence: ["others rely on her organization and responsibility"],
      },
      {
        value: "anticipating emotional or logistical problems",
        evidence: ["feels she must prevent things from falling apart"],
      },
    ],
    responsibilities: [
      {
        value: "managing most household and childcare tasks",
        evidence: ["takes over tasks when partner doesn't help"],
      },
      {
        value: "maintaining emotional stability in relationships",
        evidence: ["stays calm to avoid escalation"],
      },
      {
        value: "being reliable and competent in all contexts",
        evidence: ["others default to her because she is 'responsible'"],
      },
    ],
    emotional_burdens: [
      {
        value: "carrying the emotional and logistical load alone",
        evidence: ["feels she is drowning quietly and unsupported"],
      },
      {
        value: "suppressing her own needs to keep peace",
        evidence: ["avoids conflict and withdraws instead"],
      },
      {
        value: "feeling responsible for preventing breakdowns",
        evidence: ["stress when imagining letting go of control"],
      },
    ],
  },

  roles: [{ value: "default_responsible_one" }, { value: "caretaker_and_emotional_buffer" }],

  protective_patterns: [
    { value: "overfunctioning" },
    { value: "self_silencing" },
    { value: "conflict_avoidance" },
    { value: "hyper_responsibility" },
  ],

  silent_rules: [
    { value: "i_am_not_allowed_to_need_help" },
    { value: "things_will_fall_apart_if_i_dont_handle_them" },
    { value: "i_must_stay_calm_to_keep_others_stable" },
    { value: "rest_must_be_earned" },
    { value: "asking_for_support_is_burdening_others" },
  ],

  important_people: ["partner", "children"],

  relational_patterns: [
    { value: "she_takes_over_when_others_step_back" },
    { value: "others_expect_stability_from_her" },
    { value: "her_needs_go_unnoticed_unless_explicitly_stated" },
  ],

  unspoken_needs: [
    { value: "shared_responsibility_without_having_to_direct_others" },
    { value: "rest_without_feeling_guilty" },
    { value: "being_seen_for_her_efforts" },
    { value: "support_that_does_not_require_coordination" },
    { value: "permission_to_be_vulnerable_and_not_the_strong_one" },
  ],

  what_matters: [
    { value: "fairness" },
    { value: "emotional_safety" },
    { value: "stability_without_overburden" },
    { value: "being_appreciated" },
    { value: "connection_where_needs_flow_both_ways" },
  ],
};
