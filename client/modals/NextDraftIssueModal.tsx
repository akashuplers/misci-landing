import { XMarkIcon } from "@heroicons/react/24/outline";
import React from "react";
import Modal from "react-modal";
const NextDraftIssueModal = ({ showModal, setShowModal } : { showModal: boolean, setShowModal: (showModal: boolean) => void }) => {
  return (
    <Modal
      isOpen={showModal}
      onRequestClose={() => {
        setShowModal(false);
      }}
      ariaHideApp={false}
      className="modalModalWidth sm:w-[38%] max-h-[95%]"
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
          // boxShadow: "0px 4px 20px rgba(170, 169, 184, 0.1)",
          borderRadius: "8px",
          // width: "100%",
          bottom: "",
          zIndex: "999",
          maxWidth: "55%",
          width: "100%",
          marginRight: "-50%",
          height: "25%",
          transform: "translate(-50%, -50%)",
          padding: "30px",
          paddingBottom: "0px",
        },
      }}
    >
      <div className="w-full h-full relative">
        {/* absulute scorr btn */}
        <button className="w-6 h-6 left-[1%] absolute" 
        onClick={()=>{
            setShowModal(false);
        }}
        >
            <XMarkIcon className="w-6 h-6" />
        </button>
        <div className="w-full h-full flex-col justify-center items-center inline-flex">
          <div className="self-stretch h-24 px-6 py-4 flex-col justify-start items-center flex">
            <div className="self-stretch text-center text-black text-2xl font-medium leading-loose">
              Change the ideas selection to
              <br /> generate next draft
            </div>
          </div>
          <div className="w-72 text-center text-zinc-900 text-opacity-70 text-base font-normal leading-snug">
            Go back to the Article
          </div>
          <div className="self-stretch px-3 pt-4 pb-6 justify-start items-center gap-2 inline-flex">
            <div className="grow shrink basis-0 h-10 bg-indigo-600 rounded-lg flex-col justify-center items-center gap-2.5 inline-flex">
              <div className="justify-center items-center inline-flex">
                <div className="px-1 justify-start items-center gap-2.5 flex">
                  <div className="text-center text-white text-sm font-bold leading-normal">
                    Go Back
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-6 h-6 left-[508px] top-[20px] absolute" />
          <div className="w-6 h-6 left-[14.29px] top-[14px] absolute" />
        </div>
      </div>
    </Modal>
  );
};

export default NextDraftIssueModal;
