import dayjs from "dayjs";

export type ChatMessageStatus = 'ACTIVE' | 'EDITED' | 'DELETED';

export interface UserInfo {
  uuid: string;
  name: string;
  email: string;
  createdAt: dayjs.Dayjs | string;
}

export interface ProfileData {
    department?: string | null;
    MBTI?: string | null;
    instaId?: string | null;
    description?: string | null;
    consent?: boolean;
}

export interface ChatRoomUserDto {
  userUuid: string;
  name: string;
  profileImageUrl: string | null;
}

export interface ChatRoomInfoDto {
  roomUuid: string;
  lineKey: string;
  users: ChatRoomUserDto[];
}

export interface ChatMessageDto {
  messageUuid: string;
  roomUuid: string;
  senderUuid: string;
  message: string;
  status: ChatMessageStatus;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
}

export interface WsEnvelope<TBody> {
  type: string;
  request_id: string;
  body: TBody;
}

export interface WsOkResponseBody {
  response_code: 200;
  result: 'OK';
}

export interface WsErrorResponseBody {
  response_code: number;
  result: string;
}