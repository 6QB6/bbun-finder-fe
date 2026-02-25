import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useNavigate, redirect } from "@tanstack/react-router";
import { oAuthGetToken, bbunLogin } from "../apis/auth";
import { registerBbunUser, getBbunUser } from "../apis/user";
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
import LoadingModal from "../components/LoadingModal";
import { generateLoginURLHandler } from "../apis/auth";

type AuthStatus = "loading" | "success" | "failed" | "signup";

export const Route = createFileRoute("/auth")({
  beforeLoad: () => {
    const urlParams = new URLSearchParams(window.location.search);
    const state = urlParams.get("state");
    const code = urlParams.get("code");

    if (!state || !code) {
      throw redirect({
        to: "/onboarding",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { authStatus, errorMessage } = useOAuthSequence();

  useEffect(() => {
    if (authStatus === "success") {
      const savedReturnTo = localStorage.getItem(LocalStorageKeys.ReturnTo);
      localStorage.removeItem(LocalStorageKeys.ReturnTo);
      if (savedReturnTo) {
        navigate({ to: savedReturnTo });
      } else {
        navigate({ to: "/" });
      }
    } else if (authStatus === "signup") {
      navigate({ to: "/" });
    }
  }, [authStatus, navigate]);

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
      <div className="relative z-10 flex flex-col items-center pt-[95px] shrink-0">
        <img className="pb-[18px]" src={skating_icon_Default} alt="icon" />
        <p className="w-[292px] leading-[58px] text-[40px] text-[#414177] font-bold font-ria text-center">
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

      {/* Modal */}
      {authStatus === "loading" && <LoadingModal label="로그인 중" />}
      {authStatus === "failed" && errorMessage && (
        <div className="text-red-500">{errorMessage}</div>
      )}
    </div>
  );
}

const useOAuthSequence = () => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const performOAuthSequence = async () => {
      try {
        const result = await oauthSequence();
        if (result.isSuccessful) {
          setAuthStatus("success");
        } else if (result.needsSignup) {
          setAuthStatus("signup");
        } else {
          setAuthStatus("failed");
        }
        if (result.errorMessage) {
          setErrorMessage(result.errorMessage);
        }
      } catch (error) {
        console.error("OAuth sequence failed:", error);
        setAuthStatus("failed");
        setErrorMessage("Unknown error");
      }
    };

    performOAuthSequence();
  }, []);

  return {
    authStatus,
    errorMessage,
  };
};

interface OAuthSequenceResult {
  isSuccessful: boolean;
  errorMessage?: string;
  needsSignup?: boolean;
}

const oauthSequence = async (): Promise<OAuthSequenceResult> => {
  const cleanupOAuthState = () => {
    localStorage.removeItem(LocalStorageKeys.OAuthState);
    localStorage.removeItem(LocalStorageKeys.CodeVerifier);
    localStorage.removeItem(LocalStorageKeys.OAuthNonce);
  };

  const urlParams = new URLSearchParams(window.location.search);
  const localState = localStorage.getItem(LocalStorageKeys.OAuthState);
  const state = urlParams.get("state");
  if (!state) {
    return {
      isSuccessful: false,
      errorMessage: "There is no state from OAuth",
    };
  } else if (localState !== state) {
    return {
      isSuccessful: false,
      errorMessage: "State mismatch",
    };
  }
  const code = urlParams.get("code");
  if (!code) {
    return {
      isSuccessful: false,
      errorMessage: "Missing OAuth Code",
    };
  }

  try {
    const currentURL = new URL(window.location.href);
    const tokenResponse = await oAuthGetToken(state, currentURL);

    if (!tokenResponse) {
      cleanupOAuthState();
      return {
        isSuccessful: false,
        errorMessage: "Missing TokenResponse",
      };
    }
    cleanupOAuthState();
    localStorage.setItem(
      LocalStorageKeys.AccessToken,
      tokenResponse.access_token,
    );
    if (tokenResponse.id_token) {
      localStorage.setItem(LocalStorageKeys.IdToken, tokenResponse.id_token);
        try {
          const { access_token } = await bbunLogin(); 
          localStorage.setItem(LocalStorageKeys.BbunAccessToken, access_token);
          
          const userData = await getBbunUser();
          if (userData.consent) {
            return {
              isSuccessful: true,
            };
          } else {
            return {
              isSuccessful: false,
              needsSignup: true,
            };
          }
        } catch (err: any) {
          if (err.response && (err.response.status === 401 || err.response.status === 404)) {
            try {
              await registerBbunUser();
              const { access_token } = await bbunLogin();
              localStorage.setItem(LocalStorageKeys.BbunAccessToken, access_token);
              
              return {
                isSuccessful: true,
                needsSignup: true,
              };
            } catch (regErr) {
              console.error("Auto registration failed:", regErr);
              return {
                isSuccessful: false,
                needsSignup: true,
              };
            }
          }
          throw err;
        }
    } else {
      return {
        isSuccessful: false,
        errorMessage: "Missing ID Token",
      };
    }
  } catch (error) {
    console.error(error);
    cleanupOAuthState();
    return {
      isSuccessful: false,
      errorMessage: "Unknown error",
    };
  }
};
