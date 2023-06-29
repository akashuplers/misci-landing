/* eslint-disable @next/next/no-html-link-for-pages */
// @ts-nocheck
import { API_BASE_PATH } from "@/constants/apiEndpoints";
import { gql, useQuery } from "@apollo/client";
import { ArrowRightCircleIcon } from "@heroicons/react/20/solid";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import Marquee from "react-fast-marquee";
import TextTransition, { presets } from "react-text-transition";
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
          <TrialEndedModal setTrailModal={() => {}} topic={null} />
        )}
        <div
          className={`relative px-6 pt-5 lg:px-8 ${
            !isAuthenticated && "md:min-h-screen"
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
          <div className="mx-auto max-w-screen-xl flex flex-col pt-32 lg:py-20">
            <div className="mx-auto max-w-3xl text-center min-h-screen ">
              <div className="flex text-3xl items-center justify-center font-bold tracking-tight text-gray-900 sm:text-5xl flex-wrap custom-spacing">
                Generate & Optimize{" "}
                <TextTransition
                  springConfig={presets.gentle}
                  style={{
                    margin: "0",
                  }}
                >
                  <span className="newsletter">
                    {TEXTS[index % TEXTS.length]}
                  </span>
                </TextTransition>
                using{" "}
                <span style={{ color: "var(--primary-blue)" }} className="">
                  <TextTransition springConfig={presets.gentle}>
                    <span className="newsletter">
                      {TEXTS2[index % TEXTS2.length]}
                    </span>
                  </TextTransition>
                </span>
                with Lille
              </div>
              {/* <p className="mt-6 text-lg leading-8 text-gray-600">
                Streamline your content creation process with our website that
                generates blog posts from URLs or uploaded files, providing
                concise and informative content in no time
              </p> */}
              <div className="p-4 mt-4">Try some of our trending topics</div>
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
      </Layout>
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
