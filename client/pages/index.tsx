import Footer from "@/components/Footer";
import { getCurrentDomain } from "@/helpers/helper";
import { gql, useQuery } from "@apollo/client";
import { ArrowRightCircleIcon } from "@heroicons/react/20/solid";
import { loadStripe } from "@stripe/stripe-js";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import Marquee from "react-fast-marquee";
import Modal from "react-modal";
import TextTransition, { presets } from "react-text-transition";
import { ToastContainer, toast } from "react-toastify";
import Layout from "../components/Layout";
import LoaderPlane from "../components/LoaderPlane";
import TrialEndedModal from "../components/TrialEndedModal";
import { meeAPI } from "../graphql/querys/mee";
import PreferencesModal from "../modals/PreferencesModal";
import useStore from "../store/store";

// @ts-ignore
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const TEXTS = [
  "Newsletters",
  "Linkedin Post ",
  "Twitter Thread",
  "Blog Posts",
  "Medium Article",
  "Reddit Article",
];

export default function Home() {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const updateAuthentication = useStore((state) => state.updateAuthentication);
  // check if url container ?payment=true
  const [isPayment, setIsPayment] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [contributinoModalLoader, setContributionModalLoader] = useState(false);
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
    if (router.query.payment) {
      setIsPayment(true);
      const timeout = setTimeout(() => {
        setIsPayment(false);
        // remove ?payment=true from zurl
        router.push("/", undefined, { shallow: true });
      }, 5000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, []);



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

  const handleEnterKeyPress = (e: { key: string }) => {
    if (e.key === "Enter") {
      setKeywordInStore(keyword);
      router.push({
        pathname: "/dashboard",
        query: { topic: keyword },
      });
    }
  };

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
      <div className="cursor-pointer flex items-center  justify-between gap-x-2 px-4 py-2 rounded-md bg-gray-100 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
        <button className="cursor-pointer text-sm font-medium text-gray-900 cursor-auto">
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

  useEffect(() => {
    console.log(meeData);
    if (meeData?.me.prefFilled === false) {
      setPFModal(true);
    }
    if (meeData) {
      const credits = meeData?.me?.credits;
      if (credits <= 15 || meeData?.me?.publishCount === 1) {
        setShowContributionModal(true);
      }

    }
  }, [meeData]);

  const [multiplier, setMultiplier] = useState(1);
  const BASE_PRICE = 500;
  async function handleCheckout() {
    setContributionModalLoader(true);
    const stripe: any = await stripePromise;

    const res = await fetch('https://maverick.lille.ai/stripe/api/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
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
          "success_url": getCurrentDomain() + "?payment=true",
          "cancel_url": getCurrentDomain() + "/cancel"
        }
      ), // Multiply by the multiplier (e.g., 500 * 1 = $5, 500 * 2 = $10, etc.)
    });

    const session = await res.json();
    console.log(session);
    
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    })
    

  }
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
      {
        isPayment && <Confetti
          width={windowWidth}
          recycle={false}
          numberOfPieces={200}
        />
      }
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
      <Layout>

        <ToastContainer />
        {pfmodal && (
          <PreferencesModal
            pfmodal={pfmodal}
            setPFModal={setPFModal}
            getToken={getToken}
          />
        )}

        {!meeData?.me?.isSubscribed && meeData?.me?.credits === 0 && (
          <TrialEndedModal setTrailModal={() => { }} topic={null} />
        )}
        <div className={`relative px-6 pt-5 lg:px-8 ${!isAuthenticated && 'md:min-h-screen'}`}>
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
          <div className="mx-auto max-w-3xl flex py-32 sm:py-30 lg:py-20">
            <div className="text-center">
              <div className="fixed z-10 inset-0 overflow-y-auto hidden not-responsive-message">
                <div className="fixed z-10 inset-0 overflow-y-auto">
                  <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                    <div
                      className="fixed inset-0 transition-opacity"
                      aria-hidden="true"
                    >
                      <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>

                    <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                      <div>
                        <div
                          className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100"
                          onClick={() => {
                            const element = document.querySelector<HTMLElement>(
                              ".not-responsive-message"
                            );
                            if (element) {
                              element.style.display = "none";
                            }
                          }}
                        >
                          <svg
                            className="h-6 w-6 text-red-600"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </div>
                        <div className="mt-3 text-center sm:mt-5">
                          <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Please try on desktop, mobile version coming soon...
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h1 className="flex text-3xl items-center justify-center font-bold tracking-tight text-gray-900 sm:text-5xl">
                Generate{" "}
                <TextTransition springConfig={presets.wobbly}>
                  <span className="newsletter mx-4">
                    {TEXTS[index % TEXTS.length]}
                  </span>
                </TextTransition>
                with{" "}
                <span style={{ color: "var(--primary-blue)" }} className="mx-2">
                  {" "}
                  Lille
                </span>
              </h1>
              {/* <p className="mt-6 text-lg leading-8 text-gray-600">
                Streamline your content creation process with our website that
                generates blog posts from URLs or uploaded files, providing
                concise and informative content in no time
              </p> */}
              <div className="p-4 mt-4">Try some of our trending topics</div>
              {!loading ? (
                <div
                  className="grid grid-cols-3 gap-4 py-4"
                >
                  {updatedArr}
                </div>
              ) : (
                <div style={{ margin: "0 auto" }}>
                  <LoaderPlane />
                </div>
              )}
              <div
                className={`
                mt-10 flex items-center justify-center gap-x-6 
                w-[100%] rounded-md`}
              >

                <input
                  id="search"
                  name="search"
                  className="block w-full rounded-md border-0 bg-white py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                  placeholder="Search"
                  type="search"
                  onChange={(e) => {
                    setkeyword(e.target.value);
                    setKeywordInStore(e.target.value); // Update the keyword in the store
                  }}
                  onKeyPress={handleEnterKeyPress}
                />
                <Link
                  legacyBehavior
                  as={"/dashboard"}
                  href={{
                    pathname: "/dashboard",
                    query: { topic: keyword },
                  }}
                >
                  <a className="cta-invert">Generate</a>
                </Link>


              </div>
            </div>
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
        {!isAuthenticated && <Footer />}
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
