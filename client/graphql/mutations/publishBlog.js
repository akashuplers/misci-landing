import { gql } from "@apollo/client";

export const PUBLISH_STATE = 'mutation publish($options: PublisOptions) {\n  publish(options: $options)\n {\n    savedTime  }}'
export const publishBlogGQL = gql`${PUBLISH_STATE}`;