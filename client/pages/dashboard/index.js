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
          keyword: keyword, // Use the keyword from the store
        },
      },
      onCompleted: (data) => {
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

  function handleBlog(){
    console.log("here")
    const aa = blogData.publish_data[2].tiny_mce_data;
    const htmlDoc = jsonToHtml(aa);

    setIdeas(blogData.ideas.ideas);
    setblog_id(blogData._id);
    setEditorText(htmlDoc);
  }
  function handleLinkedinBlog(){
    console.log("here blg")
    const aa = blogData.publish_data[0].tiny_mce_data;
    const htmlDoc = jsonToHtml(aa);

    setIdeas(blogData.ideas.ideas);
    setblog_id(blogData._id);
    setEditorText(htmlDoc);
  }
  function handleTwitterBlog(){
    console.log("here twi")
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
            {isAuthenticated ? 
              <div style={{
                'position': 'absolute',
                'top': '-5%',
                'left': '0',
                'display': 'flex',
                'gap': '0.5em',
                'border': '1px solid'
              }}>
                <button onClick={handleBlog}>Blog</button>
                <button onClick={handleLinkedinBlog}>Linkedin</button>
                <button onClick={handleTwitterBlog}>Twitter</button>
              </div> : 
              <div></div> 
            }
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
