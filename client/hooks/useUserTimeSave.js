import { useUserTimeSaveStore } from "@/store/store";

export const useUserTimeSave = () => {
  const { userTimeSave, loading, error, refreshData } = useUserTimeSaveStore();
  return { userTimeSave, loading, error, refreshData };
};