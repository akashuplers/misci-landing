// Import the functions you need from the SDKs you need
import "firebase/auth"
import { initializeApp } from "firebase/app";
import firebase from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
export let firebaseAuth;
if(firebase !== undefined){
    firebaseAuth = firebase.auth();
}
const googleProvider = new firebase.auth.GoogleAuthProvider();
export const signInWithGoogle = (login, keywords, setLoading) => {
  firebaseAuth
    .signInWithPopup(googleProvider)
    .then((res) => {
      const { family_name, given_name } = res.additionalUserInfo.profile;
      const companyNameData = `${given_name} ${family_name} ${Date.now()}`;
      const userEmail = res.user.email;
      userDetails = {
        ...userDetails,
        email: res.user.email,
        given_name: given_name,
        family_name: family_name,
      };
      login
        ? socialLogin()
        : createCompany(companyNameData, userEmail, keywords);
    })
    .catch((error) => {
      setLoading?.(false);
      console.log(error.message);
    });
};



