import { gql } from "@apollo/client"

const GET_ALL_LIBRARIES_ITEMS =
`query Query($options: BlogListInput) {
    getAllBlogs(options: $options) {
      count
      blogs {
        _id
        title
        description
        image
        tags
        status
        date
      }
    }
  }
`
export const GQL_GET_ALL_LIBRARIES_ITEMS = gql`${GET_ALL_LIBRARIES_ITEMS}`