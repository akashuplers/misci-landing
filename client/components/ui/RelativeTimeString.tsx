import moment from 'moment';
import { intlFormatDistance } from 'date-fns'
type Props = {
    date: number
}

export function RelativeTimeString(props: Props) {
    const relativeTimeString = moment.unix(props.date).fromNow();
    return <span>{relativeTimeString}</span>
}