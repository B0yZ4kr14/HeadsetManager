import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  variant?: "card" | "text" | "circle" | "chart";
}

export function SkeletonLoader({
  className,
  variant = "card",
}: SkeletonLoaderProps) {
  const baseClasses = "animate-pulse bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 rounded";

  const variantClasses = {
    card: "h-32 w-full",
    text: "h-4 w-full",
    circle: "h-24 w-24 rounded-full",
    chart: "h-64 w-full",
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      role="status"
      aria-label="Carregando..."
    >
      <span className="sr-only">Carregando...</span>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <SkeletonLoader variant="text" className="w-1/3" />
      <SkeletonLoader variant="text" className="w-full" />
      <SkeletonLoader variant="text" className="w-2/3" />
    </div>
  );
}
