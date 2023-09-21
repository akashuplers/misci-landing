import { QuestionMarkCircleIcon, TrashIcon, XCircleIcon } from "@heroicons/react/24/outline";
import React from "react";
import Modal from "react-modal";
interface IDeleteModal {
  data: any;
  onDelete: any;
  onCancel: any;
  isOpen: any;
}

function DeleteModal(props: IDeleteModal) {
  return (
    <Modal
      isOpen={props.isOpen}
      onRequestClose={props.onCancel}
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
          width: "30%",
          marginRight: "-50%",
          maxHeight: "100vh",
          transform: "translate(-50%, -50%)",
          outline: "none",
        },
      }}
    >
      <div className="w-full h-full bg-white rounded-lg shadow-lg p-4">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          onClick={props.onCancel}
        >
          <XCircleIcon />
        </button>
        <div className="text-center w-full">
          <QuestionMarkCircleIcon
            className="mx-auto my-4 w-32 h-32 rounded-full text-red-300 bg-red-500"
          />
          <p className="text-lg font-semibold">Delete this item?</p>
        </div>
        <div className="mt-4 flex justify-around space-x-4 w-full">
          
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded"
            onClick={props.onCancel}
          >
            Cancel
          </button>
          <button
            className="border-red-500 ring-1 focus:ring-1 ring-red-500 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            onClick={() => props.onDelete(props.data)}
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteModal;
