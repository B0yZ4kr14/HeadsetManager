import type { Server as SocketIOServer } from "socket.io";

/**
 * Get the global Socket.IO instance
 */
export function getIO(): SocketIOServer | null {
  return (global as any).io || null;
}

/**
 * Emit a system log event to all connected clients
 */
export function emitSystemLog(log: {
  level: "info" | "warning" | "error" | "debug";
  source: string;
  message: string;
  details?: any;
  timestamp?: Date;
}) {
  const io = getIO();
  if (io) {
    io.emit("system:log", {
      ...log,
      timestamp: log.timestamp || new Date(),
    });
  }
}

/**
 * Emit a script execution event to all connected clients
 */
export function emitScriptExecution(execution: {
  scriptId: number;
  scriptName: string;
  status: "running" | "success" | "failed";
  output?: string;
  errorMessage?: string;
  executionTime?: number;
}) {
  const io = getIO();
  if (io) {
    io.emit("script:execution", execution);
  }
}

/**
 * Emit an AI diagnostic event to all connected clients
 */
export function emitAIDiagnostic(diagnostic: {
  userId: number;
  response: string;
  severity?: string;
  confidence?: number;
}) {
  const io = getIO();
  if (io) {
    io.emit("ai:diagnostic", diagnostic);
  }
}

/**
 * Emit a device status change event
 */
export function emitDeviceStatus(device: {
  deviceId: string;
  label: string;
  status: "connected" | "disconnected" | "error";
}) {
  const io = getIO();
  if (io) {
    io.emit("device:status", device);
  }
}
