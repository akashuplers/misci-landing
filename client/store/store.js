// store.js
import axios from "axios";
import {create} from "zustand";
import { API_BASE_PATH, API_ROUTES } from "@/constants/apiEndpoints";

const useStore = create((set) => ({
  keyword: '',
  tempId: {},
  isAuthenticated: false,
  setKeyword: (keyword) => set({ keyword }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  updateAuthentication: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      set({ isAuthenticated: token && token !== "undefined" && token !== "null" });
    }
  },
  changeTempId: async () => {
    await axios
      .get(API_BASE_PATH + API_ROUTES.TEMP_ID)
      .then((res) => {
        set({ tempId: res.data.data });
      })
      .catch((err) => toast.error(err));
  },
}));

export default useStore;
