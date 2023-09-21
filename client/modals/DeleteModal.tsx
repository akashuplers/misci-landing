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
        height: "280px",
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
    <button
      className="absolute right-[35px]"
      onClick={props.onCancel}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
    <div className="mx-auto pb-4">
      <img className="mx-auto h-12" src="/info.png" />
    </div>
    <div className="mx-auto font-bold text-2xl pl-[25%]">
      Are you sure
    </div>
    <p className="text-gray-500 text-base font-medium mt-4 mx-auto">
      Are you sure you want to delete ?
    </p>
    <div className="flex m-9">
      <button
        className="mr-4 w-[200px] p-4 bg-transparent hover:bg-green-500 text-gray-500 font-semibold hover:text-white py-2 px-4 border border-gray-500 hover:border-transparent rounded"
        onClick={() => {
          props.onCancel()
        }}
      >
        No
      </button>
      <button
        className="w-[240px]  bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded"
        onClick={() => {
          props.onDelete(props.data)
        }}
      >
        YES, Delete
      </button>
    </div>
    </Modal>
  );
}

export default DeleteModal;
