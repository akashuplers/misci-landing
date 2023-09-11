import {
  MISCI_STEP_COMPLETES_SUBSCRIPTION,
  STEP_COMPLETES_SUBSCRIPTION,
} from "@/graphql/subscription/generate";
import {
  generateMisci,
  regenerateNextDraft,
} from "@/helpers/apiMethodsHelpers";
import { classNames, getUserToken } from "@/store/appHelpers";
import { StepCompleteData } from "@/store/types";
import { useSubscription } from "@apollo/client";
import { useRouter } from "next/router";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import Head from "next/head";
import MisciWorkSpace from "@/components/component/workspace/Misci";
import ErrorBase from "@/store/errors";
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

const MiSciArticle = ({ question }: MiSciProps) => {
  const [getUserIdForSubs, setGetUserIdForSubs] = useState<string | null>("");
  const [getTempIdForSubs, setGetTempIdForSubs] = useState<string | null>("");
  const [getTokenForSubs, setGetTokenForSubs] = useState<string | null>("");
  const [userAbleUserIDForSubs, setUserAbleUserIDForSubs] = useState<
    string | null
  >("");
  const router = useRouter();
  const [getToken, setGetToken] = useState<string | null>("");
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
    generateMisci({ question, userId: tempiId ?? "" })
      .then((res) => {})
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        console.log("finally");
      });
  }, []);

  return (
    <>
      <Head>
        <title>{question}</title>
      </Head>
        <MisciWorkSpace subscriptionData={subsData} question={question} />
    </>
  );
};

export default MiSciArticle;
