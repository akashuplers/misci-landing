import { ObjectID } from "bson";
import { PreferencesArgs } from "interfaces";
import { v4 as uuidv4 } from "uuid";

export const usersResolver = {
    Query: {
        me: async (
            parent: unknown, args: any, {db, pubsub, user}: any
        ) => {
            const userDetails = await db.db('lilleAdmin').collection('users').findOne({_id: new ObjectID(user.id)})
            const subscriptionDetails = await db.db('stripe')
            .collection('subscriptions')
            .find({user: new ObjectID(user.id)})
            .sort({lastInvoicedDate: -1}).limit(1).toArray()
            const userPref = await db
            .db("lilleAdmin")
            .collection("preferences")
            .findOne({ user: new ObjectID(user.id) });    
            let prefData = null
            if(userPref) {
                prefData = userPref.questions?.map((question: any) => question.question1)
            }
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
                prefData: prefData || null,
                freeTrailEndsDate: userDetails.freeTrailEndsDate,
                freeTrialDays: (parseInt(process.env.FREE_TRIAL_END || '14') - totalDay),
                prefFilled: userPref && userPref.prefFilled ? userPref.prefFilled : false,
                profileImage: userDetails.profileImage || null
            }
        }
    },
    Mutation: {
        savePreferences: async (
            parent: unknown, args: {options: PreferencesArgs}, {db, pubsub, user}: any
        ) => {
            const {keywords} = args.options
            const userDetails = await db.db("lilleAdmin").collection('users').findOne({_id: new ObjectID(user.id)})
            console.log(userDetails)
            const preferences = {
                user: userDetails._id,
                firstName: userDetails.name,
                email: userDetails.email,
                questions: [],
                tags: [],
            };
            const userPrefExists = await db.db('lilleAdmin').collection('preferences').findOne({user: new ObjectID(userDetails._id)})
            let newKeys: any[] = []
            if(!userPrefExists) {
                const prefRes = await db
                    .db("lilleAdmin")
                    .collection("preferences")
                    .insertOne(preferences);
                newKeys = keywords    
            } else {
                const originalKeys = userPrefExists.questions?.map((question: any) => question.question1)
                console.log(originalKeys, keywords)
                keywords?.forEach((key: any) => {
                    if(!originalKeys.includes(key)) {
                        console.log(key)
                        newKeys.push(key)
                    }
                })
            }
            const filter = { user: new ObjectID(userDetails._id) };
            await (Promise.all(
                keywords?.map( async (key: any) => {
                const updatePrefToAdd: any = {
                    id: uuidv4(),
                    question1: key,
                    question2: "other",
                    type: "other"
                };
                const options = { returnOriginal: false };
                const updateExsistingPref = {
                    $addToSet: { 
                        questions: updatePrefToAdd
                    },
                    $set: {
                        prefFilled: true
                    }
                };
                const updateUserPref = await db
                    .db("lilleAdmin")
                    .collection("preferences")
                    .findOneAndUpdate(filter, updateExsistingPref, options);
                })
            ))    
            return true
        }
    }
}