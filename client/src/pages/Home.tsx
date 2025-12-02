import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Mic, Play, Square, Download, Activity, Volume2, RefreshCw, Info, AlertCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
    };
  }, [stopVisualization, stopNoiseTest]);

  const getDevices = async () => {
    try {
      // Request permission to list labels
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately, just needed permission
      setPermissionDenied(false);

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = allDevices.filter(device => device.kind === 'audioinput');
      setDevices(audioInputs);
      
      if (audioInputs.length > 0 && !selectedDeviceId) {
        // Prefer USB devices if identifiable, otherwise first one
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

      // Use CSS variables for colors if possible, or fallback to theme colors
      ctx.fillStyle = 'rgb(255, 255, 255)'; 
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        
        // Professional gradient: Blue to Cyan
        const r = 50;
        const g = 100 + (i / bufferLength) * 155;
        const b = 255;

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

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
    
    // Resume context if suspended (browser policy)
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
          echoCancellation: false, // Disable processing for raw test
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
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start();
      setIsRecording(true);
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
      toast.success("Gravação finalizada.");
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

    const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate White Noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;
    
    // Gain node to control volume
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.5; // 50% volume to be safe
    
    noiseSource.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noiseSource.start();
    noiseSourceRef.current = noiseSource;
    
    setIsNoiseTestActive(true);
    toast.warning("Teste de ruído ativo (White Noise)");
    
    // Auto-start recording for convenience
    startRecording();
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Serviço</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ativo</div>
            <p className="text-xs text-muted-foreground">Web Audio API Ready</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispositivos USB</CardTitle>
            <div className="h-4 w-4 text-blue-500">⚡</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.length}</div>
            <p className="text-xs text-muted-foreground">Entradas detectadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrada (Mic)</CardTitle>
            <Mic className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate" title={devices.find(d => d.deviceId === selectedDeviceId)?.label}>
              {devices.find(d => d.deviceId === selectedDeviceId)?.label.substring(0, 15) || "Selecione..."}
            </div>
            <p className="text-xs text-muted-foreground">Ativo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saída (Audio)</CardTitle>
            <Volume2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Padrão</div>
            <p className="text-xs text-muted-foreground">Sistema</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Monitoramento de Áudio</CardTitle>
            <p className="text-sm text-muted-foreground">Visualização em tempo real da entrada do microfone.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Dispositivo de Entrada</label>
              <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId} disabled={isRecording}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o microfone" />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microfone ${device.deviceId.substring(0, 5)}...`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              {!isRecording ? (
                <Button onClick={startRecording} className="w-full" variant={isNoiseTestActive ? "secondary" : "default"} disabled={!selectedDeviceId}>
                  <Mic className="mr-2 h-4 w-4" />
                  {isNoiseTestActive ? "Gravando Teste..." : "Gravar"}
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="destructive" className="w-full animate-pulse">
                  <Square className="mr-2 h-4 w-4" />
                  Parar
                </Button>
              )}
              
              <Button 
                onClick={toggleNoiseTest} 
                variant={isNoiseTestActive ? "destructive" : "secondary"}
                className="w-full"
                disabled={isRecording && !isNoiseTestActive} // Disable starting noise test while recording normal audio
              >
                <Activity className="mr-2 h-4 w-4" />
                {isNoiseTestActive ? "Parar Teste Ruído" : "Testar Cancel. Ruído"}
              </Button>
            </div>

            <div className="h-48 bg-muted rounded-md border flex items-center justify-center overflow-hidden relative">
               <canvas ref={canvasRef} width="600" height="200" className="w-full h-full" />
               {!isRecording && !isNoiseTestActive && (
                 <div className="absolute text-muted-foreground text-sm flex flex-col items-center gap-2">
                   <Activity className="h-8 w-8 opacity-50" />
                   <span>Inicie a gravação para ver o espectro</span>
                 </div>
               )}
            </div>

            {audioUrl && (
              <div className="flex items-center space-x-2 p-4 bg-secondary/20 rounded-md border animate-in fade-in slide-in-from-top-2">
                <Button size="icon" variant="ghost" onClick={playAudio} disabled={isPlaying}>
                  {isPlaying ? <Activity className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                </Button>
                <div className="flex-1 text-sm font-medium">
                  Gravação disponível
                </div>
                <Button size="icon" variant="ghost" onClick={downloadAudio}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Detalhes dos Dispositivos</CardTitle>
            <p className="text-sm text-muted-foreground">Informações técnicas detectadas.</p>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {devices.map((device, index) => (
                <AccordionItem key={device.deviceId} value={device.deviceId}>
                  <AccordionTrigger className="text-sm text-left">
                    {device.label || `Dispositivo ${index + 1}`}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>ID:</span>
                        <span className="font-mono" title={device.deviceId}>{device.deviceId.substring(0, 8)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tipo:</span>
                        <span>{device.kind}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Grupo:</span>
                        <span className="font-mono" title={device.groupId}>{device.groupId.substring(0, 8)}...</span>
                      </div>
                      <div className="mt-2 p-2 bg-muted rounded border">
                        <div className="flex items-center gap-2 mb-1">
                          <Info className="h-3 w-3" />
                          <span className="font-bold">Info Técnica</span>
                        </div>
                        <p>Driver: snd-usb-audio (Provável)</p>
                        <p>Canais: Mono/Stereo (Auto)</p>
                        <p>Sample Rate: 44.1kHz / 48kHz</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
              {devices.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm flex flex-col items-center gap-2">
                  <AlertCircle className="h-8 w-8 opacity-50" />
                  <span>Nenhum dispositivo detectado.</span>
                </div>
              )}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
