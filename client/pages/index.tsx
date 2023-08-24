/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-html-link-for-pages */
// @ts-nocheck
import { getStaticProps } from "next";
import MoblieUnAuthFooter, {
  socialLinks,
} from "@/components/LandingPage/MoblieUnAuthFooter";
import RePurpose from "@/components/LandingPage/RePurpose";
import { API_BASE_PATH, API_ROUTES } from "@/constants/apiEndpoints";
import { gql, useQuery, useSubscription } from "@apollo/client";
import Tooltip from "@/components/ui/Tooltip";
import {
  ArrowRightCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/20/solid";
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
import { STEP_COMPLETES_SUBSCRIPTION } from "../graphql/subscription/generate";
import {
  extractKeywordsAndIds,
  getDateMonthYear,
  getIdFromUniqueName,
  isMonthAfterJune,
  keywordsUniqueName,
  uploadAndExtractKeywords,
} from "../helpers/helper";
import OTPModal from "../modals/OTPModal";
import PreferencesModal from "../modals/PreferencesModal";
import useStore, { useClientUserStore, useFunctionStore } from "../store/store";
import { Tab } from "@headlessui/react";
import ReactLoading from "react-loading";
import TextTransition, { presets } from "react-text-transition";
import {
  ArrowLongRightIcon,
  ArrowLongUpIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  DocumentIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { checkFileFormatAndSize } from "@/components/DashboardInsights";
import { TotalTImeSaved } from "@/modals/TotalTImeSaved";
import DragAndDropFiles, {
  REPURPOSE_MAX_SIZE_MB,
} from "@/components/ui/DragAndDropFiles";
import { maxFileSize } from "@/helpers/utils";
import {
  useBlogLinkStore,
  useFileUploadStore,
  useGenerateState,
  useRepurposeFileStore,
  useSideBarChangeFunctions,
  useTotalSavedTimeStore,
} from "@/store/appState";
// import { FacebookIcon, LinkedinIcon, TwitterIcon } from "react-share";
import { FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";
import { TextTransitionEffect } from "@/components/ui/TextTransitionEffect";
import { Chip, FileChipIcon, FileUploadCard } from "@/components/ui/Chip";
import { InputData } from "@/types/type";
import {
  newGenerateApi,
  processKeywords,
  randomNumberBetween20And50,
  uppercaseFirstChar,
} from "@/store/appHelpers";
import { extractKeywordsFromKeywords } from "@/helpers/apiMethodsHelpers";
import { TYPES_OF_GENERATE } from "@/store/appContants";
import GoogleDriveModal from "@/modals/GoogleDriveModal";
import { StepCompleteData } from "@/store/types";
import GenerateLoadingModal from "@/modals/GenerateLoadingModal";

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

const TEXTS2 = ["Writing", "Research", "Knowledge"];

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

export default function Home({ payment, randomLiveUsersCount }) {
  const [getUserIdForSubs, setGetUserIdForSubs] = useState('');
  const [getTempIdForSubs, setGetTempIdForSubs] = useState('');
  const [getTokenForSubs, setGetTokenForSubs] = useState('');
  const [userAbleUserIDForSubs, setUserAbleUserIDForSubs] = useState('');
  const [getToken, setGetToken] = useState('');
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
  useEffect(() => {
    if (typeof window !== "undefined") {
      const tokenFromLocalStorage = localStorage.getItem("token");
      const userIdFromLocalStorage = localStorage.getItem("userId");
      const tempIdFromLocalStorage = localStorage.getItem("tempId");
      setGetTokenForSubs(tokenFromLocalStorage);
      setGetToken(tokenFromLocalStorage);
      setGetUserIdForSubs(userIdFromLocalStorage);
      setGetTempIdForSubs(tempIdFromLocalStorage);
      const userAbleUserID = tokenFromLocalStorage ? userIdFromLocalStorage : tempIdFromLocalStorage;
      setUserAbleUserIDForSubs(userAbleUserID);
      console.log(getUserIdForSubs, getTempIdForSubs, getTokenForSubs, userAbleUserIDForSubs, 'FROM USER');
    }
  }, [subsError]);

  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const updateAuthentication = useStore((state) => state.updateAuthentication);
  // check if url container ?payment=true
  const [isPayment, setIsPayment] = useState(false);
  const blogLinks = useBlogLinkStore((state) => state.blogLinks);
  const [keywordsOFBlogs, setkeywordsOfBlogs] = useState([]);
  const [articleIds, setArticleIds] = useState([]);
  const setBlogLinks = useBlogLinkStore((state) => state.setBlogLinks);
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const { removeBlogLink } = useBlogLinkStore();
  const [repurposeTones, setRepurposeTones] = useState(newTones);
  const [showFileUploadUI, setShowFileUploadUI] = useState(false);
  const addToFunctionStack = useFunctionStore((state) => state.addToStack);
  const [stateOfGenerate, setStateOfGenerate] = useState({
    url: null,
    file: null,
    keyword: null,
  });
  const { updateTime } = useGenerateState();
  const [inputData, setInputData] = useState<InputData>({});
  const [showLoadingInfo, setShowLoadingInfo] = useState(false);
  const selectedFiles = useRepurposeFileStore((state) => state.selectedFiles);
  const removeSelectedFile = useRepurposeFileStore(
    (state) => state.removeSelectedFile
  );
  const setSelectedFiles = useRepurposeFileStore(
    (state) => state.setSelectedFiles
  );
  const [inputMouseIn, setInputMouseIn] = useState(false);
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
  // useEffect(() => {
  //   addFunction(handleGenerateReset);
  // }, [blogLinks]);
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
  };
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
  const [showHoveUpgradeNow, setShowHoveUpgradeNow] = useState(false);
  const [loadingForFilesKeywords, setLoadingForFilesKeywords] = useState(false);
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

  function handleRepourpose() {
    setLoadingForKeywords(true);
    // key all keywords which are selected
    const keywords = keywordsOFBlogs
      .filter((keyword) => keyword.selected)
      .map((keyword) => keyword.text);
    if (keywords.length === 0) {
      toast.error("Please select atleast some keywords");
      return;
    }
    setShowRepourposeError(false);
    const options = {
      tones:
        repurposeTones
          .filter((tone) => tone.selected)
          .map((tone) => tone.text) || [],
      keywords: keywords || [],
      article_ids: [...new Set(articleIds)],
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
      const selectedFilesForPayload = selectedFiles.map(
        (fileObject) => fileObject.file
      );
      console.log("selectedFilesForPayload", selectedFilesForPayload);
      uploadAndExtractKeywords(selectedFilesForPayload)
        .then((response) => {
          console.log("Response:", response);
          // Handle the response here
          if (
            response?.response?.data &&
            response?.response?.data?.type === "ERROR"
          ) {
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
            };
          });
          setShowUserLoadingModal({ show: false });
          setLoadingForKeywords(false); // Set loading state back to false on successful response
        })
        .catch((error) => {
          console.log("ERROR");
          console.log(error);
          // Handle errors here
          setStateOfGenerate((prev) => {
            return {
              ...prev,
              file: STATESOFKEYWORDS.LOADED,
            };
          });
          setShowUserLoadingModal({ show: false });
          setLoadingForKeywords(false); // Set loading state back to false on error
        })
        .finally(() => {
          setStateOfGenerate((prev) => {
            return { ...prev, file: STATESOFKEYWORDS.LOADED };
          });
        });
    } else {
      toast.error("Please select a file");
      setLoadingForKeywords(false); // Set loading state back to false if no file is selected
    }
  }
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
    if (keyword == "") {
      setDisableGenerateButton(true);
    } else {
      setDisableGenerateButton(false);
    }
  }
  const countByType = blogLinks.reduce(
    (acc, link) => {
      if (link.type === "file") {
        acc.lengthOFiles++;
      } else if (link.type === "url") {
        acc.lengthOfUrls++;
      } else if (link.type === "keyword") {
        acc.keyword++;
      }
      return acc;
    },
    { lengthOFiles: 0, lengthOfUrls: 0 }
  );

  function handleGenerateClick() {
    console.log(blogLinks);
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
    if (countByType.file == 0 && countByType.url == 0 && keyword == "") {
      return;
    }
    var typeKeys = Object.keys(countByType);

    const prevStateOfGenerate = { ...stateOfGenerate };
    typeKeys.forEach((type) => {
      prevStateOfGenerate[type] =
        countByType[type] === 0 ? null : STATESOFKEYWORDS.LOADING;
    });
    console.log("prevStateOfGenerate");
    console.log(prevStateOfGenerate);
    setStateOfGenerate(prevStateOfGenerate);
    console.log("countByType");
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

    // if (countByType.url > 0) {
    //   uploadExtractKeywords();
    // }
    // if (countByType.keyword > 0) {
    //   uploadExtractKeywordsFromKeywords();
    // }
    // if (countByType.file > 0) {
    //   uploadFilesForKeywords();
    // }
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
    const files = selectedFiles.map((fileObject) => fileObject.file);
    console.log(blogLinks, 'bloglinks');
    const urls = blogLinks.filter((link) => link.type === "url").map((link) => link.value);
    console.log(urls);
    setShowingGenerateLoading(true);
    newGenerateApi(token, tones, keywordForPayload, userId, files, urls).then(
      (response) => {
        if (response.type == 'ERROR') {
          toast.error(response.message);
          setShowingGenerateLoading(false);
          return;
        }
        const { data } = response;
        const _id = data._id;
        const responseTime = data.respTime;
        const pyTime = data.pythonRespTime;
        updateTime(responseTime, pyTime, responseTime);
        setTimeout(() => {
          router.push({
            pathname: `/dashboard/${_id}`,
            query: { type: TYPES_OF_GENERATE.REPURPOSE },
          }).then(() => {
            setShowingGenerateLoading(false);
          });
        }, 2000)
      }
    );
  }

  function uploadExtractKeywordsFromKeywords() {
    setShowUserLoadingModal({ show: true });
    const keywords = blogLinks
      .filter((link) => link.type === "keyword")
      .map((link) => link.value);
    console.log(keywords);
    // const data =await extractKeywordsFromKeywords(keywords[keywords.length - 1]);
    // console.log(data);
    extractKeywordsFromKeywords(keywords[keywords.length - 1])
      .then((data) => {
        if (data.type === "ERROR") {
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
          };
        });
        setShowUserLoadingModal({ show: false });
        setLoadingForKeywords(false);
      })
      .catch((err) => {
        console.log(err);

        toast.error(err.message);
        setShowUserLoadingModal({ show: false });
        setLoadingForKeywords(false);
        setStateOfGenerate((prev) => {
          return {
            ...prev,
            keyword: STATESOFKEYWORDS.LOADED,
          };
        });
      })
      .finally(() => {
        setStateOfGenerate((prev) => {
          return {
            ...prev,
            keyword: STATESOFKEYWORDS.LOADED,
          };
        });
      });
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
      urls: blogLinks
        .filter((url) => url.type === "url")
        .map((url) => url.value),
      userId: getToken ? getUserId : getTempId,
    });
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };
    const URL = API_BASE_PATH + API_ROUTES.EXTRACT_KEYWORDS;
    fetch(URL, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (result.type === "ERROR") {
          // const errorMessage = result.message + result?.unprocessedUrls && result.unprocessedUrls.length > 0 && (' Unresovled URLs ' + result.unprocessedUrls.join(', '));
          let _errorMessage = result.message;
          if (result?.unprocessedUrls && result.unprocessedUrls.length > 0) {
            _errorMessage +=
              " Unresovled URLs are " + result.unprocessedUrls.join(", ");
          }
          const errorMessage = _errorMessage;
          toast.error(errorMessage);
          return;
        }
        const doesUnprocessedUrlsExist =
          result?.unprocessedUrls && result.unprocessedUrls.length > 0;
        if (doesUnprocessedUrlsExist) {
          toast.warn(
            `Success but we could not resolve ${result.unprocessedUrls.length > 1 ? "these URLs" : "this URL"
            } : ` + result.unprocessedUrls.join(", ")
          );
        }
        const { keywords, keywordIdMap, articleIds } =
          extractKeywordsAndIds(result);
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
          };
        });
      })
      .catch((error) => {
        console.log("error", error);
        setStateOfGenerate((prev) => {
          return {
            ...prev,
            url: STATESOFKEYWORDS.LOADED,
          };
        });
      })
      .finally(() => {
        setStateOfGenerate((prev) => {
          return {
            ...prev,
            url: STATESOFKEYWORDS.LOADED,
          };
        });
        setShowUserLoadingModal({ show: false });
      });
  }



  const [keyword, setkeyword] = useState("");
  const [disableGenerateButton, setDisableGenerateButton] = useState(false);
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
        };
        s;
        fetch(SAVE_USER_SUPPORT_URL, requestOptions)
          .then((response) => { })
          .catch((error) => { });
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

  useEffect(() => {
    validateGenerateButtonStatus();
  }, [blogLinks, keyword])
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
  const [activeTab, setActiveTab] = useState(0);
  const { showFileStatus, uploadedFilesData } = useFileUploadStore();
  const [showTabsInfo, setShowTabsInfo] = useState({
    web: false,
    urls: true,
    documents: true
  });
  console.log(blogLinks);
  const filesNames = blogLinks
    .filter((link) => link.type === "file")
    .map((link) => {
      return {
        id: link.id,
        name: link.value,
      };
    });
  console.log(filesNames);
  const tabs = [
    {
      id: 0,
      label: "Web",
      content: <></>,
    },
    {
      id: 1,
      label: "URLs",
      upperContent: (
        <>
          {
            showTabsInfo.urls && (<div className="w-fit h-7 px-2.5 py-1.5 my-2 bg-orange-100 rounded backdrop-blur-2xl justify-center items-center gap-2.5 inline-flex">
            <div className="text-yellow-600 text-xs font-medium leading-none">
              We take a little longer to generate draft for URLs. Please be patient.
            </div>
            <XCircleIcon className="w-4 h-4 text-gray-600 cursor-pointer" onClick={() => setShowTabsInfo(prev => ({ ...prev, urls: false }))} />
          </div>
            )
          }
        </>
      ),
      content: (
        <>
          <div className=" w-full text-left mt-2 flex flex-col items-start justify-center">
            <h1 className="text-left">Paste URL</h1>
          </div>
              <RePurpose
                placeholder="Paste URLS (comma between)"
                allInputs={inputData}
                setAllInput={setInputData}
                removeFile={removeSelectedFile}
                value={blogLinks}
                setValue={setBlogLinks}
                setShowRepourposeError={setShowRepourposeError}
              />
        </>
      ),
    },
    {
      id: 2,
      label: "Documents",
      upperContent: (
        <>
          {
            showTabsInfo.documents && (<div className="w-fit h-7 px-2.5 py-1.5 my-2 bg-orange-100 rounded backdrop-blur-2xl justify-center items-center gap-2.5 inline-flex">
            <div className="text-yellow-600 text-xs font-medium leading-none">
              We take a little longer to generate draft for Documents. Please be patient.
            </div>
            <XCircleIcon className="w-4 h-4 text-gray-600 cursor-pointer" onClick={() => setShowTabsInfo(prev => ({ ...prev, documents: false }))} />
          </div>
            )
          }
        </>
      ),
      content: (
        <>
          <div className="flex items-center mt-2  scrollbar-thumb-indigo-600 scrollbar-corner-inherit rounded-full scroll-m-1 py-2 scrollbar-thin scrollbar-track-gray-100 overflow-x-scroll gap-2">
            {/* <FileChipIcon fileName="index.tsx" fileSize="5mb" /> */}
            {filesNames.map((fileName, index) => {
              return (
                <FileChipIcon key={index} fileName={fileName.name} fileSize="5mb" onCrossClick={
                  () => { removeSelectedFileFromBothStores(fileName.id) }
                } />
              );
            })}
          </div>
          <DragAndDropFiles blogLinks={blogLinks} setBlogLinks={setBlogLinks} onClickHereButtonClick={() => setShowGDriveModal(true)}/>
          
          {
            showFileStatus && (
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
        .then((response) => { })
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
        <GoogleDriveModal
          showModal={showGDriveModal}
          setShowModal={setShowGDriveModal}
          meeData={meeData}
        />
        {showingGenerateLoading && (
          <GenerateLoadingModal
            resetForm={handleGenerateReset}
            showGenerateLoadingModal={showingGenerateLoading}
            setShowGenerateLoadingModal={setShowingGenerateLoading}
            stepStatus={subsData?.stepCompletes.step}
            showBackButton={countByType.lengthOFiles > 0 || countByType.lengthOfUrls > 0}
          />
        )}
        <div
          className={`maincontainer relative md:px-6 pt-5 lg:px-8 ${!isAuthenticated && "md:min-h-screen"
            }`}
        >
          <FloatingBalls className="hidden absolute top-[4%] rotate-45 md:block" />
          <FloatingBalls className="hidden absolute top-[2%] w-10 right-[2%] md:block" />
          <FloatingBalls className="hidden absolute top-[9%] right-0 md:block" />
          <FloatingBalls className="hidden absolute top-[10%] w-8 rotate-90 left-[3%] md:block" />

          <div
            className="w-full lg:w-[51%] h-full "
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
            className="w-full lg:w-[51%] h-full "
            style={{
              transform: "rotate(180deg)",
              display: isAuthenticated ? "none" : "block,", //      transform: scaleX(-1);
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
              className={`mx-auto max-w-5xl text-center h-screen  ${isAuthenticated ? "" : "lg:min-h-screen"
                } flex items-center justify-center `}
              style={{
                height: "100%",
              }}
            >
              <div
                className={`mt-[10%] ${isAuthenticated
                  ? keywordsOFBlogs.length == 0 && "lg:mt-[10%]"
                  : keywordsOFBlogs.length == 0 && "lg:mt-[-10%]"
                  }`}
              >
                <RotatingText/> 
                <div
                  className="w-full lg:min-w-[850px] lg:max-w-[850px] h-full opacity-90 transition-all ease-out shadow border border-white backdrop-blur-[20px] flex-col justify-center mt-10 items-center gap-[18px] inline-flex rounded-[10px] p-8"
                  style={{
                    background: "rgba(255, 255, 255, 0.5)",
                    outline: 'none !important' 
                  }}
                >
                  <h1
                    className="text-center text-slate-800 text-xl font-bold leading-relaxed">Select a source</h1>
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
                            className={`w-24 h-8 px-2.5 py-1 border-b border-indigo-600 ring-0  focus:ring-0  justify-center items-center gap-2.5 inline-flex text-base font-medium text-gray-800 ${activeTab === tab.id ? "border-b-2 border-indigo-600 text-gray-800" : "text-gray-600 border-none"}`}>
                            {tab.label}
                          </Tab>
                        ))}
                      </Tab.List>
                      <Tab.Panels>
                        {tabs.map((tab) => (
                          <Tab.Panel
                            key={tab.id}
                            className={`
                            ${activeTab === tab.id ? "block" : "hidden"} p-4`}
                          >
                            {tab.upperContent ? tab.upperContent : null}
                            <div className="w-full h-full justify-center items-center gap-2.5 inline-flex">
                              <div className={`relative w-full min-h-[60px] bg-white rounded-[10px]  border py-2.5 ${keyword.length > 100 ? 'border-red-600' : 'border-indigo-600'} `}>
                                <div className={`flex items-center flex-col md:flex-row px-2  gap-2.5 relative outline-none active:outline-none rounded-lg`}>
                                  <KeywordInput
                                    keyword={keyword}
                                    setKeyword={setkeyword}
                                    placeholder="Give me a writing Topic"
                                    maxLength={100}
                                  />
                                </div>
                              </div>
                              {
                                keyword.length > 100 && (
                                  <div className="absolute bottom-0 left-4 text-red-600 text-xs font-medium leading-none">
                                    {keyword.length}/100
                                  </div>
                                )
                              }
                            </div>
                            {tab.content}
                          </Tab.Panel>
                        ))}
                      </Tab.Panels>
                    </Tab.Group>
                  </div>

                  <button
                    disabled={disableGenerateButton}
                    className="h-14 px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg shadow justify-center items-center gap-2.5 inline-flex hover:from-indigo-700 hover:to-violet-700 focus:shadow-outline-indigo disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleGenerateClick}
                  >
                    <>
                      <div className="text-white text-base font-medium leading-7">
                        Generate draft{" "}
                      </div>
                    </>
                  </button>
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
  }, []);

  return (
    <div
      className="mt-10 flex flex-col lg:flex-row  items-center h-full justify-center gap-x-6 w-[100%] rounded-lg  min-h-[60px] py-2.5"
      style={{
        height: "100%",
      }}
    >
      <div
        className={`flex-grow w-full lg:w-[65%]  flex-shrink-0 flex flex-row items-center justify-center gap-2.5 transition-all duration-500 ease-in-out rounded-[10px]`}
        style={{
          height: buttonHeightRef.current
            ? buttonHeightRef.current.clientHeight + "px"
            : `100%`,
        }}
      >
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
        className={`cta-invert rounded-[10px] mt-2 lg:mt-0 w-full lg:w-[35%]  items-center  flex flex-row bg-indigo-600 ${isDisabled ? "disabled:opacity-50" : ""
          }`}
        onClick={handleButtonClick}
        disabled={isDisabled}
        style={{}}
      >
        {/* <span> <span className='flex flex-row w-full items-center justify-center gap-1'>Generate 1st Drafts for Articles <FaFacebook className="h-5 w-5 " /> <FaTwitter className="h-5 w-5" /> <FaLinkedin className="h-5 w-5" /> 
        <ArrowLongRightIcon className="h-5 w-5" />
        </span></span> */}
        <span className="w-full">
          Generate 1<sup>st</sup> Drafts for Articles{" "}
          <span className="flex flex-row w-full items-center justify-center">
            <FaFacebook className="h-5 w-5 mr-1 lg:mr-3" />{" "}
            <FaTwitter className="h-5 w-5 mr-1 lg:mr-3" />{" "}
            <FaLinkedin className="h-5 w-5 mr-1 lg:mr-3" />
            <ArrowLongRightIcon className="h-5 w-5" />
          </span>
        </span>
      </button>
    </div>
  );
};

export const FloatingBalls = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="51"
      height="51"
      viewBox="0 0 51 51"
      fill="none"
      className={className}
    >
      <g filter="url(#filter0_d_2158_42436)">
        <circle
          cx="25.8967"
          cy="21.3916"
          r="15.07"
          transform="rotate(-63.5145 25.8967 21.3916)"
          fill="url(#paint0_linear_2158_42436)"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_2158_42436"
          x="0.824219"
          y="0.318359"
          width="50.1445"
          height="50.1465"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.925 0 0 0 0 0.635938 0 0 0 0 0.669549 0 0 0 0.38 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_2158_42436"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_2158_42436"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_2158_42436"
          x1="40.0358"
          y1="4.03629"
          x2="21.6639"
          y2="35.8573"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#4163FF" />
          <stop offset="1" stop-color="#F9948C" />
        </linearGradient>
      </defs>
    </svg>
  );
};


type KeywordInputProps = {
  maxLength: number;
  placeholder: string;
  keyword: string;
  setKeyword: React.Dispatch<React.SetStateAction<string>>;
};

const KeywordInput = ({ maxLength, placeholder, keyword, setKeyword }: KeywordInputProps) => {
  return (
    <input
      type="text"
      maxLength={maxLength}
      placeholder={placeholder}
      className="w-full h-full outline-transparent bg-transparent border-transparent focus:border-transparent focus:ring-0"
      value={keyword}
      onChange={(e) => {
        const text = e.target.value;
        console.log(text.length);
        setKeyword(text);
      }}
    />
  );
};


const RotatingText = React.memo(()=> {
  return (
    <div className="relative flex text-3xl items-center  justify-center font-bold tracking-tight text-gray-900 sm:text-5xl flex-wrap custom-spacing lg:min-w-[900px]">
      Lille is your Content <TextTransitionEffect text={TEXTS2} />
      Co-Pilot
      <div className="absolute right-0 md:right-[-10%]">
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
              <stop
                offset="1"
                stop-color="white"
                stop-opacity="0"
              />
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
              <stop
                offset="1"
                stop-color="white"
                stop-opacity="0"
              />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}) 

RotatingText.displayName = 'RotatingText';