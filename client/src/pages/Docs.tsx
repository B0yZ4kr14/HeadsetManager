import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Streamdown } from "streamdown";

const installGuide = `
## Instalação Rápida

Para instalar o gerenciador de headsets no Arch Linux, execute o script de setup:

\`\`\`bash
# Clone o repositório (simulado)
git clone https://github.com/manus/arch-headset-manager.git
cd arch-headset-manager

# Dê permissão de execução
chmod +x setup_arch_audio.sh

# Execute o instalador
sudo ./setup_arch_audio.sh
\`\`\`

O script irá automaticamente:
1. Instalar dependências do sistema (PipeWire, WirePlumber, Python)
2. Configurar permissões de usuário
3. Instalar bibliotecas Python necessárias
`;

const usageGuide = `
## Uso Básico

Após a instalação, o serviço pode ser iniciado manualmente ou via systemd.

### Execução Manual

\`\`\`bash
python3 headset_manager.py
\`\`\`

### Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| \`--scan\` | Lista dispositivos USB compatíveis conectados |
| \`--reset\` | Reseta configurações de áudio para o padrão |
| \`--profile <name>\` | Força o uso de um perfil específico |

### Estrutura de Configuração

As configurações são salvas em \`~/.config/headset-manager/config.json\`:

\`\`\`json
{
  "devices": {
    "2849:3011": {
      "name": "Fanvil HT301-U",
      "profile": "voice-call",
      "volume_out": 85,
      "volume_in": 100,
      "noise_suppression": true
    }
  }
}
\`\`\`
`;

export default function DocsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Documentação</h2>
          <p className="text-muted-foreground mt-1">Guias de instalação, configuração e referência de API.</p>
        </div>

        <Tabs defaultValue="install" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="install">Instalação</TabsTrigger>
            <TabsTrigger value="usage">Guia de Uso</TabsTrigger>
          </TabsList>
          
          <TabsContent value="install" className="mt-6">
            <Card className="swiss-card">
              <CardContent className="pt-6">
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                  <Streamdown>{installGuide}</Streamdown>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="usage" className="mt-6">
            <Card className="swiss-card">
              <CardContent className="pt-6">
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                  <Streamdown>{usageGuide}</Streamdown>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
