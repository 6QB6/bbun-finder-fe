import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getChatInfo, getChatMessages } from "../apis/chat";
import { getBbunUser } from "../apis/user";
import MessageBubble from "../components/MessageBubble";
import go_back_black from "../assets/icons/go_back_black.svg";
import SystemMessage from "../components/SystemMessage";
import send from "../assets/icons/send.svg";
import send_disabled from "../assets/icons/send_disabled.svg";
import { useChatSocket } from "../hooks/useChatSocket";
import type {
  ChatMessageDto,
  ChatRoomInfoDto,
  ChatRoomUserDto,
  UserInfo,
} from "../types/interfaces";

interface ChatMessage extends ChatMessageDto {
  id: string;
  type: "user";
  sender?: string;
  studentId: string;
  isMe: boolean;
}

interface RenderedChatMessage extends ChatMessage {
  isNewDate: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
}

const MAX_CHAT_MESSAGE_LENGTH = 255;
const INITIAL_CHAT_MESSAGE_TAKE = 30;
const CHAT_MESSAGE_PAGE_SIZE = 30;

const toChatMessage = (
  message: ChatMessageDto,
  usersByUuid: Map<string, ChatRoomUserDto>,
  currentUserUuid: string | null,
): ChatMessage => {
  const sender = usersByUuid.get(message.senderUuid);

  return {
    ...message,
    id: message.messageUuid,
    type: "user",
    sender: sender?.name,
    studentId: message.senderUuid,
    isMe: currentUserUuid === message.senderUuid,
  };
};

