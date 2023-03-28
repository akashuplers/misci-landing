import { ObjectID } from "bson";

export const usersResolver = {
    Query: {
        me: async (
            parent: unknown, args: any, {db, pubsub, user}: any
        ) => {
            const userDetails = await db.db('lilleAdmin').collection('users').findOne({_id: new ObjectID(user.id)})
            const subscriptionDetails = await db.db('stripe')
            .collection('subscriptions')
            .find({user: new ObjectID(user._id)})
            .sort({lastInvoicedDate: -1}).limit(1).toArray()
            const date1: any = new Date(userDetails.date);
            const date2: any = new Date();
            const diffTime = Math.abs(date2 - date1);
            const totalDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            return {
                ...userDetails,
                subscribeStatus: subscriptionDetails && subscriptionDetails.length ? subscriptionDetails[0].subscriptionStatus : false,
                subscriptionId: subscriptionDetails && subscriptionDetails.length ? subscriptionDetails[0].subscriptionId : false,
                isSubscribed: userDetails.isSubscribed || false,
                interval: userDetails.interval || false,
                paid: userDetails.paid || false,
                lastInvoicedDate: userDetails.lastInvoicedDate || false,
                upcomingInvoicedDate: userDetails.upcomingInvoicedDate || false,
                freeTrial: userDetails.freeTrial || false,
                freeTrailEndsDate: userDetails.freeTrailEndsDate,
                freeTrialDays: (parseInt(process.env.FREE_TRIAL_END || '14') - totalDay)
            }
        }
    }
}