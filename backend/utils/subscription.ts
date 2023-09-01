import { pubsub } from '../pubsub';
const SOMETHING_CHANGED_TOPIC = 'steps_completion';
export const publish = ({userId, keyword, step, data = null}: {
    userId: string | null,
    keyword: any | null,
    step: string,
    data?: any | null
}) => {
    console.log(userId, keyword, step)
    return pubsub.publish(SOMETHING_CHANGED_TOPIC, {stepCompletes: { step, userId, keyword, data }});
}