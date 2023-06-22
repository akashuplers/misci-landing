import { gql } from "@apollo/client";

export const updateBlog = gql`
  mutation Mutation($options: UpdateBlogOptions!) {
    updateBlog(options: $options) {
      publish_data {
        tiny_mce_data {
          children
          tag
        }
        threads
        published_date
        published
        platform
        creation_date
      }
      ideas {
        ideas {
          idea
          name
          used
          article_id
        }
        blog_id
      }
      article_id
      _id
      references {
        url
        source
      }
    }
  }
`;
