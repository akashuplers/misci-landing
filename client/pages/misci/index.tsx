import { FloatingBalls } from "@/components/ui/Chip";
import Lottie from "lottie-react";
import React from "react";
import infinityLoop from "../../lottie/infinity-loop.json";
import { useRouter } from "next/router";

const MiSci = () => {
  const [keyword, setkeyword] = React.useState("");
  const router = useRouter();
  function handleMISCIGenerate() {
    // router.push("/misci/generate?question="keyword);
    router.push({
      pathname: "/misci/article",
      query: { question: keyword },
    });
  }
  return (
    <div
      className="relative overflow-x-hidden flex items-center justify-center flex-col w-full h-screen"
      id="misci"
    >
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
      <div className="w-[50%] p-8 min-h-[500px] relative rounded-lg shadow-xl border border-white backdrop-blur-lg flex-col justify-start items-center gap-6 inline-flex">
        <div className=" max-w-[80%] flex items-center justify-around">
          <img
            className="w-48 h-48 object-none"
            src="/misci_logo.png"
            alt="MisciLog"
          />
          <Lottie animationData={infinityLoop} className="h-24" />
          <img className="w-48 h-48" src="/misci_main.png" alt="misci_main" />
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
        <div className="w-full h-full">
          <div className="w-full h-full justify-center items-center gap-2.5 inline-flex flex-col ">
            <div
              className={`relative w-full min-h-[60px] bg-white roundedbg-opacity-25 rounded-lg shadow border border-indigo-600 backdrop-blur-lg justify-start items-center gap-3 inline-flex border py-2.5 `}
            >
              <div
                className={`flex items-center flex-col md:flex-row px-2  gap-2.5 relative outline-none active:outline-none rounded-lg`}
              >
                <KeywordInput
                  keyword={keyword}
                  setKeyword={setkeyword}
                  placeholder={"Ask me a question"}
                  maxLength={100}
                />
              </div>
            </div>
            <button
              disabled={keyword.length < 1}
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
    </div>
  );
};

export default MiSci;

type KeywordInputProps = {
  maxLength: number;
  placeholder: string;
  keyword: string;
  setKeyword: React.Dispatch<React.SetStateAction<string>>;
};

const KeywordInput = ({
  maxLength,
  placeholder,
  keyword,
  setKeyword,
}: KeywordInputProps) => {
  return (
    <input
      type="text"
      maxLength={maxLength}
      placeholder={placeholder}
      className="w-full h-full outline-transparent bg-transparent border-transparent focus:border-transparent focus:ring-0"
      value={keyword}
      onChange={(e) => {
        const text = e.target.value;
        console.log(text.length);
        setKeyword(text);
      }}
    />
  );
};
