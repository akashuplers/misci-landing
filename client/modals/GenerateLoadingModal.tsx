import { getMax } from "@/store/appHelpers";
import { StepType } from "@/store/types";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import Typewriter from "typewriter-effect";

interface GenerateLoadingModalProps {
  showGenerateLoadingModal: boolean;
  setShowGenerateLoadingModal: (showGenerateLoadingModal: boolean) => void;
  stepStatus: StepType;
  resetForm: () => void;
  type: string;
  showBackButton: boolean;
}

function getPercentageByStep(step: StepType, type: string): { percent: number, message: string, maxPercent: number } {

let message = "Creating draft from URLs requires Lille's advanced generation, which could take more than a minute.";

  if (type === "FILE") {
    message = "Creating draft from Your files requires Lille's advanced generation, which could take more than a minute.";
  } else if (type === "WEB") {
    message = "Creating your draft.";
  }
  switch (step) {
    case "KEYWORD_COMPLETED":
      return {
        percent: 19, message: `Creating draft from URLs requires our AI's advanced generation,
      which could take more than a minute.`, maxPercent: 45
      };
    case "URL_UPLOAD_COMPLETED":
      return { percent: 53, message: `File are scanned successfully.`, maxPercent: 70 }
    case "FILE_UPLOAD_COMPLETED":
      return { percent: 53, message: `File are scanned successfully.`, maxPercent: 70 }
    case "CHAT_GPT_COMPLETED":
      return { percent: 80, message: `Lille is trying to find best drafts`, maxPercent: 90 }
    case "BACKLINK_COMPLETED":
      return { percent: 100, message: `Backlinks are running.`, maxPercent: 100 }
    default:
      return { percent: 0, message, maxPercent: 15 }
  }
}
const updatePercentage = (currentPercentage: number, maxPercentage: number) => {
  return Math.min(currentPercentage + 1, maxPercentage);
};

const GenerateLoadingModal = ({
  showGenerateLoadingModal,
  stepStatus,
  setShowGenerateLoadingModal,
  resetForm,
  type,
  showBackButton
}: GenerateLoadingModalProps) => {
  console.log(
    showGenerateLoadingModal,
    stepStatus,
    type,
    setShowGenerateLoadingModal
  );
  const [percentage, setPercentage] = useState<{ percent: number, message: string }>(getPercentageByStep(stepStatus, type));
  const nativePercentage = getPercentageByStep(stepStatus, type);
  console.log(type, 'PERCENTAGE');

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('running interval', percentage.percent, nativePercentage.maxPercent)
      if (percentage.percent < nativePercentage.maxPercent) {
        setPercentage((prev) => ({
          ...prev,
          percent: updatePercentage(getMax(prev.percent, nativePercentage.percent), nativePercentage.maxPercent)
        }));
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [stepStatus]);
  return (
    <Modal
      isOpen={showGenerateLoadingModal}
      onRequestClose={() => setShowGenerateLoadingModal(false)}
      ariaHideApp={false}
      className=""
      style={{
        overlay: {
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: "9999",
        },
        content: {
          position: "absolute",
          top: "50%",
          left: "50%",
          right: "auto",
          border: "none",
          background: "white",
          borderRadius: "8px",
          maxWidth: "100%",
          width: "100%",
          height: "100%",
          bottom: "",
          zIndex: "999",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          padding: "30px",
          paddingBottom: "0px",
        },
      }}
    >
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div className="w-96 h-96 flex-col justify-start items-center gap-4 inline-flex">
          <img className="w-60 h-60" src="/scanner.gif" />
          <div className="text-center text-green-600 text-base font-medium leading-tight">
            Hey! This looks great...
          </div>
          <div className="w-96 opacity-70 text-center text-gray-800 text-xs font-medium leading-none">

          </div>
          <div className="transition-all duration-500 ease-in-out w-full rounded-full blur-none z-10 opacity-70 text-center text-gray-800 text-xs font-medium leading-none">
            <Typewriter
              onInit={(typewriter) => {
                typewriter
                  .pauseFor(300)
                  .typeString("Searching the sources on the Internet.")
                  .pauseFor(300)
                  .deleteAll()
                  .typeString("Extracting Ideas from the sources.")
                  .pauseFor(300)
                  .deleteAll()
                  .typeString("Creating backlinks for your content.")
                  .pauseFor(300)
                  .deleteAll()
                  .typeString("Generating H1 & H2 headings")
                  .pauseFor(300)
                  .deleteAll()
                  .typeString("Creating the draft for you!")
                  .pauseFor(300)
                  .deleteAll()
                  .typeString(percentage.message)
                  .start();
              }}
            />
          </div>
          <div className="self-stretch h-36 flex-col justify-start items-center gap-10 flex">
            <div className="h-14 flex-col w-[150px] justify-center items-center gap-2 flex">
              <div style={{ width: 579, height: 30, position: 'relative' }}>
                <div style={{ width: 579, height: 30, left: 0, top: 0, position: 'absolute', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
                  <div style={{ width: 579, height: 30, boxShadow: '0px 0px 0px ', filter: 'blur(0px)' }} />
                </div>
                <div style={{ width: 572.62, height: 6, left: 3.19, top: 12, position: 'absolute', background: '#E6E6F8' }} className="rounded-full" />
                <div style={{ width:  `${percentage.percent}%`, height: 12, left: 3.19, top: 9, position: 'absolute', background:  nativePercentage.percent < 99? '#4A3AFE' : '#19A70D'
              }}  className="rounded-full"/>
              </div>
              <div className="w-8 text-center text-zinc-400 text-xs font-medium leading-none">
                {percentage.percent}%
              </div>
            </div>
            {
              showBackButton && (
                <div className="self-stretch h-11 flex-col justify-start items-center gap-2 flex">
                  <div className="w-96 opacity-50 text-center text-gray-800 text-xs font-medium leading-none">
                    If you want to generate your draft quickly, go back and select
                    the web option.
                  </div>
                  <div className="justify-center items-center gap-2 inline-flex">
                    <button onClick={() => {
                      // resetForm()
                      setShowGenerateLoadingModal(false)
                    }
                    }
                    className="text-center text-gray-800 flex items-center justify-center text-sm mt-2 font-medium leading-none">
                    <ChevronLeftIcon className="w-4 h-4 text-black" />
                      Go Back
                    </button>
                  </div>
                </div>
              )
            }
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GenerateLoadingModal;
