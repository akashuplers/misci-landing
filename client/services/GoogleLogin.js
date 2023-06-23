// Import the functions you need from the SDKs you need
import axios from "axios";
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { toast } from "react-toastify";
import { API_BASE_PATH, API_ROUTES } from "../constants/apiEndpoints";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIn2tElSzYGwqsvGTi5HEialT1bctkdgU",
  authDomain: "nowigence-web3.firebaseapp.com",
  projectId: "nowigence-web3",
  storageBucket: "nowigence-web3.appspot.com",
  messagingSenderId: "646561502574",
  appId: "1:646561502574:web:ce8edc8866acfae580dd7f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const signUpWithGoogle = (handleSave, blogId) => {
  signInWithPopup(auth, googleProvider)
    .then((res) => {
      const arr = res.user.displayName.split(" ");
      const firstName = arr[0];
      const lastName = arr[1];
      const signUpFormData = {
        firstName,
        lastName,
        email: res.user.email,
        password: null,
        tempUserId: "",
      };
      console.log(signUpFormData);
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
              toast.success("Successfully Logged in with Google", {
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
              "query Query {\n  me {\n    upcomingInvoicedDate\n    name\n    lastName\n    subscriptionId\n    subscribeStatus\n    paid\n    lastInvoicedDate\n    isSubscribed\n    interval\n    freeTrialDays\n    freeTrial\n    freeTrailEndsDate\n    email\n    date\n    admin\n    _id\n  credits\n  }\n}",
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
            console.log('reached here', response.data.me._id).replace(/['"]+/g, "",  response.data.me.credits )
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
                if (window.location.pathname === "/dashboard") {
                  handleSave();
                  window.location.href = "/dashboard/" + blogId;
                } else {
                  window.location.href = "/";
                }
              }
            });
          return;
        }
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
    })
    .catch((error) => {
      console.log(error.message);
    });
};
