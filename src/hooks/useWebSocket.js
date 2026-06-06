import { useCallback, useEffect, useRef, useState } from "react";

const resolveWebSocketUrl = () => {
  const configured = import.meta.env.VITE_WS_URL;
  if (configured) return configured;

  if (typeof window === "undefined") return "";

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}/ws`;
};

export function useWebSocket({ conversationId, enabled = true, onMessage }) {
  const [status, setStatus] = useState("closed");
  const wsRef = useRef(null);
  const urlRef = useRef("");

  const send = useCallback((payload) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(payload));
        return true;
      } catch (error) {
        console.error("useWebSocket send error:", error);
      }
    }
    return false;
  }, []);

  useEffect(() => {
    const baseUrl = resolveWebSocketUrl();
    if (!enabled) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setStatus("closed");
      return;
    }

    if (!baseUrl) {
      console.warn("[useWebSocket] Missing VITE_WS_URL environment variable.");
      setStatus("error");
      return;
    }

    const url = new URL(baseUrl, window.location.href);
    if (conversationId) {
      url.searchParams.set("conversationId", conversationId);
    }

    urlRef.current = url.toString();

    const socket = new WebSocket(urlRef.current);
    wsRef.current = socket;
    setStatus("connecting");

    const handleOpen = () => setStatus("open");
    const handleClose = () => setStatus("closed");
    const handleError = () => setStatus("error");
    const handleMessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (onMessage) onMessage(message);
      } catch (error) {
        console.error("useWebSocket parse error:", error);
      }
    };

    socket.addEventListener("open", handleOpen);
    socket.addEventListener("close", handleClose);
    socket.addEventListener("error", handleError);
    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("open", handleOpen);
      socket.removeEventListener("close", handleClose);
      socket.removeEventListener("error", handleError);
      socket.removeEventListener("message", handleMessage);
      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close();
      }
      if (wsRef.current === socket) {
        wsRef.current = null;
      }
    };
  }, [conversationId, enabled, onMessage]);

  return { send, status };
}
