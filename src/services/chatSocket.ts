import {
  createWebSocket,
  getWebSocketUrl,
  parseWsEnvelope,
  sendWsEnvelope,
} from "../apis/websocket";
import type {
  ChatMessageDto,
  WsEnvelope,
  WsErrorResponseBody,
  WsOkResponseBody,
} from "../types/interfaces";
import LocalStorageKeys from "../types/localstorage";

export const ChatWsEventType = {
  RequestAuthorization: "request_authorization",
  Authorization: "authorization",
  AuthorizationResponse: "authorization_res",
  SendChat: "send_chat",
  SendChatResponse: "send_chat_res",
  ChatReceived: "chat_received",
  EditChat: "edit_chat",
  EditChatResponse: "edit_chat_res",
  ChatEdited: "chat_edited",
  DeleteChat: "delete_chat",
  DeleteChatResponse: "delete_chat_res",
  ChatDeleted: "chat_deleted",
} as const;

export type ChatWsEventType = (typeof ChatWsEventType)[keyof typeof ChatWsEventType];

export type ChatSocketStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "authorized"
  | "closed"
  | "error";

export interface WsRequestAuthorizationBody {
  authorization_until: string;
}

export interface WsAuthorizationBody {
  authorization: string;
}

export interface WsSendChatBody {
  message: string;
}

export interface WsEditChatBody {
  messageUuid: string;
  message: string;
}

export interface WsDeleteChatBody {
  messageUuid: string;
}

export type WsAuthorizationResponseBody = WsOkResponseBody | WsErrorResponseBody;
export type WsChatCommandResponseBody = WsOkResponseBody | WsErrorResponseBody;

export type WsRequestAuthorizationEnvelope = WsEnvelope<WsRequestAuthorizationBody> & {
  type: typeof ChatWsEventType.RequestAuthorization;
};

export type WsAuthorizationEnvelope = WsEnvelope<WsAuthorizationBody> & {
  type: typeof ChatWsEventType.Authorization;
};

export type WsAuthorizationResponseEnvelope = WsEnvelope<WsAuthorizationResponseBody> & {
  type: typeof ChatWsEventType.AuthorizationResponse;
};

export type WsSendChatEnvelope = WsEnvelope<WsSendChatBody> & {
  type: typeof ChatWsEventType.SendChat;
};

export type WsSendChatResponseEnvelope = WsEnvelope<WsChatCommandResponseBody> & {
  type: typeof ChatWsEventType.SendChatResponse;
};

export type WsChatReceivedEnvelope = WsEnvelope<ChatMessageDto> & {
  type: typeof ChatWsEventType.ChatReceived;
};

export type WsEditChatEnvelope = WsEnvelope<WsEditChatBody> & {
  type: typeof ChatWsEventType.EditChat;
};

export type WsEditChatResponseEnvelope = WsEnvelope<WsChatCommandResponseBody> & {
  type: typeof ChatWsEventType.EditChatResponse;
};

export type WsChatEditedEnvelope = WsEnvelope<ChatMessageDto> & {
  type: typeof ChatWsEventType.ChatEdited;
};

export type WsDeleteChatEnvelope = WsEnvelope<WsDeleteChatBody> & {
  type: typeof ChatWsEventType.DeleteChat;
};

export type WsDeleteChatResponseEnvelope = WsEnvelope<WsChatCommandResponseBody> & {
  type: typeof ChatWsEventType.DeleteChatResponse;
};

export type WsChatDeletedEnvelope = WsEnvelope<ChatMessageDto> & {
  type: typeof ChatWsEventType.ChatDeleted;
};

export type ChatWsAuthEnvelope =
  | WsRequestAuthorizationEnvelope
  | WsAuthorizationEnvelope
  | WsAuthorizationResponseEnvelope;

export type ChatWsCommandEnvelope =
  | WsSendChatEnvelope
  | WsSendChatResponseEnvelope
  | WsEditChatEnvelope
  | WsEditChatResponseEnvelope
  | WsDeleteChatEnvelope
  | WsDeleteChatResponseEnvelope;

export type ChatWsMessageEnvelope =
  | WsChatReceivedEnvelope
  | WsChatEditedEnvelope
  | WsChatDeletedEnvelope;

export type ChatWsEnvelope =
  | ChatWsAuthEnvelope
  | ChatWsCommandEnvelope
  | ChatWsMessageEnvelope;

export interface ChatSocketClientOptions {
  url?: string;
  tokenProvider?: () => string | null;
  onStatusChange?: (status: ChatSocketStatus) => void;
  onEnvelope?: (envelope: ChatWsEnvelope | WsEnvelope<unknown>) => void;
  onChatMessage?: (message: ChatMessageDto) => void;
  onError?: (event: Event) => void;
}

