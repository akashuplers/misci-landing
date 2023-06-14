// store.js
import { API_BASE_PATH, API_ROUTES } from "@/constants/apiEndpoints";
import axios from "axios";
import create from "zustand";

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
  updateisSavefalse: () => {
    set({ isSave: false });
    console.log("state changed");
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
        "query Query {\n  me {\n    upcomingInvoicedDate\n    name\n    lastName\n    subscriptionId\n    subscribeStatus\n    paid\n    lastInvoicedDate\n    isSubscribed\n  profileImage\n   interval\n    freeTrialDays\n    freeTrial\n    freeTrailEndsDate\n    email\n    date\n    admin\n    _id\n  credits\n  prefFilled\n totalCredits\n }\n}",
    });
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: API_BASE_PATH + API_ROUTES.GQL_PATH,
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

export const useByMeCoffeModal = create((set) => ({
  isOpen: false,
  toggleModal: () => set((state) => ({ isOpen: !state.isOpen })),
}));

export const useTwitterThreadALertModal = create((set) => ({
  isOpen: true,
  // toggle takes two params, remaining_twitter_quota, total_twitter_quota, isUserpaid
  initailText: (isPaid, thisMuch) => `You can only create ${thisMuch} tweets for  today, you can save for now.`,
  remaining_twitter_quota: 0,
  showInitailText: true,
  total_twitter_quota: 0,
  isUserpaid: false,
  togggleShowInitailText: (status) =>
    set((state) => ({
      showInitailText: status,
    })),
  toggleModal: (status) =>
    set((state) => ({
      isOpen: status,
    })),
  setOptions: (remaining_twitter_quota, total_twitter_quota, isUserpaid) =>
    set((state) => ({
      remaining_twitter_quota: remaining_twitter_quota,
      total_twitter_quota: total_twitter_quota,
      isUserpaid: isUserpaid,
    })),
}));

export const MeeDataStore = create((set) => ({
  meeData: {},
  setmeeData: (meeData) => set({ meeData }),
}));

export const useUserData = () => {
  const { meeData, setmeeData } = MeeDataStore();

  const getUserData = () => meeData;

  const updateUserData = (newUserData) => setmeeData(newUserData);

  return {
    meeData,
    getUserData,
    updateUserData,
  };
};
export const useThreadsUIStore = create((set) => ({
  // const [showTwitterThreadUI, setShowTwitterThreadUI] = useState(false);
  // 
  showTwitterThreadUI: false,
  setShowTwitterThreadUI: (showTwitterThreadUI) =>
    set({ showTwitterThreadUI }),
}));

// toggle REgenbutton
export const useRegenButtonStore = create((set) => ({
  stateOfRegenButton: false,
  setStateOfRegenButton: (stateOfRegenButton) =>
    set({ stateOfRegenButton }),
}));

// const [twitterThreadData, setTwitterThreadData] = useState([]);
// 
export const useTwitterThreadStore = create((set) => ({
  twitterThreadData: [],
  setTwitterThreadData: (twitterThreadData) => set({ twitterThreadData }),
}));

// tab option
export const useTabOptionStore = create((set) => ({
  option: "blog",
  setOption: (option) => set({ option }),
}));

// set blog data
export const useBlogDataStore = create((set) => ({
  // const [blogData, setBlogData] = useState([]);
  blogData: [],
  setBlogData: (blogData) => set({ blogData }),
}));