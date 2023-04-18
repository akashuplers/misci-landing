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
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", function (event) {
    event.stopImmediatePropagation();
  });
}

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
  const [pyResTime, setPyResTime] = useState(null);
  const [ndResTime, setNdResTime] = useState(null);

  const keyword = useStore((state) => state.keyword);
  const [GenerateBlog, { data, loading, error }] = useMutation(generateBlog);

  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", function (event) {
      event.stopImmediatePropagation();
    });
  }
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
    const getToken = localStorage.getItem("token");
    const Gbid = localStorage.getItem("Gbid");
    if (getToken && Gbid) {
      localStorage.removeItem("Gbid");
    }
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
      /*var myHeaders = new Headers();
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
          // const aa = data.fetchBlog.publish_data[2].tiny_mce_data;
          const aa = data.fetchBlog.publish_data.find(
            (pd) => pd.platform === "wordpress"
          ).tiny_mce_data;
          setIdeas(data.fetchBlog.ideas.ideas);
          setblog_id(data.fetchBlog._id);
          const htmlDoc = jsonToHtml(aa);
          setEditorText(htmlDoc);
          const queryParams = router.query;
          if (!queryParams.code) {
            localStorage.removeItem("bid");
            localStorage.removeItem("loginProcess");
          }
        })
        .finally(() => {
          toast.success("LinkedIn SignUp Succesfull!!");
        })
        .catch((error) => console.log("error", error));*/

      console.log("Harsh test this block");

      const myHeaders = {
        "Content-Type": "application/json",
      };

      const graphql = JSON.stringify({
        query:        "query FetchBlog($fetchBlogId: String!) {\n  fetchBlog(id: $fetchBlogId) {\n      _id\n      article_id\n      references\n      ideas {\n      blog_id\n      ideas {\n          used\n          idea\n          article_id\n          name\n          reference {\n              type\n              link\n              id\n          }\n      }\n      freshIdeas {\n          used\n          idea\n          article_id\n          name\n          reference {\n              type\n              link\n              id\n          }\n      }\n      }\n      publish_data {\n      tiny_mce_data {\n          children\n          tag\n      }\n      published_date\n      published\n      platform\n      creation_date\n      }\n  }\n  trendingTopics\n  increment\n}",
        variables: { fetchBlogId: bid },
      });

      const config = {
        method: "post",
        url: "https://maverick.lille.ai/graphql",
        headers: myHeaders,
        data: graphql,
        redirect: "follow",
      };

      axios(config)
        .then(function (response) {
          const data = response.data.data;
          console.log("fetchblog ", data);
          setBlogData(data.fetchBlog);
          const aa = data.fetchBlog.publish_data.find(
            (pd) => pd.platform === "wordpress"
          ).tiny_mce_data;
          setIdeas(data.fetchBlog.ideas.ideas);
          setblog_id(data.fetchBlog._id);
          const htmlDoc = jsonToHtml(aa);
          setEditorText(htmlDoc);
          const queryParams = router.query;
          if (!queryParams.code) {
            localStorage.removeItem("bid");
            localStorage.removeItem("loginProcess");
          }
        })
        .finally(() => {
          toast.success("LinkedIn SignUp Succesfull!!");
        })
        .catch(function (error) {
          console.log(error);
        });
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

          // const aa = data.generate.publish_data[2].tiny_mce_data;
          const aa = data.generate.publish_data.find(
            (pd) => pd.platform === "wordpress"
          ).tiny_mce_data;

          setIdeas(data.generate.ideas.ideas);
          setblog_id(data.generate._id);
          localStorage.setItem("Gbid", data.generate._id);
          setTags(data.generate.tags);
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
          <div className="w-[65%] relative">
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
