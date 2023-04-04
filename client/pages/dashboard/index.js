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

        const aa = data.generate.publish_data[2].tiny_mce_data;
        setIdeas(data.generate.ideas.ideas);
        setblog_id(data.generate._id);

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
  }, []);

  function handleBlog(e){
    const siblingButton = document.querySelectorAll(".blog-toggle-button");
    siblingButton.forEach(el => el.classList.remove("active"))
    const button = e.target;
    button.classList.add("active")

    const aa = blogData.publish_data[2].tiny_mce_data;
    const htmlDoc = jsonToHtml(aa);

    setIdeas(blogData.ideas.ideas);
    setblog_id(blogData._id);
    setEditorText(htmlDoc);
  }
  function handleLinkedinBlog(e){
    const siblingButton = document.querySelectorAll(".blog-toggle-button");
    siblingButton.forEach(el => el.classList.remove("active"))
    const button = e.target;
    button.classList.add("active")

    const aa = blogData.publish_data[0].tiny_mce_data;
    const htmlDoc = jsonToHtml(aa);

    setIdeas(blogData.ideas.ideas);
    setblog_id(blogData._id);
    setEditorText(htmlDoc);
  }
  function handleTwitterBlog(e){
    const siblingButton = document.querySelectorAll(".blog-toggle-button");
    siblingButton.forEach(el => el.classList.remove("active"))
    const button = e.target;
    button.classList.add("active")

    const aa = blogData.publish_data[1].tiny_mce_data;
    const htmlDoc = jsonToHtml(aa);

    setIdeas(blogData.ideas.ideas);
    setblog_id(blogData._id);
    setEditorText(htmlDoc);
  }

  return (
    <>
      <Layout>
        <div className="flex divide-x">
          <div className="h-[100%] w-[65%] ml-[20%] mr-9 relative">
            <TinyMCEEditor
              topic={topic}
              isAuthenticated={isAuthenticated}
              editorText={editorText}
              loading={loading}
              blog_id={blog_id}
              handleBlog = {handleBlog}
              handleLinkedinBlog = {handleLinkedinBlog}
              handleTwitterBlog = {handleTwitterBlog}
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
