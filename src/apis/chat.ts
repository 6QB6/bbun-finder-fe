import api from "./interceptor";
import type { ChatMessageDto, ChatRoomInfoDto } from "../types/interfaces";

export interface GetChatMessagesParams {
  take?: number;
}

export interface SearchChatMessagesParams {
  keyword: string;
  take?: number;
}

export interface BlockChatUserRequest {
  targetUserUuid: string;
}

export const getChatInfo = async () => {
  return api.get<ChatRoomInfoDto>("/chat/info").then(({ data }) => data);
};

export const getChatMessages = async ({ take = 30 }: GetChatMessagesParams = {}) => {
  return api
    .get<ChatMessageDto[]>("/chat/messages", {
      params: { take },
    })
    .then(({ data }) => data);
};

export const searchChatMessages = async ({ keyword, take = 30 }: SearchChatMessagesParams) => {
  return api
    .get<ChatMessageDto[]>("/chat/messages/search", {
      params: { keyword, take },
    })
    .then(({ data }) => data);
};

export const blockChatUser = async (targetUserUuid: string) => {
  return api
    .post<void>("/chat/block", {
      targetUserUuid,
    } satisfies BlockChatUserRequest)
    .then(({ data }) => data);
};

export const unblockChatUser = async (targetUserUuid: string) => {
  return api
    .post<void>("/chat/unblock", {
      targetUserUuid,
    } satisfies BlockChatUserRequest)
    .then(({ data }) => data);
};
