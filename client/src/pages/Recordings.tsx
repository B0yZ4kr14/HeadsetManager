import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Download, TrendingUp, Calendar } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { generateAudioReportPDF } from "@/lib/pdfGenerator";
import { SkeletonLoader, CardSkeleton } from "../components/SkeletonLoader";
import { EmptyState } from "../components/EmptyState";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Recording {
  id: string;
  date: Date;
  duration: number;
  quality: number;
  noiseLevel: number;
  deviceName: string;
}

export default function Recordings() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState<"7" | "30" | "90">("30");

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    setIsLoading(true);
    // Simular carregamento de dados
    // TODO: Substituir por chamada tRPC real
    setTimeout(() => {
      const mockData: Recording[] = [
        {
          id: "1",
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          duration: 120,
          quality: 85,
          noiseLevel: 45,
          deviceName: "Headset USB",
        },
        {
          id: "2",
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          duration: 180,
          quality: 78,
          noiseLevel: 52,
          deviceName: "Headset USB",
        },
        {
          id: "3",
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          duration: 95,
          quality: 92,
          noiseLevel: 38,
          deviceName: "Headset USB",
        },
        {
          id: "4",
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          duration: 210,
          quality: 68,
          noiseLevel: 61,
          deviceName: "Headset USB",
        },
        {
          id: "5",
          date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
          duration: 150,
          quality: 74,
          noiseLevel: 48,
          deviceName: "Headset USB",
        },
      ];
      setRecordings(mockData);
      setIsLoading(false);
    }, 1000);
  };

  const filteredRecordings = recordings.filter((rec) => {
    const daysAgo = Math.floor(
      (Date.now() - rec.date.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysAgo <= parseInt(periodFilter);
  });

  const calculateStats = () => {
    if (filteredRecordings.length === 0) {
      return {
        totalRecordings: 0,
        averageQuality: 0,
        peakNoise: 0,
        totalDuration: 0,
        dateRange: {
          start: new Date(),
          end: new Date(),
        },
        qualityDistribution: {
          excellent: 0,
          good: 0,
          fair: 0,
          poor: 0,
        },
      };
    }

    const totalDuration = filteredRecordings.reduce(
      (sum, rec) => sum + rec.duration,
      0
    );
    const averageQuality =
      filteredRecordings.reduce((sum, rec) => sum + rec.quality, 0) /
      filteredRecordings.length;
    const peakNoise = Math.max(...filteredRecordings.map((rec) => rec.noiseLevel));

    const qualityDistribution = {
      excellent: filteredRecordings.filter((rec) => rec.quality > 80).length,
      good: filteredRecordings.filter((rec) => rec.quality >= 60 && rec.quality <= 80)
        .length,
      fair: filteredRecordings.filter((rec) => rec.quality >= 40 && rec.quality < 60)
        .length,
      poor: filteredRecordings.filter((rec) => rec.quality < 40).length,
    };

    const dates = filteredRecordings.map((rec) => rec.date);
    const dateRange = {
      start: new Date(Math.min(...dates.map((d) => d.getTime()))),
      end: new Date(Math.max(...dates.map((d) => d.getTime()))),
    };

    return {
      totalRecordings: filteredRecordings.length,
      averageQuality,
      peakNoise,
      totalDuration,
      dateRange,
      qualityDistribution,
    };
  };

  const handleExportPDF = () => {
    const stats = calculateStats();
    const filename = generateAudioReportPDF(stats);
    toast.success(`Relatório exportado: ${filename}`);
  };

  // Prepare chart data
  const chartData = {
    labels: filteredRecordings
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((rec) => rec.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })),
    datasets: [
      {
        label: "Qualidade (%)",
        data: filteredRecordings
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .map((rec) => rec.quality),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const index = context.dataIndex;
            const recording = filteredRecordings.sort(
              (a, b) => a.date.getTime() - b.date.getTime()
            )[index];
            return [
              `Qualidade: ${recording.quality}%`,
              `Ruído: ${recording.noiseLevel} dB`,
              `Duração: ${Math.floor(recording.duration / 60)}min`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value: any) {
            return value + "%";
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <SkeletonLoader variant="text" className="w-48 h-8" />
          <SkeletonLoader variant="text" className="w-32 h-10" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton />
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Histórico de Gravações</h1>
        </div>
        <EmptyState
          icon={FileText}
          title="Nenhuma gravação encontrada"
          description="Você ainda não fez nenhuma gravação de áudio. Vá para o Dashboard e comece a gravar!"
          actionLabel="Ir para Dashboard"
          onAction={() => (window.location.href = "/")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Gravações</h1>
          <p className="text-muted-foreground mt-1">
            Análise de qualidade e tendências ao longo do tempo
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={periodFilter} onValueChange={(v: any) => setPeriodFilter(v)}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportPDF} className="gap-2">
            <FileText className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Gravações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {stats.totalRecordings}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Qualidade Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                stats.averageQuality >= 70
                  ? "text-green-500"
                  : stats.averageQuality >= 50
                  ? "text-yellow-500"
                  : "text-red-500"
              }`}
            >
              {stats.averageQuality.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pico de Ruído
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {stats.peakNoise.toFixed(0)} dB
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tempo Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">
              {Math.floor(stats.totalDuration / 60)}min
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <CardTitle>Tendência de Qualidade</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Quality Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Qualidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="text-2xl font-bold text-green-500">
                {stats.qualityDistribution.excellent}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Excelente (&gt; 80%)
              </div>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-500">
                {stats.qualityDistribution.good}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Bom (60-80%)
              </div>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="text-2xl font-bold text-yellow-500">
                {stats.qualityDistribution.fair}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Regular (40-60%)
              </div>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="text-2xl font-bold text-red-500">
                {stats.qualityDistribution.poor}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Ruim (&lt; 40%)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recordings List */}
      <Card>
        <CardHeader>
          <CardTitle>Gravações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredRecordings
              .sort((a, b) => b.date.getTime() - a.date.getTime())
              .map((recording) => (
                <div
                  key={recording.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{recording.deviceName}</div>
                    <div className="text-sm text-muted-foreground">
                      {recording.date.toLocaleString("pt-BR")} •{" "}
                      {Math.floor(recording.duration / 60)}min
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div
                        className={`text-sm font-medium ${
                          recording.quality >= 70
                            ? "text-green-500"
                            : recording.quality >= 50
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                      >
                        Qualidade: {recording.quality}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Ruído: {recording.noiseLevel} dB
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
