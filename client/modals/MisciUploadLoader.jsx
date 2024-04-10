import Modal from "react-modal";
import Typewriter from "typewriter-effect";

const MisciUploadLoader = ({
  showGenerateLoadingModal,
  setShowGenerateLoadingModal,
}) => {
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
            Loading...
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
                  .start();
              }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MisciUploadLoader;
