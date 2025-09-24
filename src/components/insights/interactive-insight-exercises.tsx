import React, { useState } from "react";
import { Clock, Play, RotateCcw, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ActionableInsight } from "@/domains/insights/actionable-insights.types";

interface InteractiveExerciseProps {
  insight: ActionableInsight;
  onExerciseComplete: (insightId: string, exerciseData: ExerciseResult) => void;
  onConfidenceUpdate: (insightId: string, confidence: number) => void;
}

interface ExerciseResult {
  exerciseType: string;
  userInput?: string;
  beforeRating?: number;
  afterRating?: number;
  observedChanges?: string[];
  completedSteps: number[];
  timeSpent: number;
  userReflection: string;
}

export const InteractiveInsightExercises: React.FC<InteractiveExerciseProps> = ({
  insight,
  onExerciseComplete,
  onConfidenceUpdate,
}) => {
  const [currentExercise, setCurrentExercise] = useState<string | null>(null);
  const [exerciseState, setExerciseState] = useState<"ready" | "in_progress" | "completed">("ready");
  const [exerciseData, setExerciseData] = useState<Partial<ExerciseResult>>({
    completedSteps: [],
    timeSpent: 0,
  });
  const [startTime, setStartTime] = useState<number | null>(null);

  // Get the appropriate interactive exercise based on insight type
  const getInteractiveExercise = () => {
    switch (insight.actionType) {
      case "awareness_practice":
        return <AwarenessPracticeExercise insight={insight} state={exerciseState} onStateChange={handleStateChange} />;
      case "exercise":
        return (
          <CognitiveRestructuringExercise insight={insight} state={exerciseState} onStateChange={handleStateChange} />
        );
      case "behavioral_experiment":
        return (
          <BehavioralExperimentExercise insight={insight} state={exerciseState} onStateChange={handleStateChange} />
        );
      case "reflection":
        return <ReflectionExercise insight={insight} state={exerciseState} onStateChange={handleStateChange} />;
      default:
        return <GeneralExercise insight={insight} state={exerciseState} onStateChange={handleStateChange} />;
    }
  };

  const handleStateChange = (newState: "ready" | "in_progress" | "completed", data?: Partial<ExerciseResult>) => {
    setExerciseState(newState);
    if (data) {
      setExerciseData((prev) => ({ ...prev, ...data }));
    }

    if (newState === "in_progress" && !startTime) {
      setStartTime(Date.now());
    } else if (newState === "completed" && startTime) {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      const finalData = { ...exerciseData, ...data, timeSpent };
      onExerciseComplete(insight.id, finalData as ExerciseResult);
    }
  };

  const startExercise = (exerciseType: string) => {
    setCurrentExercise(exerciseType);
    setExerciseState("in_progress");
    setStartTime(Date.now());
  };

  const resetExercise = () => {
    setCurrentExercise(null);
    setExerciseState("ready");
    setStartTime(null);
    setExerciseData({ completedSteps: [], timeSpent: 0 });
  };

  if (currentExercise && exerciseState !== "ready") {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-blue-600 flex items-center justify-center">
              <Play className="size-4 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Try It Now: {insight.title}</h4>
              <p className="text-sm text-blue-700">Interactive practice session</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={resetExercise}>
            <RotateCcw className="size-3 mr-1" />
            Reset
          </Button>
        </div>

        {getInteractiveExercise()}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="size-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
          <Play className="size-5 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-900">Try This Right Now</h4>
          <p className="text-sm text-slate-600">Interactive practice - get immediate feedback</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Button onClick={() => startExercise("quick_practice")} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Clock className="size-4 mr-2" />
          2-Minute Practice
        </Button>
        <Button
          onClick={() => startExercise("guided_exercise")}
          variant="outline"
          className="border-purple-200 text-purple-700 hover:bg-purple-50"
        >
          <Star className="size-4 mr-2" />
          Guided Exercise
        </Button>
      </div>
    </div>
  );
};

