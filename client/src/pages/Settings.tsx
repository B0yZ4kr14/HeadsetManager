import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Save, Sparkles, Key, Info, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Type definitions
interface Settings {
  aiProvider: "openai" | "anthropic" | "gemini";
  aiApiKey: string;
  autoSwitch: boolean;
  desktopNotifications: boolean;
  debugMode: boolean;
  defaultVolume: number;
  audioProfile: "pro-audio" | "analog-stereo" | "digital-stereo";
}

// Constants
const DEFAULT_SETTINGS: Settings = {
  aiProvider: "openai",
  aiApiKey: "",
  autoSwitch: true,
  desktopNotifications: true,
  debugMode: false,
  defaultVolume: 60,
  audioProfile: "pro-audio",
};

const AI_PROVIDERS = [
  { value: "openai", label: "OpenAI (GPT-4o)", description: "Modelo mais avançado da OpenAI" },
  { value: "anthropic", label: "Anthropic (Claude 3.5)", description: "Excelente para análise técnica" },
  { value: "gemini", label: "Google Gemini", description: "Modelo multimodal do Google" },
] as const;

const AUDIO_PROFILES = [
  { value: "pro-audio", label: "Pro Audio (Recomendado)", description: "Melhor qualidade, baixa latência" },
  { value: "analog-stereo", label: "Analog Stereo Duplex", description: "Compatibilidade máxima" },
  { value: "digital-stereo", label: "Digital Stereo (IEC958)", description: "Saída digital" },
] as const;

const STORAGE_KEY_PREFIX = "headset_settings_";

