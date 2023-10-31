import { gql } from "@apollo/client";

export const deleteBlogByAdmin = gql`
  mutation deleteBlogByAdmin($options: AdminDeleteOptions) {
    deleteBlogByAdmin(options: $options)
  }
`;
