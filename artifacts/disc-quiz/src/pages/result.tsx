import { useLocation } from "wouter";
import { useGetResult } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Loader2, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const DISC_INFO = {
  D: {
    title: "Dominance",
    subtitle: "The Director",
    color: "bg-red-500",
    bgLight: "bg-red-50 dark:bg-red-950/20",
    textColor: "text-red-700 dark:text-red-400",
    description: "You are driven, competitive, and decisive. You focus on results, overcoming challenges, and taking action. You likely prefer a fast-paced environment where you can take charge.",
    traits: ["Direct", "Results-oriented", "Firm", "Strong-willed", "Forceful"]
  },
  I: {
    title: "Influence",
    subtitle: "The Socializer",
    color: "bg-yellow-500",
    bgLight: "bg-yellow-50 dark:bg-yellow-950/20",
    textColor: "text-yellow-700 dark:text-yellow-400",
    description: "You are enthusiastic, optimistic, and persuasive. You thrive in social situations, love collaboration, and naturally motivate those around you. You value relationships and expression.",
    traits: ["Outgoing", "Enthusiastic", "Optimistic", "High-spirited", "Lively"]
  },
  S: {
    title: "Steadiness",
    subtitle: "The Supporter",
    color: "bg-green-500",
    bgLight: "bg-green-50 dark:bg-green-950/20",
    textColor: "text-green-700 dark:text-green-400",
    description: "You are dependable, patient, and cooperative. You value stability, harmony, and consistency. You are a great listener and a loyal team member who prefers a structured environment.",
    traits: ["Even-tempered", "Accommodating", "Patient", "Humble", "Tactful"]
  },
  C: {
    title: "Conscientiousness",
    subtitle: "The Thinker",
    color: "bg-blue-500",
    bgLight: "bg-blue-50 dark:bg-blue-950/20",
    textColor: "text-blue-700 dark:text-blue-400",
    description: "You are analytical, detail-oriented, and systematic. You prioritize accuracy, quality, and expertise. You prefer working in environments with clear expectations and time to do things right.",
    traits: ["Analytical", "Reserved", "Precise", "Private", "Systematic"]
  }
} as const;

export default function Result() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const idStr = searchParams.get("id");
  const id = idStr ? parseInt(idStr, 10) : null;

  const { data: result, isLoading, isError } = useGetResult(id as number, {
    query: {
      enabled: !!id
    }
  });

  if (!id) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">No result found</h2>
        <Link href="/">
          <Button>Go to Home</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Error loading result</h2>
        <Link href="/">
          <Button>Start Over</Button>
        </Link>
      </div>
    );
  }

  const type = result.disc_type as keyof typeof DISC_INFO;
  const info = DISC_INFO[type];

  const total = result.dominance + result.influence + result.steadiness + result.conscientiousness;
  const percentages = {
    D: Math.round((result.dominance / total) * 100),
    I: Math.round((result.influence / total) * 100),
    S: Math.round((result.steadiness / total) * 100),
    C: Math.round((result.conscientiousness / total) * 100),
  };

  return (
    <div className="flex-1 container max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-3xl font-medium text-muted-foreground">
            {result.name}, your primary style is
          </h1>
          <div className="flex flex-col items-center justify-center gap-2">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl font-bold text-white shadow-lg ${info.color}`}>
              {type}
            </div>
            <h2 className="text-4xl font-bold mt-4">{info.title}</h2>
            <p className={`text-xl font-medium ${info.textColor}`}>{info.subtitle}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className={`p-8 rounded-2xl border ${info.bgLight}`}>
            <h3 className="text-xl font-semibold mb-4">About You</h3>
            <p className="text-lg leading-relaxed">{info.description}</p>
            
            <h3 className="text-lg font-semibold mt-8 mb-4">Key Traits</h3>
            <div className="flex flex-wrap gap-2">
              {info.traits.map(trait => (
                <span key={trait} className="px-3 py-1 bg-background/50 rounded-full text-sm font-medium border">
                  {trait}
                </span>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-2xl border bg-card">
            <h3 className="text-xl font-semibold mb-6">Your Score Breakdown</h3>
            <div className="space-y-6">
              <ScoreBar label="Dominance (D)" percent={percentages.D} color="bg-red-500" />
              <ScoreBar label="Influence (I)" percent={percentages.I} color="bg-yellow-500" />
              <ScoreBar label="Steadiness (S)" percent={percentages.S} color="bg-green-500" />
              <ScoreBar label="Conscientiousness (C)" percent={percentages.C} color="bg-blue-500" />
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-8">
          <Link href="/">
            <Button variant="outline" size="lg">
              Take the Quiz Again
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function ScoreBar({ label, percent, color }: { label: string; percent: number; color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000 ease-out`} 
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
