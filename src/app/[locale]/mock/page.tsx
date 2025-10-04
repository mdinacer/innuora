"use client";

import { useCallback, useState } from "react";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import UserDiagnosticsView from "@/components/session-diagnostics/user-diagnostics-view";
import { Button } from "@/components/ui/button";
import { SessionAnalysis } from "@/domains/session-analysis/session-analysis.types";
import { INNUORA_STANDARD_DIAGNOSTICS_INSTRUCTIONS } from "@/domains/session-diagnostics/session-diagnostics.prompts";
// import { INNUORA_STANDARD_DIAGNOSTICS_INSTRUCTIONS } from "@/domains/session-diagnostics/session-diagnostics.prompts";
import { SessionDiagnosticsStd } from "@/domains/session-diagnostics/session-diagnostics.types";
import { parseJsonObject } from "@/lib/utils/parse-json";
import { OpenChatMessage } from "@/types/open-chat-message.types";

/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-vars */

const mockMessages: OpenChatMessage[] = [
  {
    id: "initial-message",
    role: "assistant",
    content:
      "Hi there. I'm here to listen. What's been on your mind lately? Take your time. Just start wherever feels right.",
    timestamp: 1758563017888,
  },
  {
    id: "msg_user-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_UJiIhIoqx-",
    role: "user",
    content:
      "Look, I’m not sure this is even useful. I’ve tried talking to stuff like this before — it gets generic. Work is busy, life is fine-ish, I’m just… tired. I don’t really want a lecture or exercises. Can this actually help me, or is this just another app?",
    timestamp: 1758563045377,
  },
  {
    id: "msg_assistant-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_j2_VqyfzUa",
    role: "assistant",
    content:
      "It sounds like you’re feeling tired and skeptical, and that’s completely understandable. This doesn’t seem to resonate with you right now, and that’s okay. Sometimes when life feels busy and “fine-ish,” it’s hard to find something that truly feels helpful or different. I’m here to simply listen and reflect what you’re experiencing, no lectures or pressure. If you want, we can just explore whatever feels most real to you, at your own pace. What feels most tiring to you these days?",
    timestamp: 1758563051648,
    creditsUsed: 0,
  },
  {
    id: "msg_user-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_T-b0JFZqZO",
    role: "user",
    content:
      "TokenUsage: {\n  prompt_tokens: 814,\n  completion_tokens: 102,\n  total_tokens: 916,\n  prompt_tokens_details: { cached_tokens: 0, audio_tokens: 0 },\n  completion_tokens_details: { reasoning_tokens: 0 }\n}\n          Response: It sounds like you’re feeling tired and skeptical, and that’s completely understandable. This doesn’t seem to resonate with you right now, and that’s okay. Sometimes when life feels busy and “fine-ish,” it’s hard to find something that truly feels helpful or different. I’m here to simply listen and reflect what you’re experiencing, no lectures or pressure. If you want, we can just explore whatever feels most real to you, at your own pace. What feels most tiring to you these days?",
    timestamp: 1758563077767,
  },
  {
    id: "msg_assistant-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_kh6ycKpwoE",
    role: "assistant",
    content:
      "I hear that you’re feeling worn out and unsure if this kind of conversation can really help, which makes a lot of sense. It’s okay to feel hesitant about trying something new when you’ve been pushing through so much already. If it feels right, maybe we could just focus on one small thing that’s draining your energy lately—no expectations, just noticing what’s there. What’s one moment recently that felt especially heavy or exhausting for you?",
    timestamp: 1758563082905,
    creditsUsed: 0,
  },
  {
    id: "msg_user-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_Y4c5TTt-yB",
    role: "user",
    content:
      "Fine. If you must know — it’s mostly work: deadlines, people leaning on me. My partner’s been distant too, but I don’t know if that’s worth bringing up. I don’t want exercises or fluff. Give me something practical: how do I get one night of proper sleep? I tried meditation apps — they don’t stick. Tell me one specific thing I can do tonight that won’t take more than five minutes.",
    timestamp: 1758563100754,
  },
  {
    id: "msg_assistant-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_hpzdbrKfjE",
    role: "assistant",
    content:
      "I hear your frustration with work pressure and feeling leaned on, plus the distance with your partner—it’s a lot to hold. Your request for something practical and quick to help with sleep makes sense when everything feels overwhelming. One simple step you might try tonight is a focused breathing pause: find a quiet spot, close your eyes, and take slow, deep breaths—counting to four as you breathe in, hold for four, then breathe out for four. Just five cycles. This can gently shift your focus away from stress and into your body, calming your mind without needing apps or long routines. How does that feel to try tonight?",
    timestamp: 1758563107668,
    creditsUsed: 0,
  },
  {
    id: "msg_user-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_tCJeiK5OxS",
    role: "user",
    content:
      "Breathing? I’ve heard that a million times. It just makes me more aware of how restless I am. I don’t need another generic tip. Honestly, I don’t see how talking about this changes anything. Tomorrow it’ll still be work, still be my partner ignoring me, still me lying awake at 2 a.m. Do you actually have anything that works in real life, or is this just words?",
    timestamp: 1758563170997,
  },
  {
    id: "msg_user-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_LckR2MmTUt",
    role: "user",
    content:
      "Breathing? I’ve heard that a million times. It just makes me more aware of how restless I am. I don’t need another generic tip. Honestly, I don’t see how talking about this changes anything. Tomorrow it’ll still be work, still be my partner ignoring me, still me lying awake at 2 a.m. Do you actually have anything that works in real life, or is this just words?",
    timestamp: 1758563191180,
  },
  {
    id: "msg_assistant-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_1tzWCHYW1o",
    role: "assistant",
    content:
      "It sounds like you’re feeling really stuck and doubtful about whether any of this can make a real difference, and that’s completely valid. When restlessness and frustration are so present, advice can feel empty or even frustrating. I wonder, what would feel a little less heavy to focus on right now, even if it’s small or imperfect? Maybe tonight, instead of trying to change your sleep, you could just notice one small moment before bed—a sound, a feeling, or a thought—without needing it to fix anything. Would that feel less pressured or more doable?",
    timestamp: 1758563196843,
    creditsUsed: 0,
  },
  {
    id: "msg_user-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_44k2U3JzpP",
    role: "user",
    content:
      "I don’t even know where to start… everything feels like too much, and I can’t seem to calm down. I keep thinking about all the things I haven’t done, and it just… loops in my head.",
    timestamp: 1758563494732,
  },
  {
    id: "msg_assistant-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_8fGstoelxL",
    role: "assistant",
    content:
      "That feeling of everything being too much, with your mind caught in a loop of unfinished tasks, sounds really heavy and exhausting. It’s understandable that when thoughts keep circling like that, calming down feels almost impossible. Your mind is holding on tightly to those worries, making it hard to find any rest. Right now, it’s okay to simply notice this pattern without pushing to fix it. What small, gentle way could you acknowledge this overwhelm—maybe naming one thought or feeling—without needing to solve it right away? Sometimes that little space of noticing can quietly shift the weight, even if just a bit.",
    timestamp: 1758563501518,
    creditsUsed: 0,
  },
  {
    id: "msg_user-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_8t4MgW850j",
    role: "user",
    content:
      "I try to just… stop thinking, but it doesn’t work. I feel like I should be able to handle it, but I can’t. And then I get frustrated with myself, which makes it worse.",
    timestamp: 1758563543801,
  },
  {
    id: "msg_assistant-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_LvuwV6gYkQ",
    role: "assistant",
    content:
      "I'm hearing a rule that you feel like you *should* be able to handle these feelings on your own, and that sounds like a lot of pressure you're putting on yourself. It’s understandable that when you can’t just “stop thinking,” frustration builds and makes everything feel heavier. What if that rule softened to something like, “I’d prefer to manage this well,” or “It would be nice if I could find some ease”? How might that gentler expectation change the way you treat yourself in these moments? Where do you think this “should” came from, and how is it serving you right now?",
    timestamp: 1758563551087,
    creditsUsed: 0,
  },
  {
    id: "msg_user-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_QWCPyFCGM0",
    role: "user",
    content:
      "I guess it comes from always being told I need to be strong… at work, at home… everywhere. But softening it feels impossible, like I’d be letting people down—or myself.",
    timestamp: 1758563624966,
  },
  {
    id: "msg_assistant-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_9XQ_sYJQ4K",
    role: "assistant",
    content:
      "That sense of needing to be strong everywhere sounds deeply ingrained and heavy, like carrying a constant weight that leaves little room for softness. It makes sense that softening this rule feels almost impossible when it feels tied to not letting others—or yourself—down. I wonder, what might “being strong” mean to you beyond always pushing through? Could there be a way to hold strength and softness together, even if just in small moments? How might allowing yourself a bit of softness actually protect your strength rather than weaken it? Exploring this balance gently might open space where you don’t have to choose one or the other.",
    timestamp: 1758563632419,
    creditsUsed: 0,
  },
  {
    id: "msg_user-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_G8naZggFd9",
    role: "user",
    content:
      "I don’t know… even thinking about being soft feels like failing. I feel guilty the moment I even consider it. How do I stop that guilt from taking over?",
    timestamp: 1758563675134,
  },
  {
    id: "msg_assistant-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_V84m1kaMa-",
    role: "assistant",
    content:
      "It sounds like that guilt is really loud and convincing, almost like a warning that being soft equals failure. That’s a powerful and painful feeling to carry. I’m hearing a strong internal rule that softness isn’t allowed, and when you consider it, guilt rushes in as a consequence. What if you tried noticing the guilt as a feeling—not a fact—and let it be there without needing to act on it? Could you gently remind yourself that feeling guilt doesn’t mean you’ve actually failed? Where do you think this connection between softness and failure started, and how might it be shaping what you expect from yourself now? Taking small moments to question that link might slowly ease the hold guilt has.",
    timestamp: 1758563681839,
    creditsUsed: 0,
  },
  {
    id: "msg_user-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_QV6sOyaqrB",
    role: "user",
    content:
      "Maybe… but every time I try to give myself a break, my mind just spirals back into ‘you’re lazy’ or ‘you’re failing.’ I can’t stop it.",
    timestamp: 1758563718813,
  },
  {
    id: "msg_assistant-message-30c9ea06-041c-41b9-b3ac-0446400a2a79__vQa-CRKqZ",
    role: "assistant",
    content:
      "It sounds exhausting to have your mind quickly jump to “you’re lazy” or “you’re failing” whenever you try to ease up, like a loop that’s hard to escape. That inner voice feels harsh and relentless, making breaks feel unsafe or undeserved. I’m hearing a strong “should” rule pushing you to keep going no matter what, and it’s creating a lot of pressure. What if, instead of trying to stop those thoughts right away, you simply noticed them as just thoughts—not truths? How might it feel to say, “That’s my mind being critical,” without letting it decide your worth? Where do you think this harsh inner critic learned to be so strict with you? Reflecting on that might help you find small cracks where kindness can grow.",
    timestamp: 1758563726289,
    creditsUsed: 0,
  },
  {
    id: "msg_user-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_AsjvEnC3Vx",
    role: "user",
    content:
      "I notice them, but it doesn’t help. Even when I tell myself ‘just thoughts,’ the guilt and pressure still stick. I feel trapped in it.",
    timestamp: 1758563756805,
  },
  {
    id: "msg_assistant-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_9DCX2T-fUW",
    role: "assistant",
    content:
      "It sounds incredibly frustrating to notice those critical thoughts and still feel trapped by the guilt and pressure, like awareness alone isn’t enough to loosen their grip. That persistent “should” rule seems to hold you tightly, making it hard to find relief even when you try to step back. What if the pressure you’re feeling is less about the thoughts themselves and more about the rule that you *should* be able to control or dismiss them perfectly? I wonder, how might it feel to soften that rule to something like, “I’d prefer to manage these thoughts, but it’s okay if it takes time”? Where do you think this expectation of perfect control came from, and how might it be shaping your experience right now?",
    timestamp: 1758563765455,
    creditsUsed: 0,
  },
  {
    id: "msg_user-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_pCOL8A0Vjb",
    role: "user",
    content:
      "I keep thinking about everything I didn’t finish today. I feel like I should have done more, and I can’t stop going over it in my head. It’s exhausting, but I don’t know how to let it go.",
    timestamp: 1758564452922,
  },
  {
    id: "msg_assistant-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_kN7cA_2zAD",
    role: "assistant",
    content:
      "That ongoing loop of “I should have done more” feels heavy and draining, as if your mind is replaying a story where you’re never enough. I hear how stuck you feel in this cycle, and how hard it is to release those thoughts even when they tire you out. Could we try grounding together? What are three things you can see around you right now? Then, where do you notice that feeling of pressure or guilt in your body? Naming it can help separate the feeling from the story. Remember, these thoughts are like passing clouds—present but not commands. How might it feel to take three slow breaths, each exhale a small release of that tension?",
    timestamp: 1758564462972,
    creditsUsed: 0,
  },
  {
    id: "msg_user-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_bzv_wnQzzP",
    role: "user",
    content:
      "I keep thinking I should have done more today at work. I can’t stop replaying every little thing I did wrong, and it makes me feel guilty and anxious. Even when I try to relax, my mind just keeps going in circles, telling me I’m lazy or not enough. I feel trapped in my own thoughts.",
    timestamp: 1758564571630,
  },
  {
    id: "msg_assistant-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_9yXQVX2r4S",
    role: "assistant",
    content:
      "I hear how heavy that “should have done more” rule feels, like it’s chaining you to replay mistakes and feed guilt and anxiety. That inner voice calling you “lazy” or “not enough” sounds painful and unrelenting, making relaxation seem impossible. It’s a lot of pressure you’re carrying, and it’s understandable to feel trapped. What if you softened that rule to something like, “I’d prefer to do more, but today I did what I could”? When your thoughts circle, could you try noticing one repeated thought—like “I’m lazy”—and imagine it as a cloud passing by, not a truth? Where might this harsh expectation have started for you? Exploring that could open a small space to breathe.",
    timestamp: 1758564591205,
    creditsUsed: 0,
  },
  {
    id: "msg_user-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_ykgTE7i37F",
    role: "user",
    content:
      "I keep replaying all the mistakes I made at work this week. I feel like no matter what I do, I’ll never catch up or be good enough. I shouldn’t be struggling this much—it makes me feel weak and lazy.",
    timestamp: 1758564713316,
  },
  {
    id: "msg_assistant-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_aRdfDOCNKC",
    role: "assistant",
    content:
      "You’re carrying a heavy load of self-judgment, replaying mistakes and feeling like you’ll never measure up. That “I shouldn’t be struggling” rule sounds like a harsh standard, making you feel weak and lazy when you do struggle. That’s a lot of pressure to hold, and it’s understandable it weighs so heavily on you. What if you softened that rule to, “I’d prefer to manage things better, but it’s okay to struggle sometimes”? When those thoughts say you’re weak, could you try noticing where you feel that in your body and breathe into that space? I wonder, where might this belief that struggling means weakness have come from, and how is it shaping your experience now?",
    timestamp: 1758564720776,
    creditsUsed: 0,
  },
  {
    id: "msg_user-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_aHGzW00NQT",
    role: "user",
    content:
      "can’t stop thinking about all the things I messed up this week. I keep telling myself I should have done everything perfectly, or I’m failing completely. I feel lazy, weak, and like I’m letting everyone down. Even small mistakes keep replaying in my head over and over. Why do I always mess up? I try to relax but my mind won’t let me",
    timestamp: 1758564775003,
  },
  {
    id: "msg_assistant-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_F80XacRA_p",
    role: "assistant",
    content:
      "That “should have done everything perfectly” rule feels like a heavy, unrelenting weight, making each mistake feel like total failure. I hear how deeply that pressure is tied to feeling lazy, weak, and like you’re letting others down—it’s exhausting to carry. Your mind replaying small mistakes over and over shows how stuck those thoughts are, like a loop you can’t pause. What if you softened that rule to something like, “I’d prefer to do well, but it’s okay to be imperfect sometimes”? Could you try noticing where in your body you feel this tension now, and take three slow breaths, each exhale a little release? I wonder, where did this need for perfection start for you?",
    timestamp: 1758564784169,
    creditsUsed: 0,
  },
  {
    id: "msg_user-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_mQgfqN7Cvb",
    role: "user",
    content:
      "I know I keep thinking I’m lazy and weak, and I can’t stop replaying all the things I should have done differently. I guess… maybe I could try doing one small thing differently, but it feels impossible to even know where to start.",
    timestamp: 1758564882285,
  },
  {
    id: "msg_assistant-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_gCmIl8S1Q9",
    role: "assistant",
    content:
      "I hear how stuck and overwhelmed that feeling of being “lazy and weak” makes you, especially with those “should have done differently” thoughts looping nonstop. It’s understandable that even thinking about one small change feels huge right now. What if you softened that inner rule to, “I’d prefer to do things differently, but I’m doing the best I can right now”? Could you try gently noticing one tiny moment you’d like to shift—no pressure to fix it all—and just name it quietly in your mind? Sometimes, a small step can open a little space. What might feel manageable, even just a little, to try differently today?",
    timestamp: 1758564890732,
    creditsUsed: 0,
  },
  {
    id: "msg_user-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_0QmiABjs-b",
    role: "user",
    content:
      "I… I guess I could try just noticing one thing differently, but even that feels like too much. My mind keeps replaying all the ways I messed up today. I can’t seem to stop thinking about it, and it makes me feel lazy and useless all over again.",
    timestamp: 1758564940042,
  },
  {
    id: "msg_assistant-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_zDVO0oIGGp",
    role: "assistant",
    content:
      "That feeling of being overwhelmed by just noticing one thing differently sounds really hard, especially with your mind replaying mistakes so loudly. It’s understandable that those thoughts make you feel lazy and useless—they carry a heavy weight. Maybe, for now, you could simply try to notice where in your body those feelings sit, without trying to change them. Just a gentle awareness, like watching clouds drift by, not commands to fix anything. This moment of noticing, without judgment, can be a small break from the loop. How does it feel to pause and just observe, even if only for a breath or two?",
    timestamp: 1758564948990,
    creditsUsed: 0,
  },
  {
    id: "msg_user-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_122jLEP7rj",
    role: "user",
    content:
      "I tried noticing it in my body… I feel it in my chest and stomach. It’s tight, and my heart feels heavy. I can feel myself tensing up even more as I think about how I should be handling this better.",
    timestamp: 1758564979301,
  },
  {
    id: "msg_assistant-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_9Mgc6_04fo",
    role: "assistant",
    content:
      "That tightness and heaviness in your chest and stomach sounds really intense, especially as the pressure to “handle this better” adds more tension. It’s like your body is holding the weight of those harsh expectations. That rule, “I should be handling this better,” feels like a heavy burden you carry inside. What if you softened it to, “I’d prefer to handle this better, but I’m doing what I can right now”? Could you try three slow breaths, letting each exhale release some of that tightness? I’m curious—where do you think this rule came from, and how might it be trying to protect you, even if it feels painful?",
    timestamp: 1758564986661,
    creditsUsed: 0,
  },
  {
    id: "msg_user-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_ULTvqDCEgU",
    role: "user",
    content:
      "I tried the breaths… a little relief, but the tension is still there. I keep thinking I shouldn’t feel this weak or behind. It’s like I can’t stop judging myself, even for small things.",
    timestamp: 1758565017471,
  },
  {
    id: "msg_assistant-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_Lzx12ib3Rt",
    role: "assistant",
    content:
      "That persistent tension and judgment sound exhausting, especially with that rule, “I shouldn’t feel weak or behind,” pressing hard on you. It’s like you’re caught in a loop where feeling this way feels wrong, which only deepens the struggle. That’s a lot of pressure to carry. What if you softened that to, “I’d prefer not to feel this way, but it’s okay to have these feelings right now”? Noticing the judgment without fighting it can be a small act of kindness to yourself. Where do you think this “shouldn’t feel weak” rule started? How is it shaping what you expect from yourself?",
    timestamp: 1758565025550,
    creditsUsed: 0,
  },
  {
    id: "msg_user-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_vANKi3fI0F",
    role: "user",
    content:
      "I see… I think it started when I was a kid, always being told I had to keep up and not show weakness. Even now, I can’t stop the voice that says I’m failing if I slow down.",
    timestamp: 1758565066059,
  },
  {
    id: "msg_assistant-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_Gn0rDoFdbF",
    role: "assistant",
    content:
      "That voice from childhood, telling you to keep up and never show weakness, sounds deeply rooted and powerful. Feeling like you’re failing if you slow down carries heavy pressure, as if rest equals failure. That’s a tough rule to carry, especially when it keeps your mind racing and your body tense. What if you gently tried, “I’d prefer to keep going, but it’s okay to slow down sometimes”? Noticing that voice without needing to obey it can open a small space of relief. Where in your body do you feel that pressure most right now? Taking a moment to breathe into it might help you feel a little less trapped by the rule.",
    timestamp: 1758565076258,
    creditsUsed: 0,
  },
  {
    id: "msg_user-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_Sdc7eRs1uR",
    role: "user",
    content:
      "I feel it mostly in my chest and shoulders, like a tight knot. Even if I try to slow down, I can’t stop worrying I’m falling behind.",
    timestamp: 1758565110033,
  },
  {
    id: "msg_assistant-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_rx3WfoZWLj",
    role: "assistant",
    content:
      "That tight knot in your chest and shoulders sounds so heavy, especially with that worry about falling behind clinging to you. It’s like your body is holding the stress even when your mind tries to slow down. That persistent worry feels like a rule saying, “If I slow down, I’m failing,” and that’s a lot to carry. Maybe you can try gently noticing the knot without pushing it away—just observing where it lives in your body. Could you name one small thing you see or hear right now? Sometimes grounding in the senses helps ease the mind’s chase. What might happen if slowing down was simply a pause, not a failure?",
    timestamp: 1758565118590,
    creditsUsed: 0,
  },
  {
    id: "msg_user-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_xZ5SdRRBtP",
    role: "user",
    content:
      "I notice my shoulders relaxing a little when I take those slow breaths, but the worry keeps circling back. I still feel like I should be doing more.",
    timestamp: 1758565148571,
  },
  {
    id: "msg_assistant-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_Lzc1xndaBi",
    role: "assistant",
    content:
      "That lingering “I should be doing more” feels like a heavy rule weighing on you, even as your body starts to soften. That’s a lot of pressure, like an invisible taskmaster that never lets up. When the worry circles back, it’s your mind holding tight to that should, making it hard to find peace. What if you tried shifting “I should be doing more” to “I’d prefer to do more, but it’s okay to rest right now”? Notice that thought as a cloud passing by, not a command you must follow. Where do you think this rule first took hold? How might it be shaping how you treat yourself today?",
    timestamp: 1758565154864,
    creditsUsed: 0,
  },
  {
    id: "msg_user-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_kUnjBk0hd7",
    role: "user",
    content:
      "I feel like no matter how much I rest or slow down, I’m still failing. It’s like the more I try to be gentle with myself, the more guilty I feel",
    timestamp: 1758565358774,
  },
  {
    id: "msg_assistant-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_TxAsTeLoLp",
    role: "assistant",
    content:
      "That feeling—that resting still feels like failing—sounds deeply painful and confusing. It’s as if your kindness toward yourself triggers guilt, like two parts of you are at odds. That’s a heavy emotional push-pull, where your mind uses guilt to keep the “should” alive, even when you want relief. What if you gently noticed that guilt without judging it, like a wave passing through? You might ask, “What is this guilt trying to protect me from?” This awareness doesn’t demand change right now; it just invites curiosity. Where do you feel that guilt most strongly in your body? A small breath into that space might create a little room between you and those harsh feelings.",
    timestamp: 1758565366030,
    creditsUsed: 0,
  },
  {
    id: "msg_user-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_UeGtMo7dGL",
    role: "user",
    content:
      "It’s mostly in my chest and shoulders. I can feel it tightening every time I think I should be doing more. I want to let it go, but it just won’t leave",
    timestamp: 1758565386242,
  },
  {
    id: "msg_assistant-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_lrylc4iq61",
    role: "assistant",
    content:
      "That tightness in your chest and shoulders, tied to the “should be doing more” thought, feels like a constant companion you can’t shake. It’s understandable how that pressure clings so tightly—it’s like your body is holding the weight of that internal rule. When the thought returns, maybe try gently naming it—“there’s the should again”—and notice it without needing to change it right away. That small space can help soften its grip. Could you try three slow breaths, each exhale imagining a little more release? This isn’t about forcing the feeling away, just making room for it to be there without letting it control you. What might it be trying to tell you beneath that tightness?",
    timestamp: 1758565395765,
    creditsUsed: 0,
  },
  {
    id: "msg_user-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_RZOK5fBqnE",
    role: "user",
    content:
      "I think it’s telling me I’m never doing enough, that I have to keep pushing even when I’m exhausted. I don’t know how to stop the cycle.",
    timestamp: 1758565436782,
  },
  {
    id: "msg_assistant-message-30c9ea06-041c-41b9-b3ac-0446400a2a79_2yapoWaQlF",
    role: "assistant",
    content:
      "Hearing that message—that you’re never enough unless you keep pushing—sounds deeply exhausting and relentless. That rule feels like a heavy burden, one that keeps you caught in a cycle of pressure and fatigue. It’s important to recognize this as a rule your mind has made, not an absolute truth. What if you softened it to, “I’d prefer to keep going, but it’s okay to pause when I’m tired”? Noticing this thought as just one voice among many might help loosen its hold. Where do you think this rule started? Sometimes understanding its origin can open a small door to gentle change, even if stopping feels impossible right now.",
    timestamp: 1758565444756,
    creditsUsed: 0,
  },
];

