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
import {
  Mic,
  Activity,
  Volume2,
  FileText,
  Settings,
  HelpCircle,
} from "lucide-react";

export default function Help() {
  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <HelpCircle className="h-8 w-8 text-primary" />
          Central de Ajuda
        </h1>
        <p className="text-muted-foreground text-lg">
          Guia completo para utilizar as ferramentas de diagnóstico e
          configuração.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              Testes de Áudio
            </CardTitle>
            <CardDescription>Como verificar seu microfone</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Como testar meu microfone?</AccordionTrigger>
                <AccordionContent>
                  Vá para o <strong>Dashboard</strong>, selecione seu
                  dispositivo no menu "Dispositivo de Entrada" e clique no botão{" "}
                  <strong>"Testar (5s)"</strong>. Fale normalmente. Após 5
                  segundos, o áudio será reproduzido automaticamente.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Como salvar uma gravação?</AccordionTrigger>
                <AccordionContent>
                  Use o botão <strong>"Gravar"</strong> no Dashboard para
                  iniciar uma captura manual. Quando terminar, clique em
                  "Parar". Um botão de download aparecerá para salvar o arquivo
                  de áudio no seu computador.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>
                  Teste de Cancelamento de Ruído
                </AccordionTrigger>
                <AccordionContent>
                  Clique em <strong>"Testar Cancel. Ruído"</strong>. O sistema
                  gerará um ruído de fundo (chiado). Fale enquanto o ruído toca.
                  Na gravação resultante, sua voz deve estar clara e o chiado
                  reduzido se o headset for de boa qualidade.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Visualização e Diagnóstico
            </CardTitle>
            <CardDescription>Entendendo os gráficos e dados</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  O que é o Espectro de Áudio?
                </AccordionTrigger>
                <AccordionContent>
                  O gráfico de barras coloridas no Dashboard mostra as
                  frequências do som em tempo real. Barras à esquerda são
                  graves, à direita são agudos. Se as barras se movem quando
                  você fala, o microfone está captando som.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Como exportar logs?</AccordionTrigger>
                <AccordionContent>
                  Na página <strong>Terminal</strong>, clique no botão{" "}
                  <strong>"Exportar TXT"</strong> no canto superior direito.
                  Isso baixará um arquivo de texto com todo o histórico de
                  eventos do sistema para análise técnica.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Configuração e Sistema
            </CardTitle>
            <CardDescription>Ajustes e compatibilidade</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Como mudar o tema?</AccordionTrigger>
                <AccordionContent>
                  Clique no ícone de <strong>Sol/Lua</strong> no canto superior
                  direito da tela para alternar entre o Modo Claro e o Modo
                  Escuro (Modern Dark).
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  Compatibilidade de Dispositivos
                </AccordionTrigger>
                <AccordionContent>
                  O sistema suporta automaticamente headsets USB (Attimo,
                  Fanvil, etc.). Se seu dispositivo não aparecer na lista,
                  verifique a conexão USB e recarregue a página.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
