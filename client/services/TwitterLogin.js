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

export const TwitterLogin = (verifier, token, loaderFunction, handleSave) => {
  console.log("called TwitterLogin");
  axios
    .post(
      `${API_BASE_PATH}${LI_API_ENDPOINTS.TW_ACCESS_TOKEN}`,
      {
        verifier: verifier,
        token: token,
      },
      {
        headers: Headers,
      }
    )
    .then((result) => result.data)
    .then((result) => {
      console.log("result", result);
      if (result?.data) {
        const accessData = result.data.split("&");
        const accessToken = accessData[0];
        const accessTokenSecret = accessData[1];
        TwitterUserDetails(
          accessToken,
          accessTokenSecret,
          loaderFunction,
          handleSave
        );
      }
    })
    .catch((err) => console.error(err));
};

const TwitterUserDetails = async (
  accessToken,
  accessTokenSecret,
  loaderFunction,
  handleSave
) => {
  console.log("TwitterUserDetails");
  localStorage.setItem("twitterAccessToken", accessToken);
  localStorage.setItem("twitterAccessTokenSecret", accessTokenSecret);
  var getToken;
  if (typeof window !== "undefined") {
    getToken = localStorage.getItem("token");
  }
  Headers["Authorization"] = `Bearer ${getToken}`;
  
  axios
    .post(
      `${API_BASE_PATH}${LI_API_ENDPOINTS.TW_PROFILE}`,
      { token: accessToken, secret: accessTokenSecret },
      { headers: Headers }
    )
    .then((res) => res.data)
    .then((res) => {
      console.log("result-res", res);
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
              toast.success("Successfully Logged in with Twitter", {
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
              "query Query {\n  me {\n    upcomingInvoicedDate\n    name\n    lastName\n    subscriptionId\n    subscribeStatus\n    paid\n    lastInvoicedDate\n    isSubscribed\n    interval\n    freeTrialDays\n    freeTrial\n    freeTrailEndsDate\n    email\n    date\n    admin\n    _id\n  credits\n  prefFilled\n  profileImage\n  }\n}",
          };

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
                if (window.location.pathname === "dashboard") {
                  handleSave();
                } else {
                  window.location.href = "/dashboard";
                }
              }
            });
          return;
        }
      };

      if (!getToken) {
        const signUpFormData = {
          firstName: res?.data?.localizedFirstName,
          lastName: res?.data?.localizedLastName,
          email: res?.data?.email,
          password: null,
          twitter: res?.data?.localizedFirstName+res?.data?.localizedLastName+ (Math.floor(Math.random() * 900) + 100),
          tempUserId: "",
        };
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
