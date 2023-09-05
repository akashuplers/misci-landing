import { RegenerateIcon } from "@/components/localicons/localicons";
import { API_BASE_PATH } from "@/constants/apiEndpoints";
import {
  MISCI_STEP_COMPLETES_SUBSCRIPTION,
  STEP_COMPLETES_SUBSCRIPTION,
} from "@/graphql/subscription/generate";
import { generateMisci } from "@/helpers/apiMethodsHelpers";
import { jsonToHtml } from "@/helpers/helper";
import MiSciGenerateLoadingModal from "@/modals/MiSciLoadingModal";
import { defaultMySciAnswers } from "@/store/appContants";
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
import React, { useEffect, useState } from "react";

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
  const [EditorSetUpCompleted, setEditorSetUpCompleted] = useState(false);
  const { addMessages } = useGenerateErrorState();
  const [getToken, setGetToken] = useState<string | null>("");
  const {
    data: subsData,
    loading: subsLoading,
    error: subsError,
  } = useSubscription<StepCompleteData>(MISCI_STEP_COMPLETES_SUBSCRIPTION, {
    variables: { userId: userAbleUserIDForSubs },
    onSubscriptionComplete() {},
    onComplete() {
      console.log("completed");
    },
    onData() {
      console.log("data");
      console.log(subsData);
      console.log("sub completed");
      const data = subsData?.stepCompletes.data;
      setMisciblog(data);
      console.log(data);
      const aa = data?.publish_data?.find((d: any) => d.platform === "answers");
      console.log(aa);
      const htmlToDoc = jsonToHtml(aa?.tiny_mce_data);
      console.log(htmlToDoc);
      setEditorAnswersData(htmlToDoc);
    },
    onSubscriptionData(options) {
      console.log("sub data");
      console.log(options);
    },
  });
  console.log("SUBDATA");
  console.log(subsData);
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
      .finally(() => {
        setLoadingMisciblog(false);
      });
  }, []);

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
  const TabsList = [
    {
      name: "Answer",
      icon: <Bars3BottomRightIcon />,
      leftContent: (
        <div className="h-full bg-gray-300 bg-opacity-70 flex items-center justify-center rounded-lg flex-col gap-2">
          <span className="text-gray-800 text-xl font-medium leading-none">
            We have created a personalized article for you.
          </span>
          <button className="p-2 opacity-50 rounded-lg shadow border border-indigo-600 justify-center items-center gap-1 flex bg-indigo-600  text-white">
            <span>
              <PaperAirplaneIcon className="h-5 w-5" />
            </span>
            Go to Article
          </button>
        </div>
      ),
      content: (
        <>
          <Editor
            value={editorAnswersData}
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
              setEditorAnswersData(content);
            }}
          />
        </>
      ),
    },
    {
      name: "Article",
      icon: <Bars3BottomRightIcon />,
      content: <></>,
      leftContent: (
        <>
          <div className="h-10 justify-between items-center flex">
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
          <div className="h-14 w-full justify-start items-center gap-2.5 flex">
            <div className="flex-col justify-center items-start gap-1 flex">
              <div className="">Your Question</div>
              <div className=" opacity-70 text-blue-950 text-base font-normal leading-none">
                How Technology is Hijacking Your Mind — from a Magician and
                Google Design Ethicist
              </div>
            </div>
          </div>
          <div className="h-5 w-full justify-start items-center gap-2 flex">
            <div className="h-5 px-2.5 bg-slate-100 rounded-full justify-start items-start gap-2.5 flex">
              <div className="text-slate-800 text-base font-normal leading-3">
                Technology.pdf
              </div>
            </div>
            <div className="h-5 px-2.5 py-1 bg-slate-100 rounded-full justify-start items-start gap-px flex">
              <div className="text-slate-800 text-base font-normal leading-3">
                Hijacking.pdf
              </div>
            </div>
          </div>
          {/* tabs for used ideas and unused ideas */}
          <Tab.Group
            onChange={setCurrentEditTabIndex}
            defaultIndex={0}
            selectedIndex={currentEditTabIndex}
          >
            <Tab.List className="flex relative items-center gap-2 w-full">
              {editTabs.map((tab, index) => (
                <Tab
                  className="flex outline-none flex-col realtive min-w-[7rem] items-start justify-center gap-2 w-fit"
                  key={tab.name}
                >
                  <div className="flex flex-col relative">
                    <div className="text-blue-950 text-base font-medium leading-none">
                      {tab.name}
                    </div>
                    {tab.notificationCount > 0 && (
                      <div className="w-4 h-4 -right-4 -top-3 absolute bg-sky-100 rounded-full">
                        <div className="text-indigo-600 text-base font-medium leading-3">
                          {tab.notificationCount}
                        </div>
                      </div>
                    )}
                    {currentEditTabIndex === index && ( // under line
                      <div className="w-full h-0.5 bg-indigo-600 rounded-lg"></div>
                    )}
                  </div>
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel className={`w-full border `}>
                <IdeaItem
                  id="12"
                  text="I’m an expert on how technology hijacks our psychological vulnerabilities. That’s why I spent the last three years as a Design Ethicist at Google caring about how to design things in a way that defends a billion people’s minds from getting hijacked."
                  idea="Idea 1"
                  selected={false}
                  total={12}
                  onClick={() => {}}
                />
              </Tab.Panel>
              <Tab.Panel className={`w-full border `}>Content 2</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </>
      ),
    },
  ];

  if (loadingMisciblog) {
    return (
      <MiSciGenerateLoadingModal
        setShowGenerateLoadingModal={() => {}}
        showGenerateLoadingModal={true}
        showBackButton={false}
      />
    );
  }
  return (
    <div className="w-screen px-12 py-2">
      <header className="w-full h-10 justify-between items-center flex">
        <div>
          <span>
            <ArrowLeftIcon className="h-5 w-5 text-gray-800" />
          </span>
        </div>
        <div className="justify-start items-center gap-4 flex">
          <button className="p-2 bg-indigo-600 rounded-lg shadow justify-center items-center gap-2.5 flex">
            <span className="-rotate-45">
              <PaperAirplaneIcon className="h-5 w-5 text-white" />
            </span>
            <span className="text-white text-base font-medium">Publish</span>
          </button>
        </div>
      </header>
      <main className="flex h-full">
        <section className="w-full">
          <Tab.Group
            onChange={setCurrentTabIndex}
            defaultIndex={0}
            selectedIndex={currentTabIndex}
          >
            <Tab.List className="flex items-center gap-2 w-full">
              {TabsList.map((tab, index) => (
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
            <Tab.Panels>
              {TabsList.map((tab, index) => (
                <Tab.Panel key={index} className={`w-full border flex `}>
                  {/* {tab.content} */}

                  <div className="w-[60%] h-full">{tab.content}</div>
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
        </section>
      </main>
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