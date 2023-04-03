import { gql } from "@apollo/client";

export const getBlogbyId = gql`
  query FetchBlog($fetchBlogId: String!) {
    fetchBlog(id: $fetchBlogId) {
      _id
      article_id
      ideas {
        blog_id
        ideas {
          used
          idea
          article_id
        }
      }
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
    }
    trendingTopics
    increment
  }
`;
