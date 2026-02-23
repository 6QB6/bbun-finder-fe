import { createFileRoute, useRouter, redirect } from "@tanstack/react-router";
import {
  getBbunUser,
  updateBbunUser,
  withdrawBbunUser,
} from "../apis/user";
import { useEffect, useState } from "react";
import snowflake_1 from "../assets/icons/snowflake_1.svg";
import snowflake_4 from "../assets/icons/snowflake_4.svg";
import skating_icon_Default from "../assets/icons/skating_icon_Default.svg";
import trash_icon from "../assets/icons/trash_icon_Default.svg";
import go_back from "../assets/icons/go_back.svg";
import go_back_disabled from "../assets/icons/go_back_disabled.svg";
import Button from "../components/Button";
import Input from "../components/Input";
import DropDown from "../components/DropDown";
import BusinessCard from "../components/BusinessCard";
import LocalStorageKeys from "../types/localstorage";
import LoadingModal from "../components/LoadingModal";
import { departmentMap, reverseDepartmentMap } from "../types/department";

export const Route = createFileRoute("/profile")({
  beforeLoad: () => {
    const isAuthenticated = localStorage.getItem(LocalStorageKeys.AccessToken);
    if (!isAuthenticated) {
      throw redirect({
        to: "/onboarding",
      });
    }
  },
  component: ProfilePage,
});

