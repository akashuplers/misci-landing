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
import { API_BASE_PATH, API_ROUTES } from "../../constants/apiEndpoints";
import { getBlogbyId } from "../../graphql/queries/getBlogbyId";
import { meeAPI } from "../../graphql/querys/mee";
import { getDateMonthYear, isMonthAfterJune, jsonToHtml } from "../../helpers/helper";
import PreferencesModal from "../../modals/PreferencesModal";
import useStore, { useBlogDataStore, useTabOptionStore, useThreadsUIStore,  } from "../../store/store";
import { useGenerateErrorState, useGenerateState } from '../../store/appState'
import {useSendSavedTimeOfUser} from '../../hooks/useSendSavedTimeOfUser';
import Modal from "react-modal";
import { CloseButtonIcon } from "../../components/localicons/localicons";
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", function (event) {
    event.stopImmediatePropagation();
  });
}

export default function Post({typeIsRepurpose}) {
  const [pfmodal, setPFModal] = useState(false);
  const router = useRouter();
  console.log(router);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  console.log('ROUTER QUERY', router);
  const { bid, isPublished } = router.query;
  const [reference, setReference] = useState([]);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [alreadyShownDisclaimer, setAlreadyShownDisclaimer] = useState(false);
  const [disclaimerCheck, setDisclaimerCheck] = useState(false);
  const [freshIdeasReferences, setFreshIdeasReferences] = useState([]);
  const { option, setOption } = useTabOptionStore();
  const { userTimeSave ,makeNullThoseTime} = useGenerateState();
  const {messages:ErrorMessages, clearAllMessages:ClearErrorMessages} =useGenerateErrorState();
 const {response, error: errorLoadingForTime, loading:LoadingForTimeSave, sendSavedTime}= useSendSavedTimeOfUser();
  const { data, loading, error,
    refetch: refetchBlog
  } = useQuery(getBlogbyId, {
    variables: {
      fetchBlogId: bid,
    },
    onCompleted: (data) => {
      if (isAuthenticated && (userTimeSave !== null && userTimeSave !== undefined && userTimeSave !== 0)) {
        console.log('completed'); 
        const userSaveTimeDataWithBlogId = {};
        userSaveTimeDataWithBlogId[bid] = {
          time: userTimeSave,
          blogId: bid,
          save: false,
        }
        const timeSaves = `${userTimeSave}:00`;
        sendSavedTime(bid, timeSaves, 'agree', false);
        const localSaveVersionForThis = localStorage.getItem('userSaveTimeDataWithBlogId');
        var localSaveVersionForThisObj = {};
        if (localSaveVersionForThis !== null) {
          localSaveVersionForThisObj = JSON.parse(localSaveVersionForThis);
        }
        const finalObj = { ...localSaveVersionForThisObj, ...userSaveTimeDataWithBlogId };
        localStorage.setItem('userSaveTimeDataWithBlogId', JSON.stringify(finalObj));
        makeNullThoseTime();
        
      }
      console.log(typeIsRepurpose, 'typeIsRepurpose');
      if(typeIsRepurpose===true && alreadyShownDisclaimer==false){
        const isDisclaimerShown = localStorage.getItem("isDisclaimerShown");
        const disclaimerResponse = localStorage.getItem("disclaimerResponse");
        if (isDisclaimerShown === "true") {
          if (disclaimerResponse === "yes") {
            setShowDisclaimerModal(false);
          } else {
            setShowDisclaimerModal(true);
            setAlreadyShownDisclaimer(true);
          }
        } else {
          setShowDisclaimerModal(true);
        }
      }
      if(ErrorMessages && ErrorMessages.length>0) {
        ErrorMessages.forEach(er => {
          toast.error(er);
        })
        ClearErrorMessages(); 
      }
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
  const [timeSaveForThisBlog, setTimeSaveForThisBlog] = useState(30);
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

  const handleDisclaimerClick = () => {
    localStorage.setItem("isDisclaimerShown", "true");
    localStorage.setItem("disclaimerResponse", disclaimerCheck ? "yes" : "no");
    setShowDisclaimerModal(false);
  };
  const handleDisclaimerPopup = () => setDisclaimerCheck((prev) => !prev);

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
        // for (let err of graphQLErrors) {
        //   switch (err.extensions.code) {
        //     case "UNAUTHENTICATED":
        //       localStorage.clear();
        //       window.location.href = "/";
        //   }
        // }
      }
      if (networkError) {
        console.log(`[Network error]: ${networkError}`);
        if (
          `${networkError}` ===
          "ServerError: Response not successful: Received status code 401"
        ) {
          // localStorage.clear();
          // toast.error("Session Expired! Please Login Again..", {
          //   position: "top-center",
          //   autoClose: 5000,
          //   hideProgressBar: false,
          //   closeOnClick: true,
          //   pauseOnHover: true,
          //   draggable: true,
          //   progress: undefined,
          //   theme: "light",
          // });
          // setTimeout(() => {
          //   window.location.href = "/";
          // }, 3000);
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
        const SAVE_USER_SUPPORT_URL = API_BASE_PATH + API_ROUTES.AUTH_USER_SUPPORT;
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


  }, []);

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
        <Modal
          isOpen={false}
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
                <button className="cta-invert" onClick={handleDisclaimerClick}>
                  Ok Got it
                </button>
              </div>
            </div>
          </div>
        </Modal>
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
              isAuthenticated={isAuthenticated}
              editorText={editorText}
              typeIsRepurpose={typeIsRepurpose}
              blogData={blogData}
              blog_id={bid}
              timeSaveForThisBlog={12}
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


export const getServerSideProps = async (context) => {
  console.log(context);
  console.log("server");
  const { type } = context.query;
  console.log(type);
  const randomLiveUsersCount = 40;
  return {
    props: {
      typeIsRepurpose : type === 'repurpose' ? true : false,
    },
  };
};
