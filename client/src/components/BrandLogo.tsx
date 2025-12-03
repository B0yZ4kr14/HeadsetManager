import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  showText?: boolean;
  variant?: "default" | "mobile" | "sidebar";
}

export default function BrandLogo({ 
  className, 
  showText = true,
  variant = "default" 
}: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img 
        src="/logo.png" 
        alt="TSI Telecom" 
        className={cn(
          "object-contain transition-all duration-200",
          variant === "mobile" ? "h-8 w-auto" : "h-10 w-auto"
        )} 
      />
      
      {showText && (
        <div className="flex flex-col justify-center">
          <h1 className={cn(
            "font-bold tracking-tight leading-none text-foreground",
            variant === "mobile" ? "text-lg" : "text-lg"
          )}>
            TSI Telecom
          </h1>
          {variant === "sidebar" && (
            <span className="text-[10px] font-medium text-primary uppercase tracking-wider mt-1">
              Headset Manager
            </span>
          )}
        </div>
      )}
    </div>
  );
}
