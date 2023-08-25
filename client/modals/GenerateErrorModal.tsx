import React from 'react'
import Modal from 'react-modal';
interface GenerateErrorModalProps {
    modalOpen :boolean,    
    setModalOpen: (status: boolean)=>void,
}
const GenerateErrorModal = ({modalOpen, setModalOpen}:GenerateErrorModalProps) => {
  return (
    <Modal
    isOpen={modalOpen}
    onRequestClose={()=>{
        setModalOpen(false);
    }}
    ariaHideApp={false}
    className="w-[100%] sm:w-[38%] max-h-[95%]"
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
        height: "350px",
        // width: "100%",
        maxWidth: "450px",
        bottom: "",
        zIndex: "999",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
        padding: "30px",
        paddingBottom: "0px",
      },
    }}
  >
    <div className="mx-auto h-[150px] w-[100px]">
      <img
        className="h-[150px]"
        src="/time-period-icon.svg"
        alt="Timeout image"
      ></img>
    </div>

    <p className="text-gray-500 text-base font-medium mt-4 mx-auto pl-5">
      We regret that it is taking more time to generate the blog right now,
      Please try again after some time...
    </p>
    <div className="m-9 mx-auto">
      <button
        className="w-[240px] ml-16 bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 border border-indigo-700 rounded"
        onClick={() => {
          window.location.href = "/";
        }}
      >
        Go Back
      </button>
      {/* <button className="w-[240px] ml-9 bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded text-sm"></button> */}
    </div>
  </Modal>
  )
}

export default GenerateErrorModal