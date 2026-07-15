import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChatSocketClient,
  type ChatWsEnvelope,
  type ChatSocketClientOptions,
  type ChatSocketStatus,
} from "../services/chatSocket";
import type { ChatMessageDto } from "../types/interfaces";
import type { WsEnvelope } from "../types/interfaces";

export interface UseChatSocketOptions
  extends Pick<ChatSocketClientOptions, "url" | "tokenProvider"> {
  enabled?: boolean;
  onEnvelope?: (envelope: ChatWsEnvelope | WsEnvelope<unknown>) => void;
  onChatMessage?: (message: ChatMessageDto) => void;
}

export const useChatSocket = ({
  enabled = true,
  url,
  tokenProvider,
  onEnvelope,
  onChatMessage,
}: UseChatSocketOptions = {}) => {
  const clientRef = useRef<ChatSocketClient | null>(null);
  const [status, setStatus] = useState<ChatSocketStatus>("idle");
  const [error, setError] = useState<Event | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const client = new ChatSocketClient({
      url,
      tokenProvider,
      onStatusChange: setStatus,
      onEnvelope,
      onChatMessage,
      onError: setError,
    });

    clientRef.current = client;
    client.connect();

    return () => {
      client.disconnect();
      clientRef.current = null;
    };
  }, [enabled, onChatMessage, onEnvelope, tokenProvider, url]);

  const sendEnvelope = useCallback(<TBody,>(
    type: string,
    requestId: string,
    body: TBody,
  ) => {
    clientRef.current?.send(type, requestId, body);
  }, []);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
    clientRef.current = null;
  }, []);

  const sendChat = useCallback((message: string, requestId?: string) => {
    return clientRef.current?.sendChat(message, requestId);
  }, []);

  const editChat = useCallback((
    messageUuid: string,
    message: string,
    requestId?: string,
  ) => {
    return clientRef.current?.editChat(messageUuid, message, requestId);
  }, []);

  const deleteChat = useCallback((messageUuid: string, requestId?: string) => {
    return clientRef.current?.deleteChat(messageUuid, requestId);
  }, []);

  return {
    status,
    error,
    sendEnvelope,
    sendChat,
    editChat,
    deleteChat,
    disconnect,
  };
};
