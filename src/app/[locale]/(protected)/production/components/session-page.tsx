"use client";

import { useState } from "react";

import { Container } from "@/components/chat-ui";
import CodeView from "@/components/code-view";
import { Button } from "@/components/ui/button";
import useChatController from "@/domains/guidance-flow/hooks/use-chat-controller";
import MessageBubble from "./message-bubble";

const SessionPage: React.FC = () => {
  const { session, isProcessing, handleUserInput, resetSession: handleResetSession } = useChatController();
  const [generating, setGenerating] = useState(false);

  const processUserInput = async (userInput: string) => {
    await handleUserInput(userInput);
  };

  const batchTestMessages = async () => {
    handleResetSession();
    setGenerating(true);

    //const data: any[] = [];
    const delay = 3000;
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const messagesToTest = TEST_MESSAGES; //.slice(-5);
    for (const message of messagesToTest) {
      await processUserInput(message);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    //setTestResults(data);
    setGenerating(false);
  };

  return (
    <div className="min-h-full h-auto w-full">
      <main className="relative h-screen w-screen bg-background">
        <div className="absolute top-6 left-6">
          <CodeView data={{ session }} />
        </div>

        <div className="absolute bottom-6 right-6">
          <Button disabled={generating || isProcessing} onClick={batchTestMessages}>
            Batch Test
          </Button>

          <Button onClick={handleResetSession} variant={"outline"} size={"sm"}>
            Reset Session
          </Button>
        </div>

        <Container
          title={"Innuora"}
          subtitle={"Your emotional mirror"}
          messages={session.messages}
          isLoading={isProcessing}
          renderItem={(message) => <MessageBubble key={message.id} message={message} />}
          onUserInput={processUserInput}
        />
      </main>
    </div>
  );
};

export default SessionPage;

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
