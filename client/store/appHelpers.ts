import { format, fromUnixTime, max } from "date-fns";
import { APP_REGEXP } from "./appContants";
import { API_BASE_PATH, API_ROUTES } from "@/constants/apiEndpoints";

export function getRelativeTimeString(
  date: Date | number,
  lang = navigator.language
): string {
  // Allow dates or times to be passed
  const timeMs = typeof date === "number" ? date : date.getTime();

  // Get the amount of seconds between the given date and now
  const deltaSeconds = Math.round((timeMs - Date.now()) / 1000);

  // Array reprsenting one minute, hour, day, week, month, etc in seconds
  const cutoffs = [
    60,
    3600,
    86400,
    86400 * 7,
    86400 * 30,
    86400 * 365,
    Infinity,
  ];

  // Array equivalent to the above but in the string representation of the units
  const units: Intl.RelativeTimeFormatUnit[] = [
    "second",
    "minute",
    "hour",
    "day",
    "week",
    "month",
    "year",
  ];

  // Grab the ideal cutoff unit
  const unitIndex = cutoffs.findIndex(
    (cutoff) => cutoff > Math.abs(deltaSeconds)
  );

  // Get the divisor to divide from the seconds. E.g. if our unit is "day" our divisor
  // is one day in seconds, so we can divide our seconds by this to get the # of days
  const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;

  // Intl.RelativeTimeFormat do its magic
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  return rtf.format(Math.floor(deltaSeconds / divisor), units[unitIndex]);
}
export function validateIfURL(url: string): boolean {
  const test =
    url.includes(".") ||
    url.includes("/") ||
    url.includes(":") ||
    url.includes("?") ||
    url.includes("&");
  console.log(test);
  return test;
}

export function randomNumberBetween20And50() {
  const randomNumber = Math.random();
  const randomInteger = Math.floor(randomNumber * (50 - 20) + 1);
  return randomInteger + 20;
}

export function uppercaseFirstChar(input: string): string {
  if (input.length === 0) {
    return input; // Return the same string if it's empty
  }

  const firstChar = input.charAt(0).toUpperCase();
  const restOfChars = input.slice(1);

  return firstChar + restOfChars;
}
interface Item {
  id: number;
  keywords: string[];
  source?: string;
  url: string;
}

interface KeywordObj {
  id: number;
  text: string;
  selected: boolean;
  source: string | null;
  realSource?: string;
  url: string;
  articleId: number;
}

export function processKeywords(data: Item[]): KeywordObj[] {
  const keywordsForBlog: KeywordObj[] = [];

  data.forEach((item) => {
    item.keywords.forEach((keyword) => {
      const keywordObj: KeywordObj = {
        id: item.id,
        text: uppercaseFirstChar(keyword),
        selected: false,
        source: keywordsForBlog.some(
          (keywordObj) => keywordObj.text === keyword
        )
          ? item.source
            ? uppercaseFirstChar(item.source)
            : ""
          : null,
        realSource: item.source,
        url: item.url,
        articleId: item.id,
      };

      if (
        keywordObj.source !== null &&
        item.source !== undefined &&
        item.source !== ""
      ) {
        const keywordObjFromKeywords = keywordsForBlog.find(
          (keywordObj) => keywordObj.text === keyword
        );
        if (keywordObjFromKeywords !== undefined) {
          keywordObjFromKeywords.source = keywordObj.realSource
            ? uppercaseFirstChar(keywordObj.realSource)
            : "";
        }
      }
      keywordsForBlog.push(keywordObj);
    });
  });

  return keywordsForBlog;
}
export const unixToLocalYear = (unixTime: number) => {
  const unixTimestamp = unixTime;
  const date = fromUnixTime(unixTimestamp);
  const formattedDate = format(date, "EEE' 'do', 'yyyy");
  console.log(formattedDate);

  return formattedDate;
};

export function calculateUsedCredits(userData: {
  totalCredits: number;
  creditsLeft: number;
}): number {
  const { totalCredits, creditsLeft } = userData;
  const usedCredits = totalCredits - creditsLeft;
  return usedCredits;
}

