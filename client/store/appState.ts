import { BlogLink } from '@/pages';
import {create} from 'zustand';


interface IRePurposeFileState {
    file: File;
    id: string;
}


// Define the state type for the store
interface FileStoreState {
  selectedFiles: IRePurposeFileState[];
  setSelectedFiles: (files: IRePurposeFileState[]) => void;
  addSelectedFile: (file: IRePurposeFileState) => void;
  removeSelectedFile: (id: string) => void;
}

// Create the Zustand store
export const useRepurposeFileStore = create<FileStoreState>((set) => ({
  selectedFiles: [],
  setSelectedFiles: (files) => set({ selectedFiles: files }),
  addSelectedFile: (file) => set((state) => ({ selectedFiles: [...state.selectedFiles, file] })),
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