function ProfilePage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [major, setMajor] = useState<string | null>(null);
  const [mbti, setMbti] = useState<string | null>(null);
  const [instagramId, setInstagramId] = useState("");
  const [agreement, setAgreement] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");

  const mbtiList = [
    "ENFJ",
    "ENFP",
    "ENTJ",
    "ENTP",
    "ESFJ",
    "ESFP",
    "ESTJ",
    "ESTP",
    "INFJ",
    "INFP",
    "INTJ",
    "INTP",
    "ISFJ",
    "ISFP",
    "ISTJ",
    "ISTP",
  ];
  const majorList = [
    "전기전자컴퓨터공학과",
    "AI융합학과",
    "반도체공학과",
    "물리광과학과",
    "화학과",
    "수리과학과",
    "신소재공학과",
    "기계로봇공학과",
    "환경에너지공학과",
    "생명과학과",
    "도전탐색과정",
  ];

  useEffect(() => {
    getBbunUser()
      .then((data) => {
        setName(data.name || "");
        setStudentId(data.studentNumber || "");
        setEmail(data.email || "");
        if (data.consent) {
          setHasProfile(true);
          setMajor(
            reverseDepartmentMap[data.department] || data.department || null,
          );
          setMbti(data.MBTI || null);
          setInstagramId(data.instaId || "");
        } else {
          setHasProfile(false);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch profile:", error);
        alert("프로필 정보를 불러오는데 실패했습니다.");
      });
  }, []);

  const handleUpdateClick = async () => {
    if (!studentId.trim() || !name.trim() || !email.trim()) {
      alert("필수 항목(학번, 이름, 이메일)을 모두 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      setLoadingLabel(hasProfile ? "프로필 수정 중" : "프로필 등록 중");

      // registerBbunUser는 index.tsx에서 수행됨

      const profileData = {
        department: major ? (departmentMap[major] || major) : null,
        MBTI: mbti,
        instaId: instagramId,
        description: "",
        consent: true,
      };

      await updateBbunUser(profileData);
      if (!hasProfile) {
        setHasProfile(true);
      }
      router.navigate({ to: "/" });
    } catch (error) {
      console.error("Profile registration failed:", error);
      alert("프로필 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawClick = async () => {
    if (!confirm("정말로 탈퇴하시겠습니까? 이 행위는 되돌릴 수 없습니다. 탈퇴 후 일정 기간동안 서비스를 이용하실 수 없습니다. ")) {
      return;
    }

    try {
      await withdrawBbunUser();
      localStorage.removeItem(LocalStorageKeys.AccessToken);
      localStorage.removeItem(LocalStorageKeys.IdToken);
      localStorage.removeItem(LocalStorageKeys.BbunAccessToken);
      router.navigate({ to: "/onboarding" });
    } catch (error) {
      console.error("Withdrawal failed:", error);
      alert("회원 탈퇴에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="relative w-full h-full overflow-y-auto scrollbar-hide overflow-x-hidden">
      <div className="relative z-0 min-h-full w-full flex flex-col gap-[50px] justify-start items-center bg-[linear-gradient(#D2E4FF_0%,#FFFFFF_33%,#FFFFFF_66%,#E9E0FF_100%)]">
        <img
          className="absolute left-1/2 -translate-x-1/2 ml-[95px] top-[29px] w-[35px] h-[35px] z-[-1]"
          src={snowflake_1}
        />
        <img
          className="absolute left-[36px] bottom-[26px] w-[75px] h-[75px] z-[-1]"
          src={snowflake_4}
        />
        <div className="z-10 relative flex flex-col justify-start items-start gap-[30px] w-[315px] ml-[-5px] mt-[76px] mb-[13px]">
          <div className="flex flex-col gap-[14px]">
            <div className="flex flex-row items-center gap-[10px]">
              <img className="w-[34px] h-[30px]" src={skating_icon_Default} />
              <p className="leading-[36px] text-[25px] text-[#414177] font-bold font-ria">
                내 프로필
              </p>
            </div>
            <p className="h-[40px] text-[15px] text-[#5E5E88] font-bold">
              개인 정보 제공에 동의해야 프로필 설정을 완료하고 서비스를 이용할
              수 있습니다.
            </p>
          </div>
          <div className="flex flex-col gap-[33px]">
            <BusinessCard
              name={name}
              studentId={studentId}
              email={email}
              centerColor="blue"
              instagramId={instagramId}
              department={major}
              isPreview={true}
            />
            <div className="flex flex-col gap-[40px]">
              <div className="flex flex-col gap-[19px]">
                <Input
                  value={studentId}
                  label="학번"
                  onChange={(value) => {
                    setStudentId(value);
                  }}
                  placeholder="학번을 입력해주세요."
                  disabled={true}
                />
                <Input
                  value={name}
                  label="이름"
                  onChange={(value) => {
                    setName(value);
                  }}
                  placeholder="이름을 입력해주세요."
                  disabled={true}
                />
                <Input
                  value={email}
                  label="이메일"
                  onChange={(value) => {
                    setEmail(value);
                  }}
                  placeholder="이메일을 입력해주세요."
                  disabled={true}
                />
                <DropDown
                  value={major}
                  label="학과 (선택)"
                  onChange={(value) => {
                    setMajor(value);
                  }}
                  options={majorList}
                  placeholder="학과 선택"
                />
                <DropDown
                  value={mbti}
                  label="MBTI (선택)"
                  onChange={(value) => {
                    setMbti(value);
                  }}
                  options={mbtiList}
                  placeholder="MBTI 선택"
                />
                <Input
                  value={instagramId}
                  label="인스타그램 아이디(선택)"
                  onChange={(value) => {
                    setInstagramId(value);
                  }}
                  placeholder="인스타그램 아이디를 입력해주세요."
                  maxLength={30}
                />
              </div>

              {hasProfile ? (
                <div className="flex flex-col gap-[10px]">
                  <div className="flex flex-col gap-[6px]">
                    <div className="text-[18px] font-bold">회원 탈퇴</div>
                    <div className="text-[12px]">
                      개인 정보 동의를 철회하려면 회원 탈퇴가 필요합니다. 이
                      행위는 되돌릴 수 없습니다.
                    </div>
                  </div>

                  <button
                    onClick={handleWithdrawClick}
                    className="flex items-center gap-[8px] cursor-pointer"
                  >
                    <img src={trash_icon} className="w-[18px] h-[20px]" />
                    <span className="text-[#FF2626] text-[15px] font-bold">
                      탈퇴하기
                    </span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-[10px]">
                  <div className="flex flex-col gap-[6px]">
                    <div className="text-[18px] font-bold">
                      개인 정보 제공에 동의하십니까?
                    </div>
                    <div className="text-[12px]">
                      동의하지 않을 시 서비스 이용이 불가능합니다.
                    </div>
                  </div>

                  <label className="flex items-center gap-[8px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreement}
                      onChange={(e) => setAgreement(e.target.checked)}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <span className="text-[15px] font-bold">동의합니다.</span>
                  </label>
                </div>
              )}
            </div>
          </div>
          <div className="mt-[20px] mb-[80px] z-10 flex flex-row items-center justify-center gap-[17px] w-full self-center">
            <button
              type="button"
              onClick={() => router.navigate({ to: "/" })}
              disabled={isLoading}
              className={`flex items-center justify-center w-[52px] h-[52px] cursor-pointer active:scale-95 transition-all ${
                isLoading ? "cursor-not-allowed opacity-70" : ""
              }`}
            >
              <img
                src={isLoading ? go_back_disabled : go_back}
                alt="go back"
                className="w-[50px] h-[50px]"
              />
            </button>
            <Button
              label={hasProfile ? "수정" : "등록"}
              onClick={handleUpdateClick}
              className="w-[240px]"
              disabled={
                isLoading ||
                (hasProfile
                  ? !studentId.trim() || !name.trim() || !email.trim()
                  : !agreement ||
                    !studentId.trim() ||
                    !name.trim() ||
                    !email.trim())
              }
            />
          </div>
        </div>
      </div>
      {isLoading && <LoadingModal label={loadingLabel} />}
    </div>
  );
}