// ^(https?://)?drive\.google\.com/

export function validateIfGoogleDriveURL(url: string): boolean {
  return APP_REGEXP.GOOGLE_DRIVE_URL_VALIDATION.test(url);
}

export type ObjType = "file" | "url" | "keyword";

interface Obj {
  id: string;
  index: number;
  label: string;
  selected: boolean;
  type: ObjType;
  value: string;
}

interface Result {
  data: Obj[];
  errors: string[];
}
export function addObjectToSearchStore(
  obj: Obj,
  array: Obj[],
  isAuth: boolean = false
): Result {
  const maxCapacity = 6;
  const keywordLimit = 1;

  let remainingCapacity = maxCapacity - array.length;
  let keywordCount = 0;

  // Check if the obj type is valid
  if (!["file", "url", "keyword"].includes(obj.type)) {
    return { data: array, errors: ["Invalid obj type"] };
  }

  // check for total number of items of files, urls, keywords
  const objCount = array.filter((item) => item.type === obj.type).length;

  // only allow 1 url and not more than that if not auth
  if (obj.type === "url") {
    if (objCount >= 1 && !isAuth) {
      return {
        data: array,
        errors: [
          "You can enter multiple URLs by signing up, as you are a guest limited to single file",
        ],
      };
    }
  }

  // user should not be able to add more than 3 urls
  if (obj.type === "url") {
    if (objCount >= 3) {
      return { data: array, errors: ["Maximum 3 URLs are allowed"] };
    }
  }
  if (objCount >= maxCapacity) {
    return { data: array, errors: ["Maximum 6 items are allowed"] };
  }

  // check if it already exists lowercase the value

  // check for url for valid type
  if (obj.type === "url") {
    if (!validateIfURL(obj.value)) {
      return { data: array, errors: ["Invalid URL"] };
    }
  }
  const dataOfType = array.filter((item) => item.type === obj.type);
  const values = dataOfType.map((item) => item.value.toLowerCase());
  if (values.includes(obj.value.toLowerCase())) {
    return { data: array, errors: [`"${obj.value}" already exists`] };
  }

  // Check if the keyword count exceeds the limit
  // if (obj.type === 'keyword') {
  //   keywordCount = array.filter((item) => item.type === 'keyword').length;
  //   if (keywordCount >= keywordLimit) {
  //     return { data: array, errors: ['Only one keyword is allowed'] };
  //   }
  // }
  // If all conditions pass, add the obj to the array and return the updated array
  const newArray = [...array, obj];
  return { data: newArray, errors: [] };
}
interface ResultForAddFilesToArray {
  data: Obj[];
  files?: File[];
  errors: string[];
}

interface ResultForAddFilesToArray {
  data: Obj[];
  files?: File[];
  errors: string[];
}

