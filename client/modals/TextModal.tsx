import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { Fragment, useState } from "react";
import Modal from "react-modal";
interface ITextModal {
    detailedAnswer: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  question: string;
}
export default function TextModal({
    detailedAnswer,
  isOpen,
  setIsOpen,
  question,
}: ITextModal) {
  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 " onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto w-full">
            <div className="flex items-center w-full justify-center p-4 text-center ">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className="w-full  transform overflow-y-scroll rounded-2xl bg-white px-4 text-left align-middle shadow-xl transition-all relative"
                  style={{
                    maxHeight: "60vh",
                    width: "60vw",
                    padding: "0px",
                    // px 4
                    paddingBottom: "0px",
                    paddingTop: "0px",
                    paddingRight: "2rem",
                    paddingLeft: "2rem",
                  }}
                >
                  <div className="h-14 flex items-center justify-between text-xl font-medium leading-6 text-gray-900 capitalize sticky top-0 bg-white ">
                    {question}
                    <button
                      className="outline-none  w-6 h-6"
                      onClick={closeModal}
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="mt-2 overflow-y-scroll">
                    <>
                      <p
                        dangerouslySetInnerHTML={{
                          __html: detailedAnswer,
                        }}
                      ></p>
                    </>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
