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
    emailVerified
    userName
    paymentsStarts
    isAdmin
    creditRenewDay
    hours_left_for_quota_renew
    __typename
    twitterUserName
    linkedInUserName
    googleUserName
  }
}`
export const meeAPI = gql`${meeGetState}`;