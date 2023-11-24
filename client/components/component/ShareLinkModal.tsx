//@ts-nocheck
import Modal from "react-modal";
import React, { useEffect, useState } from "react";
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";
import { XMarkIcon } from "@heroicons/react/24/outline";

// @ts-ignore
import { CopyToClipboard } from "react-copy-to-clipboard";

const ShareLinkModal = ({
  openModal,
  setOpenModal,
  text,
  closeModal,
}: {
  openModal: boolean;
  setOpenModal: any;
  text: string;
}) => {
  const [copyText, setCopyText] = useState("Copy");
  useEffect(() => {
    console.log({
      text,
    },'halert')
  },[])
  return (
    <Modal
      isOpen={openModal}
      onRequestClose={() => setOpenModal(false)}
      ariaHideApp={false}
      className="w-[100%] sm:w-[38%] max-h-[95%]"
      style={{
        overlay: {
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: "9996",
        },
        content: {
          position: "absolute",
          top: "50%",
          left: "50%",
          right: "auto",
          border: "none",
          background: "white",
          boxShadow: "0px 4px 20px rgba(170, 169, 184, 0.1)",
          borderRadius: "8px",
          // height: "75%",
          width: "80%",
          maxWidth: "580px",
          bottom: "",
          zIndex: "999",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          padding: "20px",
          paddingBottom: "0px",
        },
      }}
    >
      <div className="flex justify-between w-100">
        <p className="text-xl font-bold">Share</p>
        <button onClick={() => setOpenModal(false)}><XMarkIcon color="black" width={20} height={20}/></button>
      </div>
      <div className="flex flex-wrap items-center justify-start gap-3">
        <WhatsappShareButton
          url={text }
          quote={""}
          hashtag={"#Lille"}
          description={"Lille"}
          className="Demo__some-network__share-button "
        >
          <WhatsappIcon size={62} round /> Whatsapp
        </WhatsappShareButton>
        <FacebookShareButton
          url={text }
          quote={""}
          hashtag={"#Lille"}
          description={"Lille"}
          className="Demo__some-network__share-button "
        >
          <FacebookIcon size={62} round /> Facebook
        </FacebookShareButton>
        <TwitterShareButton
          url={text }
          hashtags={["lille", "nowg"]}
        >
          <svg 
            style={{pointerEvents: 'none'}} 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 30 30"
            width="62px"
            height="62px"
          >
            <path d="M 6 4 C 4.895 4 4 4.895 4 6 L 4 24 C 4 25.105 4.895 26 6 26 L 24 26 C 25.105 26 26 25.105 26 24 L 26 6 C 26 4.895 25.105 4 24 4 L 6 4 z M 8.6484375 9 L 13.259766 9 L 15.951172 12.847656 L 19.28125 9 L 20.732422 9 L 16.603516 13.78125 L 21.654297 21 L 17.042969 21 L 14.056641 16.730469 L 10.369141 21 L 8.8945312 21 L 13.400391 15.794922 L 8.6484375 9 z M 10.878906 10.183594 L 17.632812 19.810547 L 19.421875 19.810547 L 12.666016 10.183594 L 10.878906 10.183594 z"/>
          </svg>
          Twitter
        </TwitterShareButton>
        <EmailShareButton
          url={text }
          subject="Link for my Blog"
          className="Demo__some-network__share-button "
        >
          <EmailIcon size={62} round /> Email
        </EmailShareButton>
        <TelegramShareButton
          url={text }
          quote={""}
          hashtag={"#Lille"}
          description={"Lille"}
          className="Demo__some-network__share-button "
        >
          <TelegramIcon size={62} round /> Telegram
        </TelegramShareButton>
      </div>
      <div className="p-5 pl-2 flex flex-col gap-2 lg:flex-row">
        <input
          type="text"
          value={text }
          className="w-full lg:w-[70%] h-[40px] mr-5"
        />
        <CopyToClipboard
          text={text }
          onCopy={() => {
            setCopyText("Copied");
            setTimeout(() => {
              setCopyText("Copy");
            }, 2500);
          }}
        >
          <div className="copy-area">
            <button className={`${copyText ==='Copy' ? 'bg-blue-500 hover:bg-blue-700' : 'bg-green-500 hover:bg-green-700'}   text-white font-bold py-2 px-4 rounded-full`}>
              {copyText}
            </button>
          </div>
        </CopyToClipboard>
      </div>
    </Modal>
  );
};

export default ShareLinkModal;
