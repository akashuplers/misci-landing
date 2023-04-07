import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { getBlogbyId } from "../../graphql/queries/getBlogbyId";
import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import DashboardInsights from "../../components/DashboardInsights";
import Navbar from "../../components/Navbar";
import TinyMCEEditor from "../../components/TinyMCEEditor";
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
      <Layout>
        <div className="flex divide-x mt-[2em]">
          <div className="h-[100%] w-[70%] mx-5 relative">
            <TinyMCEEditor
              editorText={jsonToHtml(
                data?.fetchBlog?.publish_data[2].tiny_mce_data
              )}
              blog_id={bid}
              isAuthenticated={true}
              blogData={data?.fetchBlog}
            />
          </div>
          <DashboardInsights
            ideas={data?.fetchBlog?.ideas?.ideas}
            blog_id={bid}
          />
        </div>
      </Layout>
    </>
  );
}
