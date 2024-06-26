/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-html-link-for-pages */
// @ts-nocheck
import { API_BASE_PATH } from "@/constants/apiEndpoints";
import { gql, useQuery, useSubscription } from "@apollo/client";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { ToastContainer, toast } from "react-toastify";
import Layout from "../../components/Layout";
import TrialEndedModal from "../../components/TrialEndedModal";
import { meeAPI } from "../../graphql/querys/mee";
import { STEP_COMPLETES_SUBSCRIPTION } from "../../graphql/subscription/generate";
import Modal from "react-modal";

import OTPModal from "../../modals/OTPModal";
import PreferencesModal from "../../modals/PreferencesModal";
import useStore, {
  useFunctionStore,
} from "../../store/store";
import { Tab } from "@headlessui/react";
import {
  XCircleIcon,
} from "@heroicons/react/24/outline";
import DragAndDropFiles, {
} from "@/components/ui/DragAndDropFiles";
import {
  useBlogLinkStore,
  useFileUploadStore,
  useGenerateErrorState,
  useGenerateState,
  useRepurposeFileStore,
  useSideBarChangeFunctions,
  useTotalSavedTimeStore,
} from "@/store/appState";
// import { FacebookIcon, LinkedinIcon, TwitterIcon } from "react-share";
import { TextTransitionEffect } from "@/components/ui/TextTransitionEffect";
import {
  FileChipIcon,
  FileUploadCard,
  FloatingBalls,
} from "@/components/ui/Chip";
import { InputData } from "@/types/type";
import {
  newGenerateApi,
  randomNumberBetween20And50,
} from "@/store/appHelpers";
import { TYPES_OF_GENERATE } from "@/store/appContants";
import GoogleDriveModal from "@/modals/GoogleDriveModal";
import { StepCompleteData } from "@/store/types";
import GenerateErrorModal from "@/modals/GenerateErrorModal";
import MisciUploadLoader from "@/modals/MisciUploadLoader";

const PAYMENT_PATH = "/?payment=true";
const TONES = [
  "Authoritative",
  "Political",
  "Non political",
  "Ethnic",
  "Rational",
  "Modern thinking",
  "Non Robotic",
];

var newTones = [];
TONES.forEach((tone) => {
  newTones.push({ text: tone, selected: false });
});
const TEXTS = [
  "Twitter  Post",
  "Linkedin Post",
  "Tweet  thread",
  "Blog Posts",
  "Tweets ",
  "Newsletters",
];

const TEXTS2 = ["Researches", "Students", "Educators", "Analysts"];
const tabsPlaceholders = [
  "Give me a topic",
  "Give me a topic and paste your URL below",
  "Give me a topic and upload file",
];
const STATESOFKEYWORDS = {
  LOADING: "loading",
  LOADED: "loaded",
};
export const getServerSideProps = async (context) => {
  console.log(context);
  console.log("server");
  const { payment } = context.query;
  const randomLiveUsersCount = randomNumberBetween20And50();
  return {
    props: {
      payment: payment || false,
      randomLiveUsersCount,
    },
  };
};

interface KeysForStateOfGenerate {
  file: number | null;
  url: number | null;
  keyword: number | null;
}

