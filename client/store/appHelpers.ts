import { format, fromUnixTime } from "date-fns";
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
  return APP_REGEXP.URL_VALIDATION.test(url);
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
