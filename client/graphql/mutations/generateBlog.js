import { gql } from "@apollo/client";

export const generateBlog = gql`
  mutation Mutation($options: GenerateBlogOptions!) {\n  generate(options: $options) {\n    publish_data {\n      tiny_mce_data {\n        children\n        tag\n      }\n      published_date\n      published\n      platform\n      creation_date\n    }\n    ideas {\n      blog_id\n      ideas {\n        idea\n        article_id\n    used\n  reference {\n type\n  link\n  id\n} \n }\n    }\n    article_id\n  tags\n   _id\n  references\n  }\n}
`;
