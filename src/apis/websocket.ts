import type { WsEnvelope } from "../types/interfaces";

export const getWebSocketUrl = (
  path = "/ws",
  baseUrl = import.meta.env.VITE_API_URL,
) => {
  const fallbackOrigin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";
  const wsUrl = new URL(path, baseUrl || fallbackOrigin);

  wsUrl.protocol = wsUrl.protocol === "https:" ? "wss:" : "ws:";

  return wsUrl.toString();
};

export const createWebSocket = (url = getWebSocketUrl()) => {
  return new WebSocket(url);
};

export const parseWsEnvelope = <TBody = unknown>(data: string) => {
  return JSON.parse(data) as WsEnvelope<TBody>;
};

export const stringifyWsEnvelope = <TBody>(envelope: WsEnvelope<TBody>) => {
  return JSON.stringify(envelope);
};

export const sendWsEnvelope = <TBody>(
  ws: WebSocket,
  type: string,
  requestId: string,
  body: TBody,
) => {
  ws.send(
    stringifyWsEnvelope({
      type,
      request_id: requestId,
      body,
    }),
  );
};