// Awareness Practice Exercise Component
const AwarenessPracticeExercise: React.FC<{
  insight: ActionableInsight;
  state: "ready" | "in_progress" | "completed";
  onStateChange: (state: "ready" | "in_progress" | "completed", data?: Partial<ExerciseResult>) => void;
}> = ({ insight, state, onStateChange }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [beforeRating, setBeforeRating] = useState<number | null>(null);
  const [afterRating, setAfterRating] = useState<number | null>(null);
  const [observations, setObservations] = useState<string>("");
  const [reflection, setReflection] = useState<string>("");

  const steps = [
    {
      title: "Rate Your Current State",
      content: "On a scale of 1-10, how aware are you of this pattern right now?",
      action: () => (
        <div className="space-y-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <button
                key={rating}
                onClick={() => setBeforeRating(rating)}
                className={`size-8 rounded text-xs font-medium transition-colors ${
                  beforeRating === rating ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">1 = not aware at all, 10 = very aware</p>
        </div>
      ),
    },
    {
      title: "Practice Awareness",
      content: insight.instructions[0]?.instruction || "Practice the awareness technique",
      action: () => (
        <div className="bg-blue-100 p-3 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">Take a moment to practice this now:</p>
          <p className="text-sm text-blue-700 italic">{insight.instructions[0]?.instruction}</p>
          <div className="mt-3">
            <p className="text-xs text-blue-600 mb-2">What do you notice?</p>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Describe what you observe happening in your thoughts, feelings, or body..."
              className="w-full p-2 text-sm border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={3}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Rate Your Awareness Now",
      content: "How aware are you of this pattern after practicing?",
      action: () => (
        <div className="space-y-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <button
                key={rating}
                onClick={() => setAfterRating(rating)}
                className={`size-8 rounded text-xs font-medium transition-colors ${
                  afterRating === rating ? "bg-green-500 text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">Notice any difference?</p>
        </div>
      ),
    },
    {
      title: "Quick Reflection",
      content: "What insight did you gain from this practice?",
      action: () => (
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="What did you learn? How might you use this awareness going forward?"
          className="w-full p-3 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete the exercise
      onStateChange("completed", {
        exerciseType: "awareness_practice",
        beforeRating: beforeRating || 0,
        afterRating: afterRating || 0,
        observedChanges: observations ? [observations] : [],
        userReflection: reflection,
        completedSteps: [0, 1, 2, 3],
      });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return beforeRating !== null;
      case 1:
        return observations.trim().length > 0;
      case 2:
        return afterRating !== null;
      case 3:
        return reflection.trim().length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {steps.map((_, index) => (
          <div key={index} className={`size-3 rounded-full ${index <= currentStep ? "bg-blue-500" : "bg-slate-200"}`} />
        ))}
        <span className="text-sm text-slate-600 ml-2">
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <h5 className="font-medium text-slate-900 mb-2">{steps[currentStep].title}</h5>
        <p className="text-sm text-slate-600 mb-4">{steps[currentStep].content}</p>
        {steps[currentStep].action()}
      </div>

      <div className="flex justify-between">
        {currentStep > 0 && (
          <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
            Previous
          </Button>
        )}
        <div className="flex-1" />
        <Button onClick={handleNext} disabled={!canProceed()}>
          {currentStep === steps.length - 1 ? "Complete Exercise" : "Next"}
        </Button>
      </div>
    </div>
  );
};

// Cognitive Restructuring Exercise Component
const CognitiveRestructuringExercise: React.FC<{
  insight: ActionableInsight;
  state: "ready" | "in_progress" | "completed";
  onStateChange: (state: "ready" | "in_progress" | "completed", data?: Partial<ExerciseResult>) => void;
}> = ({ insight, state, onStateChange }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [automaticThought, setAutomaticThought] = useState("");
  const [emotionIntensity, setEmotionIntensity] = useState<number | null>(null);
  const [identifiedDistortion, setIdentifiedDistortion] = useState("");
  const [balancedThought, setBalancedThought] = useState("");
  const [newIntensity, setNewIntensity] = useState<number | null>(null);
  const [reflection, setReflection] = useState("");

  const distortions = [
    "All-or-nothing thinking",
    "Mental filtering",
    "Discounting the positive",
    "Jumping to conclusions",
    "Magnification/minimization",
    "Emotional reasoning",
    "Should statements",
    "Labeling",
    "Personalization",
    "Fortune telling",
  ];

  const steps = [
    {
      title: "Identify the Automatic Thought",
      content: "What specific thought is causing you distress?",
      action: () => (
        <div className="space-y-3">
          <textarea
            value={automaticThought}
            onChange={(e) => setAutomaticThought(e.target.value)}
            placeholder="Write the exact thought as it appears in your mind..."
            className="w-full p-3 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">How intense is this emotion? (1-10)</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setEmotionIntensity(rating)}
                  className={`size-8 rounded text-xs font-medium transition-colors ${
                    emotionIntensity === rating
                      ? "bg-red-500 text-white"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Identify the Distortion",
      content: "Which thinking trap might be present?",
      action: () => (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {distortions.map((distortion) => (
              <button
                key={distortion}
                onClick={() => setIdentifiedDistortion(distortion)}
                className={`p-2 text-sm rounded border text-left transition-colors ${
                  identifiedDistortion === distortion
                    ? "bg-blue-100 border-blue-300 text-blue-800"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {distortion}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Create a Balanced Thought",
      content: "What would a more realistic, balanced perspective be?",
      action: () => (
        <textarea
          value={balancedThought}
          onChange={(e) => setBalancedThought(e.target.value)}
          placeholder="Consider: What would you tell a friend? What evidence supports/contradicts the thought? What's the most realistic perspective?"
          className="w-full p-3 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
      ),
    },
    {
      title: "Notice the Difference",
      content: "How does the balanced thought feel?",
      action: () => (
        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Emotional intensity now? (1-10)</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setNewIntensity(rating)}
                  className={`size-8 rounded text-xs font-medium transition-colors ${
                    newIntensity === rating
                      ? "bg-green-500 text-white"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="What do you notice about the difference in how you feel?"
            className="w-full p-3 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onStateChange("completed", {
        exerciseType: "cognitive_restructuring",
        userInput: automaticThought,
        beforeRating: emotionIntensity || 0,
        afterRating: newIntensity || 0,
        observedChanges: [identifiedDistortion, balancedThought],
        userReflection: reflection,
        completedSteps: [0, 1, 2, 3],
      });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return automaticThought.trim().length > 0 && emotionIntensity !== null;
      case 1:
        return identifiedDistortion.length > 0;
      case 2:
        return balancedThought.trim().length > 0;
      case 3:
        return newIntensity !== null && reflection.trim().length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {steps.map((_, index) => (
          <div key={index} className={`size-3 rounded-full ${index <= currentStep ? "bg-blue-500" : "bg-slate-200"}`} />
        ))}
        <span className="text-sm text-slate-600 ml-2">
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <h5 className="font-medium text-slate-900 mb-2">{steps[currentStep].title}</h5>
        <p className="text-sm text-slate-600 mb-4">{steps[currentStep].content}</p>
        {steps[currentStep].action()}
      </div>

      <div className="flex justify-between">
        {currentStep > 0 && (
          <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
            Previous
          </Button>
        )}
        <div className="flex-1" />
        <Button onClick={handleNext} disabled={!canProceed()}>
          {currentStep === steps.length - 1 ? "Complete Exercise" : "Next"}
        </Button>
      </div>
    </div>
  );
};

// Behavioral Experiment Exercise Component
const BehavioralExperimentExercise: React.FC<{
  insight: ActionableInsight;
  state: "ready" | "in_progress" | "completed";
  onStateChange: (state: "ready" | "in_progress" | "completed", data?: Partial<ExerciseResult>) => void;
}> = ({ insight, state, onStateChange }) => {
  const [prediction, setPrediction] = useState("");
  const [anxietyBefore, setAnxietyBefore] = useState<number | null>(null);
  const [actualOutcome, setActualOutcome] = useState("");
  const [anxietyAfter, setAnxietyAfter] = useState<number | null>(null);
  const [learnings, setLearnings] = useState("");

  const handleComplete = () => {
    onStateChange("completed", {
      exerciseType: "behavioral_experiment",
      userInput: prediction,
      beforeRating: anxietyBefore || 0,
      afterRating: anxietyAfter || 0,
      observedChanges: [actualOutcome],
      userReflection: learnings,
      completedSteps: [0, 1, 2],
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <h5 className="font-medium text-yellow-800 mb-2">Experimental Mindset</h5>
        <p className="text-sm text-yellow-700">
          You're about to test a prediction. There's no failure here - only learning!
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="prediction" className="text-sm font-medium text-slate-700 block mb-2">
            What do you predict will happen if you try this?
          </label>
          <textarea
            id="prediction"
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
            placeholder="Be specific about what you think will happen..."
            className="w-full p-3 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="anxiety" className="text-sm font-medium text-slate-700 block mb-2">
            Anxiety level right now (1-10):
          </label>
          <div id="anxiety" className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <button
                key={rating}
                onClick={() => setAnxietyBefore(rating)}
                className={`size-8 rounded text-xs font-medium transition-colors ${
                  anxietyBefore === rating ? "bg-red-500 text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
          <p className="text-sm text-blue-800 font-medium">Now try the experiment!</p>
          <p className="text-sm text-blue-700 mt-1">
            {insight.instructions[1]?.instruction || "Follow the action steps and observe what happens."}
          </p>
        </div>

        <div>
          <label htmlFor="actual-outcome" className="text-sm font-medium text-slate-700 block mb-2">
            What actually happened?
          </label>
          <textarea
            id="actual-outcome"
            value={actualOutcome}
            onChange={(e) => setActualOutcome(e.target.value)}
            placeholder="Describe the actual results - not what you expected, but what really occurred..."
            className="w-full p-3 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="anxiety-after" className="text-sm font-medium text-slate-700 block mb-2">
            Anxiety level after (1-10):
          </label>
          <div id="anxiety-after" className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <button
                key={rating}
                onClick={() => setAnxietyAfter(rating)}
                className={`size-8 rounded text-xs font-medium transition-colors ${
                  anxietyAfter === rating ? "bg-green-500 text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="learnings" className="text-sm font-medium text-slate-700 block mb-2">
            What did you learn?
          </label>
          <textarea
            id="learnings"
            value={learnings}
            onChange={(e) => setLearnings(e.target.value)}
            placeholder="How did this compare to your prediction? What insights did you gain?"
            className="w-full p-3 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
      </div>

      <Button
        onClick={handleComplete}
        disabled={!prediction || !actualOutcome || !learnings || anxietyBefore === null || anxietyAfter === null}
        className="w-full"
      >
        Complete Experiment
      </Button>
    </div>
  );
};

// Reflection Exercise Component
const ReflectionExercise: React.FC<{
  insight: ActionableInsight;
  state: "ready" | "in_progress" | "completed";
  onStateChange: (state: "ready" | "in_progress" | "completed", data?: Partial<ExerciseResult>) => void;
}> = ({ insight, state, onStateChange }) => {
  const [reflections, setReflections] = useState<string[]>(insight.instructions.map(() => ""));
  const [overallInsight, setOverallInsight] = useState("");

  const handleReflectionChange = (index: number, value: string) => {
    const newReflections = [...reflections];
    newReflections[index] = value;
    setReflections(newReflections);
  };

  const handleComplete = () => {
    onStateChange("completed", {
      exerciseType: "reflection",
      observedChanges: reflections,
      userReflection: overallInsight,
      completedSteps: insight.instructions.map((_, i) => i),
    });
  };

  const canComplete = reflections.every((r) => r.trim().length > 0) && overallInsight.trim().length > 0;

  return (
    <div className="space-y-4">
      {insight.instructions.map((instruction, index) => (
        <div key={index} className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="size-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-700">
              {instruction.step}
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-700 mb-2">{instruction.instruction}</p>
              {instruction.example && (
                <p className="text-xs text-slate-500 italic mb-2">Example: {instruction.example}</p>
              )}
            </div>
          </div>
          <textarea
            value={reflections[index]}
            onChange={(e) => handleReflectionChange(index, e.target.value)}
            placeholder="Take a moment to reflect and write your thoughts..."
            className="w-full p-3 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={3}
          />
        </div>
      ))}

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h5 className="font-medium text-purple-900 mb-2">What's your key takeaway?</h5>
        <textarea
          value={overallInsight}
          onChange={(e) => setOverallInsight(e.target.value)}
          placeholder="Summarize your main insight from this reflection..."
          className="w-full p-3 text-sm border border-purple-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={3}
        />
      </div>

      <Button onClick={handleComplete} disabled={!canComplete} className="w-full bg-purple-600 hover:bg-purple-700">
        Complete Reflection
      </Button>
    </div>
  );
};

// General Exercise Component (fallback)
const GeneralExercise: React.FC<{
  insight: ActionableInsight;
  state: "ready" | "in_progress" | "completed";
  onStateChange: (state: "ready" | "in_progress" | "completed", data?: Partial<ExerciseResult>) => void;
}> = ({ insight, state, onStateChange }) => {
  const [notes, setNotes] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);

  const handleComplete = () => {
    onStateChange("completed", {
      exerciseType: "general_practice",
      userReflection: notes,
      afterRating: confidence || 0,
      completedSteps: [0],
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h5 className="font-medium text-slate-900 mb-2">Practice this technique:</h5>
        <p className="text-sm text-slate-600 mb-3">{insight.instructions[0]?.instruction}</p>
        {insight.instructions[0]?.tip && (
          <p className="text-xs text-slate-500 italic">💡 {insight.instructions[0].tip}</p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="text-sm font-medium text-slate-700 block mb-2">
          How did it go? What did you notice?
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe your experience with this practice..."
          className="w-full p-3 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
      </div>

      <div>
        <label htmlFor="confidence" className="text-sm font-medium text-slate-700 block mb-2">
          How confident do you feel about using this technique? (1-10)
        </label>
        <div id="confidence" className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
            <button
              key={rating}
              onClick={() => setConfidence(rating)}
              className={`size-8 rounded text-xs font-medium transition-colors ${
                confidence === rating ? "bg-green-500 text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleComplete} disabled={!notes.trim() || confidence === null} className="w-full">
        Complete Practice
      </Button>
    </div>
  );
};
