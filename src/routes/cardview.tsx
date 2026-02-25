import { createFileRoute, useRouter, redirect } from '@tanstack/react-router'
import { useState, useEffect } from "react";
import Button from "../components/Button";
import { getBbunUser } from "../apis/user";
import { getBbun } from "../apis/bbun";
import button_left from "../assets/icons/button_left.svg";
import button_right from "../assets/icons/button_right.svg";
import snowflake_1 from "../assets/icons/snowflake_1.svg";
import snowflake_4 from "../assets/icons/snowflake_4.svg";
import snowflake_5 from "../assets/icons/snowflake_5.svg";
import onboarding_page_deco from "../assets/icons/onboarding_page_deco.svg";
import skating_icon_Default from "../assets/icons/skating_icon_Default.svg";
import default_profile_1 from "../assets/icons/default_profile_1.png";
import default_profile_2 from "../assets/icons/default_profile_2.png";
import default_profile_3 from "../assets/icons/default_profile_3.png";
import default_profile_4 from "../assets/icons/default_profile_4.png";
import default_profile_5 from "../assets/icons/default_profile_5.png";
import go_back from "../assets/icons/go_back.svg";
import { reverseDepartmentMap } from "../types/department";
import LocalStorageKeys from "../types/localstorage";

type CardViewSearch = {
  studentId: string;
};

interface BbunCardData {
  uuid: string;
  name: string;
  studentNumber: string;
  email: string;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  consent: boolean;
  department: string | null;
  MBTI: string | null;
  instaId: string | null;
  description: string | null;
}