const getDefaultBbunAccessToken = () => {
  return localStorage.getItem(LocalStorageKeys.BbunAccessToken);
};

export class ChatSocketClient {
  private ws: WebSocket | null = null;
  private readonly url: string;
  private readonly tokenProvider: () => string | null;
  private readonly onStatusChange?: (status: ChatSocketStatus) => void;
  private readonly onEnvelope?: (envelope: ChatWsEnvelope | WsEnvelope<unknown>) => void;
  private readonly onChatMessage?: (message: ChatMessageDto) => void;
  private readonly onError?: (event: Event) => void;

  constructor(options: ChatSocketClientOptions = {}) {
    this.url = options.url ?? getWebSocketUrl("/ws");
    this.tokenProvider = options.tokenProvider ?? getDefaultBbunAccessToken;
    this.onStatusChange = options.onStatusChange;
    this.onEnvelope = options.onEnvelope;
    this.onChatMessage = options.onChatMessage;
    this.onError = options.onError;
  }

  connect() {
    if (
      this.ws?.readyState === WebSocket.OPEN ||
      this.ws?.readyState === WebSocket.CONNECTING
    ) {
      return this.ws;
    }

    this.setStatus("connecting");
    this.ws = createWebSocket(this.url);
    this.ws.addEventListener("open", this.handleOpen);
    this.ws.addEventListener("message", this.handleMessage);
    this.ws.addEventListener("close", this.handleClose);
    this.ws.addEventListener("error", this.handleError);

    return this.ws;
  }

  disconnect() {
    this.removeListeners();
    this.ws?.close();
    this.ws = null;
    this.setStatus("closed");
  }

  send<TBody>(type: string, requestId: string, body: TBody) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("Chat WebSocket is not connected");
    }

    sendWsEnvelope(this.ws, type, requestId, body);
  }

  sendChat(message: string, requestId: string = crypto.randomUUID()) {
    this.send<WsSendChatBody>(ChatWsEventType.SendChat, requestId, {
      message,
    });

    return requestId;
  }

  editChat(messageUuid: string, message: string, requestId: string = crypto.randomUUID()) {
    this.send<WsEditChatBody>(ChatWsEventType.EditChat, requestId, {
      messageUuid,
      message,
    });

    return requestId;
  }

  deleteChat(messageUuid: string, requestId: string = crypto.randomUUID()) {
    this.send<WsDeleteChatBody>(ChatWsEventType.DeleteChat, requestId, {
      messageUuid,
    });

    return requestId;
  }

  private handleOpen = () => {
    this.setStatus("connected");
  };

  private handleMessage = (event: MessageEvent<string>) => {
    const envelope = parseWsEnvelope(event.data);

    if (envelope.type === ChatWsEventType.RequestAuthorization) {
      this.sendAuthorization(envelope.request_id);
      return;
    }

    if (
      envelope.type === ChatWsEventType.AuthorizationResponse &&
      this.isAuthorizationOk(envelope.body)
    ) {
      this.setStatus("authorized");
    }

    if (this.isChatMessageEnvelope(envelope)) {
      this.onChatMessage?.(envelope.body);
    }

    this.onEnvelope?.(envelope);
  };

  private handleClose = () => {
    this.setStatus("closed");
  };

  private handleError = (event: Event) => {
    this.setStatus("error");
    this.onError?.(event);
  };

  private sendAuthorization(requestId: string) {
    const authorization = this.tokenProvider();

    if (!authorization) {
      throw new Error("Missing bbun access token");
    }

    this.send<WsAuthorizationBody>(ChatWsEventType.Authorization, requestId, {
      authorization,
    });
  }

  private isAuthorizationOk(body: unknown) {
    return (
      typeof body === "object" &&
      body !== null &&
      "response_code" in body &&
      body.response_code === 200
    );
  }

  private isChatMessageEnvelope(
    envelope: WsEnvelope<unknown>,
  ): envelope is ChatWsMessageEnvelope {
    return (
      envelope.type === ChatWsEventType.ChatReceived ||
      envelope.type === ChatWsEventType.ChatEdited ||
      envelope.type === ChatWsEventType.ChatDeleted
    );
  }

  private setStatus(status: ChatSocketStatus) {
    this.onStatusChange?.(status);
  }

  private removeListeners() {
    this.ws?.removeEventListener("open", this.handleOpen);
    this.ws?.removeEventListener("message", this.handleMessage);
    this.ws?.removeEventListener("close", this.handleClose);
    this.ws?.removeEventListener("error", this.handleError);
  }
}
