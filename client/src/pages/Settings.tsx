import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
          <p className="text-muted-foreground mt-1">Preferências globais do gerenciador.</p>
        </div>

        <div className="grid gap-6">
          <Card className="swiss-card">
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

          <Card className="swiss-card">
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

          <div className="flex justify-end">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" /> Salvar Alterações
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
