/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import DashboardInsights from "../../components/DashboardInsights";
import useKeywordStore from '../../store/store'; // Add this import
import { useMutation } from "@apollo/client";
import TinyMCEEditor from "../../components/TinyMCEEditor";
import { generateBlog } from "../../graphql/mutations/generateBlog";
import { jsonToHtml } from "../../helpers/helper";

dashboard.getInitialProps = ({ query }) => {
  return { query };
};

export default function dashboard({ query }) {
  const { topic } = query;
  const [blog_id, setblog_id] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editorText, setEditorText] = useState("");
  const [ideas, setIdeas] = useState([]);
  const keyword = useKeywordStore((state) => state.keyword);
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
