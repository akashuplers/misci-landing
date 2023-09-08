import { getMax } from "@/store/appHelpers";
import { StepType } from "@/store/types";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import Typewriter from "typewriter-effect";

interface MiSciGenerateLoadingModalProps {
  showGenerateLoadingModal: boolean;
  setShowGenerateLoadingModal: (showGenerateLoadingModal: boolean) => void;
  showBackButton?: boolean;
}

export const MiSciGenerateLoadingModal = ({
  showGenerateLoadingModal,
  setShowGenerateLoadingModal,
  showBackButton,
}: MiSciGenerateLoadingModalProps) => {

  return (
    <Modal
      isOpen={showGenerateLoadingModal}
      onRequestClose={() => setShowGenerateLoadingModal(false)}
      ariaHideApp={false}
      className=""
      style={{
        overlay: {
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: "100",
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
          <div className="text-center text-green-600 text-[20px] font-medium leading-tight">
            Hey! This looks great...
          </div>
          <div className="w-96 opacity-70 text-center text-gray-800 text-xs font-medium leading-none"></div>
          <div className="transition-all duration-500 text-[16px] ease-in-out w-full rounded-full blur-none z-10 opacity-70 text-center text-gray-800 font-medium leading-none">
            <Typewriter

              onInit={(typewriter) => {
                typewriter
                  .pauseFor(300)
                  .typeString("Exploring museums vast archives...")
                  .pauseFor(300)
                  .deleteAll()
                  .typeString("Sourcing additional information from the web...")
                  .pauseFor(300)
                  .deleteAll()
                  .typeString("Crafting an informative article for you...")
                  .pauseFor(300)
                  .deleteAll()
                  .typeString("Enhancing your knowledge with trusted references...")
                  .pauseFor(300)
                  .deleteAll()
                  .start();
              }}
            />
          </div>
          <div className="self-stretch h-36 flex-col justify-start items-center gap-10 flex">
            {showBackButton && (
              <div className="self-stretch h-11 flex-col justify-start items-center gap-2 flex">
                <div className="w-96 opacity-50 text-center text-gray-800 text-xs font-medium leading-none">
                  If you want to generate your draft quickly, go back and select
                  the web option.
                </div>
                <div className="justify-center items-center gap-2 inline-flex">
                  <button
                    onClick={() => {
                      // resetForm()
                      setShowGenerateLoadingModal(false);
                    }}
                    className="text-center text-gray-800 flex items-center justify-center text-sm mt-2 font-medium leading-none"
                  >
                    <ChevronLeftIcon className="w-4 h-4 text-black" />
                    Go Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MiSciGenerateLoadingModal;
