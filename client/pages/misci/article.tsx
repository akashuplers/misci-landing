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
const EVENT_FOR_RESET = ["mousemove", "keypress", "click", "scroll"];
const SECONDS_TO_REDIRECT = 120;
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
  const [secondsToRedirect, setSecondsToRedirect] =
    useState(SECONDS_TO_REDIRECT);
  let intervalId: any;
  let timeoutId: any;

  const resetTimeout = () => {
    
      console.log("reset");
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      setSecondsToRedirect(SECONDS_TO_REDIRECT);
    // Assuming getSecondsToRedirect is a state variable managed using useState.
    intervalId = setInterval(() => {
      // Update the state to decrement getSecondsToRedirect.
      setSecondsToRedirect((seconds) => {
        if (seconds === 0) {
          clearInterval(intervalId);
          setSecondsToRedirect(SECONDS_TO_REDIRECT);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);

    timeoutId = setTimeout(() => {
      const documentVisibilityState =
        typeof document !== "undefined" ? document.visibilityState : null;

      if (
        appLoaderStatus == false &&
        subsLoading == false &&
        documentVisibilityState == "visible"
      ) {
        router.push(REDIRECT_TO_PAGE);
        // alert("redirect");
      }
    }, DEFAULT_REDIRECT_TIME());
  };
  
  function showRedirectionModalPopupStatus() {
    const documentVisibilityState =
      typeof document !== "undefined" ? document.visibilityState : null;
      console.log(appLoaderStatus, documentVisibilityState, "from showRedirectionModalPopupStatus")
    if (
      appLoaderStatus == false &&
      documentVisibilityState == "visible"
      && 
      secondsToRedirect <= 10
    ) {
      return true;
    }
    return false;
  }
  useEffect(() => {
    console.log(secondsToRedirect);
  }, [secondsToRedirect]);
  let tinymceElement =
    typeof window !== "undefined"
      ? document.querySelector('iframe[id*="tiny"]')
      : null;
  useEffect(() => {
    resetTimeout();
    EVENT_FOR_RESET.forEach((event) => {
      window.addEventListener(event, resetTimeout);
      // @ts-ignore
      tinymceElement?.contentWindow?.document.body.addEventListener(
        event,
        resetTimeout
      );
    });
    const iframe = iframeRef.current;

    return () => {
      clearTimeout(timeoutId);
      EVENT_FOR_RESET.forEach((event) => {
        window.removeEventListener(event, resetTimeout);
      });
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        EVENT_FOR_RESET.forEach((event) => {
          iframe.contentWindow.removeEventListener(event, resetTimeout);
        });
      }
    };
  }, [appLoaderStatus]);

  useEffect(() => {
    // Function to add an event listener to TinyMCE once it's available
    const addEventListenerToTinyMCE = () => {
      const tinymceElement = document.querySelector('iframe[id*="tiny"]');
      console.log(tinymceElement, "from add event listener")
      if (tinymceElement) {
        console.log('from tield');
        console.log(tinymceElement);
        EVENT_FOR_RESET.forEach((event) => {
          // @ts-ignore
          
          console.log(tinymceElement.contentWindow?.document.body, "from tinymce");
          console.log(event, "from event");
          // @ts-ignore
          console.log(tinymceElement?.contentWindow)
          // @ts-ignore
          tinymceElement.contentWindow?.document.body.addEventListener(
            event,
            () => {
          // @ts-ignore
              console.log(tinymceElement.contentWindow?.document.body, "from tinymce");
              resetTimeout();
            }
          );
        });
      }

      // @ts-ignore
      tinymceElement?.contentWindow?.document.body.addEventListener("click", () => { console.log('tiny click', tinymceElement?.contentWindow?.document.body) });
          // @ts-ignore
          tinymceElement?.contentWindow?.document.body.addEventListener("keypress", () => { console.log('tiny click', tinymceElement?.contentWindow?.document.body) });
                // @ts-ignore
      tinymceElement?.contentWindow?.document.body.addEventListener("mousemove", () => { console.log('tiny click', tinymceElement?.contentWindow?.document.body) });

    };


    // Use a MutationObserver to watch for changes in the DOM
    const observer = new MutationObserver((mutationsList, observer) => {
      // Check if TinyMCE has been added to the DOM
      // console.log()
      if (document.querySelector('iframe[id*="tiny"]')) {
        // If TinyMCE is now present, stop observing and add the event listener
        observer.disconnect();
        addEventListenerToTinyMCE();
      }
    });

    // Start observing changes in the DOM
    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup by disconnecting the observer when the component unmounts
    return () => {
      observer.disconnect();
      EVENT_FOR_RESET.forEach((event) => {
        window.removeEventListener(event, resetTimeout);
      });
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
          if (err.response.data.error == true) {
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
        onRequestClose={() => setShowRedirectionModal(false)}
        setCurrentTabIndex={setCurrentTabIndex}
      />
      <MisciWorkSpace
        subscriptionData={subsData}
        question={question}
        setErrorPresent={setErrorPresent}
        errorPresent={errorPresent}
        setLoadingMisciblog={setLoadingMisciblog}
        loadingMisciblog={loadingMisciblog}
        iframeRef={iframeRef}
        setAppLoaderStatus={setAppLoaderStatus}
      />
    </>
  );
};

export default MiSciArticle;
