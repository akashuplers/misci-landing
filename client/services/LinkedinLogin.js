import {
  LI_API_ENDPOINTS,
  API_BASE_PATH,
  API_ROUTES,
} from "../constants/apiEndpoints";

import { toast } from "react-toastify";
import axios from "axios";

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
  axios.post(`${API_BASE_PATH}${LI_API_ENDPOINTS.LI_ACCESS_TOKEN}`, {
    code: code,
    url: window.location.origin + path,
  }, {
    headers: Headers,
  })
    .then(result => result.data)
    .then(result => {
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
  axios.post(`${API_BASE_PATH}${LI_API_ENDPOINTS.LI_PROFILE}`,{ accessToken: token },{headers:Headers})
    .then((res) => res.data)
    .then((res) => {
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
      const signUpFormData = {
        firstName: res.data.localizedFirstName,
        lastName: res.data.localizedLastName,
        email: res.data.email,
        password: null,
        tempUserId: "",
      };
      const handleLoginSubmit = (email) => {
        axios.post(API_BASE_PATH + API_ROUTES.SOCIAL_LOGIN_ENDPOINT, {email: email}, {
          headers: {
            "Content-type": "application/json",
          }
        })
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
              theme: "light"
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
            "Authorization": "Bearer " + getToken
          };

          var raw = {
            query:
              "query Query {\n  me {\n    upcomingInvoicedDate\n    name\n    lastName\n    subscriptionId\n    subscribeStatus\n    paid\n    lastInvoicedDate\n    isSubscribed\n    interval\n    freeTrialDays\n    freeTrial\n    freeTrailEndsDate\n    email\n    date\n    admin\n    _id\n  credits\n  }\n}",
          };

          axios.post('https://maverick.lille.ai/graphql', raw, {
            headers: myHeaders
          })
          .then(response => response.data)
          .then(response => {
            // const json = JSON.parse(response);
            console.log(response.data.me._id);
            localStorage.setItem("userId", JSON.stringify(response.data.me._id).replace(/['"]+/g, ""));
          })
          .catch(error => console.error(error))
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
              if (
                window.location.href === "http://localhost:3000/dashboard" ||
                window.location.href ===
                  "https://maverick.lille.ai/dashboard" ||
                window.location.href ===
                  "https://pluaris-prod.vercel.app/dashboard"
              ) {
                handleSave();
              } else {
                window.location.href = "/dashboard";
              }
            }
          });
          return;
        }
      };

      var getToken;
      if (typeof window !== "undefined") {
        getToken = localStorage.getItem("token");
      }
      if (!getToken) {
        axios.post(API_BASE_PATH + API_ROUTES.CREATE_USER, signUpFormData, {
          headers: {
            "Content-type": "application/json",
          },
        })
          .then(response => {
            handleLoginSubmit(signUpFormData.email);
          })
          .catch((err) => console.error("Error: ", err))
      }
    })
    .catch((err) => console.error(err));
};
