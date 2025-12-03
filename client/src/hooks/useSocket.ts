import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Create socket connection only once
    if (!socket) {
      socket = io({
        path: "/api/socket.io",
        autoConnect: true,
      });

      socket.on("connect", () => {
        console.log("[Socket.IO] Connected to server");
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        console.log("[Socket.IO] Disconnected from server");
        setIsConnected(false);
      });
    }

    return () => {
      // Don't disconnect on component unmount, keep connection alive
    };
  }, []);

  return { socket, isConnected };
}

export function useSocketEvent<T = any>(
  eventName: string,
  callback: (data: T) => void
) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on(eventName, callback);

    return () => {
      socket.off(eventName, callback);
    };
  }, [socket, eventName, callback]);
}
