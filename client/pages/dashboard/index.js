/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import DashboardInsights from "../../components/DashboardInsights";
import useStore from "../../store/store"; // Add this import
import { useMutation, useQuery } from "@apollo/client";
import TinyMCEEditor from "../../components/TinyMCEEditor";
import { generateBlog } from "../../graphql/mutations/generateBlog";
import { jsonToHtml } from "../../helpers/helper";
import { getBlogbyId } from "../../graphql/queries/getBlogbyId";
import { useRouter } from "next/router";

dashboard.getInitialProps = ({ query }) => {
  return { query };
};

export default function dashboard({ query }) {
  const { topic } = query;
  const router = useRouter();
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  const [ideas, setIdeas] = useState([]);
  const [tags, setTags] = useState([]);
  const [blog_id, setblog_id] = useState("");
  const [editorText, setEditorText] = useState("");
  const [blogData, setBlogData] = useState([]);

  const keyword = useStore((state) => state.keyword);
  const [GenerateBlog, { data, loading, error }] = useMutation(generateBlog);

  useEffect(() => {
    const queryParams = router.query;
    if (queryParams.code) {
      window.location = "/dashboard";
    }
    const getToken = localStorage.getItem("token");
    var getUserId;
    if (typeof window !== "undefined") {
      getUserId = localStorage.getItem("userId");
    }
    var getTempId;
    if (typeof window !== "undefined") {
      getTempId = localStorage.getItem("tempId");
    }

    var bid;
    if (typeof window !== "undefined") {
      bid = localStorage.getItem("bid");
    }
    var loginProcess;
    if (typeof window !== "undefined") {
      loginProcess = localStorage.getItem("loginProcess");
    }
    if (bid && loginProcess) {
      var myHeaders = new Headers();
      myHeaders.append("content-type", "application/json");

      var graphql = JSON.stringify({
        query:
          "query FetchBlog($fetchBlogId: String!) {\n  fetchBlog(id: $fetchBlogId) {\n    _id\n    article_id\n    ideas {\n      blog_id\n      ideas {\n        used\n        idea\n        article_id\n      }\n    }\n    publish_data {\n      tiny_mce_data {\n        children\n        tag\n      }\n      published_date\n      published\n      platform\n      creation_date\n    }\n  }\n  trendingTopics\n  increment\n}",
        variables: { fetchBlogId: bid },
      });
      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: graphql,
        redirect: "follow",
      };

      fetch("https://maverick.lille.ai/graphql", requestOptions)
        .then((response) => response.text())
        .then((res) => {
          const { data } = JSON.parse(res);
          setBlogData(data.fetchBlog);
          const aa = data.fetchBlog.publish_data[2].tiny_mce_data;
          setIdeas(data.fetchBlog.ideas.ideas);
          setblog_id(data.fetchBlog._id);
          const htmlDoc = jsonToHtml(aa);
          setEditorText(htmlDoc);
          localStorage.removeItem("bid");
          localStorage.removeItem("loginProcess");
        })
        .catch((error) => console.log("error", error));
    } else {
      GenerateBlog({
        variables: {
          options: {
            user_id: getUserId ? getUserId : getTempId,
            keyword: topic ? topic : keyword,
          },
        },
        onCompleted: (data) => {
          console.log(data);
          setBlogData(data.generate);

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
    }
  }, []);

  return (
    <>
      <Layout>
        <div className="flex divide-x">
          <div className="h-[100%] w-[70%] mx-5 relative">
            <TinyMCEEditor
              topic={topic}
              isAuthenticated={isAuthenticated}
              loading={loading}
              editorText={editorText}
              blogData={blogData}
              blog_id={blog_id}
            />
          </div>
          <DashboardInsights
            ideas={ideas}
            tags={tags}
            loading={loading}
            setEditorText={setEditorText}
            setBlogData={setBlogData}
            setblog_id={setblog_id}
            setIdeas={setIdeas}
            blog_id={blog_id}
            setTags={setTags}
          />
        </div>
      </Layout>
    </>
  );
}
