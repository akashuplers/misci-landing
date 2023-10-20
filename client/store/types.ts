export type StepCompleteData = {
  stepCompletes: {
    userId: string;
    step: StepType;
    keyword: string;
    data: any;
    __typename: string;
  };
};
export type StepType =
  | "BACKLINK_COMPLETED"
  | "CHAT_GPT_COMPLETED"
  | "FILE_UPLOAD_COMPLETED"
  | "KEYWORD_COMPLETED"
  | "URL_UPLOAD_COMPLETED"
  | "ANSWER_FETCHING_FAILED"
  | "BLOG_GENERATED_COMPLETED"
  | "BLOG_GENERATION_COMPLETED";


  

export interface LibModuleProps {
  _id: string;
  title: string;
  description: string;
  author: string;
  date: string;
  image: string;
  authorAvatar: string;
  id: string | number;
  setCurrentLibraryData?: any;
  likes: number;
  profileImage: string;
  linkedInUserName: string;
  twitterUserName: string
  userName: string;
  page: string;
  limit: string;
}