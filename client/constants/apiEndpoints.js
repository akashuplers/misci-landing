export const API_BASE_PATH = "https://maverick.lille.ai";

export const API_ROUTES = {
  TEMP_ID: "/auth/temp/user",
  URL_INSIGHTS: "/auth/url-upload",
  ARTICLE: "/auth/article",
  CREATE_COMPANY: "/auth/company/create",
  CREATE_USER: "/auth/user/create",
  LOGIN_ENDPOINT: "/auth/user/login",
  SOCIAL_LOGIN_ENDPOINT: "/auth/user/social/login",
  UPDATE_PROFILE: "/auth/update-profile",
  URL_UPLOAD: "/quickupload/urls",
  KEYWORD_UPLOAD: "/quickupload/keyword",
  FILE_UPLOAD: "/quickupload/files",
  IMAGE_UPLOAD: "/upload/image/base64",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset",
  GQL_PATH: "/graphql",
  TEMP_USER: "/auth/request-trial",
  EXTRACT_KEYWORDS: "/quickupload/urls/extract-keywords",
  EXTRACT_KEYWORDS_FROM_KEYWORDS: "/quickupload/keyword/extract-keywords",
  EXTRACT_KEYWORDS_FROM_FILE: "/quickupload/files/extract-keywords",
  GET_SAVED_TIME: "/auth/saved-time",
  ADD_SAVED_TIME: "/auth/add-time-saved",
  BLOG_COMMENT: "/blog/comment",
  BLOG_LIKE: "/blog/like",
  TOTAL_TIME: "/auth/total-saved-time",
  UPLOAD_GOOGLE_DRIVE_URL: "/upload/drive-link",
  NEW_GENERATE_API: "/auth/generate",
  MISCI_GENERATE: "/misci-routes/generate",
  MISCI_REGENERATE: "/misci-routes/re-generate",
  MISCI_PUBLISH: '/misci-routes/publish',
  MISCI_TOP_ALL: '/misci-routes/top-questions',
  DELETE_REF_SOURCES: '/auth/remove-sources',
  MISCI_SAVE: '/misci-routes/blog/save',
};

export const LI_API_ENDPOINTS = {
  TW_ACCESS_TOKEN: "/auth/twitter/access-token",
  ARTICLE: "/auth/landing/article",
  LI_POST: "/auth/linkedin/post",
  LI_ACCESS_TOKEN: "/auth/linkedin/token",
  LI_PROFILE: "/auth/linkedin/me",
  TW_PROFILE: "/auth/twitter/me",
  TW_POST: "/auth/twitter/post",
};

export const LOCAL_STORAGE_KEYS = {
  THEME: "Theme",
  ACCESS_TOKEN: "accessToken",
};

export const LINKEDIN_CLIENT_ID = "868bordkbw6hm6";

export const LINKEDIN_CLIENT_SECRET = "kOALvAhpSOkYx4MN";

export const GQL_SUBSCRIPTION_ENDPOINT = "wss://lille.ai/graphql";