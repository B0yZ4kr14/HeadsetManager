import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Headphones, Terminal, FileText, Settings, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: Headphones },
    { href: "/terminal", label: "Terminal & Logs", icon: Terminal },
    { href: "/docs", label: "Documentação", icon: FileText },
    { href: "/settings", label: "Configurações", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tighter">
          <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center">
            <Headphones size={18} />
          </div>
          <span>HEADSET.MGR</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-border hidden md:flex items-center gap-3">
            <div className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center">
              <Headphones size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight leading-none">HEADSET</h1>
              <span className="text-xs text-muted-foreground font-mono">MANAGER v1.0</span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href} className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-2",
                    isActive 
                      ? "bg-accent text-accent-foreground border-primary" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground border-transparent"
                  )}>
                    <item.icon size={18} />
                    {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-6 border-t border-border">
            <div className="bg-secondary p-4 text-xs font-mono text-muted-foreground">
              <div className="flex justify-between mb-2">
                <span>STATUS</span>
                <span className="text-green-600 font-bold">ONLINE</span>
              </div>
              <div className="flex justify-between">
                <span>SYSTEM</span>
                <span>ARCH</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-65px)] md:h-screen">
        <div className="container py-8 md:py-12 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
