import { format, fromUnixTime, max } from "date-fns";
import { APP_REGEXP } from "./appContants";

export function getRelativeTimeString(
  date: Date | number,
  lang = navigator.language
): string {
  // Allow dates or times to be passed
  const timeMs = typeof date === "number" ? date : date.getTime();

  // Get the amount of seconds between the given date and now
  const deltaSeconds = Math.round((timeMs - Date.now()) / 1000);

  // Array reprsenting one minute, hour, day, week, month, etc in seconds
  const cutoffs = [60, 3600, 86400, 86400 * 7, 86400 * 30, 86400 * 365, Infinity];

  // Array equivalent to the above but in the string representation of the units
  const units: Intl.RelativeTimeFormatUnit[] = ["second", "minute", "hour", "day", "week", "month", "year"];

  // Grab the ideal cutoff unit
  const unitIndex = cutoffs.findIndex(cutoff => cutoff > Math.abs(deltaSeconds));

  // Get the divisor to divide from the seconds. E.g. if our unit is "day" our divisor
  // is one day in seconds, so we can divide our seconds by this to get the # of days
  const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;

  // Intl.RelativeTimeFormat do its magic
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  return rtf.format(Math.floor(deltaSeconds / divisor), units[unitIndex]);
}
export function validateIfURL(url: string): boolean {
  const test= url.includes('.') || url.includes('/') || url.includes(':') || url.includes('?') || url.includes('&');
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
        source: keywordsForBlog.some((keywordObj) => keywordObj.text === keyword)
          ? (item.source ? uppercaseFirstChar(item.source) : '')
          : null,
        realSource: item.source,
        url: item.url,
        articleId: item.id,
      };

      if (keywordObj.source !== null && item.source !== undefined && item.source !== '') {
        const keywordObjFromKeywords = keywordsForBlog.find((keywordObj) => keywordObj.text === keyword);
        if (keywordObjFromKeywords !== undefined) {
          keywordObjFromKeywords.source = keywordObj.realSource
            ? uppercaseFirstChar(keywordObj.realSource)
            : '';
        }
      }
      keywordsForBlog.push(keywordObj);
    });
  });

  return keywordsForBlog;
}
export const unixToLocalYear = (unixTime:number) => {
  const unixTimestamp = unixTime;
  const date = fromUnixTime(unixTimestamp);
  const formattedDate = format(date, "EEE' 'do', 'yyyy");
  console.log(formattedDate)

  return formattedDate
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

export type ObjType = 'file' | 'url' | 'keyword';

interface Obj {
  id: string,
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
export function addObjectToSearchStore(obj: Obj, array: Obj[]): Result {
  const maxCapacity = 6;
  const keywordLimit = 1;

  let remainingCapacity = maxCapacity - array.length;
  let keywordCount = 0;

  // Check if the obj type is valid
  if (!['file', 'url', 'keyword'].includes(obj.type)) {
    return { data: array, errors: ['Invalid obj type'] };
  }
  
  // check for total number of items of files, urls, keywords
  const objCount = array.length;
  if (objCount >= maxCapacity) {
    return { data: array, errors: ['Maximum 6 items are allowed'] };
  }

  // Check if the keyword count exceeds the limit
  if (obj.type === 'keyword') {
    keywordCount = array.filter((item) => item.type === 'keyword').length;
    if (keywordCount >= keywordLimit) {
      return { data: array, errors: ['Only one keyword is allowed'] };
    }
  }
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
  maxSpaceLength: number
): ResultForAddFilesToArray {
  const maxCapacity = 6;
  const keywordLimit = 1;

  let remainingCapacity = maxCapacity - array.length;
  let keywordCount = 0;
  let totalFileSize = 0;
 
  // Check if the keyword count exceeds the limit
  keywordCount = array.filter((item) => item.type === 'keyword').length;
  if (files.length === 0) {
    return { data: array, errors: ['No file selected'] };
  }
  if (keywordCount === 0) {
    if (files.length > maxCapacity) {
      return { data: array, errors: [`Maximum ${maxCapacity} items are allowed`] };
    }
    if (files.length + array.length > maxCapacity) {
      return { data: array, errors: [`Maximum ${maxCapacity} items are allowed`] };
    }
  } else {
    if (files.length > maxCapacity - keywordCount) {
      return { data: array, errors: [`Maximum ${maxCapacity - keywordCount} items are allowed`] };
    }
  }
  // file format check
  const allowedFormats = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
  const fileFormats = files.map((file) => file.name.split('.').pop());
  const invalidFormats = fileFormats.filter((format) => format && !allowedFormats.includes(format));
  if (invalidFormats.length > 0) {
    return {
      data: array,
      errors: [`Only ${allowedFormats.join(', ')} files are allowed`],
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
  const dataOfTypeOfFiles = array.filter((item) => item.type === 'file');
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


export function convertToURLFriendly(str:string) {
  // Replace spaces with hyphens
  const urlFriendlyStr = str.replace(/\s+/g, '-');
  
  // Convert to lowercase
  const lowercaseStr = urlFriendlyStr.toLowerCase();
  
  // Remove special characters except hyphens
  const cleanedStr = lowercaseStr.replace(/[^a-z0-9-]/g, '');

  return cleanedStr;
}

function getFirstH2(htmlString:string) {
  // Create a temporary container element
  const container = document.createElement('div');
  container.innerHTML = htmlString;

  // Find the first h2 element within the container
  const firstH2 = container.querySelector('h2');

  // Return the innerHTML of the first h2, or an empty string if not found
  return firstH2 ? firstH2.innerHTML : '';
}
