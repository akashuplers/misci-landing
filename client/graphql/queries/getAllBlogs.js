import { gql } from "@apollo/client";

export const getAllBlogs = gql`
  query Query {
     getAllBlogs {   _id   title  description   tags image}
  }
`;
