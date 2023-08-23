import { API_BASE_PATH, API_ROUTES } from '@/constants/apiEndpoints';
import { getTimeObject } from '@/helpers/helper';
import { BlogLink, UserDataResponse } from '@/types/type';
import {create} from 'zustand';
import { meeGetState } from '@/graphql/querys/mee';
import axios from 'axios';
import { GRAPHQL_URL } from '@/constants';


interface IRePurposeFileState {
    file: File;
    id: string;
}


// Define the state type for the store
interface FileStoreState {
  selectedFiles: IRePurposeFileState[];
  setSelectedFiles: (files: IRePurposeFileState[]) => void;
  addSelectedFile: (file: IRePurposeFileState) => void;
  addMultipleSelectedFiles: (files: IRePurposeFileState[]) => void;
  removeSelectedFile: (id: string) => void;
}

// Create the Zustand store
export const useRepurposeFileStore = create<FileStoreState>((set) => ({
  selectedFiles: [],
  setSelectedFiles: (files) => set({ selectedFiles: files }),
  addSelectedFile: (file) => set((state) => ({ selectedFiles: [...state.selectedFiles, file] })),
  addMultipleSelectedFiles: (files) => set((state) => ({ selectedFiles: [...state.selectedFiles, ...files] })),
  removeSelectedFile: (id) => set((state) => ({ selectedFiles: state.selectedFiles.filter((file) => file.id !== id) })),
}));


interface BlogLinkStoreState {
    blogLinks: BlogLink[];
    setBlogLinks: (links: BlogLink[]) => void;
    addBlogLink: (link: BlogLink) => void;
    removeBlogLink: (id: string) => void;
}

export const useBlogLinkStore = create<BlogLinkStoreState>((set) => ({
    blogLinks: [],
    setBlogLinks: (links) => set({ blogLinks: links }),
    addBlogLink: (link) => set((state) => {
        console.log('addBlogLink', link);
        console.log('state', state);
        return { blogLinks: [...state.blogLinks, link] };
    }),
    removeBlogLink: (id) => set((state) => ({ blogLinks: state.blogLinks.filter((link) => link.id !== id) })),
}));

// make a [] of functions,


interface SideBarChangeFunctionsState {
  functionsToRun: (() => void)[];
  addFunction: (func: () => void) => void;
  removeFunction: (func: () => void) => void;
  runFunctions: () => void;
}
export const useSideBarChangeFunctions = create<SideBarChangeFunctionsState>((set) => ({
  functionsToRun: [],
  addFunction: (func) => set((state) => ({ functionsToRun: [...state.functionsToRun, func] })),
  removeFunction: (func) => set((state) => ({ functionsToRun: state.functionsToRun.filter((f) => f !== func) })),
  runFunctions: () => set((state) => {
    state.functionsToRun.forEach((func) => func());
    return { functionsToRun: [] };
  }),
}));

interface UserTimeSave {
  Day: {
      hours: number;
      minutes: number;
  };
  Week: {
      hours: number;
      minutes: number;
  };
  Month: {
      hours: number;
      minutes: number;
  };
}

const initailUserTimeSave: UserTimeSave = {
  Day: {
      hours: 0,
      minutes: 0,
  },
  Week: {
      hours: 0,
      minutes: 0,
  },
  Month: {
      hours: 0,
      minutes: 0,
  },
};

type UserTimeSaveStore = {
  userTimeSave: UserTimeSave;
  loading: boolean;
  error: any;
  refetchData: () => void;
};

export const useUserTimeSaveStore = create<UserTimeSaveStore>((set) => ({
  userTimeSave: initailUserTimeSave,
  loading: true,
  error: null,
  refetchData: async () => {
    set({ loading: true, error: null });
    const URL = API_BASE_PATH + API_ROUTES.GET_SAVED_TIME;
    const headers = new Headers();
    const getToken = localStorage.getItem('token');

    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${getToken}`);

    try {
      const response = await fetch(URL, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        set({ loading: false, error: new Error('Network response was not ok') });
        return;
      }

      const jsonData = await response.json();
      const improvedData = {
        Day: getTimeObject(jsonData.data.oneDaySavedTime),
        Week: getTimeObject(jsonData.data.oneWeekSavedTime),
        Month: getTimeObject(jsonData.data.oneMonthSavedTime),
      };
      set({ userTimeSave: improvedData, loading: false, error: null });
    } catch (error) {
      set({ error, loading: false });
    }
  },
}));


interface IUserDataStore {
  userData: UserDataResponse | null;
  loading: boolean;
  fetchUserData: (token: string) => void;
}

// Define the store
export const useUserDataStore = create<IUserDataStore>((set) => ({
  userData: null,
  loading: false,

  fetchUserData: async (token: string) => {
    set({ loading: true });
    try {
      const response = await axios.post<UserDataResponse>(
        API_BASE_PATH+ API_ROUTES.GQL_PATH,   
        {
          query: meeGetState,
        },
        {
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${token}`
          },
        }
      );
      console.log(response.data);
      set({ userData: response.data, loading: false });
    } catch (error) {
      console.error('Error fetching user data:', error);
      set({ loading: false });
    }
  },
}));
 

interface ApiResponseForTotalSavedTime {
  type: string;
  message: string;
  data: {
    totalSavedTime: string;
  };
  error: string;
}

interface TotalSavedTimeState {
  data: ApiResponseForTotalSavedTime | null;
  isLoading: boolean;
  error: string | null;
  fetchTotalSavedTime: () => Promise<void>;
}

export const useTotalSavedTimeStore = create<TotalSavedTimeState>((set) => ({
  data: null,
  isLoading: false,
  error: null,
  fetchTotalSavedTime: async () => {
    set({ isLoading: true, error: null });

    try {
      const requestOptions: RequestInit = {
        method: 'GET',
        redirect: 'follow',
      };

      const response = await fetch(API_BASE_PATH + API_ROUTES.TOTAL_TIME, requestOptions);

      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }
      const data = await response.json();
      data.data.totalSavedTime = parseInt(data.data.totalSavedTime.split(':')[0], 10);
      const result: ApiResponseForTotalSavedTime = data;
      set({ data: result, isLoading: false });
    } catch (error : any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));

interface FileUploadState {
  showFileStatus: boolean;
  setShowFileStatus: (show: boolean) => void;  
  setFileConfig: (newFileData: FileType[]) => void;
  uploadedFilesData : FileType[]; 
}
export interface FileType {
  name: string;
  size: string;
  id:string;
  percentage: number;
}

export const useFileUploadStore = create<FileUploadState>((set) => ({
  showFileStatus: false,
  setShowFileStatus: (show) => set({ showFileStatus: show }),
  uploadedFilesData : [],
  setFileConfig: (newFileData) => set({ uploadedFilesData: newFileData }),
}));

interface  GenerateState {
  nodeResponseTime: number;
  pythonResponseTime: number;
  userTimeSave: number;
  updateTime : (nodeTime: number, pythonTime: number, time:number) => void;
}

const DEFAULT_TIME_MULTIPLE = 30;
export const useGenerateState = create<GenerateState>((set) => ({ 
  nodeResponseTime: 0,
  pythonResponseTime: 0,
  userTimeSave: 0,
  updateTime: (nodeTime, pythonTime, time) => set({
    nodeResponseTime: nodeTime,
    pythonResponseTime: pythonTime,
    userTimeSave: time ===0? time*DEFAULT_TIME_MULTIPLE : DEFAULT_TIME_MULTIPLE
   }),
}));