import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Mic, Volume2, Usb, CheckCircle2, AlertCircle, RefreshCw, Headphones, Play, Square, Settings2, Info, Download, Waves } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export default function Home() {
  const [isScanning, setIsScanning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isNoiseTestRunning, setIsNoiseTestRunning] = useState(false);
  const [selectedMic, setSelectedMic] = useState<string>("");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const noiseOscillatorRef = useRef<OscillatorNode | null>(null);

  // Carregar lista real de dispositivos
  useEffect(() => {
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true }); // Solicita permissão
        const devs = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devs.filter(d => d.kind === 'audioinput');
        setDevices(audioInputs);
        if (audioInputs.length > 0) {
          setSelectedMic(audioInputs[0].deviceId);
        }
      } catch (err) {
        console.error("Erro ao listar dispositivos:", err);
        toast.error("Permissão de microfone negada");
      }
    };
    getDevices();
  }, []);

  // Inicializa o contexto de áudio e analisador
  const initAudio = async (deviceId: string) => {
    try {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { deviceId: { exact: deviceId } } 
      });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioContext = audioContextRef.current;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      drawSpectrum();
    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
    }
  };

  // Atualiza o áudio quando o dispositivo muda
  useEffect(() => {
    if (selectedMic) {
      initAudio(selectedMic);
    }
  }, [selectedMic]);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { deviceId: { exact: selectedMic } } 
      });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/mp3" });
        setAudioBlob(blob);
        setIsRecording(false);
        toast.success("Gravação concluída");
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Gravando...");
    } catch (err) {
      toast.error("Erro ao gravar");
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
    }
  };

  // Teste de Cancelamento de Ruído (Pink Noise)
  const toggleNoiseTest = async () => {
    if (isNoiseTestRunning) {
      // Parar ruído
      if (noiseOscillatorRef.current) {
        noiseOscillatorRef.current.stop();
        noiseOscillatorRef.current.disconnect();
        noiseOscillatorRef.current = null;
      }
      setIsNoiseTestRunning(false);
      stopRecording();
      toast.info("Teste de ruído finalizado");
    } else {
      // Iniciar ruído e gravação
      try {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;
        
        // Criar ruído branco (simulado)
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        whiteNoise.connect(ctx.destination);
        whiteNoise.start();
        
        // Armazenar referência para parar depois (usando any para simplificar o exemplo do buffer source)
        (noiseOscillatorRef as any).current = whiteNoise; 

        setIsNoiseTestRunning(true);
        startRecording(); // Começa a gravar junto com o ruído
        
        toast.warning("Gerando ruído de fundo...", {
          description: "O microfone deve filtrar este som se o cancelamento estiver ativo.",
        });
      } catch (err) {
        console.error(err);
        toast.error("Erro ao gerar ruído");
      }
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
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <RefreshCw className="mr-2 h-4 w-4" /> Escanear Dispositivos
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
              <div className="text-2xl font-bold">{devices.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Entradas detectadas</p>
            </CardContent>
          </Card>
          <Card className="swiss-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entrada (Mic)</CardTitle>
              <Mic className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate text-ellipsis overflow-hidden whitespace-nowrap max-w-[150px]">
                {devices.find(d => d.deviceId === selectedMic)?.label || "Selecione..."}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Ativo</p>
            </CardContent>
          </Card>
          <Card className="swiss-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saída (Audio)</CardTitle>
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Padrão</div>
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
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Dispositivo de Entrada</label>
                    <Select value={selectedMic} onValueChange={setSelectedMic}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o microfone" />
                      </SelectTrigger>
                      <SelectContent>
                        {devices.map((device) => (
                          <SelectItem key={device.deviceId} value={device.deviceId}>
                            {device.label || `Microfone ${device.deviceId.slice(0, 5)}...`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    {!isRecording ? (
                      <Button 
                        variant="outline"
                        onClick={startRecording}
                        disabled={isPlaying || isNoiseTestRunning}
                        className="flex-1"
                      >
                        <Mic className="mr-2 h-4 w-4" /> Gravar
                      </Button>
                    ) : (
                      <Button 
                        variant="destructive"
                        onClick={isNoiseTestRunning ? toggleNoiseTest : stopRecording}
                        className="flex-1"
                      >
                        <Square className="mr-2 h-4 w-4 animate-pulse" /> Parar
                      </Button>
                    )}

                    <Button
                      variant={isNoiseTestRunning ? "destructive" : "secondary"}
                      onClick={toggleNoiseTest}
                      disabled={isRecording && !isNoiseTestRunning}
                      className="flex-1"
                    >
                      <Waves className="mr-2 h-4 w-4" /> 
                      {isNoiseTestRunning ? "Parar Teste Ruído" : "Testar Cancel. Ruído"}
                    </Button>
                    
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
                {isRecording && (
                   <div className="flex gap-2 animate-pulse">
                   <span className="text-yellow-400">[{new Date().toLocaleTimeString()}]</span>
                   <span>INFO: Recording audio sample...</span>
                 </div>
                )}
                {isNoiseTestRunning && (
                   <div className="flex gap-2 animate-pulse">
                   <span className="text-red-400">[{new Date().toLocaleTimeString()}]</span>
                   <span>WARN: Generating background noise...</span>
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
