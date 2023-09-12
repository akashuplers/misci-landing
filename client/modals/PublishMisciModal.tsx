import React from "react";
import Modal from "react-modal";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { misciBlogPublish } from "@/helpers/apiMethodsHelpers";
import { toast } from "react-toastify";
import { XMarkIcon } from "@heroicons/react/24/outline";
const initialValues = {
  email: "",
  name: "",
};

const PublishMisciModal = ({
  showModal,
  setShowModal,
  blogId,
}: {
  blogId: string;
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
}) => {
  const onSubmit = (values: any) => {
    misciBlogPublish({
      blog_id: blogId, email: values.email, name: values.name
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
        setShowModal(false);
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
    }

    return errors;
  };
  return (
    <>
      <Modal
        isOpen={showModal}
        onRequestClose={() => {
          setShowModal(false);
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
            padding: "30px",
            paddingBottom: "0px",
            outline: "none",
          },
        }}
      >
       <div className="relative w-full h-full">
       <div className="absolute   flex w-full items-center justify-between"
       style={{
        top: "-10%",
       }}
       >
            <button
                className="w-6 h-6 self-end"
                onClick={() => {
                setShowModal(false);
                }}
            >
                <XMarkIcon className="w-6 h-6" />
            </button>
            </div>

        <div className="w-full h-full relative  rounded-lg flex-col flex justify-center items-center gap-4">
          <div className="self-stretch text-center text-black text-2xl font-semibold leading-normal w-full">
            This looks great! 👏
          </div>
          <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validate={validate}
          >
            <Form className="w-full flex flex-col justify-around">
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
              <div className="w-full px-3 pt-4 pb-6 justify-start items-center gap-2 inline-flex">
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
       </div>
      </Modal>
    </>
  );
};

export default PublishMisciModal;
