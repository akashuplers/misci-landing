import { FloatingBalls } from "@/components/ui/Chip";
import Lottie from "lottie-react";
import React, { useEffect, useState } from "react";
import infinityLoop from "../../lottie/infinity-loop.json";
import { useRouter } from "next/router";
import { useGenerateErrorState } from "@/store/appState";
import { useSubscription } from "@apollo/client";
import { StepCompleteData } from "@/store/types";
import { STEP_COMPLETES_SUBSCRIPTION } from "@/graphql/subscription/generate";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  countInitialWhiteSpace,
  isOnlySpecialChars,
  validateIfTextIncludesSpecialCharsExcludingQuestionMark,
} from "@/store/appHelpers";
import ErrorBase from "@/store/errors";
import Image from "next/image";

const MiSci = () => {
  
  const [keyword, setkeyword] = useState("");
  const [getUserIdForSubs, setGetUserIdForSubs] = useState<string | null>("");
  const [getTempIdForSubs, setGetTempIdForSubs] = useState<string | null>("");
  const [getTokenForSubs, setGetTokenForSubs] = useState<string | null>("");
  const [userAbleUserIDForSubs, setUserAbleUserIDForSubs] = useState<
    string | null
  >("");
  const { addMessages } = useGenerateErrorState();
  const [getToken, setGetToken] = useState<string | null>("");
  const [inputError, setInputError] = useState<{
    error: boolean;
    message: string;
  }>({
    error: false,
    message: "",
  });
  // const {
  //   data: subsData,
  //   loading: subsLoading,
  //   error: subsError,
  // } = useSubscription<StepCompleteData>(STEP_COMPLETES_SUBSCRIPTION, {
  //   variables: { userId: userAbleUserIDForSubs },
  // });
  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     const tokenFromLocalStorage = localStorage.getItem("token");
  //     const userIdFromLocalStorage = localStorage.getItem("userId");
  //     const tempIdFromLocalStorage = localStorage.getItem("tempId");
  //     setGetTokenForSubs(tokenFromLocalStorage);
  //     setGetToken(tokenFromLocalStorage);
  //     setGetUserIdForSubs(userIdFromLocalStorage);
  //     setGetTempIdForSubs(tempIdFromLocalStorage);
  //     const userAbleUserID = tokenFromLocalStorage
  //       ? userIdFromLocalStorage
  //       : tempIdFromLocalStorage;
  //     setUserAbleUserIDForSubs(tempIdFromLocalStorage);
  //     console.log(
  //       getUserIdForSubs,
  //       getTempIdForSubs,
  //       getTokenForSubs,
  //       userAbleUserIDForSubs,
  //       "FROM USER"
  //     );
  //   }
  // }, [subsError]);

  const router = useRouter();
  function handleMISCIGenerate() {
    // router.push("/misci/generate?question="keyword);
    router.push({
      pathname: "/misci/article",
      query: { question: keyword },
    });
  }
  console.log(countInitialWhiteSpace(keyword));

  return (
    <div
      className="relative overflow-x-hidden flex items-center justify-center flex-col w-full h-screen overflow-y-hidden overscroll-y-none"
      id="misci"
    >
      <ToastContainer />
      <FloatingBalls className="absolute top-[40%] left-[2%]" />
      <FloatingBalls className="absolute top-[70%] left-[10%]" />
      <FloatingBalls className="absolute top-[10%] right-[2%]" />
      <FloatingBalls className="absolute top-[50%] right-[10%]" />
      <div
        style={{
          width: 1285.42,
          height: "100%",
          transform: "rotate(-340deg)",
          position: "absolute",
          top: "-26%",
          right: "-10%",
          background:
            "linear-gradient(255deg, #EAF2FE 0%, #F3F6FB 60%, rgba(251, 247.32, 243, 0) 100%)",
          objectFit: "cover",
          objectPosition: "center center",
          zIndex: -1,
        }}
      />
      <div
        style={{
          width: 1214.42,
          height: 1093.78,
          position: "absolute",
          top: "-10%",
          left: "-10%",
          transform: "rotate(-160deg)",
          background:
            "linear-gradient(255deg, #E2EFFF 28.8%, #F3F6FB 57.32%, rgba(251, 247, 243, 0.00) 76.42%)",
          objectFit: "cover",
          objectPosition: "center center",
          zIndex: -1,
        }}
      />
      <div className="md:w-[50%] md:min-w-[550px] w-full p-8 min-h-[500px] h-full md:h-auto justify-center relative rounded-lg shadow-xl border border-white backdrop-blur-lg flex-col justify-start items-center gap-6 inline-flex">
        <div className="max-w-[80%] mb-6 flex items-center justify-around flex-col md:flex-row">
          <span className="w-[8rem] min-w-[8rem] relative flex items-center justify-center">
            <img
              className="h-full w-full"
              style={{
                mixBlendMode: "color-burn",
                objectFit: 'cover'
              }}
              src="/miscinew.png"
              alt="MisciLog"
            />
          </span>
          <Lottie animationData={infinityLoop} className="w-[5rem] min-w-[5rem]" />
          <span className="w-[9rem] min-w-[9rem]" >
            <img 
              className="h-[60px] w-full"
              style={{
                mixBlendMode: "color-burn",
                objectFit: 'cover'
              }}
              src="/misci_main.png" 
              alt="misci_main" 
            />
          </span>
        </div>
        <div
          style={{
            width: 91.19,
            height: 91.19,
            transformOrigin: "0 0",
            position: "absolute",
            background: "linear-gradient(180deg, #40AFFF 0%, #FA19A4 100%)",
            fill: "linear-gradient(180deg, #40AFFF 0%, #FA19A4 138.46%)",
            filter: "blur(65px) drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))",
          }}
          className="rounded-full shadow-lg top-[80%] left-[0%]"
        />{" "}
        <div
          style={{
            width: 91.19,
            height: 91.19,
            transformOrigin: "0 0",
            position: "absolute",
            background: "linear-gradient(180deg, #40AFFF 0%, #FA19A4 100%)",
            fill: "linear-gradient(180deg, #40AFFF 0%, #FA19A4 138.46%)",
            filter: "blur(65px) drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))",
          }}
          className="rounded-full shadow-lg right-0 top-[20%]"
        />
        <div className="w-full relative ">
          <div className="w-full  justify-start items-center gap-2.5 inline-flex flex-col ">
            <div
              className={`relative w-full min-h-[60px] bg-white bg-opacity-25 rounded-lg shadow border border-indigo-600 backdrop-blur-lg justify-start items-center gap-3 inline-flex border py-2.5 `}
            >
              <div
                className={`flex items-center w-full flex-col md:flex-row px-2  gap-2.5 relative outline-none active:outline-none rounded-lg`}
              >
                <KeywordInput
                  keyword={keyword}
                  setKeyword={setkeyword}
                  placeholder={"Ask me a question"}
                  maxLength={200}
                  setInputError={setInputError}
                />
              </div>

              {/* show errors */}
            </div>
            <span className="text-red-500 text-base font-light leading-7 place-self-start text-left">
              {inputError.message }
            </span>

            <button
              disabled={
                countInitialWhiteSpace(keyword) > 1 ||
                inputError.error ||
                keyword.trim().length < 1
              }
              className="h-14 px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg shadow justify-center items-center gap-2.5 inline-flex hover:from-indigo-700 hover:to-violet-700 focus:shadow-outline-indigo disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                handleMISCIGenerate();
              }}
            >
              <>
                <span className="text-white text-base font-medium leading-7">
                  Submit
                </span>
              </>
            </button>
          </div>
        </div>

      </div>

      {/* misci download button */}
      <div className="h-[45px] w-[53px] md:h-[55px] md:w-[75px] absolute top-6 md:top-6 right-4 md:right-8 cursor-pointer rounded-lg">
        <Image
          src="/misci-download-btn.png"
          alt="misci-download-btn"
          height={150}
          width={150}
        />
      </div>

      {/* faq button */}
      <div className="h-[45px] w-[53px] md:h-[55px] md:w-[90px] md:[h-90px] absolute bottom-6 md:bottom-20 right-2 md:right-5 cursor-pointer border rounded-lg">
        <Image
          src="/faq.png"
          alt="faq-image"
          height={150}
          width={150}
          onClick={() => router.push('/misci/faq')}
        />
      </div>
    </div>
  );
};

