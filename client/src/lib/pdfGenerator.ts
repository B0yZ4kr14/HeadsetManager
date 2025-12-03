import { jsPDF } from "jspdf";

interface AudioTestStats {
  totalRecordings: number;
  averageQuality: number;
  peakNoise: number;
  totalDuration: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  qualityDistribution: {
    excellent: number; // > 80
    good: number; // 60-80
    fair: number; // 40-60
    poor: number; // < 40
  };
}

export function generateAudioReportPDF(stats: AudioTestStats) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // Blue
  doc.text("HeadsetManager - Relatório de Áudio", 20, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 20, 28);
  
  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 32, 190, 32);
  
  // Period
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Período Analisado", 20, 42);
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(
    `${stats.dateRange.start.toLocaleDateString("pt-BR")} até ${stats.dateRange.end.toLocaleDateString("pt-BR")}`,
    20,
    48
  );
  
  // Summary Statistics
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Estatísticas Gerais", 20, 60);
  
  const summaryY = 70;
  doc.setFontSize(10);
  
  // Total Recordings
  doc.setTextColor(60, 60, 60);
  doc.text("Total de Gravações:", 20, summaryY);
  doc.setTextColor(37, 99, 235);
  doc.setFont("helvetica", "bold");
  doc.text(stats.totalRecordings.toString(), 80, summaryY);
  
  // Average Quality
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text("Qualidade Média:", 20, summaryY + 8);
  const qualityColor = stats.averageQuality >= 70 ? [34, 197, 94] as const : stats.averageQuality >= 50 ? [234, 179, 8] as const : [239, 68, 68] as const;
  doc.setTextColor(qualityColor[0], qualityColor[1], qualityColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text(`${stats.averageQuality.toFixed(1)}%`, 80, summaryY + 8);
  
  // Peak Noise
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text("Pico de Ruído:", 20, summaryY + 16);
  doc.setTextColor(239, 68, 68);
  doc.setFont("helvetica", "bold");
  doc.text(`${stats.peakNoise.toFixed(1)} dB`, 80, summaryY + 16);
  
  // Total Duration
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text("Tempo Total de Uso:", 20, summaryY + 24);
  doc.setTextColor(37, 99, 235);
  doc.setFont("helvetica", "bold");
  const hours = Math.floor(stats.totalDuration / 3600);
  const minutes = Math.floor((stats.totalDuration % 3600) / 60);
  doc.text(`${hours}h ${minutes}min`, 80, summaryY + 24);
  
  // Quality Distribution
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Distribuição de Qualidade", 20, 110);
  
  const distY = 120;
  doc.setFontSize(10);
  
  // Excellent
  doc.setTextColor(34, 197, 94);
  doc.text("● Excelente (> 80%):", 20, distY);
  doc.setTextColor(60, 60, 60);
  doc.text(`${stats.qualityDistribution.excellent} gravações`, 80, distY);
  
  // Good
  doc.setTextColor(59, 130, 246);
  doc.text("● Bom (60-80%):", 20, distY + 8);
  doc.setTextColor(60, 60, 60);
  doc.text(`${stats.qualityDistribution.good} gravações`, 80, distY + 8);
  
  // Fair
  doc.setTextColor(234, 179, 8);
  doc.text("● Regular (40-60%):", 20, distY + 16);
  doc.setTextColor(60, 60, 60);
  doc.text(`${stats.qualityDistribution.fair} gravações`, 80, distY + 16);
  
  // Poor
  doc.setTextColor(239, 68, 68);
  doc.text("● Ruim (< 40%):", 20, distY + 24);
  doc.setTextColor(60, 60, 60);
  doc.text(`${stats.qualityDistribution.poor} gravações`, 80, distY + 24);
  
  // Recommendations
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Recomendações", 20, 165);
  
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const recommendations: string[] = [];
  
  if (stats.averageQuality < 50) {
    recommendations.push("• Verificar drivers de áudio e atualizar se necessário");
    recommendations.push("• Testar em outra porta USB");
  }
  
  if (stats.peakNoise > 70) {
    recommendations.push("• Verificar cancelamento de ruído do headset");
    recommendations.push("• Testar em ambiente mais silencioso");
  }
  
  if (stats.qualityDistribution.poor > stats.totalRecordings * 0.3) {
    recommendations.push("• Considerar substituição do headset");
    recommendations.push("• Executar diagnósticos completos");
  }
  
  if (recommendations.length === 0) {
    recommendations.push("✓ Headset funcionando dentro dos parâmetros esperados");
  }
  
  let recY = 175;
  recommendations.forEach((rec) => {
    doc.text(rec, 20, recY);
    recY += 6;
  });
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("HeadsetManager v1.0.0 | TSI Telecom | Relatório gerado automaticamente", 20, 285);
  
  // Save PDF
  const filename = `relatorio-audio-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
  
  return filename;
}
