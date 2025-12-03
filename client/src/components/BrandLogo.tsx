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
      <img 
        src="/tsi-logo.png" 
        alt="TSI Telecom" 
        className={cn(
          "object-contain transition-all duration-200",
          logoHeight,
          "w-auto"
        )} 
        style={{ 
          filter: 'drop-shadow(0 2px 12px rgba(59, 130, 246, 0.4))' 
        }}
      />
      
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
