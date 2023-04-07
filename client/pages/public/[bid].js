import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { getBlogbyId } from "../../graphql/queries/getBlogbyId";
import React, { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { jsonToHtml } from "../../helpers/helper";

export default function Post() {
  const router = useRouter();
  const { bid } = router.query;
  const { data, loading, error } = useQuery(getBlogbyId, {
    variables: {
      fetchBlogId: bid,
    },
  });

  return (
    <>
      <Editor
        value={jsonToHtml(data?.fetchBlog?.publish_data[2].tiny_mce_data)}
        apiKey="i40cogfqfupotdcavx74ibdbucbojjvpuzbl8tqy34atmkyd"
        init={{
          skin: "naked",
          icons: "small",
          toolbar_location: "bottom",
          plugins: "lists code table codesample link",
          menubar: false,
          statusbar: false,
          height: 900,
        }}
        disabled={true}
      />
    </>
  );
}
