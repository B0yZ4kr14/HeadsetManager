import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Pause, Play, FileDown } from "lucide-react";
import { useState } from "react";

export default function TerminalPage() {
  const [logs, setLogs] = useState([
    { time: "14:20:01", level: "INFO", msg: "Service started. Listening for udev events..." },
    { time: "14:20:01", level: "INFO", msg: "Scanning USB bus..." },
    { time: "14:20:02", level: "INFO", msg: "Found device: Fanvil HT301-U (VID:2849 PID:3011)" },
    { time: "14:20:02", level: "DEBUG", msg: "Checking database for existing profile..." },
    { time: "14:20:02", level: "INFO", msg: "Profile found: 'voice-call-optimized'" },
    { time: "14:20:02", level: "INFO", msg: "Applying PipeWire configuration..." },
    { time: "14:20:03", level: "SUCCESS", msg: "Audio routed to sink ID 42" },
    { time: "14:20:03", level: "SUCCESS", msg: "Microphone source set to ID 43" },
    { time: "14:20:03", level: "INFO", msg: "EasyEffects pipeline activated: Noise Suppression" },
    { time: "14:25:10", level: "INFO", msg: "User adjusted volume to 85%" },
    { time: "14:25:10", level: "INFO", msg: "Configuration saved to persistence layer" },
  ]);

  const [isPaused, setIsPaused] = useState(false);

  const handleExportLogs = () => {
    const logContent = logs.map(l => `[${l.time}] [${l.level}] ${l.msg}`).join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `headset-manager-logs-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Terminal & Logs</h2>
            <p className="text-muted-foreground mt-1">Monitoramento em tempo real do daemon de gerenciamento.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsPaused(!isPaused)}>
              {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
              {isPaused ? "Retomar" : "Pausar"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportLogs}>
              <FileDown className="mr-2 h-4 w-4" /> Exportar TXT
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setLogs([])}>
              <Trash2 className="mr-2 h-4 w-4" /> Limpar
            </Button>
          </div>
        </div>

        <Card className="swiss-card bg-[#0A0A0A] border-none text-gray-300 font-mono text-sm h-[600px] overflow-hidden flex flex-col shadow-inner">
          <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            {logs.length === 0 ? (
              <div className="text-gray-600 italic p-4 text-center">Log buffer empty. Waiting for events...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="flex gap-3 hover:bg-white/5 p-1 rounded transition-colors">
                  <span className="text-blue-500 opacity-70 select-none font-light">[{log.time}]</span>
                  <span className={`font-bold select-none w-20 ${
                    log.level === "INFO" ? "text-blue-400" :
                    log.level === "SUCCESS" ? "text-green-400" :
                    log.level === "DEBUG" ? "text-gray-500" :
                    "text-red-500"
                  }`}>{log.level}</span>
                  <span className="text-gray-300">{log.msg}</span>
                </div>
              ))
            )}
            {!isPaused && <div className="animate-pulse text-primary mt-2">_</div>}
          </div>
          <div className="p-2 border-t border-white/10 bg-white/5 flex items-center gap-2 text-xs text-gray-500 justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isPaused ? "bg-yellow-500" : "bg-green-500 animate-pulse"}`}></div>
              <span>Connected to local daemon (PID 1337)</span>
            </div>
            <span>{logs.length} events captured</span>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
