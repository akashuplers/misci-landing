import React from 'react';
import Modal from 'react-modal';
import ReactLoading from "react-loading";


const CancelSubscriptionModal = ({ isOpen, onCancel, onClose , processing }) => {
    return (
        // <Modal
        //     isOpen={isOpen}
        //     onRequestClose={onClose}
        //     className="modal"
        //     overlayClassName="modal-overlay"
        // >
        <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
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
                maxWidth: "380px",
                bottom: "",
                zIndex: "999",
                marginRight: "-50%",
                transform: "translate(-50%, -50%)",
                padding: "30px",
                paddingBottom: "0px",
            },
        }}
    >
            <div className="modal-content">
                <h2 className="text-2xl font-bold mb-4">Cancel Subscription</h2>
                <p className="mb-4">Are you sure you want to cancel your subscription?</p>
                <div className="flex justify-end">
                    <button
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mr-2"
                        onClick={() => {
                            onCancel();
                            onClose();
                        }}
                    >
                    
                      {processing ? (
                  <ReactLoading
                    width={25}
                    height={25}
                    round={true}
                    color={"#2563EB"}
                  />
                ) : (
                 'Yes'
                )}
                    </button>
                    <button
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                        onClick={onClose}
                    >
                        No
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CancelSubscriptionModal;
