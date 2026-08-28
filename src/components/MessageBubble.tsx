import default_profile_1 from "../assets/icons/default_profile_1.png";
import default_profile_2 from "../assets/icons/default_profile_2.png";
import default_profile_3 from "../assets/icons/default_profile_3.png";
import default_profile_4 from "../assets/icons/default_profile_4.png";
import default_profile_5 from "../assets/icons/default_profile_5.png";
import { useState } from "react";
import { createPortal } from "react-dom";

interface MessageBubbleProps {
  name: string;
  studentId: string;
  messageSendTime: string;
  message: string;
  status: "ACTIVE" | "EDITED" | "DELETED";
  isMe: boolean;
  showProfile: boolean;
  showTime: boolean;
  isMenuOpen?: boolean;
  onMenuToggle?: (open: boolean) => void;
  isEditing?: boolean;
  editValue?: string;
  onEditValueChange?: (value: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onEditSubmit?: () => void;
  onEditCancel?: () => void;
}

export default function MessageBubble({
  name,
  studentId,
  messageSendTime,
  message,
  status,
  isMe,
  showProfile,
  showTime,
  isMenuOpen = false,
  onMenuToggle,
  isEditing = false,
  editValue = "",
  onEditValueChange,
  onEdit,
  onDelete,
  onEditSubmit,
  onEditCancel,
}: MessageBubbleProps) {
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const parsedYear = Number.parseInt(studentId.slice(0, 4), 10);
  const profileIndex = Number.isFinite(parsedYear) ? parsedYear % 5 : 0;
  const profileSrcs: Record<number, string> = {
    0: default_profile_1,
    1: default_profile_2,
    2: default_profile_3,
    3: default_profile_4,
    4: default_profile_5,
  };
  const isDeleted = status === "DELETED";
  const displayedMessage = isDeleted ? "삭제된 메시지입니다." : message;

  const handleMenuToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isMenuOpen) {
      onMenuToggle?.(false);
      return;
    }

    const buttonRect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 72;
    const menuHeight = 76;
    const gap = 4;
    const left = Math.min(
      Math.max(8, buttonRect.right - menuWidth),
      window.innerWidth - menuWidth - 8,
    );
    const top =
      buttonRect.bottom + menuHeight + gap <= window.innerHeight
        ? buttonRect.bottom + gap
        : Math.max(8, buttonRect.top - menuHeight - gap);

    setMenuPosition({ top, left });
    onMenuToggle?.(true);
  };

  const menu = isMenuOpen && (
    <div
      className="fixed z-[100] flex min-w-[72px] flex-col overflow-hidden rounded-[8px] bg-white py-[4px] shadow-lg ring-1 ring-black/10"
      style={{ top: menuPosition.top, left: menuPosition.left }}
      data-chat-menu="true"
    >
      <button
        type="button"
        onClick={() => {
          onMenuToggle?.(false);
          onEdit?.();
        }}
        className="px-[12px] py-[7px] text-left text-[12px] text-[#282828] hover:bg-[#F4F4F8]"
      >
        수정
      </button>
      <button
        type="button"
        onClick={() => {
          onMenuToggle?.(false);
          onDelete?.();
        }}
        className="px-[12px] py-[7px] text-left text-[12px] text-[#D14B4B] hover:bg-[#FFF2F2]"
      >
        삭제
      </button>
    </div>
  );

  return (
    <>
      <div
        className={`flex w-full ${isMe ? "justify-end" : ""} ${!showProfile ? "-mt-[12px]" : ""}`}
      >
        {isMe ? (
          /* 내가 보낸 메시지 */
          <div className="flex w-full justify-end">
            <div className="flex max-w-[75%] items-end justify-end gap-[6px]">
              <div className="flex flex-col items-end flex-none">
                {!isEditing && isMe && !isDeleted && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={handleMenuToggle}
                      data-chat-menu-button="true"
                      aria-label="메시지 메뉴 열기"
                      aria-expanded={isMenuOpen}
                      className="flex h-[28px] w-[20px] items-center justify-center rounded-full text-[20px] leading-none text-[#555577] hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#414177]"
                    >
                      <span aria-hidden="true">⋯</span>
                    </button>
                  </div>
                )}
                {showTime && (
                  <p className="text-[#989898] text-[10px] whitespace-nowrap mb-[2px]">
                    {messageSendTime}
                  </p>
                )}
              </div>

              {isEditing ? (
                <div className="max-w-[60%] flex flex-col gap-[6px]">
                  <textarea
                    value={editValue}
                    onChange={(event) =>
                      onEditValueChange?.(event.target.value.slice(0, 255))
                    }
                    maxLength={255}
                    rows={2}
                    autoFocus
                    className="w-full min-w-[160px] rounded-[12px] border border-[#414177] bg-white px-[12px] py-[8px] text-[14px] text-[#282828] outline-none resize-none"
                  />
                  <div className="flex justify-end gap-[8px] text-[11px]">
                    <button
                      type="button"
                      onClick={onEditCancel}
                      className="text-[#777]"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={onEditSubmit}
                      className="font-bold text-[#414177]"
                    >
                      저장
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`w-fit max-w-[80%] rounded-tl-[20px] rounded-tr-[3px] rounded-bl-[20px] rounded-br-[20px] pl-[15px] pr-[18px] py-[10px] ${isDeleted ? "bg-[#8A8AA8]" : "bg-[#414177]"}`}
                >
                  <p className="text-[14px] text-[#FFFFFF] break-all leading-relaxed whitespace-pre-line">
                    {displayedMessage}
                    {status === "EDITED" && (
                      <span className="ml-[4px] text-[10px] text-[#D8D8EA]">
                        (수정됨)
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 상대방이 보낸 메시지 */
          <div className="flex w-full justify-start">
            <div className="flex max-w items-end gap-[10px]">
              <div className="flex-shrink-0 w-[40px] self-start">
                {showProfile && (
                  <img
                    className="w-[40px] h-[40px] object-cover flex-shrink-0"
                    src={profileSrcs[profileIndex % 5]}
                    alt={`${name || "사용자"} 프로필 이미지`}
                  />
                )}
              </div>

              <div className="flex min-w-0 max-w-[60%] flex-col">
                {showProfile && (
                  <p className="mb-[6px] text-[#282828] font-bold text-[14px]">
                    {name}
                  </p>
                )}
                <div
                  className={`rounded-tl-[3px] rounded-tr-[20px] rounded-bl-[20px] rounded-br-[20px] pl-[15px] pr-[18px] py-[10px] ${isDeleted ? "bg-[#D8D8D8]" : "bg-[#EFEFEF]"}`}
                >
                  <p className="text-[14px] text-[#282828] break-all leading-relaxed whitespace-pre-line">
                    {displayedMessage}
                    {status === "EDITED" && (
                      <span className="ml-[4px] text-[10px] text-[#989898]">
                        (수정됨)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex-none">
                {showTime && (
                  <p className="text-[#989898] text-[10px] whitespace-nowrap mb-[2px]">
                    {messageSendTime}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {isMe && !isDeleted && createPortal(menu, document.body)}
    </>
  );
}
