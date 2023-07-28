//@ts-nocheck
import Modal from "react-modal";
import { EmailIcon, EmailShareButton, FacebookIcon, FacebookShareButton, TelegramIcon, TelegramShareButton, TwitterIcon, TwitterShareButton, WhatsappIcon, WhatsappShareButton } from "react-share";
// @ts-ignore
import { CopyToClipboard } from "react-copy-to-clipboard";

const ShareLinkModal = ({
    openModal, setOpenModal, text, blog_id
} : { openModal: boolean, setOpenModal: any, text: string, blog_id: string })=>{
    return (<Modal
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
        <div className="pl-4 text-xl font-bold">Share</div>
        <WhatsappShareButton
          url={text + blog_id}
          quote={""}
          hashtag={"#Lille"}
          description={"Lille"}
          className="Demo__some-network__share-button m-5"
        >
          <WhatsappIcon size={62} round /> Whatsapp
        </WhatsappShareButton>
        <FacebookShareButton
          url={text + blog_id}
          quote={""}
          hashtag={"#Lille"}
          description={"Lille"}
          className="Demo__some-network__share-button m-5"
        >
          <FacebookIcon size={62} round /> Facebook
        </FacebookShareButton>
        <TwitterShareButton
          url={text + blog_id}
          hashtags={["lille", "nowg"]}
          className="m-5"
        >
          <TwitterIcon size={62} round />
          Twitter
        </TwitterShareButton>
        <EmailShareButton
          url={text + blog_id}
          subject="Link for my Blog"
          className="Demo__some-network__share-button m-5"
        >
          <EmailIcon size={62} round /> Email
        </EmailShareButton>
        <TelegramShareButton
          url={text + blog_id}
          quote={""}
          hashtag={"#Lille"}
          description={"Lille"}
          className="Demo__some-network__share-button m-5"
        >
          <TelegramIcon size={62} round /> Telegram
        </TelegramShareButton>
        <div className="p-5 pl-2 flex">
          <input
            type="text"
            value={text + blog_id}
            className="w-[70%] h-[40px] mr-5"
          />
          <CopyToClipboard text={text + blog_id} >
            <div className="copy-area">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
                Copy
              </button>
              <span className={`copy-feedback }`}>
                Copied!
              </span>
            </div>
          </CopyToClipboard>
        </div>
      </Modal>)
}

export default ShareLinkModal;