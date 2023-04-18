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
  const { bid } = router.query;
  const { data, loading, error } = useQuery(getBlogbyId, {
    variables: {
      fetchBlogId: bid,
    },
  });

  const [ideas, setIdeas] = useState([]);
  const [editorText, setEditorText] = useState([]);
  const [tags, setTags] = useState([]);
  const [blogData, setBlogData] = useState([]);

  const [pyResTime, setPyResTime] = useState(null);
  const [ndResTime, setNdResTime] = useState(null);

  useEffect(() => {
    if (data == null) return;

    console.log(data);
    setBlogData(data.fetchBlog);

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
          <div style={{
            zIndex: '10',
            position: 'absolute',
            background: 'white',
            border: '1px solid black',
            width: '200px',
            top: '2%',
            left: '50%',
            transform: 'translateX(-30%)',
            fontSize:'0.75rem'
          }}>
            <span>Python Response Time : {(pyResTime*60).toFixed(2) ?? ""}sec</span><br/>
            <span>Node Response Time : {(ndResTime*60).toFixed(2) ?? ""}sec</span>
          </div>
          <div className="w-[65%] relative">
            <TinyMCEEditor
              isAuthenticated={true}
              editorText={editorText}
              blogData={blogData}
              blog_id={bid}
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

            setPyResTime = {setPyResTime}
            setNdResTime = {setNdResTime}
          />
        </div>
      </Layout>
    </>
  );
}
