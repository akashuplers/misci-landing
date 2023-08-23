import { StepType } from "@/store/types";
import Modal from "react-modal";

interface GenerateLoadingModalProps {
  showGenerateLoadingModal: boolean;
  setShowGenerateLoadingModal: (showGenerateLoadingModal: boolean) => void;
  stepStatus: StepType;
}

function getPercentageByStep(step: StepType): { percent: number, message: string } {
  switch (step) {
    case "KEYWORD_COMPLETED":
      return {
        percent: 19, message: `Creating draft from URLs requires our AI's advanced generation,
      which could take more than a minute.`};
    case "URL_UPLOAD_COMPLETED":
      return { percent: 53, message: `File are scanned successfully.` }

    case "FILE_UPLOAD_COMPLETED":
      return { percent: 53, message: `File are scanned successfully.` }
    case "CHAT_GPT_COMPLETED":
      return { percent: 80, message: `Chat GPT is running.` }
    case "BACKLINK_COMPLETED":
      return { percent: 100, message: `Backlink is running.` }
    default:
      return { percent: 0, message: `Creating draft from URLs requires our AI's advanced generation, which could take more than a minute.` }
  }
}

const GenerateLoadingModal = ({
  showGenerateLoadingModal,
  stepStatus,
  setShowGenerateLoadingModal,
}: GenerateLoadingModalProps) => {
  console.log(
    showGenerateLoadingModal,
    stepStatus,
    setShowGenerateLoadingModal
  );
  const percentage = getPercentageByStep(stepStatus);
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
          <img className="w-40 h-40" src="/scanner.gif" />
          <div className="text-center text-green-600 text-base font-medium leading-tight">
            Hey! This looks great...
          </div>
          <div className="w-96 opacity-70 text-center text-gray-800 text-xs font-medium leading-none">

          </div>
          <div className="transition-all duration-500 ease-in-out w-full rounded-full blur-none z-10 opacity-70 text-center text-gray-800 text-xs font-medium leading-none">
            <p>
              {percentage.message}
            </p>
          </div>
          <div className="self-stretch h-36 flex-col justify-start items-center gap-10 flex">
            <div className="h-14 flex-col w-full justify-start items-start gap-2 flex">
              <div className="self-stretch my-2 relative">
                <div className="w-96 h-1.5 left-[3.19px] top-[12px] absolute rounded-full blur-none z-10"
                  style={{
                    background: `linear-gradient(90deg, #10B981 ${percentage.percent}%, #E5E7EB ${percentage.percent}%)`,
                    height: '3px'
                  }}
                />
                <div className={`h-3 left-[3.19px] top-[-5px] absolute rounded-full z-20 ${stepStatus === 'BACKLINK_COMPLETED' ? 'bg-green-600' : 'bg-indigo-600'}`}
                  style={{
                    width: `${percentage.percent}%`,
                    top: '-5px',
                  }}
                />
              </div>
              <div className="w-8 text-center text-zinc-400 text-xs font-medium leading-none">
                {percentage.percent}%
              </div>
            </div>
            <div className="self-stretch h-11 flex-col justify-start items-center gap-2 flex">
              <div className="w-96 opacity-50 text-center text-gray-800 text-xs font-medium leading-none">
                If you want to generate your draft quickly, go back and select
                the web option.
              </div>
              <div className="justify-center items-center gap-2 inline-flex">
                <div className="text-center text-gray-800 text-xs font-medium leading-none">
                  Go Back
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GenerateLoadingModal;