export default MiSci;

type KeywordInputProps = {
  maxLength: number;
  placeholder: string;
  keyword: string;
  setKeyword: React.Dispatch<React.SetStateAction<string>>;
  setInputError: React.Dispatch<
    React.SetStateAction<{
      error: boolean;
      message: string;
    }>
  >;
};

const KeywordInput = ({
  maxLength,
  placeholder,
  keyword,
  setKeyword,
  setInputError,
}: KeywordInputProps) => {
  const router = useRouter();
  return (
    <input
      type="text"
      maxLength={maxLength}
      placeholder={placeholder}
      className="w-full h-full outline-transparent bg-transparent border-transparent focus:border-transparent focus:ring-0 border border-red-500"
      value={keyword}
      onChange={(e) => {
        const text = e.target.value;
        const isTextNotValid =
          validateIfTextIncludesSpecialCharsExcludingQuestionMark(text);
        console.log(text.length);
        // if incldus spaces show error
        var spce = /^s*$/;

        var errors = []
        if (isOnlySpecialChars(text) == true) {
          errors.push({ error: true, message: ErrorBase.specialCharactersOnly })
        }
        if (countInitialWhiteSpace(text) > 1) {
          errors.push({ error: true, message: ErrorBase.whiteSpaces});
        } 
        if (isTextNotValid == true) {
        } else {
          setInputError({
            error: false,
            message: "",
          });
        }

        if (text.length > 199) {
          errors.push({ error: true, message: "Please remove extra characters" });
        } else {
          errors.push({ error: false, message: "" });
        }
        if(errors.length>0){
          setInputError(errors[0]);  
        }

        setKeyword(text);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          router.push({
            pathname: "/misci/article",
            query: { question: keyword },
          });
        }
      }}
    />
  );
};
