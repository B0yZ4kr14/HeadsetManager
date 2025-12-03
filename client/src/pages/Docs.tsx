import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Settings,
  Wrench,
} from "lucide-react";
import { Streamdown } from "streamdown";

const installGuide = `
## Instalação Rápida

### Windows (.msi)

1. Baixe o instalador \`HeadsetManager-Setup.msi\` da [página de releases](https://github.com/B0yZ4kr14/HeadsetManager/releases)
2. Execute o instalador e siga as instruções
3. O aplicativo será instalado em \`C:\\Program Files\\HeadsetManager\`
4. Acesse pelo menu Iniciar: **TSI Telecom > Headset Manager**

### Linux (.bin)

\`\`\`bash
# Baixe o instalador
wget https://github.com/B0yZ4kr14/HeadsetManager/releases/latest/download/HeadsetManager-Installer.bin

# Torne executável
chmod +x HeadsetManager-Installer.bin

# Execute o instalador
sudo ./HeadsetManager-Installer.bin

# Inicie o aplicativo
headset-manager
\`\`\`

### Instalação Manual (Desenvolvimento)

**Requisitos:**
- Node.js 22.x
- PostgreSQL 14+
- pnpm 9.x

\`\`\`bash
# Clone o repositório
git clone https://github.com/B0yZ4kr14/HeadsetManager.git
cd HeadsetManager

# Instale dependências
pnpm install

# Configure o banco de dados
cp .env.example .env
# Edite .env com suas credenciais do PostgreSQL

# Execute migrações
pnpm db:push

# Popule scripts de troubleshooting
pnpm seed

# Inicie o servidor de desenvolvimento
pnpm dev
\`\`\`
`;

const usageGuide = `
## Uso Básico

### 1. Dashboard Principal

Acesse \`http://localhost:3000\` (ou o endereço do servidor instalado).

- **Análise de Espectro:** Visualize frequências em tempo real
- **Gravação:** Clique em "Iniciar Gravação" para capturar áudio
- **Teste de Ruído:** Execute pink noise para validar drivers
- **Dispositivo Ativo:** Selecione o headset a ser testado

### 2. Diagnósticos Manuais

Navegue para **Diagnósticos** no menu lateral.

- Escolha uma categoria (Driver, Áudio, Sistema, Rede)
- Clique em "Executar" no script desejado
- Veja o resultado em tempo real no painel de histórico

### 3. Configuração de IA (Opcional)

1. Acesse **Configurações**
2. Selecione o provedor de IA (OpenAI, Anthropic ou Gemini)
3. Insira sua API Key
4. Salve as alterações
5. O assistente de IA estará disponível em **Terminal & Logs**

### 4. Histórico de Gravações

Navegue para **Histórico** para visualizar:
- Todas as gravações anteriores
- Métricas de qualidade (duração, nível de ruído, frequência de pico)
- Filtros por data e qualidade

### Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| \`pnpm dev\` | Inicia servidor de desenvolvimento |
| \`pnpm build\` | Compila para produção |
| \`pnpm test\` | Executa testes unitários |
| \`pnpm db:push\` | Aplica migrações do banco |
| \`pnpm seed\` | Popula scripts de troubleshooting |
| \`pnpm build:windows\` | Gera instalador .msi |
| \`pnpm build:linux\` | Gera instalador .bin |
`;

