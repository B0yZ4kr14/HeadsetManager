import { LiveLogsPanel } from "@/components/LiveLogsPanel";
import { AIAssistant } from "@/components/AIAssistant";

export default function TerminalPage() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Terminal & Logs
        </h2>
        <p className="text-muted-foreground mt-1">
          Monitoramento em tempo real do sistema e assistente de diagnóstico
          inteligente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Logs Panel - 2/3 width */}
        <div className="lg:col-span-2 h-[600px]">
          <LiveLogsPanel />
        </div>

        {/* AI Assistant - 1/3 width */}
        <div className="lg:col-span-1 h-[600px]">
          <AIAssistant />
        </div>
      </div>
    </div>
  );
}
