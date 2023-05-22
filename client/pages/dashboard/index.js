/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { useMutation, useQuery } from "@apollo/client";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import DashboardInsights from "../../components/DashboardInsights";
import Layout from "../../components/Layout";
import TinyMCEEditor from "../../components/TinyMCEEditor";
import TrialEndedModal from "../../components/TrialEndedModal";
import { API_BASE_PATH, API_ROUTES } from "../../constants/apiEndpoints";
import { generateBlog } from "../../graphql/mutations/generateBlog";
import { meeAPI } from "../../graphql/querys/mee";
import { getCurrentDomain, getCurrentHref, jsonToHtml } from "../../helpers/helper";
import useStore, { useByMeCoffeModal } from "../../store/store"; // Add this import
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

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
  const [runContributionModal, setRunContributionModal] = useState(0);
  const [contributinoModalLoader, setContributionModalLoader] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const BASE_PRICE = 500;
  const keyword = useStore((state) => state.keyword);
  const updateCredit = useStore((state) => state.updateCredit);
  const showContributionModal = useByMeCoffeModal((state) => state.isOpen);
  const setShowContributionModal = useByMeCoffeModal((state) => state.toggleModal);
  // const [showContributionModal, setShowContributionModal] = useState(false);


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
          isauth
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
    if (meeData) {
      localStorage.setItem("meDataMeCredits", meeData?.me?.credits);
      localStorage.setItem("meDataMePublishCount", meeData?.me.publishCount);
    }
  }, [meeData]);
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
        .then((data) => { })
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
          // setRunContributionModal((prev) => prev++);
          console.log('MEE DATA');
          console.log(meeData);
          console.log('HERE FOR SHOW CONTRIBUTION MODAL');
          const credits = Number(localStorage.getItem('meDataMeCredits')) || 1;
          console.log('CREDITS : ' + credits);
          const SHOW_CONTRIBUTION_MODAL = (localStorage.getItem('payment') === undefined || localStorage.getItem('payment') === null) && (localStorage.getItem('ispaid') === null || localStorage.getItem('ispaid') === undefined || localStorage.getItem('ispaid') === 'false') && (credits === 15 || credits === 10 || Number(localStorage.getItem('meDataMePublishCount')) === 1);
          console.log('SHOW_CONTRIBUTION_MODAL: ', SHOW_CONTRIBUTION_MODAL);
          if (SHOW_CONTRIBUTION_MODAL) {
            setShowContributionModal(true);
          }
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

  async function handleCheckout() {
    console.log('LOCAL STOAGE: ')
    console.log(localStorage);
    setContributionModalLoader(true);
    const stripe = await stripePromise;
    const res = await fetch('https://maverick.lille.ai/stripe/api/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          customer_email: meeData?.me?.email,
          "line_items": [
            {
              "price_data": {
                "currency": 'usd',
                "product_data": {
                  "name": "Contribution"
                },
                "unit_amount": BASE_PRICE * multiplier
              },
              "quantity": 1
            }
          ],
          "mode": "payment",
          "success_url": getCurrentHref() + '/' + blog_id,
          "cancel_url": getCurrentDomain() + "/cancel"
        }
      ), // Multiply by the multiplier (e.g., 500 * 1 = $5, 500 * 2 = $10, etc.)
    });
    const session = await res.json();
    console.log(session);
    var userContribution = {
      amount: BASE_PRICE * multiplier,
      checkoutSessionId: session.id,
    }
    localStorage.setItem('userContribution', JSON.stringify(userContribution));
    console.log('LOCAL STOAGE: ')
    console.log(localStorage);
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    })
  }
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
        isOpen={showContributionModal}
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
            maxWidth: "400px",
            bottom: "",
            zIndex: "999",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            padding: "30px",
            paddingBottom: "30px",
          },

        }}
        // outside click close
        shouldCloseOnOverlayClick={true}
        onRequestClose={() => setShowContributionModal(false)}

      >
        <div className="flex flex-col items-center justify-center">
          {/* <h3>Buy me a coffee</h3> */}
          <h3 className="text-2xl font-bold text-left ">Buy me a coffee</h3>

        </div>
        <div className="flex flex-col items-center justify-center mt-4">
          <p className="text-sm text-gray-500 text-center">
            If you like our product, please consider buying us a
            cup of coffee.😊
          </p>
        </div>
        <div
          className={`flex justify-around items-center  w-full bg-indigo-100 p-[10px] border-indigo-500 rounded-md mt-[20px]`}
        >
          <div className="flex items-center justify-center text-[40px] ">
            ☕
          </div>
          <div>
            <svg width="30" height="30" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
          </div>
          {/* circle and numebr */}

          <div className="flex items-center justify-center ">

            {

              [1, 2, 5].map((item) => (
                <div key={item} className={`flex items-center justify-center w-[40px] h-[40px] rounded-full bg-indigo-500 text-white text-sm font-bold 
                ml-[10px] hover:bg-indigo-700 cursor-pointer ${multiplier === item && 'bg-indigo-700 '}  
                `}
                  onClick={() => setMultiplier(item)}
                >

                  {item}
                </div>

              ))


            }
          </div>
        </div>
        {/* button */}
        <button className="bg-indigo-500 text-white w-full py-2 mt-[20px] rounded-md hover:bg-indigo-700 active:border-2 active:border-indigo-700 active:shadow-md" onClick={handleCheckout}>
          <style>
            {`
            .loader {
            border: 3px solid #ffffff; /* Light grey */ 
            border-top: 3px solid rgb(99,  102,  241); /* Blue border on top */
            border-radius: 50%; /* Rounded shape */
            width: 30px; /* Width of the loader */
            height: 30px; /* Height of the loader */
            animation: spin 2s linear infinite; /* Animation to rotate the loader */
        }

            @keyframes spin {
              0 % { transform: rotate(0deg); } /* Starting position of the rotation */
              100% {transform: rotate(360deg); } /* Ending position of the rotation */
            }
          `}
          </style>
          {

            contributinoModalLoader ? (
              <div className="flex items-center justify-center">
                <div className="loader"></div> {/* Add the loader class here */}
              </div>
            ) : (
              <>Contribute us with {multiplier} cups for  <strong>{`$${BASE_PRICE / 100 * multiplier}`}</strong></>
            )
          }
        </button>

      </Modal>
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
