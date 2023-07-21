import { API_BASE_PATH, API_ROUTES, LINKEDIN_CLIENT_ID } from "@/constants/apiEndpoints";
import axios from "axios";

export const htmlToJson = (htmlString, imageURL) => {
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(htmlString, "text/html");
  function nodeToJson(node) {
    const json = {
      tag: node.tagName,
      attributes: {},
      children: [],
    };
    for (let i = 0; i < node.attributes.length; i++) {
      const attribute = node.attributes[i];

      if (node.tagName === "A") {
        if (attribute.name === "href" && imageURL) {
          json.attributes[attribute.name] = "#";
        } else {
          json.attributes[attribute.name] = attribute.value;
        }
      } else {
        json.attributes[attribute.name] = attribute.value;
      }
    }
    for (let i = 0; i < node.childNodes.length; i++) {
      const childNode = node.childNodes[i];
      if (childNode.nodeType === 1) {
        json.children.push(nodeToJson(childNode));
      } else if (childNode.nodeType === 3) {
        const text = childNode.nodeValue;
        if (text.trim().length > 0) {
          json.children.push(text);
        }
      }
    }
    return json;
  }

  return nodeToJson(htmlDoc.body);
};

export const jsonToHtml = (jsonObj) => {
  if (!jsonObj || jsonObj.length == 0) return;
  const tag = jsonObj?.tag;

  const children = jsonObj?.children || [];

  const childrenStr = children
    .map((child) => (typeof child === "string" ? child : jsonToHtml(child)))
    .join("");

  const attributes = jsonObj?.attributes;

  let attrsStr;
  if (attributes) {
    attrsStr = Object?.entries(attributes)
      .map(([k, v]) => `${k}="${v}"`)
      .join(" ");
  }

  if (tag === "HEAD") {
    return `<${tag} ${attrsStr}>${childrenStr}</${tag}>`;
  } else if (tag === "BODY") {
    return childrenStr;
  } else {
    return `<${tag} ${attrsStr}>${childrenStr}</${tag}>`;
  }
};

export function logout(item) {
  if (item.name === "Logout") {
    localStorage.clear();
    window.location.href = "/";
  }
}

export function formatDate(dateString) {
  const parts = dateString.split("/"); // Assuming the input date is in the format "day/month/year"
  const day = parts[0];
  const month = parts[1];
  const year = parts[2];

  // Mapping month number to month name
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = months[parseInt(month, 10) - 1];

  return `${day} ${monthName}, ${year}`;
}
export function generateDateString(invoice) {
  return new Date(invoice * 1000).toLocaleDateString("in-IN");
}

export function getCurrentDomain() {
  return window.location.origin;
}
export function getCurrentHref() {
  return window.location.href;
}
export function getCurrentDashboardURL() {
  const currentURL = window.location.href;
  const dashboardIndex = currentURL.indexOf("/dashboard");
  if (dashboardIndex !== -1) {
    const dashboardURL = currentURL.substring(
      0,
      dashboardIndex + "/dashboard".length
    );
    return dashboardURL;
  }
  return null; // Return null if '/dashboard' is not found in the URL
}
export function getDateMonthYear(dateString) {
  const timestamp = parseInt(dateString);
  const date = new Date(timestamp);
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();
  const day = date.getDate();

  return { date, month, year, day };
}

export function isMonthAfterJune(month) {
  const monthOrder = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  };

  const currentMonthOrder = monthOrder[month];

  // If the current month order is greater than June (5), it is after June
  if (currentMonthOrder > 5) {
    return true;
  }

  return false;
}

