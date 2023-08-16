import { API_BASE_PATH, API_ROUTES } from "@/constants/apiEndpoints";
import { getBlogbyIdState } from "@/graphql/queries/getBlogbyId";

interface IApiMethodsHelpers {
  text: string;
  blogId: string;
  name: string;
  email: string;

}

export const sendAComment = ({ text, blogId, name, email }: IApiMethodsHelpers) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  var getToken, getUserId, getTempId;

  if (typeof window !== 'undefined') {
    getToken = localStorage.getItem('token');
    getUserId = localStorage.getItem('userId');
    getTempId = localStorage.getItem('tempId');
  }
  var raw = JSON.stringify({
    "text": text,
    "blogId": blogId,
    "name": name,
    "email": email,
    "userId": getUserId ? getUserId : null,
  });

  var requestOptions: RequestInit = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow' as RequestRedirect,
  };
  const URL = API_BASE_PATH + API_ROUTES.BLOG_COMMENT;
  return fetch(URL, requestOptions)
    .then(response => response.json())
    .then(result => result)
    .catch(error => {
      console.log('error', error);
      return error;
    });
}


interface ApiPayload {
  blogId: string;
}
interface ApiResponse {
  type: 'SUCCESS' | 'ERROR'; // Add other possible response types if needed
  message: string;
  [key: string]: any;
}

export async function sendLikeToBlog(payload: ApiPayload): Promise<ApiResponse> {
  try {
    const myHeaders = new Headers();
    var getToken, getUserId, getTempId;
    if (typeof window !== 'undefined') {
      getToken = localStorage.getItem('token');
      getUserId = localStorage.getItem('userId');
      getTempId = localStorage.getItem('tempId');
    }
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', `Bearer ${getToken ? getToken : getTempId}`);
    const raw = JSON.stringify({
      "blogId": payload.blogId,
    });
    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    }
    const API_URL = API_BASE_PATH + API_ROUTES.BLOG_LIKE;
    const response = await fetch(API_URL, requestOptions);
    const result = await response.json();
    return result;
  } catch (error) {
    console.log('error', error);
    return {
      type: 'ERROR',
      message: 'Something went wrong',
    }
  }
}

interface ApiRequestForKeyword {
  userId: string | null;
  keyword: string;
}

// user ApiResponse and make new interface
interface IExtractKeywordsFromKeywordResponse  extends ApiResponse {
 data: [
  {
    id: string;
    url: string;
    source: string;
    keywords: string[];
  }
 ]
 pythonRespTime: number;
}
export async function extractKeywordsFromKeywords(keyword: string): Promise<IExtractKeywordsFromKeywordResponse> {
  // const url = "https://maverick.lille.ai/quickupload/keyword/extract-keywords";
  const url = API_BASE_PATH + API_ROUTES.EXTRACT_KEYWORDS_FROM_KEYWORDS;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  var getToken, getUserId, getTempId;
  if (typeof window !== 'undefined') {
    getToken = localStorage.getItem('token');
    getUserId = localStorage.getItem('userId');
    getTempId = localStorage.getItem('tempId');
  }
  const requestBody: ApiRequestForKeyword = {
    userId : getUserId || getTempId || null,
    keyword: keyword,
  };

  const requestOptions: RequestInit = {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify(requestBody),
  };

  const response = await fetch(url, requestOptions);

  if (!response.ok) {
    throw new Error(`Request failed with status: ${response.status}`);
  }

  const result: IExtractKeywordsFromKeywordResponse = await response.json();
  return result;
}
interface IUploadGoogleDriveResponse extends ApiResponse {
  [key: string]: any;
}
export async function uploadGoogleDriveURL({ url, email }: { url: string, email: string })  : Promise<IUploadGoogleDriveResponse> {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    "url": url,
    "email": email
  });

  const requestOptions: RequestInit = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  const URL = API_BASE_PATH + API_ROUTES.UPLOAD_GOOGLE_DRIVE_URL;
  try {
    const response = await fetch(URL, requestOptions);
    const result = await response.json();
    return result as ApiResponse;
  } catch (error) {
    console.log('error', error);
    return error as ApiResponse;
  }
}




interface Comment {
  _id: string;
  userId: string;
  blogId: string;
  text: string;
  name: string;
  date: string;
}

interface UserDetail {
  profileImage: string;
  linkedInUserName: string;
  twitterUserName: string;
  userName: string;
  googleUserName: string;
  name: string;
  lastName: string;
}

interface PublishData {
  tiny_mce_data: {
    children: any[]
    tag: string;
  };
  threads: string;
  published_date: string;
  published: string;
  platform: string;
  creation_date: string;
}

interface Blog {
  _id: string;
  article_id: string;
  references: { url: string; source: string }[];
  likes: number;
  comments: Comment[];
  userDetail: UserDetail;
  savedTime: string;
  freshIdeasReferences: { url: string; source: string }[];
  tags: string[];
  freshIdeasTags: string[];
  ideas: {
    blog_id: string;
    ideas: {
      used: string;
      idea: string;
      article_id: string;
      name: string;
      reference: { type: string; link: string; id: string };
    }[];
    freshIdeas: {
      used: string;
      idea: string;
      article_id: string;
      name: string;
      reference: { type: string; link: string; id: string };
    }[];
  }[];
  publish_data: any[];
}

interface FetchBlogResponse {
  fetchBlog: Blog;
  trendingTopics: string[];
  increment: number;
}


export async function fetchBlogData(blogId: string): Promise<FetchBlogResponse> {
  const graphqlQuery = getBlogbyIdState

  const graphqlVariables = {
    fetchBlogId: blogId,
  };  
  const requestOptions: RequestInit = {
    method: 'POST',
    headers : {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query: graphqlQuery, variables: graphqlVariables }),
  };

  const response = await fetch('https://maverick.lille.ai/graphql', requestOptions);
  const result = await response.json();
  console.log("RESULT FROM DATA");
  console.log(result);
  return result.data;
}