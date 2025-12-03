import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface AlertThresholds {
  noiseLevel: number; // dB
  qualityMin: number; // percentage
}

interface AudioMetrics {
  noiseLevel: number;
  quality: number;
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  noiseLevel: 70, // Alert if noise > 70dB
  qualityMin: 50, // Alert if quality < 50%
};

export function useAudioAlerts(
  metrics: AudioMetrics | null,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS
) {
  const lastNoiseAlertRef = useRef<number>(0);
  const lastQualityAlertRef = useRef<number>(0);
  const ALERT_COOLDOWN = 30000; // 30 seconds between same type of alerts

  useEffect(() => {
    if (!metrics) return;

    const now = Date.now();

    // Check noise level
    if (metrics.noiseLevel > thresholds.noiseLevel) {
      if (now - lastNoiseAlertRef.current > ALERT_COOLDOWN) {
        toast.error(
          `⚠️ Ruído Alto Detectado: ${metrics.noiseLevel.toFixed(0)} dB`,
          {
            description: `O nível de ruído ultrapassou o limite de ${thresholds.noiseLevel} dB. Verifique o ambiente ou o cancelamento de ruído do headset.`,
            duration: 5000,
            action: {
              label: "Ver Histórico",
              onClick: () => (window.location.href = "/recordings"),
            },
          }
        );
        lastNoiseAlertRef.current = now;

        // Save alert to database (TODO: implement tRPC mutation)
        saveAlert({
          type: "noise",
          severity: "high",
          value: metrics.noiseLevel,
          threshold: thresholds.noiseLevel,
          timestamp: new Date(),
        });
      }
    }

    // Check quality level
    if (metrics.quality < thresholds.qualityMin) {
      if (now - lastQualityAlertRef.current > ALERT_COOLDOWN) {
        toast.warning(
          `⚠️ Qualidade Baixa Detectada: ${metrics.quality.toFixed(0)}%`,
          {
            description: `A qualidade de áudio está abaixo de ${thresholds.qualityMin}%. Verifique a conexão USB ou execute diagnósticos.`,
            duration: 5000,
            action: {
              label: "Executar Diagnóstico",
              onClick: () => (window.location.href = "/terminal"),
            },
          }
        );
        lastQualityAlertRef.current = now;

        // Save alert to database (TODO: implement tRPC mutation)
        saveAlert({
          type: "quality",
          severity: "medium",
          value: metrics.quality,
          threshold: thresholds.qualityMin,
          timestamp: new Date(),
        });
      }
    }
  }, [metrics, thresholds]);
}

interface Alert {
  type: "noise" | "quality";
  severity: "low" | "medium" | "high";
  value: number;
  threshold: number;
  timestamp: Date;
}

function saveAlert(alert: Alert) {
  // TODO: Implement tRPC mutation to save alert to database
  console.log("Alert saved:", alert);
  
  // Store in localStorage as fallback
  const alerts = JSON.parse(localStorage.getItem("audio_alerts") || "[]");
  alerts.push(alert);
  
  // Keep only last 100 alerts
  if (alerts.length > 100) {
    alerts.shift();
  }
  
  localStorage.setItem("audio_alerts", JSON.stringify(alerts));
}

export function getStoredAlerts(): Alert[] {
  try {
    return JSON.parse(localStorage.getItem("audio_alerts") || "[]");
  } catch {
    return [];
  }
}

export function clearStoredAlerts() {
  localStorage.removeItem("audio_alerts");
}
