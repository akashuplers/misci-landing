/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-html-link-for-pages */
// @ts-nocheck
import MoblieUnAuthFooter from "@/components/LandingPage/MoblieUnAuthFooter";
import RePurpose from "@/components/LandingPage/RePurpose";
import { API_BASE_PATH, API_ROUTES } from "@/constants/apiEndpoints";
import { gql, useQuery } from "@apollo/client";
import Tooltip from "@/components/ui/Tooltip";
import { ArrowRightCircleIcon, InformationCircleIcon } from "@heroicons/react/20/solid";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import Marquee from "react-fast-marquee";
import { ToastContainer, toast } from "react-toastify";
import LandingPage from "../components/LandingPage/LandingPage";
import Layout from "../components/Layout";
import LoaderPlane from "../components/LoaderPlane";
import TrialEndedModal from "../components/TrialEndedModal";
import { meeAPI } from "../graphql/querys/mee";
import { extractKeywordsAndIds, getDateMonthYear, getIdFromUniqueName, isMonthAfterJune, keywordsUniqueName, uploadAndExtractKeywords } from "../helpers/helper";
import OTPModal from "../modals/OTPModal";
import PreferencesModal from "../modals/PreferencesModal";
import useStore, { useFunctionStore } from "../store/store";
import { Tab } from "@headlessui/react";
import ReactLoading from "react-loading";
import { CheckCircleIcon, CloudArrowUpIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { checkFileFormatAndSize } from "@/components/DashboardInsights";
import { TotalTImeSaved } from "@/modals/TotalTImeSaved";
import DragAndDropFiles, { REPURPOSE_MAX_SIZE_MB } from "@/components/ui/DragAndDropFiles";
import { maxFileSize } from "@/helpers/utils";
import {useBlogLinkStore, useRepurposeFileStore, useSideBarChangeFunctions} from "@/store/appState";

const PAYMENT_PATH = "/?payment=true";
const TONES = [
  'Authoritative',
  'Political', 'Non political',
  'Ethnic', 'Rational', 'Modern thinking',
  'Non Robotic'
]

var newTones = [];
TONES.forEach((tone) => {
  newTones.push({ text: tone, selected: false });
}
);
const TEXTS = [
  "Twitter  Post",
  "Linkedin Post",
  "Tweet  thread",
  "Blog Posts",
  "Tweets ",
  "Newsletters",
];

const TEXTS2 = [
  "Linkedin ideas",
  "Twitter Thread",
  "Blog ideas",
  "Fresh ideas",
  "Blog ideas",
  "Linkedin Post",
];
export const TYPES_OF_GENERATE = {
  REPURPOSE: 'repurpose',
  NORMAL: 'normal'
}
export const BASE_PRICE = 100;

export interface BlogLink {
  label: string;
  value: string;
  selected: boolean;
  id: string;
  index: number;
  type: 'file' | 'url';
}

const STATESOFKEYWORDS = {
  LOADING: 'loading',
  LOADED: 'loaded',
}
export default function Home() {
  var getUserId;
  var getTempId;
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const updateAuthentication = useStore((state) => state.updateAuthentication);
  // check if url container ?payment=true
  const [isPayment, setIsPayment] = useState(false);
  const blogLinks = useBlogLinkStore((state) => state.blogLinks);
  const [keywordsOFBlogs, setkeywordsOfBlogs] = useState([]);
  const [articleIds, setArticleIds] = useState([]);
  const setBlogLinks = useBlogLinkStore((state) => state.setBlogLinks);
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [repurposeTones, setRepurposeTones] = useState(newTones);
  const [showFileUploadUI, setShowFileUploadUI] = useState(false);
  const addToFunctionStack = useFunctionStore((state) => state.addToStack);
  const [stateOfGenerate, setStateOfGenerate] = useState({
    url : null,
    file: null,
  });
  const [showLoadingInfo, setShowLoadingInfo] = useState(false);
  const selectedFiles = useRepurposeFileStore((state) => state.selectedFiles);
  const removeSelectedFile = useRepurposeFileStore((state) => state.removeSelectedFile);
  const setSelectedFiles = useRepurposeFileStore((state) => state.setSelectedFiles); 
  const executeLastFunction = useFunctionStore((state) => state.executeLastFunction);
  const {addFunction}=useSideBarChangeFunctions()
  const handleGenerateReset = () => {
    setkeywordsOfBlogs([]);
    setBlogLinks([]);
    setSelectedFiles([]);
    setStateOfGenerate((prev)=>{
      return {
        url: null,
        file: null,
      }
    }
    )
  }
  useEffect(()=>{
    addFunction(handleGenerateReset);
  },[blogLinks])
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        executeLastFunction();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [executeLastFunction]);
  
  const handleChipClick = (index) => {
    const idOfKeyword = getIdFromUniqueName(keywordsOFBlogs[index].id);

    setkeywordsOfBlogs((prevKeywords) => {
      const updatedKeywords = [...prevKeywords];
      updatedKeywords[index].selected = !updatedKeywords[index].selected;
      const isSelected = updatedKeywords[index].selected;
      if (isSelected === true) {
        setArticleIds((prevArticleIds) => {
          const updatedArticleIds = [...prevArticleIds];
          updatedArticleIds.push(idOfKeyword);
          return updatedArticleIds;
        });
      } else {
        setArticleIds((prevArticleIds) => {
          const updatedArticleIds = [...prevArticleIds];
          const index = updatedArticleIds.indexOf(idOfKeyword);
          if (index > -1) {
            updatedArticleIds.splice(index, 1);
          }
          return updatedArticleIds;
        });
      }
      return updatedKeywords;
    });
  };
  const handleToneClick = (index) => {
    setRepurposeTones((prevTones) => {
      const updatedTones = [...prevTones];
      updatedTones[index].selected = !updatedTones[index].selected;
      return updatedTones;
    });
  }
  useEffect(() => {
    updateAuthentication();
  }, []);
  useEffect(()=>{
    console.log('SELECTED FILES with blog links');
    console.log(selectedFiles, blogLinks);
  },[selectedFiles, blogLinks])

  useEffect(() => {
    console.log('articleids');
    console.log(articleIds);
    console.log('keywords');
    console.log(keywordsOFBlogs);
  }, [articleIds]);
  const keywords = gql`
    query keywords {
      trendingTopics
    }
  `;
  const { data, loading } = useQuery(keywords);
  const [isauth, setIsauth] = useState(false);
  const [loadingForKeywords, setLoadingForKeywords] = useState(false);
  const [showRepourposeError, setShowRepourposeError] = useState(false);
  const [showHoveUpgradeNow, setShowHoveUpgradeNow] = useState(false);
  const [loadingForFilesKeywords, setLoadingForFilesKeywords] = useState(false);
  const handleGenerate = (options = {}) => {
    console.log('options');
    console.log(options);
    localStorage.setItem("optionsForRepurpose", JSON.stringify(options));
    const pathname = "/dashboard";
    const query = { type: TYPES_OF_GENERATE.REPURPOSE };
    router.push({ pathname, query }).then(()=> {
      setkeywordsOfBlogs([]);
      setBlogLinks([]);
      setSelectedFiles([]);
      setStateOfGenerate((prev)=>{
        return {
          url: null,
          file: null,
        }
      }
      )
    })
  };
 
  function handleRepourpose() {
    setLoadingForKeywords(true);
    // key all keywords which are selected
    ;
    const keywords = keywordsOFBlogs.filter((keyword) => keyword.selected).map((keyword) => keyword.text);
    if (keywords.length === 0) {
      toast.error("Please select atleast one keyword");
      ;
      return;
    }
    setShowRepourposeError(false);
    const options = {
      tones: repurposeTones.filter((tone) => tone.selected).map((tone) => tone.text) || [],
      keywords: keywords || [],
      article_ids: [...new Set(articleIds)]
    };
    handleGenerate(options);
    setLoadingForKeywords(false);
  }
  useEffect(() => {
    // alert('STATUS: ', loadingForKeywords)
  }, [loadingForKeywords]);
  function uploadFilesForKeywords() {
    setShowUserLoadingModal({ show: true });
    console.log(selectedFiles);
    if (selectedFiles.length > 0) {
      const selectedFilesForPayload = selectedFiles.map((fileObject) => fileObject.file);
      console.log('selectedFilesForPayload', selectedFilesForPayload);      
      uploadAndExtractKeywords(selectedFilesForPayload)
        .then((response) => {
          console.log('Response:', response);
          // Handle the response here
          if (response?.response?.data && response?.response?.data?.type === 'ERROR') {
            toast.error(response.response.data.message);
            setLoadingForKeywords(false); // Set loading state back to false on error
            return;
          }
          const { data } = response.data;
          const keywordsForBlog = [];

          data.forEach((item) => {
            item.keywords.forEach((keyword) => {
              const keywordObj = {
                id: item.id,
                text: keyword.toLowerCase().charAt(0).toUpperCase() + keyword.toLowerCase().slice(1),
                selected: false,
                source: keywordsForBlog.some((keywordObj) => keywordObj.text === keyword) ? (item.source ? item.source.toLowerCase().charAt(0).toUpperCase() + item.source.toLowerCase().slice(1) : '') : null,
                realSource: item.source,
                url: item.url,
                articleId: item.id,
              };

              if (keywordObj.source !== null && item.source !== undefined && item.source !== '') {
                const keywordObjFromKeywords = keywordsForBlog.find((keywordObj) => keywordObj.text === keyword);
                if (keywordObjFromKeywords !== undefined) {
                  keywordObjFromKeywords.source = keywordObj.realSource ? keywordObj.realSource.toLowerCase().charAt(0).toUpperCase() + keywordObj.realSource.toLowerCase().slice(1) : '';
                }
              }
              keywordsForBlog.push(keywordObj);
            });
          });

          // Update the state with processed keywords
          setkeywordsOfBlogs((prev) => {
            const prevKeywords = [...prev];
            const updatedKeywords = [...prevKeywords, ...keywordsForBlog];
            const processedKeywords = processDataForKeywords(updatedKeywords);
            return processedKeywords;
          });
          setStateOfGenerate((prev)=>{
            return {
              ...prev,
              file: STATESOFKEYWORDS.LOADED,
            }
          });
          setShowUserLoadingModal({ show: false });
          setLoadingForKeywords(false); // Set loading state back to false on successful response
        })
        .catch((error) => {
          console.log('ERROR');
          console.log(error);
          // Handle errors here
          setStateOfGenerate((prev)=>{
            return {
              ...prev,
              file: STATESOFKEYWORDS.LOADED,
            }
          });
          setShowUserLoadingModal({ show: false });
          setLoadingForKeywords(false); // Set loading state back to false on error
        });
    } else {
      toast.error('Please select a file');
      setLoadingForKeywords(false); // Set loading state back to false if no file is selected
    }
  }
  useEffect(() => {
    console.log('keywordsOFBlogs');
    console.log(keywordsOFBlogs);
  }, [keywordsOFBlogs]);
  function processDataForKeywords(data) {
    const keywordsMap = {};
    data.forEach((item) => {
      keywordsMap[item.text] = keywordsMap[item.text] ? keywordsMap[item.text] + 1 : 1;
    });
    data.forEach((item) => {
      if (keywordsMap[item.text] > 1) {
        item.source = item.realSource ? item.realSource.toLowerCase().charAt(0).toUpperCase() + item.realSource.toLowerCase().slice(1) : '';
      }
    });
    return data;
  }
  function handleGenerateClick() {
    const countByType = blogLinks.reduce((acc, link) => {
      if (link.type === 'file') {
        acc.files++;
      } else if (link.type === 'url') {
        acc.urls++;
      }
      return acc;
    }, { files: 0, urls: 0 });// Replace `keywords` with your actual keywords array/state
    // Replace `fileInput` with your actual file input state or variable
    console.log('countByType');
    if(countByType.files > 0){
      setStateOfGenerate((prev)=>{
        return {
          ...prev,
          file: STATESOFKEYWORDS.LOADING,
        }
      });
    }    
    if(countByType.urls > 0){
      setStateOfGenerate((prev)=>{
        return {
          ...prev,
          url: STATESOFKEYWORDS.LOADING,
        }
      });
    }
    console.log('countByType');
    console.log(countByType);
    if (countByType.files > 0 && countByType.urls > 0) {

      // Call both methods when both keywords and files are greater than zero
      uploadExtractKeywords();
      uploadFilesForKeywords();
    } else if (countByType.urls > 0) {
      // Call only the keywords method when there are keywords but no files
      uploadExtractKeywords();
    } else if (countByType.files > 0) {
      // Call only the files method when there are files but no keywords
      uploadFilesForKeywords();
    } else {
      // Call the default method when both keywords and files are zero
      uploadExtractKeywords();
    }
  }

  function uploadExtractKeywords() {
    setShowUserLoadingModal({ show: true });
    const getToken = localStorage.getItem("token");
    var getUserId;
    if (typeof window !== "undefined") {
      getUserId = localStorage.getItem("userId");
    }
    var getTempId;
    if (typeof window !== "undefined") {
      getTempId = localStorage.getItem("tempId");
    }
    var raw = JSON.stringify({
      "urls": blogLinks
        .filter((url) => url.type === 'url')
        .map((url) => url.value),
      "userId": getToken ? getUserId : getTempId
    });
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
    };
    const URL = API_BASE_PATH + API_ROUTES.EXTRACT_KEYWORDS
    fetch(URL, requestOptions)
      .then(response => response.json())
      .then(result => {
        if (result.type === 'ERROR') {
          // const errorMessage = result.message + result?.unprocessedUrls && result.unprocessedUrls.length > 0 && (' Unresovled URLs ' + result.unprocessedUrls.join(', '));
          let _errorMessage = result.message;
          if (result?.unprocessedUrls && result.unprocessedUrls.length > 0) {
            _errorMessage += ' Unresovled URLs are ' + result.unprocessedUrls.join(', ');
          }
          const errorMessage = _errorMessage;
          toast.error(errorMessage);
          return;
        }
        const doesUnprocessedUrlsExist = result?.unprocessedUrls && result.unprocessedUrls.length > 0;
        if (doesUnprocessedUrlsExist) {
          toast.warn(`Success but we could not resolve ${result.unprocessedUrls.length > 1 ? "these URLs" : "this URL"} : ` + result.unprocessedUrls.join(', '));
        }
        const { keywords,keywordIdMap,
          articleIds, } = extractKeywordsAndIds(result);
        // setkeywordsOfBlogs(prev => [...prev, ...keywords]);
        const prevKeywords = [...keywordsOFBlogs];
        const updatedKeywords = [...prevKeywords, ...keywords];
        const processedKeywords = processDataForKeywords(updatedKeywords);
        setkeywordsOfBlogs(processedKeywords);
        setKeywordsMap(keywordIdMap);
        setStateOfGenerate((prev)=>{
          return {
            ...prev,
            url: STATESOFKEYWORDS.LOADED,
          }
        });
      })
      .catch(error => {
        console.log('error', error)
        setStateOfGenerate((prev)=>{
          return {
            ...prev,
            url: STATESOFKEYWORDS.LOADED,
          }
        });
      })
      .finally(() => {
        setStateOfGenerate((prev)=>{
          return {
            ...prev,
            url: STATESOFKEYWORDS.LOADED,
          }
        });
        setShowUserLoadingModal({ show: false });
      });
  }

  var getToken;
  useEffect(() => {
    if (typeof window !== "undefined") {
      getToken = localStorage.getItem("token");
      if (getToken) setIsauth(true);
    }
  }, []);

  const [keyword, setkeyword] = useState("");
  const router = useRouter();
  const setKeywordInStore = useStore((state) => state.setKeyword);
  const [index, setIndex] = React.useState(0);
  const [showUserLoadingModal, setShowUserLoadingModal] = useState({
    show: false,
  });

  useEffect(() => {
    if (router.asPath === PAYMENT_PATH) {
      if (localStorage.getItem("userContribution") !== null) {
        var userContribution = JSON.parse(
          localStorage.getItem("userContribution") || "{}"
        );
        const SAVE_USER_SUPPORT_URL = API_BASE_PATH + "/auth/save-user-support";
        const requestOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify(userContribution),
        }; s
        fetch(SAVE_USER_SUPPORT_URL, requestOptions)
          .then((response) => {
          })
          .catch((error) => {
          });
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
      const timeout = setTimeout(() => {
        setIsPayment(false);
        router.push("/", undefined, { shallow: true });
      }, 5000);

      return () => {
        clearTimeout(timeout);
      };
    } else {
      localStorage.removeItem("userContribution");
    }
  }, [router]);

  useEffect(() => {
    const intervalId = setInterval(
      () => setIndex((index) => index + 1),
      3000 // every 3 seconds
    );
    return () => clearTimeout(intervalId);
  }, []);

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

  const updatedArr = data?.trendingTopics?.map((topic: any, i: any) => (
    <Link
      key={i}
      legacyBehavior
      as={"/dashboard"}
      href={{
        pathname: "/dashboard",
        query: { topic: topic },
      }}
    >
      <div className="w-full cursor-pointer flex items-center  justify-between gap-x-2 px-4 py-2 rounded-md bg-gray-100 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
        <button className="cursor-pointer text-sm font-medium text-gray-900">
          {topic.length > 31 ? (
            <Marquee pauseOnHover={true} autoFill={false}>
              <div className="mx-4">{topic}</div>
            </Marquee>
          ) : (
            topic
          )}
        </button>
        <ArrowRightCircleIcon className="w-5 h-5 text-gray-400" />
      </div>
    </Link>
  ));

  const [pfmodal, setPFModal] = useState(false);
  const [isOTPVerified, setIsOTPVerified] = useState(true);
  const [showOTPModal, setShowOTPModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isOTPVerified = localStorage.getItem("isOTPVerified");
      // check if verified or not
      if (isOTPVerified == "false" || !isOTPVerified) {
        setPFModal(false);
      } else {
        if (meeData?.me.prefFilled === false) {
          setPFModal(true);
        }
      }
    }
    if (meeData?.me) {
      localStorage.setItem(
        "userId",
        JSON.stringify(meeData.me._id).replace(/['"]+/g, "")
      );
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
          setIsOTPVerified(false);
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
          setIsOTPVerified(true);
          setShowOTPModal(false);
        }
      }
    }
  }, [meeData]);

  useEffect(() => {
    function sendOpt() {
      const SEND_OTP_URL = API_BASE_PATH + "/auth/send-otp";
      // var getToken = localStorage.getItem("token");
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken,
        },
      };

      fetch(SEND_OTP_URL, requestOptions)
        .then((response) => {
        })
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
          <TrialEndedModal setTrailModal={() => { }} topic={null} />
        )}

        <div
          className={`relative px-6 pt-5 lg:px-8 ${!isAuthenticated && "md:min-h-screen"
            }`}
        >
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
              <div
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
              </div>
            </div>
          )}
          <div className="relative mx-auto max-w-screen-xl flex flex-col">
            <div className={`mx-auto max-w-3xl text-center h-screen  lg:min-h-screen flex items-center justify-center `}
            style={{
              height: '100%'
            }}
            >
              <div className="mt-[-10%]">
                <div className="relative flex text-3xl items-center  justify-center font-bold tracking-tight text-gray-900 sm:text-5xl flex-wrap custom-spacing">
                  Automate, <span className="text-indigo-700">Amplify,</span>{" "}
                  Achieve.
                </div>
                <div className="relative flex text-xl items-center  justify-center font-medium tracking-tight text-gray-900 sm:text-xl pt-4 flex-wrap custom-spacing">
                  Your AI-powered content partner that doesn't dream, it
                  delivers!
                </div>

                <Tab.Group
                  defaultIndex={currentTabIndex}
                >
                  <Tab.List className="p-2 mt-10 bg-slate-50 h-14 focus:outline-none rounded--xl border border-neutral-400 text-gray-600 border-opacity-25 justify-start items-center gap-3 inline-flex rounded-xl">
                    <Tab>
                      {({ selected }) => (
                        <div className={`rounded-xl h-10 px-2 focus:outline-none justify-center items-center gap-2 inline-flex ${selected ? 'bg-white border border-indigo-600 text-indigo-600' : 'border-none text-gray-600'}`}
                          onClick={() => setCurrentTabIndex(0)}
                        >
                          <span className="">
                            {" "}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              className="w-6 h-6 "
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                              />
                            </svg>
                          </span>{" "}
                          Generate new
                        </div>
                      )}
                    </Tab>
                    <Tab>
                      {({ selected }) => (
                        <div className={`rounded-xl h-10 focus:outline-none focus:border-transparent focus-visible:hidden justify-center items-center gap-2 px-2 inline-flex ${selected ? 'bg-white  border border-indigo-600 text-indigo-600' : 'border-none text-gray-600'}`}
                          onClick={() => { setCurrentTabIndex(1) }}
                        >
                          <span>
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
                                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                              />
                            </svg>
                          </span>{" "}
                          Repurpose Content
                        </div>
                      )}
                    </Tab>
                  </Tab.List>
                  <Tab.Panels className={`outline-none`}>
                    <Tab.Panel className={`outline-none`}>
                      <div className="p-4 mt-4 lg:mt-2">
                        Try some of our trending topics.
                      </div>
                      {!loading ? (
                        <div className="flex flex-col  lg:grid grid-cols-3 gap-4 py-4">
                          {updatedArr}
                        </div>
                      ) : (
                        <div style={{ margin: "0 auto" }}>
                          <LoaderPlane />
                        </div>
                      )}
                      <AIInputComponent />
                    </Tab.Panel>
                    <Tab.Panel className={`outline-none`}>
                      <div className="w-full lg:w-[650px] h-full opacity-90 flex-col justify-center mt-10 items-center gap-[18px] inline-flex bg-transparent rounded-[10px]">
                        <div className="w-full h-6 justify-center items-center gap-1.5 inline-flex">
                          <div className="text-center text-slate-600 text-ase font-normal">Lille will help you to Repurpose the whole blog</div>
                          <Tooltip content="Add your content URLs, We will help you recreate blog on the basis of keywords and tones  selected by you.
