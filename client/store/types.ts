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
