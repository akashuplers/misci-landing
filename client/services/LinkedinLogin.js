// import { createCompany } from "../v2/Pages/Login/NewLogin/createCompany";
// import { generatePDF } from "../v2/util/generatePDF";
// import { createUser, socialLogin } from "./signUpUser";
// import { REST_BASE_ENDPOINT, API_ENDPOINTS } from "../constants";
// import { axios } from "../utils/axiosConfig";

// let createUserPayload = {
//   firstName: "",
//   lastName: "",
//   password: "",
//   email: "",
//   keys: "technology trends, green healthcare, alternate careers, climate control, super foods",
// };

// export const fetchLinkedInDetails = async (code, loaderFunction, login) => {
//   const checkForDownload = localStorage.getItem("downloadPdf");
//   if (checkForDownload) {
//     generatePDF();
//     localStorage.removeItem("downloadPdf");
//   }

//   axios.post(`${REST_BASE_ENDPOINT}${API_ENDPOINTS.LI_ACCESS_TOKEN}`,{
//     code: code,
//     url: window.location.origin + window.location.pathname,
//   }, {
//     headers: {
//       "Content-Type": "application/json",
//       "Access-Control-Allow-Origin": "*",
//       "Access-Control-Allow-Credentials": "true",
//       "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
//       "Access-Control-Allow-Headers":
//         "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers",
//     }
//   })
//     .then((result) => {
//       if(result?.data)
//         linkedinUserDetails(result.data.data.access_token, login, loaderFunction)
//       }
//     )
//     .catch((error) => {
//       loaderFunction(false);
//     });
// };

// const linkedinUserDetails = async (token, login, loaderFunction) => {
//   localStorage.setItem("linkedInAccessToken", token);
//   axios.post(`${REST_BASE_ENDPOINT}${API_ENDPOINTS.LI_PROFILE}`, {
//       accessToken: token
//   }, {
//     headers: {
//       "Content-Type": "application/json",
//       "Access-Control-Allow-Origin": "*",
//       "Access-Control-Allow-Credentials": "true",
//       "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
//       "Access-Control-Allow-Headers":
//         "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers",
//     },
//   })
//     .then((result) => {
//       if(result?.data) {
//         createUserPayload.firstName = result.data.data.localizedFirstName;
//         createUserPayload.lastName = result.data.data.localizedLastName;
//         createUserPayload.email = result.data.data.email;
//         createUserPayload.keys = localStorage.getItem("summaryKeywords");
//         login
//           ? socialLogin(result.data.data.email, loaderFunction)
//           : createCompany(
//               createUserPayload.firstName,
//               createUserPayload.lastName,
//               createUser,
//               createUserPayload,
//               loaderFunction,
//               createUserPayload.email
//             ).then((res) => {
//               if (res === "This email already exists.") {
//                 socialLogin(result.data.data.email, loaderFunction);
//               }
//             });
//       }
//     })
//     .catch((error) => console.log("error", error));
// };