" direction='top' className='max-w-[100px]'>
                            <InformationCircleIcon className='h-[18px] w-[18px] text-gray-600' />
                          </Tooltip>  
                        </div>
                        <div className="w-full h-full justify-center items-center gap-2.5 inline-flex">
                          <div className="relative w-full min-h-[60px] bg-white rounded-[10px]  border border-gray-600 py-2.5">

                            {showFileUploadUI == true &&

                              <div className="flex items-center justify-between px-5">
                            <h1 className="grow shrink basis-0 text-slate-800 text-lg font-normal text-left">Upload</h1>
                                <button onClick={
                                  () => { setShowFileUploadUI(false) }}
                                >
                                  <XCircleIcon className='h-6 w-6 text-indigo-600' />
                                </button>
                              </div>
                            }
                            <div className="flex items-center px-2  gap-2.5">
                              {/* <RePurpose removeFile={removeFile} value={blogLinks} setValue={setBlogLinks} setShowRepourposeError={setShowRepourposeError} /> */}
                              {
                                showFileUploadUI == true && blogLinks.length == 0 ?
                                  <></>
                                  :
                                  <RePurpose removeFile={removeSelectedFile} value={blogLinks} setValue={setBlogLinks} setShowRepourposeError={setShowRepourposeError} />

                              }

                              {showFileUploadUI != true && 
                              
                              <Tooltip content={`Select file formats like PDF, DOCX, TXT (size <${REPURPOSE_MAX_SIZE_MB}MB)`} direction='top' className='max-w-[100px] mt-4'>
                              
                              <div onClick={
                                () => {
                                  setShowFileUploadUI(true);
                                      addToFunctionStack(() => { setShowFileUploadUI(false) })
                                    }
                                  } className="w-full h-10 flex justify-around cursor-pointer px-2 rounded-lg border border-indigo-600 items-center gap-2.5">
                                    <CloudArrowUpIcon className='h-6 w-6 text-indigo-600' />
                                    <button className="justify-center items-center gap-2 inline-flex w-full ">
                                      <span className="text-indigo-600 text-sm font-normal">Upload</span>
                                    </button>
                                  </div>
                                </Tooltip>
                              }
                            </div>

                            {showFileUploadUI == true &&
                              <div className="px-5">

                                <h3>
                                  {/* <Tooltip content="Select file formats like PDF, DOCX, TXT (size <7mb)" direction='top' className='max-w-[100px] mt-4'>
                                    <button 
                                    onClick={
                                      () => {
                                        inputFilesRef.current.click();
                                      }
                                    }
                                    className="w-[100.81px] h-10 flex justify-around cursor-pointer px-2 rounded-lg border border-indigo-600 items-center gap-2.5" htmlFor="refileupload">
                                      <CloudArrowUpIcon className='h-6 w-6 text-indigo-600' />
                                      <button className="justify-center items-center gap-2 inline-flex ">
                                        <span className="text-indigo-600 text-sm font-normal">Upload</span>
                                      </button>
                                    </button>
                                  </Tooltip> */}

                                  <DragAndDropFiles blogLinks={blogLinks} setBlogLinks={setBlogLinks} />
                                </h3>
                              </div>
                            }
                          </div>
                          {
                            keywordsOFBlogs.length > 0 &&
                            <button className="h-5 px-4 py-6 flex items-center justify-center bg-indigo-600 rounded-lg text-white text-sm font-medium focus:outline-none"
                              onClick={
                                () => {
                                  setkeywordsOfBlogs([]);
                                  setBlogLinks([]);
                                  setSelectedFiles([]);
                                  setStateOfGenerate((prev)=>{
                                    return {
                                      url: null,
                                      file: null,
                                    }
                                  }
                                  )
                                }
                              }
                            >
                              Reset
                            </button>
                          }
                        </div>
                        <div className="w-full h-6 justify-start items-center gap-1.5 inline-flex">
                          <span className={`text-center  text-sm font-normal ${showRepourposeError ? 'text-red-500' : 'text-slate-500'}`}>You can add max. 3 URLs (or Files) Use comma or press enter to add multiple URLs. Use upload button to select files</span>
                        </div>
                        { 
                          stateOfGenerate.url != null && stateOfGenerate.file != null && <div className="w-full h-6 justify-center items-center gap-2.5 inline-flex">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="text-slate-800"
                              >Keywords from URL:</span> {
                                stateOfGenerate.url == STATESOFKEYWORDS.LOADING ? <ReactLoading round={true} color={"#2563EB"} height={20} width={20} /> : <CheckCircleIcon className="h-5 w-5 text-green-500" />
                              }
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className="text-slate-800"
                              >
                                Keywords from File:
                              </span>
                              {
                                stateOfGenerate.file == STATESOFKEYWORDS.LOADING ? <ReactLoading round={true} height={20} color={"#2563EB"} width={20} /> : <CheckCircleIcon className="h-5 w-5 text-green-500" />
                              }

                            </div>
                          </div>
                        }
                        <div className='flex items-center flex-col mt-5'>
                          {keywordsOFBlogs.length > 0 && <div className="flex items-center gap-1.5" >
                            <h4>Select at least 3 keywords to regenerate blog </h4> <Tooltip content="Select keywords as per your choice to add focus, URLs containing the selected keywords will be used to recreate a high ranking SEO blog." direction='top' className='max-w-[100px]'>
                              <InformationCircleIcon className='h-[18px] w-[18px] text-gray-600' />
                            </Tooltip></div>}
                          <div className='flex flex-wrap justify-center gap-2 mt-5'>
                            {keywordsOFBlogs.length > 0 && keywordsOFBlogs.map((chip, index) => (
                              <Chip key={index} text={chip.text} handleClick={handleChipClick} index={index} selected={chip.selected} wholeData={chip} />
                            ))}
                          </div>
                        </div>
                        {
                          keywordsOFBlogs.length > 0 && isAuthenticated &&
                          (
                            <div className='flex items-center flex-col mt-5 relative' onMouseEnter={
                              () => {
                                setShowHoveUpgradeNow(true)
                              }
                            }
                              onMouseLeave={
                                () => {
                                  setShowHoveUpgradeNow(false)
                                }
                              }

                            >
                              <div className="flex items-center">
                                <h4>Choose Tone/Focus Topics </h4>
                                <Tooltip content="Improve results by adding tones to your prompt" direction='top' className='max-w-[100px]'>
                                  <InformationCircleIcon className='h-[18px] w-[18px] text-gray-600' />
                                </Tooltip>
                              </div>
                              <div className='flex flex-wrap justify-center gap-2 mt-5'>
                                {newTones.length > 0 && newTones.map((tone, index) => (
                                  <div key={index} className="relative">
                                    <Chip text={tone.text} handleClick={handleToneClick} index={index} selected={tone.selected} wholeData={null} />
                                  </div>
                                ))}
                              </div>
                              {
                                meeData?.me?.isSubscribed === false && showHoveUpgradeNow === true && (
                                  <div className="absolute top-0 left-0 w-full h-full bg-gray-700 opacity-70 flex flex-col items-center justify-center">
                                    <p>
                                      You are enjoying free trial. Upgrade your plan to get extra benefits
                                    </p>
                                    <button className="mt-2.5 text-white bg-indigo-600 rounded-[10px] shadow justify-center items-center gap-2.5 inline-flex
                        active:bg-indigo-600 hover:bg-indigo-700 focus:shadow-outline-indigo px-4 py-2"
                                      onClick={
                                        () => {
                                          typeof window !== 'undefined' && router.push(
                                            {
                                              pathname: '/upgrade',
                                            }
                                          )
                                        }
                                      }
                                    >Upgrade now</button>
                                  </div>
                                )}
                            </div>
                          )
                        }

                        <button className="p-4 mt-2.5 text-white bg-indigo-600 rounded-[10px] shadow justify-center items-center gap-2.5 inline-flex
                        active:bg-indigo-600 hover:bg-indigo-700 focus:shadow-outline-indigo
                        " onClick={
                            keywordsOFBlogs.length > 0 ?
                              handleRepourpose :
                              handleGenerateClick
                          }
                        >
                          {
                            showUserLoadingModal.show == true ?
                              <ReactLoading
                                type="spin"
                                color="#fff"
                                height={20}
                                width={20}
                              />
                              : <div className="flex items-center justify-between text-white text-lg font-medium" >
                                <span>
                                  {
                                    keywordsOFBlogs.length > 0 ? 'Repurpose' : 'Generate'
                                  }
                                </span>
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
                                    d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                                  />
                                </svg>
                              </div>
                          }

                        </button>
                      </div>
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
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
            {!isAuthenticated && <LandingPage />}
          </div>
          <div className="absolute inset-x-0 top-[calc(100%-12rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
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
          </div>
        </div>

        {!isAuthenticated && <MoblieUnAuthFooter />}
      </Layout>
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

