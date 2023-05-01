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
import { API_BASE_PATH, API_ROUTES } from "../../constants/apiEndpoints";

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
  const [freshIdeas, setFreshIdeas] = useState([]);
  const [tags, setTags] = useState([]);
  const [freshIdeaTags, setFreshIdeaTags] = useState([]);
  const [blog_id, setblog_id] = useState("");
  const [editorText, setEditorText] = useState("");
  const [blogData, setBlogData] = useState([]);
  const [pyResTime, setPyResTime] = useState(null);
  const [ndResTime, setNdResTime] = useState(null);

  const [reference, setReference] = useState([]);
  const [freshIdeasReferences, setFreshIdeasReferences] = useState([]);

  const keyword = useStore((state) => state.keyword);
  // useEffect(() => {
  //   const queryParams = router.query;
  //   if (!topic && !queryParams.code) {
  //     alert(
  //       "Since you have refreshed the page,Therefore no keyword was passed. Please Generate the blog again!!"
  //     );
  //     window.location.href = "/";
  //   }
  // }, []);

  console.log("keyword", keyword, topic);
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
        query:
          "query FetchBlog($fetchBlogId: String!) {\n  fetchBlog(id: $fetchBlogId) {\n    _id\n    article_id\n    references {\n        url\n        source    \n    }\n    freshIdeasReferences {\n        url\n        source    \n    }\n    tags\n    ideas {\n      blog_id\n      ideas {\n        used\n        idea\n        article_id\n        name\n        reference {\n            type\n            link\n            id\n        }\n      }\n      freshIdeas {\n        used\n        idea\n        article_id\n        name\n        reference {\n            type\n            link\n            id\n        }\n      }\n    }\n    publish_data {\n      tiny_mce_data {\n        children\n        tag\n      }\n      published_date\n      published\n      platform\n      creation_date\n    }\n  }\n  trendingTopics\n  increment\n}",
        variables: { fetchBlogId: bid },
      });

      const config = {
        method: "post",
        url: API_BASE_PATH + API_ROUTES.GQL_PATH,
        headers: myHeaders,
        data: graphql,
        redirect: "follow",
      };

      axios(config)
        .then((response) => {
          const data = response?.data?.data;
          console.log("fetchblog>>>> ", data);
          setBlogData(data.fetchBlog);
          setIdeas(data.fetchBlog.ideas.ideas);
          setTags(data.fetchBlog.tags);
          setFreshIdeaTags(data.fetchBlog.freshIdeasTags);
          setFreshIdeasReferences(data?.fetchBlog?.freshIdeasReferences);
          setReference(data?.fetchBlog?.references);
          setFreshIdeas(data?.fetchBlog?.idea?.freshIdeas);
          setblog_id(data?.fetchBlog?._id);
          console.log("nnububhj", data?.fetchBlog?.references);
          const newArray = data.fetchBlog.publish_data.filter(
            (obj) => obj.platform === "wordpress"
          );
          var aa;
          const arr = newArray.find((pd) => pd.published === false);
          if (arr) {
            aa = arr.tiny_mce_data;
          } else {
            aa = newArray[newArray.length - 1].tiny_mce_data;
          }
          const htmlDoc = jsonToHtml(aa);
          setEditorText(htmlDoc);

          const queryParams = router.query;
          console.log("queryParams", queryParams);
          if (!queryParams.code) {
            localStorage.removeItem("bid");
            localStorage.removeItem("loginProcess");
          }
        })
        .then((data) => {})
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

          setReference(data.generate.references);

          setPyResTime(data.generate.pythonRespTime);
          setNdResTime(data.generate.respTime);

          // const aa = data.generate.publish_data[2].tiny_mce_data;
          const newArray = data.generate.publish_data.filter(
            (obj) => obj.platform === "wordpress"
          );
          var aa;
          const arr = newArray.find((pd) => pd.published === false);
          if (arr) {
            aa = arr.tiny_mce_data;
          } else {
            aa = newArray[newArray.length - 1].tiny_mce_data;
          }

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

  useEffect(() => {
    console.log("===restime===");
    console.log(pyResTime, ndResTime);
    console.log("===restime===");
  }, [pyResTime, ndResTime]);

  console.log(freshIdeasReferences);
  return (
    <>
      <Layout>
        <div className="flex mb-6 h-[88vh]">
          {API_BASE_PATH === "https://maverick.lille.ai" && (
            <div
              style={{
                zIndex: "10",
                position: "absolute",
                background: "white",
                border: "1px solid black",
                width: "200px",
                top: "2%",
                left: "50%",
                transform: "translateX(-30%)",
                fontSize: "0.75rem",
              }}
            >
              <span>
                Python Response Time : {(pyResTime * 60).toFixed(2) ?? ""}sec
              </span>
              <br />
              <span>
                Node Response Time : {(ndResTime * 60).toFixed(2) ?? ""}sec
              </span>
            </div>
          )}
          <div className="relative" style={{ width: "var(--tinymce-width)" }}>
            <TinyMCEEditor
              topic={topic}
              isAuthenticated={isAuthenticated}
              loading={loading}
              editorText={editorText}
              blogData={blogData}
              blog_id={blog_id}
            />
          </div>
          <div
            className="relative"
            style={{ width: "var(--dashboardInsight-width)" }}
          >
            <DashboardInsights
              ideas={ideas}
              setIdeas={setIdeas}
              tags={tags}
              setTags={setTags}
              freshIdeaTags={freshIdeaTags}
              blog_id={blog_id}
              setblog_id={setblog_id}
              loading={loading}
              setEditorText={setEditorText}
              setBlogData={setBlogData}
              setPyResTime={setPyResTime}
              setNdResTime={setNdResTime}
              freshIdeas={freshIdeas}
              freshIdeasReferences={freshIdeasReferences}
              setFreshIdeaReferences={setFreshIdeasReferences}
              reference={reference}
              setReference={setReference}
            />
          </div>
        </div>
      </Layout>
    </>
  );
}
