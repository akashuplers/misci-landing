import React, { useEffect } from "react";
import Modal from "react-modal";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { misciBlogPublish } from "@/helpers/apiMethodsHelpers";
import { toast } from "react-toastify";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
const initialValues = {
  email: "",
  name: "",
};
const DEFAULT_SECONDS = 10;

const PublishMisciModal = ({
  showModal,
  setShowModal,
  blogId,
}: {
  blogId: string;
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
}) => {
  const [showRedirectionModal, setShowRedirectionModal] = React.useState(false);
  const [youShoulBeRedirected, setYouShoulBeRedirected] = React.useState(true);
  const [seconds, setSeconds] = React.useState(DEFAULT_SECONDS);
  const router = useRouter();
  const [timeoutId, setTimeoutId] = React.useState<any>(null);
  const [intervalId , setIntervalId] = React.useState<any>(null);
  function handleClose () {
    setShowRedirectionModal(false);
    setSeconds(DEFAULT_SECONDS);
    setTimeoutId(null);
    clearTimeout(timeoutId);
    setShowModal(false);
  }
  const onSubmit = (values: any) => {
    misciBlogPublish({
      blog_id: blogId,
      email: values.email,
      name: values.name,
    })
      .then((res) => {
        if (res.error === false) {
          toast.success(res.message ?? "Blog published successfully", {
            toastId: "blog-publish-success",
          });
        } else {
          toast.error(res.message ?? "Something went wrong", {
            toastId: "blog-publish-error",
          });
        }
      })
      .finally(() => {
        // setShowModal(false);
        setShowRedirectionModal(true);
        // 5000s after
       let intervalTime =  setInterval(() => {  
          setSeconds((seconds) => {
            if (seconds === 0) {
              clearInterval(intervalTime);
              return 0;
            }
            return seconds - 1;
          });
        }, 1000);
        setIntervalId(intervalTime);
        let timeoutID =  setTimeout(() => {
          // alert("/misci")
          router.push('/misci')
          clearInterval(intervalTime);
        }, ((DEFAULT_SECONDS +  1) * 1500));
        setTimeoutId(timeoutID)
      });
  };

 
  const validate = (values: any) => {
    const errors: any = {};
    if (!values.email) {
      errors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
    ) {
      errors.email = "Invalid email address";
    }

    if (!values.name) {
      errors.name = "Name is required";
    } else if(!/^[a-zA-Z ]*$/.test(values.name)) {
      errors.name = "Invalid name";
    }
    return errors;
  };
  return (
    <>
      <Modal
        isOpen={showModal}
        onRequestClose={() => {
          handleClose();
        }}
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
            width: "35%",
            marginRight: "-50%",
            minHeight: "40%",
            transform: "translate(-50%, -50%)",
            padding: "1rem",
            paddingBottom: "0px",
            outline: "none",
          },
        }}
      >
         
        <div className="w-full h-full">
          <div
            className="absolute px-4 flex w-full items-center justify-end"
            style={{
              top: "10%",
              right: '0%'
            }}
          >
            <button
              className="w-6 h-6"
              onClick={() => {
                handleClose();
              }}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {showRedirectionModal ? (
            <>
              <div className="w-full h-full flex-col justify-around items-center inline-flex px-10 gap-8">
                <div className="self-stretch flex-col justify-start items-center flex">
                  <div className="self-stretch text-center text-black font-bold text-2xl leading-loose">
                    You will be navigated back to Homepage in {seconds} seconds
                  </div>
                </div>
                <div className="w-72 text-center text-zinc-900 text-opacity-70 text-base font-normal leading-snug">
                  Or you wish to go back to the Answer
                </div>
                <button
                  className="p-2 justify-start w-full  items-center gap-2 inline-flex"
                  onClick={() => {
                     
                    clearInterval(intervalId);
                    clearTimeout(timeoutId);
                    setShowModal(false);
                    handleClose();
                  }}
                >
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
              </div>{" "}
            </>
          ) : (
            <>
              <div className="w-full h-full relative  rounded-lg flex-col flex justify-center items-center px-10 ">
                <div className="self-stretch text-center text-black text-2xl font-semibold leading-normal w-full">
                  This looks great! 👏
                </div>
                <Formik
                  initialValues={initialValues}
                  onSubmit={onSubmit}
                  validate={validate}
                >
                  <Form className="w-full flex flex-col justify-around gap-4">
                    <div className=" relative">
                      <label
                        htmlFor="email"
                        className="text-center text-zinc-900 text-opacity-70 text-base font-normal leading-snug"
                      >
                        Enter your Email
                      </label>
                      <Field
                        type="email"
                        id="email"
                        name="email"
                        className="w-full h-14 px-3.5 py-5 rounded-lg border border-neutral-200 justify-start items-center gap-2.5 inline-flex"
                        placeholder="abc@example.com"
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="text-red-500 text-sm mt-2"
                      />
                    </div>
                    <div className=" relative">
                      <label
                        htmlFor="name"
                        className="text-center text-zinc-900 text-opacity-70 text-base font-normal leading-snug"
                      >
                        Enter your Name
                      </label>
                      <Field
                        type="text"
                        id="name"
                        name="name"
                        className="w-full h-14 px-3.5 py-5 rounded-lg border border-neutral-200 justify-start items-center gap-2.5 inline-flex"
                        placeholder="John Doe"
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="text-red-500 text-sm mt-2"
                      />
                    </div>
                    <div className="w-full  justify-start items-center  inline-flex">
                      <button
                        type="submit"
                        className="grow shrink basis-0 h-10 px-4 py-1.5 bg-indigo-600 rounded-lg flex-col justify-center items-center gap-2.5 inline-flex text-white text-sm font-bold leading-normal"
                      >
                        Done
                      </button>
                    </div>
                  </Form>
                </Formik>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default PublishMisciModal;
