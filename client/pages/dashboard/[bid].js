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

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", function (event) {
    event.stopImmediatePropagation();
  });
}

export default function Post() {
  const [pfmodal, setPFModal] = useState(false);
  const router = useRouter();
  const { bid, isPublished } = router.query;

  // console.log("isPublished", isPublished);
  console.log("router.query", router.query);
  const { data, loading, error } = useQuery(getBlogbyId, {
    variables: {
      fetchBlogId: bid,
    },
  });
  // const [isPublished, setIsPublished] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const [editorText, setEditorText] = useState([]);
  const [tags, setTags] = useState([]);
  const [blogData, setBlogData] = useState([]);

  useEffect(() => {
    if (data == null) return;

    console.log(data);
    setBlogData(data.fetchBlog);
    // setIsPublished(data?.fetchBlog?.publish_data[2]?.published);

    // const aa = data.generate.publish_data[2].tiny_mce_data;
    const aa = data.fetchBlog.publish_data.find(
      (pd) => pd.platform === "wordpress"
    ).tiny_mce_data;
    const htmlDoc = jsonToHtml(aa);
    setEditorText(htmlDoc);

    setIdeas(data.fetchBlog.ideas.ideas);
    setTags(data.fetchBlog.tags);
  }, [data]);

  var getToken;
  if (typeof window !== "undefined") {
    getToken = localStorage.getItem("token");
  }

  const { data: meeData } = useQuery(meeAPI, {
    context: {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getToken,
      },
    },
  });

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = null;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    console.log(meeData);
    if (meeData?.me.prefFilled === false) {
      setPFModal(true);
    }
  }, [meeData]);

  return (
    <>
      <Layout>
        <div className="flex divide-x">
          {pfmodal && (
            <PreferencesModal
              pfmodal={pfmodal}
              setPFModal={setPFModal}
              getToken={getToken}
            />
          )}
          <div className="w-[60%] relative">
            <TinyMCEEditor
              isAuthenticated={true}
              editorText={editorText}
              blogData={blogData}
              blog_id={bid}
              isPublished={isPublished}
            />
          </div>
          <DashboardInsights
            ideas={ideas}
            blog_id={bid}
            tags={tags}
            // loading={loading}
            setEditorText={setEditorText}
            setBlogData={setBlogData}
            setIdeas={setIdeas}
            setTags={setTags}
            // tags={data?.fetchBlog?.tags}
          />
        </div>
      </Layout>
    </>
  );
}
