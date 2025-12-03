import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Headphones,
  Terminal,
  FileText,
  Settings,
  Menu,
  X,
  HelpCircle,
  Wrench,
  History,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UpdateNotification } from "@/components/UpdateNotification";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: Headphones },
    { href: "/terminal", label: "Terminal & Logs", icon: Terminal },
    { href: "/diagnostics", label: "Diagnósticos", icon: Wrench },
    { href: "/recordings", label: "Histórico", icon: History },
    { href: "/docs", label: "Documentação", icon: FileText },
    { href: "/settings", label: "Configurações", icon: Settings },
    { href: "/help", label: "Ajuda", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-neon-blue/20 bg-card/50 backdrop-blur-sm">
        <img
          src="/tsi-logo-new.png"
          alt="tSitelecom"
          className="h-10 object-contain"
          style={{
            filter: "drop-shadow(0 0 10px hsl(217, 91%, 60%))",
          }}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-neon-blue/20 hidden md:flex flex-col items-center gap-2">
            <img
              src="/tsi-logo-new.png"
              alt="tSitelecom"
              className="h-12 object-contain"
              style={{
                filter: "drop-shadow(0 0 15px hsl(217, 91%, 60%))",
              }}
            />
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-light">
              Headset Manager
            </span>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(item => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-md",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-6 border-t border-sidebar-border">
            <div className="bg-sidebar-accent/50 p-4 rounded-md border border-sidebar-border text-xs font-mono text-sidebar-foreground/70">
              <div className="flex justify-between mb-2">
                <span>STATUS</span>
                <span className="text-green-500 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  ONLINE
                </span>
              </div>
              <div className="flex justify-between">
                <span>SYSTEM</span>
                <span>ARCH LINUX</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-65px)] md:h-screen bg-background relative">
        {/* Background decorative element */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

        <div className="container py-8 md:py-12 max-w-7xl mx-auto relative z-10">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Update Notification */}
      <UpdateNotification />
    </div>
  );
}
