import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Sparkles, Key } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [aiProvider, setAiProvider] = useState("openai");

  useEffect(() => {
    const storedKey = localStorage.getItem("ai_api_key");
    const storedProvider = localStorage.getItem("ai_provider");
    if (storedKey) setApiKey(storedKey);
    if (storedProvider) setAiProvider(storedProvider);
  }, []);

  const handleSave = () => {
    localStorage.setItem("ai_api_key", apiKey);
    localStorage.setItem("ai_provider", aiProvider);
    toast.success("Configurações salvas com sucesso!");
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Configurações</h2>
        <p className="text-muted-foreground mt-1">Preferências globais do gerenciador.</p>
      </div>

      <div className="grid gap-6">
        {/* AI Integration Settings */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-card/50 backdrop-blur-md shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              Integração de IA
            </CardTitle>
            <CardDescription>Configure o provedor de IA para diagnósticos inteligentes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Provedor de IA</Label>
                <Select value={aiProvider} onValueChange={setAiProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o provedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI (GPT-4o)</SelectItem>
                    <SelectItem value="anthropic">Anthropic (Claude 3.5)</SelectItem>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="relative">
                  <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="password" 
                    placeholder="sk-..." 
                    className="pl-9" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Sua chave é armazenada localmente no navegador e nunca é enviada para nossos servidores.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Comportamento Geral</CardTitle>
            <CardDescription>Como o gerenciador deve reagir a novos dispositivos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Auto-Switch</Label>
                <p className="text-sm text-muted-foreground">
                  Mudar automaticamente a saída de áudio ao conectar um headset.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Notificações Desktop</Label>
                <p className="text-sm text-muted-foreground">
                  Mostrar pop-ups quando dispositivos forem conectados/desconectados.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Modo Debug</Label>
                <p className="text-sm text-muted-foreground">
                  Gerar logs detalhados para solução de problemas.
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Áudio Padrão</CardTitle>
            <CardDescription>Definições iniciais para novos dispositivos desconhecidos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label>Volume Inicial (%)</Label>
              <div className="flex gap-4">
                <Input type="number" defaultValue={60} className="max-w-[100px]" />
                <p className="text-sm text-muted-foreground self-center">Recomendado: 50-70%</p>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Perfil de Áudio Padrão</Label>
              <Select defaultValue="pro-audio">
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Selecione um perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pro-audio">Pro Audio (Recomendado)</SelectItem>
                  <SelectItem value="analog-stereo">Analog Stereo Duplex</SelectItem>
                  <SelectItem value="digital-stereo">Digital Stereo (IEC958)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end sticky bottom-6">
          <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Save className="mr-2 h-4 w-4" /> Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
}
