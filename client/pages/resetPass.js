import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import Modal from "react-modal";
import ReactLoading from "react-loading";
import { toast, ToastContainer } from "react-toastify";

import axios from "axios";
import { API_BASE_PATH, API_ROUTES } from "../constants/apiEndpoints";

import "react-toastify/dist/ReactToastify.css";

const toastOptions = {
  position: "top-center",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
};

const Reset = () => {
  const [resetFormData, setResetPassData] = useState({
    token: null,
    password: "",
    confirm: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log(router.query);
    setResetPassData((prev) => {
      return {
        ...prev,
        token: router.query.token,
      };
    });
  }, [router]);

  const handleResetChange = ({ target }) => {
    const { name, value } = target;
    setResetPassData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
    return;
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    console.log(resetFormData);

    if (resetFormData.password !== resetFormData.confirm) {
      toast.error("Password should match!", toastOptions);
    } else {
      axios
        .post(`${API_BASE_PATH}${API_ROUTES.RESET_PASSWORD}`, resetFormData)
        .then((response) => response.data)
        .then((response) => {
          console.log(response);
          toast.success(!response?.error && response?.message, toastOptions);
          localStorage.clear();
          router.push("/");
          // do something after pass change success
        })
        .catch((error) => {
          toast.error(
            error?.response?.data?.error && error?.response?.data?.message,
            toastOptions
          );
        });
      // do something after pass change fail
    }
    return;
  };

  return (
    <>
      <Modal
        isOpen={true}
        className="w-[100%] sm:w-[38%] max-h-[95%]"
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: "9999",
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
            width: "50%",
            maxWidth: "450px",
            bottom: "",
            zIndex: "999",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            paddingBottom: "0px",
          },
        }}
      >
        <form
          action=""
          method="post"
          className="my-10 mt-0  "
          onSubmit={handleResetSubmit}
        >
          <div className="flex flex-col space-y-5 mt-5">
            <>
              <label htmlFor="password">
                <p className="font-small text-sm text-slate-700  ">
                  Enter New Password
                </p>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={resetFormData.password}
                  onChange={handleResetChange}
                  title="Password should be at least 8 characters long and contain at least one Uppercase letter, one lowercase letter, one number and a Special characters"
                  pattern="^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s]).{8,}$"
                  className=" w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                  placeholder="Enter new Password"
                  required
                />
              </label>
              <label htmlFor="confirm">
                <p className="font-small  text-sm text-slate-700">
                  Confirm confirm
                </p>
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  value={resetFormData.confirm}
                  onChange={handleResetChange}
                  pattern="^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s]).{8,}$"
                  className=" w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                  placeholder="Confirm Password"
                  required
                />
              </label>
            </>

            <button
              className="w-full !mt-6 !py-3 cta-invert flex items-center justify-center gap-2 !font-bold"
              type="submit"
              disabled={submitting ? true : false}
            >
              {!submitting ? (
                <>
                  <span>Reset</span>
                </>
              ) : (
                <ReactLoading
                  type={"spin"}
                  color={"#ffffff"}
                  height={25}
                  width={25}
                  className={"mx-auto"}
                />
              )}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Reset;