const mockSessionSummary =
  "User expresses skepticism about therapy effectiveness, feeling tired and overwhelmed by work deadlines and distant partner relationship. Shows perfectionist tendencies, harsh self-criticism, and difficulty with self-compassion. Struggles with sleep and feels trapped by guilt when trying to rest.";

const mockSessionMemory = [
  "User feels tired and skeptical about therapy effectiveness",
  "Work is busy with deadlines, people leaning on them",
  "Partner has been distant recently",
  "Tried meditation apps but they don't stick",
  "Struggles with sleep, lying awake at 2am",
  "Feels guilty when trying to be soft with themselves",
  "Strong inner critic calling them 'lazy' or 'failing'",
  "Expects to be able to control thoughts perfectly",
  "Ruminates about unfinished tasks from the day",
].join("\n");

const mockSessionAnalysis: SessionAnalysis = {
  intensity: "high",
  crisis: "none",
  distortions: [
    {
      type: "all-or-nothing",
      severity: "moderate",
      count: 10,
    },
    {
      type: "mental_filter",
      severity: "moderate",
      count: 1,
    },
    {
      type: "discounting_positives",
      severity: "moderate",
      count: 1,
    },
    {
      type: "rumination",
      severity: "moderate",
      count: 16,
    },
    {
      type: "should_statements",
      severity: "moderate",
      count: 19,
    },
    {
      type: "emotional_reasoning",
      severity: "moderate",
      count: 16,
    },
    {
      type: "labeling",
      severity: "moderate",
      count: 9,
    },
    {
      type: "personalization",
      severity: "mild",
      count: 10,
    },
  ],
  themes: [
    {
      theme: "skepticism about therapy effectiveness",
      frequency: "frequent",
      count: 1,
    },
    {
      theme: "work stress and interpersonal strain",
      frequency: "frequent",
      count: 1,
    },
    {
      theme: "feeling stuck in recurring problems",
      frequency: "frequent",
      count: 1,
    },
    {
      theme: "feeling overwhelmed",
      frequency: "frequent",
      count: 1,
    },
    {
      theme: "difficulty calming down",
      frequency: "frequent",
      count: 1,
    },
    {
      theme: "frustration with self",
      frequency: "frequent",
      count: 1,
    },
    {
      theme: "pressure to be strong",
      frequency: "frequent",
      count: 1,
    },
    {
      theme: "guilt related to self-perception",
      frequency: "frequent",
      count: 1,
    },
    {
      theme: "guilt and pressure",
      frequency: "frequent",
      count: 1,
    },
    {
      theme: "feeling trapped",
      frequency: "frequent",
      count: 1,
    },
    {
      theme: "self-criticism",
      frequency: "frequent",
      count: 14,
    },
    {
      theme: "anxiety about performance",
      frequency: "frequent",
      count: 1,
    },
  ],
  core_beliefs: [
    {
      belief: "I must always be strong or I will let others down",
      count: 1,
    },
    {
      belief: "I am lazy",
      count: 1,
    },
    {
      belief: "I am not enough",
      count: 1,
    },
    {
      belief: "I am not good enough",
      count: 1,
    },
    {
      belief: "I am lazy and weak",
      count: 2,
    },
    {
      belief: "I am failing completely",
      count: 1,
    },
    {
      belief: "I am failing if I slow down",
      count: 1,
    },
  ],
  silent_rules: [
    {
      rule: "I should be able to handle it",
      rigidity: "moderate",
      count: 1,
    },
    {
      rule: "I should never show weakness",
      rigidity: "moderate",
      count: 1,
    },
    {
      rule: "I must not be soft or I am failing",
      rigidity: "rigid",
      count: 1,
    },
    {
      rule: "I must not be lazy or I am failing",
      rigidity: "moderate",
      count: 1,
    },
    {
      rule: "I should be able to control my thoughts and feelings",
      rigidity: "moderate",
      count: 1,
    },
    {
      rule: "I should always be productive",
      rigidity: "moderate",
      count: 1,
    },
    {
      rule: "I should have done more",
      rigidity: "rigid",
      count: 1,
    },
    {
      rule: "I should not struggle or feel weak",
      rigidity: "moderate",
      count: 1,
    },
    {
      rule: "I must do everything perfectly",
      rigidity: "rigid",
      count: 1,
    },
    {
      rule: "I should never make mistakes",
      rigidity: "rigid",
      count: 1,
    },
    {
      rule: "I should have done things differently",
      rigidity: "rigid",
      count: 1,
    },
    {
      rule: "I must not be lazy or useless",
      rigidity: "rigid",
      count: 1,
    },
    {
      rule: "I should handle this better",
      rigidity: "rigid",
      count: 1,
    },
    {
      rule: "I shouldn’t feel weak or behind",
      rigidity: "rigid",
      count: 1,
    },
    {
      rule: "I must keep up and not show weakness",
      rigidity: "rigid",
      count: 1,
    },
    {
      rule: "I must not fall behind or I am failing",
      rigidity: "rigid",
      count: 1,
    },
    {
      rule: "I should be doing more",
      rigidity: "rigid",
      count: 2,
    },
    {
      rule: "I must always be productive and not rest excessively",
      rigidity: "rigid",
      count: 1,
    },
    {
      rule: "I must keep pushing and never do less",
      rigidity: "rigid",
      count: 1,
    },
  ],
};

