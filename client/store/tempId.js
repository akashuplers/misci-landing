import axios from "axios";
import { create } from "zustand";

import { API_BASE_PATH, API_ROUTES } from "@/constants/apiEndpoints";

const useTempId = create((set) => ({
  tempId: {},
  changeTempId: async () => {
    await axios
      .get(API_BASE_PATH + API_ROUTES.TEMP_ID)
      .then((res) => {
        set({ tempId: res.data.data });
      })
      .catch((err) => toast.error(err));
  },
}));

export default useTempId;
