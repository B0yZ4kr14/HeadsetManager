import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileAudio,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
  RefreshCw,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecordingsHistory() {
  const {
    data: recordings,
    isLoading,
    refetch,
  } = trpc.headset.tests.list.useQuery({ limit: 50 });

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getQualityBadge = (quality: string | null) => {
    if (!quality) return <Badge variant="outline">N/A</Badge>;

    const variants: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        icon: any;
      }
    > = {
      excellent: { variant: "default", icon: CheckCircle },
      good: { variant: "secondary", icon: TrendingUp },
      fair: { variant: "outline", icon: Info },
      poor: { variant: "destructive", icon: AlertCircle },
    };

    const config = variants[quality] || variants.fair;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {quality.charAt(0).toUpperCase() + quality.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Histórico de Gravações
          </h1>
          <p className="text-muted-foreground">
            Consulte todas as gravações e testes realizados para manutenção
            preventiva.
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          disabled={isLoading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Atualizar
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => (
            <Card
              key={i}
              className="border-white/10 bg-card/50 backdrop-blur-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !recordings || recordings.length === 0 ? (
        <Card className="border-white/10 bg-card/50 backdrop-blur-md">
          <CardContent className="py-12 text-center">
            <FileAudio className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhuma gravação encontrada. Realize um teste no Dashboard para
              começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {recordings.map(recording => (
            <Card
              key={recording.id}
              className="border-white/10 bg-card/50 backdrop-blur-md hover:bg-card/70 transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileAudio className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {recording.testType === "recording"
                          ? "Gravação de Áudio"
                          : recording.testType === "noise_cancellation"
                            ? "Teste de Cancelamento de Ruído"
                            : "Análise de Espectro"}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(recording.createdAt)}
                      </CardDescription>
                    </div>
                  </div>
                  {getQualityBadge(recording.quality)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {formatDuration(recording.duration)}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Duração da gravação</p>
                      </TooltipContent>
                    </Tooltip>

                    {recording.noiseLevel !== null && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              Ruído: {recording.noiseLevel}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Nível médio de ruído (0-255)</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {recording.deviceLabel && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="col-span-2 text-muted-foreground truncate">
                            <span className="font-medium">Dispositivo:</span>{" "}
                            {recording.deviceLabel}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{recording.deviceLabel}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </TooltipProvider>
                </div>

                {recording.notes && (
                  <div className="mt-4 p-3 rounded-md bg-secondary/10 border border-white/5">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Observações:</span>{" "}
                      {recording.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
