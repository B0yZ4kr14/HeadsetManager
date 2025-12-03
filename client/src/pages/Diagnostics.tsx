import { useState, useCallback, useMemo } from "react";
import { useSocketEvent } from "@/hooks/useSocket";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Terminal, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Wrench,
  Cpu,
  Volume2,
  Network,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

// Type definitions
interface Script {
  id: number;
  name: string;
  description: string;
  category: "driver" | "audio" | "system" | "network";
  platform: string;
  requiresRoot: boolean | null;
}

interface ScriptExecution {
  id: number;
  status: "success" | "failed" | "running";
  output: string | null;
  errorMessage: string | null;
  executionTime: number | null;
  createdAt: Date;
}

interface SocketExecutionData {
  scriptName: string;
  status: "success" | "failed";
  executionTime?: number;
  errorMessage?: string;
}

// Constants
const CATEGORY_ICONS = {
  driver: Cpu,
  audio: Volume2,
  system: Terminal,
  network: Network,
} as const;

const CATEGORY_COLORS = {
  driver: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  audio: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  system: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  network: "bg-green-500/10 text-green-500 border-green-500/20",
} as const;

const CATEGORIES = [
  { id: "all", label: "Todos", icon: Wrench },
  { id: "driver", label: "Driver", icon: Cpu },
  { id: "audio", label: "Áudio", icon: Volume2 },
  { id: "system", label: "Sistema", icon: Terminal },
  { id: "network", label: "Rede", icon: Network },
] as const;

