import {
  MISCI_STEP_COMPLETES_SUBSCRIPTION,
  STEP_COMPLETES_SUBSCRIPTION,
} from "@/graphql/subscription/generate";
import {
  generateMisci,
  regenerateNextDraft,
} from "@/helpers/apiMethodsHelpers";
import { capitalizeText, classNames, getUserToken } from "@/store/appHelpers";
import { StepCompleteData } from "@/store/types";
import { useSubscription } from "@apollo/client";
import { useRouter } from "next/router";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import Head from "next/head";
import MisciWorkSpace from "@/components/component/workspace/Misci";
import ErrorBase from "@/store/errors";
import RedirectionModal from "@/modals/RedirectionAlertModal";
export const getServerSideProps = async (context: any) => {
  console.log(context);
  console.log("server");
  const { question } = context.query;
  return {
    props: {
      question: question ? question : "How to be a good programmer?",
    },
  };
};
interface MiSciProps {
  question: string;
}
const SECONDS_TO_REDIRECT = 20;
const DEFAULT_REDIRECT_TIME = (seconds = SECONDS_TO_REDIRECT) => seconds * 1000;
const REDIRECT_TO_PAGE = "/misci";
const MiSciArticle = ({ question }: MiSciProps) => {
  const [getUserIdForSubs, setGetUserIdForSubs] = useState<string | null>("");
  const [getTempIdForSubs, setGetTempIdForSubs] = useState<string | null>("");
  const [getTokenForSubs, setGetTokenForSubs] = useState<string | null>("");
  const [userAbleUserIDForSubs, setUserAbleUserIDForSubs] = useState<
    string | null
  >("");
  const [allReadyCalled, setAllReadyCalled] = useState(false);
  const shouldFetch = useRef(true);
  const [errorPresent, setErrorPresent] = useState(false);
  const router = useRouter();
  const [loadingMisciblog, setLoadingMisciblog] = React.useState(true);
  const [getToken, setGetToken] = useState<string | null>("");
  const [userActive, setUserActive] = useState(false);
  const [showRedirectionModal, setShowRedirectionModal] = useState(false);
  // const [getSecondsToRedirect, setGetSecondsToRedirect] = useState(
  //   SECONDS_TO_REDIRECT
  // );
  const [secondsToRedirect, setSecondsToRedirect] = useState(
    SECONDS_TO_REDIRECT
  );
  let intervalId :any;
  let timeoutId :any;
  
  const resetTimeout = () => {
    console.log("reset");
    clearTimeout(timeoutId);
    clearInterval(intervalId);
    setSecondsToRedirect(SECONDS_TO_REDIRECT);
    // Assuming getSecondsToRedirect is a state variable managed using useState.
    console.log(secondsToRedirect);
    intervalId = setInterval(() => {
      console.log(secondsToRedirect);
      // Update the state to decrement getSecondsToRedirect.
      setSecondsToRedirect((seconds) => {
        if (seconds === 0) {
          clearInterval(intervalId);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
  
    timeoutId = setTimeout(() => {
      router.push(REDIRECT_TO_PAGE);
      // alert("redirect");
    }, DEFAULT_REDIRECT_TIME());
  };
  
  useEffect(() => { console.log(secondsToRedirect) } , [secondsToRedirect])

  useEffect(() => {
    resetTimeout();
    window.addEventListener("mousemove", resetTimeout);
    window.addEventListener("click", resetTimeout);
    window.addEventListener("keypress", resetTimeout);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", resetTimeout);
      window.removeEventListener("click", resetTimeout);
      window.removeEventListener("keypress", resetTimeout);
    };
  }, []);
  const {
    data: subsData,
    loading: subsLoading,
    error: subsError,
  } = useSubscription<StepCompleteData>(MISCI_STEP_COMPLETES_SUBSCRIPTION, {
    variables: { userId: userAbleUserIDForSubs },
    onComplete() {
      console.log("completed");
    },
    onSubscriptionData(options) {
      console.log("sub data");
      console.log(options);
      const step = options?.subscriptionData?.data?.stepCompletes.step;
      console.log(step, " from on sub data");
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
      const userAbleUserID = tokenFromLocalStorage
        ? userIdFromLocalStorage
        : tempIdFromLocalStorage;
      setUserAbleUserIDForSubs(tempIdFromLocalStorage);
      console.log(
        getUserIdForSubs,
        getTempIdForSubs,
        getTokenForSubs,
        userAbleUserIDForSubs,
        "FROM USER"
      );
    }
  }, [subsError]);

  useEffect(() => {
    console.log(localStorage);
    const userId = getUserToken();
    const tempiId = localStorage.getItem("tempId");
    if (shouldFetch.current) {
      shouldFetch.current = false;
      generateMisci({ question, userId: tempiId ?? "" })
        .then((res) => {
          console.log(res);
          console.log("NON 400");
          if (res.data.error == true) {
            setErrorPresent(true);
          }
        })
        .catch((err) => {
          console.log("400+");
          console.log(err);
          if (err.response.data.error == true) {
            setErrorPresent(true);
          }
        })
        .finally(() => {
          setAllReadyCalled(false);
          console.log("finally");
        });
    }
  }, [shouldFetch]);

  return (
    <>
      <Head>
        <title className="capitalize">{capitalizeText(question)}</title>
      </Head>
      <ToastContainer />
      <RedirectionModal
        isOpen={secondsToRedirect <= 10}
        secondsToRedirect={secondsToRedirect}
        onRequestClose={() => setShowRedirectionModal(false)}
      />
      <MisciWorkSpace
        subscriptionData={subsData}
        question={question}
        setErrorPresent={setErrorPresent}
        errorPresent={errorPresent}
        setLoadingMisciblog={setLoadingMisciblog}
        loadingMisciblog={loadingMisciblog}
      />
    </>
  );
};

export default MiSciArticle;
