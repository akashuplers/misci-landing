import Modal from 'react-modal';
interface IRedirectionModal {
    isOpen: boolean;
    secondsToRedirect: number;
    onRequestClose: () => void;
    setCurrentTabIndex: (index: number) => void;
}
const RedirectionModal = ({ isOpen, secondsToRedirect, onRequestClose, setCurrentTabIndex } : IRedirectionModal) => {
    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        ariaHideApp={false}
        className="modalModalWidth flex items-center justify-center"
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
            width: "40%",
            marginRight: "-50%",
            minHeight: "40%",
            maxHeight: '100vh',
            transform: "translate(-50%, -50%)",
            padding: "1rem",
            outline: "none",
          },
        }}
      >
        <div className="text-center p-6">
          <h2 className="text-indigo-500 text-2xl font-bold mb-4">Redirection Alert</h2>
          <p >Returning to the homepage in  {secondsToRedirect} seconds. Or would you like to revisit the article?</p>
          <div className="flex justify-center mt-6">
            <button className="bg-indigo-500 text-white px-4 py-2 rounded mr-4" onClick={
              () => {
                setCurrentTabIndex(1);
              }
            }>
              Return to Article
            </button>
          </div>
        </div>
      </Modal>
    );
  };
  
  export default RedirectionModal;