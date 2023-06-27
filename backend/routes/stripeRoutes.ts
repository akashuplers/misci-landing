import Stripe from "../services/stripe";
import {sendMail} from "../services/sendEmail"
import { ObjectID } from "bson";
import { getDateString, getTimeStamp } from "../utils/date";
import { authMiddleware } from "../middleWare/authToken";
import { assignTweetQuota } from "../graphql/resolver/blogs/blogsRepo";

const express = require("express");
const router = express.Router();

router.get("/prices", async (request: any, reply: any) => {
    const prices = await new Stripe().getPrices()
    return reply.status(200).send({
        data: prices
    })
})

router.get("/coffee-prices", async (request: any, reply: any) => {
    const prices = await new Stripe().getPrices("prod_NuTPLfGIV9L4Ur")
    return reply.status(200).send({
        data: prices
    })
})

router.post('/api/payment', async (request: any, reply: any) => {
    console.log(request.body);
    const body = request.body
    const session = await new Stripe().getCheckoutSession(body)
    return reply.status(303).json({ id: session.id });
});



router.post('/webhook',  async (request: any, reply: any) => {
    const db = request.app.get('db')
    let event = request.body;
    try {
        // Replace this endpoint secret with your endpoint's unique secret
        // If you are testing with the CLI, find the secret by running 'stripe listen'
        // If you are using an endpoint defined with the API or dashboard, look in your webhook settings
        // at https://dashboard.stripe.com/webhooks
        const endpointSecret = process.env.ENDPOINT_SECRET;
        // Only verify the event if you have an endpoint secret defined.
        // Otherwise use the basic event deserialized with JSON.parse
        // if (endpointSecret) {
        //   // Get the signature sent by Stripe
        //   const signature = request.headers['stripe-signature'];
        //   console.log(signature, request.body)
        //   // let 
        //   // if(signature) {

        //   // }
        //   try {
        //     event = stripe.webhooks.constructEvent(
        //       request.body,
        //       signature,
        //       endpointSecret
        //     );
        //   } catch (err) {
        //     console.log(`⚠️  Webhook signature verification failed.`, err.message);
        //     return response.sendStatus(400);
        //   }
        // }
        let subscription;
        let status;
        console.log(event.type, "type")
        // Handle the event
        switch (event.type) {
        // case 'customer.subscription.deleted':
        //   subscription = event.data.object;
        //   status = subscription.status;
        //   console.log(`Subscription status is ${status}.`);
        //   // Then define and call a method to handle the subscription deleted.
        //   // handleSubscriptionDeleted(subscriptionDeleted);
        //   break;
        case 'invoice.paid':
            console.log(event.data.object, 'invoice.paid')

            break;
        case 'customer.subscription.created':
            subscription = event.data.object;
            // console.log(subscription);
            // console.log(event.data);
            status = subscription.status;
            // console.log(`Subscription status is ${status}.`);
            // Then define and call a method to handle the subscription created.
            // handleSubscriptionCreated(subscription);
            break;
        case 'customer.subscription.updated':
            subscription = event.data.object;
            status = subscription.status;
            let { previous_attributes, object } = event.data
            let customer_id = object.customer
            let product_id = object.plan.product
            let customer_object = await new Stripe().getCustomerDetails(customer_id)
            // console.log(subscription,event.data, "subscription")
            if ('status' in previous_attributes
                && previous_attributes.status === 'active'
                && object.status === 'active') {
                if("current_period_start" in previous_attributes && previous_attributes.current_period_start !== subscription.current_period_start) {
                    console.log("========== Renewing ===========")
                    const newCredit = await db.db('lilleAdmin').collection('config').findOne()
                    await db.db('lilleAdmin').collection('users').updateOne({email: customer_object.email}, {
                        $set: {
                            isSubscribed: true,
                            paid: true,
                            interval: subscription.plan.interval === 'year' ? subscription.plan.interval : 
                            subscription.plan.interval === 'month' && subscription.plan.interval_count === 1 ? "monthly" : "quarterly",
                            lastInvoicedDate: subscription.current_period_start,
                            upcomingInvoicedDate: subscription.current_period_end,
                            credits: parseInt(newCredit?.monthly_credit || "200"),
                            totalCredits: parseInt(newCredit?.monthly_credit || "200"),
                        }
                    })
                }    
            }
            if ('status' in previous_attributes
                && previous_attributes.status === 'incomplete'
                && object.status === 'active') {
                let mailSend = true    
                const subscriptionDetails = await db.db('lilleAdmin').collection('subscriptions').findOne({subscriptionId: subscription.id})
                if(subscriptionDetails && subscriptionDetails.subscriptionStatus === 'active') mailSend = false
                await db.db('lilleAdmin').collection('subscriptions').updateOne({subscriptionId: subscription.id}, {$set: {
                    subscriptionStatus: status,
                    paymentStatus: "success",
                    lastInvoicedDate: subscription.current_period_start,
                    upcomingInvoicedDate: subscription.current_period_end
                }})    
                console.log(`Subscription status is ${status} from ${object.status}.`);
                const userDetails = await db.db('lilleAdmin').collection('users').findOne({
                    email: customer_object.email
                })
                console.log(`userDetails`, userDetails);
                const newCredit = await db.db('lilleAdmin').collection('config').findOne()
                await db.db('lilleAdmin').collection('users').updateOne({email: customer_object.email}, {
                    $set: {
                        isSubscribed: true,
                        paid: true,
                        interval: subscription.plan.interval === 'year' ? subscription.plan.interval : 
                        subscription.plan.interval === 'month' && subscription.plan.interval_count === 1 ? "monthly" : "quarterly",
                        lastInvoicedDate: subscription.current_period_start,
                        upcomingInvoicedDate: subscription.current_period_end,
                        freeTrial: false,
                        freeTrailEndsDate: null,
                        credits: parseInt(newCredit?.monthly_credit || "200") + parseInt(userDetails?.credits || 0),
                        totalCredits: parseInt(newCredit?.monthly_credit || "200") + parseInt(userDetails?.credits || 0),
                        paymentsStarts: getTimeStamp()
                    }
                })
                assignTweetQuota(db, userDetails)
                if(mailSend) {
                    const bodyText = await db.db('lilleAdmin').collection('emailTexts').findOne({type: "subscription"})
                    await sendMail(userDetails, 'Subscribed!', bodyText.text)
                }
            }
            if (!previous_attributes.status && object.status === 'active') {
                console.log(`Subscription status is ${status} from ${object.status}.`);
                await db.db('lilleAdmin').collection('subscriptions').updateOne({subscriptionId: subscription.id}, {$set: {
                    lastInvoicedDate: subscription.current_period_start,
                    upcomingInvoicedDate: subscription.current_period_end
                }})
                await db.db('lilleAdmin').collection('users').updateOne({email: customer_object.email}, {
                    $set: {
                        lastInvoicedDate: subscription.current_period_start,
                        upcomingInvoicedDate: subscription.current_period_end
                    }
                })
            }
            if (previous_attributes.status && previous_attributes.status !== "canceled" && object.status === 'canceled') {
                console.log(`Subscription ${subscription.id} status is ${object.status}.`);
                await db.db('lilleAdmin').collection('subscriptions').updateOne({subscriptionId: subscription.id}, {$set: {
                    lastInvoicedDate: subscription.current_period_start,
                    upcomingInvoicedDate: subscription.current_period_end,
                    subscriptionStatus: object.status,
                    paymentsStarts: null
                }})
            }
            if ('status' in previous_attributes &&
            previous_attributes.status === 'active'
            && object.status === 'past_due') {
                console.log(`Subscription status is ${status} from ${object.status}.`);
                await db.db('lilleAdmin').collection('subscriptions').updateOne({subscriptionId: subscription.id}, {$set: {
                    subscriptionStatus: object.status
                }})
                await db.db('lilleAdmin').collection('users').updateOne({email: customer_object.email}, {
                    $set: {
                        isSubscribed: false,
                        freeTrial: true,
                        paymentsStarts: null,
                        lastInvoicedDate: null,
                        upcomingInvoicedDate: null,
                        credits: process.env.CREDIT_COUNT,
                        totalCredits: process.env.CREDIT_COUNT
                    }
                })
            }
            break;
        default:
            // Unexpected event type
            console.log(`Unhandled event type ${event.type}.`);
        }
        return reply.status(200).send({
            type: "SUCCESS",
            message: "Webhook!!"
        })
    }catch(e) {
        console.log(e, "error from stripe webhook")
        console.log(event, "event from stripe webhook")
    }
})

