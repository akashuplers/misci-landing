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

export const monthDiff = (d1: Date, d2: Date) => {
  var months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
}

export const daysBetween = (first: Date, second: Date)  => {

  // Copy date parts of the timestamps, discarding the time parts.
  var one = new Date(first.getFullYear(), first.getMonth(), first.getDate());
  var two = new Date(second.getFullYear(), second.getMonth(), second.getDate());

  // Do the math.
  var millisecondsPerDay = 1000 * 60 * 60 * 24;
  var millisBetween = two.getTime() - one.getTime();
  var days = millisBetween / millisecondsPerDay;

  // Round down.
  return Math.floor(days);
}

export const diff_hours = (dt2: Date, dt1: Date) =>
{

 var diff =(dt2.getTime() - dt1.getTime()) / 1000;
 diff /= (60 * 60);
 return Math.abs(Math.round(diff));
 
}