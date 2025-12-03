import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Mic, Play, Square, Download, Activity, Volume2, RefreshCw, Info, AlertCircle, Timer } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAudioAlerts } from "../hooks/useAudioAlerts";

interface AudioDevice {
  deviceId: string;
  label: string;
  kind: string;
  groupId: string;
}

export default function Home() {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isNoiseTestActive, setIsNoiseTestActive] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioMetrics, setAudioMetrics] = useState<{ noiseLevel: number; quality: number } | null>(null);
  
  // Audio alerts system
  useAudioAlerts(audioMetrics);
  
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

      ctx.fillStyle = 'rgb(20, 20, 20)'; 
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      // Calculate audio metrics
      let totalAmplitude = 0;
      let peakAmplitude = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        totalAmplitude += dataArray[i];
        peakAmplitude = Math.max(peakAmplitude, dataArray[i]);
        
        const r = 50;
        const g = 100 + (i / bufferLength) * 155;
        const b = 255;

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
      
      // Update metrics for alert system (every 60 frames ~= 1 second)
      if (animationFrameRef.current && animationFrameRef.current % 60 === 0) {
        const avgAmplitude = totalAmplitude / bufferLength;
        const noiseLevel = (peakAmplitude / 255) * 100; // Convert to dB approximation
        const quality = Math.min(100, (avgAmplitude / 128) * 100); // 0-100%
        
        setAudioMetrics({ noiseLevel, quality });
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema de áudio e dispositivos conectados.</p>
        </div>
        <Button onClick={getDevices} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Escanear Dispositivos
        </Button>
      </div>

      {permissionDenied && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md flex items-center gap-2 border border-destructive/20">
          <AlertCircle className="h-5 w-5" />
          <span>Permissão de microfone negada. Por favor, permita o acesso no navegador para usar os recursos de teste.</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="swiss-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Monitoramento de Áudio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Dispositivo de Entrada</label>
              <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um microfone" />
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

            <div className="bg-black/50 rounded-lg p-4 h-32 flex items-center justify-center relative overflow-hidden border border-white/10">
              <canvas ref={canvasRef} width="400" height="128" className="w-full h-full absolute inset-0" />
              {!isRecording && !isNoiseTestActive && (
                <span className="text-muted-foreground text-sm relative z-10">
                  Inicie um teste para visualizar o espectro
                </span>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              {!isRecording ? (
                <Button onClick={startRecording} className="flex-1" variant="default">
                  <Mic className="mr-2 h-4 w-4" /> Gravar
                </Button>
              ) : (
                <Button onClick={stopRecording} className="flex-1 animate-pulse" variant="destructive">
                  <Square className="mr-2 h-4 w-4" /> Parar ({formatTime(recordingTime)})
                </Button>
              )}
              
              <Button 
                onClick={toggleNoiseTest} 
                variant={isNoiseTestActive ? "destructive" : "secondary"}
                className="flex-1"
              >
                <Volume2 className="mr-2 h-4 w-4" />
                {isNoiseTestActive ? "Parar Ruído" : "Testar Cancel. Ruído"}
              </Button>
            </div>

            {audioUrl && (
              <div className="flex gap-2 items-center bg-secondary/20 p-3 rounded-lg border border-border">
                <Button size="sm" variant="ghost" onClick={playAudio} disabled={isPlaying}>
                  {isPlaying ? <Activity className="h-4 w-4 animate-pulse" /> : <Play className="h-4 w-4" />}
                </Button>
                <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full bg-primary transition-all duration-1000 ${isPlaying ? 'w-full' : 'w-0'}`} />
                </div>
                <Button size="sm" variant="ghost" onClick={downloadAudio}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="swiss-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Detalhes do Dispositivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {devices.map((device, index) => (
                <AccordionItem key={device.deviceId} value={device.deviceId}>
                  <AccordionTrigger className="text-sm hover:no-underline">
                    <div className="flex items-center gap-2 text-left">
                      <div className={`w-2 h-2 rounded-full ${device.deviceId === selectedDeviceId ? 'bg-green-500' : 'bg-gray-500'}`} />
                      {device.label || `Dispositivo ${index + 1}`}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground space-y-2 pl-4 border-l-2 border-white/5 ml-1">
                    <div className="grid grid-cols-2 gap-2">
                      <span>ID do Dispositivo:</span>
                      <span className="font-mono text-white/70 truncate" title={device.deviceId}>{device.deviceId}</span>
                      
                      <span>Tipo:</span>
                      <span className="text-white/70">Entrada de Áudio (Microfone)</span>
                      
                      <span>Grupo:</span>
                      <span className="font-mono text-white/70 truncate" title={device.groupId}>{device.groupId}</span>
                      
                      <span>Status:</span>
                      <span className={device.deviceId === selectedDeviceId ? "text-green-400" : "text-gray-400"}>
                        {device.deviceId === selectedDeviceId ? "Ativo / Selecionado" : "Disponível"}
                      </span>
                    </div>
                    
                    {device.label.toLowerCase().includes('usb') && (
                      <div className="mt-2 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                        <p className="text-blue-400 font-semibold mb-1">USB Audio Class</p>
                        <p>Este dispositivo usa drivers USB padrão. Compatível com controles de volume via hardware e software.</p>
                      </div>
                    )}
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
