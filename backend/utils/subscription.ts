import { pubsub } from '../pubsub';
const SOMETHING_CHANGED_TOPIC = 'steps_completion';
export const publish = ({userId, keyword, step}: {
    userId: string | null,
    keyword: string | null,
    step: string
}) => {
    console.log(userId, keyword, step)
    return pubsub.publish(SOMETHING_CHANGED_TOPIC, {stepCompletes: { step, userId, keyword }});
}