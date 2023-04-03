// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { signInWithPopup } from "firebase/auth";

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
    .then((result) => {
      console.log(result);
      // do something with the result
    })
    .catch((error) => {
      console.log(error.message);
    });
};