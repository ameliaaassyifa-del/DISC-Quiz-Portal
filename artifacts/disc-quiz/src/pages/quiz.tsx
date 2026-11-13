import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

type Answer = "D" | "I" | "S" | "C";

const QUESTIONS = [
  {
    text: "Dalam proyek kelompok, saya biasanya...",
    options: [
      { text: "Mengambil kendali dan memimpin", type: "D" },
      { text: "Menjaga semangat semua orang", type: "I" },
      { text: "Mendukung siapa pun yang membutuhkan bantuan", type: "S" },
      { text: "Merencanakan segalanya dengan cermat", type: "C" }
    ]
  },
  {
    text: "Ketika menghadapi tantangan, saya...",
    options: [
      { text: "Menghadapinya langsung", type: "D" },
      { text: "Mengajak orang lain untuk bersama", type: "I" },
      { text: "Mengambil pendekatan yang tenang dan metodis", type: "S" },
      { text: "Meneliti semua sudut pandang terlebih dahulu", type: "C" }
    ]
  },
  {
    text: "Lingkungan kerja ideal saya adalah...",
    options: [
      { text: "Cepat dan kompetitif", type: "D" },
      { text: "Sosial dan kolaboratif", type: "I" },
      { text: "Stabil dan dapat diprediksi", type: "S" },
      { text: "Terstruktur dan presisi", type: "C" }
    ]
  },
  {
    text: "Orang-orang menggambarkan saya sebagai...",
    options: [
      { text: "Tegas dan langsung", type: "D" },
      { text: "Antusias dan menyenangkan", type: "I" },
      { text: "Sabar dan dapat diandalkan", type: "S" },
      { text: "Teliti dan menyeluruh", type: "C" }
    ]
  },
  {
    text: "Ketika mengambil keputusan, saya...",
    options: [
      { text: "Memutuskan dengan cepat dan melanjutkan", type: "D" },
      { text: "Meminta masukan dari orang lain", type: "I" },
      { text: "Meluangkan waktu untuk mempertimbangkan dampaknya pada orang", type: "S" },
      { text: "Menganalisis semua data terlebih dahulu", type: "C" }
    ]
  },
  {
    text: "Saya mendapat energi dari...",
    options: [
      { text: "Menang dan mencapai hasil", type: "D" },
      { text: "Berada di sekitar orang lain", type: "I" },
      { text: "Membantu orang lain sukses", type: "S" },
      { text: "Memecahkan masalah yang kompleks", type: "C" }
    ]
  },
  {
    text: "Di bawah tekanan, saya cenderung...",
    options: [
      { text: "Menjadi lebih menuntut", type: "D" },
      { text: "Menjadi lebih banyak bicara", type: "I" },
      { text: "Menarik diri dan menjadi pendiam", type: "S" },
      { text: "Menjadi terlalu kritis", type: "C" }
    ]
  },
  {
    text: "Kekuatan terbesar saya adalah...",
    options: [
      { text: "Menyelesaikan pekerjaan", type: "D" },
      { text: "Menginspirasi orang lain", type: "I" },
      { text: "Membangun kepercayaan", type: "S" },
      { text: "Memastikan keakuratan", type: "C" }
    ]
  },
  {
    text: "Saya lebih suka komunikasi yang...",
    options: [
      { text: "Langsung dan to the point", type: "D" },
      { text: "Hangat dan menarik", type: "I" },
      { text: "Ramah dan sabar", type: "S" },
      { text: "Terperinci dan faktual", type: "C" }
    ]
  },
  {
    text: "Yang paling saya hargai dalam tim adalah...",
    options: [
      { text: "Hasil dan kinerja", type: "D" },
      { text: "Energi dan antusiasme", type: "I" },
      { text: "Harmoni dan kerja sama", type: "S" },
      { text: "Kualitas dan ketepatan", type: "C" }
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep("questions");
  };

  const handleAnswer = (type: Answer) => {
    if (isSubmitting) return;
    const newAnswers = [...answers, type];
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(curr => Math.min(curr + 1, QUESTIONS.length - 1));
    } else {
      calculateAndSubmit(newAnswers);
    }
  };

  const calculateAndSubmit = async (finalAnswers: Answer[]) => {
    setIsSubmitting(true);
    const counts = { D: 0, I: 0, S: 0, C: 0 };
    finalAnswers.forEach(ans => counts[ans]++);

    let maxType: Answer = "D";
    let maxVal = counts["D"];

    if (counts["I"] > maxVal) { maxType = "I"; maxVal = counts["I"]; }
    if (counts["S"] > maxVal) { maxType = "S"; maxVal = counts["S"]; }
    if (counts["C"] > maxVal) { maxType = "C"; maxVal = counts["C"]; }

    const payload = {
      name: name.trim(),
      dominance: counts["D"],
      influence: counts["I"],
      steadiness: counts["S"],
      conscientiousness: counts["C"],
      disc_type: maxType
    };

    try {
      let res = await supabase.from("quiz_results").insert([payload]).select().single();
      if (res.error) {
        res = await supabase.from("results").insert([payload]).select().single();
      }
      if (res.error || !res.data) {
        throw res.error || new Error("Gagal menyimpan");
      }
      setLocation(`/result?id=${res.data.id}`);
    } catch (err: any) {
      console.error("Supabase insert error:", err);
      setIsSubmitting(false);
      toast({
        title: "Terjadi kesalahan",
        description: err?.message || "Kami tidak dapat menyimpan hasilmu. Silakan coba lagi.",
        variant: "destructive"
      });
    }
  };

  if (isSubmitting) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Menganalisis jawabanmu...</p>
      </div>
    );
  }

  const question = QUESTIONS[currentQuestion] ?? QUESTIONS[QUESTIONS.length - 1];

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
                <h2 className="text-3xl font-bold tracking-tight">Selamat Datang</h2>
                <p className="text-muted-foreground">Mari mulai dengan saling mengenal.</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">Siapa namamu?</Label>
                <Input
                  id="name"
                  data-testid="input-name"
                  size={32}
                  className="h-12 text-lg px-4"
                  placeholder="Masukkan namamu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>

              <Button 
                type="submit" 
                data-testid="button-continue"
                className="w-full h-12 text-lg" 
                disabled={!name.trim()}
              >
                Lanjutkan
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
                <span>Pertanyaan {currentQuestion + 1} dari {QUESTIONS.length}</span>
                <span>{Math.round(((currentQuestion) / QUESTIONS.length) * 100)}%</span>
              </div>
              <Progress value={(currentQuestion / QUESTIONS.length) * 100} className="h-2" />
            </div>

            <div className="bg-card p-6 md:p-8 rounded-2xl border shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center leading-tight">
                {question.text}
              </h2>
              
              <div className="grid gap-4">
                {question.options.map((option, i) => (
                  <Button
                    key={i}
                    data-testid={`button-option-${i}`}
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