export default function UploadDocument() {
  const [userAbleUserIDForSubs, setUserAbleUserIDForSubs] = useState("");
  const { addMessages } = useGenerateErrorState();
  const [getToken, setGetToken] = useState("");
  const {
    data: subsData,
    loading: subsLoading,
    error: subsError,
  } = useSubscription<StepCompleteData>(STEP_COMPLETES_SUBSCRIPTION, {
    variables: { userId: userAbleUserIDForSubs },
    onComplete(data) {
      console.log(data);
    },
  });

  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const updateAuthentication = useStore((state) => state.updateAuthentication);
  // check if url container ?payment=true
  const [isPayment, setIsPayment] = useState(false);
  const blogLinks = useBlogLinkStore((state) => state.blogLinks);
  const [keywordsOFBlogs, setkeywordsOfBlogs] = useState([]);
  const setBlogLinks = useBlogLinkStore((state) => state.setBlogLinks);
  const { removeBlogLink } = useBlogLinkStore();
  const [repurposeTones, setRepurposeTones] = useState(newTones);
  const addToFunctionStack = useFunctionStore((state) => state.addToStack);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [stateOfGenerate, setStateOfGenerate] = useState({
    url: null,
    file: null,
    keyword: null,
  });
  const { updateTime } = useGenerateState();
  const selectedFiles = useRepurposeFileStore((state) => state.selectedFiles);
  const removeSelectedFile = useRepurposeFileStore(
    (state) => state.removeSelectedFile
  );
  const setSelectedFiles = useRepurposeFileStore(
    (state) => state.setSelectedFiles
  );
  const executeLastFunction = useFunctionStore(
    (state) => state.executeLastFunction
  );

  const [showGDriveModal, setShowGDriveModal] = useState(false);
  const { addFunction } = useSideBarChangeFunctions();
  const [showingGenerateLoading, setShowingGenerateLoading] = useState(false);
  const handleGenerateReset = () => {
    setkeywordsOfBlogs([]);
    setBlogLinks([]);
    setSelectedFiles([]);
    setkeyword("");
    setStateOfGenerate((prev) => {
      return {
        url: null,
        file: null,
        keyword: null,
      };
    });
    setShowingGenerateLoading(false);
  };
  useEffect(() => {
    addFunction(handleGenerateReset);
  }, [blogLinks]);
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        executeLastFunction();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [executeLastFunction]);
  const {
    data: usersTotalTimeSavedData,
    fetchTotalSavedTime,
    error,
    isLoading,
  } = useTotalSavedTimeStore();
  // INITAIL DATA FETCH USEEFFECT:
  useEffect(() => {
    fetchTotalSavedTime();
  }, []);

  function removeSelectedFileFromBothStores(id) {
    removeSelectedFile(id);
    removeBlogLink(id);
  }

  useEffect(() => {
    updateAuthentication();
  }, []);
  const keywords = gql`
    query keywords {
      trendingTopics
    }
  `;
  const { data, loading } = useQuery(keywords);
  const [isauth, setIsauth] = useState(false);
  const [loadingForKeywords, setLoadingForKeywords] = useState(false);
  const [showRepourposeError, setShowRepourposeError] = useState(false);
  const handleGenerate = (options = {}) => {
    console.log("options");
    console.log(options);
    localStorage.setItem("optionsForRepurpose", JSON.stringify(options));
    const pathname = "/dashboard";
    const query = { type: TYPES_OF_GENERATE.REPURPOSE };
    router.push({ pathname, query }).then(() => {
      setkeywordsOfBlogs([]);
      setBlogLinks([]);
      setSelectedFiles([]);
      setStateOfGenerate((prev) => {
        return {
          url: null,
          file: null,
          keyword: null,
        };
      });
    });
  };

  useEffect(() => {
    // alert('STATUS: ', loadingForKeywords)
  }, [loadingForKeywords]);

  function processDataForKeywords(data) {
    const keywordsMap = {};
    data.forEach((item) => {
      keywordsMap[item.text] = keywordsMap[item.text]
        ? keywordsMap[item.text] + 1
        : 1;
    });
    data.forEach((item) => {
      if (keywordsMap[item.text] > 1) {
        item.source = item.realSource
          ? item.realSource.toLowerCase().charAt(0).toUpperCase() +
            item.realSource.toLowerCase().slice(1)
          : "";
      }
    });
    return data;
  }

  function validateGenerateButtonStatus() {
    const countByType: KeysForStateOfGenerate = blogLinks.reduce(
      (acc, link) => {
        if (link.type === "file") {
          acc.file++;
        } else if (link.type === "url") {
          acc.url++;
        } else if (link.type === "keyword") {
          acc.keyword++;
        }
        return acc;
      },
      { file: 0, url: 0 }
    );
    if (keyword == "" && selectedFiles?.length == 0 ) {
      setDisableGenerateButton(true);
    } else {
      setDisableGenerateButton(false);
    }
  }

  function checkEmptyValueForUrlOrDocument() {}

  const [isMisciScannerLoading, setIsMisciScannerLoading] = useState(false);
  
  async function handleExtractInfo(e) {
    e.preventDefault();
    if(keyword) {
      setIsMisciScannerLoading(true);
      try {
        const axios = require("axios");
        const FormData = require("form-data");
        let payload = new FormData();
        payload.append(
          "url",
          keyword
        );
  
        let config = {
          method: "post",
          maxBodyLength: Infinity,
          url: "https://maverick.lille.ai/misci-routes/uploads",
          headers: {
            "content-type": "multipart/form-data"
          },
          data: payload,
        };
  
        const response = await axios.request(config); // Wait for api response
        const { data } = response?.data; // Destructure response data
        
        if(data && data.title && data.subtopics && data.entities) {
          localStorage.setItem('apiResponseData', JSON.stringify(data)); // Store data in localStorage
          router.push('/misci/article-generated'); // Pass data in state
          setIsMisciScannerLoading(false);
        } else {
          setIsMisciScannerLoading(false);
          toast.error('Could Not Fetch Info! Please Try Any Other Url !');
        }
      } catch (error) {
        console.log("error: ", error);
      }
    }
    else if(selectedFiles[0]) {
      setIsMisciScannerLoading(true);
      try {
        const axios = require("axios");
        const FormData = require("form-data");
        let payload = new FormData();
        payload.append(
          "file",
          selectedFiles[0].file
        );
  
        let config = {
          method: "post",
          maxBodyLength: Infinity,
          url: "https://maverick.lille.ai/misci-routes/uploads",
          headers: {
            "content-type": "multipart/form-data"
          },
          data: payload,
        };
  
        const response = await axios.request(config); // Wait for api response
        const { data } = response?.data; // Destructure response data
        
        if(data && data.title && data.subtopics && data.entities) {
          localStorage.setItem('apiResponseData', JSON.stringify(data)); // Store data in localStorage
          router.push('/misci/article-generated'); // Pass data in state
          setIsMisciScannerLoading(false);
        } else {
          setIsMisciScannerLoading(false);
          toast.error('Could Not Fetch Info! Please Try Any Other Document !');
        }

      } catch (error) {
        toast.error('Something Went Wrong! Please Try Again!')
        setIsMisciScannerLoading(false);
      }
    }
  }

  const generateBlog = (files, urls) => {
    var token;
    var getUserId;
    var getTempId;
    if (typeof window !== "undefined") {
      token = localStorage.getItem("token");
      getUserId = localStorage.getItem("userId");
      getTempId = localStorage.getItem("tempId");
    }
    const tones =
      repurposeTones.filter((tone) => tone.selected).map((tone) => tone.text) ||
      [];

    const keywordForPayload = keyword;
    const userId = userAbleUserIDForSubs;

    setShowingGenerateLoading(true);
    newGenerateApi(token, tones, keywordForPayload, userId, files, urls).then(
      (response) => {
        if (response.type == "ERROR") {
          toast.error(response.message);
          setShowErrorModal(true);
          setShowingGenerateLoading(false);
          return;
        }
        const { data } = response;
        const _id = data._id;
        const responseTime = data.respTime;
        const pyTime = data.pythonRespTime;
        updateTime(responseTime, pyTime, responseTime);
        console.log(response);
        // addMessages()'
        const unprocessedUrlsFR = data?.unprocessedUrls;
        const unprocessedFiles = data?.unprocessedFiles;

        const errorMessages = [];

        if (unprocessedUrlsFR?.length > 0) {
          const msgForUrl =
            "Host has denied the extraction from these URLs. You can try again or use different URLs: " +
            unprocessedUrlsFR.join(", ");
          errorMessages.push(msgForUrl);
        }

        if (unprocessedFiles?.length > 0) {
          const fileErrors = unprocessedFiles.map(
            (file) => file + " - File unable to process"
          );
          errorMessages.push(...fileErrors);
        }

        console.log(errorMessages);

        if (errorMessages.length > 0) {
          addMessages(errorMessages);
        }

        console.log(response);
        setTimeout(() => {
          router
            .push({
              pathname: `/misci/article-generated/${keyword}`,
              // pathname: `/dashboard/${_id}`,
              // query: { type: TYPES_OF_GENERATE.REPURPOSE },
            })
            .then(() => {
              setShowingGenerateLoading(false);
              handleGenerateReset();
            });
        }, 2000);
      }
    );
  };

  const [keyword, setkeyword] = useState("");
  const [disableGenerateButton, setDisableGenerateButton] = useState(false);
  const router = useRouter();
  const setKeywordInStore = useStore((state) => state.setKeyword);
  const [index, setIndex] = React.useState(0);
  const [showUserLoadingModal, setShowUserLoadingModal] = useState({
    show: false,
  });

  useEffect(() => {
    validateGenerateButtonStatus();
  }, [blogLinks, keyword]);
  const {
    data: meeData,
    loading: meeLoading,
    error: meeError,
    refetch: meeRefetch,
  } = useQuery(meeAPI, {
    context: {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getToken,
      },
    },
    onError: ({ graphQLErrors, networkError }) => {
      console.log(graphQLErrors, networkError);
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

  const [pfmodal, setPFModal] = useState(false);
  const [isOTPVerified, setIsOTPVerified] = useState(true);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { showFileStatus, uploadedFilesData } = useFileUploadStore();
  const [showTabsInfo, setShowTabsInfo] = useState({
    web: false,
    urls: true,
    documents: true,
  });
  const filesNames = blogLinks
    .filter((link) => link.type === "file")
    .map((link) => {
      return {
        id: link.id,
        name: link.value,
        size: link.size,
      };
    });
  // console.log(filesNames);
  const tabs = [
    {
      id: 0,
      label: "Web Source",
      content: (
        <div className="w-full h-full justify-center items-center gap-2.5 inline-flex">
          <div
            className={`relative w-full min-h-[60px] bg-white rounded-[10px] border py-2.5 ${
              keyword.length > 100
                ? "border-red-600"
                : "border-indigo-600"
            } `}
          >
            <div
              className={`flex items-center flex-col md:flex-row gap-2.5 relative outline-none active:outline-none rounded-lg`}
            >
              <KeywordInput
                keyword={keyword}
                setKeyword={setkeyword}
                placeholder={'Paste your URL'}
                // maxLength={100}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    disableGenerateButton
                      ? null
                      : handleExtractInfo(e);
                  }
                }}
              />
            </div>
          </div>
          {/* {keyword.length > 100 && (
            <div className="absolute bottom-0 left-4 text-red-600 text-xs font-medium leading-none">
              {keyword.length}/100
            </div>
          )} */}
        </div>
      ),
    },
    {
      id: 1,
      label: "Document",
      upperContent: (
        <>
          {showTabsInfo.documents && (
            <div className="w-fit h-7 px-2.5 py-1.5 my-2 bg-orange-100 rounded backdrop-blur-2xl justify-center items-center gap-2.5 inline-flex">
              <div className="text-yellow-600 text-xs font-medium leading-none">
                We take a little longer to generate draft for Documents. Please
                be patient.
              </div>
              <XCircleIcon
                className="w-4 h-4 text-gray-600 cursor-pointer"
                onClick={() =>
                  setShowTabsInfo((prev) => ({ ...prev, documents: false }))
                }
              />
            </div>
          )}
        </>
      ),
      content: (
        <>
          <div className="flex items-center mt-2  scrollbar-thumb-indigo-600 scrollbar-corner-inherit rounded-full scroll-m-1 py-2 scrollbar-thin scrollbar-track-gray-100 overflow-x-scroll gap-2">
            {/* <FileChipIcon fileName="index.tsx" fileSize="5mb" /> */}
            {/* {console.log(filesNames)} */}
            {!isAuthenticated && filesNames.length > 1 ? (
              <FileChipIcon
                fileName={filesNames[0].name}
                fileSize=""
                onCrossClick={() => {
                  removeSelectedFileFromBothStores(filesNames[0].id);
                }}
              />
            ) : (
              <>
                {" "}
                {filesNames.map((fileName, index) => {
                  return (
                    <FileChipIcon
                      key={index}
                      fileName={fileName.name}
                      fileSize=""
                      onCrossClick={() => {
                        removeSelectedFileFromBothStores(fileName.id);
                      }}
                    />
                  );
                })}
              </>
            )}
          </div>
          <div>
            {!isAuthenticated && filesNames.length > 1 && (
              <div className="text-sm text-red-500 mt-2 relative text-left">
                You can only upload 1 file as a guest user
              </div>
            )}
          </div>
          <DragAndDropFiles
            blogLinks={blogLinks}
            setBlogLinks={setBlogLinks}
            onClickHereButtonClick={() => setShowGDriveModal(true)}
          />
          {/* <div>{!isAuthenticated && filesNames.length > 1 && <div className="text-sm text-red-500 mt-2 relative -top-[45px] text-left">You can only upload 1 file as a guest user</div>}</div> */}
          {showFileStatus && (
            <div className="flex items-center justify-center  my-2 gap-2 max-w-full min-w-full flex-wrap">
              {uploadedFilesData.map((file, index) => {
                console.log(file);
                return (
                  <FileUploadCard
                    key={index}
                    fileName={file.name}
                    fileSize={file.size}
                    progress={file.percentage}
                  />
                );
              })}
            </div>
          )}
        </>
      ),
    },
  ];

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
        .then((response) => {})
        .catch((error) => {
          console("ERROR FROM SEND OTP");
        });
    }
    if (showOTPModal === true) {
      sendOpt();
    }
  }, [showOTPModal]);
  const [windowWidth, setWindowWidth] = useState(0);
  useEffect(() => {
    setWindowWidth(window.innerWidth);
  }, []);

  const [showRegenModalWarning, setShowRegenModalWarning] = useState(false);
  const [missingValueType, setMissingValueType] = useState("");

  return (
    <>
      <Head>
        <title>Lille</title>
        <meta
          name="description"
          content="Streamline your content creation process with our website that
                generates blog posts from URLs or uploaded files, providing
                concise and informative content in no time."
        />
        <meta
          property="og:title"
          content="Generate Blogs & Posts with Lille."
        />
        <meta
          property="og:description"
          content="Streamline your content creation process with our website that
                generates blog posts from URLs or uploaded files, providing
                concise and informative content in no time."
        />
        <meta property="og:image" content="/lille_logo_new.png" />
      </Head>
      {isPayment && (
        <Confetti width={windowWidth} recycle={false} numberOfPieces={2000} />
      )}
      <Layout>
        <Modal
          isOpen={showRegenModalWarning}
          onRequestClose={() => {
            setShowRegenModalWarning(false);
          }}
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
              borderRadius: "8px",
              width: "90%",
              maxWidth: "380px",
              bottom: "",
              zIndex: "999",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)",
              padding: "30px",
              paddingBottom: "0px",
            },
          }}
        >
          <button
            className="absolute right-[35px]"
            onClick={(e) => {
              e.stopPropagation();
              setShowRegenModalWarning(false);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="mx-auto pb-4">
            <img
              className="mx-auto h-12"
              src="/info.png"
              style={{
                filter:
                  "hue-rotate(120deg)" /* Rotate the hue to turn red into green */,
              }}
            />
          </div>
          <div className="mx-auto font-bold text-2xl w-full text-center mr-auto">
            No {missingValueType} provided
          </div>
          <p className="text-gray-500 text-base font-medium mt-4 mx-auto">
            You have not provided any {missingValueType}(s). Do you want to
            proceed
          </p>
          <div className="flex my-9">
            <button
              className="mr-4 w-[200px] p-4 bg-transparent hover:bg-green-500 text-gray-500 font-semibold hover:text-white py-2 px-4 border border-gray-500 hover:border-transparent rounded"
              onClick={(e) => {
                e.stopPropagation();
                setShowRegenModalWarning(false);
              }}
            >
              No
            </button>
            <button
              className="w-[240px]  bg-transparent hover:bg-green-700 text-green-700 font-semibold hover:text-white py-2 px-4 border border-green-700 hover:border-transparent rounded"
              onClick={() => {
                console.log("critical generating web");
                generateBlog([], []);
              }}
            >
              YES!
            </button>
          </div>
        </Modal>
        <ToastContainer />
        {pfmodal && (
          <PreferencesModal
            pfmodal={pfmodal}
            setPFModal={setPFModal}
            getToken={getToken}
          />
        )}
        {meeData?.me && showOTPModal === true ? (
          <OTPModal
            showOTPModal={showOTPModal}
            setShowOTPModal={setShowOTPModal}
            setPFModal={setPFModal}
          />
        ) : (
          <></>
        )}

        {/* <TotalTImeSaved   /> */}

        {!meeData?.me?.isSubscribed && meeData?.me?.credits === 0 && (
          <TrialEndedModal setTrailModal={() => {}} topic={null} />
        )}
        <GoogleDriveModal
          showModal={showGDriveModal}
          setShowModal={setShowGDriveModal}
          meeData={meeData}
        />
        {showErrorModal && (
          <GenerateErrorModal
            modalOpen={showErrorModal}
            setModalOpen={setShowErrorModal}
          />
        )}
        {isMisciScannerLoading && (
          <MisciUploadLoader
            showGenerateLoadingModal={isMisciScannerLoading}
            setShowGenerateLoadingModal={setIsMisciScannerLoading}
          />
          // <GenerateLoadingModal
          //   resetForm={handleGenerateReset}
          //   showGenerateLoadingModal={showingGenerateLoading}
          //   setShowGenerateLoadingModal={setShowingGenerateLoading}
          //   stepStatus={subsData?.stepCompletes.step}
          //   type={
          //     countByType.lengthOFiles > 0 || countByType.lengthOfUrls > 0
          //       ? countByType.lengthOfUrls > 0
          //         ? "URL"
          //         : "FILE"
          //       : "WEB"
          //   }
          //   showBackButton={
          //     countByType.lengthOFiles > 0 || countByType.lengthOfUrls > 0
          //   }
          // />
        )}
        <div
          className={`maincontainer relative md:px-6 pt-5 lg:px-8 ${
            !isAuthenticated && "min-h-screen"
          }`}
        >
          <FloatingBalls className="hidden absolute top-[4%] rotate-45 md:block" />
          <FloatingBalls className="hidden absolute top-[2%] w-10 right-[2%] md:block" />
          <FloatingBalls className="hidden absolute top-[9%] right-0 md:block" />
          <FloatingBalls className="hidden absolute top-[10%] w-8 rotate-90 left-[3%] md:block" />

          <div
            className="w-full lg:w-[50%] h-full "
            style={{
              display: isAuthenticated ? "none" : "block,",
              transform: "rotate(0deg)",
              transformOrigin: "0 0",
              background:
                "linear-gradient(255deg, #FFEBE9 0%, #F3F6FB 60%, rgba(251, 247.32, 243, 0) 100%)",
              top: "-10px",
              right: "0px",
              position: "absolute",
              zIndex: -1,
            }}
          ></div>
          <div
            className="w-full lg:w-[50%] h-full "
            style={{
              transform: "rotate(180deg)",
              display: isAuthenticated ? "none" : "block,",
              transform: "scaleX(-1)",
              background:
                "linear-gradient(255deg, #FFEBE9 0%, #F3F6FB 60%, rgba(251, 247.32, 243, 0) 100%)",
              top: "-10px",
              left: "0px",
              position: "absolute",
              zIndex: -1,
            }}
          ></div>
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <svg
              className="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]"
              viewBox="0 0 1155 678"
            >
              <path
                fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
                fillOpacity=".3"
                d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
              />
              <defs>
                <linearGradient
                  id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
                  x1="1155.49"
                  x2="-78.208"
                  y1=".177"
                  y2="474.645"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#9089FC" />
                  <stop offset={1} stopColor="#FF80B5" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {!isAuthenticated && (
            <div className="hidden lg:flex">
              {/* <div
                className="absolute top-[3%] w-32 h-32 hidden lg:flex left-[10%] hover:scale-105 cursor-pointer transform-gpu -translate-x-1/2 -translate-y-1/2 animate-float"
                style={{
                  padding: 10.23,
                  rotate: "10.26deg",
                  transformOrigin: "0 0",
                  background:
                    "linear-gradient(124deg, #4062FF 2.90%, #9747FF 100%), #FFF",
                  boxShadow:
                    "0px 9.136962890625px 18.27392578125px rgba(19.52, 39.88, 133.87, 0.20)",
                  borderRadius: 10.23,
                  flexDirection: "column",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                  display: "inline-flex",
                }}
              >
                <div className="text-center text-white text-3xl font-extrabold leading-9">
                  10x
                </div>
                <div className="self-stretch opacity-80 text-center text-white text-xs font-normal leading-3 tracking-wide">
                  Return on Investment using Lille
                </div>
              </div>
              <div
                className="absolute top-[6%] w-32 h-32 hidden lg:flex right-[10%] hover:scale-105 cursor-pointer transform-gpu -translate-x-1/2 -translate-y-1/2 animate-float"
                style={{
                  padding: 10.23,
                  rotate: "2.84deg",
                  transformOrigin: "0 0",
                  background:
                    "linear-gradient(124deg, #4062FF 2.90%, #9747FF 100%), #FFF",
                  boxShadow:
                    "0px 9.136962890625px 18.27392578125px rgba(19.52, 39.88, 133.87, 0.20)",
                  borderRadius: 10.23,
                  flexDirection: "column",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                  display: "inline-flex",
                }}
              >
                <div className="text-center text-white text-3xl font-extrabold leading-9">
                  40%
                </div>
                <div className="self-stretch opacity-80 text-center text-white text-xs font-normal leading-3 tracking-wide">
                  Increase in social media followers
                </div>
              </div>

              <div
                className="absolute w-32 h-32 hidden lg:flex top-[7%] left-[10%] hover:scale-105 cursor-pointer transform-gpu -translate-x-1/2 -translate-y-1/2 animate-float"
                style={{
                  rotate: "-9.71deg",
                  transformOrigin: "0 0",
                  background:
                    "linear-gradient(124deg, #4062FF 2.90%, #9747FF 100%), #FFF",
                  boxShadow:
                    "0px 9.136962890625px 18.27392578125px rgba(19.52, 39.88, 133.87, 0.20)",
                  borderRadius: 10.23,
                  flexDirection: "column",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                  display: "inline-flex",
                }}
              >
                <div className="text-center text-white text-3xl font-extrabold leading-10">
                  80%
                </div>
                <div className="self-stretch opacity-80 text-center text-white text-sm font-normal leading-none tracking-wide">
                  Time reduced on 1st Drafts
                </div>
              </div> */}
            </div>
          )}
          <div className=" relative mx-auto max-w-screen-xl flex flex-col">
            <div
              className={`mx-auto max-w-5xl text-center h-screen  ${
                isAuthenticated ? "" : "min-h-screen"
              } flex items-center justify-center `}
              style={{
                height: "100%",
              }}
            >
              <div
                className={`mt-[10%] ${
                  isAuthenticated
                    ? keywordsOFBlogs.length == 0 && "lg:mt-[10%]"
                    : keywordsOFBlogs.length == 0 && "lg:mt-[-10%]"
                }`}
              >
                <RotatingText />
                <form onSubmit={handleExtractInfo}>
                  <div
                    className="w-full lg:min-w-[850px] animate-fadeIn lg:max-w-[850px] h-full opacity-90 transition-all ease-out shadow border border-white backdrop-blur-[20px] flex-col justify-center mt-10 items-center gap-[18px] inline-flex rounded-[10px] p-4"
                    style={{
                      background: "rgba(255, 255, 255, 0.5)",
                      outline: "none !important",
                    }}
                  >
                    <h1 className="text-center text-slate-800 text-xl font-bold leading-relaxed">
                      Select a Source
                    </h1>
                    <div className="w-full relative">
                      <Tab.Group
                        defaultIndex={activeTab}
                        onChange={(index) => {
                          setActiveTab(index);
                        }}
                      >
                        <Tab.List className="justify-start items-center gap-3 inline-flex">
                          {tabs.map((tab) => (
                            <Tab
                              key={tab.id}
                              className={`${
                                tab.label === "Web" ? "lg:w-24" : "lg:w-32"
                              } h-8  px-0.5 lg:px-2.5 py-1 border-b border-indigo-600 ring-0  focus:ring-0  justify-center items-center gap-2.5 inline-flex text-base font-medium text-gray-800 ${
                                activeTab === tab.id
                                  ? "border-b-2 border-indigo-600 text-gray-800"
                                  : "text-gray-600 border-none"
                              }`}
                            >
                              {tab.label}
                            </Tab>
                          ))}
                        </Tab.List>
                        <Tab.Panels>
                          {tabs.map((tab) => (
                            <Tab.Panel
                              key={tab.id}
                              className={`
                              p-4 transition-all duration-300 ease-in-out animate-fadeIn 
                              ${
                                activeTab === tab.id
                                  ? "opacity-100 visible animate-fadeIn"
                                  : "opacity-0 invisible"
                              }
                            `}
                            >
                              {tab.upperContent ? tab.upperContent : null}
                              {/* <div className="w-full h-full justify-center items-center gap-2.5 inline-flex">
                                <div
                                  className={`relative w-full min-h-[60px] bg-white rounded-[10px]  border py-2.5 ${
                                    keyword.length > 100
                                      ? "border-red-600"
                                      : "border-indigo-600"
                                  } `}
                                >
                                  <div
                                    className={`flex items-center flex-col md:flex-row  gap-2.5 relative outline-none active:outline-none rounded-lg`}
                                  >
                                    <KeywordInput
                                      keyword={keyword}
                                      setKeyword={setkeyword}
                                      placeholder={tabsPlaceholders[tab.id]}
                                      maxLength={100}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          disableGenerateButton
                                            ? null
                                            : handleGenerateClick();
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                                {keyword.length > 100 && (
                                  <div className="absolute bottom-0 left-4 text-red-600 text-xs font-medium leading-none">
                                    {keyword.length}/100
                                  </div>
                                )}
                              </div> */}
                              {tab.content}
                            </Tab.Panel>
                          ))}
                        </Tab.Panels>
                      </Tab.Group>
                    </div>

                    <button
                      disabled={disableGenerateButton}
                      className="h-14 px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg shadow justify-center items-center gap-2.5 inline-flex hover:from-indigo-700 hover:to-violet-700 focus:shadow-outline-indigo disabled:opacity-50 disabled:cursor-not-allowed"
                      type="submit"
                      // onClick={() => {
                      //   handleGenerateClick()
                      // }}
                    >
                      <>
                        <div className="text-white text-base font-medium leading-7">
                          Extract Information{" "}
                        </div>
                      </>
                    </button>
                  </div>
                </form>

                <div
                  className="w-[80%] absolute top-[500px] lg:top-[350px] h-[200px] inset-x-0 -z-10"
                  style={{
                    background:
                      "linear-gradient(265deg, #C3DDFF 38%, #FFF5E3 61%)",
                    filter: "blur(80px)",
                  }}
                ></div>
              </div>
            </div>
            {/* {!isAuthenticated && <LandingPage />} */}
          </div>
          {/* <div className="absolute inset-x-0 top-[calc(100%-12rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
            <svg
              className="relative left-[calc(50%+3rem)] h-[21.1875rem] max-w-none -translate-x-1/2 sm:left-[calc(50%+36rem)] sm:h-[30.375rem]"
              viewBox="0 0 1155 678"
            >
              <path
                fill="url(#ecb5b0c9-546c-4772-8c71-4d3f06d544bc)"
                fillOpacity=".3"
                d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
              />
              <defs>
                <linearGradient
                  id="ecb5b0c9-546c-4772-8c71-4d3f06d544bc"
                  x1="1155.49"
                  x2="-78.208"
                  y1=".177"
                  y2="474.645"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#9089FC" />
                  <stop offset={1} stopColor="#FF80B5" />
                </linearGradient>
              </defs>
            </svg>
          </div> */}
          {/* {!isAuthenticated && <KeyFeatures/>} */}
        </div>

        {/* {!isAuthenticated && <MoblieUnAuthFooter />} */}
      </Layout>

      {/* chat */}
      <img
        className="h-12 absolute bottom-1 right-1 md:bottom-10 md:right-7 cursor-pointer bg-gray-400 rounded-md p-1.5"
        src="/chat.png"
        style={{ objectFit: "cover" }}
        onClick={() => router.replace("/misci")}
      />
      <style>
        {`
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }
  `}
      </style>
      <style>
        {`
          @media screen and (max-width: 767px) {
            .not-responsive-message {
            display: block;
            }
          }
          .modal {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .modal-background {
            opacity: 0.75;
          }

          .modal-content {
            max-width: 640px;
          }
      `}
      </style>
    </>
  );
}

