// Import Axios and any other necessary modules
import axios from "axios";
import { API_BASE_PATH, API_ROUTES } from "@/constants/apiEndpoints";

// Create an Axios instance
const http = axios.create({
  baseURL: API_BASE_PATH,
});

// Define an interceptor to add the Authorization header
http.interceptors.request.use(
  (config) => {
    // Get the token from local storage
    const token = "asldkfjasldfjalsdkjflasdjflsjdfaldsf"; // Assuming you've stored the token as 'userToken' in local storage

    // If a token exists, add it to the request header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default http;
