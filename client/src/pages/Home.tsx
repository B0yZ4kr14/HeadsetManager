import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Mic,
  Play,
  Square,
  Volume2,
  RefreshCw,
  AlertCircle,
  Save,
  Activity,
  Maximize,
  Minimize,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CircularMeter } from "@/components/CircularMeter";
import { SpectrumChart } from "@/components/SpectrumChart";
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
  const [spectrumData, setSpectrumData] = useState<number[]>(
    new Array(32).fill(0)
  );
  const [audioLevel, setAudioLevel] = useState(0);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "online" | "offline"
  >("all");
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    onError: error => {
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

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
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

  // Get audio devices
  const getDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());

      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = deviceList.filter(
        device => device.kind === "audioinput"
      );
      setDevices(audioInputs as AudioDevice[]);

      if (audioInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(audioInputs[0].deviceId);
      }

      setPermissionDenied(false);
    } catch (error) {
      console.error("Error getting devices:", error);
      setPermissionDenied(true);
      toast.error("Permissão negada", {
        description:
          "Por favor, permita o acesso ao microfone para usar os recursos de teste.",
      });
    }
  };

  // Visualize audio
  const visualize = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Update spectrum data (take 32 samples)
      const samples = 32;
      const step = Math.floor(bufferLength / samples);
      const newSpectrumData = [];
      for (let i = 0; i < samples; i++) {
        newSpectrumData.push(dataArray[i * step]);
      }
      setSpectrumData(newSpectrumData);

      // Calculate audio level (0-100)
      const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
      setAudioLevel(Math.min(100, (average / 255) * 100));

      // Calculate noise level
      const noiseThreshold = 30;
      const noiseCount = dataArray.filter(v => v < noiseThreshold).length;
      const noisePercentage = (noiseCount / bufferLength) * 100;
      setNoiseLevel(100 - noisePercentage);
    };

    draw();
  }, []);

  // Start recording
  const startRecording = async () => {
    if (!selectedDeviceId) {
      toast.error("Nenhum dispositivo selecionado");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedDeviceId },
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      // Setup audio context for visualization
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      visualize();

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success("Gravação iniciada");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Erro ao iniciar gravação");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      stopVisualization();

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Save recording metadata
      if (recordingTime > 0 && selectedDeviceId) {
        saveRecordingMutation.mutate({
          testType: "recording" as const,
          duration: recordingTime,
          quality:
            audioLevel > 70
              ? "excellent"
              : audioLevel > 50
                ? "good"
                : audioLevel > 30
                  ? "fair"
                  : "poor",
          noiseLevel: Math.round(noiseLevel),
          spectrumData: JSON.stringify(spectrumData),
        });
      }

      toast.success("Gravação finalizada");
    }
  };

  // Play recording
  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  };

  // Save recording to file
  const saveRecording = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `headset-recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Gravação salva!");
    }
  };

  // Noise test
  const startNoiseTest = async () => {
    if (!selectedDeviceId) {
      toast.error("Nenhum dispositivo selecionado");
      return;
    }

    try {
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      // Create white noise
      const bufferSize = audioContext.sampleRate * 2;
      const buffer = audioContext.createBuffer(
        1,
        bufferSize,
        audioContext.sampleRate
      );
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(audioContext.destination);
      source.start();

      noiseSourceRef.current = source;
      setIsNoiseTestActive(true);
      toast.success("Teste de ruído iniciado");
    } catch (error) {
      console.error("Error starting noise test:", error);
      toast.error("Erro ao iniciar teste de ruído");
    }
  };

  const stopNoiseTest = () => {
    if (noiseSourceRef.current) {
      try {
        noiseSourceRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      noiseSourceRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsNoiseTestActive(false);
    toast.success("Teste de ruído finalizado");
  };

  // Effects
  useEffect(() => {
    getDevices();
    return () => {
      cleanupAudioResources();
    };
  }, [cleanupAudioResources]);

  // ESC key listener for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <TooltipProvider>
      {/* Fullscreen Spectrum Analyzer */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 neon-blue" />
              <h2 className="text-2xl font-bold neon-blue">
                Análise de Espectro - Modo Tela Cheia
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Pressione ESC para sair
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsFullscreen(false)}
                    className="border-neon-blue"
                  >
                    <Minimize className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sair do modo tela cheia</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-8">
            {isRecording ? (
              <div className="w-full h-full max-h-[calc(100vh-200px)]">
                <SpectrumChart
                  data={spectrumData}
                  height={window.innerHeight - 200}
                />
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <Mic className="h-32 w-32 mx-auto mb-6 opacity-30" />
                <p className="text-xl">
                  Inicie um teste para visualizar o espectro
                </p>
              </div>
            )}
          </div>

          {/* Fullscreen Controls */}
          <div className="p-6 border-t border-border bg-background/50">
            <div className="max-w-4xl mx-auto flex flex-wrap gap-4 justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={!selectedDeviceId || permissionDenied}
                    className={cn(
                      "min-w-[160px]",
                      isRecording
                        ? "bg-destructive hover:bg-destructive/90"
                        : "bg-primary hover:bg-primary/90"
                    )}
                    size="lg"
                  >
                    {isRecording ? (
                      <>
                        <Square className="mr-2 h-5 w-5" />
                        Parar ({formatTime(recordingTime)})
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-5 w-5" />
                        Iniciar Gravação
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isRecording ? "Parar gravação" : "Iniciar gravação de áudio"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={isNoiseTestActive ? stopNoiseTest : startNoiseTest}
                    disabled={
                      !selectedDeviceId || permissionDenied || isRecording
                    }
                    variant="outline"
                    size="lg"
                    className={cn(
                      "min-w-[160px]",
                      isNoiseTestActive && "border-neon-orange"
                    )}
                  >
                    <Volume2 className="mr-2 h-5 w-5" />
                    {isNoiseTestActive ? "Parar Ruído" : "Teste de Ruído"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Reproduzir ruído branco para teste de qualidade
                </TooltipContent>
              </Tooltip>

              {audioUrl && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={playRecording}
                        disabled={isPlaying}
                        variant="outline"
                        size="lg"
                        className="min-w-[140px] border-neon-green"
                      >
                        <Play className="mr-2 h-5 w-5" />
                        Reproduzir
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reproduzir gravação</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={saveRecording}
                        variant="outline"
                        size="lg"
                        className="min-w-[140px] border-neon-blue"
                      >
                        <Save className="mr-2 h-5 w-5" />
                        Salvar
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Salvar gravação localmente</TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Visão geral do sistema de áudio e diagnósticos em tempo real
            </p>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={getDevices}
                className="border-neon-blue"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Atualizar dispositivos</TooltipContent>
          </Tooltip>
        </div>

        {/* Permission Denied Alert */}
        {permissionDenied && (
          <Card className="neon-card-orange p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 neon-orange flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  Permissão de microfone negada
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Por favor, permita o acesso no navegador para usar os recursos
                  de teste.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spectrum Analyzer - Large */}
          <Card className="neon-card-blue lg:col-span-2 lg:row-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 neon-blue" />
                <h2 className="text-xl font-bold neon-blue">
                  Análise de Espectro
                </h2>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFullscreen(true)}
                    className="hover:bg-primary/10"
                  >
                    <Maximize className="h-4 w-4 neon-blue" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Expandir para tela cheia</TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Visualização de frequência em tempo real
            </p>

            <div className="h-[400px] flex items-center justify-center">
              {isRecording ? (
                <SpectrumChart data={spectrumData} height={400} />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Mic className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p>Inicie um teste para visualizar</p>
                </div>
              )}
            </div>
          </Card>

          {/* Audio Level Meter */}
          <Card className="neon-card-orange p-6 flex flex-col items-center justify-center">
            <CircularMeter
              value={audioLevel}
              label="NÍVEL"
              color="orange"
              size={180}
              details={{
                min: 0,
                max: 100,
                average: Math.round(audioLevel * 0.8),
                unit: "dB",
              }}
            />
          </Card>

          {/* Noise Level Meter */}
          <Card className="neon-card-green p-6 flex flex-col items-center justify-center">
            <CircularMeter
              value={noiseLevel}
              label="QUALIDADE"
              color="green"
              size={180}
              details={{
                min: 0,
                max: 100,
                average: Math.round(noiseLevel * 0.9),
                unit: "%",
              }}
            />
          </Card>

          {/* Controls */}
          <Card className="neon-card-blue lg:col-span-2 p-6">
            <h2 className="text-xl font-bold neon-blue mb-4">Controles</h2>

            <div className="space-y-4">
              {/* Device Selection */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  DISPOSITIVO
                </label>
                <Select
                  value={selectedDeviceId}
                  onValueChange={setSelectedDeviceId}
                >
                  <SelectTrigger className="border-neon-blue/30">
                    <SelectValue placeholder="Selecione um dispositivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {devices.map(device => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label ||
                          `Dispositivo ${device.deviceId.slice(0, 8)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Recording Controls */}
              <div className="flex flex-wrap gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={!selectedDeviceId || permissionDenied}
                      className={cn(
                        "flex-1 min-w-[140px]",
                        isRecording
                          ? "bg-destructive hover:bg-destructive/90"
                          : "bg-primary hover:bg-primary/90"
                      )}
                    >
                      {isRecording ? (
                        <>
                          <Square className="mr-2 h-4 w-4" />
                          Parar ({formatTime(recordingTime)})
                        </>
                      ) : (
                        <>
                          <Mic className="mr-2 h-4 w-4" />
                          Iniciar Gravação
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isRecording
                      ? "Parar gravação"
                      : "Iniciar gravação de áudio"}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={
                        isNoiseTestActive ? stopNoiseTest : startNoiseTest
                      }
                      disabled={
                        !selectedDeviceId || permissionDenied || isRecording
                      }
                      variant="outline"
                      className={cn(
                        "flex-1 min-w-[140px]",
                        isNoiseTestActive && "border-neon-orange"
                      )}
                    >
                      <Volume2 className="mr-2 h-4 w-4" />
                      {isNoiseTestActive ? "Parar Ruído" : "Teste de Ruído"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Reproduzir ruído branco para teste de qualidade
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Playback Controls */}
              {audioUrl && (
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={playRecording}
                        disabled={isPlaying}
                        variant="outline"
                        className="flex-1 border-neon-green"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Reproduzir
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reproduzir gravação</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={saveRecording}
                        variant="outline"
                        className="flex-1 border-neon-blue"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Salvar
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Salvar gravação localmente</TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
          </Card>

          {/* Device Status */}
          <Card className="neon-card-green p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold neon-green">
                Status do Dispositivo
              </h2>

              <Select
                value={statusFilter}
                onValueChange={(value: any) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-[120px] h-8 border-neon-green/30 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {(() => {
                const filteredDevices = devices.filter(device => {
                  const isOnline = device.deviceId === selectedDeviceId;
                  if (statusFilter === "online") return isOnline;
                  if (statusFilter === "offline") return !isOnline;
                  return true;
                });

                if (filteredDevices.length === 0) {
                  return (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">
                        Nenhum dispositivo{" "}
                        {statusFilter === "all" ? "" : statusFilter}
                      </p>
                    </div>
                  );
                }

                return filteredDevices.map(device => {
                  const isOnline = device.deviceId === selectedDeviceId;
                  return (
                    <div
                      key={device.deviceId}
                      className="p-3 rounded-lg bg-background/50 border border-border space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground truncate flex-1">
                          {device.label ||
                            `Dispositivo ${device.deviceId.slice(0, 8)}`}
                        </span>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "h-2 w-2 rounded-full pulse-neon",
                              isOnline ? "bg-green-500" : "bg-gray-500"
                            )}
                          />
                          <span className="text-xs font-medium">
                            {isOnline ? "ONLINE" : "OFFLINE"}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {device.deviceId.slice(0, 16)}...
                      </div>
                    </div>
                  );
                });
              })()}

              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sistema</span>
                  <span className="text-sm font-medium">
                    {navigator.userAgent.includes("Windows")
                      ? "WINDOWS"
                      : navigator.userAgent.includes("Linux")
                        ? "LINUX"
                        : "OUTRO"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