export function addFilesToTheSearch(
  obj: Obj[],
  array: Obj[],
  files: File[],
  maxFileSize: number,
  maxSpaceLength: number,
  isAuth: boolean = false
): ResultForAddFilesToArray {
  const maxCapacity = 3;
  const keywordLimit = 1;

  let remainingCapacity = maxCapacity - array.length;
  let keywordCount = 0;
  let totalFileSize = 0;

  // Check if the keyword count exceeds the limit
  keywordCount = array.filter((item) => item.type === "keyword").length;
  const objType = array.filter((item) => item.type === "file").length;
  if (files.length === 0) {
    return { data: array, errors: ["No file selected"] };
  }
  // if (keywordCount === 0) {
  //   if (files.length > maxCapacity) {
  //     return { data: array, errors: [`Maximum ${maxCapacity} items are allowed`] };
  //   }
  //   if (files.length + array.length > maxCapacity) {
  //     return { data: array, errors: [`Maximum ${maxCapacity} items are allowed`] };
  //   }
  // } else {

  // is auth not, and file should not be more than 1
  if (!isAuth) {
    if (files.length > 1) {
      return {
        data: array,
        errors: [
          `You can enter multiple File by signing up, as you are a guest limited to single file`,
        ],
      };
    }
  }

  if (files.length > maxCapacity) {
    return {
      data: array,
      errors: [`Maximum ${maxCapacity} items are allowed`],
    };
  }
  if (objType + files.length > maxCapacity) {
    return {
      data: array,
      errors: [`Maximum ${maxCapacity} items are allowed`],
    };
  }
  // }
  // file format check
  const allowedFormats = ["pdf", "doc", "docx", "txt", "rtf", "odt"];
  const fileFormats = files.map((file) => file.name.split(".").pop());
  const invalidFormats = fileFormats.filter(
    (format) => format && !allowedFormats.includes(format)
  );
  if (invalidFormats.length > 0) {
    return {
      data: array,
      errors: [`Only ${allowedFormats.join(", ")} files are allowed`],
    };
  }
  // file size check
  const invalidFiles = files.filter((file) => file.size > maxFileSize);
  if (invalidFiles.length > 0) {
    return {
      data: array,
      errors: [`Maximum file size is ${maxFileSize / 1024 / 1024} MB`],
    };
  }
  // does it already exist?
  const dataOfTypeOfFiles = array.filter((item) => item.type === "file");
  const fileNames = dataOfTypeOfFiles.map((item) => item.value);
  const duplicateFiles = files.filter((file) => fileNames.includes(file.name));
  // name the file as duplicate in the error
  if (duplicateFiles.length > 0) {
    return {
      data: array,
      errors: duplicateFiles.map((file) => `${file.name} already exists`),
    };
  }

  // If all conditions pass, add the obj to the array and return the updated array
  const newArray = [...array, ...obj];
  return { data: newArray, files, errors: [] };
}

export function convertToURLFriendly(str: string) {
  console.log(str);
  const urlFriendlyStr = str.replace(/\s+/g, "-");
  const lowercaseStr = urlFriendlyStr.toLowerCase();
  const cleanedStr = lowercaseStr.replace(/[^a-z0-9-]/g, "");
  return cleanedStr;
}

function getFirstH2(htmlString: string) {
  const container = document.createElement("div");
  container.innerHTML = htmlString;
  const firstH2 = container.querySelector("h2");
  return firstH2 ? firstH2.innerHTML : "";
}

export async function newGenerateApi(
  token: string,
  tones: string[],
  keyword: string,
  userId: string,
  files: File[],
  urls: string[]
): Promise<void> {
  const myHeaders = new Headers();
  console.log(files, urls, tones, keyword, userId);
  if (token !== null) {
    myHeaders.append("Authorization", `Bearer ${token}`);
  }

  const formdata = new FormData();
  for (const tone of tones) {
    formdata.append("tones[]", tone);
  }
  formdata.append("keyword", keyword);
  formdata.append("user_id", userId);
  for (const file of files) {
    formdata.append("files", file, file.name);
  }
  for (const url of urls) {
    formdata.append("urls[]", url);
  }
  console.log(formdata);
  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow",
  };
  const url = API_BASE_PATH + API_ROUTES.NEW_GENERATE_API;
  const response = await fetch(url, requestOptions);
  const result = await response.json();
  console.log(result);
  return result;
}

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function getMax(first: number, second: number): number {
  // return max number
  return Math.max(first, second);
}

export function getBlogTitle(obj: any): string {
  // Check if the object has a "children" array
  console.log(obj);
  if (typeof obj === "string") {
    return obj;
  }
  if (obj && obj.children.length > 0) {
    // Recursively call getLastChild on the first child

    return getBlogTitle(obj.children[0]);
  } else {
    // If there are no more children arrays, return the current object
    return obj;
  }
}

export function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export function getUserToken(): string {
  const token = localStorage.getItem("token");
  const tempId = localStorage.getItem("tempId") ?? "";
  const userId = localStorage.getItem("userId") ?? "";
  if (token) {
    return userId;
  }
  return tempId;
}

export function validateIfTextIncludesSpecialCharsExcludingQuestionMark(
  str: string
): boolean {
  const regex = /[^a-zA-Z0-9\-_., !?]/;
  return regex.test(str);
}

export function countInitialWhiteSpace(str: string): number {
  const match = str.match(/^\s+/);
  return match ? match[0].length : 0;
}