export const handleconnectTwitter = async (callback_path) => {
  localStorage.setItem("loginProcess", true);
  localStorage.setItem("for_TW", true);

  try {
    let data = JSON.stringify({
      callback: window.location.origin + callback_path,
    });

    var token = localStorage.getItem("token");
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: API_BASE_PATH + "/auth/twitter/request-token",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        if (!response?.data?.error) {
          const twitterToken = response?.data?.data;
          const responseArray = twitterToken.split("&");
          window.location.href = `https://api.twitter.com/oauth/authorize?${responseArray[0]}`;
        } else {
          console.log("Error", response.data.error, response?.data?.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (err) {
    console.log(err);
  }
};

export const handleconnectLinkedin = (callback_path) => {
  localStorage.setItem("loginProcess", true);
  localStorage.setItem("bid", undefined);
  localStorage.removeItem("for_TW");
  const callBack = window.location.origin + callback_path;
  const redirectUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${callBack}&scope=r_liteprofile%20r_emailaddress%20w_member_social`;
  window.location = redirectUrl;
};


export const extractKeywordsAndIds = (response) => {
  const keywords = [];
  const keywordIdMap = {};
  const articleIds = [];
  response.data.forEach((item) => {
    const id = item.id;
    const itemKeywords = item.keywords;
    articleIds.push(id);
    itemKeywords.forEach((keyword) => {
      console.log('CHECK FOR SOURCE');
      console.log(keyword);
      const uniqueName = keywordsUniqueName(id, keyword);
      if (!keywordIdMap[uniqueName]) {
        keywordIdMap[uniqueName] = id;
        const keywordObj = {
          id: uniqueName,
          text: keyword.toLowerCase().charAt(0).toUpperCase()+keyword.toLowerCase().slice(1),
          selected: false, 
          source: keywords.find((item) => item.text === keyword) ?  item.source ? item.source.toLowerCase().charAt(0).toUpperCase() + item.source.toLowerCase().slice(1) : "" : null,
          realSource: item.source,
          url: item.url,
          articleId: id,
        }
        if(item.source!==null && item.source!==undefined && item.source!==""){
          // get keyword with same text from keywords[]
          const keywordObjFromKeywords = keywords.find((item) => item.text === keyword);
          if(keywordObjFromKeywords!==null && keywordObjFromKeywords!==undefined && keywordObjFromKeywords!==""){
            keywordObjFromKeywords.source = keywordObjFromKeywords.realSource ? keywordObjFromKeywords.realSource.toLowerCase().charAt(0).toUpperCase() + keywordObjFromKeywords.realSource.toLowerCase().slice(1) : "";
          }
        }
                
        keywords.push(keywordObj);
      }
    });
  });

  return {
    keywords,
    keywordIdMap,
    articleIds,
  };
};
const ID_KEYWORD_SEPARATOR = "&keyword&";
export const keywordsUniqueName = (id, keyword) => {
  return `${id.toLowerCase().trim()}${ID_KEYWORD_SEPARATOR}${keyword.toLowerCase().trim()}`;
}
export const getIdFromUniqueName = (uniqueName) => {
  return uniqueName.split(ID_KEYWORD_SEPARATOR)[0];
}

export const uploadAndExtractKeywords = async (files) => {
  // console.log(files, userId);      
  const getToken = localStorage.getItem("token");
  var getUserId;
  if (typeof window !== "undefined") {
    getUserId = localStorage.getItem("userId");
  }
  var getTempId;
  if (typeof window !== "undefined") {
    getTempId = localStorage.getItem("tempId");
  }
  if (!files) {
    throw new Error('No file provided.');
  }

  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`files`, file);
  });
  formData.append('userId', getToken ? getUserId : getTempId);

  const URL = API_BASE_PATH + API_ROUTES.EXTRACT_KEYWORDS_FROM_FILE;
    const response = await axios.post(URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
};

export const getTimeObject = (timeString) => {
  const [hoursStr, minutesStr] = timeString.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  return { hours, minutes };
};

export const saveUserTimeData = async (rawData) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(rawData),
    };
    const URL = API_BASE_PATH + API_ROUTES.ADD_SAVED_TIME;
    const response = await fetch(URL, requestOptions);
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.log('error', error);
  }
};

export function formatMinutesToTimeString(minutes) {
  var mins = Math.floor(minutes);
  var secs = Math.round((minutes - mins) * 60);
  // Pad seconds with leading zero if necessary
  if (secs < 10) {
    secs = "0" + secs;
  }
  return {
    minutes: mins,
    seconds: secs,
  }
  
}