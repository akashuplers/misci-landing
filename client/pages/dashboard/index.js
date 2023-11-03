/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { CloseButtonIcon } from "@/components/localicons/localicons";
import { meeAPI } from "@/graphql/querys/mee";
import { useMutation, useQuery } from "@apollo/client";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import DashboardInsights from "../../components/DashboardInsights";
import Layout from "../../components/Layout";
import TinyMCEEditor from "../../components/TinyMCEEditor";
import TrialEndedModal from "../../components/TrialEndedModal";
import MoveToRegenPanel from "../../components/localicons/MoveToRegenPanel";
import { API_BASE_PATH, API_ROUTES } from "../../constants/apiEndpoints";
import { generateBlog } from "../../graphql/mutations/generateBlog";
import { jsonToHtml } from "../../helpers/helper";
import ReactLoading from "react-loading";
import useStore, { useBlogDataStore, useByMeCoffeModal, useTabOptionStore } from "../../store/store";
import { TotalTImeSaved } from "@/modals/TotalTImeSaved";
import useUserTimeSave from "@/hooks/useUserTimeSave";
import { TYPES_OF_GENERATE } from "@/store/appContants";
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", function (event) {
    event.stopImmediatePropagation();
  });
}

dashboard.getInitialProps = ({ query }) => {
  return { query };
};
const DEFAULT_TIME_MULTIPLE = 30;

