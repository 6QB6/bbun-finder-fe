import { generateLoginURLHandler } from "../apis/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";
import LocalStorageKeys from "../types/localstorage";
import onboarding_page_skater_and_trajectory_1 from "../assets/icons/onboarding_page_skater_and_trajectory_1.svg";
import onboarding_page_trajectory_2 from "../assets/icons/onboarding_page_trajectory_2.svg";
import onboarding_page_hill from "../assets/icons/onboarding_page_hill.svg";
import onboarding_page_building from "../assets/icons/onboarding_page_building.svg";
import skating_icon_Default from "../assets/icons/skating_icon_Default.svg";
import onboarding_page_deco from "../assets/icons/onboarding_page_deco.svg";
import snowflake_1 from "../assets/icons/snowflake_1.svg";
import snowflake_2 from "../assets/icons/snowflake_2.svg";
import snowflake_3 from "../assets/icons/snowflake_3.svg";
import Button from "../components/Button";

export const Route = createFileRoute("/onboarding")({
  /* 로그인 확인(임시) */
  beforeLoad: () => {
    const isAuthenticated = localStorage.getItem(LocalStorageKeys.AccessToken);
    if (isAuthenticated) {
      throw redirect({
        to: "/",
      });
    }
  },
  component: OnboardingPage,
});

function OnboardingPage() {
  const handleLoginClick = async () => {
    try {
      await generateLoginURLHandler(location.pathname);
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("로그인 URL 생성 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="relative w-full h-full overflow-y-auto scrollbar-hide overflow-x-hidden bg-[linear-gradient(162deg,#D2E4FF,#E9E0FF)] flex flex-col justify-between items-center">
      {/* 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none w-full h-[750px]">
        <img
          className="absolute left-1/2 -translate-x-1/2 top-[46px]"
          src={onboarding_page_deco}
        />
        <img
          className="absolute left-1/2 -translate-x-1/2 ml-[130px] top-[258px] w-[68px] h-[68px]"
          src={snowflake_1}
        />
        <img
          className="absolute left-1/2 -translate-x-1/2 ml-[-116px] top-[303px] w-[46px] h-[46px]"
          src={snowflake_2}
        />
        <img
          className="absolute left-1/2 -translate-x-1/2 ml-[-116px] top-[46px] w-[67px] h-[67px]"
          src={snowflake_3}
        />
      </div>

      {/* 로고와 제목 */}
      <div className="relative z-10 flex flex-col items-center pt-[103px] shrink-0">
        <img className="pb-[18px]" src={skating_icon_Default} alt="icon" />
        <p className="whitespace-nowrap leading-[58px] text-[40px] text-[#414177] font-bold font-ria text-center">
          뻔라인스케이팅
        </p>
      </div>

      {/* 여백 */}
      <div className="h-[50px] shrink-0"></div>

      {/* 땅과 캐릭터와 버튼 */}
      <div className="relative z-10 w-full h-[525px] shrink-0">
        <div className="absolute bottom-[0px] w-full h-[302px] bg-[#E9F1FE]"></div>
        <img
          className="absolute left-[0px] bottom-[301px]"
          src={onboarding_page_hill}
          alt="hill"
        />
        <img
          className="absolute right-[-1px] bottom-[301px]"
          src={onboarding_page_building}
          alt="building"
        />
        <img
          className="absolute left-1/2 -translate-x-1/2 ml-[-10px] bottom-[172px]"
          src={onboarding_page_skater_and_trajectory_1}
          alt="skater"
        />
        <img
          className="absolute left-1/2 -translate-x-1/2 bottom-[31px]"
          src={onboarding_page_trajectory_2}
          alt="trajectory"
        />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[66px]">
          <Button label="로그인하기" onClick={handleLoginClick} />
        </div>
      </div>
    </div>
  );
}
