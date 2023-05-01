/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { PlayPauseIcon } from "@heroicons/react/24/outline";
import React, { useDebugValue, useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";

import { LINKEDIN_CLIENT_ID } from "../constants/apiEndpoints";
import { API_BASE_PATH, API_ROUTES } from "../constants/apiEndpoints";
import { LinkedinLogin } from "../services/LinkedinLogin";
import { signUpWithGoogle } from "../services/GoogleLogin";

import { useRouter } from "next/router";
import LoaderPlane from "./LoaderPlane";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createScanner } from "typescript";
import ReactLoading from "react-loading";
import useStore from "@/store/store";

export default function AuthenticationModal({
  type,
  setType,
  modalIsOpen,
  setModalIsOpen,
  handleSave,
  bid,
}) {
  const [submitting, setSubmitting] = useState(false);

  const [signUpFormData, setSignUpFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    tempUserId: "",
  });

  const [loginFormData, setLoginFormData] = useState({
    email: "",
    password: "",
  });

  const [forgotPassMail, setForgotPassMail] = useState("")

  const openModal = (url) => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleLoginSubmit = (event, email, password) => {
    event.preventDefault();
    setSubmitting(true);

    let loginData = {
      email: email || loginFormData.email,
      password: password || loginFormData.password,
    };

    console.log(loginData);

    axios
      .post(API_BASE_PATH + API_ROUTES.LOGIN_ENDPOINT, loginData, {
        headers: {
          "Content-type": "application/json",
        },
      })
      .then((response) => response.data)
      .then((response) => {
        console.log(response);
        if (response?.data?.accessToken) {
          redirectPageAfterLogin(response?.data?.accessToken);
          toast.success("Successfully Logged in", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          return true;
        }
      })
      .then((res) => {
        if (res) {
          setTimeout(() => setModalIsOpen(false), 3000);
        }
      })
      .catch((error) => {
        const errorMessage =
          !error.response.data.success && error.response.data.message;
        if (errorMessage != null) {
          toast.error("Error : " + errorMessage, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          if (errorMessage === `Could not find account: ${loginData.email}`) {
            setType("signup");
          }
        }
        console.error("Error : ", error.response);
      })
      .finally(() => {
        setSubmitting(false);
        setLoginFormData({
          email: "",
          password: "",
        });
      });

    function redirectPageAfterLogin(accessToken) {
      localStorage.setItem(
        "token",
        JSON.stringify(accessToken).replace(/['"]+/g, "")
      );

      var getToken;
      if (typeof window !== "undefined") {
        getToken = localStorage.getItem("token");
      }

      const myHeaders = {
        "content-type": "application/json",
        Authorization: "Bearer " + getToken,
      };

      const raw = {
        query:
          "query Query {\n  me {\n    upcomingInvoicedDate\n    name\n    lastName\n    subscriptionId\n    subscribeStatus\n    paid\n    lastInvoicedDate\n    isSubscribed\n    interval\n    freeTrialDays\n    freeTrial\n    freeTrailEndsDate\n    email\n    date\n    admin\n    _id\n  credits\n prefFilled\n profileImage\n  }\n}",
      };

      axios
        .post("https://maverick.lille.ai/graphql", raw, {
          headers: myHeaders,
        })
        .then((response) => response.data)
        .then((response) =>
          localStorage.setItem(
            "userId",
            JSON.stringify(response.data.me._id).replace(/['"]+/g, "")
          )
        )
        .catch((error) => console.error(error))
        .finally(() => {
          if (window.location.pathname === "/dashboard") {
            handleSave();
          } else {
            window.location.href = "/";
          }
        });
      return;
    }
  };

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginFormData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSignUpSubmit = async (event) => {
    setSubmitting(true);
    event.preventDefault();

    if (
      signUpFormData.firstName.length < 2 ||
      signUpFormData.firstName.length > 30 ||
      signUpFormData.lastName.length < 2 ||
      signUpFormData.lastName.length > 30
    ) {
      toast.error("First and Last Name should be of min 2 or max 30 letters", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setInterval(() => setSubmitting(false), 3000);
      return;
    }

    var tempid;
    if (typeof window !== "undefined") {
      tempid = localStorage.getItem("tempId");
    }
    signUpFormData["tempUserId"] = tempid;

    axios
      .post(API_BASE_PATH + API_ROUTES.CREATE_USER, signUpFormData, {
        headers: {
          "Content-type": "application/json",
        },
      })
      .then((response) => response.data)
      .then((response) => {
        console.log(response);
        if (response.error) return;
        handleLoginSubmit(event, signUpFormData.email, signUpFormData.password);
        setModalIsOpen(false);
        toast.success(response.message, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      })
      .catch((error) => {
        const errorMessage =
          error.response.data.error && error.response.data.message;
        if (errorMessage != null) {
          toast.error("Error : " + errorMessage, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          setType("login");
        }
        console.error("Error : ", error.response);
      })
      .finally(() => {
        setSubmitting(false);
        setSignUpFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          tempUserId: "",
        });
        setLoading(false);
      });
  };

  const handleSignUpChange = (event) => {
    const { name, value } = event.target;
    setSignUpFormData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const [callBack, setCallBack] = useState();

  useEffect(() => {
    if (typeof window !== "undefined") {
      let temp = `${window.location.origin}${router.pathname}`;
      if (temp.substring(temp.length - 1) == "/")
        setCallBack(temp.substring(0, temp.length - 1));
      else setCallBack(temp.substring(0, temp.length));
    }
  }, []);

  const router = useRouter();

  useEffect(() => {
    const queryParams = router.query;
    var pass;
    pass = localStorage.getItem("pass");
    if (!pass) {
      if (queryParams.code && callBack) {
        console.log("bgukjbkn");
        localStorage.setItem("pass", true);

        let code = queryParams.code;
        LinkedinLogin(code, setLoading, handleSave);
        setLoading(true);
      }
    }
  }, [router, callBack]);

  const handleGoogleLogin = () => {
    console.log("google login");
  };

  const handleGoogleSignUp = async () => {
    console.log("google signup");
    signUpWithGoogle(handleSave);
  };

  const handleLinkedinSignUp = () => {
    if (
      typeof window !== "undefined" &&
      window.location.pathname === "/dashboard"
    ) {
      localStorage.setItem("bid", bid);
      localStorage.setItem("loginProcess", true);
    }
    setModalIsOpen(false);

    const redirectUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${callBack}&scope=r_liteprofile%20r_emailaddress%20w_member_social`;
    window.location = redirectUrl;
  };
  const updateisSavefalse = useStore((state) => state.updateisSavefalse);

  const [forgotPass, setForgotPass] = useState(false);

const handleForgotPass = (e) => {
  e.preventDefault()

  axios({
    method: 'post',
    url: `${API_BASE_PATH}${API_ROUTES.FORGOT_PASSWORD}`,
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      "email": forgotPassMail
    }
  })
    .then(response => {
      if (response.data.message === 'success') {
        toast.success('Password reset email sent successfully');
      } else {
        toast.error(response.data.message);
      }
    })
    .catch(error => {
      console.log('error', error);
      toast.error("User not found");
    });
}


  const [loading, setLoading] = useState(false);

  // if(loading) return <LoaderPlane/>
  // if (linkedinLogin) {
  //   handleLinkedinSignUp();
  //   const queryParams = router.query;

  //   if (queryParams.code) {
  //     let code = queryParams.code;
  //     LinkedinLogin(code, setLoading, handleSave);
  //     setLoading(true);
  //   }
  // }

  return (
    <>
      <ToastContainer />
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => {
          updateisSavefalse();
          closeModal();
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
            boxShadow: "0px 4px 20px rgba(170, 169, 184, 0.1)",
            borderRadius: "8px",
            // height: "75%",
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
        {/* <ToastContainer /> */}
        <div
          className="max-w-lg mx-auto bg-white p-8 py-2 rounded-xl 
      "
        >
          {/* shadow shadow-slate-300 */}
          <h1 className="text-4xl font-medium ">
            {type === "login" ? "Login" : "Sign Up"}
          </h1>
          <p className="text-slate-500 ">Hi, Welcome back 👋</p>

          <div className="mt-5">
            <div className="w-full flex justify-evenly gap-4">
              <button
                className="text-center p-5 border flex flex-col space-x-2 items-center justify-center border-slate-200 rounded-lg text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:shadow transition duration-150"
                onClick={handleGoogleSignUp}
              >
                <img
                  src="https://www.svgrepo.com/show/355037/google.svg"
                  className="w-6 h-6"
                  alt=""
                />
                {/* <span className="p-4 py-2">
                {type === "login" ? "Login with Google" : "Sign Up with Google"}
              </span> */}
              </button>
              <button
                className="text-center p-5 border flex flex-col space-x-2 items-center justify-center border-slate-200 rounded-lg text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:shadow transition duration-150"
                onClick={handleLinkedinSignUp}
              >
                <img
                  src="https://www.svgrepo.com/show/448234/linkedin.svg"
                  className="w-6 h-6"
                  alt=""
                />
                {/* <span className="p-4 py-2">
                {type === "login" ? "Login with Google" : "Sign Up with Google"}
              </span> */}
              </button>
            </div>
          </div>
          {/*<div className="my-3 d-flex justify-content-center align-items-center">
          <button
            className="btn"
            onClick={signUpWithGoogle}
            aria-label="Sign in with Google"
          >
            <img width="50px" className="mx-2" src={google} />
          </button>
          <a
            href={`https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${callBack}&scope=r_liteprofile%20r_emailaddress%20w_member_social`}
            aria-label="Sign in with Linked-in"
            className={styles.linkedin}
          >
            <img
              width="50px"
              src={linkedin}
              className="mx-2"
              alt="Linkedin"
            />
          </a>
        </div>*/}
          <form
            action=""
            method="post"
            className="my-10 mt-0  "
            onSubmit={type === "login" ? handleLoginSubmit : handleSignUpSubmit}
          >
            <div className="flex flex-col space-y-5 mt-5">
              {type === "login" ? (
                <>
                  <label htmlFor="email">
                    <p className="font-small text-sm text-slate-700  ">
                      Email address
                    </p>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={loginFormData.email}
                      onChange={handleLoginChange}
                      className=" w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                      placeholder="Enter email address"
                      required
                    />
                  </label>
                  <label htmlFor="password">
                    <p className="font-small  text-sm text-slate-700">
                      Password
                    </p>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      title="Password should contain alphabet and number and should be between 8 to 20 characters"
                      pattern="^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{8,20}$"
                      value={loginFormData.password}
                      onChange={handleLoginChange}
                      className=" w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                      placeholder="Enter your password"
                      required
                    />
                  </label>
                </>
              ) : (
                <>
                  <div className="flex gap-4">
                    <label htmlFor="firstName">
                      <p className="font-small text-sm text-slate-700  ">
                        First Name
                      </p>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={signUpFormData.firstName}
                        onChange={handleSignUpChange}
                        className="border-black  w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                        placeholder="Enter First Name"
                        required
                      />
                    </label>
                    <label htmlFor="lastName">
                      <p className="font-small text-sm text-slate-700  ">
                        Last Name
                      </p>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={signUpFormData.lastName}
                        onChange={handleSignUpChange}
                        className=" w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                        placeholder="Enter Last Name"
                        required
                      />
                    </label>
                  </div>
                  <label htmlFor="email">
                    <p className="font-small text-sm text-slate-700  ">
                      Email address
                    </p>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={signUpFormData.email}
                      onChange={handleSignUpChange}
                      className=" w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                      placeholder="Enter email address"
                      required
                    />
                  </label>
                  <label htmlFor="password">
                    <p className="font-small  text-sm text-slate-700">
                      Password
                    </p>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      title="Password should contain alphabet and number and should be between 8 to 20 characters"
                      pattern="^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{8,20}$"
                      value={signUpFormData.password}
                      onChange={handleSignUpChange}
                      className=" w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                      placeholder="Enter your password"
                      required
                    />
                  </label>
                </>
              )}
              <div className="flex flex-row justify-between !mt-4">
                <div>
                  <label htmlFor="remember" className="pr-4">
                    <input
                      type="checkbox"
                      id="remember"
                      className="w-4 h-4 border-slate-300 focus:bg-indigo-600"
                    />
                    <p className="text-sm  pl-2 inline-block">Remember me</p>
                  </label>
                </div>
                <div>
                  <a 
                    className="text-sm  font-medium text-indigo-600 cursor-pointer"
                    onClick={e => setForgotPass(true)}>
                    Forgot Password?
                  </a>
                </div>
              </div>
              <Modal
                isOpen={forgotPass}
                ariaHideApp={false}
                onRequestClose={() => {
                  setForgotPass(false)
                }}
                className="w-[70%]"
                style={{
                  overlay: {
                    backgroundColor: "rgba(0,0,0,0.4)",
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
                    // height: "75%",
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
                <div className="flex items-center justify-center h-full">
                  <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
                    <h2 className="text-xl font-medium text-gray-800 mb-4">Forgot Password</h2>
                    <form className="px-4 pb-4">
                      <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                          Email Address
                        </label>
                        <input
                          className="w-full border-gray-300 rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                          id="email"
                          type="email"
                          value={forgotPassMail}
                          onChange={(e) => setForgotPassMail(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <button
                          className="text-indigo-600 font-medium inline-flex space-x-1 items-center cursor-pointer"
                          onClick={handleForgotPass}
                        >
                          Submit
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-800 font-medium focus:outline-none"
                          onClick={() => setForgotPass(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Modal>

              <button
                className="w-full !mt-6 !py-3 cta-invert flex items-center justify-center gap-2"
                type="submit"
                disabled={submitting ? true : false}
              >
                {!submitting ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    {type === "login" ? "Login" : "Sign Up"}
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
              <p className="!mt-3 text-center text-sm">
                {type === "login"
                  ? "Not registered yet ?  "
                  : "Already Registered ?   "}

                <a
                  className="text-indigo-600 font-medium inline-flex space-x-1 items-center cursor-pointer"
                  onClick={() =>
                    type === "login" ? setType("signup") : setType("login")
                  }
                >
                  <span>{type === "login" ? "Register Now!" : "Sign In"}</span>
                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </span>
                </a>
              </p>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
