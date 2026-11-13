import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";

const DISC_INFO = {
  D: {
    title: "Dominant",
    subtitle: "Si Pemimpin",
    color: "bg-red-500",
    bgLight: "bg-red-50 dark:bg-red-950/20",
    textColor: "text-red-700 dark:text-red-400",
    description: "Kamu adalah pribadi yang penuh semangat, kompetitif, dan tegas. Kamu fokus pada hasil, mengatasi tantangan, dan mengambil tindakan nyata. Kamu cenderung menyukai lingkungan yang cepat di mana kamu bisa memimpin.",
    traits: ["Tegas", "Berorientasi hasil", "Teguh", "Berkemauan kuat", "Berani"]
  },
  I: {
    title: "Inspiring",
    subtitle: "Si Motivator",
    color: "bg-yellow-500",
    bgLight: "bg-yellow-50 dark:bg-yellow-950/20",
    textColor: "text-yellow-700 dark:text-yellow-400",
    description: "Kamu adalah pribadi yang antusias, optimis, dan persuasif. Kamu berkembang dalam situasi sosial, menyukai kolaborasi, dan secara alami memotivasi orang-orang di sekitarmu. Kamu sangat menghargai hubungan dan ekspresi diri.",
    traits: ["Terbuka", "Antusias", "Optimis", "Bersemangat", "Hidup"]
  },
  S: {
    title: "Steady",
    subtitle: "Si Penyokong",
    color: "bg-green-500",
    bgLight: "bg-green-50 dark:bg-green-950/20",
    textColor: "text-green-700 dark:text-green-400",
    description: "Kamu adalah pribadi yang dapat diandalkan, sabar, dan kooperatif. Kamu menghargai stabilitas, keharmonisan, dan konsistensi. Kamu adalah pendengar yang baik dan anggota tim yang setia yang lebih menyukai lingkungan yang terstruktur.",
    traits: ["Tenang", "Akomodatif", "Sabar", "Rendah hati", "Bijaksana"]
  },
  C: {
    title: "Compliant",
    subtitle: "Si Pemikir",
    color: "bg-blue-500",
    bgLight: "bg-blue-50 dark:bg-blue-950/20",
    textColor: "text-blue-700 dark:text-blue-400",
    description: "Kamu adalah pribadi yang analitis, teliti, dan sistematis. Kamu mengutamakan akurasi, kualitas, dan keahlian. Kamu lebih suka bekerja di lingkungan dengan ekspektasi yang jelas dan waktu yang cukup untuk melakukan hal-hal dengan benar.",
    traits: ["Analitis", "Cermat", "Presisi", "Terorganisir", "Sistematis"]
  }
} as const;

export default function Result() {
  const searchParams = new URLSearchParams(window.location.search);
  const idStr = searchParams.get("id");
  const id = idStr ? parseInt(idStr, 10) : null;

  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    async function fetchResult() {
      const { data, error } = await supabase
        .from("disc_results")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setIsError(true);
      } else {
        setResult(data);
      }
      setIsLoading(false);
    }

    fetchResult();
  }, [id]);

  if (!id) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Hasil tidak ditemukan</h2>
        <Link href="/">
          <Button>Ke Beranda</Button>
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
        <h2 className="text-2xl font-bold mb-4">Gagal memuat hasil</h2>
        <Link href="/">
          <Button>Mulai Ulang</Button>
        </Link>
      </div>
    );
  }

  const type = result.dominant as keyof typeof DISC_INFO;
  const info = DISC_INFO[type];
  const scores = result.scores || { D: 0, I: 0, S: 0, C: 0 };

  const total = (scores.D || 0) + (scores.I || 0) + (scores.S || 0) + (scores.C || 0) || 1;
  const percentages = {
    D: Math.round(((scores.D || 0) / total) * 100),
    I: Math.round(((scores.I || 0) / total) * 100),
    S: Math.round(((scores.S || 0) / total) * 100),
    C: Math.round(((scores.C || 0) / total) * 100),
  };

  return (
    <div className="flex-1 container max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-3xl font-medium text-muted-foreground" data-testid="text-result-name">
            {result.name}, gaya utamamu adalah
          </h1>
          <div className="flex flex-col items-center justify-center gap-2">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl font-bold text-white shadow-lg ${info.color}`} data-testid="text-disc-type">
              {type}
            </div>
            <h2 className="text-4xl font-bold mt-4" data-testid="text-disc-title">{info.title}</h2>
            <p className={`text-xl font-medium ${info.textColor}`}>{info.subtitle}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className={`p-8 rounded-2xl border ${info.bgLight}`}>
            <h3 className="text-xl font-semibold mb-4">Tentang Kamu</h3>
            <p className="text-lg leading-relaxed">{info.description}</p>
            
            <h3 className="text-lg font-semibold mt-8 mb-4">Ciri Utama</h3>
            <div className="flex flex-wrap gap-2">
              {info.traits.map(trait => (
                <span key={trait} className="px-3 py-1 bg-background/50 rounded-full text-sm font-medium border">
                  {trait}
                </span>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-2xl border bg-card">
            <h3 className="text-xl font-semibold mb-6">Rincian Skormu</h3>
            <div className="space-y-6">
              <ScoreBar label="Dominant (D)" percent={percentages.D} color="bg-red-500" />
              <ScoreBar label="Inspiring (I)" percent={percentages.I} color="bg-yellow-500" />
              <ScoreBar label="Steady (S)" percent={percentages.S} color="bg-green-500" />
              <ScoreBar label="Compliant (C)" percent={percentages.C} color="bg-blue-500" />
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-8">
          <Link href="/">
            <Button variant="outline" size="lg" data-testid="button-retake">
              Ikuti Kuis Lagi
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
