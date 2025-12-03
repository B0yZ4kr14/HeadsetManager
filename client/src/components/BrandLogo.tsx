import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  variant?: "default" | "mobile" | "sidebar";
}

export default function BrandLogo({ 
  className, 
  variant = "default" 
}: BrandLogoProps) {
  const logoHeight = variant === "mobile" ? "h-10" : "h-14";
  
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Logo com fundo branco removido via CSS filters + borda neon azul */}
      <div className="relative">
        <img 
          src="/tsi-logo.png" 
          alt="TSI Telecom" 
          className={cn(
            "object-contain transition-all duration-200 relative z-10",
            logoHeight,
            "w-auto"
          )} 
          style={{ 
            // Remove fundo branco usando mix-blend-mode
            mixBlendMode: 'multiply',
            // Adiciona brilho neon azul
            filter: 'brightness(1.2) contrast(1.1) drop-shadow(0 0 8px rgba(59, 130, 246, 0.8)) drop-shadow(0 0 16px rgba(59, 130, 246, 0.4))',
          }}
        />
        {/* Borda neon azul em volta da logo */}
        <div 
          className={cn(
            "absolute inset-0 rounded-lg border-2 border-primary/60 pointer-events-none",
            logoHeight
          )}
          style={{
            boxShadow: '0 0 12px rgba(59, 130, 246, 0.6), inset 0 0 12px rgba(59, 130, 246, 0.2)',
          }}
        />
      </div>
      
      <div className="flex flex-col justify-center">
        <span className={cn(
          "font-semibold text-primary uppercase tracking-widest leading-none",
          variant === "mobile" ? "text-[10px]" : "text-xs"
        )}>
          Headset Manager
        </span>
      </div>
    </div>
  );
}