export default function DiagnosticsPage() {
  // State
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [executingScriptId, setExecutingScriptId] = useState<number | null>(null);

  // Queries
  const { 
    data: scripts, 
    isLoading: scriptsLoading,
    error: scriptsError,
    refetch: refetchScripts
  } = trpc.headset.troubleshooting.listScripts.useQuery({
    category: selectedCategory === "all" ? undefined : selectedCategory,
  });

  const { 
    data: executions, 
    isLoading: executionsLoading,
    refetch: refetchExecutions 
  } = trpc.headset.troubleshooting.listExecutions.useQuery({
    limit: 10,
  });

  // Mutations
  const executeScriptMutation = trpc.headset.troubleshooting.executeScript.useMutation({
    onSuccess: (data) => {
      toast.success("Script executado com sucesso!", {
        description: `Tempo de execução: ${data.executionTime}ms`,
      });
      refetchExecutions();
      setExecutingScriptId(null);
    },
    onError: (error) => {
      toast.error("Erro ao executar script", {
        description: error.message,
      });
      setExecutingScriptId(null);
    },
  });

  // WebSocket event handler
  const handleScriptExecution = useCallback(
    (data: SocketExecutionData) => {
      if (data.status === "success") {
        toast.success(`${data.scriptName} concluído!`, {
          description: data.executionTime ? `Tempo: ${data.executionTime}ms` : undefined,
        });
      } else if (data.status === "failed") {
        toast.error(`${data.scriptName} falhou`, {
          description: data.errorMessage || "Erro desconhecido",
        });
      }
      refetchExecutions();
    },
    [refetchExecutions]
  );

  useSocketEvent("script:execution", handleScriptExecution);

  // Event handlers
  const handleExecuteScript = useCallback((scriptId: number, requiresRoot: boolean) => {
    if (requiresRoot) {
      toast.warning("Este script requer permissões de administrador", {
        description: "Certifique-se de que você tem as permissões necessárias.",
      });
    }

    setExecutingScriptId(scriptId);
    executeScriptMutation.mutate({ scriptId });
  }, [executeScriptMutation]);

  const handleRefreshScripts = useCallback(() => {
    refetchScripts();
    toast.info("Atualizando lista de scripts...");
  }, [refetchScripts]);

  // Computed values
  const selectedCategoryLabel = useMemo(() => {
    return CATEGORIES.find(c => c.id === selectedCategory)?.label || "Todos";
  }, [selectedCategory]);

  // Render helpers
  const renderScriptSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-lg border border-white/10 bg-background/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderExecutionStatus = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "running":
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Diagnósticos Manuais</h1>
          <p className="text-muted-foreground mt-1">Execute scripts de troubleshooting para resolver problemas comuns.</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handleRefreshScripts} 
                variant="outline" 
                disabled={scriptsLoading}
                className="backdrop-blur-sm bg-background/50"
              >
                <RefreshCw className={cn("mr-2 h-4 w-4", scriptsLoading && "animate-spin")} />
                Atualizar
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Recarregar lista de scripts disponíveis</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Error State */}
      {scriptsError && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex items-center gap-3 backdrop-blur-md">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <p className="font-medium">Erro ao carregar scripts</p>
            <p className="text-sm">{scriptsError.message}</p>
          </div>
        </div>
      )}

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
        {/* Category Tabs */}
        <TabsList className="grid w-full grid-cols-5 bg-card/50 backdrop-blur-md border border-white/10">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <TabsTrigger 
                key={cat.id} 
                value={cat.id} 
                className="data-[state=active]:bg-primary/20 transition-colors"
              >
                <Icon className="h-4 w-4 mr-2" />
                {cat.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scripts List */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-white/10 bg-card/50 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  Scripts Disponíveis
                </CardTitle>
                <CardDescription>
                  {selectedCategory === "all" 
                    ? "Todos os scripts de diagnóstico" 
                    : `Scripts da categoria: ${selectedCategoryLabel}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scriptsLoading ? (
                  renderScriptSkeleton()
                ) : scripts && scripts.length > 0 ? (
                  <div className="space-y-3">
                    {scripts.map((script) => {
                      const Icon = CATEGORY_ICONS[script.category as keyof typeof CATEGORY_ICONS] || Terminal;
                      const isExecuting = executingScriptId === script.id;

                      return (
                        <div
                          key={script.id}
                          className="p-4 rounded-lg border border-white/10 bg-background/50 hover:bg-background/80 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <h4 className="font-semibold text-foreground">{script.name}</h4>
                                {script.requiresRoot && (
                                  <Badge variant="outline" className="text-[10px] border-yellow-500/30 text-yellow-500">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    ROOT
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{script.description}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={CATEGORY_COLORS[script.category as keyof typeof CATEGORY_COLORS]}>
                                  {script.category}
                                </Badge>
                                <Badge variant="outline" className="text-[10px]">
                                  {script.platform}
                                </Badge>
                              </div>
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    onClick={() => handleExecuteScript(script.id, script.requiresRoot ?? false)}
                                    disabled={isExecuting || executeScriptMutation.isPending}
                                    className="shrink-0"
                                  >
                                    {isExecuting ? (
                                      <>
                                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                                        Executando...
                                      </>
                                    ) : (
                                      <>
                                        <Play className="h-4 w-4 mr-2" />
                                        Executar
                                      </>
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Executar script de diagnóstico</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Terminal className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum script encontrado para esta categoria.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Execution History */}
          <div className="lg:col-span-1">
            <Card className="border-white/10 bg-card/50 backdrop-blur-md h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Terminal className="h-4 w-4 text-primary" />
                  Histórico de Execuções
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  {executionsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : executions && executions.length > 0 ? (
                    <div className="space-y-3">
                      {executions.map((exec) => (
                        <Accordion key={exec.id} type="single" collapsible>
                          <AccordionItem value={`exec-${exec.id}`} className="border-white/5">
                            <AccordionTrigger className="text-sm hover:no-underline py-3">
                              <div className="flex items-center gap-2 text-left">
                                {renderExecutionStatus(exec.status)}
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(exec.createdAt)}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-xs space-y-2">
                              {exec.output && (
                                <div className="bg-black/50 p-2 rounded font-mono text-[10px] text-green-400 overflow-x-auto max-h-32 overflow-y-auto">
                                  <pre className="whitespace-pre-wrap break-words">{exec.output}</pre>
                                </div>
                              )}
                              {exec.errorMessage && (
                                <div className="bg-red-500/10 p-2 rounded text-red-400 text-[10px]">
                                  {exec.errorMessage}
                                </div>
                              )}
                              {exec.executionTime !== null && (
                                <p className="text-muted-foreground">
                                  Tempo: {exec.executionTime}ms
                                </p>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <Terminal className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma execução registrada ainda.</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>

      {/* AI Assistant Placeholder */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-card/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            Assistente de IA
          </CardTitle>
          <CardDescription>
            Analise logs e receba sugestões inteligentes de diagnóstico.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Configure sua API Key nas Configurações para ativar o assistente de diagnóstico inteligente com análise automática de logs e sugestões de correção.
          </p>
          <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10" asChild>
            <a href="/settings">Configurar API Key</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
