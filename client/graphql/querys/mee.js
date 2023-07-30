import { gql } from "@apollo/client";

export const meeGetState = `query Query {
  me {
    upcomingInvoicedDate
    name
    lastName
    subscriptionId
    subscribeStatus
    paid
    lastInvoicedDate
    isSubscribed
    interval
    freeTrialDays
    freeTrial
    freeTrailEndsDate
    email
    date
    admin
    _id
    credits
    prefFilled
    profileImage
    publishCount
    prefData
    totalCredits
    paymentsStarts
    creditRenewDay
    hours_left_for_quota_renew
    remaining_twitter_quota
    total_twitter_quota
    emailVerified
  }
}`
export const meeAPI = gql`${meeGetState}`;