export default function SettingsPage() {
  // State
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored: Partial<Settings> = {
        aiApiKey: localStorage.getItem(`${STORAGE_KEY_PREFIX}ai_api_key`) || "",
        aiProvider: (localStorage.getItem(`${STORAGE_KEY_PREFIX}ai_provider`) as Settings["aiProvider"]) || "openai",
        autoSwitch: localStorage.getItem(`${STORAGE_KEY_PREFIX}auto_switch`) === "true",
        desktopNotifications: localStorage.getItem(`${STORAGE_KEY_PREFIX}desktop_notifications`) !== "false",
        debugMode: localStorage.getItem(`${STORAGE_KEY_PREFIX}debug_mode`) === "true",
        defaultVolume: parseInt(localStorage.getItem(`${STORAGE_KEY_PREFIX}default_volume`) || "60", 10),
        audioProfile: (localStorage.getItem(`${STORAGE_KEY_PREFIX}audio_profile`) as Settings["audioProfile"]) || "pro-audio",
      };

      setSettings((prev) => ({ ...prev, ...stored }));
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar configurações salvas");
    }
  }, []);

  // Update individual setting
  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  // Validate API key format
  const validateApiKey = useCallback((provider: Settings["aiProvider"], key: string): boolean => {
    if (!key.trim()) return true; // Empty is valid (user may not want AI)

    switch (provider) {
      case "openai":
        return key.startsWith("sk-") && key.length > 20;
      case "anthropic":
        return key.startsWith("sk-ant-") && key.length > 20;
      case "gemini":
        return key.length > 20; // Gemini doesn't have a specific prefix
      default:
        return false;
    }
  }, []);

  // Save settings to localStorage
  const handleSave = useCallback(async () => {
    // Validate API key if provided
    if (settings.aiApiKey && !validateApiKey(settings.aiProvider, settings.aiApiKey)) {
      toast.error("API Key inválida", {
        description: `Formato incorreto para ${AI_PROVIDERS.find(p => p.value === settings.aiProvider)?.label}`,
      });
      return;
    }

    // Validate volume range
    if (settings.defaultVolume < 0 || settings.defaultVolume > 100) {
      toast.error("Volume inválido", {
        description: "O volume deve estar entre 0 e 100%",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Save to localStorage
      localStorage.setItem(`${STORAGE_KEY_PREFIX}ai_api_key`, settings.aiApiKey);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}ai_provider`, settings.aiProvider);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}auto_switch`, settings.autoSwitch.toString());
      localStorage.setItem(`${STORAGE_KEY_PREFIX}desktop_notifications`, settings.desktopNotifications.toString());
      localStorage.setItem(`${STORAGE_KEY_PREFIX}debug_mode`, settings.debugMode.toString());
      localStorage.setItem(`${STORAGE_KEY_PREFIX}default_volume`, settings.defaultVolume.toString());
      localStorage.setItem(`${STORAGE_KEY_PREFIX}audio_profile`, settings.audioProfile);

      // Simulate async save
      await new Promise(resolve => setTimeout(resolve, 300));

      toast.success("Configurações salvas com sucesso!", {
        description: "Suas preferências foram atualizadas.",
        icon: <CheckCircle2 className="h-4 w-4" />,
      });

      setHasChanges(false);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações", {
        description: "Tente novamente ou verifique o console para mais detalhes.",
      });
    } finally {
      setIsSaving(false);
    }
  }, [settings, validateApiKey]);

  // Check if API key is configured
  const isApiKeyConfigured = settings.aiApiKey.trim().length > 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Personalize o comportamento do gerenciador de headsets.</p>
      </div>

      <div className="grid gap-6">
        {/* AI Integration Settings */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-card/50 backdrop-blur-md shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              Integração de IA
            </CardTitle>
            <CardDescription>Configure o provedor de IA para diagnósticos inteligentes e análise de logs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* AI Provider */}
              <div className="space-y-2">
                <Label htmlFor="ai-provider" className="flex items-center gap-2">
                  Provedor de IA
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Escolha o modelo de IA para análise de logs e sugestões de troubleshooting</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Select value={settings.aiProvider} onValueChange={(value) => updateSetting("aiProvider", value as Settings["aiProvider"])}>
                  <SelectTrigger id="ai-provider">
                    <SelectValue placeholder="Selecione o provedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_PROVIDERS.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        <div className="flex flex-col">
                          <span>{provider.label}</span>
                          <span className="text-[10px] text-muted-foreground">{provider.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* API Key */}
              <div className="space-y-2">
                <Label htmlFor="api-key" className="flex items-center gap-2">
                  API Key
                  {isApiKeyConfigured && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                </Label>
                <div className="relative">
                  <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="api-key"
                    type={apiKeyVisible ? "text" : "password"}
                    placeholder={`sk-${settings.aiProvider === "anthropic" ? "ant-" : ""}...`}
                    className="pl-9" 
                    value={settings.aiApiKey}
                    onChange={(e) => updateSetting("aiApiKey", e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-7 w-7 p-0"
                    onClick={() => setApiKeyVisible(!apiKeyVisible)}
                  >
                    {apiKeyVisible ? "🙈" : "👁️"}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground flex items-start gap-1">
                  <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                  Sua chave é armazenada localmente no navegador e nunca é enviada para nossos servidores.
                </p>
              </div>
            </div>

            {/* API Key Status */}
            {!isApiKeyConfigured && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 p-3 rounded-lg flex items-start gap-2 text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Assistente de IA desativado</p>
                  <p className="text-xs mt-1">Configure uma API Key para habilitar diagnósticos inteligentes</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* General Behavior */}
        <Card className="border-white/10 bg-card/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Comportamento Geral</CardTitle>
            <CardDescription>Como o gerenciador deve reagir a novos dispositivos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-switch" className="text-base cursor-pointer">Auto-Switch</Label>
                <p className="text-sm text-muted-foreground">
                  Mudar automaticamente a saída de áudio ao conectar um headset.
                </p>
              </div>
              <Switch 
                id="auto-switch"
                checked={settings.autoSwitch} 
                onCheckedChange={(checked) => updateSetting("autoSwitch", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="desktop-notifications" className="text-base cursor-pointer">Notificações Desktop</Label>
                <p className="text-sm text-muted-foreground">
                  Mostrar pop-ups quando dispositivos forem conectados/desconectados.
                </p>
              </div>
              <Switch 
                id="desktop-notifications"
                checked={settings.desktopNotifications}
                onCheckedChange={(checked) => updateSetting("desktopNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="debug-mode" className="text-base cursor-pointer">Modo Debug</Label>
                <p className="text-sm text-muted-foreground">
                  Gerar logs detalhados para solução de problemas.
                </p>
              </div>
              <Switch 
                id="debug-mode"
                checked={settings.debugMode}
                onCheckedChange={(checked) => updateSetting("debugMode", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Audio Defaults */}
        <Card className="border-white/10 bg-card/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Áudio Padrão</CardTitle>
            <CardDescription>Definições iniciais para novos dispositivos desconhecidos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="default-volume">Volume Inicial (%)</Label>
              <div className="flex gap-4 items-center">
                <Input 
                  id="default-volume"
                  type="number" 
                  min={0}
                  max={100}
                  value={settings.defaultVolume}
                  onChange={(e) => updateSetting("defaultVolume", parseInt(e.target.value, 10) || 0)}
                  className="max-w-[100px]" 
                />
                <p className="text-sm text-muted-foreground">Recomendado: 50-70%</p>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="audio-profile">Perfil de Áudio Padrão</Label>
              <Select 
                value={settings.audioProfile} 
                onValueChange={(value) => updateSetting("audioProfile", value as Settings["audioProfile"])}
              >
                <SelectTrigger id="audio-profile" className="w-full md:w-[320px]">
                  <SelectValue placeholder="Selecione um perfil" />
                </SelectTrigger>
                <SelectContent>
                  {AUDIO_PROFILES.map((profile) => (
                    <SelectItem key={profile.value} value={profile.value}>
                      <div className="flex flex-col">
                        <span>{profile.label}</span>
                        <span className="text-[10px] text-muted-foreground">{profile.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end sticky bottom-6 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  className={cn(
                    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all",
                    hasChanges && "animate-pulse"
                  )}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{hasChanges ? "Clique para salvar as alterações" : "Nenhuma alteração pendente"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
