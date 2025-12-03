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
      {/* Logo TSI gerada por IA - fundo 100% transparente */}
      <img
        src="/tsi-logo-transparent.png"
        alt="TSI Telecom Logo"
        className={cn(
          "object-contain drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]",
          isSmall ? "h-8" : "h-12"
        )}
      />

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
