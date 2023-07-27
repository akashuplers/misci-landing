import { API_BASE_PATH, API_ROUTES } from "@/constants/apiEndpoints";

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
        "userId": (getToken ? getUserId : getTempId) || null
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
      const requestOptions : RequestInit = {
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