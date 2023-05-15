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
import TrialEndedModal from "../../components/TrialEndedModal";
import Modal from "react-modal";

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
  const [option, setOption] = useState("blog");
  const [reference, setReference] = useState([]);
  const [freshIdeasReferences, setFreshIdeasReferences] = useState([]);
  const [creditModal, setCreditModal] = useState(false);
  const [modalOpen, setOpenModal] = useState(false);

  const keyword = useStore((state) => state.keyword);
  const updateCredit = useStore((state) => state.updateCredit);

  var getToken;
  if (typeof window !== "undefined") {
    getToken = localStorage.getItem("token");
  }

  var bid;
  if (typeof window !== "undefined") {
    bid = localStorage.getItem("bid");
  }
  var loginProcess;
  if (typeof window !== "undefined") {
    loginProcess = localStorage.getItem("loginProcess");
  }

  useEffect(() => {
    if (!topic && !bid && !loginProcess) {
      alert("No Keyword Found...\nPlease generate the blog again!");
      window.location.href = "/";
    }
  }, []);

  const [GenerateBlog, { data, loading, error }] = useMutation(generateBlog, {
    context: {
      headers: {
        "Content-Type": "application/json",
        ...(getToken && { Authorization: "Bearer " + getToken }),
      },
    },
  });

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
          if (!queryParams.code && !queryParams.oauth_token) {
            localStorage.removeItem("bid");
            localStorage.removeItem("loginProcess");
            localStorage.removeItem("pass");
          }
        })
        .then((data) => {})
        .finally(() => {
          const for_TW = localStorage.getItem("for_TW");
          if (for_TW) {
            toast.success("Twitter Integration Done!!");
            setOption("twitter-comeback");
          } else {
            toast.success("Linkedin Integration Done!!");
            setOption("linkedin-comeback");
          }
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
          var token;
          if (typeof window !== "undefined") {
            token = localStorage.getItem("token");
          }
          if (token) updateCredit();
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
          if (error.message === 'Unexpected error value: "@Credit exhausted"') {
            toast.error("Credit exhausted");
            setCreditModal(true);
          } else {
            if (error.message) {
              setOpenModal(true);
            }
          }
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
        {creditModal && (
          <TrialEndedModal setTrailModal={setCreditModal} topic={topic} />
        )}

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
              option={option}
              setOption={setOption}
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
      <Modal
        isOpen={modalOpen}
        ariaHideApp={false}
        className="w-[100%] sm:w-[38%] max-h-[95%]"
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: "9999",
          },
          content: {
            position: "absolute",
            top: "50%",
            left: "50%",
            right: "auto",
            border: "none",
            background: "white",
            // boxShadow: "0px 4px 20px rgba(170, 169, 184, 0.1)",
            borderRadius: "8px",
            height: "350px",
            // width: "100%",
            maxWidth: "450px",
            bottom: "",
            zIndex: "999",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            padding: "30px",
            paddingBottom: "0px",
          },
        }}
      >
        <div className="mx-auto pb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-24 h-24 ml-[35%]"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <div className="mx-auto font-bold text-2xl pl-[35%]">Timeout</div>
        <p className="text-gray-500 text-base font-medium mt-4 mx-auto pl-5">
          We regret that it is taking more time to generate the blog right now,
          Please try again after some time...
        </p>
        <div className="m-9 mx-auto">
          <button
            class="w-[240px] ml-16 bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 border border-indigo-700 rounded"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Go Back
          </button>
          {/* <button class="w-[240px] ml-9 bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded text-sm"></button> */}
        </div>
      </Modal>
    </>
  );
}
