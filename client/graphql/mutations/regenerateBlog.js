import { gql } from "@apollo/client";

export const regenerateBlog = gql`
  mutation Mutation($options: RegenerateBlogOptions!) {\n  regenerateBlog(options: $options) {\n    _id\n    publish_data {\n      tiny_mce_data {\n        tag\n        children\n      }\n      published_date\n      platform\n      published\n      creation_date\n    }\n    ideas {\n      blog_id\n      ideas {\n    name\n    used\n        idea\n        article_id\n  reference {\n type\n  link\n  id\n}    }\n    }\n    article_id\n  tags\n  references\n  }\n}
`;
