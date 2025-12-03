import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Download, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function UpdateNotification() {
  const [dismissed, setDismissed] = useState(false);
  const { data: updateInfo, isLoading } = trpc.system.checkForUpdates.useQuery(
    undefined,
    {
      // Check for updates every 6 hours
      refetchInterval: 6 * 60 * 60 * 1000,
      // Don't refetch on window focus to avoid spam
      refetchOnWindowFocus: false,
      // Retry once if failed
      retry: 1,
    }
  );

  // Check if user has dismissed this version before
  useEffect(() => {
    if (updateInfo?.latestVersion) {
      const dismissedVersion = localStorage.getItem("dismissedUpdateVersion");
      if (dismissedVersion === updateInfo.latestVersion) {
        setDismissed(true);
      }
    }
  }, [updateInfo?.latestVersion]);

  const handleDismiss = () => {
    if (updateInfo?.latestVersion) {
      localStorage.setItem("dismissedUpdateVersion", updateInfo.latestVersion);
      setDismissed(true);
      toast.info("Você pode verificar atualizações novamente em Configurações");
    }
  };

  const handleDownload = () => {
    if (updateInfo?.releaseUrl) {
      window.open(updateInfo.releaseUrl, "_blank");
    }
  };

  // Don't show if loading, no update available, or user dismissed
  if (isLoading || !updateInfo?.isUpdateAvailable || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-5">
      <Alert className="glass border-primary/50 shadow-lg">
        <Download className="h-4 w-4 text-primary" />
        <AlertTitle className="flex items-center justify-between">
          <span>Nova Atualização Disponível!</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mr-2"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertTitle>
        <AlertDescription className="space-y-3 mt-2">
          <div className="text-sm">
            <p className="font-medium">
              Versão {updateInfo.latestVersion} disponível
            </p>
            <p className="text-muted-foreground text-xs">
              Versão atual: {updateInfo.currentVersion}
            </p>
          </div>

          {updateInfo.releaseNotes && (
            <div className="text-xs text-muted-foreground max-h-20 overflow-y-auto">
              <p className="font-medium mb-1">Novidades:</p>
              <p className="whitespace-pre-wrap line-clamp-3">
                {updateInfo.releaseNotes}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button size="sm" onClick={handleDownload} className="flex-1">
              <ExternalLink className="h-3 w-3 mr-1" />
              Baixar Atualização
            </Button>
            <Button size="sm" variant="outline" onClick={handleDismiss}>
              Depois
            </Button>
          </div>

          {updateInfo.assets && updateInfo.assets.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Instaladores disponíveis:</p>
              <ul className="space-y-0.5">
                {updateInfo.assets.map((asset: any) => (
                  <li key={asset.name} className="flex items-center gap-1">
                    <span className="text-primary">•</span>
                    <a
                      href={asset.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {asset.name}
                    </a>
                    <span className="text-muted-foreground">
                      ({(asset.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