const AIInputComponent = () => {
  const [keyword, setkeyword] = useState("");
  const router = useRouter();
  const setKeywordInStore = useStore((state) => state.setKeyword);
  const handleEnterKeyPress = (e: { key: string }) => {
    if (e.key === "Enter") {
      setKeywordInStore(keyword);
      router.push({
        pathname: "/dashboard",
        query: { topic: keyword },
      });
    }
  };
  const handleButtonClick = () => {
    const pathname = keyword.trim().length > 0 ? "/dashboard" : "/";
    const query = { topic: keyword };
    router.push({ pathname, query });
  };

  const isDisabled = keyword.trim().length === 0;

  return (
    <div
      className={`
  mt-10 flex items-center justify-center gap-x-6 
  w-[100%] rounded-md`}
    >
      <input
        id="search"
        name="search"
        className="block w-full rounded-md border-0 bg-white py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 disabled:opacity-50"
        placeholder="Search"
        type="search"
        onChange={(e) => {
          setkeyword(e.target.value);
          setKeywordInStore(e.target.value); // Update the keyword in the store
        }}
        onKeyPress={handleEnterKeyPress}
      />
      <button
        className={`cta-invert ${isDisabled ? "disabled:opacity-50" : ""}`}
        onClick={handleButtonClick}
        disabled={isDisabled}
      >
        Generate
      </button>
    </div>
  );
};


export const Chip = ({ selected, text, handleClick, index, wholeData }) => {
  console.log(wholeData);
  return <>
    {
      wholeData != null ? (
        <Tooltip content={wholeData.realSource} direction="top" className="text-xs">
          <button className={`h-8 px-[18px] py-1.5  rounded-full justify-center items-center inline-flex ${selected ? "bg-indigo-700 text-white" : 'bg-gray-200 text-slate-700 '}`} onClick={() => handleClick(index)}>
            <span className=" text-sm font-normal leading-tight">{text}</span>
          </button>
        </Tooltip>
      ) : (
        <button className={`h-8 px-[18px] py-1.5  rounded-full justify-center items-center gap-2.5 inline-flex ${selected ? "bg-indigo-700 text-white" : 'bg-gray-200 text-slate-700 '}`} onClick={() => handleClick(index)}>
          <span className=" text-sm font-normal leading-tight">{text}</span>
        </button>
      )
    }
  </>
};
