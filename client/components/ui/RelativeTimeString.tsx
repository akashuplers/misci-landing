import moment from "moment";
import { intlFormatDistance } from "date-fns";
type Props = {
  date: number;
};
export function RelativeTimeString(props: Props) {
  const threeMonthsAgo = moment().subtract(3, "months").unix();
  // if props.date is null give a default value
  if (!props.date) {
    const relativeTimeString = moment.unix(threeMonthsAgo).fromNow();
    return <span>{relativeTimeString}</span>;
  }
  const relativeTimeString = moment.unix(props.date).fromNow();
  return <span>{relativeTimeString}</span>;
}