router.post('/upgrade', authMiddleware, async (request: any, reply: any) => {
    const db = request.app.get('db')
    try {
        const user = request.user;
        if(!user) throw "No user found!"
        const data = {...request.body, ...user}
        console.log(await new Stripe().getPaymentMethodDetails(data.paymentMethodId))
        const stripeCustomerDetails = await new Stripe({...data, name: `${data.name} ${data.lastName}`}).createCustomer()
        const subscriptionDetails = await new Stripe({customerId: stripeCustomerDetails.id}).createSubscriptions(data.priceId)
        console.log(subscriptionDetails, "from upgrade")
        const confirmPayment = await new Stripe().fetchPayment(subscriptionDetails.latest_invoice.payment_intent.id)
        console.log(confirmPayment,"from upgrade")
        await db.db('lilleAdmin').collection('subscriptions').insertOne({
            user: new ObjectID(user._id),
            subscriptionId: subscriptionDetails.id,
            customerId: stripeCustomerDetails.id,
            paymentIntentId: subscriptionDetails.latest_invoice.payment_intent.id,
            paymentStatus: confirmPayment.status,
            subscriptionStatus: subscriptionDetails.status,
            priceId: subscriptionDetails?.plan?.id,
            interval: data.interval.toLowerCase(),
            lastInvoicedDate: subscriptionDetails.current_period_start,
            upcomingInvoicedDate: subscriptionDetails.current_period_end
        })
        const bodyText = await db.db('lilleAdmin').collection('emailTexts').findOne({type: "subscription"})
        return reply.status(200).send({
            data: {
                clientSecret: subscriptionDetails.latest_invoice.payment_intent.client_secret,
                subscriptionId: subscriptionDetails.id,
                status: subscriptionDetails.latest_invoice.payment_intent.status,
                subscriptionStatus: subscriptionDetails.status
            }
        })
    }catch(err) {
        console.log(err)
        return reply.status(400).send({
            data: err.message
        })
    }
})

