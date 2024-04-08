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
import { useMisciArticleState } from "@/store/appState";
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
const mainArticleContainer = 'mainArticleContainer';
const EVENT_FOR_RESET = ["mousemove", "keypress", "click", "scroll"];
const SECONDS_TO_REDIRECT = 200;
const DEFAULT_REDIRECT_TIME = (seconds = SECONDS_TO_REDIRECT) => seconds * 1000;
const REDIRECT_TO_PAGE = "/misci";
const MiSciArticle = ({ question }: MiSciProps) => {
  const [getUserIdForSubs, setGetUserIdForSubs] = useState<string | null>("");
  const [getTempIdForSubs, setGetTempIdForSubs] = useState<string | null>("");
  const [getTokenForSubs, setGetTokenForSubs] = useState<string | null>("");
  const [userAbleUserIDForSubs, setUserAbleUserIDForSubs] = useState<
    string | null
  >("");
  const { currentTabIndex, setCurrentTabIndex } = useMisciArticleState();
  const [appLoaderStatus, setAppLoaderStatus] = useState(true);
  const [allReadyCalled, setAllReadyCalled] = useState(false);
  const shouldFetch = useRef(true);
  const [errorPresent, setErrorPresent] = useState(false);
  const router = useRouter();
  const [loadingMisciblog, setLoadingMisciblog] = React.useState(true);
  const [getToken, setGetToken] = useState<string | null>("");
  const [userActive, setUserActive] = useState(false);
  const iframeRef = useRef<any>(null);
  const [showRedirectionModal, setShowRedirectionModal] = useState(false);
  const [reStart, setReStart] = useState(false);
  const mainArticleContainerRef = useRef<any>(null);
  const [secondsToRedirect, setSecondsToRedirect] =
    useState(SECONDS_TO_REDIRECT);
  const counterRef = useRef(SECONDS_TO_REDIRECT);
  const [tinyMceChangeCheck, setTinyMceChangeCheck] = useState(false);
    // const [intervalId, setIntervalId] = useState<any>(null);
  // const [timeoutId, setTimeoutId] = useState<any>(null);
  function tinyMceChangeCheckFunction() {
    setTinyMceChangeCheck((prev)=>!prev);
  }
  useEffect(() => {
    let intervalId:any = null;
    let timeoutId:any = null;
    const handleInteraction = () => {
      console.log(secondsToRedirect);
      console.log('running handler  ')
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      setSecondsToRedirect(SECONDS_TO_REDIRECT);
      counterRef.current = SECONDS_TO_REDIRECT;
      // Start the timer again
      intervalId = setInterval(() => {
        setSecondsToRedirect((seconds) => {
          console.log(': counter ref', counterRef.current);
          if (seconds <= 0 ) {
            // Perform your redirect logic here
            // router.push(REDIRECT_TO_PAGE);
            // console.log()
            let shouldIRedirect = showRedirectionModalPopupStatus();
            console.log(shouldIRedirect, "from handle interaction");
            if(shouldIRedirect){
              router.push(REDIRECT_TO_PAGE);
              setCurrentTabIndex(0);
            }
            return 0;
          }
          return seconds - 1;
        });
        // counterRef.current = counterRef.current - 1;/
        if(counterRef.current <= 0){
          clearInterval(intervalId);
        }else{
          counterRef.current = counterRef.current - 1;
        }
      }, 1000);
      // setIntervalId(localintervalId);
    };

    // Initial setup
    handleInteraction();

    if(mainArticleContainerRef.current){
      mainArticleContainerRef.current.addEventListener("mousemove", handleInteraction);
      mainArticleContainerRef.current.addEventListener("keydown", handleInteraction);
      mainArticleContainerRef.current.addEventListener("mousemove", handleInteraction);
      mainArticleContainerRef.current.addEventListener("keydown", handleInteraction);
      mainArticleContainerRef.current.addEventListener("click", handleInteraction);
      mainArticleContainerRef.current.addEventListener("scroll", handleInteraction);
      mainArticleContainerRef.current.addEventListener("touchstart", handleInteraction);
    }

    // Event listeners to detect user interaction
    // window.addEventListener("mousemove", handleInteraction);
    // window.addEventListener("keydown", handleInteraction);
    // window.addEventListener("click", handleInteraction);
    // window.addEventListener("scroll", handleInteraction);
    // window.addEventListener("touchstart", handleInteraction);

    // Clear timers and remove event listeners on component unmount
    const addEventListenerToTinyMCE = () => {
      const tinymceElement = document.querySelector('iframe[id*="tiny"]');
      console.log('tinymce');
      console.log(tinymceElement);
      console.log('tinymce');
      if (tinymceElement) {
        // @ts-ignore
        console.log(tinymceElement.contentWindow?.document);
        // @ts-ignore
        console.log(tinymceElement.contentWindow?.document.body.addEventListener);
        // @ts-ignore
        tinymceElement.contentWindow?.document.body.addEventListener("click", handleInteraction);
        // @ts-ignore
        
        tinymceElement.contentWindow?.document.body.addEventListener("scroll", handleInteraction);
        // @ts-ignore
        
        tinymceElement.contentWindow?.document.body.addEventListener("touchstart", handleInteraction);
        // @ts-ignore
        
        tinymceElement.contentWindow?.document.body.addEventListener("keydown", handleInteraction);
        // @ts-ignore
        tinymceElement.contentWindow?.document.body.addEventListener("mousemove", handleInteraction);

      }
    };
    addEventListenerToTinyMCE();
    // Use a MutationObserver to watch for changes in the DOM
    const observer = new MutationObserver((mutationsList, observer) => {
      // Check if TinyMCE has been added to the DOM
      if (document.querySelector('iframe[id*="tiny"]')) {
        // If TinyMCE is now present, stop observing and add the event listener
        observer.disconnect();
        addEventListenerToTinyMCE();
      }
    });

    // Start observing changes in the DOM
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      // window.removeEventListener("mousemove", handleInteraction);
      // window.removeEventListener("keydown", handleInteraction);
      // window.removeEventListener("mousemove", handleInteraction);
      // window.removeEventListener("keydown", handleInteraction);
      // window.removeEventListener("click", handleInteraction);
      // window.removeEventListener("scroll", handleInteraction);
      // window.removeEventListener("touchstart", handleInteraction);
      if(mainArticleContainerRef.current){
        mainArticleContainerRef.current.removeEventListener("mousemove", handleInteraction);
        mainArticleContainerRef.current.removeEventListener("keydown", handleInteraction);
        mainArticleContainerRef.current.removeEventListener("mousemove", handleInteraction);
        mainArticleContainerRef.current.removeEventListener("keydown", handleInteraction);
        mainArticleContainerRef.current.removeEventListener("click", handleInteraction);
        mainArticleContainerRef.current.removeEventListener("scroll", handleInteraction);
        mainArticleContainerRef.current.removeEventListener("touchstart", handleInteraction);
      }
      observer.disconnect();
    };
  }, [tinyMceChangeCheck, appLoaderStatus]);
  function showRedirectionModalPopupStatus() {
    const documentVisibilityState =
      typeof document !== "undefined" ? document.visibilityState : null;
    console.log(
      appLoaderStatus,
      documentVisibilityState,
      secondsToRedirect, 
      "from showRedirectionModalPopupStatus", ' : counterref', counterRef.current
    );
    if (
      appLoaderStatus == false &&
      documentVisibilityState == "visible" &&
      counterRef.current <= 10
    ) {
      console.log("true, please route");
      return true;
    }
    console.log("false, please stay");
    return false;
  }

 
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
      generateMisci({
        question,
        userId: tempiId ?? "",
        onStart() {
          setLoadingMisciblog(true);
        },
      })
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
          if (err?.response?.data?.error == true) {
            setErrorPresent(true);
          }
        })
        .finally(() => {
          setLoadingMisciblog(false);
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
        isOpen={showRedirectionModalPopupStatus()}
        secondsToRedirect={secondsToRedirect}
        onRequestClose={() => {
          setShowRedirectionModal(false);
          tinyMceChangeCheckFunction();
        }}
        setCurrentTabIndex={setCurrentTabIndex}
      />
      <div id={mainArticleContainer} ref={mainArticleContainerRef}>
      <MisciWorkSpace
        subscriptionData={subsData}
        question={question}
        setErrorPresent={setErrorPresent}
        errorPresent={errorPresent}
        setLoadingMisciblog={setLoadingMisciblog}
        loadingMisciblog={loadingMisciblog}
        iframeRef={iframeRef}
        setAppLoaderStatus={setAppLoaderStatus}
        resetTimeout={tinyMceChangeCheckFunction}
      />
      </div>

      {/* faq */}
      <img
        className='h-[9vh] w-[5vw] absolute bottom-7 right-10 cursor-pointer border border-gray-300 rounded-lg p-1.5'
        src="/faq.png"
        style={{objectFit: 'cover'}}
        onClick={() => router.replace('/misci/faq')}
      />
    </>
  );
};

export default MiSciArticle;
