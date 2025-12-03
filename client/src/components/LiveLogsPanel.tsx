import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Pause, Play, Activity, Download } from "lucide-react";
import { useSocketEvent } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";

interface SystemLog {
  level: "info" | "warning" | "error" | "debug";
  source: string;
  message: string;
  details?: any;
  timestamp: Date;
}

const levelColors = {
  info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  error: "bg-red-500/10 text-red-500 border-red-500/20",
  debug: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const levelIcons = {
  info: "ℹ️",
  warning: "⚠️",
  error: "❌",
  debug: "🐛",
};

export function LiveLogsPanel() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [maxLogs] = useState(100);

  const handleNewLog = useCallback(
    (log: SystemLog) => {
      if (isPaused) return;

      setLogs((prev) => {
        const newLogs = [{ ...log, timestamp: new Date(log.timestamp) }, ...prev];
        return newLogs.slice(0, maxLogs);
      });
    },
    [isPaused, maxLogs]
  );

  useSocketEvent<SystemLog>("system:log", handleNewLog);

  const clearLogs = () => setLogs([]);
  const togglePause = () => setIsPaused(!isPaused);

  const exportLogs = () => {
    if (logs.length === 0) {
      return;
    }

    // Format logs as text
    const logText = logs
      .map((log) => {
        const timestamp = log.timestamp.toLocaleString("pt-BR");
        const header = `[${timestamp}] [${log.level.toUpperCase()}] [${log.source}]`;
        const message = log.message;
        const details = log.details ? `\nDetalhes: ${JSON.stringify(log.details, null, 2)}` : "";
        return `${header}\n${message}${details}`;
      })
      .join("\n\n" + "=".repeat(80) + "\n\n");

    // Add header
    const header = `Headset Manager - Exportação de Logs\nData: ${new Date().toLocaleString("pt-BR")}\nTotal de logs: ${logs.length}\n${
      "=".repeat(80)
    }\n\n`;

    const fullText = header + logText;

    // Create blob and download
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `headset-manager-logs-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-white/10 bg-card/50 backdrop-blur-md h-full flex flex-col">
      <CardHeader className="flex-none">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-primary animate-pulse" />
            Logs em Tempo Real
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {logs.length} logs
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={togglePause}
              title={isPaused ? "Retomar" : "Pausar"}
            >
              {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={exportLogs}
              title="Exportar logs"
              disabled={logs.length === 0}
            >
              <Download className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={clearLogs}
              title="Limpar logs"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6 pb-6">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Aguardando logs do sistema...
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-3 rounded-md border text-sm",
                    "bg-background/50 hover:bg-background/80 transition-colors",
                    "border-white/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{levelIcons[log.level]}</span>
                      <Badge className={cn("text-[10px]", levelColors[log.level])}>
                        {log.level.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        {log.source}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                      {log.timestamp.toLocaleTimeString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-foreground/90 leading-relaxed">{log.message}</p>
                  {log.details && (
                    <pre className="mt-2 text-[10px] bg-black/30 p-2 rounded overflow-x-auto text-green-400 font-mono">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
