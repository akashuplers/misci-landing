import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { getBlogbyId } from "../../graphql/queries/getBlogbyId";
import React, { useState, useEffect } from "react";

import { jsonToHtml } from "../../helpers/helper";

export default function Post() {
  const router = useRouter();
  const { bid } = router.query;
  const { data, loading, error } = useQuery(getBlogbyId, {
    variables: {
      fetchBlogId: bid,
    },
  });
  const html = jsonToHtml(data?.fetchBlog?.publish_data[2].tiny_mce_data);

  return (
    <>
      <div className="p-4 px-20">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <style>
        {`
      h3{
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 16px;
  margin-top: 16px;
  margin-left: 4px;
}
img{
  width: 500px;
  height: 300px;
  padding: 16px
}
p{
font-size: 19px;
  line-height: 1.5;
  margin-bottom: 12px;
}
        `}
      </style>
    </>
  );
}