export const Route = createFileRoute('/cardview')({
  beforeLoad: () => {
    const isAuthenticated = localStorage.getItem(LocalStorageKeys.AccessToken);
    if (!isAuthenticated) {
      throw redirect({
        to: "/onboarding",
      });
    }
  },
  validateSearch: (search: Record<string, unknown>): CardViewSearch => {
    return {
      studentId: (search.studentId as string) || "20250000",
    };
  },
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter();
  const { studentId } = Route.useSearch();
  const [currentUserStudentId, setCurrentUserStudentId] = useState<string | null>(null);
  const [bbunList, setBbunList] = useState<BbunCardData[]>([]);

  useEffect(() => {
    getBbunUser()
      .then((data) => {
        setCurrentUserStudentId(data.studentNumber);
      })
      .catch((error) => {
        console.error("Failed to fetch current user profile:", error);
      });

    getBbun()
      .then((data) => {
        setBbunList(data.list || []);
      })
      .catch((error) => {
        console.error("Failed to fetch Bbun-line list:", error);
      });
  }, []);

  const currentIndex = bbunList.findIndex(card => card.studentNumber === studentId);
  const selectedCard = currentIndex !== -1 ? bbunList[currentIndex] : null;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < bbunList.length - 1;

  const navigateToCard = (card: BbunCardData) => {
    router.navigate({
      to: "/cardview",
      search: {
        studentId: card.studentNumber,
      },
    });
  };

  const isMine = currentUserStudentId === studentId;

  // Derived information from found card
  const name = selectedCard?.name || "";
  const major = reverseDepartmentMap[selectedCard?.department || ""] || selectedCard?.department || "???과";
  const email = selectedCard?.email || "";
  const mbti = selectedCard?.MBTI || "";
  const instagramId = selectedCard?.instaId || "";
  const centerColor = ["blue", "purple", "pink", "yellow", "green"][currentIndex % 5] || "blue";

  const imageSrcs: Record<string, string> = {
    blue: default_profile_1,
    purple: default_profile_2,
    green: default_profile_3,
    yellow: default_profile_4,
    pink: default_profile_5,
  };

  const imageSrc = imageSrcs[centerColor] || default_profile_1;

  return (
    <div className='w-full h-[100dvh] overflow-y-auto scrollbar-hide overflow-x-hidden'>
      <div className='relative min-h-[100dvh] w-full bg-blue-200 bg-[linear-gradient(162deg,#D2E4FF,#E9E0FF)] flex flex-col justify-start items-center bg-fixed'>
        {/* 배경 장식*/}
        <div>
          <img
            className="absolute left-1/2 -translate-x-1/2 ml-[95px] top-[29px] w-[35px] h-[35px]"
            src={snowflake_1}
          />
          <img
            className="absolute left-1/2 -translate-x-1/2 ml-[134px] top-[159px] w-[65px] h-[65px]"
            src={snowflake_4}
          />
          <img
            className="absolute left-1/2 -translate-x-1/2 top-[277px] w-full"
            src={onboarding_page_deco}
          />
        </div>
        {/* 콘텐츠 */}
        <div className="z-10 relative flex flex-col justify-start items-start gap-[18px] w-[315px] ml-[-5px] mt-[76px] mb-[13px]">
          <div className="flex flex-row items-center gap-[14px]">
            <img className="w-[34px] h-[30px]" src={skating_icon_Default} />
            <p className="leading-[36px] text-[25px] text-[#414177] font-bold font-ria">
              뻔라인스케이팅
            </p>
          </div>
        </div>
        <div className="flex flex-row justify-between items-center w-[326px] mt-[34px] gap-[20px]">
          <button 
            onClick={() => hasPrev && navigateToCard(bbunList[currentIndex - 1])}
            className={`transition-opacity ${!hasPrev ? "opacity-0 cursor-default" : "cursor-pointer active:scale-95"}`}
            disabled={!hasPrev}
          >
            <img src={button_left} alt="previous" className="w-[30px] h-[30px]"/>
          </button>
          
          <div className="flex flex-col items-center">
            <img src={imageSrc} alt="profile" className="w-[78px] h-[78px]"/>
            <div className="text-[25px] text-[#414177] mt-[12px] font-extrabold">{name}</div>
            <div className="whitespace-nowrap text-[14px] font-extrabold mt-[14px]">{studentId} • {major}</div>
          </div>

          <button 
            onClick={() => hasNext && navigateToCard(bbunList[currentIndex + 1])}
            className={`transition-opacity ${!hasNext ? "opacity-0 cursor-default" : "cursor-pointer active:scale-95"}`}
            disabled={!hasNext}
          >
            <img src={button_right} alt="next" className="w-[30px] h-[30px]"/>
          </button>
        </div>
        <div className="z-10 bg-[#FFFFFF]/50 w-[326px] rounded-[8px] flex flex-col px-[24px] py-[30px] mt-[54px] gap-[20px]">
          <div className="flex flex-row items-center gap-[14px] ">
            <img src={snowflake_5} alt="snowflake" className="w-[23px] h-[23px]" />
            <div className="text-[14px] font-bold">
              이메일: {email}
            </div>
          </div>
          <div className="flex flex-row items-center gap-[14px]">
            <img src={snowflake_5} alt="snowflake" className="w-[23px] h-[23px]" />
            <div className="text-[14px] font-bold">
              MBTI: {mbti}
            </div>
          </div>
          <div className="flex flex-row items-center gap-[14px]">
            <img src={snowflake_5} alt="snowflake" className="w-[23px] h-[23px]" />
            <div className="text-[14px] font-bold">
              instagram ID: {instagramId}
            </div>
          </div>
        </div>
        <div className="mt-[230px] pb-[calc(56px+env(safe-area-inset-bottom))] z-10 flex flex-row items-center justify-center gap-[17px] w-full self-center">
          {isMine ? (
            <>
              <button
                type="button"
                onClick={() => router.navigate({ to: "/" })}
                className="flex items-center justify-center w-[52px] h-[52px] cursor-pointer active:scale-95 transition-all"
              >
                <img
                  src={go_back}
                  alt="go back"
                  className="w-[50px] h-[50px]"
                />
              </button>
              <Button
                label="수정하기"
                onClick={() => router.navigate({ to: "/profile" })}
                className="w-[240px]"
              />
            </>
          ) : (
            <Button
              label="뒤로가기"
              onClick={() => router.navigate({ to: "/" })}
            />
          )}
        </div>
      </div>
    </div>
  )
}
