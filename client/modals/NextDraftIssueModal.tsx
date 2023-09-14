import { ArrowLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
import React from "react";
import Modal from "react-modal";
const NextDraftIssueModal = ({
  showModal,
  setShowModal,
}: {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
}) => {
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
          borderRadius: "8px",
          bottom: "",
          zIndex: "999",
          maxWidth: "55%",
          width: "35%",
          marginRight: "-50%",
          height: "30%",
          transform: "translate(-50%, -50%)",
          padding: "1rem",
          paddingBottom: "0px",
          outline: "none",
        },
      }}
    >
      <div className="w-full h-full relative">
        {/* absulute scorr btn */}
        <div className="top-2 absolute flex w-full items-center justify-between">
          <button
            className="w-6 h-6"
            onClick={() => {
              setShowModal(false);
            }}
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <button
            className="w-6 h-6"
            onClick={() => {
              setShowModal(false);
            }}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          
        </div>
        <div className="w-full h-full flex-col justify-center items-center inline-flex px-10 gap-2">
          <div className="self-stretch flex-col justify-start items-center flex">
            <div className="self-stretch text-center text-black font-bold text-2xl leading-loose">
              Change the ideas selection to
              <br /> generate next draft
            </div>
          </div>
          <div className="w-72 text-center text-zinc-900 text-opacity-70 text-base font-normal leading-snug">
            Go back to the Article
          </div>
          <button className="p-2 justify-start w-full  items-center gap-2 inline-flex" onClick={
            () => {
              setShowModal(false);
            }
          }>
            <div className="grow shrink basis-0 h-10 bg-indigo-600 rounded-lg flex-col justify-center items-center gap-2.5 inline-flex">
              <div className="justify-center items-center inline-flex">
                <div className="px-1 justify-start items-center gap-2.5 flex">
                  <div className="text-center text-white text-sm font-bold leading-normal">
                    Go Back
                  </div>
                </div>
              </div>
            </div>
          </button>
         
        </div>
      </div>
    </Modal>
  );
};

export default NextDraftIssueModal;
