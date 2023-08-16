import { gql } from "@apollo/client";


export const getBlogbyIdState = `
query FetchBlog($fetchBlogId: String!) {
fetchBlog(id: $fetchBlogId) {
  _id
  article_id
  references {
      url
      source    
  }
  likes
  comments {
      _id
      userId
      blogId
      text
      name
      date
  }
  userDetail {
      profileImage
      linkedInUserName
      twitterUserName
      userName
      googleUserName
      name
      lastName
  }
  savedTime
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
    threads
    published_date
    published
    platform
    creation_date
  }
}
trendingTopics
increment
}
`

export const getBlogbyId = gql`${getBlogbyIdState}`