router.get('/subscription-details', authMiddleware, async (request: any, reply: any) => {
    const db = request.app.get('db')
    try {
        const user = request.user;
        if(!user) throw "No user found!"
        const latestSubsDetails = await db.db('lilleAdmin').collection('subscriptions').find({user: new ObjectID(user._id)}).sort({lastInvoicedDate: -1}).limit(1).toArray()
        return reply.status(200).send({data: latestSubsDetails})
    } catch(err) {
        return reply.status(400).send({
            data: err.message
        })
    }
})

router.post('/upgrade-confirm', authMiddleware, async (request: any, reply: any) => {
    const db = request.app.get('db')
    const subId = request.body.subscriptionId
    try {
        const user = request.user;
        if(!user) throw "No user found!"
        const subDetails = await db.db('lilleAdmin').collection('subscriptions').findOne({subscriptionId: subId})
        if(subDetails) {
            const userDetails = await db.db('lilleAdmin').collection('users').findOne({
                _id: new ObjectID(user._id)
            })
            await db.db('lilleAdmin').collection('users').updateOne({_id: new ObjectID(user._id)}, {
                $set: {
                    isSubscribed: true,
                    lastInvoicedDate: subDetails.lastInvoicedDate,
                    upcomingInvoicedDate: subDetails.upcomingInvoicedDate,
                    // credits: parseInt(process.env.PAID_CREDIT_COUNT || "200") + parseInt(userDetails.credits),
                    // totalCredits: parseInt(process.env.PAID_CREDIT_COUNT || "200") + parseInt(userDetails.credits),
                    // paymentsStarts: getTimeStamp(),
                }
            })
        }
        return reply.status(200).send({
            data: "Upgrade Confirmed!"
        })
    }catch(err) {
        console.log(err)
    }
})

