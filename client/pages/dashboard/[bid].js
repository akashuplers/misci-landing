import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { getBlogbyId } from "../../graphql/queries/getBlogbyId";
import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import DashboardInsights from "../../components/DashboardInsights";
import Navbar from "../../components/Navbar";
import PreferencesModal from "../../modals/PreferencesModal";
import TinyMCEEditor from "../../components/TinyMCEEditor";
import { jsonToHtml } from "../../helpers/helper";
import { meeAPI } from "../../graphql/querys/mee";

export default function Post() {
  const [pfmodal, setPFModal] = useState(false);
  const router = useRouter();
  const { bid } = router.query;
  const { data, loading, error } = useQuery(getBlogbyId, {
    variables: {
      fetchBlogId: bid,
    },
  });

var getToken;
  if (typeof window !== "undefined") {
    getToken = localStorage.getItem("token");
  }



  const {
    data: meeData,
  } = useQuery(meeAPI, {
    context: {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getToken,
      },
    },
  });

  useEffect(() => {
    console.log(meeData)
    if(meeData?.me.prefFilled === false){
      setPFModal(true);
    } 
  },[meeData])

  return (
    <>
      <Layout>
        <div className="flex divide-x mt-[2em] pb-[1em]">
      {pfmodal && 
        <PreferencesModal
          pfmodal={pfmodal}
          setPFModal={setPFModal}
          getToken={getToken}
        />

        }
          <div className="h-[100%] w-[70%] mx-5 relative">
            <TinyMCEEditor
              editorText={jsonToHtml(
                data?.fetchBlog?.publish_data.find(pd => pd.platform === 'wordpress').tiny_mce_data
              )}
              // data?.fetchBlog?.publish_data[2].tiny_mce_data ^^
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
