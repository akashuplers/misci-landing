// store.js
import axios from "axios";
import create from "zustand";
import { API_BASE_PATH, API_ROUTES } from "@/constants/apiEndpoints";

const useStore = create((set) => ({
  creditLeft: "",
  keyword: "",
  tempId: {},
  isAuthenticated: false,
  isSave: false,
  setisSave: (isSave) => set({ isSave }),
  setKeyword: (keyword) => set({ keyword }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setCreditLeft: (creditLeft) => set({ creditLeft }),
  updateisSave: () => {
    set({ isSave: true });
  },
  updateAuthentication: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      set({
        isAuthenticated: token && token !== "undefined" && token !== "null",
      });
    }
  },
  updateCredit: async () => {
    let data = JSON.stringify({
      query:
        "query Query {\n  me {\n    upcomingInvoicedDate\n    name\n    lastName\n    subscriptionId\n    subscribeStatus\n    paid\n    lastInvoicedDate\n    isSubscribed\n  profileImage\n   interval\n    freeTrialDays\n    freeTrial\n    freeTrailEndsDate\n    email\n    date\n    admin\n    _id\n  credits\n  prefFilled\n }\n}",
    });
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://maverick.lille.ai/graphql",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + token,
        },
        data: data,
      };

      await axios
        .request(config)
        .then((res) => {
          console.log("res?.data?.me?.credits", res?.data?.data?.me?.credits);
          set({ creditLeft: res?.data?.data?.me?.credits });
        })
        .catch((error) => {
          console.log(error);
        });
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
