import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TYPE_LABELS: Record<string, string> = {
  D: "Dominant",
  I: "Inspiring",
  S: "Steady",
  C: "Compliant"
};

export default function Admin() {
  const { toast } = useToast();
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("disc_results")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setResults(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Apakah kamu yakin ingin menghapus hasil ini?")) return;

    const { error } = await supabase.from("disc_results").delete().eq("id", id);
    if (!error) {
      setResults(prev => prev.filter(r => r.id !== id));
      toast({ title: "Hasil berhasil dihapus" });
    } else {
      toast({ title: "Gagal menghapus hasil", variant: "destructive" });
    }
  };

  const getStyleForType = (type: string) => {
    switch (type) {
      case "D": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "I": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "S": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "C": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const total = results.length;
  const countByType = (t: string) => results.filter(r => r.dominant === t).length;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-6xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-admin-title">Dasbor Admin</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Responden</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-total-count">{total}</div>
          </CardContent>
        </Card>
        
        {['D', 'I', 'S', 'C'].map(type => {
          const count = countByType(type);
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
          
          return (
            <Card key={type}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{TYPE_LABELS[type]}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid={`text-count-${type}`}>{count}</div>
                <p className="text-xs text-muted-foreground">{percent}% dari total</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hasil Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead className="text-right">Skor (D/I/S/C)</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => {
                    const scores = result.scores || { D: 0, I: 0, S: 0, C: 0 };
                    return (
                      <TableRow key={result.id} data-testid={`row-result-${result.id}`}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(result.created_at), "d MMM yyyy", { locale: localeId })}
                        </TableCell>
                        <TableCell className="font-medium">{result.name}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStyleForType(result.dominant)}`}>
                            {TYPE_LABELS[result.dominant] ?? result.dominant}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {scores.D ?? 0} / {scores.I ?? 0} / {scores.S ?? 0} / {scores.C ?? 0}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            data-testid={`button-delete-${result.id}`}
                            onClick={() => handleDelete(result.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground" data-testid="text-empty-results">
              Belum ada hasil yang ditemukan.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