router.post('/payment-method-details', async (request: any, reply: any) => {
    const subId = request.body.subId
    const subIdDetails = await new Stripe().getSubscriptionDetails(subId)
    let response = null
    if(subIdDetails) {
        const paymentMethod = subIdDetails.default_payment_method
        const paymentMethodDetails = await new Stripe().getPaymentMethodDetails(paymentMethod)
        if(paymentMethodDetails) {
            response = {
                brand: paymentMethodDetails.card.brand,
                last4: paymentMethodDetails.card.last4
            }
        }
    }
    return reply.status(200).send({data: response})
})

router.post('/cancel-subscription', authMiddleware, async (request: any, reply: any) => {
    const db = request.app.get('db')
    const user = request.user;
    if(!user) throw "No user found!"
    const userDetails = await db.db('lilleAdmin').collection('users').findOne({
        _id: new ObjectID(user._id)
    }, {
        projection: {
            _id: 1,
            lastInvoicedDate: 1,
            upcomingInvoicedDate: 1,
            isSubscribed: 1,
            paid: 1
        }
    })
    const latestSubsDetails = await db.db('lilleAdmin').collection('subscriptions').find({user: new ObjectID(user._id), subscriptionStatus: "active"}).sort({lastInvoicedDate: -1}).limit(1).toArray()
    try {
        const updatedSubs = await new Stripe().cancelSubscription(latestSubsDetails[0].subscriptionId)
        const currentTimeStamp = getTimeStamp()
        console.log(updatedSubs, "from cancel")
        await db.db('lilleAdmin')
            .collection('subscriptions')
            .updateOne({_id: new ObjectID(latestSubsDetails[0]._id)}, {$set: {subscriptionStatus: updatedSubs.status}})
        await db.db('lilleAdmin')
            .collection('users')
            .updateOne({_id: new ObjectID(latestSubsDetails[0].user)}, {$set: {paid: false}})
        if(userDetails.isSubscribed && userDetails.upcomingInvoicedDate && currentTimeStamp > userDetails.upcomingInvoicedDate) {
            console.log(`Cancelling subscription for user ${userDetails.email}`)
            await db.db('lilleAdmin').collection('users').updateOne({_id: new ObjectID(userDetails._id)}, {
                $set: {
                    isSubscribed: false,
                    freeTrial: true,
                    paymentsStarts: null,
                    lastInvoicedDate: null,
                    upcomingInvoicedDate: null,
                    credits: process.env.CREDIT_COUNT,
                    totalCredits: process.env.CREDIT_COUNT,
                }
            })
        }    
        const bodyText = await db.db('lilleAdmin').collection('emailTexts').findOne({type: "cancel_subscription"})
        await sendMail(user, "Subscription Canceled", bodyText.text)
        return reply.status(200).send({
            data: "User unsubscribed!"
        })
    } catch(e) {
        console.log(e, "cancel message")
        return reply.status(400).send({data: e.message})
    }
})

router.get('/schedule/cancel-subscription', async (request: any, reply: any) => {
    const db = request.app.get('db')
    const cancelSubs = await db.db('lilleAdmin').collection('subscriptions').find({
        subscriptionStatus: "canceled"
    }).toArray()
    if(cancelSubs.length) {
        await (
            Promise.all(
                cancelSubs.map(async (sub: any) => {
                    const userDetails = await db.db('lilleAdmin').collection('users').findOne({
                        _id: new ObjectID(sub.user)
                    }, {
                        projection: {
                            _id: 1,
                            lastInvoicedDate: 1,
                            upcomingInvoicedDate: 1,
                            isSubscribed: 1,
                            paid: 1
                        }
                    })
                    const currentTimeStamp = getTimeStamp()
                    if(userDetails.isSubscribed && userDetails.upcomingInvoicedDate && currentTimeStamp > userDetails.upcomingInvoicedDate) {
                        console.log(`Cancelling subscription for user ${userDetails.email}`)
                        await db.db('lilleAdmin').collection('users').updateOne({_id: new ObjectID(sub.user)}, {
                            $set: {
                                isSubscribed: false,
                                freeTrial: true,
                                paymentsStarts: null,
                                lastInvoicedDate: null,
                                upcomingInvoicedDate: null,
                                credits: process.env.CREDIT_COUNT,
                                totalCredits: process.env.CREDIT_COUNT,
                            }
                        })
                    }
                    return sub
                })
            )
        )
    }
    return reply.status(200).send({
        data: "Canceled Subscription!"
    })
})

