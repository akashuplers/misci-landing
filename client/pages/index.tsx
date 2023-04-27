import React, { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { ArrowRightCircleIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import LoaderPlane from "../components/LoaderPlane";
import { useRouter } from "next/router";
import useStore from "../store/store";
import Layout from "../components/Layout";
import { toast, ToastContainer } from "react-toastify";
import { meeAPI } from "../graphql/querys/mee";
import PreferencesModal from "../modals/PreferencesModal";

export default function Home() {
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
          {topic}
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
  }, [meeData]);

  return (
    <>
      <Layout>
        <ToastContainer />
        {pfmodal && (
          <PreferencesModal
            pfmodal={pfmodal}
            setPFModal={setPFModal}
            getToken={getToken}
          />
        )}
        <div className={`relative px-6 pt-5 lg:px-8`}>
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
          <div className="mx-auto max-w-2xl py-32 sm:py-30 lg:py-20">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Generate <span className="newsletter">Newsletter</span> with{" "}
                <span style={{ color: "#4a3afe" }}>Lille</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Streamline your content creation process with our website that
                generates blog posts from URLs or uploaded files, providing
                concise and informative content in no time
              </p>
              <div className="p-4 mt-4">Try some of our trending topics</div>
              {!loading ? (
                <div className="grid grid-cols-3 gap-4 py-4">{updatedArr}</div>
              ) : (
                <LoaderPlane />
              )}
              <div className="mt-10 flex items-center justify-center gap-x-6">
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
                  <a className="cta-invert">
                    Generate
                  </a>
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
      </Layout>
    </>
  );
}
