/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { PlayPauseIcon } from "@heroicons/react/24/outline";
import React, { useDebugValue, useState, useEffect } from "react";
import Modal from "react-modal";

import { LINKEDIN_CLIENT_ID } from "../constants/apiEndpoints";
import { API_BASE_PATH, API_ROUTES } from "../constants/apiEndpoints";
import { LinkedinLogin } from "../services/LinkedinLogin"
import { signUpWithGoogle } from "../services/GoogleLogin"

import { useRouter } from "next/router";
import LoaderPlane from "./LoaderPlane";

export default function AuthenticationModal({
  type,
  setType,
  modalIsOpen,
  setModalIsOpen,
  handleSave,
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

  const openModal = (url) => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleLoginSubmit = (email, password) => {
    setSubmitting(true);
    fetch(API_BASE_PATH + API_ROUTES.LOGIN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          email: email ? email : loginFormData.email,
          password: password ? password : loginFormData.password,
        }),
      })
        .then((res) => res.json())
        .then((data) => redirectPageAfterLogin(data))
        .catch((err) => console.error("Error: ", err))
        .finally(() => {

          setModalIsOpen(false);
          setLoginFormData({
            email: "",
            password: "",
          });
        });

      function redirectPageAfterLogin(data) {        
        localStorage.setItem(
          "token",
          JSON.stringify(data.data.accessToken).replace(/['"]+/g, "")
        );
        var getToken;
        if (typeof window !== "undefined") {
          getToken = localStorage.getItem("token");
        }
        var myHeaders = new Headers();
        myHeaders.append("content-type", "application/json");
        myHeaders.append("Authorization", "Bearer " + getToken);

        var raw = JSON.stringify({
          query:
            "query Query {\n  me {\n    upcomingInvoicedDate\n    name\n    lastName\n    subscriptionId\n    subscribeStatus\n    paid\n    lastInvoicedDate\n    isSubscribed\n    interval\n    freeTrialDays\n    freeTrial\n    freeTrailEndsDate\n    email\n    date\n    admin\n    _id\n  credits\n  }\n}",
        });

        var requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow",
        };

        fetch("https://maverick.lille.ai/graphql", requestOptions)
          .then((response) => response.text())
          .then((result) => {
            console.log("Succesfully Logged In")
            const json = JSON.parse(result);
            localStorage.setItem(
              "userId",
              JSON.stringify(json.data.me._id).replace(/['"]+/g, "")
            );
          })
          .catch((error) => console.log("error", error))
          .finally(() => {
            if (window.location.pathname === "/dashboard") {
              handleSave();
            }

            if (window.location.pathname === "/") {
              window.location.href = "/dashboard";
            }
          })
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

    fetch(API_BASE_PATH + API_ROUTES.CREATE_USER, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(signUpFormData),
    })
      .then((res) => res.json())
      .then((res) => {
        setSubmitting(false);
        setModalIsOpen(false);

        console.log('Succesfully signed up')

        handleLoginSubmit(signUpFormData.email,signUpFormData.password);
      })
      .catch((err) => console.error("Error: ", err))
      .finally(() => {
        setSubmitting(false);
        setSignUpFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          tempUserId: "",
        });
        setModalIsOpen(false);
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

  const [callBack, setCallBack] = useState()

  useEffect(()=>{
    if (typeof window !== "undefined") {
      let temp = `${window.location.origin}${router.pathname}`
      setCallBack(temp.substring(0,temp.length - 1));
    }
  },[])

  const router = useRouter();

  useEffect(() => {
    const queryParams = router.query

    if (queryParams.code) {
      let code = queryParams.code;
      LinkedinLogin(code, setLoading);
      setLoading(true);
    }

    // let temp = `${window.location.origin}${router.pathname}`
    // setCallBack(temp.substring(0,temp.length - 1));
    // handleCallback(callBack);
  }, [router, callBack]);

  const handleGoogleLogin = () => {
    console.log("google login")
  }

  const handleGoogleSignUp = async () => {
    console.log("google signup")

    await signUpWithGoogle(null)
      .then((res) => console.log(res))
      .catch((err) => console.error(err));
  }

  const handleLinkedinSignUp = () => {
    setModalIsOpen(false);

    const redirectUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${callBack}&scope=r_liteprofile%20r_emailaddress%20w_member_social`
    window.location = redirectUrl
  }

  const [loading, setLoading] = useState(false);

  // if(loading) return <LoaderPlane/>

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
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
              onClick={type === "login" ? handleGoogleLogin : handleGoogleSignUp}>
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
              onClick={handleLinkedinSignUp}>
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
          onSubmit={type === "login" ? handleLoginSubmit :handleSignUpSubmit}
        >
          <div className="flex flex-col space-y-5">
            {type === "login" ? (
              <div></div>
            ) : (
              <div className="flex gap-4 mt-5">
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
            )}
            <label htmlFor="email">
              <p className="font-small text-sm text-slate-700  ">
                Email address
              </p>
              <input
                id="email"
                name="email"
                type="email"
                value={type === "login" ? loginFormData.email : signUpFormData.email}
                onChange={type === "login" ? handleLoginChange : handleSignUpChange}
                className=" w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                placeholder="Enter email address"
                required
              />
            </label>
            <label htmlFor="password">
              <p className="font-small  text-sm text-slate-700">Password</p>
              <input
                id="password"
                name="password"
                type="password"
                title="Password should contain alphabet and number and should be between 8 to 20 characters"
                pattern="^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{8,20}$"
                value={type === "login" ? loginFormData.password : signUpFormData.password}
                onChange={type === "login" ? handleLoginChange : handleSignUpChange}
                className=" w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                placeholder="Enter your password"
                required
              />
            </label>
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
                <a className="text-sm  font-medium text-indigo-600">
                  Forgot Password?
                </a>
              </div>
            </div>
            <button
              className=" w-full py-3 font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg border-indigo-500 hover:shadow inline-flex space-x-2 items-center justify-center !mt-3"
              type="submit"
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
                  <span>{type === "login" ? "Login" : "Sign Up"}</span>
                </>
              ) : (
                <p>Loading...</p>
              )}
            </button>
            <p className="!mt-3 text-center text-sm">
              {type === "login"
                ? "Not registered yet ?  "
                : "Already Registered ?   "}

              <a
                className="text-indigo-600 font-medium inline-flex space-x-1 items-center"
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
  );
}
