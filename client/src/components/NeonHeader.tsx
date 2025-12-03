export function NeonHeader() {
  return (
    <header className="w-full py-6 border-b border-neon-blue/20 backdrop-blur-sm bg-background/50">
      <div className="container mx-auto flex justify-center items-center">
        <div className="relative">
          {/* Logo with neon glow effect */}
          <img
            src="/tsi-logo-new.png"
            alt="tSitelecom"
            className="h-16 md:h-20 object-contain"
            style={{
              filter: "drop-shadow(0 0 20px hsl(217, 91%, 60%)) drop-shadow(0 0 40px hsl(217, 91%, 60% / 0.5))",
            }}
          />
          
          {/* Subtitle */}
          <div className="text-center mt-2">
            <span className="text-xs md:text-sm uppercase tracking-[0.3em] font-light text-muted-foreground">
              Headset Manager
            </span>
          </div>

          {/* Decorative glow elements */}
          <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-primary/10 to-transparent blur-2xl -z-10 animate-pulse"></div>
        </div>
      </div>
    </header>
  );
}
