import { useState, useCallback } from "react";
import { useSocketEvent } from "@/hooks/useSocket";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const categoryIcons = {
  driver: Cpu,
  audio: Volume2,
  system: Terminal,
  network: Network,
};

const categoryColors = {
  driver: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  audio: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  system: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  network: "bg-green-500/10 text-green-500 border-green-500/20",
};

export default function DiagnosticsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [executingScriptId, setExecutingScriptId] = useState<number | null>(null);

  const { data: scripts, isLoading: scriptsLoading } = trpc.headset.troubleshooting.listScripts.useQuery({
    category: selectedCategory === "all" ? undefined : selectedCategory,
  });

  const { data: executions, refetch: refetchExecutions } = trpc.headset.troubleshooting.listExecutions.useQuery({
    limit: 10,
  });

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

  // Listen for real-time script execution updates via WebSocket
  const handleScriptExecution = useCallback(
    (data: any) => {
      if (data.status === "success") {
        toast.success(`${data.scriptName} concluído!`, {
          description: `Tempo: ${data.executionTime}ms`,
        });
      } else if (data.status === "failed") {
        toast.error(`${data.scriptName} falhou`, {
          description: data.errorMessage,
        });
      }
      refetchExecutions();
    },
    [refetchExecutions]
  );

  useSocketEvent("script:execution", handleScriptExecution);

  const handleExecuteScript = (scriptId: number, requiresRoot: boolean) => {
    if (requiresRoot) {
      toast.warning("Este script requer permissões de administrador", {
        description: "Certifique-se de que você tem as permissões necessárias.",
      });
    }

    setExecutingScriptId(scriptId);
    executeScriptMutation.mutate({ scriptId });
  };

  const categories = [
    { id: "all", label: "Todos", icon: Wrench },
    { id: "driver", label: "Driver", icon: Cpu },
    { id: "audio", label: "Áudio", icon: Volume2 },
    { id: "system", label: "Sistema", icon: Terminal },
    { id: "network", label: "Rede", icon: Network },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Diagnósticos Manuais</h2>
        <p className="text-muted-foreground mt-1">Execute scripts de troubleshooting para resolver problemas comuns.</p>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-card/50 backdrop-blur-md border border-white/10">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <TabsTrigger key={cat.id} value={cat.id} className="data-[state=active]:bg-primary/20">
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
                    : `Scripts da categoria: ${categories.find(c => c.id === selectedCategory)?.label}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scriptsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Carregando scripts...</div>
                ) : scripts && scripts.length > 0 ? (
                  <div className="space-y-3">
                    {scripts.map((script) => {
                      const Icon = categoryIcons[script.category as keyof typeof categoryIcons];
                      const isExecuting = executingScriptId === script.id;

                      return (
                        <div
                          key={script.id}
                          className="p-4 rounded-lg border border-white/10 bg-background/50 hover:bg-background/80 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
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
                              <div className="flex items-center gap-2">
                                <Badge className={categoryColors[script.category as keyof typeof categoryColors]}>
                                  {script.category}
                                </Badge>
                                <Badge variant="outline" className="text-[10px]">
                                  {script.platform}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleExecuteScript(script.id, script.requiresRoot ?? false)}
                              disabled={isExecuting}
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
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum script encontrado para esta categoria.
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
                  {executions && executions.length > 0 ? (
                    <div className="space-y-3">
                      {executions.map((exec) => (
                        <Accordion key={exec.id} type="single" collapsible>
                          <AccordionItem value={`exec-${exec.id}`} className="border-white/5">
                            <AccordionTrigger className="text-sm hover:no-underline py-3">
                              <div className="flex items-center gap-2 text-left">
                                {exec.status === "success" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                {exec.status === "failed" && <XCircle className="h-4 w-4 text-red-500" />}
                                {exec.status === "running" && <Clock className="h-4 w-4 text-yellow-500 animate-spin" />}
                                <span className="text-xs text-muted-foreground">
                                  {new Date(exec.createdAt).toLocaleString("pt-BR")}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-xs space-y-2">
                              {exec.output && (
                                <div className="bg-black/50 p-2 rounded font-mono text-[10px] text-green-400 overflow-x-auto">
                                  <pre>{exec.output}</pre>
                                </div>
                              )}
                              {exec.errorMessage && (
                                <div className="bg-red-500/10 p-2 rounded text-red-400 text-[10px]">
                                  {exec.errorMessage}
                                </div>
                              )}
                              {exec.executionTime && (
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
                      Nenhuma execução registrada ainda.
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
            Assistente de IA (Em Breve)
          </CardTitle>
          <CardDescription>
            Analise logs e receba sugestões inteligentes de diagnóstico.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Configure sua API Key nas Configurações para ativar o assistente de diagnóstico inteligente.
          </p>
          <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10" asChild>
            <a href="/settings">Configurar API Key</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
