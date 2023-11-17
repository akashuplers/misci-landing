import { gql } from "@apollo/client";

export const PUBLISH_STATE = 'mutation publish($options: PublisOptions) {\n  publish(options: $options)\n {\n    savedTime  }}'
export const PUBLISH_PRIVACY_STATE = 'mutation changePublishPrivacy($options: PublishPrivacy) {\n  changePublishPrivacy(options: $options)}'
export const publishBlogGQL = gql`${PUBLISH_STATE}`;
export const publishPricayGQL = gql`${PUBLISH_PRIVACY_STATE}`;