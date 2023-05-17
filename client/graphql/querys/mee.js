import { gql } from "@apollo/client";

export const meeAPI = gql`
  query Query {
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
    }
  }
`;
