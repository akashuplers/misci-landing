import moment from "moment";
import { intlFormatDistance } from "date-fns";
type Props = {
  date?: number;
};
export function RelativeTimeString(props: Props) {
  debugger;
  const threeMonthsAgo = moment().subtract(3, "months").unix();
  if (!props.date) {
    const relativeTimeString = moment.unix(threeMonthsAgo).fromNow();
    return <span>{relativeTimeString}</span>;
  }
  const relativeTimeString = moment.unix(props.date).fromNow();
  console.log(relativeTimeString);
  return <span>{relativeTimeString}</span>;
}
