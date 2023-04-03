// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { signInWithPopup } from "firebase/auth";
import {  API_BASE_PATH, API_ROUTES } from "../constants/apiEndpoints";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIn2tElSzYGwqsvGTi5HEialT1bctkdgU",
  authDomain: "nowigence-web3.firebaseapp.com",
  projectId: "nowigence-web3",
  storageBucket: "nowigence-web3.appspot.com",
  messagingSenderId: "646561502574",
  appId: "1:646561502574:web:ce8edc8866acfae580dd7f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const signUpWithGoogle = (callback) => {
  signInWithPopup(auth, googleProvider)
    .then(res => {
        const arr = res.user.displayName.split(" ")
        const firstName = arr[0]
        const lastName = arr[1]
        const signUpFormData = {
            firstName,
            lastName,
            email: res.user.email,
            password: null,
            tempUserId: "",
        }
        console.log(signUpFormData)
        const handleLoginSubmit = (email) => {
            fetch(API_BASE_PATH + API_ROUTES.SOCIAL_LOGIN_ENDPOINT, {
                method: "POST",
                headers: {
                "Content-type": "application/json",
                },
                body: JSON.stringify({
                    email: email
                }),
            })
                .then((res) => res.json())
                .then((data) => redirectPageAfterLogin(data))
                .catch((err) => console.error("Error: ", err))
                .finally(() => {
                    // setModalIsOpen(false);
                    // setLoginFormData({
                    //     email: "",
                    //     password: "",
                    // });
                });

            function redirectPageAfterLogin(data) {  
                console.log(data) 

                localStorage.setItem("token",JSON.stringify(data.data.accessToken).replace(/['"]+/g, ""));       

                var raw = JSON.stringify({
                query:
                    "query Query {\n  me {\n    upcomingInvoicedDate\n    name\n    lastName\n    subscriptionId\n    subscribeStatus\n    paid\n    lastInvoicedDate\n    isSubscribed\n    interval\n    freeTrialDays\n    freeTrial\n    freeTrailEndsDate\n    email\n    date\n    admin\n    _id\n  credits\n  }\n}",
                });

                fetch("https://maverick.lille.ai/graphql", {
                    method: "POST",
                    headers: {
                        "content-type" : "application/json",
                        "Authorization" : "Bearer " +  localStorage.getItem("token")
                    },
                    body: raw,
                    redirect: "follow",
                })
                .then((response) => response.text())
                .then((result) => {
                    console.log("Succesfully Logged In")
                    const json = JSON.parse(result);
                    localStorage.setItem("userId", JSON.stringify(json.data.me._id).replace(/['"]+/g, ""));
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
        fetch(API_BASE_PATH + API_ROUTES.CREATE_USER, {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify(signUpFormData),
            })
            .then((res) => res.json())
            .then((res) => {
                console.log(res);
                // if(res.error === true) return

                console.log('Succesfully signed up')
                handleLoginSubmit(signUpFormData.email);                
            })
            .catch((err) => console.error("Error: ", err))
            .finally(() => {
                // setSubmitting(false);
                // setSignUpFormData({
                // firstName: "",
                // lastName: "",
                // email: "",
                // password: "",
                // tempUserId: "",
                // });
                // setModalIsOpen(false);
            });
    })
    .catch((error) => {
      console.log(error.message);
    });
};