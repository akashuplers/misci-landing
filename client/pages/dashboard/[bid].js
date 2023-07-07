import OTPModal from "@/modals/OTPModal";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";
import { ToastContainer, toast } from "react-toastify";
import DashboardInsights from "../../components/DashboardInsights";
import Layout from "../../components/Layout";
import TinyMCEEditor from "../../components/TinyMCEEditor";
import MoveToRegenPanel from "../../components/localicons/MoveToRegenPanel";
import { API_BASE_PATH } from "../../constants/apiEndpoints";
import { getBlogbyId } from "../../graphql/queries/getBlogbyId";
import { meeAPI } from "../../graphql/querys/mee";
import { getDateMonthYear, isMonthAfterJune, jsonToHtml } from "../../helpers/helper";
import PreferencesModal from "../../modals/PreferencesModal";
import { useBlogDataStore, useTabOptionStore, useThreadsUIStore } from "../../store/store";

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", function (event) {
    event.stopImmediatePropagation();
  });
}

export default function Post() {
  const [pfmodal, setPFModal] = useState(false);
  const router = useRouter();
  const { bid, isPublished } = router.query;
  const [reference, setReference] = useState([]);
  const [freshIdeasReferences, setFreshIdeasReferences] = useState([]);
  const { option, setOption } = useTabOptionStore();
  const { data, loading, error,
    refetch: refetchBlog
  } = useQuery(getBlogbyId, {
    variables: {
      fetchBlogId: bid,
    },
  });
  const [ideas, setIdeas] = useState([]);
  const [freshIdeas, setFreshIdeas] = useState([]);

  const [freshIdeaTags, setFreshIdeaTags] = useState([]);

  const [editorText, setEditorText] = useState([]);
  const [tags, setTags] = useState([]);
  // const [blogData, setBlogData] = useState([]);
  const { blogData, setBlogData } = useBlogDataStore();

  const [pyResTime, setPyResTime] = useState(null);
  const [ndResTime, setNdResTime] = useState(null);
  const [isPayment, setIsPayment] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const { setShowTwitterThreadUI } = useThreadsUIStore();

  useEffect(() => {

    setWindowWidth(window.innerWidth);

  }, []);



  useEffect(() => {
    if (data == null) return;
    setBlogData(data.fetchBlog);
    setIdeas(data.fetchBlog.ideas.ideas);
    setTags(data.fetchBlog.tags);
    setFreshIdeaTags(data.fetchBlog.freshIdeasTags);
    setFreshIdeasReferences(data.fetchBlog.freshIdeasReferences);
    setReference(data.fetchBlog.references);
    setFreshIdeas(data.fetchBlog.ideas.freshIdeas);
    // setIsPublished(data?.fetchBlog?.publish_data[2]?.published);

    // const aa = data.generate.publish_data[2].tiny_mce_data;
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
  }, [data]);

  var getToken;
  if (typeof window !== "undefined") {
    getToken = localStorage.getItem("token");
  }

  const { data: meeData } = useQuery(meeAPI, {
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
          "ServerError: Response not successful: Received status code 401"
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
            window.location.href = "/";
          }, 3000);
        }
      }
    },
  });
  useEffect(() => {
    const query = router.query;
    const { payment } = router.query;
    if (payment === 'true') {
      if (localStorage.getItem('userContribution') !== null) {
        var userContribution = JSON.parse(localStorage.getItem('userContribution') || '{}');
        const SAVE_USER_SUPPORT_URL = 'https://maverick.lille.ai/auth/save-user-support';

        const requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          },
          body: JSON.stringify(userContribution)
        };
        console.log('REQUEST OPTIONS');
        fetch(SAVE_USER_SUPPORT_URL, requestOptions).then((response) => {
        }).catch((error) => {
          console.log('ERROR FROM SAVE USER SUPPORT');
          console.log(error);
        }
        );
      }
      setIsPayment(true);
      toast.success("Payment Successful!", {
        toastId: "payment-success",
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      localStorage.setItem("payment", "true");
    } else {
      console.log('ROUTER CHECK IF PAYMENT==TRUE ELSE');
      localStorage.removeItem("userContribution");
    }


  }, [router]);

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
    if (meeData?.me.prefFilled === false) {
      setPFModal(true);
    }
    if (meeData?.me) {
      if (typeof window !== "undefined") {
        const isOTPVerified = meeData?.me?.emailVerified;
        if (
          isOTPVerified == "false" ||
          !isOTPVerified ||
          isOTPVerified == null
        ) {
          setPFModal(false);
        } else {
          if (meeData?.me.prefFilled === false) {
            setPFModal(true);
          }
        }

        if (
          isOTPVerified === "false" ||
          !isOTPVerified ||
          isOTPVerified === null ||
          isOTPVerified === undefined
        ) {
          const { day, month } = getDateMonthYear(meeData?.me.date);
          if (!isMonthAfterJune(month)) {
            if (month == "June") {
              if (day <= 18) {
                setShowOTPModal(false);
              } else {
                setShowOTPModal(true);
              }
            } else {
              setShowOTPModal(false);
            }
            
          } else {
            setShowOTPModal(true);
          }

        } else {
          setShowOTPModal(false);
        }
      }
    }
  }, [meeData]);

  useEffect(() => {
    function sendOpt() {
      const SEND_OTP_URL = API_BASE_PATH + "/auth/send-otp";
      var getToken = localStorage.getItem("token");
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken,
        },
      };

      fetch(SEND_OTP_URL, requestOptions)
        .then((response) => {
          console.log("RESPONSE FROM SEND OTP");
          console.log(response);
          console.log(response.json());
        })
        .catch((error) => {
          console.log("ERROR FROM SEND OTP");
        });
    }
    if (showOTPModal === true) {
      sendOpt();
    }
  }, [showOTPModal]);
  return (
    <>
      {/* <Head><title>{blogData}</title><meta about="body">{blogData}</meta></Head> */}
      <Layout>
        {meeData?.me && showOTPModal === true ? (
          <OTPModal
            showOTPModal={showOTPModal}
            setShowOTPModal={setShowOTPModal}
            setPFModal={setPFModal}
          />
        ) : (
          <></>
        )}
        <ToastContainer />
        {
          isPayment && <ReactConfetti
            width={windowWidth}
            recycle={false}
            numberOfPieces={2000}
          />
        }
        <div className="flex  flex-col md:flex-row  lg:mb-6 lg:h-[88vh]">
          {pfmodal && (
            <PreferencesModal
              pfmodal={pfmodal}
              setPFModal={setPFModal}
              getToken={getToken}
            />
          )}
          {API_BASE_PATH === "https://maverick.lille.ai" && (
            <div
              style={{
                zIndex: "10",
                display: "none",
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

          <MoveToRegenPanel />

          <div className="relative tiny_mce_width " >
            <TinyMCEEditor
              isAuthenticated={true}
              editorText={editorText}
              blogData={blogData}
              blog_id={bid}
              isPublished={isPublished}
              loading={loading}
              option={option}
              setOption={setOption}
              refetchBlog={refetchBlog}
            />
          </div>
          <div
            className="relative dashboardInsightWidth"
          >
            <DashboardInsights
              ideas={ideas}
              setIdeas={setIdeas}
              tags={tags}
              setTags={setTags}
              freshIdeaTags={freshIdeaTags}
              freshIdeas={freshIdeas}
              freshIdeasReferences={freshIdeasReferences}
              setFreshIdeaReferences={setFreshIdeasReferences}
              reference={reference}
              setReference={setReference}
              blog_id={bid}
              loading={loading}
              setEditorText={setEditorText}
              setBlogData={setBlogData}
              // tags={data?.fetchBlog?.tags}
              setPyResTime={setPyResTime}
              setNdResTime={setNdResTime}
              setOption={setOption}
              option={option}
            />
          </div>
        </div>
      </Layout >
    </>
  );
}
