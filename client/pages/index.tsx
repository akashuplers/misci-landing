/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-html-link-for-pages */
// @ts-nocheck
import { getStaticProps } from "next";
import MoblieUnAuthFooter, { socialLinks } from "@/components/LandingPage/MoblieUnAuthFooter";
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
import TextTransition, { presets } from "react-text-transition";
import { ArrowLongRightIcon, CheckCircleIcon, CloudArrowUpIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { checkFileFormatAndSize } from "@/components/DashboardInsights";
import { TotalTImeSaved } from "@/modals/TotalTImeSaved";
import DragAndDropFiles, { REPURPOSE_MAX_SIZE_MB } from "@/components/ui/DragAndDropFiles";
import { maxFileSize } from "@/helpers/utils";
import { useBlogLinkStore, useRepurposeFileStore, useSideBarChangeFunctions, useTotalSavedTimeStore } from "@/store/appState";
// import { FacebookIcon, LinkedinIcon, TwitterIcon } from "react-share";
import { FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { TextTransitionEffect } from "@/components/ui/TextTransitionEffect";
import { Chip } from "@/components/ui/Chip";
import { InputData } from "@/types/type";
import { processKeywords, randomNumberBetween20And50, uppercaseFirstChar } from "@/store/appHelpers";
import { extractKeywordsFromKeywords } from "@/helpers/apiMethodsHelpers";
import { TYPES_OF_GENERATE } from "@/store/appContants";


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
  "Writing",
  "Research",
  "Knowledge",
];

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
    url: null,
    file: null,
    keyword: null,
  });
  const [inputData, setInputData] = useState<InputData>({})
  const [showLoadingInfo, setShowLoadingInfo] = useState(false);
  const selectedFiles = useRepurposeFileStore((state) => state.selectedFiles);
  const removeSelectedFile = useRepurposeFileStore((state) => state.removeSelectedFile);
  const setSelectedFiles = useRepurposeFileStore((state) => state.setSelectedFiles);
  const executeLastFunction = useFunctionStore((state) => state.executeLastFunction);
  const { addFunction } = useSideBarChangeFunctions()
  const handleGenerateReset = () => {
    setkeywordsOfBlogs([]);
    setBlogLinks([]);
    setSelectedFiles([]);
    setStateOfGenerate((prev) => {
      return {
        url: null,
        file: null,
        keyword: null,
      }
    }
    )
  }
  useEffect(() => {
    addFunction(handleGenerateReset);
  }, [blogLinks]);
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
  const {data:usersTotalTimeSavedData, fetchTotalSavedTime, error, isLoading} = useTotalSavedTimeStore();
  // INITAIL DATA FETCH USEEFFECT:
  useEffect(() => {
      fetchTotalSavedTime();
  }, []);
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
  useEffect(() => {
    console.log('SELECTED FILES with blog links');
    console.log(selectedFiles, blogLinks);
  }, [selectedFiles, blogLinks])

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
    router.push({ pathname, query }).then(() => {
      setkeywordsOfBlogs([]);
      setBlogLinks([]);
      setSelectedFiles([]);
      setStateOfGenerate((prev) => {
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
      toast.error("Please select atleast some keywords");
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
          const keywordsForBlog = processKeywords(data);
          // Update the state with processed keywords
          setkeywordsOfBlogs((prev) => {
            const prevKeywords = [...prev];
            const updatedKeywords = [...prevKeywords, ...keywordsForBlog];
            const processedKeywords = processDataForKeywords(updatedKeywords);
            return processedKeywords;
          });
          setStateOfGenerate((prev) => {
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
          setStateOfGenerate((prev) => {
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
    console.log(blogLinks);
    const countByType = blogLinks.reduce((acc, link) => {
      if (link.type === 'file') {
        acc.files++;
      } else if (link.type === 'url') {
        acc.urls++;
      } else if (link.type === 'keyword') {
        acc.keyword++;
      }
      return acc;
    }, { files: 0, urls: 0, keyword: 0 });
    // Replace `keywords` with your actual keywords array/state
    // Replace `fileInput` with your actual file input state or variable
    console.log('countByType');
    if (countByType.files > 0) {
      setStateOfGenerate((prev) => {
        return {
          ...prev,
          file: STATESOFKEYWORDS.LOADING,
        }
      });
    }
    if (countByType.urls > 0) {
      setStateOfGenerate((prev) => {
        return {
          ...prev,
          url: STATESOFKEYWORDS.LOADING,
        }
      });
    }
    if (countByType.keyword > 0) {
      setStateOfGenerate((prev) => {
        return {
          ...prev,
          keyword: STATESOFKEYWORDS.LOADING,
        }
      });
    }
    console.log('countByType');
    console.log(countByType);
    // if (countByType.files > 0 && countByType.urls > 0) {

    //   // Call both methods when both keywords and files are greater than zero
    //   uploadExtractKeywords();
    //   uploadFilesForKeywords();
    // } else if (countByType.urls > 0) {
    //   // Call only the keywords method when there are keywords but no files
    //   uploadExtractKeywords();
    // } else if (countByType.files > 0) {
    //   // Call only the files method when there are files but no keywords
    //   uploadFilesForKeywords();
    // } else {
    //   // Call the default method when both keywords and files are zero
    //   uploadExtractKeywords();
    // }
    // // extractKeywordsFromKeywords();
    
    if(countByType.urls > 0){
      uploadExtractKeywords();
    }
    if(countByType.keyword > 0){
      uploadExtractKeywordsFromKeywords();
    }
    if(countByType.files > 0){
      uploadFilesForKeywords();
    }
  }

 function uploadExtractKeywordsFromKeywords(){
    setShowUserLoadingModal({ show: true });
    const keywords = blogLinks.filter((link) => link.type === 'keyword').map((link) => link.value);
    console.log(keywords);
    // const data =await extractKeywordsFromKeywords(keywords[keywords.length - 1]);
    // console.log(data);
  extractKeywordsFromKeywords(keywords[keywords.length - 1]).then((data) => {
    if(data.type ==='ERROR'){
      toast.error(data.message);
      setShowUserLoadingModal({ show: false });
      return;
    }
    const keywordsData = data.data;
    const keywordsForBlog = processKeywords(keywordsData);
    setkeywordsOfBlogs((prev) => {
      const prevKeywords = [...prev];
      const updatedKeywords = [...prevKeywords, ...keywordsForBlog];
      const processedKeywords = processDataForKeywords(updatedKeywords);
      return processedKeywords;
    });
    setStateOfGenerate((prev) => {
      return {
        ...prev,
        keyword: STATESOFKEYWORDS.LOADED,
      }
    });
    setShowUserLoadingModal({ show: false });
    setLoadingForKeywords(false); 
  }).catch((err) => {
    console.log(err);
    
    toast.error(err.message)
    setShowUserLoadingModal({ show: false });
    setLoadingForKeywords(false); 
    setStateOfGenerate((prev) => {
      return {
        ...prev,
        keyword: STATESOFKEYWORDS.LOADED,
      }
    });
  }).finally(() => {

  })
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
        const { keywords, keywordIdMap,
          articleIds, } = extractKeywordsAndIds(result);
        // setkeywordsOfBlogs(prev => [...prev, ...keywords]);
        const prevKeywords = [...keywordsOFBlogs];
        const updatedKeywords = [...prevKeywords, ...keywords];
        const processedKeywords = processDataForKeywords(updatedKeywords);
        setkeywordsOfBlogs(processedKeywords);
        setKeywordsMap(keywordIdMap);
        setStateOfGenerate((prev) => {
          return {
            ...prev,
            url: STATESOFKEYWORDS.LOADED,
          }
        });
      })
      .catch(error => {
        console.log('error', error)
        setStateOfGenerate((prev) => {
          return {
            ...prev,
            url: STATESOFKEYWORDS.LOADED,
          }
        });
      })
      .finally(() => {
        setStateOfGenerate((prev) => {
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
      console.log('INPUT DATA');
      console.log(inputData);
  }, [inputData]);

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

  console.log("MEE API");
  console.log(meeAPI);
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
          className={`maincontainer relative md:px-6 pt-5 lg:px-8 ${!isAuthenticated && "md:min-h-screen"
            }`}
        >
    <FloatingBalls className="hidden absolute top-[4%] rotate-45 md:block" />
    <FloatingBalls className="hidden absolute top-[2%] w-10 right-[2%] md:block" />
    <FloatingBalls className="hidden absolute top-[9%] right-0 md:block" />
    <FloatingBalls className="hidden absolute top-[10%] w-8 rotate-90 left-[3%] md:block" />

<div className="w-full lg:w-[51%] h-full " style={{display: isAuthenticated ? 'none' : 'block,', transform: 'rotate(0deg)', transformOrigin: '0 0', background: 'linear-gradient(255deg, #FFEBE9 0%, #F3F6FB 60%, rgba(251, 247.32, 243, 0) 100%)', top: '-10px', right: '0px', position: 'absolute',  zIndex: -1}}></div>
<div className="w-full lg:w-[51%] h-full " style={{
   transform: 'rotate(180deg)', display: isAuthenticated ? 'none' : 'block,',  //      transform: scaleX(-1); 
  transform: 'scaleX(-1)',
   background: 'linear-gradient(255deg, #FFEBE9 0%, #F3F6FB 60%, rgba(251, 247.32, 243, 0) 100%)', top: '-10px', left: '0px', position: 'absolute',  zIndex: -1}}></div>
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
            <div className={`mx-auto max-w-5xl text-center h-screen  ${isAuthenticated ? "" : 'lg:min-h-screen'} flex items-center justify-center `}
              style={{
                height: '100%'
              }}
            >
              <div className={`mt-[10%] ${isAuthenticated ? 'lg:mt-[10%]' : 'lg:mt-[-10%]'}`}>
                <div className="relative flex text-3xl items-center  justify-center font-bold tracking-tight text-gray-900 sm:text-5xl flex-wrap custom-spacing lg:min-w-[900px]">
                  Lille is your Content <TextTransitionEffect text={TEXTS2} />
                  Co-Pilot
                  <div className="absolute right-0 md:right-[-10%]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="240" height="261" viewBox="0 0 240 261" fill="none">
                    <path d="M144.552 98.8563C164.626 112.575 180.188 128.559 189.173 143.197C193.667 150.52 196.44 157.382 197.391 163.365C198.339 169.327 197.46 174.237 194.896 177.989C192.332 181.741 188.076 184.343 182.178 185.626C176.258 186.914 168.857 186.824 160.402 185.297C143.501 182.244 122.954 173.553 102.88 159.834C82.8064 146.116 67.2442 130.131 58.26 115.493C53.7659 108.171 50.993 101.309 50.0418 95.3256C49.0941 89.3642 49.9729 84.4535 52.5368 80.7018C55.1007 76.9501 59.3566 74.3473 65.255 73.0645C71.1747 71.777 78.5758 71.8673 87.0304 73.3941C103.932 76.4464 124.478 85.1379 144.552 98.8563Z" stroke="url(#paint0_linear_2158_42358)" stroke-width="6" />
                    <path d="M147.927 99.2697C166.631 117.075 179.874 136.963 186.206 154.666C192.571 172.461 191.82 187.578 183.39 196.434C174.96 205.29 159.898 206.783 141.811 201.301C123.818 195.847 103.303 183.598 84.5991 165.793C65.8957 147.988 52.6529 128.1 46.3203 110.396C39.9549 92.6012 40.7059 77.4839 49.1363 68.6282C57.5668 59.7724 72.6288 58.2789 90.7152 63.7615C108.709 69.2158 129.224 81.4645 147.927 99.2697Z" stroke="url(#paint1_linear_2158_42358)" stroke-width="3" />
                    <defs>
                      <linearGradient id="paint0_linear_2158_42358" x1="146.054" y1="82.7086" x2="81.9961" y2="165.72" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#F7938B" />
                        <stop offset="1" stop-color="white" stop-opacity="0" />
                      </linearGradient>
                      <linearGradient id="paint1_linear_2158_42358" x1="47.5691" y1="48.2032" x2="82.6596" y2="126.602" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#F9948C" />
                        <stop offset="1" stop-color="white" stop-opacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-2.5">
                  <span className="relative flex text-xl items-center  justify-center font-medium tracking-tight text-gray-900 sm:text-xl pt-4 flex-wrap">Two ways to get started with &nbsp;<span className="font-bold text-indigo-600">Lille.ai</span></span>
                  <span className="text-center text-slate-800 text-xl font-bold leading-relaxed">
                    Ask questions or upload multiple documents / URL’S.
                  </span>


                </div>

                <div className="w-full lg:min-w-[700px] h-full opacity-90  shadow border border-white backdrop-blur-[20px] flex-col justify-center mt-10 items-center gap-[18px] inline-flex rounded-[10px] p-8"
                style={{
                  background: 'rgba(255, 255, 255, 0.5)',
                }}
                >
                  <div className="w-full lg:h-8 justify-center items-start gap-4 inline-flex">
                    <div className="px-3 py-1.5 bg-green-100 rounded-3xl justify-start items-center gap-1.5 flex">
                      <div className="w-3 h-3 bg-green-600 rounded-full border border-white" />
                      <div className="w-3.5 h-3.5 relative">
                      </div>
                      <div><span className="text-green-600 text-sm font-extrabold"
                      >{randomNumberBetween20And50()} users</span><span className="text-green-600 text-sm font-medium"> are online now</span></div>
                    </div>
                    <div className="px-3 py-1.5 bg-violet-100 rounded-3xl justify-start items-center gap-1.5 flex">
                      <div><span className="text-blue-500 text-sm font-extrabold">{usersTotalTimeSavedData?.data.totalSavedTime} Hrs</span><span className="text-blue-500 text-sm font-medium"> we have saved collectively of our users</span></div>
                    </div>
                  </div>
                  <div className="w-full h-full justify-center items-center gap-2.5 inline-flex">
                    <div className="relative w-full min-h-[60px] bg-white rounded-[10px]  border border-indigo-600 py-2.5">

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
                      <div className="flex items-center flex-col md:flex-row px-2  gap-2.5">
                        {/* <RePurpose removeFile={removeFile} value={blogLinks} setValue={setBlogLinks} setShowRepourposeError={setShowRepourposeError} /> */}
                        {
                          showFileUploadUI == true && blogLinks.length == 0 ?
                            <></>
                            :
                            <RePurpose allInputs={inputData} setAllInput={setInputData} removeFile={removeSelectedFile} value={blogLinks} setValue={setBlogLinks} setShowRepourposeError={setShowRepourposeError} />

                        }

                        {showFileUploadUI != true &&

                          <Tooltip content={`Select file formats like PDF, DOCX, TXT (size <${REPURPOSE_MAX_SIZE_MB}MB)`} direction='top' className='max-w-[100px] mt-4'>

                            <button onClick={
                              () => {
                                setShowFileUploadUI(true);
                                addToFunctionStack(() => { setShowFileUploadUI(false) })
                              }
                            }  className="w-48 h-10 px-4 py-2.5 rounded-lg border border-indigo-300 justify-center items-center gap-2 inline-flex">
                                <div className="text-indigo-600 text-sm font-medium">Upload a </div>
                                <div className="justify-center items-center gap-1 flex">
                                  <img className="w-5 h-5" src="./icons/pdficon.svg" />
                                  <img className="w-5 h-5" src="./icons/texticon.png" />
                                  <img className="w-5 h-5" src="./icons/wordicon.png" />
                                </div>
                              </button>
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
                            setStateOfGenerate((prev) => {
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
                  <div className="w-full h-5 lg:flex-row flex-col justify-start items-center gap-3 inline-flex">
                    <div className="grow shrink basis-0 opacity-70 text-gray-600 text-sm font-normal text-left">Lille will search the web</div>
                    <div className="opacity-70"><span className="text-zinc-500 text-sm font-normal text-right">Max. 7MB size. If you have more than 7MB</span><span className="text-gray-500 text-sm font-normal"> </span><span className="text-blue-500 text-sm font-normal">Click here</span></div>
                  </div>
                  {
                    (stateOfGenerate.url != null && stateOfGenerate.file != null) || (stateOfGenerate.url != null && stateOfGenerate.keyword != null) || (stateOfGenerate.file != null && stateOfGenerate.keyword != null) ?
                      <div className="w-full h-6 justify-center items-center gap-2.5 inline-flex">
                        {(stateOfGenerate.url != null) && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-800">Keywords from URL:</span>
                            {stateOfGenerate.url === STATESOFKEYWORDS.LOADING ? <ReactLoading round={true} color={"#2563EB"} height={20} width={20} /> : <CheckCircleIcon className="h-5 w-5 text-green-500" />}
                          </div>
                        )}
                        {(stateOfGenerate.keyword != null) && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-800">Keywords from Keyword:</span>
                            {stateOfGenerate.keyword === STATESOFKEYWORDS.LOADING ? <ReactLoading round={true} height={20} color={"#2563EB"} width={20} /> : <CheckCircleIcon className="h-5 w-5 text-green-500" />}
                          </div>
                        )}
                        {(stateOfGenerate.file != null) && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-800">Keywords from File:</span>
                            {stateOfGenerate.file === STATESOFKEYWORDS.LOADING ? <ReactLoading round={true} height={20} color={"#2563EB"} width={20} /> : <CheckCircleIcon className="h-5 w-5 text-green-500" />}
                          </div>
                        )}
                      </div>
                      : null
                  }

                  <div className='flex items-center flex-col mt-2'>
                    {keywordsOFBlogs.length > 0 && <div className="flex items-center gap-1.5" >
                      <h4>Select at least 3 keywords to regenerate blog </h4> <Tooltip content="Select keywords as per your choice to add focus, URLs / Files containing the selected keywords will be used to recreate a high ranking SEO blog." direction='top' className='max-w-[100px]'>
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
                  <button className="h-14 px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg shadow justify-center items-center gap-2.5 inline-flex hover:from-indigo-700 hover:to-violet-700 focus:shadow-outline-indigo"
                    onClick={
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
                        :
                        <>
                          {keywordsOFBlogs.length > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-white">Regenerate Blog</span>
                            </div>
                          ) : (
                            <>
                              <div className="text-white text-base font-medium leading-7">
                                Generate your 1st draft for the article,{" "}
                              </div>
                              <div className="justify-center items-center gap-2 flex">
                                <div className="text-white">
                                  <FaFacebook className="h-5 w-5 mr-1 lg:mr-3" />
                                </div>
                                <div className="text-white">
                                  <FaLinkedin className="h-5 w-5 mr-1 lg:mr-3" />
                                </div>
                                <div className="text-white">
                                  <FaTwitter className="h-5 w-5 mr-1 lg:mr-3" />
                                </div>
                                <div className="text-white">
                                  <ArrowLongRightIcon className="h-5 w-5" />
                                </div>
                              </div>
                            </>
                          )}

                        </>
                    }
                  </button>

                  {/* <button className="cta-invert rounded-[10px] mt-2 lg:mt-0 w-full  items-center  flex flex-row bg-indigo-600" 
                  >
                    
                        <>
                          <div>
                            <span className="w-full">Generate 1<sup>st</sup> Drafts for Articles <span className='flex flex-row w-full items-center justify-center'> 
                     
                            </span></span>
                          </div>
                        </>
                    }

                  </button> */}
                </div>
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
  const buttonHeightRef = useRef(null);
  const [buttonHeight, setButtonHeight] = useState(0);
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
  useEffect(() => {
    if (buttonHeightRef.current) {
      setButtonHeight(buttonHeightRef.current.clientHeight);
    }
  }
    , [buttonHeightRef.current])

  return (
    <div className="mt-10 flex flex-col lg:flex-row  items-center h-full justify-center gap-x-6 w-[100%] rounded-lg  min-h-[60px] py-2.5" style={{
      height: '100%'
    }}>
      <div className={`flex-grow w-full lg:w-[65%]  flex-shrink-0 flex flex-row items-center justify-center gap-2.5 transition-all duration-500 ease-in-out rounded-[10px]`} style={{
        height: buttonHeightRef.current ? buttonHeightRef.current.clientHeight + 'px' : `100%`,
      }}>
        <input
          id="search"
          name="search"
          className="flex-grow h-full border-0 bg-white py-2.5 px-3 text-gray-900 ring-1   ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 disabled:opacity-50 rounded-[10px] min-h-[60px]"
          placeholder="Enter a topic name, keywords or  a sentence"
          type="search"
          onChange={(e) => {
            setkeyword(e.target.value);
            setKeywordInStore(e.target.value); // Update the keyword in the store
          }}
          onKeyPress={handleEnterKeyPress}
        />
      </div>
      <button
        ref={buttonHeightRef}
        className={`cta-invert rounded-[10px] mt-2 lg:mt-0 w-full lg:w-[35%]  items-center  flex flex-row bg-indigo-600 ${isDisabled ? "disabled:opacity-50" : ""}`}
        onClick={handleButtonClick}
        disabled={isDisabled}
        style={{
        }}
      >
        {/* <span> <span className='flex flex-row w-full items-center justify-center gap-1'>Generate 1st Drafts for Articles <FaFacebook className="h-5 w-5 " /> <FaTwitter className="h-5 w-5" /> <FaLinkedin className="h-5 w-5" /> 
        <ArrowLongRightIcon className="h-5 w-5" />
        </span></span> */}
        <span className="w-full">Generate 1<sup>st</sup> Drafts for Articles <span className='flex flex-row w-full items-center justify-center'><FaFacebook className="h-5 w-5 mr-1 lg:mr-3" /> <FaTwitter className="h-5 w-5 mr-1 lg:mr-3" /> <FaLinkedin className="h-5 w-5 mr-1 lg:mr-3" />
          <ArrowLongRightIcon className="h-5 w-5" />
        </span></span>
      </button>
    </div>

  );
};

export const FloatingBalls = ( { className }: { className?: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="51" height="51" viewBox="0 0 51 51" fill="none" className={className}>
    <g filter="url(#filter0_d_2158_42436)">
      <circle cx="25.8967" cy="21.3916" r="15.07" transform="rotate(-63.5145 25.8967 21.3916)" fill="url(#paint0_linear_2158_42436)"/>
    </g>
    <defs>
      <filter id="filter0_d_2158_42436" x="0.824219" y="0.318359" width="50.1445" height="50.1465" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="5"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.925 0 0 0 0 0.635938 0 0 0 0 0.669549 0 0 0 0.38 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2158_42436"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2158_42436" result="shape"/>
      </filter>
      <linearGradient id="paint0_linear_2158_42436" x1="40.0358" y1="4.03629" x2="21.6639" y2="35.8573" gradientUnits="userSpaceOnUse">
        <stop stop-color="#4163FF"/>
        <stop offset="1" stop-color="#F9948C"/>
      </linearGradient>
    </defs>
  </svg>
  )
}