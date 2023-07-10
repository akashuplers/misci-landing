/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-html-link-for-pages */
// @ts-nocheck
import MoblieUnAuthFooter from "@/components/LandingPage/MoblieUnAuthFooter";
import RePurpose from "@/components/LandingPage/RePurpose";
import { API_BASE_PATH, API_ROUTES } from "@/constants/apiEndpoints";
import { gql, useQuery } from "@apollo/client";
import { ArrowRightCircleIcon, InformationCircleIcon } from "@heroicons/react/20/solid";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import Marquee from "react-fast-marquee";
import { ToastContainer, toast } from "react-toastify";
import LandingPage from "../components/LandingPage/LandingPage";
import Layout from "../components/Layout";
import LoaderPlane from "../components/LoaderPlane";
import TrialEndedModal from "../components/TrialEndedModal";
import { meeAPI } from "../graphql/querys/mee";
import { getDateMonthYear, isMonthAfterJune } from "../helpers/helper";
import OTPModal from "../modals/OTPModal";
import PreferencesModal from "../modals/PreferencesModal";
import useStore from "../store/store";
import { Tab } from "@headlessui/react";
import ReactLoading from "react-loading";

const PAYMENT_PATH = "/?payment=true";
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
export const BASE_PRICE = 100;

export default function Home() {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const updateAuthentication = useStore((state) => state.updateAuthentication);
  // check if url container ?payment=true
  const [isPayment, setIsPayment] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [contributinoModalLoader, setContributionModalLoader] = useState(false);
  const [contributionAmout, setContributionAmount] = useState(5);
  const [blogLinks, setBlogLinks] = useState([]);
  const [keywordsOFBlogs, setkeywordsOfBlogs] = useState([]);
  const handleChipClick = (index) => {
    setkeywordsOfBlogs((prevKeywords) => {
      const updatedKeywords = [...prevKeywords];
      updatedKeywords[index].selected = !updatedKeywords[index].selected;
      return updatedKeywords;
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
  function uploadExtractKeywords() {
    setLoadingForKeywords(true);
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
      "urls": blogLinks.map(url => url.value),
      "userId": getToken ? getUserId : getTempId
    });
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
  
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
    };
    const URL  = API_BASE_PATH +  API_ROUTES.EXTRACT_KEYWORDS
    fetch("https://maverick.lille.ai/quickupload/urls/extract-keywords", requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log(result);
        if (result.type === 'ERROR') {
          toast.error(result.message);
          return;
        }
        const keywordsArray = result.data[0].keywords;
  
        const updatedKeywordsArray = keywordsArray.map((keyword, index) => ({
          text: keyword,
          selected: false, // Add the selected property and set it to false initially
          id: index, // Add the id property and set it to the index value
        }));
  
        console.log(updatedKeywordsArray);
        setkeywordsOfBlogs(updatedKeywordsArray);
      })
      .catch(error => {
        console.log('error', error)
      })
      .finally(() => {
        setLoadingForKeywords(false); // Move the setLoadingForKeywords(false) inside the then block
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

  useEffect(() => {
    console.log(router);
    console.log("LOCAL STORERAGE");
    console.log(localStorage);
    /* asPath "/?payment=true" */
    if (router.asPath === PAYMENT_PATH) {
      console.log("ROUTER CHECK IF PAYMENT==TRUE");
      console.log("USER CONTRIBUTION");
      // console.log(userContribution);
      if (localStorage.getItem("userContribution") !== null) {
        var userContribution = JSON.parse(
          localStorage.getItem("userContribution") || "{}"
        );
        console.log("USER CONTRIBUTION IS NOT NULL");
        console.log(userContribution);
        // /auth/save-user-support
        const SAVE_USER_SUPPORT_URL = API_BASE_PATH + "/auth/save-user-support";
        const requestOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify(userContribution),
        };
        console.log("REQUEST OPTIONS");
        fetch(SAVE_USER_SUPPORT_URL, requestOptions)
          .then((response) => {
            console.log("RESPONSE FROM SAVE USER SUPPORT");
            console.log(response);
            console.log(response.json());
          })
          .catch((error) => {
            console.log("ERROR FROM SAVE USER SUPPORT");
            console.log(error);
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
      console.log("ROUTER CHECK IF PAYMENT==TRUE ELSE");
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
    console.log(meeData);

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
            <div className="mx-auto max-w-3xl text-center h-screen flex items-center justify-center max-h-[700px]">
              <div>
                <div className="relative flex text-3xl items-center  justify-center font-bold tracking-tight text-gray-900 sm:text-5xl flex-wrap custom-spacing">
                  Automate, <span className="text-indigo-700">Amplify,</span>{" "}
                  Achieve.
                </div>
                <div className="relative flex text-xl items-center  justify-center font-bold tracking-tight text-gray-900 sm:text-xl pt-4 flex-wrap custom-spacing">
                  Your AI-powered content partner that doesn't dream, it
                  delivers!
                </div>

                <Tab.Group>
                  <Tab.List className="p-2 mt-10 bg-slate-50 h-14 rounded--xl border border-neutral-400 text-gray-600 border-opacity-25 justify-start items-center gap-3 inline-flex rounded-xl">
                    <Tab>
                      {({ selected }) => (
                        <div className={`rounded-xl h-10 px-2 justify-center items-center gap-2 inline-flex ${selected ? 'bg-white border border-indigo-600 text-indigo-600' : 'border-none text-gray-600'}`} >
                          <span className="">
                            {" "}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke-width="1.5"
                              stroke="currentColor"
                              class="w-6 h-6 "
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
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
                        <div className={`rounded-xl h-10 justify-center items-center gap-2 px-2 inline-flex ${selected ? 'bg-white border border-indigo-600 text-indigo-600' : 'border-none text-gray-600'}`} >
                          <span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke-width="1.5"
                              stroke="currentColor"
                              class="w-6 h-6"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                              />
                            </svg>
                          </span>{" "}
                          Repurpose Blog
                        </div>
                      )}
                    </Tab>
                  </Tab.List>
                  <Tab.Panels>
                    <Tab.Panel>
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
                    <Tab.Panel>
                      <div className="w-[650px] h-full opacity-90 flex-col justify-center mt-10 items-center gap-[18px] inline-flex bg-transparent rounded-[10px]">
                        <div className="w-full h-6 justify-center items-center gap-1.5 inline-flex">
                          <div className="text-center text-slate-600 text-ase font-normal">Lille will help you to Repurpose the whole blog</div>
                          {/* <div className="w-[18px] h-[18px] relative" />
   */}
                          <InformationCircleIcon className='h-[18px] w-[18px] text-gray-600' />
                        </div>

                        <div className="relative w-full min-h-[60px] bg-white rounded-[10px] flex items-center px-2  gap-2.5">
                          <RePurpose value={blogLinks} setValue={setBlogLinks} />

                          <button className="w-[100.81px] px-2 h-10 flex justify-center items-center gap-2.5 bg-slate-50 rounded-lg border border-indigo-600"
                            onClick={uploadExtractKeywords}
                          >
                            {
                              loadingForKeywords === true ? <ReactLoading
                                width={25}
                                height={25}
                                round={true}
                                color={"#2563EB"}
                              /> : 
                            <>
                            <span className='text-indigo-500'>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="w-6 h-6"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15"
                                />
                              </svg>
                            </span>

                            <p className="justify-center items-center gap-2 inline-flex">
                              {/* <span className="text-indigo-600 text-sm font-normal">
                                Upload
                              </span> */}
                             <span className="text-indigo-600 text-sm font-normal">
                                Upload
                              </span>
                            </p>
                            </>
                            }
                          </button>
                        </div>
                        <div className='flex items-center flex-col mt-5'>
                          {keywordsOFBlogs.length > 0 && <h4>Select at least 3 keywords to regenerate blog</h4>}
                          <div className='flex flex-wrap justify-center gap-2 mt-5'>
                            {keywordsOFBlogs.length > 0 && keywordsOFBlogs.map((chip, index) => (
                              <Chip key={index} text={chip.text} handleClick={handleChipClick} index={index} selected={chip.selected} />
                            ))}

                          </div>
                        </div>
                        <button className="pl-[30px] pr-6 py-[17px] mt-5 text-white bg-indigo-600 rounded-[10px] shadow justify-center items-center gap-2.5 inline-flex">
                          <span className="text-white text-lg font-medium">
                            Generate
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="w-6 h-6"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                            />
                          </svg>
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

const Chip = ({ selected, text, handleClick, index }) => {
  return <button className={`h-8 px-[18px] py-1.5  rounded-full justify-start items-start gap-2.5 inline-flex ${selected ? "bg-indigo-700 text-white" : 'bg-gray-200 text-slate-700 '}`} onClick={() => handleClick(index)}>
    <span className=" text-sm font-normal leading-tight">{text}</span>
  </button>
};
