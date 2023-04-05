/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import DashboardInsights from "../../components/DashboardInsights";
import useStore from '../../store/store'; // Add this import
import { useMutation } from "@apollo/client";
import TinyMCEEditor from "../../components/TinyMCEEditor";
import { generateBlog } from "../../graphql/mutations/generateBlog";
import { jsonToHtml } from "../../helpers/helper";

dashboard.getInitialProps = ({ query }) => {
  return { query };
};

export default function dashboard({ query }) {
  const { topic } = query;

  const isAuthenticated = useStore((state) => state.isAuthenticated);

  const [ideas, setIdeas] = useState([]);
  const [blog_id, setblog_id] = useState("");
  const [editorText, setEditorText] = useState("");
  const [blogData, setBlogData] = useState([])

  const keyword = useStore((state) => state.keyword);
  const [GenerateBlog, { data, loading, error }] = useMutation(generateBlog);

  useEffect(() => {
    const getToken = localStorage.getItem("token");
    var getUserId;
    if (typeof window !== "undefined") {
      getUserId = localStorage.getItem("userId");
    }
    var getTempId;
    if (typeof window !== "undefined") {
      getTempId = localStorage.getItem("tempId");
    }

    GenerateBlog({
      variables: {
        options: {
          user_id: getUserId ? getUserId : getTempId,
          keyword: topic ? topic : keyword, 
        },
      },
      onCompleted: (data) => {
        console.log(data)
        setBlogData(data.generate)

        setIdeas(data?.generate?.ideas?.ideas);
        setblog_id(data?.generate?._id);

        console.log("Sucessfully generated the article");
      },
      onError: (error) => {
        console.log(error);
      },
    }).catch((err) => {
      console.log(err);
    });
  }, []);

  return (
    <>
      <Layout>
        <div className="flex divide-x">
          <div className="h-[100%] w-[65%] mx-5 relative">
            <TinyMCEEditor
              topic={topic}
              isAuthenticated={isAuthenticated}
              blogData={blogData}
              loading={loading}
              blog_id={blog_id}
            />
          </div>
          <DashboardInsights
            ideas={ideas}
            loading={loading}
            blog_id={blog_id}
            setEditorText={setEditorText}
            setBlogData={setBlogData}
          />
        </div>
      </Layout>
    </>
  );
}
