import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Mic, Volume2, Usb, CheckCircle2, AlertCircle, RefreshCw, Headphones, Play, Square, Settings2, Info, Download } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export default function Home() {
  const [isScanning, setIsScanning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMic, setSelectedMic] = useState("default");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Simulação de conexão/desconexão para demonstração de Toasts
  useEffect(() => {
    const timer = setTimeout(() => {
      toast("Novo dispositivo detectado", {
        description: "Fanvil HT301-U conectado via USB",
        action: {
          label: "Configurar",
          onClick: () => console.log("Configurar"),
        },
      });
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Inicializa o contexto de áudio e analisador
  const initAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      drawSpectrum();
    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
      toast.error("Erro ao acessar microfone", {
        description: "Verifique as permissões do navegador.",
      });
    }
  };

  const drawSpectrum = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;

        ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  };

  useEffect(() => {
    initAudio();
    return () => {
      cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      toast.success("Escaneamento concluído", {
        description: "2 dispositivos encontrados e atualizados.",
      });
    }, 2000);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/mp3" });
        setAudioBlob(blob);
        setIsRecording(false);
        toast.success("Gravação concluída", {
          description: "Áudio pronto para download ou reprodução.",
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Gravando microfone...", {
        description: "Fale agora para testar.",
      });
    } catch (err) {
      console.error("Erro ao iniciar gravação:", err);
      toast.error("Erro ao iniciar gravação");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      setIsPlaying(true);
      audio.play();
      audio.onended = () => setIsPlaying(false);
    }
  };

  const downloadRecording = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style.display = "none";
      a.href = url;
      a.download = "teste_microfone.mp3";
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Download iniciado", {
        description: "Arquivo salvo como teste_microfone.mp3",
      });
    }
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

        <div className="grid gap-4 md:grid-cols-7">
          {/* Device List & Audio Visualizer */}
          <div className="col-span-4 space-y-4">
            <Card className="swiss-card">
              <CardHeader>
                <CardTitle>Monitoramento de Áudio</CardTitle>
                <CardDescription>Visualização em tempo real da entrada do microfone.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Dispositivo de Entrada</label>
                    <Select value={selectedMic} onValueChange={setSelectedMic}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o microfone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Padrão do Sistema</SelectItem>
                        <SelectItem value="fanvil">Fanvil HT301-U (USB Audio)</SelectItem>
                        <SelectItem value="attimo">Attimo HS01 (USB Audio)</SelectItem>
                        <SelectItem value="internal">Microfone Interno (HDA Intel)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-6 flex gap-2">
                    {!isRecording ? (
                      <Button 
                        variant="outline"
                        onClick={startRecording}
                        disabled={isPlaying}
                        className="flex-1"
                      >
                        <Mic className="mr-2 h-4 w-4" /> Gravar
                      </Button>
                    ) : (
                      <Button 
                        variant="destructive"
                        onClick={stopRecording}
                        className="flex-1"
                      >
                        <Square className="mr-2 h-4 w-4 animate-pulse" /> Parar
                      </Button>
                    )}
                    
                    {audioBlob && (
                      <>
                        <Button 
                          variant="secondary"
                          onClick={playRecording}
                          disabled={isRecording || isPlaying}
                        >
                          {isPlaying ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="ghost"
                          onClick={downloadRecording}
                          disabled={isRecording}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-secondary/30 rounded-md p-4 border border-border">
                  <canvas 
                    ref={canvasRef} 
                    width={600} 
                    height={100} 
                    className="w-full h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="swiss-card">
              <CardHeader>
                <CardTitle>Dispositivos Gerenciados</CardTitle>
                <CardDescription>Lista de headsets configurados e ativos no momento.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Device 1 */}
                  <div className="border border-border bg-secondary/20 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-primary/10 flex items-center justify-center text-primary rounded-md">
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
                    
                    {/* Detalhes Técnicos Expandidos */}
                    <div className="bg-background/50 p-4 border-t border-border grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground block text-xs uppercase tracking-wider">Fabricante</span>
                        <span className="font-medium">Fanvil Technology Co., Ltd.</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs uppercase tracking-wider">Driver</span>
                        <span className="font-medium">snd-usb-audio (ALSA)</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs uppercase tracking-wider">Codecs Suportados</span>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="secondary" className="text-[10px] h-5">PCM</Badge>
                          <Badge variant="secondary" className="text-[10px] h-5">S16_LE</Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs uppercase tracking-wider">Taxa de Amostragem</span>
                        <span className="font-medium">44.1kHz / 48kHz</span>
                      </div>
                    </div>
                  </div>

                  {/* Device 2 */}
                  <div className="flex items-center justify-between p-4 border border-border bg-secondary/20 opacity-75 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-muted flex items-center justify-center text-muted-foreground rounded-md">
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
          </div>

          {/* Recent Logs */}
          <Card className="col-span-3 swiss-card bg-[#0A0A0A] border-none text-gray-300 font-mono text-sm h-full min-h-[500px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-white">Terminal Log</CardTitle>
              <CardDescription className="text-gray-400">Últimas atividades do daemon.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-2 text-gray-300 custom-scrollbar">
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
                {isRecording && (
                   <div className="flex gap-2 animate-pulse">
                   <span className="text-yellow-400">[{new Date().toLocaleTimeString()}]</span>
                   <span>INFO: Recording audio sample...</span>
                 </div>
                )}
                {isPlaying && (
                   <div className="flex gap-2">
                   <span className="text-green-400">[{new Date().toLocaleTimeString()}]</span>
                   <span>SUCCESS: Playing back audio sample...</span>
                 </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
