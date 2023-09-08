import "react-toastify/dist/ReactToastify.css";
import { regenerateNextDraft } from "@/helpers/apiMethodsHelpers";
import ReactLoading from "react-loading";
import { jsonToHtml } from "@/helpers/helper";
import { StepCompleteData } from "@/store/types";
import {
  ArrowLeftIcon,
  Bars3BottomRightIcon,
  PaperAirplaneIcon,
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
interface MisciWorkSpaceProps {
  subscriptionData: StepCompleteData | undefined;
}
const MisciWorkSpace = ({ subscriptionData }: MisciWorkSpaceProps) => {
  const [loadingMisciblog, setLoadingMisciblog] = React.useState(true);
  const [misciblog, setMisciblog] = React.useState<any>(null);
  const [currentTabIndex, setCurrentTabIndex] = React.useState(0);
  const [editorAnswersData, setEditorAnswersData] = React.useState<any>(null);
  const [userquestion, setQuestion] = useState<string>("");
  const [listOfIdeas, setListOfIdeas] = useState<any[]>([]);
  const [listOfUnusedIdeas, setListOfUnusedIdeas] = useState<any>([]);
  const router = useRouter();
  const [EditorSetUpCompleted, setEditorSetUpCompleted] = useState(false);
  const [getToken, setGetToken] = useState<string | null>("");
  const [isArticleTabReady, setIsArticleTabReady] = useState(false);
  const [editorArticleData, setEditorArticleData] = useState<any>(null);
  const [blogId, setBlogId] = useState("");
  const [nextDraftLoader, setNextDraftLoader] = useState(false);
  const [references, setReferences] = useState<
    {
      id: string;
      source: string;
      url: string;
    }[]
  >([]);
  const [usedTabIndex, setUsedTabIndex] = useState(0);

  useEffect(() => {
    const step = subscriptionData?.stepCompletes.step;
    // @ts-ignore
    if (step == "ANSWER_FETCHING_COMPLETED") {
      console.log("answers loaded");
      const data = subscriptionData?.stepCompletes.data;
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
      setListOfIdeas(data);
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
    }
    // @ts-ignore
    if (step == "ANSWER_FETCHING_FAILED") {
      toast.error("Something went wrong");
      setLoadingMisciblog(false);
      setTimeout(() => {
        // take to /misci
        router.push("/misci");
      }, 2000);
    }
  }, [subscriptionData?.stepCompletes?.step]);

  function handleNextDraft() {
    var payload = [];
    const payloadList = [...listOfIdeas];
    for (let index = 0; index < payloadList.length; index++) {
      const element = payloadList[index];
      if (element.used == 1) {
        payload.push({ ...element, text: element.idea });
      }
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
        setListOfUnusedIdeas(ideas);
        setQuestion(res?.data?.question);
        setBlogId(res?.data?._id);
        setReferences(res?.data?.references);
        console.log("regen completedc");
      })
      .finally(() => {});
  }

  const DynamicAnswersData = ({ html }: { html: string }) => {
    var mySafeHTML = structuredClone(html);
    mySafeHTML = DOMPurify.sanitize(mySafeHTML);
    return (
      <div className=" text-slate-600 text-base font-normal leading-normal">
        <div
          id="answersEditor"
          dangerouslySetInnerHTML={{ __html: mySafeHTML }}
        ></div>
        <br />
      </div>
    );
  };
  const editTabs = [
    {
      name: "Used Ideas",
      icon: <Bars3BottomRightIcon />,
      content: <></>,
      notificationCount: 12,
    },
    {
      name: "Unused Ideas",
      icon: <Bars3BottomRightIcon />,
      content: <></>,
      notificationCount: 0,
    },
  ];
  // const TabsList =
  const memoizedTab = React.useMemo(
    () => [
      {
        name: "Answer",
        icon: (
          <div>
            <img src="/icons/answers_icon.svg" alt="" />
          </div>
        ),
        leftContent: (
          <div className="h-full bg-gray-200 bg-opacity-70 flex items-center justify-center rounded-lg flex-col gap-2">
            {isArticleTabReady ? (
              <>
                <span className="text-gray-800 text-xl font-bold leading-none">
                  We have created a personalized article for you.
                </span>
                <button
                  onClick={() => {
                    setCurrentTabIndex(1);
                  }}
                  className="p-2 opacity-90 rounded-lg shadow border border-indigo-600 justify-center items-center gap-1 flex bg-indigo-600   text-white"
                >
                  <span>
                    <PaperAirplaneIcon className="h-5 w-5" />
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

                <span className="text-gray-800 text-2xl font-bold leading-none">
                  We are almost there
                </span>
              </>
            )}
          </div>
        ),
        content: (
          <>
            <div className="p-2 flex-col  w-full justify-start items-start gap-7 inline-flex ">
              <div className="flex-col bg-gray-200 rounded-md p-2  bg-opacity-70 w-full h-full justify-start items-start gap-5 flex">
                <div className=" text-slate-800 text-xl font-bold leading-relaxed tracking-tight">
                  {userquestion}
                </div>
                <DynamicAnswersData html={editorAnswersData ?? ""} />
              </div>
            </div>
            <br />
          </>
        ),
      },
      {
        name: "Article",
        icon: (
          <div>
            <img src="/icons/questions_icon.svg" alt="" />
          </div>
        ),
        content: (
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
              <div className="relative">
                <NativeEditor
                  value={editorArticleData}
                  onEditorChange={(content: any, editor: any) => {
                    setEditorArticleData(editorArticleData);
                  }}
                  onSetup={(editor: any) => {
                    setEditorSetUpCompleted(true);
                  }}
                />
              </div>
            )}
          </>
        ),
        leftContent: (
          <>
            <div className="h-[30%] flex flex-col justify-start gap-4 ">
              <div className="justify-between items-center flex">
                <div className="text-slate-800  leading-none">
                  Create your next draft on the basis of your edits.
                </div>
                <button
                  onClick={() => handleNextDraft()}
                  className="p-2 opacity-90 rounded-lg shadow border border-indigo-600 justify-center items-center gap-1 flex"
                >
                  {!nextDraftLoader && <RegenerateIcon />}
                  {nextDraftLoader && (
                    <ReactLoading width={25} height={25} color={"#2563EB"} />
                  )}
                  <span className="text-indigo-600 text-base font-normal">
                    {nextDraftLoader ? "Generating...." : "Next Draft"}
                  </span>
                </button>
              </div>
              <div className="w-full justify-start items-center gap-2.5 flex">
                <div className="flex-col justify-center items-start gap-1 flex">
                  <div className="">Your Question</div>
                  <div className=" opacity-70 text-blue-950 text-base font-normal leading-none">
                    {userquestion}
                  </div>
                  <div className="flex justify-start items-center gap-2.5 flex-wrap my-2">
                    {references.map((ref) => {
                      return <Chip key={ref.id} text={ref.source} />;
                    })}
                  </div>
                </div>
              </div>
            </div>
            {/* tabs for used ideas and unused ideas */}
            <UnsedIteamTabs
              ideas={listOfIdeas}
              editTabs={editTabs}
              listOfUnusedIdeas={listOfUnusedIdeas}
              setListOfIdeas={setListOfIdeas}
              setListOfUnusedIdeas={setListOfUnusedIdeas}
            />
          </>
        ),
      },
    ],
    [
      isArticleTabReady,
      listOfIdeas,
      userquestion,
      editorAnswersData,
      editorArticleData,
      EditorSetUpCompleted,
    ]
  );
  console.log(memoizedTab);
  // const TabsList = memoizedTab;

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
    <div className="w-screen h-screen px-12 py-2">
      <style>{`.sidebar-position-left #button.sidebar{display: none;`}</style>
      <header className="w-full h-[8%] justify-between items-center flex">
        <button
          onClick={() => {
            console.log(document.referrer, window.location.host);
            if (document.referrer != window.location.host) {
              router.push("/misci");
            } else {
              router.back();
            }
          }}
        >
          <span>
            <ArrowLeftIcon className="h-5 w-5 text-gray-800" />
          </span>
        </button>
        <div className="justify-start items-center gap-4 flex">
          <button className="p-2 bg-indigo-600 rounded-lg shadow justify-center items-center gap-2.5 flex">
            <span className="-rotate-45">
              <PaperAirplaneIcon className="h-5 w-5 text-white" />
            </span>
            <span className="text-white text-base font-medium">Publish</span>
          </button>
        </div>
      </header>
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
              {memoizedTab.map((tab, index) => (
                <Tab key={tab.name} className={`outline-none`}>
                  <TabItem
                    icon={tab.icon}
                    key={index}
                    title={tab.name}
                    selected={currentTabIndex === index}
                  />
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className={"h-[95%]"}>
              {memoizedTab.map((tab, index) => (
                <Tab.Panel key={index} className={`w-full h-full flex `}>
                  <div className="w-[70%] flex  h-full ">{tab.content}</div>
                  <div
                    className="w-[30%] p-2 flex-col flex relative border-l border-gray-200 gap-6"
                    id="leftContent"
                  >
                    {tab.leftContent}
                  </div>
                </Tab.Panel>
              ))}
            </Tab.Panels>
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
    <div className="w-full  justify-between items-center gap-9 inline-flex">
      <div className="opacity-70 text-blue-950 text-base font-normal leading-none">
        {text}
      </div>
      <div className="justify-start items-start gap-4 flex">
        <div className="opacity-70 text-blue-950 text-base font-normal leading-none">
          {total}
        </div>
        <input
          type="checkbox"
          checked={selected}
          onChange={onClick}
          className="w-4 h-4 relative rounded-sm border border-slate-400"
        />
      </div>
    </div>
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
    <div className="h-[70%] ">
      <Tab.Group
        onChange={(index) => {
          setCurrentEditTabIndex(index);
        }}
        selectedIndex={currentEditTabIndex}
      >
        <Tab.List className="flex relative items-center gap-2 w-full ">
          {editTabs.map((tab: any, index: number) => (
            <Tab key={tab.name}>
              <TabItem
                icon={tab.icon}
                key={index}
                title={tab.name}
                selected={currentEditTabIndex === index}
              />
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel
            className={`w-full max-h-full flex flex-col gap-4 overflow-y-scroll  scroll-m-1 py-2`}
          >
            <div className="h-full flex flex-col gap-4">
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
                        console.log("clicked");
                        console.log(idea);
                        const newIdeas = [...ideas];
                        newIdeas[index].used =
                          newIdeas[index].used == 1 ? 0 : 1;
                        setListOfIdeas(newIdeas);
                        // setListOfUnusedIdeas([...listOfUnusedIdeas, idea]);
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
            <div className="w-full max-h-full flex flex-col gap-4 overflow-y-scroll  scroll-m-1 py-2">
              {listOfUnusedIdeas ? (
                listOfUnusedIdeas.map((idea: any, index: number) => {
                  return (
                    <IdeaItem
                      id={index.toString()}
                      text={idea.idea}
                      idea="Idea 1"
                      key={index}
                      selected={idea.used == 1 ? false : true}
                      onClick={() => {
                        console.log("clicked");
                        console.log(idea);
                        const newIdeas = [...listOfUnusedIdeas];
                        newIdeas[index].used = 1;
                        setListOfUnusedIdeas(newIdeas);
                        setListOfIdeas([...ideas, idea]);
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
