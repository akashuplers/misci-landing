import { gql } from "@apollo/client";

export const regenerateBlog = gql`
  mutation Mutation($options: RegenerateBlogOptions!) {
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
          name
          used
          idea
          article_id
          reference {
            type
            link
            id
          }
        }
        freshIdeas {
          used
          idea
          article_id
          name
          reference {
            type
            link
            id
          }
        }
      }
      article_id
      tags
      freshIdeasTags
      references {
        url
        source
      }
      freshIdeasReferences {
        url
        source
      }
      pythonRespTime
      respTime
    }
  }
`;
