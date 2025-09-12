/* eslint-disable @typescript-eslint/no-use-before-define */
"use client";

import { useCallback, useRef, useState } from "react";
import { Session as PrismaSession } from "@prisma/client";

import { createSession, getSessionById } from "@/app/actions/session-actions";
import CodeView from "@/components/code-view";
import { Button } from "@/components/ui/button";
import { PersistedSessionData, Session as StoreSession } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import {
  deriveUserKey,
  encryptSession,
  generateUserSalt,
  getSessionKey,
  safeDecryptSession,
  setSessionKey,
} from "@/lib/crypto/  session-encryption";

export default function EncryptionTestRoute() {
  const [sessionId, setSessionId] = useState<string | null>("ff70ee68-81ab-41cd-acb3-0d2256ac2de7");
  const [session, setSession] = useState<PrismaSession | null>(null);
  const userSaltRef = useRef<string | null>(null);

  const setKeyPhrase = async () => {
    if (!getSessionKey()) {
      const userSalt = generateUserSalt();
      const password = "@Campus8410";
      const generatedKey = await deriveUserKey(password, userSalt);
      if (generatedKey) {
        setSessionKey(generatedKey.toString("hex"));
      }
    }
  };
  const encryptAndPersistSession = useCallback(async () => {
    try {
      if (!userSaltRef.current) {
        userSaltRef.current = generateUserSalt();
      }
      if (!userSaltRef.current) return;
      const userSalt = userSaltRef.current;
      const password = "@Campus8410";
      const generatedKey = await deriveUserKey(password, userSalt);

      if (generatedKey) {
        setSessionKey(generatedKey.toString("hex"));
      }

      const dataToEncrypt: PersistedSessionData = {
        title: mockSession.title,
        subtitle: mockSession.subtitle || undefined, // omit if null
        messages: mockSession.messages, // consider truncating very old messages if needed
        memoryStore: mockSession.memoryStore || undefined,
        continuitySummary: mockSession.continuitySummary || undefined,
        aggregatedAnalysis: mockSession.aggregatedAnalysis || undefined,
        metadata: {
          messageCount: mockSession.metadata.messageCount,
          tokenCount: mockSession.metadata.tokenCount,
          costUSD: mockSession.metadata.costUSD,
          modelCode: mockSession.modelCode,
        },
      };

      const encryptedData = encryptSession(dataToEncrypt);
      const createdSession = await createSession({
        encryptedData: Array.from(encryptedData.encryptedData),
        iv: Array.from(encryptedData.iv),
        authTag: Array.from(encryptedData.authTag),
        encAlg: encryptedData.encAlg,
      });

      if (createdSession) {
        setSessionId(createdSession.id);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);
  const fetchSession = useCallback(async () => {
    try {
      setKeyPhrase();
      if (!sessionId) return;

      const fetchedSession: PrismaSession | null = await getSessionById(sessionId);

      if (fetchedSession) {
        setSession(fetchedSession);

        const decryptedSession = safeDecryptSession(fetchedSession);
        console.log("Decrypted session:", decryptedSession);
      }
    } catch (error) {
      console.error(error);
    }
  }, [sessionId]);

  return (
    <main className="min-h-screen w-screen bg-background flex flex-col">
      <div className="flex-1 max-w-4xl bg-mir-bg-card/50 w-full backdrop-blur-sm backdrop-saturate-150 mx-auto">
        <Button onClick={encryptAndPersistSession}>Test Encryption</Button>
        <Button onClick={fetchSession}>Test Fetch</Button>

        <CodeView data={{ sessionId, session }} />
      </div>
    </main>
  );
}

const mockSession: StoreSession = {
  id: "test-session",
  title: "ضغط العمل والخوف",
  subtitle: "التعامل مع الإرهاق المفرط والمخاوف من الفشل والانهيار",
  createdAt: new Date("2025-09-09T16:25:25.760Z"),
  updatedAt: new Date("2025-09-09T16:45:55.512Z"),
  messages: [
    {
      id: "initial-message",
      role: "assistant",
      content: "مرحباً. أنا هنا للاستماع إليكِ. ما الذي يشغل بالكِ مؤخراً؟ خذي وقتكِ وابدئي بما تشعرين أنه الأنسب لكِ.",
      timestamp: 1757435127148,
    },
    {
      id: "msg_user-message-test-session_BUAbc83NmR",
      role: "user",
      content: "“بصراحة، أحس بتعب شديد هالأيام. حتى المهام الصغيرة في الشغل أو البيت صارت تجهدني أكثر من العادة.”",
      timestamp: 1757435255816,
    },
    {
      id: "msg_assistant-message-test-session_p3a-LWbz3P",
      role: "assistant",
      content:
        "هذا التعب الذي تشعرين به يشير إلى ضغط داخلي متراكم وربما توقعات عالية تضعينها على نفسكِ. أحياناً، نشعر بأن كل شيء صغير يتحول إلى عبء كبير، وهذا قد يكون علامة على الإرهاق العاطفي. هل تودين أن نركز على طريقة واحدة بسيطة لتخفيف هذا الشعور الآن، أم تفضلين أن نأخذ وقتاً لتفهم ما يثقل كاهلك أكثر؟",
      timestamp: 1757435262262,
    },
    {
      id: "msg_user-message-test-session_ObpF27_oIA",
      role: "user",
      content: "“أعتقد ودي أبدأ بطريقة بسيطة… لأن حتى التفكير في التفاصيل الكبيرة الحين يرهقني أكثر.”",
      timestamp: 1757435284868,
    },
    {
      id: "msg_assistant-message-test-session_an-znsrs1j",
      role: "assistant",
      content:
        "من الجيد أنكِ تعرفين حدودكِ الآن وتفضلين البداية بشيء بسيط. لنأخذ خطوة صغيرة: هل يمكنكِ اختيار مهمة واحدة صغيرة جداً تشعرين بأنها أقل ضغطاً وتنجزينها فقط اليوم؟ التركيز على خطوة واحدة قد يخفف من الإحساس بالإرهاق ويعطيكِ شعوراً بالإنجاز. كيف تبدو هذه الفكرة لكِ؟",
      timestamp: 1757435288964,
    },
    {
      id: "msg_user-message-test-session_vh3O9ImwBD",
      role: "user",
      content: "“يمكن أبدأ بالرد على إيميل واحد مهم… أحس إنه أقل شيء ممكن يخفف عني شوية بدون ما يستهلك طاقتي كلها.”",
      timestamp: 1757435308428,
    },
    {
      id: "msg_assistant-message-test-session_TwGKDnL_CA",
      role: "assistant",
      content:
        "اختياركِ الرد على إيميل واحد مهم هو قرار حكيم وواضح. هذا يحد من الضغط الذي قد تشعرين به من تراكم المهام. أحياناً، نميل إلى التفكير بأننا يجب أن ننجز كل شيء دفعة واحدة، وهذا يثقل كاهلنا أكثر. هل تشعرين أن تحديد هذه المهمة الصغيرة يخفف عنكِ بعض التوتر الآن؟ وإذا أردتِ، يمكننا أن نبحث معاً كيف تحافظين على هذا التوازن خطوة بخطوة. هل تودين أن نتحدث عن ذلك؟",
      timestamp: 1757435316208,
    },
    {
      id: "msg_user-message-test-session_iWA0zwwpCY",
      role: "user",
      content:
        "نعم، أود ذلك. أخشى أنه بعد الرد على الإيميل سأعود لأحمّل نفسي مهامًا أخرى بدون توقف — أحتاج طريقة بسيطة للحفاظ على هذا الحد. هل يمكنكِ اقتراح خطوات عملية ألتزم بها بعد إنجاز المهمة؟",
      timestamp: 1757435467325,
    },
    {
      id: "msg_assistant-message-test-session_MQqY6oc7w2",
      role: "assistant",
      content:
        "أفهم خوفكِ من العودة لتحمّل نفسكِ أكثر، وهذا شعور شائع حين نواجه إرهاقًا داخليًا. جربي هذه الخطوات البسيطة: 1) بعد الرد على الإيميل، خذي دقيقة للتنفس ببطء وركزي على شعور إنجازكِ. 2) حددي لنفسكِ وقت استراحة قصير (5-10 دقائق) قبل بدء أي مهمة جديدة، حتى لو كانت صغيرة. 3) اذكري لنفسكِ بلطف أن إنجاز مهمة واحدة اليوم كافٍ، وأن بإمكانكِ التوقف دون الشعور بالذنب. هذه الخطوات تساعد في كسر نمط “كل شيء أو لا شيء” وتقلل الضغط الداخلي. كيف تشعرين تجاه تجربة هذه الخطوات اليوم؟",
      timestamp: 1757435475536,
    },
    {
      id: "msg_user-message-test-session_6I1aWFkjoe",
      role: "user",
      content:
        "أشعر أن الخطوة الثانية مهمة جدًا لي — الاستراحة القصيرة. عادةً ما أقفز مباشرة من مهمة لأخرى وكأنني أهرب من التوقف. فكرة أن أسمح لنفسي حتى بخمس دقائق تجعلني أشعر بالخوف والراحة في نفس الوقت",
      timestamp: 1757435509573,
    },
    {
      id: "msg_assistant-message-test-session_BnrHl58c75",
      role: "assistant",
      content:
        'هذا التناقض بين الخوف والراحة عند التفكير في الاستراحة يعكس ضغطًا داخليًا كبيرًا، وربما صوت داخلي يقول لكِ: "يجب أن تكملي بدون توقف". هذا نوع من القاعدة الصامتة التي تضعينها على نفسكِ، وهي تزيد من الإرهاق. جربي اليوم أن تمنحي نفسكِ هذه الدقائق الخمس كاختبار صغير، مع تذكير نفسكِ أن الاستراحة ليست ضعفًا، بل فرصة لتجديد الطاقة. هل تودين أن نبحث معًا كيف يمكن أن تبدو هذه الاستراحة بشكل بسيط ومريح لكِ؟',
      timestamp: 1757435516877,
    },
    {
      id: "msg_user-message-test-session_KMiDhjc25D",
      role: "user",
      content:
        'هذا التناقض بين الخوف والراحة عند التفكير في الاستراحة يعكس ضغطًا داخليًا كبيرًا، وربما صوت داخلي يقول لكِ: "يجب أن تكملي بدون توقف". هذا نوع من القاعدة الصامتة التي تضعينها على نفسكِ، وهي تزيد من الإرهاق. جربي اليوم أن تمنحي نفسكِ هذه الدقائق الخمس كاختبار صغير، مع تذكير نفسكِ أن الاستراحة ليست ضعفًا، بل فرصة لتجديد الطاقة. هل تودين أن نبحث معًا كيف يمكن أن تبدو هذه الاستراحة بشكل بسيط ومريح لكِ؟',
      timestamp: 1757435524513,
    },
    {
      id: "msg_assistant-message-test-session_7F1NzQPQkJ",
      role: "assistant",
      content:
        "أنتِ تحملين قاعدة صامتة قوية تقول إن التوقف يعني فشل أو ضعف، وهذا يزيد من شعورك بالخوف رغم حاجتك للراحة. هل يمكن أن نسأل معًا: ماذا سيحدث لو لم تكن الاستراحة “مطلوبة” أو “مسموحة” فقط، بل كانت خيارًا طبيعيًا يُشعركِ بالقوة؟ جربي أن تحددي لنفسكِ لحظة استراحة قصيرة جدًا، حتى لو كانت دقيقة واحدة، وراقبي شعوركِ بعدها. هل تريدين أن نساعدكِ على وضع خطة بسيطة للاستراحة تناسب إيقاعكِ وتخفف الضغط الداخلي؟",
      timestamp: 1757435533320,
    },
    {
      id: "msg_user-message-test-session_zAiNbbsnkO",
      role: "user",
      content:
        "أنتِ تحملين قاعدة صامتة قوية تقول إن التوقف يعني فشل أو ضعف، وهذا يزيد من شعورك بالخوف رغم حاجتك للراحة. هل يمكن أن نسأل معًا: ماذا سيحدث لو لم تكن الاستراحة “مطلوبة” أو “مسموحة” فقط، بل كانت خيارًا طبيعيًا يُشعركِ بالقوة؟ جربي أن تحددي لنفسكِ لحظة استراحة قصيرة جدًا، حتى لو كانت دقيقة واحدة، وراقبي شعوركِ بعدها. هل تريدين أن نساعدكِ على وضع خطة بسيطة للاستراحة تناسب إيقاعكِ وتخفف الضغط الداخلي؟",
      timestamp: 1757435544107,
    },
    {
      id: "msg_assistant-message-test-session_I7XsoK8KlZ",
      role: "assistant",
      content:
        "أنتِ تضعين لنفسكِ قاعدة صارمة تجعل التوقف يُشعركِ بالذنب أو الضعف، وهذا يثقل عليكِ رغم حاجتكِ الواضحة للراحة. ماذا لو جربتِ أن تعتمدي الاستراحة كعلامة على قوتكِ واهتمامك بنفسكِ، لا كخيار ثانوي أو ضعف؟ حاولي اليوم أن تمنحي نفسكِ دقيقة واحدة فقط للتوقف، حتى لو بدا ذلك صعبًا. هل تفضلين أن نبدأ بخطوات بسيطة جدًا تساعدكِ على جعل هذه الدقائق جزءًا من يومكِ دون ضغط؟",
      timestamp: 1757435549910,
    },
    {
      id: "msg_user-message-test-session_eGvwKGf3S2",
      role: "user",
      content: '"تذكري لما قلتلك عن الاجتماع مع مديري؟ اليوم صار نفس الشيء بس مع عميل مهم."\n',
      timestamp: 1757435759968,
    },
    {
      id: "msg_assistant-message-test-session_aqUArgr1MK",
      role: "assistant",
      content:
        "أشعر أن هذا الوضع يضيف عليك ضغطًا إضافيًا، خاصة وأنكِ تنتقلين من موقف مع المدير إلى موقف آخر مع عميل مهم بنفس التوتر. هل تشعرين أن هذا يرفع من صوت القاعدة الصامتة التي تقول إنه يجب عليكِ أن تكوني مثالية دائمًا؟ إذا أحببتِ، يمكننا التفكير في خطوة صغيرة تساعدكِ على تهدئة هذا التوتر قبل الاجتماع. هل تودين أن نركز على ذلك الآن؟",
      timestamp: 1757435766259,
    },
    {
      id: "msg_user-message-test-session_rICcWOuEtM",
      role: "user",
      content: '"أمس كان عندي موعد مع طبيبة النفسية وقالتلي إني أعاني من قلق مزمن. ما أدري كيف أتعامل مع هالخبر."',
      timestamp: 1757435799267,
    },
    {
      id: "msg_assistant-message-test-session_qeF60jN82X",
      role: "assistant",
      content:
        'أسمع كيف أن خبر القلق المزمن أثقل عليكِ وربما شعرتِ بخوف أو عدم يقين حول المستقبل. قد يظهر صوت داخلي صارم يقول لكِ: "أنا ضعيفة أو غير قادرة على التحكم." هذه الأفكار ليست حقيقة مطلقة، بل جزء من قلقكِ الذي يمكن التعامل معه. هل ترغبين أن نبدأ بخطوات صغيرة تساعدكِ اليوم على تهدئة هذا التوتر، مثل التنفس العميق أو لحظة توقف قصيرة؟ كيف تشعرين الآن تجاه هذا الخبر؟',
      timestamp: 1757435804781,
    },
    {
      id: "msg_user-message-test-session_9VRSwKcHGb",
      role: "user",
      content: '"لو ما نجحت في المشروع ده، حياتي المهنية خلاص انتهت. كل الناس حيشوفوني فاشلة."\n',
      timestamp: 1757435831788,
    },
    {
      id: "msg_assistant-message-test-session_ENrgqhlwOU",
      role: "assistant",
      content:
        'أسمع صوت الناقد الداخلي القاسي، الذي يربط نجاحك كله بهذا المشروع فقط، ويقول إن الفشل يعني نهاية كل شيء. هذا التفكير يُسمى "التفكير بالأبيض والأسود"، وهو يصور الأمور بشكل مطلق لا يترك مجالًا للخطأ أو التعلم. لكن الحقيقة أنكِ أكثر من مشروع واحد، وفشلك في خطوة لا يعني فشلك كامرأة أو محترفة. هل ترغبين في مراقبة هذا الصوت عندما يظهر؟ وكيف يؤثر على شعورك بنفسك؟',
      timestamp: 1757435841350,
    },
    {
      id: "msg_user-message-test-session_YJzLqORJ_5",
      role: "user",
      content: '"أنا إما أكون مثالية في كل شيء أو أكون عديمة الفائدة تماماً. مافيش حاجة في النص."\n',
      timestamp: 1757435864284,
    },
    {
      id: "msg_assistant-message-test-session_TtwpGPz8zC",
      role: "assistant",
      content:
        'أنتِ تسمعين صوت الناقد الداخلي الذي يفرض عليكِ قاعدة صارمة: "إما الكمال أو الفشل التام." هذا التفكير يُعرف بالتفكير بالأبيض والأسود، وهو يضغط عليكِ كثيرًا ويُشعركِ بعدم الراحة. لكن الحقيقة أن الكمال المطلق نادر، وأن القيمة الحقيقية لا تُقاس بإنجازاتك فقط. هل تودين أن نلاحظ معًا متى يظهر هذا الصوت، وكيف يمكنكِ أن تمنحي نفسك مجالًا أوسع بين هذين النقيضين؟',
      timestamp: 1757435870905,
    },
    {
      id: "msg_user-message-test-session_y-J-Iqwtmo",
      role: "user",
      content: '"مش قادرة أتنفس كويس، قلبي بيضرب بسرعة، وحاسة إن كل حاجة حواليا بتنهار. مش عارفة أعمل إيه."\n',
      timestamp: 1757435890716,
    },
    {
      id: "msg_assistant-message-test-session_gQDmVeJaMM",
      role: "assistant",
      content:
        "أشعر بثقل اللحظة التي تمرين بها، والتنفس السريع وقلبك المتسارع يعكسان شعورك بالانهيار. هذا صوت القلق الشديد، والناقد الداخلي قد يقول لكِ إنك عاجزة تمامًا، لكن هذا ليس حقيقة كاملة. هل تودين أن نأخذ معًا نفسًا عميقًا وبطيئًا الآن؟ فقط ركزي على التنفس، خطوة بخطوة، ولا تقلقي إن استمر الارتباك. هل تفضلين أن نبطئ قليلاً أو نركز على شيء واحد يساعدكِ في هذه اللحظة؟",
      timestamp: 1757435898004,
    },
    {
      id: "msg_user-message-test-session_ztPi6JY9HR",
      role: "user",
      content: '"كل الكلام ده حلو بس مش عملي. أنا محتاجة حلول سريعة مش therapy talk."\n',
      timestamp: 1757436347639,
    },
    {
      id: "msg_assistant-message-test-session_KQHbgEhkNZ",
      role: "assistant",
      content:
        "أرى أن الحديث النظري لا يلبي حاجتك الآن، وهذا شعور مفهوم عندما تكونين محاطة بالضغط. قد يكون هذا نوعًا من المقاومة الطبيعية تجاه ما يبدو غير ملموس. ماذا لو نجرب خطوات صغيرة وسريعة الآن؟ مثلاً، ١) خذي خمس دقائق فقط للتركيز على التنفس البطيء، ٢) حددي مهمة صغيرة واحدة يمكن إنجازها خلال ربع ساعة، ٣) امنحي نفسك إذنًا لأخذ استراحة قصيرة بعدها. هل تودين أن نبدأ معًا بهذه الخطوات؟",
      timestamp: 1757436355512,
    },
  ],
  memoryStore:
    "User expresses feeling extreme fatigue recently.\nUser finds small tasks at work and home more exhausting than usual.\nDecided to start by replying to one important email\nFeels it will help alleviate some stress without draining all energy\nالشعور بضغط العمل بعد الرد على الإيميل\nالحاجة لطريقة بسيطة للحفاظ على التوقف بعد القيام بالمهام\nطلب اقتراح خطوات عملية للالتزام بها بعد إنجاز المهمة\nالمستخدم يشعر أن الخطوة الثانية مهمة جدًا بالنسبة له\nالمستخدم يعتبر الاستراحة القصيرة مهمة\nالمستخدم يشعر بالخوف والراحة في نفس الوقت عند التفكير في السماح لنفسه بخمس دقائق من الراحة\nDiscussed meeting with manager previously\nToday had similar situation but with important client\nHad an appointment with a psychiatrist yesterday\nPsychiatrist diagnosed chronic anxiety\nUncertain about how to deal with the diagnosis\nFailure in this project is seen as the end of my professional life\nI feel like everyone will see me as a failure\nDifficulty breathing\nHeart beating rapidly\nFeeling of everything around collapsing",
  continuitySummary: {
    lastMessageIndex: 5,
    updatedAt: new Date("2025-09-09T16:45:55.512Z"),
    text: "User expressed extreme fatigue and overwhelming fear of failure and collapse after dealing with work pressure. The user struggles with self-worth tied to success, perfectionism, and fear of being seen as a failure. Despite feeling vulnerable and uncertain about coping, the user attempted to address tasks with the fear of everything collapsing around them.",
  },
  analysisSnapshots: [
    {
      core_module: null,
      process_module: "overwhelm",
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [],
      themes: ["fatigue", "low energy", "task overwhelm"],
      core_beliefs: [],
      silent_rules: [],
      state: "returning",
      update_memory: true,
      recall_memory: false,
    },
    {
      core_module: null,
      process_module: "overwhelm",
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [],
      themes: ["overwhelm"],
      core_beliefs: [],
      silent_rules: [],
      state: "returning",
      update_memory: false,
      recall_memory: false,
    },
    {
      core_module: null,
      process_module: "overwhelm",
      utility_module: null,
      intensity: "moderate",
      crisis: "none",
      distortions: [],
      themes: ["managing overwhelm", "energy conservation"],
      core_beliefs: [],
      silent_rules: [],
      state: "returning",
      update_memory: true,
      recall_memory: false,
    },
    {
      core_module: null,
      process_module: "overwhelm",
      utility_module: "guidance",
      intensity: "moderate",
      crisis: "none",
      distortions: ["all-or-nothing"],
      themes: ["task overload", "self-regulation difficulty"],
      core_beliefs: [],
      silent_rules: ["I must not stop taking on tasks"],
      state: "returning",
      update_memory: true,
      recall_memory: false,
    },
    {
      core_module: null,
      process_module: "overwhelm",
      utility_module: "guidance",
      intensity: "moderate",
      crisis: "none",
      distortions: ["all-or-nothing"],
      themes: ["fear of stopping", "conflicted feelings about rest"],
      core_beliefs: [],
      silent_rules: ["must keep moving", "rest is risky"],
      state: "returning",
      update_memory: true,
      recall_memory: false,
    },
    {
      core_module: "shoulds",
      process_module: "overwhelm",
      utility_module: "guidance",
      intensity: "moderate",
      crisis: "none",
      distortions: ["all-or-nothing"],
      themes: ["internal pressure", "self-care resistance"],
      core_beliefs: ["I must keep going without breaks"],
      silent_rules: ["I should not take breaks"],
      state: "returning",
      update_memory: false,
      recall_memory: true,
    },
    {
      core_module: "shoulds",
      process_module: "overwhelm",
      utility_module: "guidance",
      intensity: "moderate",
      crisis: "none",
      distortions: ["all-or-nothing"],
      themes: [],
      core_beliefs: [],
      silent_rules: ["التوقف يعني فشل أو ضعف"],
      state: "returning",
      update_memory: false,
      recall_memory: false,
    },
    {
      core_module: null,
      process_module: "overwhelm",
      utility_module: "guidance",
      intensity: "moderate",
      crisis: "none",
      distortions: ["all-or-nothing"],
      themes: [],
      core_beliefs: [],
      silent_rules: [],
      state: "returning",
      update_memory: true,
      recall_memory: true,
    },
    {
      core_module: "core_beliefs",
      process_module: "overwhelm",
      utility_module: "guidance",
      intensity: "moderate",
      crisis: "none",
      distortions: ["catastrophizing"],
      themes: ["anxiety", "uncertainty about self"],
      core_beliefs: ["I am vulnerable", "I might not cope"],
      silent_rules: [],
      state: "returning",
      update_memory: true,
      recall_memory: false,
    },
    {
      core_module: "core_beliefs",
      process_module: "overwhelm",
      utility_module: "guidance",
      intensity: "high",
      crisis: "none",
      distortions: ["all-or-nothing", "catastrophizing"],
      themes: ["fear of failure", "self-worth tied to success"],
      core_beliefs: ["I am a failure if I do not succeed"],
      silent_rules: ["I must succeed to be valued"],
      state: "returning",
      update_memory: true,
      recall_memory: true,
    },
    {
      core_module: "core_beliefs",
      process_module: "overwhelm",
      utility_module: "guidance",
      intensity: "high",
      crisis: "none",
      distortions: ["all-or-nothing"],
      themes: ["perfectionism", "self-worth"],
      core_beliefs: ["I must be perfect or I am worthless"],
      silent_rules: ["I should never be anything less than perfect"],
      state: "returning",
      update_memory: false,
      recall_memory: true,
    },
    {
      core_module: "core_beliefs",
      process_module: "overwhelm",
      utility_module: "guidance",
      intensity: "high",
      crisis: "moderate",
      distortions: ["catastrophizing"],
      themes: ["feeling overwhelmed", "fear of collapse"],
      core_beliefs: ["I am powerless", "The world is unsafe"],
      silent_rules: [],
      state: "returning",
      update_memory: true,
      recall_memory: false,
    },
    {
      core_module: null,
      process_module: "resistance_pushback",
      utility_module: "guidance",
      intensity: "high",
      crisis: "none",
      distortions: ["all-or-nothing"],
      themes: ["frustration with therapy process", "desire for practical solutions"],
      core_beliefs: [],
      silent_rules: [],
      state: "returning",
      update_memory: false,
      recall_memory: true,
    },
  ],
  metadata: {
    messageCount: 27,
    tokenCount: 47126,
    costUSD: 0.024943,
    tokenUsage: [
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 434,
          completion_tokens: 103,
          total_tokens: 537,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:27:40.114Z",
        version: "",
        costUSD: 0.0003384,
        type: "analysis",
      },
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 1084,
          completion_tokens: 99,
          total_tokens: 1183,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:27:42.253Z",
        version: "",
        costUSD: 0.0005920000000000001,
        type: "completion",
      },
      {
        model: "openai/gpt-3.5-turbo",
        mode: "paid",
        usage: {
          prompt_tokens: 215,
          completion_tokens: 26,
          total_tokens: 241,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:27:43.520Z",
        version: "",
        costUSD: 0.00014649999999999998,
        type: "memory",
      },
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 592,
          completion_tokens: 96,
          total_tokens: 688,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:28:07.058Z",
        version: "",
        costUSD: 0.00039040000000000006,
        type: "analysis",
      },
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 1208,
          completion_tokens: 87,
          total_tokens: 1295,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:28:08.956Z",
        version: "",
        costUSD: 0.0006224000000000001,
        type: "completion",
      },
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 627,
          completion_tokens: 100,
          total_tokens: 727,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:28:31.623Z",
        version: "",
        costUSD: 0.0004108,
        type: "analysis",
      },
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 1340,
          completion_tokens: 122,
          total_tokens: 1462,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:28:36.188Z",
        version: "",
        costUSD: 0.0007312,
        type: "completion",
      },
      {
        model: "openai/gpt-3.5-turbo",
        mode: "paid",
        usage: {
          prompt_tokens: 226,
          completion_tokens: 30,
          total_tokens: 256,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:28:37.285Z",
        version: "",
        costUSD: 0.000158,
        type: "memory",
      },
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 669,
          completion_tokens: 116,
          total_tokens: 785,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:31:11.878Z",
        version: "",
        costUSD: 0.0004532,
        type: "analysis",
      },
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 1802,
          completion_tokens: 170,
          total_tokens: 1972,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:31:15.530Z",
        version: "",
        costUSD: 0.0009927999999999998,
        type: "completion",
      },
      {
        model: "openai/gpt-3.5-turbo",
        mode: "paid",
        usage: {
          prompt_tokens: 288,
          completion_tokens: 110,
          total_tokens: 398,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:31:17.766Z",
        version: "",
        costUSD: 0.00030900000000000003,
        type: "memory",
      },
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 678,
          completion_tokens: 119,
          total_tokens: 797,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:31:53.942Z",
        version: "",
        costUSD: 0.0004616,
        type: "analysis",
      },
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 1900,
          completion_tokens: 130,
          total_tokens: 2030,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:31:56.870Z",
        version: "",
        costUSD: 0.0009680000000000001,
        type: "completion",
      },
      {
        model: "openai/gpt-3.5-turbo",
        mode: "paid",
        usage: {
          prompt_tokens: 289,
          completion_tokens: 137,
          total_tokens: 426,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:31:59.106Z",
        version: "",
        costUSD: 0.00035,
        type: "memory",
      },
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 751,
          completion_tokens: 122,
          total_tokens: 873,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:32:08.257Z",
        version: "",
        costUSD: 0.0004956,
        type: "analysis",
      },
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 2393,
          completion_tokens: 135,
          total_tokens: 2528,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:32:13.312Z",
        version: "",
        costUSD: 0.0011732000000000001,
        type: "completion",
      },
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 757,
          completion_tokens: 109,
          total_tokens: 866,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:32:27.166Z",
        version: "",
        costUSD: 0.0004772,
        type: "analysis",
      },
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 2272,
          completion_tokens: 134,
          total_tokens: 2406,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:32:29.900Z",
        version: "",
        costUSD: 0.0011232,
        type: "completion",
      },
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 647,
          completion_tokens: 99,
          total_tokens: 746,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:36:03.700Z",
        version: "",
        costUSD: 0.00041720000000000006,
        type: "analysis",
      },
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 2303,
          completion_tokens: 100,
          total_tokens: 2403,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:36:06.243Z",
        version: "",
        costUSD: 0.0010812,
        type: "completion",
      },
      {
        model: "openai/gpt-3.5-turbo",
        mode: "paid",
        usage: {
          prompt_tokens: 206,
          completion_tokens: 22,
          total_tokens: 228,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:36:07.370Z",
        version: "",
        costUSD: 0.000136,
        type: "memory",
      },
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 660,
          completion_tokens: 123,
          total_tokens: 783,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:36:42.049Z",
        version: "",
        costUSD: 0.00046080000000000003,
        type: "analysis",
      },
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 2157,
          completion_tokens: 115,
          total_tokens: 2272,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:36:44.776Z",
        version: "",
        costUSD: 0.0010468,
        type: "completion",
      },
      {
        model: "openai/gpt-3.5-turbo",
        mode: "paid",
        usage: {
          prompt_tokens: 219,
          completion_tokens: 33,
          total_tokens: 252,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:36:45.940Z",
        version: "",
        costUSD: 0.00015900000000000002,
        type: "memory",
      },
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 656,
          completion_tokens: 136,
          total_tokens: 792,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:37:15.455Z",
        version: "",
        costUSD: 0.00048000000000000007,
        type: "analysis",
      },
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 2316,
          completion_tokens: 112,
          total_tokens: 2428,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:37:21.338Z",
        version: "",
        costUSD: 0.0011056,
        type: "completion",
      },
      {
        model: "openai/gpt-3.5-turbo",
        mode: "paid",
        usage: {
          prompt_tokens: 203,
          completion_tokens: 31,
          total_tokens: 234,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:37:22.725Z",
        version: "",
        costUSD: 0.000148,
        type: "memory",
      },
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 659,
          completion_tokens: 128,
          total_tokens: 787,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:37:48.444Z",
        version: "",
        costUSD: 0.0004684,
        type: "analysis",
      },
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 2204,
          completion_tokens: 118,
          total_tokens: 2322,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:37:50.900Z",
        version: "",
        costUSD: 0.0010704,
        type: "completion",
      },
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 670,
          completion_tokens: 122,
          total_tokens: 792,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:38:15.338Z",
        version: "",
        costUSD: 0.0004632,
        type: "analysis",
      },
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 1946,
          completion_tokens: 130,
          total_tokens: 2076,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:38:17.981Z",
        version: "",
        costUSD: 0.0009864000000000001,
        type: "completion",
      },
      {
        model: "openai/gpt-3.5-turbo",
        mode: "paid",
        usage: {
          prompt_tokens: 219,
          completion_tokens: 22,
          total_tokens: 241,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:38:19.286Z",
        version: "",
        costUSD: 0.0001425,
        type: "memory",
      },
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 913,
          completion_tokens: 113,
          total_tokens: 1026,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:45:52.263Z",
        version: "",
        costUSD: 0.000546,
        type: "analysis",
      },
      {
        model: "openai/gpt-4.1-mini",
        mode: "paid",
        usage: {
          prompt_tokens: 2088,
          completion_tokens: 118,
          total_tokens: 2206,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T16:45:55.502Z",
        version: "",
        costUSD: 0.001024,
        type: "completion",
      },
      {
        model: "openai/gpt-3.5-turbo",
        mode: "paid",
        usage: {
          prompt_tokens: 872,
          completion_tokens: 103,
          total_tokens: 975,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T17:39:34.111Z",
        version: "",
        costUSD: 0.0005905,
        type: "summary",
      },
      {
        model: "openai/gpt-3.5-turbo",
        mode: "paid",
        usage: {
          prompt_tokens: 888,
          completion_tokens: 99,
          total_tokens: 987,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T17:40:55.867Z",
        version: "",
        costUSD: 0.0005925,
        type: "summary",
      },
      {
        model: "openai/gpt-3.5-turbo",
        mode: "paid",
        usage: {
          prompt_tokens: 888,
          completion_tokens: 132,
          total_tokens: 1020,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T17:43:35.277Z",
        version: "",
        costUSD: 0.000642,
        type: "summary",
      },
      {
        model: "openai/gpt-3.5-turbo",
        mode: "paid",
        usage: {
          prompt_tokens: 888,
          completion_tokens: 107,
          total_tokens: 995,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T17:53:30.154Z",
        version: "",
        costUSD: 0.0006045,
        type: "summary",
      },
      {
        model: "openai/gpt-3.5-turbo",
        mode: "paid",
        usage: {
          prompt_tokens: 888,
          completion_tokens: 146,
          total_tokens: 1034,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T17:54:06.278Z",
        version: "",
        costUSD: 0.000663,
        type: "summary",
      },
      {
        model: "openai/gpt-3.5-turbo",
        mode: "paid",
        usage: {
          prompt_tokens: 888,
          completion_tokens: 131,
          total_tokens: 1019,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T17:54:20.490Z",
        version: "",
        costUSD: 0.0006405,
        type: "summary",
      },
      {
        model: "openai/gpt-3.5-turbo",
        mode: "paid",
        usage: {
          prompt_tokens: 888,
          completion_tokens: 133,
          total_tokens: 1021,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T17:59:59.123Z",
        version: "",
        costUSD: 0.0006435,
        type: "summary",
      },
      {
        model: "openai/gpt-3.5-turbo",
        mode: "paid",
        usage: {
          prompt_tokens: 888,
          completion_tokens: 129,
          total_tokens: 1017,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
          },
        },
        timestamp: "2025-09-09T19:47:03.369Z",
        version: "",
        costUSD: 0.0006375,
        type: "summary",
      },
    ],
  },
  modelCode: "M1",
  aiSuggestedTitle: true,
  persistOnCloud: false,
  aggregatedAnalysis: {
    intensity: "high",
    crisis: "moderate",
    distortions: ["all-or-nothing", "catastrophizing"],
    themes: [
      "fatigue",
      "low energy",
      "task overwhelm",
      "overwhelm",
      "managing overwhelm",
      "energy conservation",
      "task overload",
      "self-regulation difficulty",
      "fear of stopping",
      "conflicted feelings about rest",
      "internal pressure",
      "self-care resistance",
      "anxiety",
      "uncertainty about self",
      "fear of failure",
      "self-worth tied to success",
      "perfectionism",
      "self-worth",
      "feeling overwhelmed",
      "fear of collapse",
      "frustration with therapy process",
      "desire for practical solutions",
    ],
    core_beliefs: [
      "I must keep going without breaks",
      "I am vulnerable",
      "I might not cope",
      "I am a failure if I do not succeed",
      "I must be perfect or I am worthless",
      "I am powerless",
      "The world is unsafe",
    ],
    silent_rules: [
      "I must not stop taking on tasks",
      "must keep moving",
      "rest is risky",
      "I should not take breaks",
      "التوقف يعني فشل أو ضعف",
      "I must succeed to be valued",
      "I should never be anything less than perfect",
    ],
  },
};
