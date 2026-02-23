import clsx from "clsx";
import default_profile_1 from "../assets/icons/default_profile_1.png";
import default_profile_2 from "../assets/icons/default_profile_2.png";
import default_profile_3 from "../assets/icons/default_profile_3.png";
import default_profile_4 from "../assets/icons/default_profile_4.png";
import default_profile_5 from "../assets/icons/default_profile_5.png";
import skating_icon_1 from "../assets/icons/skating_icon_1.svg";
import skating_icon_2 from "../assets/icons/skating_icon_2.svg";
import skating_icon_3 from "../assets/icons/skating_icon_3.svg";
import skating_icon_4 from "../assets/icons/skating_icon_4.svg";
import skating_icon_5 from "../assets/icons/skating_icon_5.svg";
import card_effect from "../assets/icons/card_effect.png";

interface BusinessCardProps {
  name: string;
  studentId: string;
  email: string;
  centerColor: string;
  instagramId: string | null;
  department: string | null;
  isPreview?: boolean;
  onClick?: () => void;
}
export default function BusinessCard({
  name,
  studentId,
  email,
  centerColor,
  instagramId,
  department,
  isPreview,
  onClick,
}: BusinessCardProps) {
  const imageSrcs: Record<string, string> = {
    blue: default_profile_1,
    purple: default_profile_2,
    green: default_profile_3,
    yellow: default_profile_4,
    pink: default_profile_5,
    non: default_profile_1,
  };

  const skatingIconSrcs: Record<string, string> = {
    blue: skating_icon_1,
    purple: skating_icon_2,
    green: skating_icon_3,
    yellow: skating_icon_4,
    pink: skating_icon_5,
    non: skating_icon_1,
  };

  const borderGradients: Record<string, string> = {
    blue: "bg-[linear-gradient(157deg,#CBBAFFB3_0%,#8AB1FF66_34%,#4CA4FB66_63%,#0059D799_100%)]",
    purple:
      "bg-[linear-gradient(157deg,#BF97FFB3_0%,#C876FF66_34%,#F2A6FF66_63%,#F27DFF99_100%)]",
    green:
      "bg-[linear-gradient(157deg,#71C97BB3_0%,#A2D2A266_34%,#97C7C566_63%,#6DD0C399_100%)]",
    yellow:
      "bg-[linear-gradient(143deg,#E3DB87B3_21%,#EEC17A80_39%,#EAC28E80_59%,#E4D67C99_79%)]",
    pink: "bg-[linear-gradient(143deg,#FCBBCEB3_21%,#EE7AAE80_39%,#EA8EDF80_59%,#C2628499_79%)]",
    non: "bg-[linear-gradient(157deg,#CBBAFFB3_0%,#8AB1FF66_34%,#4CA4FB66_63%,#0059D799_100%)]",
  };

  const innerGradients: Record<string, string> = {
    blue: "bg-[linear-gradient(157deg,#E6C4F8_2%,#B4DBF2_92%)]",
    purple: "bg-[linear-gradient(136deg,#D6A7FF_28%,#FFC8F7_85%)]",
    green: "bg-[linear-gradient(170deg,#A8D7B7_5%,#97B5B5_91%)]",
    yellow: "bg-[linear-gradient(170deg,#E2D6A3_5%,#DCBDA3_91%)]",
    pink: "bg-[linear-gradient(160deg,#E2A3D5_5%,#EA91AC_91%)]",
    non: "bg-[linear-gradient(157deg,#E6C4F8_2%,#B4DBF2_92%)]",
  };

  const borderStyle = borderGradients[centerColor] || borderGradients["blue"];
  const innerStyle = innerGradients[centerColor] || innerGradients["blue"];
  const imageSrc = imageSrcs[centerColor] || imageSrcs["blue"];
  const skatingIconSrc =
    skatingIconSrcs[centerColor] || skatingIconSrcs["blue"];
  const isNonCard = centerColor === "non";
  const isPreviewCard = isPreview === true;

  return (
    <button
      onClick={onClick}
      disabled={!onClick || isPreviewCard}
      className={clsx(
        "relative w-[324px] h-[140px] text-left transition-all",
        onClick && !isPreviewCard && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        !onClick && "cursor-default"
      )}
    >
      <div
        className={clsx(
          "absolute inset-0 rounded-[12px] p-[2px] pointer-events-none",
          borderStyle,
        )}
        style={{
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
        }}
      />

      <div className="absolute inset-[2px] rounded-[10px] overflow-hidden backdrop-blur-[20px]">
        <div className={clsx("absolute inset-0 opacity-20", innerStyle)} />

        <div className="absolute inset-0 bg-[linear-gradient(120deg,#FFFFFF4D_0%,#FFFFFF1A_85%)]" />

        <img
          src={card_effect}
          alt="effect"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* 카드 콘텐츠 */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {isNonCard ? (
            <div className="relative flex justify-center items-center w-[269px] h-[101px]">
              <img
                className="absolute top-[3px] right-[0px]"
                src={skatingIconSrc}
                alt="icon"
              />
              <span className="text-[60px] font-bold text-[#8181814D]">?</span>
            </div>
          ) : (
            <div className="relative flex flex-col justify-start items-start gap-[18px] w-[269px] h-[101px]">
              <img
                className="absolute top-[3px] right-[0px]"
                src={skatingIconSrc}
              />
              <div className="flex flex-col justify-start items-start gap-[8px]">
                <div className="flex flex-row justify-start items-center gap-[8px]">
                  <img className="w-[26px] h-[26px]" src={imageSrc} />
                  <p className="leading-[18px] text-[16px] font-bold">{name}</p>
                </div>
                <div className="flex flex-col justify-start items-start gap-[6px]">
                  <p className="leading-[15px] text-[14px] font-bold">
                    {studentId}
                  </p>
                  <p className="leading-[14px] text-[13px]">{email}</p>
                </div>
              </div>
              <div className="w-full flex flex-row justify-between items-start gap-2">
                <p className="leading-[14px] text-[13px] break-all">{instagramId ?? ""}</p>
                <p className="leading-[14px] text-[13px] whitespace-nowrap shrink-0">{department ?? ""}</p>
              </div>
            </div>
          )}

          {isPreviewCard && (
            <div className="absolute inset-0 z-20 flex justify-center items-center pointer-events-none">
              <p className="text-[23px] text-[#8181814D] font-bold">
                카드 미리보기
              </p>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
