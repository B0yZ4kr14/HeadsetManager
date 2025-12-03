import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CircularMeterProps {
  value: number; // 0-100
  label: string;
  color?: "blue" | "green" | "orange" | "purple" | "cyan";
  size?: number;
  details?: {
    min?: number;
    max?: number;
    average?: number;
    unit?: string;
  };
}

const colorMap = {
  blue: "hsl(217, 91%, 60%)",
  green: "hsl(142, 76%, 36%)",
  orange: "hsl(25, 95%, 53%)",
  purple: "hsl(271, 81%, 56%)",
  cyan: "hsl(189, 94%, 43%)",
};

export function CircularMeter({
  value,
  label,
  color = "orange",
  size = 200,
  details,
}: CircularMeterProps) {
  const [isHovered, setIsHovered] = useState(false);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const meterContent = (
    <div 
      className="flex flex-col items-center gap-4 cursor-pointer transition-transform duration-200"
      style={{
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="circular-meter-bg"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorMap[color]}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              filter: isHovered 
                ? `drop-shadow(0 0 16px ${colorMap[color]}CC)` 
                : `drop-shadow(0 0 8px ${colorMap[color]}80)`,
              transition: "stroke-dashoffset 0.5s ease, filter 0.3s ease",
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-5xl font-bold transition-all duration-200"
            style={{
              color: colorMap[color],
              textShadow: isHovered 
                ? `0 0 20px ${colorMap[color]}CC, 0 0 40px ${colorMap[color]}66`
                : `0 0 10px ${colorMap[color]}80`,
            }}
          >
            {Math.round(value)}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
            {label}
          </span>
        </div>
      </div>
    </div>
  );

  if (!details) {
    return meterContent;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          {meterContent}
        </TooltipTrigger>
        <TooltipContent side="bottom" className="p-4 max-w-xs">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm" style={{ color: colorMap[color] }}>
              Detalhes da Métrica
            </h4>
            <div className="space-y-1 text-xs">
              {details.min !== undefined && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Mínimo:</span>
                  <span className="font-medium">{details.min}{details.unit || ''}</span>
                </div>
              )}
              {details.max !== undefined && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Máximo:</span>
                  <span className="font-medium">{details.max}{details.unit || ''}</span>
                </div>
              )}
              {details.average !== undefined && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Média:</span>
                  <span className="font-medium">{details.average}{details.unit || ''}</span>
                </div>
              )}
              <div className="flex justify-between gap-4 pt-1 border-t border-border">
                <span className="text-muted-foreground">Atual:</span>
                <span className="font-bold" style={{ color: colorMap[color] }}>
                  {Math.round(value)}{details.unit || ''}
                </span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