router.post('/payment-method-details', authMiddleware, async (request: any, reply: any) => {
    const subId = request.body.subId
    try {
        const user = request.user;
        const subIdDetails = await new Stripe().getSubscriptionDetails(subId)
        if(!user) throw "Not Authorized!"
        let response = null
        if(subIdDetails) {
            const paymentMethod = subIdDetails.default_payment_method
            const paymentMethodDetails = await new Stripe().getPaymentMethodDetails(paymentMethod)
            if(paymentMethodDetails) {
                response = {
                    brand: paymentMethodDetails.card.brand,
                    last4: paymentMethodDetails.card.last4
                }
            }
        }
        return reply.status(200).send({data: response})
    } catch(err: any) {
        return reply.status(500).send({
            message: err.message
        })
    }
})

router.get('/schedule', async (request: any, reply: any) => {
    const db = request.app.get('db')
    const freeTrialUsers = await db.db('lilleAdmin').collection('users').find({$or: [{isSubscribed: false, freeTrial: true}]}, {projection: {
        _id: 1, company: 1, email: 1, date: 1, freeTrailEndsDate: 1, name: 1, lastName:1
    }}).toArray()
    console.log(freeTrialUsers)
    await (
        Promise.all(
            freeTrialUsers.map(async (userData: any) => {
                const loginLogsCount = await db.db('loginLogs').collection(userData.company).find({
                    userId: new ObjectID(userData._id)
                }).count()
                const freeTrialEndDate = userData.freeTrailEndsDate
                if(loginLogsCount === 3) {
                    console.log(`sending free trail mail to ${userData.email} 3`)
                    const bodyText = await db.db('lilleAdmin').collection('emailTexts').findOne({type: "free_trial", "body.days": 3})
                    await sendMail(userData, "Free Trial Ending", bodyText.text)
                }
                const currentDate = new Date()
                let diffDays = Number((currentDate.getTime() - (new Date(userData.date).getTime())) / (1000 * 3600 * 24))
                let diffDaysFromFreeTrial = Number((currentDate.getTime() - (new Date(freeTrialEndDate).getTime())) / (1000 * 3600 * 24))
                if (diffDays < 0) {
                    diffDays =  Math.ceil(diffDays);
                }
            
                diffDays = Math.floor(diffDays);
                // console.log(diffDays)
                if(diffDays === 7) {
                    //send mail
                    console.log(`sending free trail mail to ${userData.email} 7`)
                    const bodyText = await db.db('lilleAdmin').collection('emailTexts').findOne({type: "free_trial", "body.days": 7})
                    await sendMail(userData, "Free Trial Ending", bodyText.text)
                }
                else if(diffDays === (parseInt(process.env.FREE_TRIAL_END || '14') - 1)) {
                    console.log(`sending free trail mail to ${userData.email} 13`)
                    const bodyText = await db.db('lilleAdmin').collection('emailTexts').findOne({type: "free_trial", "body.days": 13})
                    await sendMail(userData, "Free Trial Ending", bodyText.text)
                    //send mail
                }
                else if(diffDays === (process.env.FREE_TRIAL_END || 14)) {
                    console.log(`sending free trail mail to ${userData.email} 14`)
                    const bodyText = await db.db('lilleAdmin').collection('emailTexts').findOne({type: "free_trial", "body.days": 14})
                    await sendMail(userData, "Free Trial Expired", bodyText.text)
                    await db.db('lilleAdmin').collection('users').updateOne({
                        _id: new ObjectID(userData._id)
                    }, {
                        freeTrailEndsDate: new Date(),
                        freeTrial: true
                    })
                    //send mail + expire mark
                }
                else if(diffDaysFromFreeTrial && diffDaysFromFreeTrial < 28) {
                    for (let index = 1; index < 5; index++) {
                        console.log(`sending free trail mail to ${userData.email} 28`)
                        const weekDate = getDateString(new Date(new Date(freeTrialEndDate).setDate(new Date(freeTrialEndDate).getDate()+(index*7))))
                        const currentTimeStamp = getDateString(new Date())
                        if(currentTimeStamp === weekDate) {
                            const bodyText = await db.db('lilleAdmin').collection('emailTexts').findOne({type: "free_trial", "body.days": 28})
                            await sendMail(userData, "Free Trial Expired", bodyText.text)
                        }
                    }
                }
                return userData
            })
        )
    )
    return reply.status(200).send({
        message: "Email sent for free trails"
    })
})

