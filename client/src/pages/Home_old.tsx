import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Mic, Play, Square, Activity, Volume2, RefreshCw, AlertCircle, Cpu, Save } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface AudioDevice {
  deviceId: string;
  label: string;
  kind: string;
  groupId: string;
}

export default function Home() {
  const { user } = useAuth();

  // State
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isNoiseTestActive, setIsNoiseTestActive] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mutations
  const saveRecordingMutation = trpc.headset.tests.create.useMutation({
    onSuccess: () => {
      toast.success("Gravação salva!", {
        description: "Metadados armazenados no banco de dados.",
      });
    },
    onError: (error) => {
      toast.error("Erro ao salvar gravação", {
        description: error.message,
      });
    },
  });

  // Cleanup functions
  const stopVisualization = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const cleanupAudioResources = useCallback(() => {
    stopVisualization();
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (noiseSourceRef.current) {
      try {
        noiseSourceRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      noiseSourceRef.current = null;
    }
  }, [stopVisualization]);

  // Effects
  useEffect(() => {
    getDevices();
    return () => {
      cleanupAudioResources();
    };
  }, [cleanupAudioResources]);

  // Device management
  const getDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = deviceList.filter(device => device.kind === 'audioinput');
      
      setDevices(audioInputs.map(d => ({
        deviceId: d.deviceId,
        label: d.label,
        kind: d.kind,
        groupId: d.groupId,
      })));
      
      if (audioInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(audioInputs[0].deviceId);
      }
      
      stream.getTracks().forEach(track => track.stop());
      setPermissionDenied(false);
    } catch (error) {
      console.error("Error accessing audio devices:", error);
      setPermissionDenied(true);
      toast.error("Permissão de microfone negada");
    }
  };

  // Spectrum visualization
  const drawSpectrum = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current) return;

    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        const hue = (i / bufferLength) * 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();
  }, []);

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

  // Recording functions
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

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stopVisualization();
        
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        
        // Save metadata only if recording is valid (> 1 second)
        if (recordingTime > 1) {
          saveRecordingMutation.mutate({
            testType: "recording",
            duration: recordingTime,
            notes: `Dispositivo: ${devices.find(d => d.deviceId === selectedDeviceId)?.label || 'Desconhecido'}`,
          });
        }
        
        // Auto-play
        const audio = new Audio(url);
        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.play().catch(e => console.error("Auto-play failed:", e));
        toast.success("Gravação finalizada. Reproduzindo...");
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.info("Gravação iniciada...");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Erro ao iniciar gravação");
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, []);

  const playAudio = () => {
    if (!audioUrl) return;
    
    const audio = new Audio(audioUrl);
    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      setIsPlaying(false);
      toast.error("Erro ao reproduzir áudio");
    };
    audio.play().catch(e => {
      console.error("Playback error:", e);
      toast.error("Erro ao reproduzir áudio");
    });
  };

  const downloadAudio = () => {
    if (!audioUrl || !audioBlob) return;
    
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `gravacao_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Download iniciado");
  };

  // Noise test
  const toggleNoiseTest = async () => {
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
    toast.warning("Teste de ruído ativo");
    
    startRecording();
  };

  const stopNoiseTest = useCallback(() => {
    if (noiseSourceRef.current) {
      try {
        noiseSourceRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      noiseSourceRef.current = null;
    }
    setIsNoiseTestActive(false);
    if (isRecording) {
      stopRecording();
    }
    toast.info("Teste de ruído parado");
  }, [isRecording, stopRecording]);

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

            <TooltipProvider>
              <div className="flex gap-3 flex-wrap">
                {!isRecording ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={startRecording} className="flex-1 h-12 text-base shadow-lg shadow-primary/20" variant="default">
                        <Mic className="mr-2 h-5 w-5" /> Iniciar Gravação
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Gravar áudio do microfone selecionado</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={stopRecording} className="flex-1 h-12 text-base animate-pulse bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-destructive/20">
                        <Square className="mr-2 h-5 w-5" /> Parar ({formatTime(recordingTime)})
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Finalizar gravação em andamento</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={toggleNoiseTest} 
                      variant={isNoiseTestActive ? "destructive" : "secondary"}
                      className="flex-1 h-12 text-base backdrop-blur-sm"
                    >
                      <Volume2 className="mr-2 h-5 w-5" />
                      {isNoiseTestActive ? "Parar Ruído" : "Teste de Ruído"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isNoiseTestActive ? "Desativar teste de ruído branco" : "Testar cancelamento de ruído com white noise"}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
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
                  <TooltipProvider>
                    <div className="flex gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" className="flex-1" variant="outline" onClick={playAudio} disabled={isPlaying}>
                            {isPlaying ? <Activity className="h-3 w-3 animate-pulse mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                            Reproduzir
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ouvir a gravação de áudio</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="default" className="shadow-md" onClick={downloadAudio}>
                            <Save className="h-4 w-4 mr-1" />
                            Salvar
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Salvar gravação no seu computador</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Technical Details Accordion */}
      <Card className="border-white/10 bg-card/50 backdrop-blur-md">
        <CardContent className="pt-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="details" className="border-white/10">
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Detalhes Técnicos
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                {devices.map((device, idx) => (
                  <div 
                    key={device.deviceId}
                    className={cn(
                      "p-4 rounded-lg border transition-colors",
                      device.deviceId === selectedDeviceId 
                        ? "bg-primary/10 border-primary/30" 
                        : "bg-secondary/10 border-white/5"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {device.label || `Dispositivo ${idx + 1}`}
                      </span>
                      {device.deviceId === selectedDeviceId && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">ATIVO</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p><span className="font-medium">ID:</span> {device.deviceId.slice(0, 20)}...</p>
                      <p><span className="font-medium">Tipo:</span> {device.kind}</p>
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