export default function dashboard({ query }) {
  var { topic, type } = query;
  const router = useRouter();
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const [ideas, setIdeas] = useState([]);
  const [freshIdeas, setFreshIdeas] = useState([]);
  const [tags, setTags] = useState([]);
  const [freshIdeaTags, setFreshIdeaTags] = useState([]);
  const [blog_id, setblog_id] = useState("");
  const [editorText, setEditorText] = useState("");
  // const [blogData, setBlogData] = useState([]);
  const { blogData, setBlogData } = useBlogDataStore();
  const [pyResTime, setPyResTime] = useState(null);
  const [ndResTime, setNdResTime] = useState(null);
  const { option, setOption } = useTabOptionStore()
  const [reference, setReference] = useState([]);
  const [freshIdeasReferences, setFreshIdeasReferences] = useState([]);
  const [creditModal, setCreditModal] = useState(false);
  const [modalOpen, setOpenModal] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const BASE_PRICE = 500;
  const keyword = useStore((state) => state.keyword);
  const updateCredit = useStore((state) => state.updateCredit);
  const showContributionModal = useByMeCoffeModal((state) => state.isOpen);
  const setShowContributionModal = useByMeCoffeModal((state) => state.toggleModal);
  const creditLeft = useStore((state) => state.creditLeft);
  // const [showContributionModal, setShowContributionModal] = useState(false);
  const [isPublish, seIsPublish] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);

  const [windowWidth, setWindowWidth] = useState(0)

  // const { userTimeSave, loading: userDataLoading, error: userDataError } = useUserTimeSave();
  // const {}
  var getToken;
  if (typeof window !== "undefined") {
    getToken = localStorage.getItem("token");
  }
  const {
    data: meeData,
    loading: meeLoading,
    error: meeError,
  } = useQuery(meeAPI, {
    context: {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getToken,
      },
    },
    onError: ({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        for (let err of graphQLErrors) {
          switch (err.extensions.code) {
            case "UNAUTHENTICATED":
              localStorage.clear();
              window.location.href = "/";
          }
        }
      }
      if (networkError) {
        console.log(`[Network error]: ${networkError}`);

        if (
          `${networkError}` ===
          "ServerError: Response not successful: Received status code 401" &&
          isAuthenticated
        ) {
          localStorage.clear();

          toast.error("Session Expired! Please Login Again..", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    },
  });
  var bid;
  if (typeof window !== "undefined") {
    bid = localStorage.getItem("bid");
  }
  var loginProcess;
  if (typeof window !== "undefined") {
    loginProcess = localStorage.getItem("loginProcess");
  }

  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [disclaimerCheck, setDisclaimerCheck] = useState(false);

  const handleGenerateBlog = () => {
    localStorage.setItem("isDisclaimerShown", "true");
    localStorage.setItem("disclaimerResponse", disclaimerCheck ? "yes" : "no");
    setShowDisclaimerModal(false);
  };

  const handleDisclaimerPopup = () => setDisclaimerCheck((prev) => !prev);

  const {handleManualRefresh:refreshDataForUserTime} = useUserTimeSave();

  const closeWorkspaceSheetForMobile = (e) => {
    const workspaceDiv = document.querySelector(".dashboardInsightMobile");
    const workspaceOpenButton = document.querySelector(".workspace-open-button")

    if(!!workspaceDiv && !workspaceDiv.contains(e.target) && !workspaceOpenButton.contains(e.target)  && workspaceDiv.classList.contains("open")){
      workspaceDiv.classList.remove("open");
    }
  }

  const setWidthForDashboardInsight = () => {
    console.log(window.innerWidth, 'halert')
    setWindowWidth(window.innerWidth)
  }

  useEffect(() => {
    
    if (type != undefined && type && type === TYPES_OF_GENERATE.REPURPOSE) {
      
    } else {
      if (!topic && !bid && !loginProcess) {
        alert("Blog was not saved.\nPlease generate the blog again");
        window.location.href = "/";
      }
    }

    setWindowWidth(window,innerWidth);

    window.addEventListener("click", closeWorkspaceSheetForMobile)

    return () => {
      window.removeEventListener("resize", setWidthForDashboardInsight)
      window.removeEventListener("click", closeWorkspaceSheetForMobile)
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
    if (meeData) {
      localStorage.setItem(
        "userId",
        JSON.stringify(meeData.me._id).replace(/['"]+/g, "")
      );
      localStorage.setItem("meDataMeCredits", meeData?.me?.credits);
      localStorage.setItem("meDataMePublishCount", meeData?.me.publishCount);
      localStorage.setItem("meDataisSubscribed", meeData?.me?.isSubscribed);
      // meeData?.me?.email
      localStorage.setItem('meDataMeEmail', meeData?.me?.email)
    }
  }, [meeData]);
  useEffect(() => {
    if (loading == false) {
      console.log('MEE DATA');
      console.log(meeData);
      const credits = meeData?.me?.credits;
      const isSubs = meeData?.me?.isSubscribed;
      console.log('CREDITS : ' + credits);
      var userCredits = meeData?.me?.totalCredits - creditLeft - 1;
      console.log('USER CREDITS: ' + userCredits);
      userCredits = userCredits + 2;
      const SHOW_CONTRIBUTION_MODAL = (localStorage.getItem('payment') === undefined || localStorage.getItem('payment') === null) && (localStorage.getItem('ispaid') === null || localStorage.getItem('ispaid') === undefined || localStorage.getItem('ispaid') === 'false') && (userCredits === 20 || userCredits === 10) && !isSubs;
      console.log('SHOW_CONTRIBUTION_MODAL: ', SHOW_CONTRIBUTION_MODAL);
      if (SHOW_CONTRIBUTION_MODAL) {
        setShowContributionModal(true);
      }

    }
  }, [loading, meeData]);
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
          "query FetchBlog($fetchBlogId: String!) {\n  fetchBlog(id: $fetchBlogId) {\n    _id\n    article_id\n    references {\n        url\n        source    \n    }\n    freshIdeasReferences {\n        url\n        source    \n    }\n    tags\n    ideas {\n      blog_id\n      ideas {\n        used\n        idea\n        article_id\n        name\n        reference {\n            type\n            link\n            id\n        }\n      }\n      freshIdeas {\n        used\n        idea\n        article_id\n        name\n        reference {\n            type\n            link\n            id\n        }\n      }\n    }\n    publish_data {\n      tiny_mce_data {\n        children\n        tag\n      }\n      threads \n published_date\n      published\n      platform\n      creation_date\n    }\n  }\n  trendingTopics\n  increment\n}",
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
        .then((data) => { })
        .finally(() => {
          const for_TW = localStorage.getItem("for_TW");
          if (!router.asPath.includes('denied') && !router.asPath.includes('error')) {
            if (for_TW) {
              toast.success("Twitter Integration Done!!");
              setOption("twitter-comeback");
            } else {
              toast.success("Linkedin Integration Done!!");
              setOption("linkedin-comeback");
            }
          } else {
            // check if denied is there and the for_TW is there then show the toast 'twitter integration failed'
            if (for_TW) {
              toast.error("Twitter Integration Failed!!");
            }
            else {
              toast.error("Linkedin Integration Failed!!");
            }
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    } else {
      // get type from router
      const TYPE = router.query.type;
      var options = {
        user_id: getToken ? getUserId : getTempId,
        keyword: topic ? topic : keyword,
      }
      if (TYPE && TYPE === TYPES_OF_GENERATE.REPURPOSE) {
        // const optionsForRepurpose = router.query.options;
        var optionsObj = JSON.parse(localStorage.getItem('optionsForRepurpose'));
        optionsObj = {
          ...optionsObj,
          user_id: getToken ? getUserId : getTempId,
        }
        options = optionsObj;
      }
      GenerateBlog({
        variables: {
          options: {
            ...options
          },
        },
        onCompleted: (data) => {
          localStorage.removeItem("optionsForRepurpose");
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
          if (typeof window !== "undefined") {
            const isDisclaimerShown = localStorage.getItem("isDisclaimerShown");
            const disclaimerResponse = localStorage.getItem("disclaimerResponse");

            if (isDisclaimerShown === "true") {
              if (disclaimerResponse === "yes") {
                setShowDisclaimerModal(false);
              } else {
                setShowDisclaimerModal(true);
              }
            } else {
              setShowDisclaimerModal(true);
            }
          }
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
  // useEffect(() => {
  //   console.log('MEE DATA');
  //   console.log(meeData);
  //   console.log('HERE FOR SHOW CONTRIBUTION MODAL');
  //   const credits = meeData?.me?.credits;
  //   var tempCredits = credits > 0;
  //   const SHOW_CONTRIBUTION_MODAL = (localStorage.getItem('payment') === undefined || localStorage.getItem('payment') === null) && (localStorage.getItem('ispaid') === null || localStorage.getItem('ispaid') === undefined || localStorage.getItem('ispaid') === 'false') && (credits === 15 || credits === 10 || tempCredits || meeData?.me?.publishCount === 1);
  //   console.log('SHOW_CONTRIBUTION_MODAL: ', SHOW_CONTRIBUTION_MODAL);
  //   setShowContributionModal(true);
  // }, [runContributionModal, setRunContributionModal]);
  useEffect(() => {
    console.log("===restime===");
    console.log(pyResTime, ndResTime);
    console.log("===restime===");
  }, [pyResTime, ndResTime]);

  const [saveAuthModal, setSaveAuthModal] = useState(false)

  console.log(freshIdeasReferences);
  return (
    <>
      <Layout>
        {creditModal && (
          <TrialEndedModal setTrailModal={setCreditModal} topic={topic} />
        )}
        <Modal
          isOpen={showDisclaimerModal}
          onRequestClose={() => setShowDisclaimerModal(false)}
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
              // width: "100%",
              bottom: "",
              zIndex: "999",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)",
              padding: "30px",
              paddingBottom: "0px",
            },
          }}
        >
          <button className="absolute right-[35px]" onClick={() => {
            setShowDisclaimerModal(false);
            localStorage.setItem("isDisclaimerShown", "true");
            localStorage.setItem("disclaimerResponse", "no");
          }}>
            <CloseButtonIcon />
          </button>
          <div className="">
            <h2 className="text-2xl mb-4">Improvement Tip 💡</h2>
            <p className="text-gray-700 mb-4">
              {`To further improve the AI-generated Lille Article, to update it as per your likings you 
can edit the content, remove some of the used ideas that you don't want and/or generate and add fresh ideas, 
or use a combination of used and freah ideas to update the article content.
You can add your own image, click on the image and use image options icon.`}
            </p>
            <div className='flex flex-col lg:flex-row justify-between'>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={disclaimerCheck}
                  onChange={handleDisclaimerPopup}
                />
                <span className="text-gray-700">
                  {"Don't show me this popup again"}
                </span>
              </label>
              <div className="my-4 self-end lg:self-auto">
                <button className="cta-invert" onClick={handleGenerateBlog}>
                  Ok Got it
                </button>
              </div>
            </div>
          </div>
        </Modal>

        <div className={`flex  flex-col md:flex-row  lg:mb-6 lg:h-[88vh] ${windowWidth <= 768 ? 'dashboardInsightMobileContainer' : ''}`}>
          {API_BASE_PATH === "https://maverick.lille.ai" && (
            <div
              style={{
                zIndex: "10",
                position: "absolute",
                display: "none",
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
          <MoveToRegenPanel />

          {isAuthenticated && loading != true && data && <TotalTImeSaved refreshDataForUserTime={refreshDataForUserTime} timeSaved={data?.generate?.respTime !=null ?data?.generate?.respTime * DEFAULT_TIME_MULTIPLE : DEFAULT_TIME_MULTIPLE} blogId={blog_id} />
          }
          <div className="relative tiny_mce_width">
            <TinyMCEEditor
              topic={topic}
              isAuthenticated={isAuthenticated}
              loading={loading}
              editorText={editorText}
              blogData={blogData}
              blog_id={blog_id}
              option={option}
              setOption={setOption}
              saveAuthModal={saveAuthModal}
              setSaveAuthModal={setSaveAuthModal}
            />
          </div>
          <div
            className={`relative dashboardInsightWidth ${windowWidth <= 768 ? 'dashboardInsightMobile' : 'desktop'}`}
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
              setOption={setOption}
              option={option}
              keyword={""}
              refetchBlog={()=>{}}

              saveAuthModal={saveAuthModal}
              setSaveAuthModal={setSaveAuthModal}
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
        <div className="mx-auto h-[150px] w-[100px]">
          <img
            className="h-[150px]"
            src="/time-period-icon.svg"
            alt="Timeout image"
          ></img>
        </div>

        <p className="text-gray-500 text-base font-medium mt-4 mx-auto pl-5">
          We regret that it is taking more time to generate the blog right now,
          Please try again after some time...
        </p>
        <div className="m-9 mx-auto">
          <button
            className="w-[240px] ml-16 bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 border border-indigo-700 rounded"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Go Back
          </button>
          {/* <button className="w-[240px] ml-9 bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded text-sm"></button> */}
        </div>
      </Modal>
    </>
  );

}