export default function Page() {
  const [loading, setLoading] = useState(false);

  const testPrompt = useCallback(async () => {
    setLoading(true);
    try {
      const userPrompt = {
        role: "system" as const,
        content: INNUORA_STANDARD_DIAGNOSTICS_INSTRUCTIONS.replace("{{session_summary}}", mockSessionSummary)
          .replace("{{session_memory}}", mockSessionMemory)
          .replace("{{session_analysis}}", JSON.stringify(mockSessionAnalysis))
          .trim(),
      };

      const userResult = await processAiPromptsWithRetry([userPrompt], { max_tokens: 2000 });

      if (userResult.error) {
        console.error("❌ AI call failed:", userResult.error.message);
        return;
      }

      const data = userResult.data;
      console.log("✅ USER DIAGNOSTICS RESULT:");
      console.log("📊 Tokens used:", data.modelTokenUsage);
      console.log("📄 Content:", parseJsonObject(data.message));
      console.log("\n" + "=".repeat(80) + "\n");

      // Test Advanced Therapist Diagnostics
    } catch (error) {
      console.error("❌ Test failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="h-screen w-full flex items-center bg-inn-bg-primary justify-center">
      <p>{mockMessages.filter((m) => m.role === "user").length}</p>
      {/* <CodeView data={mockMessages} className="absolute top-0 left-0 z-10" /> */}
      <div className="relative h-full w-full max-w-5xl mx-auto flex flex-col">
        <Button onClick={testPrompt} disabled={loading}>
          {loading ? "Testing Diagnostics..." : "Test Enhanced Diagnostic Prompts"}
        </Button>
        <UserDiagnosticsView diagnostics={mockUserDiagnosticsResponse} className="flex-1 p-6" />
      </div>
    </div>
  );
}

const ADVANCED_THERAPIST_DIAGNOSTIC_PROMPT = `
# Professional Clinical Case Formulation

**Role**: Expert clinical assessment system generating comprehensive diagnostic profiles for therapeutic review. Provide sophisticated analysis suitable for mental health professionals.

## Input
- Session Summary: {{session_summary}}
- Session Memory: {{session_memory}}
- Session Analysis: {{session_analysis}}

## Clinical Guidelines
1. **Evidence-based analysis**: Ground all insights in provided session data; avoid extrapolation beyond evidence.
2. **Pattern synthesis**: Identify underlying cognitive schemas, maladaptive cycles, and systemic feedback loops driving symptom presentation.
3. **Diagnostic precision**: Use clinical terminology appropriately; include confidence ratings for reliability assessment.
4. **Intervention mapping**: Highlight specific therapeutic leverage points and treatment modalities most likely to create meaningful change.
5. **Risk stratification**: Assess clinical priority, potential complications, and monitoring requirements.
6. **Professional standards**: Maintain clinical sophistication while ensuring accessibility for informed patients.

## Structured Output
Return comprehensive JSON formatted as:

{
  "themes": [
    {
      "id": string,
      "title": string,
      "description": string,
      "severity": "low" | "medium" | "high",
      "trajectory": "increasing" | "stable" | "decreasing",
      "evidence": string[]
    }
  ],
  "cognitive_distortions": [
    {
      "id": string,
      "title": string,
      "description": string,
      "frequency": number,
      "severity": "low" | "moderate" | "high"
    }
  ],
  "emotional_state": {
    "primary": string,
    "secondary": string[],
    "congruence": "aligned" | "minimizing" | "performing"
  },
  "risk_assessment": {
    "level": "low" | "moderate_concern" | "high",
    "notes": string
  },
  "therapist_focus": string[],
  "clinical_interpretations": [
    string
  ],
  "treatment_recommendations": [
    string
  ],
  "professional_language": [
    string
  ],
  "clinical_insights": [
    string
  ]
}
`;

const mockUserDiagnosticsResponse: SessionDiagnosticsStd = {
  whats_happening: [
    {
      text: "**perfectionistic pressure and relentless self-criticism**, *feeling trapped by guilt when trying to rest*, and **overwhelming work stress paired with relational distance**",
      confidence: "high",
    },
    {
      text: "**intense inner critic labeling you as 'lazy' or 'failing'** alongside *persistent rumination about unfinished tasks* and **high emotional reactivity to perceived shortcomings**",
      confidence: "high",
    },
    {
      text: "**skepticism about therapy’s usefulness** layered with *frustration and exhaustion*, making it harder to engage with support",
      confidence: "medium",
    },
  ],
  hidden_rules: [
    {
      rule: "I must not be lazy or I am failing",
      description:
        "This rule fuels a **harsh internal bar that equates any slowing down or rest with failure and weakness**. It creates a cycle where *self-compassion feels like betrayal* and guilt punishes any softness, making it nearly impossible to relax without feeling trapped.",
      rigidity: "rigid",
      confidence: "high",
    },
    {
      rule: "I should be able to control my thoughts and feelings perfectly",
      description:
        "This unspoken demand sets an impossible standard, leading to **frustration and self-blame when intrusive or anxious thoughts arise**. It makes *mental quiet feel like a measure of worth*, and failing to achieve it deepens the inner critic’s voice.",
      rigidity: "moderate",
      confidence: "high",
    },
    {
      rule: "I must always be productive and never rest excessively",
      description:
        "This rule drives the relentless push to keep going despite exhaustion, with **rest seen as a sign of weakness or laziness**. It keeps you locked in a *cycle of overwork and guilt*, making recovery feel unsafe.",
      rigidity: "rigid",
      confidence: "high",
    },
    {
      rule: "I should never show weakness or struggle",
      description:
        "This rule underpins the pressure to appear strong for others, especially at work and in relationships. It fosters **emotional isolation and skepticism about therapy**, since vulnerability feels like failure.",
      rigidity: "moderate",
      confidence: "medium",
    },
  ],
  why_heavy: [
    {
      title: "The Criticism–Exhaustion Loop",
      description:
        "When work deadlines and relationship distance trigger feelings of overwhelm, the inner critic intensifies, labeling you as 'lazy' or 'failing.' This **increases guilt and pressure to push harder**, leading to exhaustion and poor sleep. Exhaustion then lowers resilience, making it harder to resist the critic, which fuels even more self-judgment and rumination, trapping you in a heavy cycle.",
      confidence: "high",
    },
    {
      title: "The Control–Frustration Spiral",
      description:
        "The expectation to control thoughts and feelings perfectly causes frustration when intrusive or anxious thoughts arise, especially at night. This frustration **increases rumination and emotional distress**, which worsens sleep and fuels the belief that you are failing, deepening the sense of being stuck and overwhelmed.",
      confidence: "high",
    },
  ],
  meta_patterns: [
    {
      title: "**Self-worth tied exclusively to productivity and control**",
      description:
        "Across sessions, your sense of value repeatedly hinges on how much you accomplish and how well you manage your inner experience. When these standards aren’t met, *feelings of inadequacy and failure escalate quickly*, reinforcing the inner critic and skepticism about change.",
      confidence: "high",
    },
    {
      title: "**Reluctance to soften or rest due to guilt and fear of weakness**",
      description:
        "This pattern consistently shows up as difficulty allowing yourself downtime without harsh self-judgment, which keeps emotional and physical exhaustion high and limits opportunities for genuine recovery.",
      confidence: "high",
    },
  ],
  leverage_points: [
    {
      title: "**Pause before self-criticism escalates**",
      description:
        "When the inner critic calls you 'lazy' or 'failing,' there is an opening to *notice this voice as separate from your true self*. This pause can create space to choose gentler, more realistic perspectives and interrupt the cycle of guilt and pressure.",
      confidence: "high",
    },
    {
      title: "**Experiment with small, permission-giving rest moments**",
      description:
        "Inviting yourself to try brief, non-productive breaks with curiosity rather than judgment can gently challenge rigid rules about productivity and worth, creating new experiences that safety and softness are possible.",
      confidence: "medium",
    },
    {
      title: "**Notice and name the 'must control thoughts perfectly' belief**",
      description:
        "Bringing awareness to this expectation can reduce its unconscious grip and open the door to more compassionate acceptance of normal mental fluctuations, easing frustration and rumination.",
      confidence: "medium",
    },
  ],
  where_to_start: [
    {
      title: "Try *naming* the inner critic out loud or in writing",
      description:
        "This helps create distance from harsh self-judgments and reminds you that these thoughts are not absolute truths. It can feel safer because it externalizes the critic, making it less overwhelming and more manageable.",
      difficulty: "gentle",
    },
    {
      title: "Schedule a brief 3–5 minute rest without expectations",
      description:
        "Allow yourself a tiny, permission-giving break, noticing any guilt but choosing to stay with the rest anyway. This micro-step can slowly weaken rigid rules about always needing to be productive and build trust in rest.",
      difficulty: "gentle",
    },
    {
      title: "Write down one 'should' or 'must' belief when it arises",
      description:
        "Seeing these rules on paper can help you recognize their rigidity and question their absolute truth, opening space for more flexible thinking and self-kindness.",
      difficulty: "moderate",
    },
  ],
  relevant_resources: [
    {
      category: "self-compassion",
      goal: "practice flexible self-talk",
      difficulty: "beginner",
    },
    {
      category: "cognitive-behavioral-therapy",
      goal: "understand perfectionism",
      difficulty: "intermediate",
    },
    {
      category: "mindfulness-techniques",
      goal: "cultivate non-judgmental awareness",
      difficulty: "beginner",
    },
  ],
};

const mockTherapisDiagnostics = {
  themes: [
    {
      id: "theme_skepticism_therapy",
      title: "Skepticism about Therapy Effectiveness",
      description:
        "Client expresses doubts regarding the benefit of therapy, reflecting potential ambivalence and reduced engagement.",
      severity: "medium",
      trajectory: "stable",
      evidence: [
        "User expresses skepticism about therapy effectiveness",
        "Session summary notes skepticism about therapy",
      ],
    },
    {
      id: "theme_work_stress_interpersonal",
      title: "Work Stress and Interpersonal Strain",
      description:
        "High work demands with looming deadlines and interpersonal reliance contribute to elevated stress levels.",
      severity: "high",
      trajectory: "stable",
      evidence: ["Work is busy with deadlines, people leaning on them", "Feeling overwhelmed by work deadlines"],
    },
    {
      id: "theme_relationship_distress",
      title: "Partner Relationship Distance",
      description:
        "Client reports recent emotional distance in partner relationship, potentially contributing to feelings of isolation.",
      severity: "medium",
      trajectory: "stable",
      evidence: ["Partner has been distant recently"],
    },
    {
      id: "theme_self_criticism_guilt",
      title: "Self-Criticism and Guilt",
      description:
        "Strong inner critic and pervasive guilt related to perceived laziness, weakness, and failure to meet high standards.",
      severity: "high",
      trajectory: "stable",
      evidence: [
        "Strong inner critic calling them 'lazy' or 'failing'",
        "Feels guilty when trying to be soft with themselves",
        "Self-criticism frequency: 14",
        "Guilt related to self-perception and pressure",
      ],
    },
    {
      id: "theme_cognitive_rigidity_perfectionism",
      title: "Cognitive Rigidity and Perfectionism",
      description:
        "Rigid internalized rules and perfectionistic standards drive harsh self-judgment and intolerance of perceived weakness or mistakes.",
      severity: "high",
      trajectory: "stable",
      evidence: [
        "Rigid silent rules such as 'I must do everything perfectly', 'I should never make mistakes'",
        "Expectations to control thoughts perfectly",
      ],
    },
    {
      id: "theme_sleep_difficulties",
      title: "Sleep Difficulties",
      description:
        "Difficulty initiating sleep with prolonged nocturnal rumination, exacerbated by self-critical thoughts and guilt.",
      severity: "medium",
      trajectory: "stable",
      evidence: ["Struggles with sleep, lying awake at 2am", "Rumination about unfinished tasks from the day"],
    },
    {
      id: "theme_emotional_overwhelm_trapped",
      title: "Emotional Overwhelm and Feeling Trapped",
      description:
        "Client experiences high emotional intensity with feelings of being overwhelmed and trapped by internal pressures and external demands.",
      severity: "high",
      trajectory: "stable",
      evidence: ["Feeling overwhelmed", "Feeling trapped", "Pressure to be strong"],
    },
  ],
  cognitive_distortions: [
    {
      id: "distortion_all_or_nothing",
      title: "All-or-Nothing Thinking",
      description: "Viewing situations in absolute terms, e.g., success or failure without middle ground.",
      frequency: 10,
      severity: "moderate",
    },
    {
      id: "distortion_rumination",
      title: "Rumination",
      description: "Repetitive and passive focus on distressing thoughts and problems without resolution.",
      frequency: 16,
      severity: "moderate",
    },
    {
      id: "distortion_should_statements",
      title: "Should Statements",
      description:
        "Rigid rules and expectations about how self and others must behave, leading to guilt and frustration.",
      frequency: 19,
      severity: "moderate",
    },
    {
      id: "distortion_emotional_reasoning",
      title: "Emotional Reasoning",
      description: "Assuming that feelings reflect objective reality, e.g., feeling like a failure means being one.",
      frequency: 16,
      severity: "moderate",
    },
    {
      id: "distortion_labeling",
      title: "Labeling",
      description: "Assigning global negative labels to self rather than specific behaviors.",
      frequency: 9,
      severity: "moderate",
    },
    {
      id: "distortion_personalization",
      title: "Personalization",
      description: "Taking excessive responsibility for events or outcomes beyond one’s control.",
      frequency: 10,
      severity: "low",
    },
    {
      id: "distortion_mental_filter",
      title: "Mental Filter",
      description: "Focusing exclusively on negative details while ignoring positives.",
      frequency: 1,
      severity: "moderate",
    },
    {
      id: "distortion_discounting_positives",
      title: "Discounting the Positives",
      description: "Rejecting positive experiences by insisting they 'don’t count'.",
      frequency: 1,
      severity: "moderate",
    },
  ],
  emotional_state: {
    primary: "exhaustion",
    secondary: ["anxiety", "guilt", "frustration", "hopelessness"],
    congruence: "aligned",
  },
  risk_assessment: {
    level: "moderate_concern",
    notes:
      "No current crisis or suicidal ideation reported; however, high levels of self-criticism, guilt, and perfectionism coupled with sleep disturbance and rumination warrant close monitoring for escalation of depressive or anxiety symptoms.",
  },
  therapist_focus: [
    "Establish therapeutic alliance addressing skepticism and ambivalence toward therapy.",
    "Target maladaptive perfectionism and rigid cognitive rules.",
    "Develop strategies to reduce self-criticism and enhance self-compassion.",
    "Implement cognitive restructuring to challenge pervasive cognitive distortions.",
    "Introduce behavioral interventions to improve sleep hygiene and reduce rumination.",
    "Address work-related stress and interpersonal relationship difficulties.",
    "Monitor emotional overwhelm and develop adaptive emotion regulation skills.",
  ],
  clinical_interpretations: [
    "Client presents with a constellation of cognitive distortions and rigid perfectionistic schemas contributing to chronic self-criticism and emotional distress.",
    "The presence of high self-imposed standards and harsh internal rules likely maintain a maladaptive cycle of guilt and rumination, impairing sleep and recovery.",
    "Skepticism about therapy may reflect previous negative experiences or fear of vulnerability, necessitating validation and motivational enhancement.",
    "Work stress and relationship strain act as external stressors exacerbating internal distress and feelings of being overwhelmed.",
    "The client's emotional state is congruent with described cognitive and behavioral patterns, indicating internal consistency of symptom presentation.",
  ],
  treatment_recommendations: [
    "Cognitive Behavioral Therapy (CBT) focusing on cognitive restructuring of perfectionism-related distortions and self-critical beliefs.",
    "Compassion-Focused Therapy (CFT) techniques to cultivate self-kindness and reduce shame and guilt.",
    "Mindfulness-based interventions tailored to improve acceptance of thoughts and reduce rumination.",
    "Sleep hygiene education and stimulus control strategies to address insomnia symptoms.",
    "Stress management and problem-solving training related to work and interpersonal contexts.",
    "Motivational interviewing techniques to enhance engagement and reduce therapy skepticism.",
    "Regular symptom monitoring and risk assessment for potential escalation of mood or anxiety symptoms.",
  ],
  professional_language: [
    "Perfectionistic cognitive schemas",
    "Maladaptive cognitive distortions",
    "Self-critical internal dialogue",
    "Emotional dysregulation",
    "Rumination and insomnia",
    "Therapeutic alliance and engagement",
    "Compassion cultivation",
    "Cognitive restructuring",
    "Behavioral activation",
    "Motivational enhancement",
  ],
  clinical_insights: [
    "Rigid internal rules and perfectionism are central maintaining factors of the client’s distress and impaired functioning.",
    "Addressing self-critical cognitions and enhancing self-compassion can disrupt the cycle of guilt and emotional overwhelm.",
    "Therapy skepticism is a potential barrier that requires empathic exploration and validation to foster trust and collaboration.",
    "Sleep disturbances linked to nocturnal rumination can exacerbate emotional and cognitive symptoms, necessitating targeted intervention.",
    "External stressors, including work demands and relationship distance, interact with internal vulnerabilities to sustain symptomatology.",
    "Moderate risk level underscores the importance of ongoing monitoring and supportive interventions to prevent clinical deterioration.",
  ],
};
