import { gql } from "@apollo/client";

export const generateBlog = gql`
  mutation Mutation($options: GenerateBlogOptions!) {
    generate(options: $options) {
      publish_data {
        tiny_mce_data {
          children
          tag
        }
        published_date
        published
        platform
        creation_date
      }
      ideas {
        blog_id
        ideas {
          idea
          name
          article_id
          used
          reference {
            type
            link
            id
          }
        }
      }
      article_id
      tags
      _id
      references {
        url
        source
      }
      pythonRespTime
      respTime
    }
  }
`;
