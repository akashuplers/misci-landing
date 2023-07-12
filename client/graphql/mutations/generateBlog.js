import { gql } from "@apollo/client";

export const generateBlog = gql`
  mutation Mutation($options: GenerateBlogOptions!) {
    generate(options: $options) {
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


const generateBlogMutationString = `
mutation Mutation($options: GenerateBlogOptions!) {
  generate(options: $options) {
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
}`
export function generateBlogMutation(options) {
  return {
    query: generateBlogMutationString, 
    variables: {
      options: options,
    },
  };
}

