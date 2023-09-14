import "react-toastify/dist/ReactToastify.css";
import { regenerateNextDraft } from "@/helpers/apiMethodsHelpers";
import ReactLoading from "react-loading";
import { jsonToHtml } from "@/helpers/helper";
import { StepCompleteData } from "@/store/types";
import {
  ArrowLeftIcon,
  Bars3BottomRightIcon,
  CheckBadgeIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import LottiePlayer from "lottie-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import opener_loading from "../../../lottie/opener-loading.json";
import DOMPurify from "dompurify";
import NativeEditor from "../NativeEditor";
import { RegenerateIcon } from "@/components/localicons/localicons";
import { Chip, TabItem } from "@/components/ui/Chip";
import MiSciGenerateLoadingModal from "@/modals/MiSciLoadingModal";
import Head from "next/head";
import { Tab } from "@headlessui/react";
import { Badge } from "@radix-ui/themes";
import ErrorBase from "@/store/errors";
import NextDraftIssueModal from "@/modals/NextDraftIssueModal";
import { useIdeaState } from "@/store/appState";
import PublishMisciModal from "@/modals/PublishMisciModal";
import IdeaTag from "@/components/IdeaTag";
interface MisciWorkSpaceProps {
  subscriptionData: StepCompleteData | undefined;
  question: string;
  errorPresent: boolean;
  setErrorPresent: any;
  loadingMisciblog: boolean;
  setLoadingMisciblog: any;
}
const MisciWorkSpace = ({
  subscriptionData,
  question,
  errorPresent, setErrorPresent, loadingMisciblog, setLoadingMisciblog
}: MisciWorkSpaceProps) => {
  const [misciblog, setMisciblog] = React.useState<any>(null);
  const [currentTabIndex, setCurrentTabIndex] = React.useState(0);
  const [editorAnswersData, setEditorAnswersData] = React.useState<any>(null);
  const [userquestion, setQuestion] = useState<string>("");
  const [listOfIdeas, setListOfIdeas] = useState<any[]>([]);
  // const [initailListOfIdeas, setInitialListOfIdeas] = useState<any[]>([]);
  const [listOfUnusedIdeas, setListOfUnusedIdeas] = useState<any>([]);
  const router = useRouter();
  const [EditorSetUpCompleted, setEditorSetUpCompleted] = useState(false);
  const [getToken, setGetToken] = useState<string | null>("");
  const [isArticleTabReady, setIsArticleTabReady] = useState(false);
  const [editorArticleData, setEditorArticleData] = useState<any>(null);
  const [blogId, setBlogId] = useState("");
  const [nextDraftLoader, setNextDraftLoader] = useState(false);
  const [shortAnswer, setShortAnswer] = useState<string>("");
  const [detailedAnswer, setDetailedAnswer] = useState<string>("");
  const [references, setReferences] = useState<
    {
      id: string;
      source: string;
      url: string;
    }[]
  >([]);
  const [shwoNextDraftIssueModal, setShowNextDraftIssueModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  // const [initailListOfIdeas, setInitialListOfIdeas] = useState<any[]>([]);
  const { getInitialListOfIdeas, setInitialListOfIdeas } = useIdeaState();

  useEffect(() => {
    const step = subscriptionData?.stepCompletes.step;
    console.log("sub ran", step);
    // @ts-ignore
    if (step == "ANSWER_FETCHING_COMPLETED") {
      console.log("answers loaded");
      setBlogId(subscriptionData?.stepCompletes.data?._id);
      const data = subscriptionData?.stepCompletes.data;
      setShortAnswer(data?.short_answer);
      setDetailedAnswer(data?.detailed_answer);
      setMisciblog(data);
      console.log(data);
      const aa = data?.publish_data?.find((d: any) => d.platform === "answers");
      console.log(aa);
      const htmlToDoc = jsonToHtml(aa?.tiny_mce_data);
      console.log(htmlToDoc);
      const question = data?.question;
      setQuestion(question);
      setEditorAnswersData((prev: string) => {
        return htmlToDoc;
      });
      setLoadingMisciblog(false);
    }
    if (step == "BLOG_GENERATION_COMPLETED") {
      console.log("IDEAS LOADED");
      console.log(subscriptionData);
      const data = subscriptionData?.stepCompletes.data.ideas.ideas;
      console.log(data);

      setBlogId(subscriptionData?.stepCompletes.data?._id);
      setShortAnswer(subscriptionData?.stepCompletes.data?.short_answer);
      setDetailedAnswer(subscriptionData?.stepCompletes.data?.detailed_answer);
      // Create new arrays or objects when setting the state
      setListOfIdeas([...data]);
      setInitialListOfIdeas([
        ...subscriptionData?.stepCompletes.data.ideas.ideas,
      ]);
      const aa = subscriptionData?.stepCompletes?.data?.publish_data?.find(
        (d: any) => d.platform === "wordpress"
      );
      const answers = subscriptionData?.stepCompletes?.data?.publish_data?.find(
        (d: any) => d.platform === "answers"
      );
      console.log(aa);
      console.log(answers);
      const htmlDoc = jsonToHtml(aa?.tiny_mce_data);
      console.log(htmlDoc);
      setEditorArticleData(htmlDoc);
      setIsArticleTabReady(true);
      const referencesOfArticle =
        subscriptionData?.stepCompletes?.data?.references;
      setReferences(referencesOfArticle);
      console.log(isArticleTabReady);
      const answerHtml = jsonToHtml(answers?.tiny_mce_data);
      console.log(answerHtml);
      setEditorAnswersData(answerHtml);
      setLoadingMisciblog(false);
    }
    // @ts-ignore
    if (step == "ANSWER_FETCHING_FAILED") {
      // toast.error(ErrorBase.retrievalError, {
      //   toastId: 'retrievalErrorWebhook',
      //   delay: 10000
      // });
      setEditorAnswersData(ErrorBase.errorAnswerWithQuestion(question));
      setDetailedAnswer(ErrorBase.errorAnswerWithQuestion(question));
      setLoadingMisciblog(false);
      setErrorPresent(true);
      
      // setTimeout(() => {
      //   // take to /misci
      //   router.push("/misci");
      // }, 8000);
    }
  }, [subscriptionData?.stepCompletes?.step]);
  useEffect(() => {
    if(errorPresent===true){
      setDetailedAnswer(ErrorBase.errorAnswerWithQuestion(question));
      setEditorAnswersData(ErrorBase.errorAnswerWithQuestion(question));
      setLoadingMisciblog(false);
    }
  }, [errorPresent]);

  useEffect(() => {
    console.log(getInitialListOfIdeas());
    console.log(listOfIdeas);
  }, [listOfIdeas]);
  function handleNextDraft() {
    var payload = [];
    const payloadList = [...listOfIdeas];
    const payloadListUnused = [...listOfUnusedIdeas];
    for (let index = 0; index < payloadList.length; index++) {
      const element = payloadList[index];
      if (element.used == 1) {
        payload.push({ ...element, text: element.idea });
      }
    }
    for (let index = 0; index < payloadListUnused.length; index++) {
      const element = payloadListUnused[index];
      if (element.used == 1) {
        payload.push({ ...element, text: element.idea });
      }
    }
    console.log(payload, getInitialListOfIdeas());
    if (payload.length == getInitialListOfIdeas().length) {
      setShowNextDraftIssueModal(true);
      return;
    }

    regenerateNextDraft({
      ideas: payload,
      blog_id: blogId,
      onStart: () => {
        console.log("started");
        setNextDraftLoader(true);
      },
      onCompleted: () => {
        console.log("completed");
        setNextDraftLoader(false);
      },
    })
      .then((res) => {
        if (res?.data?.error === true) {
          setEditorAnswersData(ErrorBase.errorAnswerWithQuestion(question));
          setDetailedAnswer(ErrorBase.errorAnswerWithQuestion(question));
          setLoadingMisciblog(false);
        } else {
          console.log(res);
          console.log("started");
          const ideas = res?.data?.ideas?.ideas;
          const pubData = res?.data?.publish_data;
          var articleData = "";
          var answersData = "";
          for (let index = 0; index < pubData?.length; index++) {
            const element = pubData[index];
            if (element.platform == "answers") {
              answersData = element.tiny_mce_data;
            } else if (element.platform == "wordpress") {
              articleData = element.tiny_mce_data;
            }
          }
          setEditorAnswersData(jsonToHtml(answersData));
          setEditorArticleData(jsonToHtml(articleData));
          setListOfUnusedIdeas(ideas.filter((idea: any) => idea.used == 0));
          const getAllIdeasWith1 = [...ideas].filter(
            (idea: any) => idea.used == 1
          );
          console.log([...getAllIdeasWith1, ...ideas]);
          // get only used == 
          setListOfIdeas((prev) => {
            return [...getAllIdeasWith1];
          });
          setQuestion(res?.data?.question);
          setBlogId(res?.data?._id);
          setReferences(res?.data?.references);
          console.log("regen completedc");
        }
      })
      .finally(() => {});
  }

  const DynamicAnswersData = ({ html, short_answer, detailed_answer }: { html: string , detailed_answer:string, short_answer:string}) => {

    return (
      <div className="">
        {/* <div
          id="answersEditor"
          dangerouslySetInnerHTML={{ __html: mySafeHTML }}
        ></div> */}
        <div className="flex flex-col gap-4">
          {
            short_answer.length > 0 ? <>
            <div>
            <p>
              Short Answer: <span
              dangerouslySetInnerHTML={{ __html: short_answer }}
              ></span>
            </p>
          </div>
          <div className="border-b border-gray-200"></div>
</>: <></>
          }
          {/* under line */}
          <div>
            <p
              dangerouslySetInnerHTML={{ __html: detailed_answer }}>
            </p>
          </div>
        </div>
        <br />
      </div>
    );
  };
  const editTabs = [
    {
      name: "Used Ideas",
      icon: <></>,
      content: <></>,
      notificationCount: listOfIdeas.length,
    },
    {
      name: "Unused Ideas",
      icon: <></>,
      content: <></>,
      notificationCount: listOfUnusedIdeas.length,
    },
  ];
  if (loadingMisciblog) {
    return (
      <>
        <MiSciGenerateLoadingModal
          setShowGenerateLoadingModal={() => {}}
          showGenerateLoadingModal={true}
          showBackButton={false}
        />
        <ToastContainer />
      </>
    );
  }
  return (
    <div className="w-screen h-screen overscroll-none overflow-hidden px-12 py-2">
      <style>{`.sidebar-position-left #button.sidebar{display: none;`}</style>
      <header className="w-full h-[8%] justify-between items-center flex">
        <button
          onClick={() => {
            router.back();
          }}
        >
          <span>
            <ArrowLeftIcon className="h-5 w-5 text-gray-800" />
          </span>
        </button>
        <div className="justify-start items-center gap-4 flex">
        {!errorPresent &&   <button
            className="p-2 bg-indigo-600 rounded-lg shadow justify-center items-center gap-2.5 flex"
            onClick={() => {
              setShowPublishModal(true);
            }}
          >
            <span className="-rotate-45">
              <PaperAirplaneIcon className="h-5 w-5 text-white" />
            </span>
            <span className="text-white text-base font-medium">Publish</span>
          </button>}
        </div>
      </header>
      {/* modals */}
      <NextDraftIssueModal
        showModal={shwoNextDraftIssueModal}
        setShowModal={setShowNextDraftIssueModal}
      />
      <PublishMisciModal
        blogId={blogId}
        showModal={showPublishModal}
        setShowModal={setShowPublishModal}
      />
      <div
        className="flex"
        style={{
          height: "92%",
        }}
      >
        <div className="w-full">
          <Tab.Group
            onChange={setCurrentTabIndex}
            defaultIndex={0}
            selectedIndex={currentTabIndex}
          >
            <Tab.List className="flex items-center gap-2 w-full h-[5%]">
              <Tab className={`outline-none`}>
                <TabItem
                  icon={
                    <div>
                      <img src="/icons/answers_icon.svg" alt="" />
                    </div>
                  }
                  title={"Answer"}
                  selected={currentTabIndex === 0}
                />
              </Tab>
             {
              !errorPresent &&  <Tab className={`outline-none`}>
              <TabItem
                icon={
                  <div>
                    <img src="/icons/questions_icon.svg" alt="" />
                  </div>
                }
                title={"Article"}
                selected={currentTabIndex === 1}
              />
            </Tab> 
             }
            </Tab.List>
            <Tab.Panel className={`w-full h-full flex `}>
              <div
                className="w-[70%] bg-neutral-100 rounded-2xl flex relative h-full"
              >
                <div className="flex-col  w-full justify-start items-start gap-7 inline-flex">
                  <div className="bg-opacity-70 w-full h-full justify-start items-center gap-5 flex flex-col">
                    <div className="w-full text-slate-800 text-xl font-bold leading-relaxed tracking-tight min-h-20 bg-[#FF8980] flex flex-col items-center sticky top-0 z-20 rounded-b-[3rem] ">
                      {/* {userquestion} */}
                      <div className="flex w-full items-center  gap-4 p-4 px-8 justify-start">
                        <div className="h-14 w-14 text-red-500 border-white "
                        style={{
                          mixBlendMode: 'luminosity'
                        }}
                        >
                          <img src="../icons/qmark.svg" alt="" />
                        </div>
                        <div className="text-center text-white text-2xl  m-auto capitalize">
                          <h2>{question}</h2>
                        </div>
                      </div>
                    </div>
                    <div className="z-10 mx-12 flex w-[90%] border border-gray-200 p-2 bg-white shadow-xl rounded-xl  h-full max-w-full">
                      <div className="flex items-start gap-4 px-2 text-black font-medium text-base w-full">
                        {/* ticket */}
                        <span className="h-12 w-[5%] text-green-500">
                          <img src="../icons/tick.svg" alt="" />
                        </span>
                        <div className="mt-4 text-lg w-[95%]">
                          <DynamicAnswersData html={editorAnswersData ?? ""} short_answer={shortAnswer} detailed_answer={detailedAnswer}/>
                        </div>
                      </div>
                    </div>
                     
                    <div className="mt-[-10%] z-0"
                    style={{
                      filter: 'grayscale(80%)',
                      opacity: '0.1'
                    }}
                    > 
                    <img style={{width: 673, height: 479, opacity: 0.99, mixBlendMode: 'darken', borderRadius: 53}} src="../ground.png" />
                    </div>
                  </div>
                </div>
                <br />
              </div>
              <div
                className="w-[30%] max-h-full p-2 flex-col flex relative border-l border-gray-200 gap-6"
                id="leftContent"
              >
                <div
                  style={{ backgroundImage: "url(../bg-gray-misci.jpeg)" }}
                  className="h-full  bg-contain bg-opacity-70 flex items-center px-4 justify-center rounded-lg flex-col gap-2"
                >
                  {isArticleTabReady ? (
                    <>
                      <span className="text-gray-800 text-xl text-center font-semibold leading-none pb-4">
                        We have created a personalized article for you.
                      </span>
                      <button
                        onClick={() => {
                          setCurrentTabIndex(1);
                        }}
                        className="p-2 opacity-90 rounded-lg shadow border border-indigo-600 justify-center items-center gap-1 flex bg-indigo-600 text-white 
               transition duration-300 ease-in-out 
               hover:bg-indigo-700 hover:border-indigo-700 hover:shadow-lg hover:scale-105"
                      >
                        <span>
                          <DocumentTextIcon className="h-5 w-5 transition duration-300 ease-in-out hover:rotate-180" />
                        </span>
                        Go to Article
                      </button>
                    </>
                  ) : (
                    <>
                      <LottiePlayer
                        loop
                        autoplay
                        animationData={opener_loading}
                        className="h-24"
                      />

                      <span className="text-gray-800 text-2xl font-bold leading-none text-center">
                        We are almost there
                      </span>
                    </>
                  )}
                </div>
              </div>
            </Tab.Panel>{" "}
            <Tab.Panel className={`w-full h-full flex `}>
              <div className="w-[70%] flex  h-full ">
                <>
                  {!isArticleTabReady ? (
                    <div className="flex items-start justify-center w-full h-full">
                      <div className="text-center flex center flex-col relative">
                        <img className="mx-auto" src="/loader.gif"></img>
                        <div
                          className="-mt-12 animate-pulse text-sm"
                          style={{
                            position: "absolute",
                            bottom: "20%",
                            left: "0",
                            right: "0",
                          }}
                        >
                          Loading ...
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full">
                      <NativeEditor
                        value={editorArticleData}
                        onEditorChange={(content: any, editor: any) => {
                          setEditorArticleData(content);
                        }}
                        onSetup={(editor: any) => {
                          setEditorSetUpCompleted(true);
                        }}
                      />
                    </div>
                  )}
                </>
              </div>
              <div
                className="w-[30%] max-h-full p-2 flex-col flex relative border-l border-gray-200 gap-3"
                id="leftContent"
              >
                <>
                  <div className="text-xs mb-24 lg:mb-0" id="regenblog">
                    {/* h1 Insight only for mobile screens */}
                    <h1 className="text-2xl  font-semibold text-gray-800 my-4 lg:hidden">
                      Insights
                    </h1>
                    <div className="flex jusify-between items-center">
                      <p className="font-normal w-[100%] lg:w-[70%] text-base">
                        Create your next draft on the basis of your edits.
                      </p>
                      <button
                        className="cta flex items-center w-[212px]  p-2 font-semibold gap-2.5 justify-center"
                        disabled={nextDraftLoader}
                        onClick={() => handleNextDraft()}
                      >
                        <RegenerateIcon />
                        <span className="text-base">{"Next Draft"}</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col justify-start gap-4 w-full">
                    <div className="w-full justify-start items-center gap-2.5 flex">
                      <div className="flex-col justify-center items-start gap-2 flex w-full">
                        <div className="flex justify-between w-full items-center">
                          <h3 className="pt-[0.65em] font-semibold">
                            Questions
                          </h3>
                        </div>
                        <div className=" opacity-70 text-blue-950 capitalize text-base font-normal leading-none">
                          {userquestion}
                        </div>
                        <div className="flex justify-between w-full items-center">
                          <h3 className="pt-[0.65em] font-semibold">Sources</h3>
                        </div>
                        <div className="flex gap-[0.5em] flex-wrap h-full w-full  overflow-x-hidden overflow-y-scroll"
                        >
                          {references?.map((ref) => {
                            return <Chip key={ref.id} text={ref.source} />;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* tabs for used ideas and unused ideas */}
                  {nextDraftLoader ? (
                    <>
                      <div className="flex items-start justify-center w-full h-full">
                        <div className="text-center flex center flex-col relative">
                          <img className="mx-auto" src="/loader.gif"></img>
                          <div
                            className="-mt-12 animate-pulse text-sm"
                            style={{
                              position: "absolute",
                              bottom: "20%",
                              left: "0",
                              right: "0",
                            }}
                          >
                            Generating Next Draft ...
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <UnsedIteamTabs
                        ideas={listOfIdeas}
                        editTabs={editTabs}
                        listOfUnusedIdeas={listOfUnusedIdeas}
                        setListOfIdeas={setListOfIdeas}
                        setListOfUnusedIdeas={setListOfUnusedIdeas}
                      />
                    </>
                  )}
                </>
              </div>
            </Tab.Panel>
          </Tab.Group>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

interface IdeaItem {
  idea: string;
  selected: boolean;
  id: string;
  text: string;
  total?: number;
  onClick: () => void;
}
export const IdeaItem = ({
  idea,
  selected,
  id,
  text,
  total,
  onClick,
}: IdeaItem) => {
  return (
    <>
      <div className="flex pb-3 usedIdeas" key={id}>
        <div className="flex justify-between gap-5 w-full">
          <p className="text-[13px] max-w-[90%]">{text}</p>
          <input
            type="checkbox"
            className="mb-4 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-none focus:ring-blue-500"
            style={{
              borderRadius: "2px",
            }}
            checked={selected}
            onClick={onClick}
          />
        </div>
      </div>
    </>
  );
};

interface UnsedIteamTabsProps {
  ideas: any[];
  editTabs: any;
  listOfUnusedIdeas?: any[];
  setListOfUnusedIdeas?: any;
  setListOfIdeas?: any;
}

const UnsedIteamTabs = ({
  ideas,
  editTabs,
  listOfUnusedIdeas,
  setListOfIdeas,
  setListOfUnusedIdeas,
}: UnsedIteamTabsProps) => {
  const [currentEditTabIndex, setCurrentEditTabIndex] = React.useState(0);
  const [usedIdeas, setUsedIdeas] = React.useState<any>([]);
  const [unusedIdeas, setUnusedIdeas] = React.useState<any>([]);

  return (
    <div className="relative overflow-y-scroll pb-4 h-full">
      <Tab.Group
        onChange={(index) => {
          setCurrentEditTabIndex(index);
        }}
        selectedIndex={currentEditTabIndex}
      >
        <Tab.List className="flex sticky top-0 items-center gap-3 w-full bg-white ">
          {editTabs.map((tab: any, index: number) => (
            <Tab key={tab.name} className={`outline-none`}>
              <TabItem
                icon={tab.icon}
                key={index}
                title={tab.name}
                showIcon={false}
                selected={currentEditTabIndex === index}
                count={tab.notificationCount}
                showOnLeft={true}
              />
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel
            className={`w-full max-h-full flex flex-col gap-4 p-2 border-none outline-none`}
          >
            <div className="h-full flex flex-col gap-1 border-none">
              {ideas ? (
                ideas.map((idea: any, index: number) => {
                  return (
                    <IdeaItem
                      id={index.toString()}
                      text={idea.idea}
                      idea="Idea 1"
                      key={index}
                      selected={idea.used == 1 ? true : false}
                      onClick={() => {
                        const newIdeas = [...ideas];
                        newIdeas[index].used =
                          newIdeas[index].used == 1 ? 0 : 1;
                        setListOfIdeas(newIdeas);
                      }}
                    />
                  );
                })
              ) : (
                <>loading.. ideas</>
              )}
            </div>
          </Tab.Panel>
          <Tab.Panel className={`w-full  `}>
            <div className="w-full max-h-full flex flex-col gap-4 overflow-y-scroll   py-2">
              {listOfUnusedIdeas ? (
                listOfUnusedIdeas.map((idea: any, index: number) => {
                  return (
                    <IdeaItem
                      id={index.toString()}
                      text={idea.idea}
                      idea="Idea 1"
                      key={index}
                      selected={idea.used == 1 ? true : false}
                      onClick={() => {
                        console.log("clicked");
                        console.log(idea);
                        const newIdeas = [...listOfUnusedIdeas];
                        newIdeas[index].used =
                          newIdeas[index].used == 1 ? 0 : 1;
                        setListOfUnusedIdeas(newIdeas);
                      }}
                    />
                  );
                })
              ) : (
                <>loading.. ideas</>
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default MisciWorkSpace;
