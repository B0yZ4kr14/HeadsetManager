import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  variant?: "default" | "mobile" | "sidebar";
}

export default function BrandLogo({
  className,
  variant = "default",
}: BrandLogoProps) {
  const isSmall = variant === "mobile";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Logo TSI como texto estilizado com efeito neon (sem imagem) */}
      <div
        className="relative px-3 py-2 rounded-lg border-2 border-primary/60 bg-gradient-to-br from-primary/10 to-primary/5"
        style={{
          boxShadow:
            "0 0 12px rgba(59, 130, 246, 0.6), inset 0 0 12px rgba(59, 130, 246, 0.2)",
        }}
      >
        <span
          className={cn(
            "font-bold tracking-tight",
            isSmall ? "text-base" : "text-2xl"
          )}
          style={{
            background:
              "linear-gradient(135deg, #3B82F6 0%, #60A5FA 50%, #93C5FD 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          tSitelecom
        </span>
      </div>

      <div className="flex flex-col justify-center">
        <span
          className={cn(
            "font-semibold text-primary uppercase tracking-widest leading-none",
            isSmall ? "text-[10px]" : "text-xs"
          )}
        >
          Headset Manager
        </span>
      </div>
    </div>
  );
}
