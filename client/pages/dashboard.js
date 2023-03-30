/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import DashboardInsights from "../components/DashboardInsights";
import Navbar from "../components/Navbar";
import { useMutation } from "@apollo/client";
import TinyMCEEditor from "../components/TinyMCEEditor";
import { updateBlog } from "../graphql/mutations/updateBlog";
import { generateBlog } from "../graphql/mutations/generateBlog";
import { jsonToHtml } from "../helpers/helper";

dashboard.getInitialProps = ({ query }) => {
  return { query };
};

export default function dashboard({ query }) {
  const { topic } = query;
  const [blog_id, setblog_id] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editorText, setEditorText] = useState("");
  const [ideas, setIdeas] = useState([]);
  const [GenerateBlog, { data, loading, error }] = useMutation(generateBlog);
  const [
    UpdateBlog,
    { data: updateData, loading: updateLoading, error: updateError },
  ] = useMutation(updateBlog);

  useEffect(() => {
    const getToken = localStorage.getItem("token");
    const tempId = localStorage.getItem("tempId");

    GenerateBlog({
      variables: {
        options: {
          user_id: tempId,
          keyword: topic,
        },
      },
      onCompleted: (data) => {
        console.log("692", data);
        const aa = data.generate.publish_data[2].tiny_mce_data;
        setIdeas(data.generate.ideas.ideas);
        setblog_id(data.generate._id);
        console.log("+++", aa);
        const htmlDoc = jsonToHtml(aa);
        setEditorText(htmlDoc);
        console.log("Sucessfully generated the article");
      },
      onError: (error) => {
        console.log(error);
      },
    }).catch((err) => {
      console.log(err);
    });

    if (
      getToken === "undefined" ||
      getToken === null ||
      getToken == undefined
    ) {
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <>
      <Layout>
        <div className="flex divide-x">
          <div className="h-[100%] w-[65%] pl-[20%] pr-9">
            <TinyMCEEditor
              topic={topic}
              isAuthenticated={isAuthenticated}
              editorText={editorText}
              loading={loading}
              blog_id={blog_id}
            />
          </div>
          <DashboardInsights
            loading={loading}
            ideas={ideas}
            blog_id={blog_id}
            setEditorText={setEditorText}
          />
        </div>
      </Layout>
    </>
  );
}
