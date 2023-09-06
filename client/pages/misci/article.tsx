import { RegenerateIcon } from "@/components/localicons/localicons";
import { API_BASE_PATH } from "@/constants/apiEndpoints";
import {
  MISCI_STEP_COMPLETES_SUBSCRIPTION,
  STEP_COMPLETES_SUBSCRIPTION,
} from "@/graphql/subscription/generate";
import { generateMisci } from "@/helpers/apiMethodsHelpers";
import { jsonToHtml } from "@/helpers/helper";
import MiSciGenerateLoadingModal from "@/modals/MiSciLoadingModal";
import { classNames, getUserToken } from "@/store/appHelpers";
import { useGenerateErrorState } from "@/store/appState";
import { StepCompleteData } from "@/store/types";
import { useSubscription } from "@apollo/client";
import { Tab } from "@headlessui/react";
import {
  ArrowLeftIcon,
  Bars3BottomRightIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { Editor } from "@tinymce/tinymce-react";
import { useRouter } from "next/router";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import opener_loading from "../../lottie/opener-loading.json";
import LottiePlayer from "lottie-react";
import DOMPurify from "dompurify";
import LoaderScan from "@/components/LoaderScan";
import { Chip } from "@/components/ui/Chip";
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
  const [loadingMisciblog, setLoadingMisciblog] = React.useState(true);
  const [misciblog, setMisciblog] = React.useState<any>(null);
  const [currentTabIndex, setCurrentTabIndex] = React.useState(0);
  const [editorAnswersData, setEditorAnswersData] = React.useState<any>(null);
  const [currentEditTabIndex, setCurrentEditTabIndex] = React.useState(0);
  const [getUserIdForSubs, setGetUserIdForSubs] = useState<string | null>("");
  const [getTempIdForSubs, setGetTempIdForSubs] = useState<string | null>("");
  const [getTokenForSubs, setGetTokenForSubs] = useState<string | null>("");
  const [userAbleUserIDForSubs, setUserAbleUserIDForSubs] = useState<
    string | null
  >("");
  const [userquestion, setQuestion] = useState<string>("");
  const [listOfIdeas, setListOfIdeas] = useState<any>([]);
  const router = useRouter();
  const [EditorSetUpCompleted, setEditorSetUpCompleted] = useState(false);
  const { addMessages } = useGenerateErrorState();
  const [getToken, setGetToken] = useState<string | null>("");
  const [isArticleTabReady, setIsArticleTabReady] = useState(false);
  const [editorArticleData, setEditorArticleData] = useState<any>(null);
  const [references, setReferences] = useState<{
    id: string, source: string, url: string
  }[]>([]);
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
      console.log(step, ' from on sub data');
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

  useEffect(()=>{
    const step = subsData?.stepCompletes.step;
    // @ts-ignore
    if (step == "ANSWER_FETCHING_COMPLETED") {
      console.log("answers loaded");
      const data = subsData?.stepCompletes.data;
      setMisciblog(data);
      console.log(data);
      const aa = data?.publish_data?.find(
        (d: any) => d.platform === "answers"
      );
      console.log(aa);
      const htmlToDoc = jsonToHtml(aa?.tiny_mce_data);
      console.log(htmlToDoc);
      const question = data?.question;
      setQuestion(question);
      setEditorAnswersData((prev:string) => {
        return htmlToDoc;
      });
      setLoadingMisciblog(false);
    }
    if (step == "BLOG_GENERATION_COMPLETED") {
      console.log("IDEAS LOADED");
      console.log(subsData);
      const data = subsData?.stepCompletes.data.ideas.ideas;
      console.log(data);
      setListOfIdeas(data);
      const aa = subsData?.stepCompletes?.data?.publish_data?.find(
        (d: any) => d.platform === "wordpress"
      );
      const answers = subsData?.stepCompletes?.data?.publish_data?.find((d: any) => d.platform === "answers");
      console.log(aa);
      console.log(answers);
      const htmlDoc = jsonToHtml(aa?.tiny_mce_data);  
      console.log(htmlDoc);
      setEditorArticleData(htmlDoc);
      setIsArticleTabReady(true);
      const referencesOfArticle = subsData?.stepCompletes?.data?.references;
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
  },[subsData?.stepCompletes?.step])

  const aaa = subsData?.stepCompletes?.data?.publish_data?.find( (d: any) => d.platform === "answers");
  console.log(aaa); 
  const answersForAnwersTab = jsonToHtml(aaa?.tiny_mce_data);

  useEffect(() => {
    console.log(localStorage);
    const userId = getUserToken();
    const tempiId = localStorage.getItem("tempId");
    generateMisci({ question, userId: tempiId ?? "" })
      .then((res) => {})
      .catch((err) => {
        console.log(err);
        toast.error(err.response.data.message);
        setTimeout(() => {
          router.back();
        }, 2000);
      })
      .finally(() => {
        console.log("finally");
      });
  }, []);

  const DynamicAnswersData = ({html }: {html:string}) => {
    
    var mySafeHTML = structuredClone(html);
    mySafeHTML = DOMPurify.sanitize(mySafeHTML);
    console.log(mySafeHTML , "<< my safe html", editorAnswersData, "<< editor data");
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
                <span className="text-gray-800 text-xl font-medium leading-none">
                  We have created a personalized article for you.
                </span>
                <button
                  onClick={() => {
                    setCurrentTabIndex(1);
                  }}
                  className="p-2 opacity-50 rounded-lg shadow border border-indigo-600 justify-center items-center gap-1 flex bg-indigo-600  text-white"
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
            <div className="p-2 flex-col justify-start items-start gap-7 inline-flex">
              <div className="flex-col justify-start items-start gap-5 flex">
                <div className=" text-slate-800 text-lg font-bold leading-relaxed tracking-tight">
                  {userquestion}
                </div>
                <DynamicAnswersData  html={answersForAnwersTab ?? ""} />
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
                
                <Editor
                  value={editorArticleData}
                  apiKey="tw9wjbcvjph5zfvy33f62k35l2qtv5h8s2zhxdh4pta8kdet"
                  init={{
                    setup: (editor) => {
                      setEditorSetUpCompleted(true);
                    },
                    init_instance_callback: function (editor) {},
                    skin: "naked",
                    icons: "small",
                    toolbar_location: "bottom",
                    menubar: false,
                    statusbar: false,
                    height: "82vh",
                    images_upload_base_path: `https://pluarisazurestorage.blob.core.windows.net/nowigence-web-resources/blogs`,
                    images_upload_credentials: true,
                    plugins:
                      "preview lists code table codesample link casechange importcss tinydrive searchreplace save directionality advcode visualblocks visualchars fullscreen image link media mediaembed template codesample table charmap pagebreak nonbreaking anchor tableofcontents insertdatetime advlist lists checklist wordcount  editimage help formatpainter permanentpen pageembed charmap emoticons advtable export mergetags",
                    menu: {
                      tc: {
                        title: "Comments",
                        items: "addcomment showcomments deleteallconversations",
                      },
                    },
                    toolbar:
                      "undo redo image| bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist checklist | forecolor backcolor casechange permanentpen formatpainter removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media pageembed template link anchor codesample | a11ycheck ltr rtl | showcomments addcomment | footnotes | mergetags",
                    image_title: true,
                    automatic_uploads: true,
                    file_picker_types: "image",

                    save_onsavecallback: function () {
                      console.log("Saved");
                    },
                  }}
                  onEditorChange={(content, editor) => {
                    // setEditorAnswersData(content);
                    setEditorArticleData(content);
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
                <button className="p-2 opacity-50 rounded-lg shadow border border-indigo-600 justify-center items-center gap-1 flex">
                  <RegenerateIcon />
                  <span className="text-indigo-600 text-base font-normal">
                    Next Draft
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
                    {
                      references.map((ref) => {
                        return <Chip text={ref.source} />;
                      })
                    }
                  </div>
                </div>
              </div>
               
            </div>
            {/* tabs for used ideas and unused ideas */}
            <div className="h-[70%] ">
              <Tab.Group
                onChange={setCurrentEditTabIndex}
                defaultIndex={0}
                selectedIndex={currentEditTabIndex}
              >
                <Tab.List className="flex relative items-center gap-2 w-full ">
                  {editTabs.map((tab, index) => (
                    <Tab
                      className="flex outline-none flex-col realtive min-w-[7rem] items-start justify-center gap-2 w-fit"
                      key={tab.name}
                    >
                      <div className="flex flex-col relative">
                        <div className="text-blue-950 text-base font-medium leading-none">
                          {tab.name}
                        </div>

                        {currentEditTabIndex === index && ( // under line
                          <div className="w-full h-0.5 bg-indigo-600 rounded-lg"></div>
                        )}
                      </div>
                    </Tab>
                  ))}
                </Tab.List>
                <Tab.Panels>
                  <Tab.Panel
                    className={`w-full max-h-full flex flex-col gap-4 overflow-y-scroll  scroll-m-1 py-2`}
                  >
                    {listOfIdeas ? (
                      listOfIdeas.map((idea: any, index: number) => {
                        return (
                          <IdeaItem
                            id={index.toString()}
                            text={idea.idea}
                            idea="Idea 1"
                            key={index}
                            selected={idea.used == 1 ? false : true}
                            total={12}
                            onClick={() => {}}
                          />
                        );
                      })
                    ) : (
                      <>loading.. ideas</>
                    )}
                  </Tab.Panel>
                  <Tab.Panel className={`w-full border `}>Content 2</Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
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
        <button onClick={() => router.back()}>
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
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    classNames(
                      "rounded-lg p-2.5 text-sm font-medium leading-5 outline-none text-gray-700",
                      selected
                        ? "underline border-gray-200 text-black"
                        : "text-gray-100 hover:bg-white/[0.12]"
                    )
                  }
                >
                  <div className="flex">
                    <div className="w-5 h-5 mr-2">{tab.icon}</div>
                    <div className="text-base font-medium leading-none">
                      {tab.name}
                    </div>
                  </div>
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className={"h-[95%]"}>
              {memoizedTab.map((tab, index) => (
                <Tab.Panel key={index} className={`w-full h-full flex `}>
                  <div className="w-[60%] flex  h-full">{tab.content}</div>
                  <div
                    className="w-[40%] p-2 flex-col flex relative border-l border-gray-600 gap-6"
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

export default MiSciArticle;

interface IdeaItem {
  idea: string;
  selected: boolean;
  id: string;
  text: string;
  total: number;
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
    <div className="w-full  justify-start items-start gap-9 inline-flex">
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
