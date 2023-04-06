import { gql } from "@apollo/client";

export const regenerateBlog = gql`
  mutation ($options: RegenerateBlogOptions!) {
    regenerateBlog(options: $options) {
      _id
      publish_data {
        tiny_mce_data {
          tag
          children
        }
        published_date
        platform
        published
        creation_date
      }
      ideas {
        blog_id
        ideas {
          used
          idea
          article_id
        }
      }
      article_id
      tags
    }
  }
`;
