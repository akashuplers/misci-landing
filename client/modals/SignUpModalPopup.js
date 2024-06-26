import React, { useState } from "react";
import Modal from "react-modal";
import { API_BASE_PATH, API_ROUTES } from "../constants/apiEndpoints";

export default function SignUpModalPopup(modalIsOpen, setModalIsOpen) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    "firstName": "",
    "lastName": "",
    "email": "",
    "password": "",
    "tempUserId": ""
  })

  const openModal = (url) => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleSubmit = async (event) => {
    setSubmitting(true);
    event.preventDefault();
    fetch(API_BASE_PATH + API_ROUTES.CREATE_USER, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(res => afterCreateUser(res))
      .catch(err => console.error("Error: ", err))
      .finally(() => {
        setSubmitting(false)
        setModalIsOpen(false)
      })

    function afterCreateUser(res) {
      fetch(API_BASE_PATH + API_ROUTES.LOGIN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          "email": formData.email,
          "password": formData.password
        })
      }).then(res => res.json())
        .then(data => localStorage.setItem("data", JSON.stringify(data)))
        .catch(err => console.error("Error: ", err))
        .finally(() => {
          setFormData({
            "firstName": "",
            "lastName": "",
            "email": "",
            "password": "",
            "tempUserId": ""
          })
        })
      return console.log("Success: ", res);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => {
      return {
        ...prev,
        [name]: value
      }
    })
  };

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      ariaHideApp={false}
      className="w-[100%] sm:w-[38%] h-[90%]"
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
      <div className="max-w-lg mx-auto my-10 bg-white p-8 py-2 rounded-xl 
      ">
        {/* shadow shadow-slate-300 */}
        <h1 className="text-4xl font-medium p-2">Sign Up</h1>
        <p className="text-slate-500 p-2">Hi, Welcome back 👋</p>

        <div className="my-5">
          <button className="p-2 w-full text-center py-3 my-3 border flex space-x-2 items-center justify-center border-slate-200 rounded-lg text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:shadow transition duration-150">
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              className="w-6 h-6 pl-2"
              alt=""
            />{" "}
            <span className="p-4 py-2">Sign Up with Google</span>
          </button>
        </div>
        <form
          action=""
          method="post"
          className="my-10 p-2"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col space-y-5">
            <div className="flex gap-4">
              <label htmlFor="firstName">
                <p className="font-medium text-slate-700 pb-2 p-2">
                  First Name
                </p>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="border-black p-2 w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                  placeholder="Enter First Name"
                  required
                />
              </label>
              <label htmlFor="lastName">
                <p className="font-medium text-slate-700 pb-2 p-2">
                  Last Name
                </p>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="p-2 w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                  placeholder="Enter Last Name"
                  required
                />
              </label>
            </div>
            <label htmlFor="email">
              <p className="font-medium text-slate-700 pb-2 p-2">
                Email address
              </p>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="p-2 w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                placeholder="Enter email address"
              />
            </label>
            <label htmlFor="password">
              <p className="p-2 font-medium text-slate-700 pb-2">Password</p>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="p-2 w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                placeholder="Enter your password"
              />
            </label>
            <div className="flex flex-row justify-between py-4">
              <div>
                <label htmlFor="remember" className="pr-4">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 border-slate-200 focus:bg-indigo-600"
                  />
                  <p className="pl-1 inline-block">Remember me</p>
                </label>
              </div>
              <div>
                <a href="#" className="p-2 font-medium text-indigo-600">
                  Forgot Password?
                </a>
              </div>
            </div>
            {/* <button 
              className="p-2 w-full py-3 font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg border-indigo-500 hover:shadow inline-flex space-x-2 items-center justify-center"
              type="submit">
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
              <span>Sign Up</span>
            </button> */}
            <button
              className="p-2 w-full py-3 font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg border-indigo-500 hover:shadow inline-flex space-x-2 items-center justify-center"
              type="submit">
              {!submitting ?
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
                  <span>Login</span>
                </> :
                <p>Loading...</p>
              }
            </button>
            <p className="my-auto text-center py-4 text-sm">
              Already Registered ?{" "}
              <a
                href="#"
                className="text-indigo-600 font-medium inline-flex space-x-1 items-center"
              >
                <span>Sign Up</span>
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
