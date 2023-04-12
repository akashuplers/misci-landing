import { gql } from "@apollo/client";

export const deleteBlog = gql`
  mutation delete($options: PublisOptions) {
    delete(options: $options)
  }
`;
