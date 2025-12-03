import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Mic, Play, Square, Download, Activity, Volume2, RefreshCw, Info, AlertCircle, Timer, Cpu, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface AudioDevice {
  deviceId: string;
  label: string;
  kind: string;
  groupId: string;
}

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isNoiseTestActive, setIsNoiseTestActive] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopVisualization = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const stopNoiseTest = useCallback(() => {
    if (noiseSourceRef.current) {
      try {
        noiseSourceRef.current.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
      noiseSourceRef.current = null;
    }
    setIsNoiseTestActive(false);
    if (isRecording) {
      stopRecording();
    }
    toast.info("Teste de ruído parado");
  }, [isRecording]);

  useEffect(() => {
    getDevices();
    return () => {
      stopVisualization();
      stopNoiseTest();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [stopVisualization, stopNoiseTest]);

  const getDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionDenied(false);

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = allDevices.filter(device => device.kind === 'audioinput');
      setDevices(audioInputs);
      
      if (audioInputs.length > 0 && !selectedDeviceId) {
        const usbDevice = audioInputs.find(d => d.label.toLowerCase().includes('usb'));
        setSelectedDeviceId(usbDevice ? usbDevice.deviceId : audioInputs[0].deviceId);
      }
      toast.success("Dispositivos escaneados com sucesso");
    } catch (error) {
      console.error("Error accessing media devices:", error);
      setPermissionDenied(true);
      toast.error("Erro ao acessar dispositivos. Verifique permissões do navegador.");
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
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(20, 20, 20, 0.2)'; // Transparent clear for trail effect
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        
        // Modern gradient colors
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, 'rgba(30, 58, 138, 0.8)'); // Primary Dark
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.8)'); // Primary Light

        ctx.fillStyle = gradient;
        
        // Rounded top bars
        ctx.beginPath();
        ctx.roundRect(x, canvas.height - barHeight, barWidth, barHeight, [4, 4, 0, 0]);
        ctx.fill();

        x += barWidth + 1;
      }
    };

    draw();
  };

  const startVisualization = async (stream: MediaStream) => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const audioContext = audioContextRef.current;
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);
    analyserRef.current = analyser;

    drawSpectrum();
  };

  const startRecording = async () => {
    if (!selectedDeviceId) {
      toast.error("Selecione um dispositivo primeiro");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { 
          deviceId: { exact: selectedDeviceId },
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      
      streamRef.current = stream;
      startVisualization(stream);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stopVisualization();
        
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        
        // Auto-play after recording
        const audio = new Audio(url);
        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.play().catch(e => console.error("Auto-play failed:", e));
        toast.success("Gravação finalizada. Reproduzindo...");
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.info("Gravação iniciada...");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Erro ao iniciar gravação. Verifique se o microfone está em uso.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        toast.error("Erro ao reproduzir áudio.");
      };
      audio.play();
    }
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `headset_test_${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Download iniciado");
    }
  };

  const toggleNoiseTest = () => {
    if (isNoiseTestActive) {
      stopNoiseTest();
    } else {
      startNoiseTest();
    }
  };

  const startNoiseTest = async () => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;
    
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.5;
    
    noiseSource.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noiseSource.start();
    noiseSourceRef.current = noiseSource;
    
    setIsNoiseTestActive(true);
    toast.warning("Teste de ruído ativo (White Noise)");
    
    startRecording();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema de áudio e diagnósticos em tempo real.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={getDevices} variant="outline" className="backdrop-blur-sm bg-background/50">
            <RefreshCw className="mr-2 h-4 w-4" />
            Escanear
          </Button>
        </div>
      </div>

      {permissionDenied && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex items-center gap-3 backdrop-blur-md">
          <AlertCircle className="h-5 w-5" />
          <span>Permissão de microfone negada. Por favor, permita o acesso no navegador para usar os recursos de teste.</span>
        </div>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Main Module: Spectrum Analyzer (Span 8) */}
        <Card className="md:col-span-8 border-white/10 bg-card/50 backdrop-blur-md shadow-xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Análise de Espectro
            </CardTitle>
            <CardDescription>Visualização de frequência em tempo real</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="bg-black/80 rounded-xl p-1 h-64 flex items-center justify-center relative overflow-hidden border border-white/10 shadow-inner">
              <canvas ref={canvasRef} width="800" height="256" className="w-full h-full" />
              {!isRecording && !isNoiseTestActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                  <span className="text-muted-foreground text-sm flex items-center gap-2">
                    <Mic className="h-4 w-4" /> Inicie um teste para visualizar
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3 flex-wrap">
              {!isRecording ? (
                <Button onClick={startRecording} className="flex-1 h-12 text-base shadow-lg shadow-primary/20" variant="default">
                  <Mic className="mr-2 h-5 w-5" /> Iniciar Gravação
                </Button>
              ) : (
                <Button onClick={stopRecording} className="flex-1 h-12 text-base animate-pulse bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-destructive/20">
                  <Square className="mr-2 h-5 w-5" /> Parar ({formatTime(recordingTime)})
                </Button>
              )}
              
              <Button 
                onClick={toggleNoiseTest} 
                variant={isNoiseTestActive ? "destructive" : "secondary"}
                className="flex-1 h-12 text-base backdrop-blur-sm"
              >
                <Volume2 className="mr-2 h-5 w-5" />
                {isNoiseTestActive ? "Parar Ruído" : "Teste de Ruído"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Side Module: Device Control (Span 4) */}
        <div className="md:col-span-4 space-y-6">
          <Card className="border-white/10 bg-card/50 backdrop-blur-md shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Cpu className="h-4 w-4 text-primary" />
                Dispositivo Ativo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Entrada</label>
                <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
                  <SelectTrigger className="bg-background/50 border-white/10 h-10">
                    <SelectValue placeholder="Selecione..." />
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

              {audioUrl && (
                <div className="p-4 rounded-lg bg-secondary/10 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Última Gravação</span>
                    <span className="text-xs text-primary">{formatTime(recordingTime)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" variant="outline" onClick={playAudio} disabled={isPlaying}>
                      {isPlaying ? <Activity className="h-3 w-3 animate-pulse mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                      Reproduzir
                    </Button>
                    <Button size="sm" variant="ghost" onClick={downloadAudio}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights Placeholder Widget */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-card/50 backdrop-blur-md shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                <Sparkles className="h-4 w-4" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Conecte uma API de IA para receber diagnósticos inteligentes sobre a qualidade do áudio e drivers.
              </p>
              <Button variant="outline" size="sm" className="w-full border-primary/20 hover:bg-primary/10" asChild>
                <a href="/settings">Configurar API Key</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Module: Device Details (Span 12) */}
        <Card className="md:col-span-12 border-white/10 bg-card/30 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-4 w-4 text-muted-foreground" />
              Detalhes Técnicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {devices.map((device, index) => (
                <AccordionItem key={device.deviceId} value={device.deviceId} className="border-white/5">
                  <AccordionTrigger className="text-sm hover:no-underline py-3">
                    <div className="flex items-center gap-3 text-left">
                      <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${device.deviceId === selectedDeviceId ? 'bg-green-500 shadow-green-500/50' : 'bg-gray-500'}`} />
                      <span className="font-medium">{device.label || `Dispositivo ${index + 1}`}</span>
                      {device.deviceId === selectedDeviceId && (
                        <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/20">ATIVO</span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground space-y-2 pl-4 border-l-2 border-primary/20 ml-1">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-2">
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider opacity-50">ID do Dispositivo</span>
                        <span className="font-mono text-foreground/80 truncate block" title={device.deviceId}>{device.deviceId}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider opacity-50">Tipo</span>
                        <span className="text-foreground/80">Entrada de Áudio</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider opacity-50">Grupo</span>
                        <span className="font-mono text-foreground/80 truncate block" title={device.groupId}>{device.groupId}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            {devices.length === 0 && !permissionDenied && (
              <div className="text-center py-8 text-muted-foreground">
                <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-50 animate-spin-slow" />
                <p>Escaneando dispositivos...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
