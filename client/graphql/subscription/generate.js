import { gql } from '@apollo/client';

export const STEP_COMPLETES_SUBSCRIPTION = gql`
  subscription StepCompletesSubscription($userId: String!) {
    stepCompletes(userId: $userId) {
      userId
      step
      keyword
    }
  }
`;