import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Mic, Volume2, Usb, CheckCircle2, AlertCircle, RefreshCw, Headphones } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2000);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground mt-1">Visão geral do sistema de áudio e dispositivos conectados.</p>
          </div>
          <Button 
            onClick={handleScan} 
            disabled={isScanning}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isScanning ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            {isScanning ? "Escaneando..." : "Escanear Dispositivos"}
          </Button>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="swiss-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status do Serviço</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ativo</div>
              <p className="text-xs text-muted-foreground mt-1">PipeWire rodando</p>
            </CardContent>
          </Card>
          <Card className="swiss-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dispositivos USB</CardTitle>
              <Usb className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground mt-1">Headsets detectados</p>
            </CardContent>
          </Card>
          <Card className="swiss-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entrada (Mic)</CardTitle>
              <Mic className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Fanvil HT301</div>
              <p className="text-xs text-muted-foreground mt-1">Volume: 85%</p>
            </CardContent>
          </Card>
          <Card className="swiss-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saída (Audio)</CardTitle>
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Fanvil HT301</div>
              <p className="text-xs text-muted-foreground mt-1">Volume: 60%</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Devices List */}
        <div className="grid gap-4 md:grid-cols-7">
          <Card className="col-span-4 swiss-card">
            <CardHeader>
              <CardTitle>Dispositivos Gerenciados</CardTitle>
              <CardDescription>Lista de headsets configurados e ativos no momento.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Device 1 */}
                <div className="flex items-center justify-between p-4 border border-border bg-secondary/20">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary/10 flex items-center justify-center text-primary">
                      <Headphones size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Fanvil HT301-U</p>
                      <p className="text-xs text-muted-foreground font-mono">ID: 2849:3011</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Ativo
                    </Badge>
                    <Button variant="ghost" size="sm">Configurar</Button>
                  </div>
                </div>

                {/* Device 2 */}
                <div className="flex items-center justify-between p-4 border border-border bg-secondary/20 opacity-75">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-muted flex items-center justify-center text-muted-foreground">
                      <Headphones size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Attimo HS01</p>
                      <p className="text-xs text-muted-foreground font-mono">ID: 1a2b:3c4d</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-secondary text-muted-foreground border-border">
                      Desconectado
                    </Badge>
                    <Button variant="ghost" size="sm">Histórico</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Logs */}
          <Card className="col-span-3 swiss-card bg-black text-white border-none">
            <CardHeader>
              <CardTitle className="text-white">Terminal Log</CardTitle>
              <CardDescription className="text-gray-400">Últimas atividades do daemon.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-xs space-y-2 text-gray-300">
                <div className="flex gap-2">
                  <span className="text-blue-400">[14:20:01]</span>
                  <span>INFO: Scanning USB bus...</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-400">[14:20:02]</span>
                  <span>INFO: Found device Fanvil HT301-U</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-400">[14:20:02]</span>
                  <span>INFO: Loading profile 'voice-call'</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-green-400">[14:20:03]</span>
                  <span>SUCCESS: Audio routed to sink 42</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-400">[14:25:10]</span>
                  <span>INFO: Volume adjusted to 85%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
