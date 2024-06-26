import {
  LI_API_ENDPOINTS,
  API_BASE_PATH,
  API_ROUTES,
} from "../constants/apiEndpoints";

import { toast } from "react-toastify";
import axios from "axios";
import { meeGetState } from "@/graphql/querys/mee";

const Headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
  "Access-Control-Allow-Headers":
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers",
};

export const LinkedinLogin = (code, loaderFunction, handleSave) => {
  console.log("called LinkedinLogin");
  const path = window.location.pathname === "/" ? "" : "/dashboard";


  axios
    .post(
      `${API_BASE_PATH}${LI_API_ENDPOINTS.LI_ACCESS_TOKEN}`,
      {
        code: code,
        url: window.location.origin + path,
      },
      {
        headers:Headers
      }
    )
    .then((result) => result.data)
    .then((result) => {
      if (result?.data)
        linkedinUserDetails(
          result.data.access_token,
          loaderFunction,
          handleSave
        );
    })
    .catch((err) => console.error(err));
};

const linkedinUserDetails = async (token, loaderFunction, handleSave) => {
  console.log("linkedinUserDetails");
  localStorage.setItem("linkedInAccessToken", token);

  var getToken = localStorage.getItem('token')


  const modifiedHeaders = {
    ...Headers,
  }
  if (typeof window !== "undefined") {
    getToken = localStorage.getItem("token");

    if (getToken) {
      modifiedHeaders['Authorization'] = `Bearer ${getToken}`
    }

  }

  axios
    .post(
      `${API_BASE_PATH}${LI_API_ENDPOINTS.LI_PROFILE}`,
      { accessToken: token },
      { headers: modifiedHeaders }
    )
    .then((res) => res.data)
    .then((res) => {
      var getToken;
      if (typeof window !== "undefined") {
        getToken = localStorage.getItem("token");
      }
      if (res.statusCode === 401) {
        toast.error("Error..Please login again", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
      localStorage.setItem(
        "authorId",
        JSON.stringify(res.data.id).replace(/['"]+/g, "")
      );

      const handleLoginSubmit = (email) => {
        axios
          .post(
            API_BASE_PATH + API_ROUTES.SOCIAL_LOGIN_ENDPOINT,
            { email: email },
            {
              headers: {
                "Content-type": "application/json",
              },
            }
          )
          .then((response) => {
            const data = response.data;
            console.log(data);
            if (data?.data?.accessToken) {
              toast.success("Successfully Logged in with Linkedin", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
              });
              redirectPageAfterLogin(data);
              return true;
            }
          })
          .catch((error) => {
            console.error("Error: ", error);
          })
          .finally(() => {
            // setSubmitting(false);
            // setLoginFormData({
            //   email: "",
            //   password: "",
            // });
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

          const myHeaders = {
            "content-type": "application/json",
            Authorization: "Bearer " + getToken,
          };

          var raw = {
            query:
            meeGetState};

          axios
            .post(API_BASE_PATH + API_ROUTES.GQL_PATH, raw, {
              headers: myHeaders,
            })
            .then((response) => response.data)
            .then((response) => {
              // const json = JSON.parse(response);
              console.log(response.data.me._id);
              localStorage.setItem(
                "userId",
                JSON.stringify(response.data.me._id).replace(/['"]+/g, "")
              );
            })
            .catch((error) => console.error(error))
            .finally(() => {
              if (typeof window !== "undefined") {
                const pass = localStorage.getItem("pass");
                if (pass) {
                  localStorage.removeItem("pass");
                }
              }
              if (window.location.pathname === "/") {
                window.location.href = "/";
              } else {
                // if (window.location.pathname === "dashboard") {
                  if(window.location.pathname.includes("/dashboard")){
                  handleSave();
                } else {
                  window.location.href = "/dashboard";
                }
              }
            });
          return;
        }
      };

      const signUpFormData = {
        firstName: res.data.localizedFirstName,
        lastName: res.data.localizedLastName,
        email: res.data.email,
        password: null,
        tempUserId: "",
        linkedInUserName: res.data.localizedFirstName+res.data.localizedFirstName + (Math.floor(Math.random() * 900) + 100)
      };

      if (!getToken) {
        axios
          .post(API_BASE_PATH + API_ROUTES.CREATE_USER, signUpFormData, {
            headers: {
              "Content-type": "application/json",
            },
          })
          .then((response) => {
            handleLoginSubmit(signUpFormData.email);
          })
          .catch((error) => {
            const errorMessage =
              error.response.data.error && error.response.data.message;
            if (errorMessage == "User already exists") {
              handleLoginSubmit(signUpFormData.email);
            }
            console.error("Error : ", error.response);
          });
      } else {
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      }
    })
    .catch((err) => console.error(err));
};
