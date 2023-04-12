import { gql } from "@apollo/client";

export const getAllBlogs = gql`
  query Query($options: BlogListInput) {
    getAllBlogs(options: $options) {
      count
      blogs {
        _id
        description
        image
        tags
        title
      }
    }
  }
`;