type KeywordInputProps = {
  maxLength?: number;
  placeholder: string;
  keyword: string;
  setKeyword: React.Dispatch<React.SetStateAction<string>>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

const KeywordInput = ({
  maxLength,
  placeholder,
  keyword,
  setKeyword,
  onKeyDown,
}: KeywordInputProps) => {
  return (
    <input
      type="text"
      // maxLength={maxLength}
      placeholder={placeholder}
      className="w-full h-full outline-transparent bg-transparent border-transparent focus:border-transparent focus:ring-0"
      value={keyword}
      onChange={(e) => {
        const text = e.target.value;
        console.log(text.length);
        setKeyword(text);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onKeyDown ? onKeyDown(e) : null;
        }
      }}
    />
  );
};

const RotatingText = React.memo(() => {
  return (
    <div className="relative flex lg:mb-[20px] text-3xl items-center justify-center font-bold tracking-tight text-gray-900 sm:text-5xl flex-wrap custom-spacing lg:min-w-[900px]">
      Lille for <TextTransitionEffect text={TEXTS2} />
      <div className="hidden lg:block absolute right-0 md:right-[-10%]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="240"
          height="261"
          viewBox="0 0 240 261"
          fill="none"
        >
          <path
            d="M144.552 98.8563C164.626 112.575 180.188 128.559 189.173 143.197C193.667 150.52 196.44 157.382 197.391 163.365C198.339 169.327 197.46 174.237 194.896 177.989C192.332 181.741 188.076 184.343 182.178 185.626C176.258 186.914 168.857 186.824 160.402 185.297C143.501 182.244 122.954 173.553 102.88 159.834C82.8064 146.116 67.2442 130.131 58.26 115.493C53.7659 108.171 50.993 101.309 50.0418 95.3256C49.0941 89.3642 49.9729 84.4535 52.5368 80.7018C55.1007 76.9501 59.3566 74.3473 65.255 73.0645C71.1747 71.777 78.5758 71.8673 87.0304 73.3941C103.932 76.4464 124.478 85.1379 144.552 98.8563Z"
            stroke="url(#paint0_linear_2158_42358)"
            stroke-width="6"
          />
          <path
            d="M147.927 99.2697C166.631 117.075 179.874 136.963 186.206 154.666C192.571 172.461 191.82 187.578 183.39 196.434C174.96 205.29 159.898 206.783 141.811 201.301C123.818 195.847 103.303 183.598 84.5991 165.793C65.8957 147.988 52.6529 128.1 46.3203 110.396C39.9549 92.6012 40.7059 77.4839 49.1363 68.6282C57.5668 59.7724 72.6288 58.2789 90.7152 63.7615C108.709 69.2158 129.224 81.4645 147.927 99.2697Z"
            stroke="url(#paint1_linear_2158_42358)"
            stroke-width="3"
          />
          <defs>
            <linearGradient
              id="paint0_linear_2158_42358"
              x1="146.054"
              y1="82.7086"
              x2="81.9961"
              y2="165.72"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#F7938B" />
              <stop offset="1" stop-color="white" stop-opacity="0" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_2158_42358"
              x1="47.5691"
              y1="48.2032"
              x2="82.6596"
              y2="126.602"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#F9948C" />
              <stop offset="1" stop-color="white" stop-opacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
});

RotatingText.displayName = "RotatingText";
