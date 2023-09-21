import { gql } from "@apollo/client";


export const getBlogbyIdState = `
query FetchBlog($fetchBlogId: String!) {
  fetchBlog(id: $fetchBlogId) {
    _id
    article_id
    likes
    comments {
        _id
        userId
        blogId
        text
        name
        email
        date
    }
    userDetail {
        profileImage
        linkedInUserName
        twitterUserName
        name
        lastName
        userName
    }
    savedTime
    references {
        url
        source    
        type    
        id    
    }
    freshIdeasReferences {
        url
        source    
    }
    tags
    freshIdeasTags
    ideas {
      blog_id
      ideas {
        used
        idea
        article_id
        name
        type    
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
    publish_data {
      tiny_mce_data {
        children
        tag
      }
      published_date
      published
      platform
      creation_date
      threads
    }
  }
  trendingTopics
  increment
}
`

export const getBlogbyId = gql`${getBlogbyIdState}`