export default function Docs() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Documentação</h1>
        <p className="text-muted-foreground text-lg">
          Guia completo de instalação, uso e resolução de problemas do Headset
          Manager
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="quickstart" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
          <TabsTrigger value="quickstart">Início Rápido</TabsTrigger>
          <TabsTrigger value="install">Instalação</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        {/* Quick Start Tab */}
        <TabsContent value="quickstart" className="mt-6 space-y-6">
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>Primeiros Passos</CardTitle>
              </div>
              <CardDescription>
                Comece a usar o Headset Manager em 4 passos simples
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  1. Conecte seu Headset USB
                </h3>
                <p className="text-sm text-muted-foreground">
                  Conecte o headset USB ao computador. O sistema detectará
                  automaticamente o dispositivo.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  2. Selecione o Dispositivo
                </h3>
                <p className="text-sm text-muted-foreground">
                  No Dashboard, selecione o headset no dropdown "Dispositivo
                  Ativo" (canto superior direito).
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">3. Execute Testes</h3>
                <p className="text-sm text-muted-foreground">
                  Clique em "Iniciar Gravação" para testar o microfone ou "Teste
                  de Ruído" para validar os drivers de áudio.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  4. Diagnóstico (Opcional)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Acesse "Diagnósticos" no menu lateral para executar scripts de
                  troubleshooting se houver problemas.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="pt-6">
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                <Streamdown>{usageGuide}</Streamdown>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Installation Tab */}
        <TabsContent value="install" className="mt-6">
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                <Streamdown>{installGuide}</Streamdown>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="mt-6 space-y-6">
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                <CardTitle>Perguntas Frequentes (FAQ)</CardTitle>
              </div>
              <CardDescription>
                Respostas para as dúvidas mais comuns sobre instalação e uso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {/* Instalação */}
                <AccordionItem value="install-windows">
                  <AccordionTrigger className="text-left">
                    Como instalar no Windows?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-2">
                    <p>
                      <strong>Método 1: Instalador .msi (Recomendado)</strong>
                    </p>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>
                        Baixe o arquivo <code>HeadsetManager-Setup.msi</code>
                      </li>
                      <li>Execute o instalador com duplo clique</li>
                      <li>Siga as instruções na tela</li>
                      <li>
                        Acesse pelo menu Iniciar: TSI Telecom → Headset Manager
                      </li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="no-microphone">
                  <AccordionTrigger className="text-left">
                    Por que aparece "Permissão de microfone negada"?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-2">
                    <p>
                      O navegador precisa de permissão explícita para acessar o
                      microfone. Para resolver:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>
                        Clique no ícone de cadeado/informação na barra de
                        endereço
                      </li>
                      <li>Procure por "Microfone" nas permissões</li>
                      <li>Altere para "Permitir"</li>
                      <li>Recarregue a página (F5)</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="no-device">
                  <AccordionTrigger className="text-left">
                    Meu headset não aparece na lista de dispositivos
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-2">
                    <p>Possíveis causas e soluções:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>
                        <strong>Headset não conectado:</strong> Verifique se o
                        cabo USB está bem conectado
                      </li>
                      <li>
                        <strong>Driver não instalado:</strong> Acesse
                        "Diagnósticos" e execute "Verificar Drivers USB"
                      </li>
                      <li>
                        <strong>Recarregue a página:</strong> Clique no botão
                        "Escanear" ou pressione F5
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="recording-quality">
                  <AccordionTrigger className="text-left">
                    Como interpretar a qualidade da gravação?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-2">
                    <p>
                      O sistema analisa automaticamente a qualidade do áudio:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>
                        <strong className="text-green-500">Excelente:</strong>{" "}
                        Nível de ruído &lt; -40 dB
                      </li>
                      <li>
                        <strong className="text-blue-500">Bom:</strong> Nível de
                        ruído entre -40 e -30 dB
                      </li>
                      <li>
                        <strong className="text-yellow-500">Regular:</strong>{" "}
                        Nível de ruído entre -30 e -20 dB
                      </li>
                      <li>
                        <strong className="text-red-500">Ruim:</strong> Nível de
                        ruído &gt; -20 dB
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="ai-setup">
                  <AccordionTrigger className="text-left">
                    Como configurar o Assistente de IA?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-2">
                    <p>
                      O assistente de IA é <strong>opcional</strong> e requer
                      uma API Key:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>Acesse "Configurações" no menu lateral</li>
                      <li>Role até a seção "Integração de IA"</li>
                      <li>
                        Selecione o provedor (OpenAI, Anthropic ou Gemini)
                      </li>
                      <li>Insira sua API Key</li>
                      <li>Clique em "Salvar Configurações"</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="database-error">
                  <AccordionTrigger className="text-left">
                    Erro de conexão com o banco de dados
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-2">
                    <p>Verifique se o PostgreSQL está rodando:</p>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                      {`# Linux
sudo systemctl status postgresql

# Windows
Get-Service -Name postgresql*`}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Troubleshooting Tips */}
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                <CardTitle>Dicas de Resolução de Problemas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold">Áudio com ruído excessivo</h4>
                  <p className="text-sm text-muted-foreground">
                    Execute "Teste de Ruído" no Dashboard para validar os
                    drivers. Se o problema persistir, acesse "Diagnósticos".
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Lightbulb className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold">Manutenção Preventiva</h4>
                  <p className="text-sm text-muted-foreground">
                    Acesse "Histórico" regularmente para monitorar a qualidade
                    de áudio ao longo do tempo.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Settings className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold">Otimização de Performance</h4>
                  <p className="text-sm text-muted-foreground">
                    Para melhor performance, feche abas desnecessárias do
                    navegador.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
