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
  URL_UPLOAD: "/quickupload/url",
  KEYWORD_UPLOAD: "/quickupload/keyword",
  FILE_UPLOAD: "/quickupload/file",
  IMAGE_UPLOAD: "/upload/image/base64",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset",
  GQL_PATH: "/graphql",
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

export const GQL_SUBSCRIPTION_ENDPOINT = "wss://maverick.lille.ai/graphql";
