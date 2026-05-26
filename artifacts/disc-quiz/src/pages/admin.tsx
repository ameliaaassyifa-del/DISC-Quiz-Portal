import { useListResults, useGetStats, useDeleteResult, getListResultsQueryKey, getGetStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: results, isLoading: isLoadingResults } = useListResults();
  const { data: stats, isLoading: isLoadingStats } = useGetStats();
  
  const deleteMutation = useDeleteResult();

  const handleDelete = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this result?")) return;

    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListResultsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
          toast({ title: "Result deleted successfully" });
        },
        onError: () => {
          toast({ title: "Failed to delete result", variant: "destructive" });
        }
      }
    );
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

  if (isLoadingResults || isLoadingStats) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-6xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          {['D', 'I', 'S', 'C'].map(type => {
            const statForType = stats.by_type.find(s => s.disc_type === type);
            const count = statForType ? statForType.count : 0;
            const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            
            return (
              <Card key={type}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Type {type}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                  <p className="text-xs text-muted-foreground">{percent}% of total</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Results</CardTitle>
        </CardHeader>
        <CardContent>
          {results && results.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Scores (D/I/S/C)</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(result.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">{result.name}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStyleForType(result.disc_type)}`}>
                          {result.disc_type}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {result.dominance} / {result.influence} / {result.steadiness} / {result.conscientiousness}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(result.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No results found yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
