import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  severity?: "low" | "medium" | "high" | "critical";
  confidence?: number;
  timestamp: Date;
}

const severityColors = {
  low: "bg-green-500/10 text-green-500 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [apiKey, setApiKey] = useState("");

  const diagnoseMutation = trpc.headset.ai.diagnose.useMutation({
    onSuccess: data => {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          severity: data.analysis.severity,
          confidence: data.analysis.confidence,
          timestamp: new Date(),
        },
      ]);
    },
    onError: error => {
      toast.error("Erro ao analisar com IA", {
        description: error.message,
      });
    },
  });

  const { data: systemLogs } = trpc.headset.logs.list.useQuery({ limit: 20 });

  const handleSubmit = () => {
    if (!input.trim()) return;

    // Get API key from localStorage
    const storedApiKey = localStorage.getItem("openai_api_key");
    if (!storedApiKey) {
      toast.error("API Key não configurada", {
        description:
          "Configure sua API Key nas Configurações antes de usar o assistente de IA.",
      });
      return;
    }

    // Add user message
    setMessages(prev => [
      ...prev,
      {
        role: "user",
        content: input,
        timestamp: new Date(),
      },
    ]);

    // Prepare logs for analysis
    const logsText =
      systemLogs?.map(log => `[${log.level}] ${log.source}: ${log.message}`) ||
      [];

    diagnoseMutation.mutate({
      apiKey: storedApiKey,
      logs: logsText,
      errorContext: input,
    });

    setInput("");
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-card/50 backdrop-blur-md h-full flex flex-col">
      <CardHeader className="flex-none">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          Assistente de Diagnóstico IA
        </CardTitle>
        <CardDescription>
          Análise inteligente de logs e sugestões de troubleshooting
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm space-y-2">
              <Sparkles className="h-8 w-8 mx-auto text-primary/50" />
              <p>Descreva o problema que está enfrentando.</p>
              <p className="text-xs">
                O assistente analisará os logs recentes e fornecerá diagnóstico.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background/80 border border-white/10"
                    }`}
                  >
                    {msg.role === "assistant" && msg.severity && (
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={severityColors[msg.severity]}>
                          {msg.severity.toUpperCase()}
                        </Badge>
                        {msg.confidence && (
                          <Badge variant="outline" className="text-[10px]">
                            {msg.confidence}% confiança
                          </Badge>
                        )}
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                    <span className="text-[10px] text-muted-foreground mt-2 block">
                      {msg.timestamp.toLocaleTimeString("pt-BR")}
                    </span>
                  </div>
                </div>
              ))}
              {diagnoseMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-background/80 border border-white/10 rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="flex-none space-y-2">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Descreva o problema (ex: 'Headset não está sendo reconhecido')"
            className="resize-none bg-background/50"
            rows={3}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || diagnoseMutation.isPending}
            className="w-full"
          >
            {diagnoseMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Analisar com IA
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
