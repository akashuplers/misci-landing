import { gql } from "@apollo/client";

export const updateBlog = gql`
  mutation Mutation($options: UpdateBlogOptions!) {\n  updateBlog(options: $options) {\n    publish_data {\n      tiny_mce_data {\n        children\n        tag\n      }\n      published_date\n      published\n      platform\n      creation_date\n    }\n    ideas {\n      ideas {\n        idea\n   name\n     used\n        article_id\n      }\n      blog_id\n    }\n    article_id\n    _id\n  references {\n url\n  source\n}\n  }\n}
`;
