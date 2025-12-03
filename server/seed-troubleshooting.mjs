import { drizzle } from "drizzle-orm/mysql2";
import { troubleshootingScripts } from "../drizzle/schema.js";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

const scripts = [
  {
    name: "Reiniciar PulseAudio",
    description:
      "Reinicia o servidor de áudio PulseAudio para resolver problemas de conexão",
    category: "audio",
    command: "pulseaudio -k && pulseaudio --start",
    requiresRoot: false,
    platform: "linux",
    isActive: true,
  },
  {
    name: "Verificar Dispositivos USB",
    description: "Lista todos os dispositivos USB conectados ao sistema",
    category: "system",
    command: "lsusb",
    requiresRoot: false,
    platform: "linux",
    isActive: true,
  },
  {
    name: "Recarregar Módulo snd-usb-audio",
    description: "Remove e recarrega o driver de áudio USB do kernel",
    category: "driver",
    command: "sudo modprobe -r snd-usb-audio && sudo modprobe snd-usb-audio",
    requiresRoot: true,
    platform: "linux",
    isActive: true,
  },
  {
    name: "Verificar Logs do Kernel (dmesg)",
    description:
      "Exibe as últimas 50 linhas do log do kernel relacionadas a USB e áudio",
    category: "system",
    command: "dmesg | grep -iE 'usb|audio' | tail -n 50",
    requiresRoot: false,
    platform: "linux",
    isActive: true,
  },
  {
    name: "Listar Dispositivos de Áudio (arecord)",
    description: "Lista todos os dispositivos de captura de áudio disponíveis",
    category: "audio",
    command: "arecord -l",
    requiresRoot: false,
    platform: "linux",
    isActive: true,
  },
  {
    name: "Verificar Status do PulseAudio",
    description: "Verifica se o servidor PulseAudio está em execução",
    category: "audio",
    command: "pactl info",
    requiresRoot: false,
    platform: "linux",
    isActive: true,
  },
  {
    name: "Resetar Configurações do PulseAudio",
    description:
      "Remove as configurações do usuário e reinicia o PulseAudio com padrões",
    category: "audio",
    command: "rm -rf ~/.config/pulse && pulseaudio -k && pulseaudio --start",
    requiresRoot: false,
    platform: "linux",
    isActive: true,
  },
  {
    name: "Verificar Permissões de Áudio",
    description: "Verifica se o usuário atual está no grupo 'audio'",
    category: "system",
    command: "groups | grep audio",
    requiresRoot: false,
    platform: "linux",
    isActive: true,
  },
  {
    name: "Testar Microfone (arecord)",
    description: "Grava 5 segundos de áudio do microfone padrão para teste",
    category: "audio",
    command:
      "arecord -d 5 -f cd /tmp/test-mic.wav && echo 'Gravação salva em /tmp/test-mic.wav'",
    requiresRoot: false,
    platform: "linux",
    isActive: true,
  },
  {
    name: "Verificar Conexão de Rede",
    description: "Testa a conectividade de rede com ping ao Google DNS",
    category: "network",
    command: "ping -c 4 8.8.8.8",
    requiresRoot: false,
    platform: "all",
    isActive: true,
  },
];

async function seed() {
  console.log("🌱 Seeding troubleshooting scripts...");

  try {
    for (const script of scripts) {
      await db.insert(troubleshootingScripts).values(script);
      console.log(`✓ Added: ${script.name}`);
    }
    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