router.post('/subscribe', async (request: any, reply: any) => {
    const db = request.app.get('db')
    const data = request.body
    try {
        const user = await db.db('lilleAdmin').collection('users').findOne({email: data.email});
        console.log(data)
        if(user) {
            return reply.status(400).send({
                message: "User already exist with this email!"
            })
        }
        const newUser = await db.db('lilleAdmin').collection('users').insertOne({
            _id: data.tempUserId ? new ObjectID(data.tempUserId) : new ObjectID(),
            email: data.email,
            name: data.firstName,
            lastName: data.lastName,
        })
        const stripeCustomerDetails = await new Stripe({...data, name: `${data.firstName} ${data.lastName}`}).createCustomer()
        const subscriptionDetails = await new Stripe({customerId: stripeCustomerDetails.id}).createSubscriptions(data.priceId)
        console.log(subscriptionDetails, "from subscribe")
        const confirmPayment = await new Stripe().fetchPayment(subscriptionDetails.latest_invoice.payment_intent.id)
        console.log(confirmPayment,"from subscribe")
        await db.db('lilleAdmin').collection('subscriptions').insertOne({
            user: new ObjectID(newUser.insertedId),
            subscriptionId: subscriptionDetails.id,
            customerId: stripeCustomerDetails.id,
            paymentIntentId: subscriptionDetails.latest_invoice.payment_intent.id,
            paymentStatus: confirmPayment.status,
            subscriptionStatus: subscriptionDetails.status,
            priceId: subscriptionDetails?.plan?.id,
            interval: subscriptionDetails?.plan?.interval,
            lastInvoicedDate: subscriptionDetails.current_period_start,
            upcomingInvoicedDate: subscriptionDetails.current_period_end
          })
        if(subscriptionDetails.latest_invoice.payment_intent.status === 'success') {
            const bodyText = await db.db('lilleAdmin').collection('emailTexts').findOne({type: "subscription"})
            await sendMail({...data, name: data.firstName}, "Subscritpion Confirmed", bodyText.text)
        }
        if(!['success', 'requires_action'].includes(subscriptionDetails.latest_invoice.payment_intent.status)) {
            console.log(`deleting user`)    
            await db
                .db("lilleAdmin")
                .collection("users")
                .deleteOne({ email: data.email! })   
            return reply.status(400).send({
                message: "Payment failed!"
            })    
        }
        return reply.status(200).send({
            data: {
                clientSecret: subscriptionDetails.latest_invoice.payment_intent.client_secret,
                subscriptionId: subscriptionDetails.id,
                status: subscriptionDetails.latest_invoice.payment_intent.status,
            }
        })
    }catch(err) {
        console.log(err)
        console.log(`deleting user`)    
        await db
            .db("lilleAdmin")
            .collection("users")
            .deleteOne({ email: data.email! })   
        return reply.status(400).send({
            error: true,
            message: err.message
        });
    }
})

module.exports = router