const mergeMessagesByUuid = (
  prevMessages: ChatMessage[],
  nextMessages: ChatMessage[],
) => {
  const messagesByUuid = new Map<string, ChatMessage>();

  [...prevMessages, ...nextMessages].forEach((message) => {
    messagesByUuid.set(message.messageUuid, message);
  });

  return Array.from(messagesByUuid.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
};

export const Route = createFileRoute("/chat")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();

  const [chatInfo, setChatInfo] = useState<ChatRoomInfoDto | null>(null);
  const [usersByUuid, setUsersByUuid] = useState<Map<string, ChatRoomUserDto>>(
    () => new Map(),
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUserUuid, setCurrentUserUuid] = useState<string | null>(null);
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const draftStorageKey = "chat_draft_default";
  const [inputText, setInputText] = useState(() => {
    return sessionStorage.getItem(draftStorageKey) || "";
  });
  const [openMenuMessageUuid, setOpenMenuMessageUuid] = useState<string | null>(
    null,
  );
  const [editingMessageUuid, setEditingMessageUuid] = useState<string | null>(
    null,
  );
  const [editingText, setEditingText] = useState("");
  const messageListRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageTakeRef = useRef(INITIAL_CHAT_MESSAGE_TAKE);
  const hasScrolledToLatestRef = useRef(false);
  const isNearBottomRef = useRef(true);
  const scrollRestoreRef = useRef<{
    scrollHeight: number;
    scrollTop: number;
  } | null>(null);

  useEffect(() => {
    const handleDocumentPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Element &&
        (target.closest("[data-chat-menu]") ||
          target.closest("[data-chat-menu-button]"))
      ) {
        return;
      }

      setOpenMenuMessageUuid(null);
    };

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
    };
  }, []);

  const upsertMessage = useCallback(
    (nextMessageDto: ChatMessageDto) => {
      const nextMessage = toChatMessage(
        nextMessageDto,
        usersByUuid,
        currentUserUuid,
      );

      setMessages((prevMessages) => {
        const targetIndex = prevMessages.findIndex(
          (message) => message.messageUuid === nextMessage.messageUuid,
        );

        if (targetIndex === -1) {
          return [...prevMessages, nextMessage];
        }

        return prevMessages.map((message, index) =>
          index === targetIndex ? nextMessage : message,
        );
      });
    },
    [currentUserUuid, usersByUuid],
  );

  const {
    status: socketStatus,
    error: socketError,
    sendChat,
    editChat,
    deleteChat,
  } = useChatSocket({
    enabled: isInitialLoaded,
    onChatMessage: upsertMessage,
  });

  useEffect(() => {
    let ignore = false;

    const loadChat = async () => {
      try {
        setErrorMessage(null);

        const info = await getChatInfo();
        if (ignore) return;

        const nextUsersByUuid = new Map(
          info.users.map((user) => [user.userUuid, user]),
        );
        setChatInfo(info);
        setUsersByUuid(nextUsersByUuid);

        const [initialMessages, userInfo] = await Promise.all([
          getChatMessages({ take: INITIAL_CHAT_MESSAGE_TAKE }),
          getBbunUser().catch(() => null),
        ]);
        if (ignore) return;

        const currentBbunUser: UserInfo | null = userInfo;
        const nextCurrentUserUuid = currentBbunUser?.uuid ?? null;

        setMessages(
          initialMessages.map((message) =>
            toChatMessage(message, nextUsersByUuid, nextCurrentUserUuid),
          ),
        );
        messageTakeRef.current = INITIAL_CHAT_MESSAGE_TAKE;
        setHasMoreMessages(initialMessages.length >= INITIAL_CHAT_MESSAGE_TAKE);
        setCurrentUserUuid(nextCurrentUserUuid);
        setIsInitialLoaded(true);
      } catch (error) {
        if (ignore) return;

        console.error("Error loading chat:", error);
        setErrorMessage("채팅 정보를 불러오지 못했습니다.");
      }
    };

    loadChat();

    return () => {
      ignore = true;
    };
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextText = e.target.value.slice(0, MAX_CHAT_MESSAGE_LENGTH);
    setInputText(nextText);

    sessionStorage.setItem(draftStorageKey, nextText);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (textareaRef.current && inputText && socketStatus === "authorized") {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;

      textarea.scrollTop = textarea.scrollHeight;
    }
  }, [socketStatus, inputText]);

  useLayoutEffect(() => {
    const messageList = messageListRef.current;
    if (!messageList || !isInitialLoaded || messages.length === 0) return;

    const scrollRestore = scrollRestoreRef.current;
    if (scrollRestore) {
      messageList.scrollTop =
        messageList.scrollHeight -
        scrollRestore.scrollHeight +
        scrollRestore.scrollTop;
      scrollRestoreRef.current = null;
      return;
    }

    if (!hasScrolledToLatestRef.current) {
      messageList.scrollTop = messageList.scrollHeight;
      hasScrolledToLatestRef.current = true;
      isNearBottomRef.current = true;
      return;
    }

    if (!isNearBottomRef.current) return;

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleMessageListScroll = useCallback(async () => {
    const messageList = messageListRef.current;
    if (!messageList) return;

    isNearBottomRef.current =
      messageList.scrollHeight -
        messageList.scrollTop -
        messageList.clientHeight <=
      80;

    if (
      messageList.scrollTop > 24 ||
      !isInitialLoaded ||
      isLoadingOlderMessages ||
      !hasMoreMessages
    ) {
      return;
    }

    setIsLoadingOlderMessages(true);
    scrollRestoreRef.current = {
      scrollHeight: messageList.scrollHeight,
      scrollTop: messageList.scrollTop,
    };

    try {
      const nextTake = messageTakeRef.current + CHAT_MESSAGE_PAGE_SIZE;
      const olderMessages = await getChatMessages({ take: nextTake });

      messageTakeRef.current = nextTake;
      setHasMoreMessages(olderMessages.length >= nextTake);
      setMessages((prevMessages) => {
        const nextMessages = olderMessages.map((message) =>
          toChatMessage(message, usersByUuid, currentUserUuid),
        );
        const mergedMessages = mergeMessagesByUuid(prevMessages, nextMessages);

        if (mergedMessages.length <= prevMessages.length) {
          setHasMoreMessages(false);
          scrollRestoreRef.current = null;
          return prevMessages;
        }

        return mergedMessages;
      });
    } catch (error) {
      console.error("Error loading older chat messages:", error);
      scrollRestoreRef.current = null;
    } finally {
      setIsLoadingOlderMessages(false);
    }
  }, [
    currentUserUuid,
    hasMoreMessages,
    isInitialLoaded,
    isLoadingOlderMessages,
    messages.length,
    usersByUuid,
  ]);

  const formatTime = (isoString: string) => {
    return new Intl.DateTimeFormat("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoString));
  };

  const formatDate = (isoString: string) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      weekday: "long",
    }).format(new Date(isoString));
  };

  const handleSendMessage = () => {
    const message = inputText.trim().slice(0, MAX_CHAT_MESSAGE_LENGTH);
    if (!message || socketStatus !== "authorized") return;

    sendChat(message);
    setInputText("");

    sessionStorage.removeItem(draftStorageKey);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleStartEditing = (message: ChatMessage) => {
    setEditingMessageUuid(message.messageUuid);
    setEditingText(message.message);
  };

  const handleEditMessage = () => {
    const message = editingText.trim().slice(0, MAX_CHAT_MESSAGE_LENGTH);
    if (!editingMessageUuid || !message || socketStatus !== "authorized")
      return;

    editChat(editingMessageUuid, message);
    setEditingMessageUuid(null);
    setEditingText("");
  };

  const handleDeleteMessage = (messageUuid: string) => {
    if (
      socketStatus !== "authorized" ||
      !window.confirm("메시지를 삭제할까요?")
    )
      return;

    deleteChat(messageUuid);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderedMessages = useMemo<RenderedChatMessage[]>(() => {
    return messages.map((msg, index) => {
      const prevMsg = messages[index - 1];
      const nextMsg = messages[index + 1];

      const prevDateString = prevMsg
        ? new Date(prevMsg.createdAt).toDateString()
        : null;
      const currentDateString = new Date(msg.createdAt).toDateString();
      const nextDateString = nextMsg
        ? new Date(nextMsg.createdAt).toDateString()
        : null;

      const isNewDate = prevDateString !== currentDateString;
      const isSameDateWithPrev = prevDateString === currentDateString;
      const isSameDateWithNext = nextDateString === currentDateString;

      const isSameTimeWithPrev =
        isSameDateWithPrev &&
        !!prevMsg &&
        formatTime(prevMsg.createdAt) === formatTime(msg.createdAt);
      const isSameTimeWithNext =
        isSameDateWithNext &&
        !!nextMsg &&
        formatTime(nextMsg.createdAt) === formatTime(msg.createdAt);

      const isSamePersonWithPrev =
        !!prevMsg &&
        prevMsg.studentId === msg.studentId &&
        prevMsg.isMe === msg.isMe;
      const isSamePersonWithNext =
        !!nextMsg &&
        nextMsg.studentId === msg.studentId &&
        nextMsg.isMe === msg.isMe;

      const isFirstInGroup = !isSamePersonWithPrev || !isSameTimeWithPrev;
      const isLastInGroup = !isSamePersonWithNext || !isSameTimeWithNext;

      return {
        ...msg,
        isNewDate,
        isFirstInGroup,
        isLastInGroup,
      };
    });
  }, [messages]);

  const canSendMessage =
    !!chatInfo && inputText.trim() !== "" && socketStatus === "authorized";
  const hasSocketError = socketStatus === "error" || !!socketError;
  const isChatInputDisabled = socketStatus !== "authorized";

  return (
    <div className="w-full h-[100dvh] flex flex-col overflow-hidden">
      <div className="relative h-full w-full bg-blue-200 bg-[linear-gradient(162deg,#D2E4FF,#E9E0FF)] flex flex-col bg-fixed">
        <div className="relative w-full bg-[#E7EEFF] drop-shadow-md flex flex-col z-10 pt-[calc(10px+env(safe-area-inset-top))]">
          <div className="relative w-full h-[57px] flex flex-row items-center justify-between pl-[30px] pr-[30px]">
            <button
              type="button"
              onClick={() => router.navigate({ to: "/" })}
              aria-label="메인 페이지로 이동"
              className="cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#414177]"
            >
              <img src={go_back_black} alt="" aria-hidden="true" />
            </button>
            <div className="leading-[25px] text-[18px] font-bold">뻔톡방</div>
            <div className="w-[10px] h-[18px]" />
          </div>
        </div>

        <div
          ref={messageListRef}
          onScroll={handleMessageListScroll}
          className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-[16px] px-[12px] py-[20px]"
        >
          {errorMessage && (
            <SystemMessage message={errorMessage} isStacked={false} />
          )}

          {isLoadingOlderMessages && (
            <SystemMessage
              message="이전 메시지를 불러오는 중입니다."
              isStacked={false}
            />
          )}

          {!errorMessage && !isInitialLoaded && (
            <SystemMessage
              message="채팅을 불러오는 중입니다."
              isStacked={false}
            />
          )}

          {!errorMessage && isInitialLoaded && hasSocketError && (
            <SystemMessage
              message="채팅 연결에 실패했습니다. 다시 접속해 주세요."
              isStacked={false}
            />
          )}

          {renderedMessages.map((msg) => (
            <Fragment key={msg.id}>
              {msg.isNewDate && (
                <SystemMessage
                  message={formatDate(msg.createdAt)}
                  isStacked={false}
                />
              )}

              <MessageBubble
                name={msg.sender ?? "알 수 없음"}
                studentId={msg.studentId}
                messageSendTime={formatTime(msg.createdAt)}
                message={msg.message}
                status={msg.status}
                isMe={msg.isMe}
                showProfile={msg.isFirstInGroup}
                showTime={msg.isLastInGroup}
                isMenuOpen={openMenuMessageUuid === msg.messageUuid}
                onMenuToggle={(open) =>
                  setOpenMenuMessageUuid(open ? msg.messageUuid : null)
                }
                isEditing={editingMessageUuid === msg.messageUuid}
                editValue={editingText}
                onEditValueChange={setEditingText}
                onEdit={() => handleStartEditing(msg)}
                onDelete={() => handleDeleteMessage(msg.messageUuid)}
                onEditSubmit={handleEditMessage}
                onEditCancel={() => {
                  setEditingMessageUuid(null);
                  setEditingText("");
                }}
              />
            </Fragment>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="relative w-full bg-[#FFFFFF] mt-auto pt-[10px] pb-[calc(10px+env(safe-area-inset-bottom))] px-[20px] flex flex-row items-center justify-center border-t border-[#EFEFEF]">
          <div className="w-full h-full flex flex-row items-center justify-between gap-[18px]">
            <div className="flex-1 bg-[#F8F8F8] rounded-[12px] px-[12px] py-[10px] flex flex-col items-center">
              <textarea
                ref={textareaRef}
                value={isChatInputDisabled ? "" : inputText}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                disabled={isChatInputDisabled}
                maxLength={MAX_CHAT_MESSAGE_LENGTH}
                placeholder={
                  hasSocketError
                    ? "채팅 연결에 실패했습니다"
                    : socketStatus === "authorized"
                      ? "메시지를 입력하세요"
                      : "채팅방에 연결 중입니다"
                }
                rows={1}
                className={`w-full bg-transparent outline-none text-[15px] resize-none max-h-[96px] overflow-y-auto scrollbar-hide leading-[24px] ${
                  isChatInputDisabled
                    ? "text-[#989898] placeholder:text-[#989898] cursor-not-allowed"
                    : "text-[#161616] placeholder:text-[#989898]"
                }`}
              />
            </div>
            <button
              type="button"
              disabled={!canSendMessage}
              onClick={handleSendMessage}
              aria-label="메시지 전송"
              className={`w-[22px] h-[22px] ${canSendMessage ? "cursor-pointer" : "cursor-default"} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#414177]`}
            >
              <img
                src={canSendMessage ? send : send_disabled}
                alt=""
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
