export const getDateString = (date: Date) => {
    // TODO: MOVE THIS TO A FUNCTION
    let today = date;
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!

    let yyyy = today.getFullYear();
    if (dd < 10) {
      //@ts-ignore
      dd = "0" + dd;
    }
    if (mm < 10) {
      //@ts-ignore
      mm = "0" + mm;
    }

    //@ts-ignore
    today = `${yyyy}-${mm}-${dd}`;
    return today
}

export const addDays = (date: Date, days: number) => {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export const calculateNextMultiple = (multiple: number, number: number) => {
  return Math.ceil(number / multiple) * multiple;
}

export const getBeginningOfTheWeek = (now: Date) => {
  const days = (now.getDay() + 7 - 1) % 7;
  now.setDate(now.getDate() - days);
  now.setHours(0, 0, 0, 0);
  return getDateString(now);
};

export const getTimeStamp = () => {
  return Math.round(new Date().getTime() / 1000) 
}

export function diff_minutes(dt2: Date, dt1: Date) 
{

 var diff =(dt2.getTime() - dt1.getTime()) / 1000;
 diff /= 60;
 return diff;
 
}
