import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Compass, Users, Target, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 lg:py-40 bg-gradient-to-b from-primary/5 to-background text-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container max-w-4xl mx-auto space-y-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            Understand your <span className="text-primary">personality</span>.
            <br /> Unlock your potential.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            The DISC assessment helps you discover your behavioral style, understand how you communicate, and learn how to work better with others. Takes only 3 minutes.
          </p>
          <div className="pt-8">
            <Link href="/quiz">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full group">
                Start the Quiz 
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features/Info Section */}
      <section className="w-full py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">The Four Personality Types</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              DISC is the leading personal assessment tool used by over 1 million people every year to improve work productivity, teamwork and communication.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {types.map((type, i) => (
              <motion.div 
                key={type.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card border rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${type.bgColor} ${type.color}`}>
                  <type.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{type.letter}</h3>
                <h4 className="font-medium text-foreground mb-3">{type.title}</h4>
                <p className="text-sm text-muted-foreground">{type.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const types = [
  {
    letter: "D",
    title: "Dominance",
    desc: "Direct, strong-willed and forceful. Focuses on shaping their environment by overcoming opposition to accomplish results.",
    icon: Target,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30"
  },
  {
    letter: "I",
    title: "Influence",
    desc: "Sociable, talkative and lively. Focuses on shaping their environment by influencing or persuading others.",
    icon: Users,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30"
  },
  {
    letter: "S",
    title: "Steadiness",
    desc: "Gentle, accommodating and soft-hearted. Focuses on cooperating with others within existing circumstances to carry out the task.",
    icon: Shield,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30"
  },
  {
    letter: "C",
    title: "Conscientiousness",
    desc: "Private, analytical and logical. Focuses on working conscientiously within existing circumstances to ensure quality and accuracy.",
    icon: Compass,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30"
  }
];
