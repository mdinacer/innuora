#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const TITLE_TRANSLATIONS = {
  "5 Breathing Techniques That Actually Work for Anxiety": {
    ar: "5 تقنيات تنفس فعالة حقاً للقلق",
    fr: "5 Techniques de Respiration Qui Fonctionnent Vraiment pour l'Anxiété",
  },
  "Living with Generalized Anxiety Disorder: A Complete Guide": {
    ar: "العيش مع اضطراب القلق المعمم: دليل شامل",
    fr: "Vivre avec le Trouble d'Anxiété Généralisée : Guide Complet",
  },
  "How to Stop a Panic Attack: 8 Techniques That Work": {
    ar: "كيفية إيقاف نوبة الهلع: 8 تقنيات فعالة",
    fr: "Comment Arrêter une Crise de Panique : 8 Techniques Efficaces",
  },
  "Overcoming Social Anxiety: Evidence-Based Strategies That Work": {
    ar: "التغلب على القلق الاجتماعي: استراتيجيات مدعومة بالأدلة",
    fr: "Surmonter l'Anxiété Sociale : Stratégies Fondées sur des Preuves",
  },
  "Managing Workplace Anxiety: Professional Strategies for Success": {
    ar: "إدارة قلق العمل: استراتيجيات مهنية للنجاح",
    fr: "Gérer l'Anxiété au Travail : Stratégies Professionnelles pour Réussir",
  },
  "Behavioral Experiments in CBT: Testing Your Anxious Thoughts": {
    ar: "التجارب السلوكية في العلاج المعرفي السلوكي: اختبار أفكارك القلقة",
    fr: "Expériences Comportementales en TCC : Tester Vos Pensées Anxieuses",
  },
  "7 Essential CBT Techniques Every Beginner Should Know": {
    ar: "7 تقنيات أساسية في العلاج المعرفي السلوكي يجب على كل مبتدئ معرفتها",
    fr: "7 Techniques TCC Essentielles Que Tout Débutant Devrait Connaître",
  },
  "The 10 Most Common Cognitive Distortions and How to Overcome Them": {
    ar: "التشوهات المعرفية العشرة الأكثر شيوعاً وكيفية التغلب عليها",
    fr: "Les 10 Distorsions Cognitives les Plus Courantes et Comment les Surmonter",
  },
  "How to Use Thought Records: Step-by-Step CBT Worksheet": {
    ar: "كيفية استخدام سجلات الأفكار: ورقة عمل العلاج المعرفي السلوكي خطوة بخطوة",
    fr: "Comment Utiliser les Registres de Pensées : Feuille de Travail TCC Pas à Pas",
  },
  "What is Cognitive Behavioral Therapy? A Complete Guide": {
    ar: "ما هو العلاج المعرفي السلوكي؟ دليل شامل",
    fr: "Qu'est-ce que la Thérapie Cognitivo-Comportementale ? Guide Complet",
  },
  "Finding Motivation When Depressed: 12 Practical Strategies": {
    ar: "إيجاد الدافعية عند الاكتئاب: 12 استراتيجية عملية",
    fr: "Trouver la Motivation en Cas de Dépression : 12 Stratégies Pratiques",
  },
  "10 Evidence-Based Self-Help Strategies for Depression": {
    ar: "10 استراتيجيات للمساعدة الذاتية مدعومة بالأدلة للاكتئاب",
    fr: "10 Stratégies d'Auto-Assistance Fondées sur des Preuves pour la Dépression",
  },
  "Postpartum Depression: Recognition, Support, and Recovery": {
    ar: "اكتئاب ما بعد الولادة: التعرف والدعم والتعافي",
    fr: "Dépression Post-Partum : Reconnaissance, Soutien et Récupération",
  },
  "Seasonal Depression (SAD): Causes, Symptoms, and Treatment": {
    ar: "الاكتئاب الموسمي: الأسباب والأعراض والعلاج",
    fr: "Dépression Saisonnière (TAS) : Causes, Symptômes et Traitement",
  },
  "Understanding Depression: Symptoms, Types, and Treatment Options": {
    ar: "فهم الاكتئاب: الأعراض والأنواع وخيارات العلاج",
    fr: "Comprendre la Dépression : Symptômes, Types et Options de Traitement",
  },
  "Body Scan Meditation: Complete Guide and Benefits": {
    ar: "تأمل فحص الجسم: دليل شامل والفوائد",
    fr: "Méditation du Scan Corporel : Guide Complet et Bienfaits",
  },
  "Mindful Eating: Transform Your Relationship with Food": {
    ar: "الأكل اليقظ: حوّل علاقتك مع الطعام",
    fr: "Alimentation Consciente : Transformez Votre Relation avec la Nourriture",
  },
  "Using Mindfulness to Manage Anxiety: 6 Proven Techniques": {
    ar: "استخدام اليقظة الذهنية لإدارة القلق: 6 تقنيات مثبتة",
    fr: "Utiliser la Pleine Conscience pour Gérer l'Anxiété : 6 Techniques Éprouvées",
  },
  "Mindfulness Meditation for Beginners: A Complete Guide": {
    ar: "تأمل اليقظة الذهنية للمبتدئين: دليل شامل",
    fr: "Méditation de Pleine Conscience pour Débutants : Guide Complet",
  },
  "Best Digital Mood Tracking Apps: Features and Comparison Guide": {
    ar: "أفضل تطبيقات تتبع المزاج الرقمية: الميزات ودليل المقارنة",
    fr: "Meilleures Applications de Suivi de l'Humeur : Fonctionnalités et Guide Comparatif",
  },
  "Mood Journaling Methods: Find Your Perfect Tracking Style": {
    ar: "طرق تدوين المزاج: اعثر على أسلوب التتبع المثالي لك",
    fr: "Méthodes de Journal de l'Humeur : Trouvez Votre Style de Suivi Parfait",
  },
  "How to Analyze Your Mood Patterns: A Step-by-Step Guide": {
    ar: "كيفية تحليل أنماط مزاجك: دليل خطوة بخطوة",
    fr: "Comment Analyser Vos Schémas d'Humeur : Guide Pas à Pas",
  },
  "The Science of Mood Tracking: Why It Works and How to Start": {
    ar: "علم تتبع المزاج: لماذا يعمل وكيفية البدء",
    fr: "La Science du Suivi de l'Humeur : Pourquoi Ça Marche et Comment Commencer",
  },
  "Understanding Attachment Styles in Adult Relationships": {
    ar: "فهم أنماط التعلق في العلاقات البالغة",
    fr: "Comprendre les Styles d'Attachement dans les Relations Adultes",
  },
  "Breaking Free from Codependency: A Recovery Guide": {
    ar: "التحرر من الاعتماد المتبادل: دليل التعافي",
    fr: "Se Libérer de la Codépendance : Guide de Récupération",
  },
  "Essential Communication Skills for Healthy Relationships": {
    ar: "مهارات التواصل الأساسية للعلاقات الصحية",
    fr: "Compétences de Communication Essentielles pour des Relations Saines",
  },
  "How to Set Healthy Boundaries: A Complete Guide": {
    ar: "كيفية وضع حدود صحية: دليل شامل",
    fr: "Comment Établir des Limites Saines : Guide Complet",
  },
  "Taming Your Inner Critic: From Self-Attack to Self-Support": {
    ar: "ترويض ناقدك الداخلي: من الهجوم الذاتي إلى الدعم الذاتي",
    fr: "Apprivoiser Votre Critique Intérieur : De l'Auto-Attaque au Soutien de Soi",
  },
  "Recovering from Perfectionism: Embracing Good Enough": {
    ar: "التعافي من الكمالية: احتضان الجيد بما فيه الكفاية",
    fr: "Se Remettre du Perfectionnisme : Accepter le Suffisamment Bon",
  },
  "7 Powerful Self-Compassion Exercises for Daily Practice": {
    ar: "7 تمارين قوية للرحمة الذاتية للممارسة اليومية",
    fr: "7 Exercices Puissants d'Auto-Compassion pour la Pratique Quotidienne",
  },
  "What is Self-Compassion? A Guide to Being Kind to Yourself": {
    ar: "ما هي الرحمة الذاتية؟ دليل للتعامل بلطف مع نفسك",
    fr: "Qu'est-ce que l'Auto-Compassion ? Guide pour Être Gentil avec Soi-Même",
  },
  "The Hidden Effects of Chronic Stress and How to Break Free": {
    ar: "الآثار الخفية للضغط المزمن وكيفية التحرر",
    fr: "Les Effets Cachés du Stress Chronique et Comment S'en Libérer",
  },
  "Feeling Overwhelmed? A Step-by-Step Recovery Guide": {
    ar: "تشعر بالإرهاق؟ دليل التعافي خطوة بخطوة",
    fr: "Vous Sentez-Vous Dépassé ? Guide de Récupération Pas à Pas",
  },
  "15 Science-Backed Stress Reduction Techniques for Daily Life": {
    ar: "15 تقنية مدعومة علمياً لتقليل التوتر في الحياة اليومية",
    fr: "15 Techniques de Réduction du Stress Scientifiquement Prouvées pour la Vie Quotidienne",
  },
  "Achieving Work-Life Balance: Managing Professional Stress": {
    ar: "تحقيق التوازن بين العمل والحياة: إدارة الضغط المهني",
    fr: "Atteindre l'Équilibre Travail-Vie : Gérer le Stress Professionnel",
  },
};

function updateTitles() {
  const locales = ["ar", "fr"];
  let updated = 0;

  for (const locale of locales) {
    const localeDir = path.join("src", "content", "articles", locale);

    function processDir(dir) {
      if (!fs.existsSync(dir)) return;

      const items = fs.readdirSync(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
          processDir(fullPath);
        } else if (item.name.endsWith(".md")) {
          const content = fs.readFileSync(fullPath, "utf-8");
          const { data, content: body } = matter(content);

          // Check if we have a translation for this title
          if (data.title && TITLE_TRANSLATIONS[data.title]) {
            const newTitle = TITLE_TRANSLATIONS[data.title][locale];
            if (newTitle && data.title !== newTitle) {
              data.title = newTitle;
              const newContent = matter.stringify(body, data);
              fs.writeFileSync(fullPath, newContent, "utf-8");
              updated++;
              console.log(`✅ ${locale}: ${newTitle}`);
            }
          }
        }
      }
    }

    processDir(localeDir);
  }

  console.log(`\n✨ Updated ${updated} article titles`);
}

updateTitles();
