interface CircularMeterProps {
  value: number; // 0-100
  label: string;
  color?: "blue" | "green" | "orange" | "purple" | "cyan";
  size?: number;
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
}: CircularMeterProps) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
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
              filter: `drop-shadow(0 0 8px ${colorMap[color]}80)`,
              transition: "stroke-dashoffset 0.5s ease",
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-5xl font-bold"
            style={{
              color: colorMap[color],
              textShadow: `0 0 10px ${colorMap[color]}80`,
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
}
