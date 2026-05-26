import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useSubmitResult } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Answer = "D" | "I" | "S" | "C";

const QUESTIONS = [
  {
    text: "In a group project, I usually...",
    options: [
      { text: "Take charge and lead", type: "D" },
      { text: "Keep everyone motivated", type: "I" },
      { text: "Support whoever needs help", type: "S" },
      { text: "Plan everything carefully", type: "C" }
    ]
  },
  {
    text: "When facing a challenge, I...",
    options: [
      { text: "Attack it head-on", type: "D" },
      { text: "Rally others for support", type: "I" },
      { text: "Take a steady methodical approach", type: "S" },
      { text: "Research every angle first", type: "C" }
    ]
  },
  {
    text: "My ideal work environment is...",
    options: [
      { text: "Fast-paced and competitive", type: "D" },
      { text: "Social and collaborative", type: "I" },
      { text: "Stable and predictable", type: "S" },
      { text: "Structured and precise", type: "C" }
    ]
  },
  {
    text: "People describe me as...",
    options: [
      { text: "Assertive and direct", type: "D" },
      { text: "Enthusiastic and fun", type: "I" },
      { text: "Patient and dependable", type: "S" },
      { text: "Careful and thorough", type: "C" }
    ]
  },
  {
    text: "When making decisions, I...",
    options: [
      { text: "Decide quickly and move on", type: "D" },
      { text: "Ask for input from others", type: "I" },
      { text: "Take time to consider impact on people", type: "S" },
      { text: "Analyze all the data first", type: "C" }
    ]
  },
  {
    text: "I get energized by...",
    options: [
      { text: "Winning and achieving results", type: "D" },
      { text: "Being around people", type: "I" },
      { text: "Helping others succeed", type: "S" },
      { text: "Solving complex problems", type: "C" }
    ]
  },
  {
    text: "Under pressure, I tend to...",
    options: [
      { text: "Become more demanding", type: "D" },
      { text: "Become more talkative", type: "I" },
      { text: "Withdraw and become quiet", type: "S" },
      { text: "Become overly critical", type: "C" }
    ]
  },
  {
    text: "My biggest strength is...",
    options: [
      { text: "Getting things done", type: "D" },
      { text: "Inspiring others", type: "I" },
      { text: "Building trust", type: "S" },
      { text: "Ensuring accuracy", type: "C" }
    ]
  },
  {
    text: "I prefer communication that is...",
    options: [
      { text: "Direct and to the point", type: "D" },
      { text: "Warm and engaging", type: "I" },
      { text: "Friendly and patient", type: "S" },
      { text: "Detailed and factual", type: "C" }
    ]
  },
  {
    text: "I value most in a team...",
    options: [
      { text: "Results and performance", type: "D" },
      { text: "Energy and enthusiasm", type: "I" },
      { text: "Harmony and cooperation", type: "S" },
      { text: "Quality and precision", type: "C" }
    ]
  }
] as const;

export default function Quiz() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState<"name" | "questions">("name");
  const [name, setName] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  
  const submitMutation = useSubmitResult();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep("questions");
  };

  const handleAnswer = (type: Answer) => {
    const newAnswers = [...answers, type];
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(curr => curr + 1);
    } else {
      calculateAndSubmit(newAnswers);
    }
  };

  const calculateAndSubmit = (finalAnswers: Answer[]) => {
    const counts = { D: 0, I: 0, S: 0, C: 0 };
    finalAnswers.forEach(ans => counts[ans]++);

    let maxType: Answer = "D";
    let maxVal = counts["D"];

    // Tie-breaker order D > I > S > C
    if (counts["I"] > maxVal) { maxType = "I"; maxVal = counts["I"]; }
    if (counts["S"] > maxVal) { maxType = "S"; maxVal = counts["S"]; }
    if (counts["C"] > maxVal) { maxType = "C"; maxVal = counts["C"]; }

    submitMutation.mutate({
      data: {
        name: name.trim(),
        dominance: counts["D"],
        influence: counts["I"],
        steadiness: counts["S"],
        conscientiousness: counts["C"],
        disc_type: maxType
      }
    }, {
      onSuccess: (data) => {
        setLocation(`/result?id=${data.id}`);
      },
      onError: () => {
        toast({
          title: "Something went wrong",
          description: "We couldn't save your results. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  if (submitMutation.isPending) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Analyzing your responses...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {step === "name" ? (
          <motion.div
            key="name"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full bg-card p-8 rounded-2xl border shadow-sm"
          >
            <form onSubmit={handleStart} className="space-y-6">
              <div className="space-y-2 text-center mb-8">
                <h2 className="text-3xl font-bold tracking-tight">Welcome</h2>
                <p className="text-muted-foreground">Let's start by getting to know you.</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">What is your name?</Label>
                <Input
                  id="name"
                  size={32}
                  className="h-12 text-lg px-4"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg" 
                disabled={!name.trim()}
              >
                Continue
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key={`q-${currentQuestion}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full space-y-8"
          >
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span>Question {currentQuestion + 1} of {QUESTIONS.length}</span>
                <span>{Math.round(((currentQuestion) / QUESTIONS.length) * 100)}%</span>
              </div>
              <Progress value={(currentQuestion / QUESTIONS.length) * 100} className="h-2" />
            </div>

            <div className="bg-card p-6 md:p-8 rounded-2xl border shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center leading-tight">
                {QUESTIONS[currentQuestion].text}
              </h2>
              
              <div className="grid gap-4">
                {QUESTIONS[currentQuestion].options.map((option, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-4 px-6 text-left justify-start text-base font-normal whitespace-normal w-full"
                    onClick={() => handleAnswer(option.type as Answer)}
                  >
                    {option.text}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
