/* eslint-disable react-hooks/exhaustive-deps */
import { meeAPI } from "@/graphql/querys/mee";
import { useMutation, useQuery } from "@apollo/client";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { API_BASE_PATH, API_ROUTES } from "../constants/apiEndpoints";
import { regenerateBlog } from "../graphql/mutations/regenerateBlog";
import { ContributionCheck } from "../helpers/ContributionCheck";
import { jsonToHtml } from "../helpers/helper";
import useStore, { useByMeCoffeModal, useThreadsUIStore, useTwitterThreadStore } from "../store/store";
import AuthenticationModal from "./AuthenticationModal";
import FreshFilteredIdeaItem from "./FreshFilteredIdeaItem";
import FreshIdeaForm from "./FreshIdeaForm";
import FreshIdeaReference from "./FreshIdeaReference";
import IdeaComponent from "./IdeaComponent";
import IdeaTag, { SourceColors, SourceTab } from "./IdeaTag";
import LoaderScan from "./LoaderScan";
import MainIdeaItem from "./MainIdeaItem";
import TrialEndedModal from "./TrialEndedModal";
import UsedFilteredIdeaItem from "./UsedFilteredIdeaItem";
import UsedReference from "./UsedReference";
import { RegenerateIcon } from "./localicons/localicons";
import {
  ArrowLeftIcon,
  CheckIcon,
  DocumentIcon,
  InformationCircleIcon,
  PlusIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { ArrowLongLeftIcon, DocumentPlusIcon } from "@heroicons/react/20/solid";
import { Chip, FileComponent } from "./ui/Chip";
import { Badge } from "@radix-ui/themes";
import { DeleteRefSources } from "@/helpers/apiMethodsHelpers";
import Tooltip from "./ui/Tooltip";
export function checkFileFormatAndSize(file) {
  var extension = file?.name?.split(".").pop().toLowerCase();
  var allowedFormats = ["pdf", "docx", "txt"];

  if (!allowedFormats.includes(extension)) {
    toast.error(
      "File format is not supported. Please upload a file in PDF, DOCX, or TXT format."
    );
    return false;
  }

  if (file.size > 3 * 1024 * 1024) {
    toast.error(
      "File size is too large. Please upload a file that is less than 3MB in size."
    );
    return false;
  }

  return true;
}
const RE_BUTTON_TOPIC = {
  topic: "Current Topic",
  next: "Next Draft",
};
export default function DashboardInsights({
  loading,
  ideas,
  setIdeas,
  freshIdeas: oldFreshIdeas,
  blog_id,
  setblog_id,
  tags,
  setTags,
  freshIdeaTags: oldFreshIdeaTags,
  freshIdeasReferences,
  setFreshIdeaReferences,
  reference,
  setReference,
  setBlogData,
  setEditorText,
  setPyResTime,
  setOption,
  option,
  setNdResTime,
  refetchBlog,
  keyword,
  setInitailIdeas,
  initailIdeas
}) {
  const [enabled, setEnabled] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [formInput, setformInput] = useState("");
  const [urlValid, setUrlValid] = useState(false);
  const [file, setFile] = useState(null);
  const [inputFiles, setInputFiles] = useState([]);
  const [fileValid, setFileValid] = useState(false);
  const [arrUsed, setArrUsed] = useState([]);
  const [arrFresh, setArrFresh] = useState([]);
  const [ideaType, setIdeaType] = useState("used");
  const [regenerateData, setRegenerateData] = useState({});
  const [freshIdeas, setFreshIdeas] = useState([]);
  const [freshIdeaTags, setFreshIdeaTags] = useState([]);
  const [creditModal, setCreditModal] = useState(false);
  const [freshFilteredIdeas, setFreshFilteredIdeas] = useState([]);
  const updateCredit = useStore((state) => state.updateCredit);
  const updateisSave = useStore((state) => state.updateisSave);
  const showContributionModal = useByMeCoffeModal((state) => state.isOpen);
  const [ideasTab, setIdeasTab] = useState(0);
  const [filteredIdeas, setFilteredIdeas] = useState([]);
  const [notUniquefilteredIdeas, setNotUniqueFilteredIdeas] = useState([]);
  const { showTwitterThreadUI, setShowTwitterThreadUI } = useThreadsUIStore();
  const [currentIndexTitle, setCurrentIndexTitle] = useState("Current Topic");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const setShowContributionModal = useByMeCoffeModal(
    (state) => state.toggleModal
  );
  const [userNextSourcesCheck, setUserNextSourcesCheck] = useState(false);

  const [toggle, setToggle] = useState(true);
  const toggleClass = " transform translate-x-3";
  const creditLeft = useStore((state) => state.creditLeft);
  const [inputUrls, setinputUrls] = useState([]);
  useEffect(() => {
    setFreshIdeas(oldFreshIdeas);
  }, [oldFreshIdeas]);

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
  useEffect(() => {
    setFreshIdeaTags(oldFreshIdeaTags);
  }, [oldFreshIdeaTags]);

  const [newIdeaLoad, setNewIdeaLoad] = useState(false);

  const [regenSelected, setRegenSelected] = useState([]);

  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const [newReference, setNewReference] = useState({});
  var getToken;
  if (typeof window !== "undefined") {
    getToken = localStorage.getItem("token");
  }

  const [RegenerateBlog, { data, loading: regenLoading, error }] = useMutation(
    regenerateBlog,
    {
      context: {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken,
        },
      },
    }
  );

  const [hover, setHover] = useState(false);
  const onHover = () => {
    setHover(true);
  };

  const onLeave = () => {
    setHover(false);
  };

  function handleInputClick(idea, article_id, e) {
    const ideaObject = {
      text: idea,
      article_id,
    };

    let check = false;
    regenSelected.find((el) => {
      if (el.text === idea) {
        check = true;
        setRegenSelected((prev) => prev.filter((el) => el.text !== idea));
        return;
      }
    });
    if (check) return;

    setRegenSelected((prev) => [...prev, ideaObject]);
  }

  const [filteredArray, setFilteredArray] = useState([]);

  function handleTagClick(e) {
    e.target.classList.toggle("active");

    /* Adding or removing the keywords to an array */
    const filterText = e.target.dataset.tag;
    setFilteredArray((prev) =>
      prev.find((el) => Object.values(el).indexOf(filterText) > -1)
        ? [...prev.filter((el) => el.filterText !== filterText)]
        : [...prev, { filterText, criteria: "tag" }]
    );
  }

  function handleRefClick(e) {
    // e.target.classList.toggle("active");
    //const refCount = e.target.firstElementChild;

    /* Adding or removing the keywords to an array */
    const filterText = e.target.dataset.source;
    // loop over all the ideas and get the same filter source

    let shouldInclude = true;
    // alReadyInFilter.forEach((el) => {
    //   if (el.filterText === filterText) {
    //     shouldInclude = false;
    //     return;
    //   }
    // });
    const filteredIdeasList = [];

    const alreadyInFitlerArray = [...alReadyInFilter];
    alreadyInFitlerArray.forEach((el) => {
      if (el.filterText === filterText) {
        shouldInclude = false;
        return;
      }
    });
    if (!shouldInclude) {
      alreadyInFitlerArray.push(filterText);
    } else {
      // remove from thje
      alreadyInFitlerArray.filter((el) => el.filterText !== filterText);
    }

    if (shouldInclude) {
    } else {
      if (alreadyInFitlerArray.length === 0) {
        setFilteredIdeas([]);
      } else {
        ideas.forEach((idea) => {
          if (alreadyInFitlerArray.includes(idea?.name)) {
            filteredIdeasList.push(idea);
          }
        });
        setFilteredIdeas(filteredIdeasList);
      }
    }
    setFilteredIdeas((prev) => {
      return [...prev, filterText];
    });
    // const valueExists = filteredArray.find(
    //   (el) => Object.values(el).indexOf(filterText) > -1
    // );
    // if (valueExists) {
    //   setFilteredArray((prev) => [
    //     ...prev.filter((el) => el.filterText !== filterText),
    //   ]);
    // } else {
    //   setFilteredArray((prev) => [...prev, { filterText, criteria: "ref" }]);
    // }
    // if (!toggle) {
    //   setToggle(!toggle);
    // }
  }

  useEffect(() => {
    const fresh = document.querySelector(".idea-button.fresh");
    const used = document.querySelector(".idea-button.used");

    const tags = document.querySelectorAll(".tag-button.cta");
    const refButtons = document.querySelectorAll(".ref-button.cta");

    tags?.forEach((tag) => tag?.classList.remove("active"));
    refButtons?.forEach((btn) => btn?.classList.remove("active"));

    setFilteredArray([]);

    if (ideaType === "used") {
      fresh?.classList.remove("active");
      used?.classList.add("active");
    } else if (ideaType === "fresh") {
      fresh?.classList.add("active");
      used?.classList.remove("active");
    }
  }, [ideaType]);

  const handlesetRegenSelected = (newarr) => {
    setRegenSelected(newarr);
  };
  // Adds the matched idea into notUniqueFilteredIdeas
  useEffect(() => {
    setFilteredIdeas([]);
    setFreshFilteredIdeas([]);

    setNotUniqueFilteredIdeas([]);

    const arr = ideaType === "used" ? ideas : freshIdeas;
    // Assuming you have a state variable called 'notUniqueFilteredIdeas' and a function called 'setNotUniqueFilteredIdeas' to update it.

    filteredArray.forEach((filterObject) => {
      arr.forEach((idea) => {
        const searchObject = filterObject?.filterText;
        const doesIdeasIncludeSearchObject = idea?.idea?.includes(searchObject);
        const isIdeaNameSameAsSearchObject = idea?.name === searchObject;
        var ideaOfIdea = idea?.idea;
        // lowercase the idea
        ideaOfIdea = ideaOfIdea?.toLowerCase();
        const lowerCaseSearchObject = searchObject?.toLowerCase();
        const ideaName = idea?.name?.toLowerCase();

        if (
          filterObject?.criteria === "tag" &&
          ideaOfIdea?.includes(lowerCaseSearchObject)
        ) {
          setNotUniqueFilteredIdeas((prev) => [...prev, idea]);
        } else if (
          filterObject?.criteria === "ref" &&
          ideaName === lowerCaseSearchObject
        ) {
          setNotUniqueFilteredIdeas((prev) => [...prev, idea]);
        }
      });
    });
  }, [filteredArray]);

  // We create a set so that the values are unique, and multiple ideas are not added
  useEffect(() => {
    const uniqueFilteredSet = new Set(
      notUniquefilteredIdeas.map(JSON.stringify)
    );

    // Create a new array from the Set object
    let uniqueFilteredArray = Array.from(uniqueFilteredSet).map(JSON.parse);
    uniqueFilteredArray = uniqueFilteredArray.sort((a, b) =>
      a?.name.localeCompare(b?.name)
    );

    // Add a new property to each idea calles citation number.
    var prevLink = uniqueFilteredArray[0]?.name;
    var citationNumber = 1;
    uniqueFilteredArray.forEach((idea, index) => {
      if (idea?.name !== prevLink) {
        citationNumber++;
      }
      prevLink = idea?.name;
      idea.citationNumber = citationNumber;
      if (ideaType === "used") {
        setFilteredIdeas((prev) => [...prev, idea]);
      } else if (ideaType === "fresh") {
        setFreshFilteredIdeas((prev) => [...prev, idea]);
      }
    });
  }, [notUniquefilteredIdeas]);

  const { twitterThreadData, setTwitterThreadData } = useTwitterThreadStore();

  function handleRegenerate() {
    const arr = [];
    var flag = 0;
    if (filteredArray.length === 0) {
      for (let index = 0; index < ideas.length; index++) {
        const element = ideas[index];
        if (element.used) {
          const ideaObject = {
            text: element.idea,
            article_id: element.article_id,
          };
          arr.push(ideaObject);
        }
      }
      for (let index = 0; index < freshIdeas?.length; index++) {
        const element = freshIdeas[index];
        if (element.used) {
          const ideaObject = {
            text: element.idea,
            article_id: element.article_id,
          };
          arr.push(ideaObject);
        }
      }
      flag = 1;
    } else {
      if (arrUsed.length === 0) {
        for (let index = 0; index < ideas.length; index++) {
          const element = ideas[index];
          if (element.used) {
            const ideaObject = {
              text: element.idea,
              article_id: element.article_id,
            };
            arr.push(ideaObject);
          }
        }
      }
    }
    let newarr =
      flag === 0
        ? [...arrUsed, ...regenSelected, ...arrFresh, ...arr]
        : [...arr];
    if (
      newarr.length === 0 &&
      filteredIdeas.length &&
      filteredArray.length !== 0
    ) {
      const arr = [];
      for (let index = 0; index < filteredIdeas.length; index++) {
        const element = filteredIdeas[index];
        if (element.used) {
          const ideaObject = {
            text: element.idea,
            article_id: element.article_id,
          };
          arr.push(ideaObject);
        }
      }
      newarr = arr;
    }
    newarr.filter(
      (obj, index, self) => index === self.findIndex((t) => t.text === obj.text)
    );
    if (newarr?.length >= 1) {
      RegenerateBlog({
        variables: {
          options: {
            ideas: newarr,
            blog_id: blog_id,
            useOldWebSource: !userNextSourcesCheck,
            updatedTopic: keyword,
          },
        },
        onCompleted: (data) => {
         try{
          updateCredit();
          setBlogData(data?.regenerateBlog);
          // setInitailIdeas(data?.regenerateBlog?.ideas?.ideas);
          // setIdeas(data?.regenerateBlog?.ideas?.ideas);
          handleSelectAll(data?.regenerateBlog?.ideas?.ideas);
          setTags(data?.regenerateBlog?.tags);
          setFreshIdeaTags(data?.regenerateBlog?.freshIdeasTags);
          let referencesList = data?.regenerateBlog.references;
          let newreferencesList = referencesList.map((reference) => {
            const localId = Math.random().toString(36).substr(2, 9);
            return { ...reference, selected: false, localId };
          });
          setReference(newreferencesList);
          setFreshIdeaReferences(data?.regenerateBlog?.freshIdeasReferences);
          setFreshIdeas(data?.regenerateBlog?.freshIdeas);
          setPyResTime(data?.regenerateBlog?.pythonRespTime);
          setNdResTime(data?.regenerateBlog?.respTime);

          // const aa = data.regenerateBlog.publish_data[2].tiny_mce_data;

          const newArray = data?.regenerateBlog?.publish_data?.filter(
            (obj) => obj?.platform === "wordpress"
          );
          var aa;
          const arr = newArray.find((pd) => pd.published === false);
          if (arr) {
            aa = arr.tiny_mce_data;
          } else {
            aa = newArray[newArray.length - 1].tiny_mce_data;
          }
          const aaThreads = data?.regenerateBlog?.publish_data?.find(
            (pd) => pd?.platform === "twitter"
          );
          if (aaThreads?.threads?.length <= 0) {
            setTwitterThreadData(twitterThreadData);
          } else {
            const theLastThread =
              aaThreads.threads[aaThreads.threads.length - 1];
            // merge this will text with 2nd last tweet
            var theSecondLastThread =
              aaThreads.threads[aaThreads.threads.length - 2];
            if (
              theLastThread !== undefined &&
              theLastThread !== null &&
              theLastThread !== ""
            ) {
              // const mergedText = theSecondLastThread + " ." + theLastThread;
              if (
                theSecondLastThread === undefined ||
                theSecondLastThread === null ||
                theSecondLastThread === ""
              ) {
                theSecondLastThread = "";
              } else {
                theSecondLastThread = theSecondLastThread + " .";
              }
              const mergedText = theSecondLastThread + theLastThread;
              theSecondLastThread = mergedText;
              aaThreads.threads?.pop();
              aaThreads.threads?.pop();
              aaThreads.threads?.push(theSecondLastThread);
              setTwitterThreadData(aaThreads.threads);
            }
          }
          const htmlDoc = jsonToHtml(aa);
          setEditorText(htmlDoc);
          setArrFresh([]);
          setArrUsed([]);
          setRegenSelected([]);
          setFilteredArray([]);
          setFilteredIdeas([]);
          setFreshFilteredIdeas([]);
          // setblog_id(data.regenerateBlog._id);
          // const button = document.querySelectorAll(".blog-toggle-button");
          // button?.forEach((btn) => btn?.classList.remove("active"));
          // Array.from(button).filter(
          //   (btn) =>
          //     btn?.classList?.contains("wordpress") &&
          //     btn?.classList?.add("active")
          // );

          const fresh = document.querySelector(".idea-button.fresh");
          const used = document.querySelector(".idea-button.used");

          used?.classList?.add("active");
          fresh?.classList?.remove("active");

          setFilteredArray([]);
          setFilteredIdeas([]);
          Array.from(document.querySelectorAll(".tag-button.active")).forEach(
            (el) => el?.classList?.remove("active")
          );
          const credits = meeData?.me?.credits;
          var userCredits = meeData?.me?.totalCredits - creditLeft - 1;
          userCredits = userCredits + 2;
          const SHOW_CONTRIBUTION_MODAL = ContributionCheck(
            userCredits,
            meeData
          );
          if (SHOW_CONTRIBUTION_MODAL) {
            setShowContributionModal(true);
          }
          // setOption(prevState => prevState);
         } catch (err){
          console.log(err);
         }
        },
        onError: (error) => {
          console.error("Credit Exhaust or any other error", error.message);
          if (error.message === 'Unexpected error value: "@Credit exhausted"') {
            toast.error("Credit exhausted");
            setCreditModal(true);
          } else {
            if (error.message) {
              console.log("error", error.message);
              toast.error(error.message);
              setOpen(true);
            }
          }
        },
      })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setIdeaType("used");
          setRegenSelected([]);
          if (!toggle) {
            setToggle(!toggle);
          }
          // setFreshIdeas([]);
        });
    }
  }

  // wrtie a function to seelect all use ideas
  // function handleSelectAllUsedIdeas() {
  //   alert('running used ideas')
  // }
  function handleSelectAllUsedIdeas() {
    const updatedAllIdeas = ideas.map((el, elIndex) => {
      return {
        ...el,
        used: toggle ? 1 : 0,
      };
    });
    setIdeas(updatedAllIdeas);

    const arr = updatedAllIdeas
      .filter((element) => element.used)
      .map((element) => ({
        text: element.idea,
        article_id: element.article_id,
      }));
    handleUsedIdeas(arr);
  }
  // on change on ideas
  useEffect(() => {
    console.log("changes in ideas");

    const ideasMapWithIndex = {};
    ideas.forEach((idea, index) => {
      ideasMapWithIndex[index] = idea.used ? 1 : 0;
    });
    console.log(ideasMapWithIndex);
    const initialIdeasMapWithIndex = {};

    console.log(ideas, initailIdeas);
    initailIdeas.forEach((idea, index) => {
      initialIdeasMapWithIndex[index] = idea.used ? 1 : 0;
    });
    debugger;
    console.log(initialIdeasMapWithIndex);
    let mapsAreEqual = true;
    for (const key in ideasMapWithIndex) {
      if (ideasMapWithIndex[key] !== initialIdeasMapWithIndex[key]) {
        mapsAreEqual = false;
        break; // If a mismatch is found, no need to continue checking
      }
    }

    if (mapsAreEqual) {
      console.log("The values in the maps are the same.");
      setCurrentIndexTitle(RE_BUTTON_TOPIC.topic);
    } else {
      setCurrentIndexTitle(RE_BUTTON_TOPIC.next);
      console.log("The values in the maps are not the same.");
    }
  }, [ideas, initailIdeas]);

  function handleSelectAll() {
    if (toggle) {
      if (freshFilteredIdeas?.length > 0) {
        const updatedFilteredIdeas = freshFilteredIdeas.map((el, elIndex) => {
          return { ...el, used: 1 };
        });
        setFreshFilteredIdeas(updatedFilteredIdeas);

        var ideasCopy = [];
        for (let i = 0; i < freshIdeas.length; i++) {
          const element = freshIdeas[i];
          const f = updatedFilteredIdeas.find((pd) => pd.idea === element.idea);
          if (f) {
            ideasCopy.push(f);
          } else {
            ideasCopy.push(element);
          }
        }
        setFreshIdeas(ideasCopy);
        const arr = [];
        for (let index = 0; index < updatedFilteredIdeas.length; index++) {
          const element = updatedFilteredIdeas[index];
          if (element.used) {
            const ideaObject = {
              text: element.idea,
              article_id: element.article_id,
            };
            arr.push(ideaObject);
          }
        }
        handlefreshideas(arr);
      } else {
        const updatedIdeas = freshIdeas?.map((el, elIndex) => {
          return { ...el, used: 1 };
        });
        setFreshIdeas(updatedIdeas);
        setRegenSelected(updatedIdeas);
      }
    } else {
      if (freshFilteredIdeas?.length > 0) {
        const updatedFilteredIdeas = freshFilteredIdeas.map((el, elIndex) => {
          return { ...el, used: 0 };
        });
        setFreshFilteredIdeas(updatedFilteredIdeas);
        var ideasCopy = [];
        for (let i = 0; i < freshIdeas.length; i++) {
          const element = freshIdeas[i];
          const f = updatedFilteredIdeas.find((pd) => pd.idea === element.idea);
          if (f) {
            ideasCopy.push(f);
          } else {
            ideasCopy.push(element);
          }
        }
        setFreshIdeas(ideasCopy);
        const arr = [];
        for (let index = 0; index < updatedFilteredIdeas.length; index++) {
          const element = updatedFilteredIdeas[index];
          if (element.used) {
            const ideaObject = {
              text: element.idea,
              article_id: element.article_id,
            };
            arr.push(ideaObject);
          }
        }
        handlefreshideas(arr);
      } else {
        const updatedIdeas = freshIdeas?.map((el, elIndex) => {
          return { ...el, used: 0 };
        });
        setFreshIdeas(updatedIdeas);
        setRegenSelected(updatedIdeas);
      }
    }
  }
  function handleFileUpload({ target }) {
    const selectFiles = target.files;
    let fileSizesMoreThan3MB = false;

    for (let i = 0; i < selectFiles.length; i++) {
      const file = selectFiles[i];

      // Check file format and size for each file
      if (!checkFileFormatAndSize(file)) {
        return;
      }

      const fileSizeMB = file.size / (1024 * 1024); // Convert size to MB
      if (fileSizeMB > 3) {
        fileSizesMoreThan3MB = true;
        break; // Stop checking if one file exceeds the size limit
      }
    }

    if (fileSizesMoreThan3MB) {
      toast.error("File size cannot exceed 3MB");
      return; // Stop function execution after showing the error
    }

    const newFiles = Array.from(selectFiles);
    setInputFiles((prev) => {
      return [...prev, ...newFiles];
    });
    console.log(inputFiles);
  }

  function handleFormChange(e) {
    const value = e.target.value;
    setformInput(value);

    if (fileValid) {
      setFileValid(false);
    }
  }

  const handlefreshideas = (arr) => {
    setArrFresh(arr);
  };

  const handleUsedIdeas = (arr) => {
    setArrUsed(arr);
  };

  function postFormData(e, type = "File") {
    e.preventDefault();
    setNewIdeaLoad(true);
    const getToken = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const tempId = localStorage.getItem("tempId");
    let user_id;
    if (getToken) {
      user_id = userId;
    } else {
      user_id = tempId;
    }
    // Define the base URL and the raw data object
    let url = API_BASE_PATH;
    let raw = {};

    if (type === "File") {
      // For file uploads
      url += API_ROUTES.FILE_UPLOAD;
      raw = new FormData();
      console.log(inputFiles);
      // raw.append("files", inputFiles[0], inputFiles[0].name);
      for (const file of inputFiles) {
        raw.append("files", file, file.name);
      }
      raw.append("userId", user_id);
      raw.append("blog_id", blog_id);
    } else if (type === "URL") {
      // For URL uploads
      if (newReference.source !== "") {
        url += API_ROUTES.URL_UPLOAD;
        const urls = [newReference.source];
        setinputUrls((prev) => [...prev, newReference.source]);
        raw = JSON.stringify({
          urls: urls,
          blog_id: blog_id,
          userId: user_id,
        });
        setNewReference((prev) => {
          return { ...prev, source: "" };
        });
      }
    } else {
      // For keyword uploads
      url += API_ROUTES.KEYWORD_UPLOAD;
      raw = JSON.stringify({
        keyword: formInput,
        blog_id: blog_id,
        userId: user_id,
      });
    }

    const headers = new Headers();
    if (type === "File") {
      headers.delete("Content-Type"); // Remove Content-Type for FormData
    } else {
      headers.append("Content-Type", "application/json"); // Set Content-Type for JSON
    }
    headers.append("Authorization", "Bearer " + getToken);

    console.log(headers);
    const config = {
      method: "post",
      headers: headers,
      body: raw,
    };

    fetch(url, config)
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        if (response.type != "SUCCESS") {
          toast.error(response.message);
          return;
        }
        toast.success(response.message);
      })
      .finally(() => {
        refetchBlog().then((res) => {
          setformInput("");
          setFileValid(false);
          setUrlValid(false);
          setInputFiles([]);
          setNewIdeaLoad(false);
        });
      })
      .catch((err) => {
        setformInput("");
        setFileValid(false);
        setUrlValid(false);
        setInputFiles([]);
        setNewIdeaLoad(false);
      });
  }

  function handleSetIdeas(ideas) {
    // add a new properly initailUsedd = used
    const newIdeas = ideas.map((idea) => {
      return { ...idea, initailUsed: idea.used };
    });
    setIdeas(newIdeas);
    setInitailIdeas(newIdeas);
  }

  function handleRefDelete(id) {
    const payload = {
      blogId: blog_id,
      sourceId: id,
    };
    DeleteRefSources(payload).then((res) => {
      if (res.type != "SUCCESS") {
        toast.error(res.message);
        return;
      }

      if (res.status === 500) {
        toast.error("Something went wrong");
        return;
      }
      toast.success(res.message);
      refetchBlog();
    });
  }

  useEffect(() => {
    var expression =
      /[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)?/gi;
    var regex = new RegExp(expression);
    setUrlValid(checkDataforUrl(regex));

    function checkDataforUrl(regex) {
      // Regular expression for URL validation
      var pattern = new RegExp(
        "^(https?:\\/\\/)?" + // protocol
          "((([a-zA-Z\\d]([a-zA-Z\\d-]{0,61}[a-zA-Z\\d])?)\\.)+[a-zA-Z]{2,})(:\\d{2,5})?" + // domain name and optional port
          "(\\/[-a-zA-Z\\d%@_.~+&:]*)*" + // path
          "(\\?[;&a-zA-Z\\d%@_.,~+&:=-]*)?" + // query string
          "(\\#[-a-zA-Z\\d_]*)?$",
        "i"
      ); // fragment locator
      return pattern.test(formInput);
    }
  }, [formInput]);

  const [alReadyInFilter, setAlReadyInFilter] = useState([]);
  const [authenticationModalOpen, setAuthenticationModalOpen] = useState(false);
  const [authenticationModalType, setAuthneticationModalType] =
    useState("signup");
  var Gbid;
  if (typeof window !== "undefined") {
    Gbid = localStorage.getItem("Gbid");
  }

  function handleCitationFunction(idea) {
    const idOfIdea = idea?.article_id;
    const count = getCount(idOfIdea);
    return count;
  }

  function toTitleCase(str) {
    if (!str) return;
    let titleCase = "";
    let words = str.toLowerCase().split(" ");

    for (let i = 0; i < words.length; i++) {
      let word = words[i];
      titleCase += word.charAt(0).toUpperCase() + word.slice(1) + " ";
    }

    return titleCase.trim();
  }
  let sortedRefAr = [];
  let sortedIdeas = [];
  let filteredSortedIdeas = [];
  let newFilteredIdeas = [];

  let letRefIdMapWithArticleId = {};

  const allReferenceWithSelectedTrue =
    reference?.filter((el) => el.selected === true) || [];

  const idCountMap = {};
  reference.forEach((item) => {
    const id = item.id;
    idCountMap[id] = 0;
  });
  ideas.forEach((item) => {
    const id = item.article_id;
    if (idCountMap[id] !== undefined && idCountMap[id] !== null) {
      idCountMap[id] = (idCountMap[id] || 0) + 1;
    }
  });
  function getIndexByKey(keyToFind) {
    let keys = Object.keys(idCountMap);

    for (let i = 0; i < keys.length; i++) {
      if (keys[i] === keyToFind) {
        return i + 1;
      }
    }

    return 0; // Return -1 if the key is not found in the object
  }

  function getCount(id) {
    return idCountMap[id] || 0;
  }

  ideas?.forEach((idea) => {
    if (allReferenceWithSelectedTrue.length > 0) {
      allReferenceWithSelectedTrue.forEach((ref) => {
        if (idea?.article_id === ref?.id) {
          newFilteredIdeas.push(idea);
        }
      });
    } else {
      newFilteredIdeas = [];
    }
  });

  if (ideasTab === 0) {
    sortedRefAr = reference?.filter((el) => el.type == "web") || [];
    sortedIdeas = ideas?.filter((el) => el.type == "web") || [];
    if (filteredIdeas.length > 0) {
      filteredSortedIdeas =
        filteredIdeas?.filter((el) => el.type == "web") || [];
    }
  } else if (ideasTab === 1) {
    sortedRefAr = reference?.filter((el) => el.type == "url") || [];
    sortedIdeas = ideas?.filter((el) => el.type == "url") || [];
    if (filteredIdeas.length > 0) {
      filteredSortedIdeas =
        filteredIdeas?.filter((el) => el.type == "url") || [];
    }
  } else if (ideasTab === 2) {
    sortedRefAr = reference?.filter((el) => el.type == "file") || [];
    sortedIdeas = ideas?.filter((el) => el.type == "file") || [];
    if (filteredIdeas?.length > 0) {
      filteredSortedIdeas =
        filteredIdeas?.filter((el) => el.type == "file") || [];
    }
  } else {
    sortedRefAr = [...reference];
    sortedIdeas = [...ideas];
    if (filteredIdeas.length > 0) {
      filteredSortedIdeas = [];
    }
  }
  console.log("sortedRef");
  console.log(sortedRefAr);
  function handleIdeasTabClick(index) {
    setIdeasTab((prev) => {
      return index;
    });
  }
  // newFilteredIdeas = newFilteredIdeas.filter((idea, index, self) => {}))
  const uniqueIdeas = new Set();
  newFilteredIdeas = newFilteredIdeas.filter((idea) => {
    if (!uniqueIdeas.has(idea.tempId)) {
      uniqueIdeas.add(idea.tempId);
      return true;
    }
    return false;
  });
  if (loading || regenLoading) return <LoaderScan />;
  return (
    <>
      <AuthenticationModal
        type={authenticationModalType}
        setType={setAuthneticationModalType}
        modalIsOpen={authenticationModalOpen}
        setModalIsOpen={setAuthenticationModalOpen}
        handleSave={() => (window.location = "/dashboard/" + blog_id)}
        bid={blog_id}
      />
      <Modal
        isOpen={isOpen}
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
            height: "400px",
            // width: "100%",
            maxWidth: "450px",
            bottom: "",
            zIndex: "999",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            padding: "30px",
            paddingBottom: "30px",
          },
        }}
      >
        <div className="mx-auto h-[150px] w-[100px]">
          <Image
            src="/time-period-icon.svg"
            alt="Timeout image"
            height={150}
            width={150}
          />
        </div>

        <p className="text-gray-500 text-base font-medium mt-4 mx-auto pl-5">
          We regret that it is taking more time to generate the blog right now.
          We appreciate that you want to try our blog creation service and we
          are eager to serve, only that we request you to try after some time.
        </p>
        <div className="m-9 mx-auto">
          <button
            className="w-[240px] ml-16 bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 border border-indigo-700 rounded"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
          {/* <button className="w-[240px] ml-9 bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded text-sm"></button> */}
        </div>
      </Modal>
      {creditModal && (
        <TrialEndedModal setTrailModal={setCreditModal} topic={null} />
      )}
      <div
        className="text-xs px-2 mb-24 lg:mb-0 h-full"
        style={{ borderLeft: "2px solid #d2d2d2" }}
        id="regenblog"
      >
        <div>
          {/* h1 Insight only for mobile screens */}
          <h1 className="pt-[0.65em] font-semibold">WORKSPACE</h1>
          <div className="flex jusify-between gap-[1.25em]">
            <p className="font-normal w-[100%] lg:w-[70%] text-sm">
              Create your next draft on the basis of your edits and uploads.
            </p>
            <button
              className="cta flex items-center gap-2 self-start !py-2 !font-semibold"
              onClick={
                isAuthenticated
                  ? handleRegenerate
                  : () => {
                      updateisSave();
                      setAuthenticationModalOpen(true);
                    }
              }
            >
              <RegenerateIcon />
              {currentIndexTitle}
            </button>
          </div>

          <div>
            <div className="flex justify-between w-full items-start py-2 flex flex-col">
              <h3 className="pt-[0.65em] font-semibold">Draft Topic</h3>
              <div className="opacity-70 text-gray-800 text-sm font-normal capitalize">
                {keyword}
              </div>
            </div>
          </div>
          <div>
            <div className="flex gap-2 justify-start w-full items-center py-2">
              <h3 className="font-semibold">Sources</h3>
              <Tooltip content="Lille's AI dynamically curates these sources from the internet to inspire your articles and provide relevant ideas.">
                <InformationCircleIcon className="h-4 w-4 text-gray-500" />
              </Tooltip>
            </div>
            <div className="flex items-center gap-2 py-1.5">
              <SourceTab
                SourceColor={"yellow"}
                title={"Web"}
                selected={ideasTab == 0}
                onClick={() => {
                  if (isAuthenticated) {
                    handleIdeasTabClick(0);
                  } else {
                    setAuthenticationModalOpen(true);
                  }
                }}
              />
              <SourceTab
                SourceColor={"orange"}
                title={"My Urls"}
                onClick={() => {
                  if (isAuthenticated) {
                    handleIdeasTabClick(1);
                  } else {
                    setAuthenticationModalOpen(true);
                  }
                }}
                selected={ideasTab == 1}
              />
              <SourceTab
                SourceColor={"blue"}
                title={"My Documents"}
                onClick={() => {
                  if (isAuthenticated) {
                    handleIdeasTabClick(2);
                  } else {
                    setAuthenticationModalOpen(true);
                  }
                }}
                selected={ideasTab == 2}
              />
            </div>

            <div
              className={` filebarScrollable flex gap-[0.5em] my-2 flex-wrap max-h-[60px] overflow-y-scroll overflow-x-hidden !pb-0 -z-10 ${sortedRefAr.length > 0 ? "h-[50px]" : "hidden"}
              `}
              style={{ padding: "0.75em 0.5em" }}
            >
              {
                !isAuthenticated && <div
                 onClick={() => {
                  if (isAuthenticated) {
                    console.log('no changes');
                  } else {
                    setAuthenticationModalOpen(true);
                  }
                }}
                 className="flex flex-row gap-2 flex-wrap max-h-[80px] z-30 overflow-y-scroll overflow-x-hidden absolute w-full h-full border-red-500 bg-transparent">
                  </div> 
              }
              {ideaType === "used" ? (
                reference?.length > 0 ? (
                  sortedRefAr?.map((ref, index) => {
                    return (
                      <UsedReference
                        key={index}
                        type={ref.type}
                        idCountMap={getIndexByKey}
                        reference={ref}
                        index={index}
                        setReference={setReference}
                        handleCitationFunction={handleCitationFunction}
                        handleRefClick={handleRefClick}
                        onDelete={() => handleRefDelete(ref.id)}
                        hideTrashIcon={ideasTab==0}
                      />
                    );
                  })
                ) : (
                  <div>Used Idea sources not found</div>
                )
              ) : freshIdeasReferences?.length > 0 ? (
                freshIdeasReferences?.map((ref, index) => {
                  return ref.source !== "file" ? (
                    <FreshIdeaReference
                      key={index}
                      reference={ref}
                      index={index}
                      handleRefClick={handleRefClick}
                    />
                  ) : (
                    <div>File upload does not contain sources. </div>
                  );
                })
              ) : (
                <div>Generate fresh ideas to see sources</div>
              )}
            </div>
            {ideasTab == 0 && (
              <>
                <div className="w-full justify-between pr-5 items-center  inline-flex">
                  <div className="opacity-70 text-gray-800 text-xs font-normal">
                    Use New Sources in Next Draft
                  </div>
                  <div className="relative rounded-sm border-none border-slate-400">
                    <div class="inline-flex items-start">
                      <label
                        class="relative flex justify-center cursor-pointer items-center rounded-full p-3"
                        for="checkbox-1"
                        data-ripple-dark="true"
                      >
                        <input
                          type="checkbox"
                          class={`before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity hover:before:opacity-10 `}
                          id="checkbox-1"
                          checked={userNextSourcesCheck}
                          onChange={(e) => {
                            setUserNextSourcesCheck(e.target.checked);
                          }}
                          style={{}}
                        />
                        <div class="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-3.5 w-3.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            stroke="currentColor"
                            stroke-width="1"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clip-rule="evenodd"
                            ></path>
                          </svg>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}
            {ideasTab == 1 && (
              <div className="px-4 flex flex-col gap-3 filebarScrollable">
                <div className="flex flex-row gap-2 flex-wrap max-h-[80px] overflow-y-scroll">
                  {inputUrls.length > 0 &&
                    inputUrls.map((url, index) => {
                      return (
                        <Chip
                          key={index}
                          onDelete={() => {
                            setinputUrls((prev) => {
                              return prev.filter((el, i) => i !== index);
                            });
                          }}
                          wholeData={index}
                          text={url}
                        />
                      );
                    })}
                </div>
                <div>
                  <div className="w-full h-full justify-start items-center gap-3 inline-flex">
                    <ArrowLongLeftIcon className="w-6 h-6 text-indigo-500" />
                    <input
                      className="grow shrink basis-0 h-full px-2.5 py-2 rounded-lg border border-indigo-500 border-opacity-20 justify-start items-start gap-2.5 flex"
                      value={newReference.source}
                      onChange={(e) => {
                        setNewReference((prev) => {
                          return { ...prev, source: e.target.value };
                        });
                      }}
                      placeholder="Add URL"
                    />
                    <button
                      className="w-6 h-6 relative  textSuperman-indigo-500 bg-slate-100 rounded-sm border"
                      onClick={(event) => {
                        if (newReference.source.trim().length > 0) {
                          setinputUrls((prev) => {
                            return [...prev, newReference.source];
                          });
                        }
                        setNewReference((prev) => {
                          return { ...prev, source: "" };
                        });
                      }}
                    >
                      {<PlusIcon />}
                    </button>
                  </div>
                </div>
                <div>
                  <button
                    className="w-6 h-6 relative  text-indigo-500 bg-slate-100 rounded-sm border"
                    onClick={(event) => {
                      postFormData(event, "URL");
                    }}
                  >
                    {<CheckIcon />}
                  </button>
                </div>
              </div>
            )}
            {ideasTab == 2 && (
              <div className="px-4 flex flex-col gap-3">
                <div className="flex w-full items-end gap-2 justify-between">
                  <div className="w-full">
                    {inputFiles?.length > 0 ? (
                      inputFiles.map((file, index) => {
                        return (
                          <FileComponent
                            key={index}
                            name={file.name}
                            size={Math.round(file.size / 1000) + "KB"}
                            fileData={index}
                            onDelete={(index) => {
                              setInputFiles((prev) => {
                                return prev.filter((el, i) => i !== index);
                              });
                            }}
                          />
                        );
                      })
                    ) : (
                      <label htmlFor="input-file">
                        <FileComponent name="No file chosen" size="" />
                      </label>
                    )}
                  </div>
                  <div className="w-[5%] h-full my-1 justify-end flex-col items-end gap-3 inline-flex">
                    <label
                      htmlFor="input-file"
                      className="w-6 h-6 relative  text-indigo-500 bg-slate-100 rounded-sm border"
                    >
                      {file == null ? <PlusIcon /> : <CheckIcon />}
                    </label>
                  </div>
                </div>
                <buttton
                  className="w-6 h-6 relative  text-indigo-500 bg-slate-100 rounded-sm border"
                  onClick={postFormData}
                >
                  <CheckIcon />
                </buttton>
                <input
                  multiple={true}
                  id="input-file"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="flex py-2 relative gap-5">
            <button
              className="idea-button cta used m-2 ml-0 active !px-[0.4em] !py-[0.25em] !text-xs flex items-center justify-around gap-1"
              onClick={(e) => {
                setIdeaType("used");
              }}
            >
              <div className={`bg-blue-500 w-1.5 h-1.5  rounded-full`} />
              Idea
              <span className="mx-auto bg-blue-200 text-[10px] w-[20px] h-[20px] flex items-center justify-center font-bold text-sky-800 rounded-full absolute left-[102%] top-[50%] translate-y-[-50%]">
                {/* {ideas?.length} */}
                {newFilteredIdeas?.length > 0
                  ? newFilteredIdeas?.length
                  : ideas?.length}
              </span>
            </button>
          </div>

          <div>
            {newIdeaLoad == false ? (
              <div className="dashboardInsightsUsedSectionHeight overflow-y-scroll p-2 overflow-x-hidden">
                {newFilteredIdeas?.length > 0
                  ? newFilteredIdeas?.map((idea, index) => {
                    return (
                      <>
                       <UsedFilteredIdeaItem
                         key={index}
                         index={index}
                         idea={idea}
                         idCountMap={getIndexByKey}
                         filteredIdeas={newFilteredIdeas}
                         setFilteredIdeas={setFilteredIdeas}
                         ideas={ideas}
                         setIdeas={setIdeas}
                         typeOfIdea={idea?.type}
                         handleUsedIdeas={handleUsedIdeas}
                         handleCitationFunction={handleCitationFunction}
                       />
                 
                      <br />
                 
                      </>
                    );
                  })
                  : ideas?.map((idea, index) => (
                      <MainIdeaItem
                        key={index}
                        index={index}
                        idCountMap={getIndexByKey}
                        idea={idea}
                        ideas={ideas}
                        typeOfIdea={idea?.type}
                        setIdeas={setIdeas}
                        handleUsedIdeas={handleUsedIdeas}
                        handleCitationFunction={handleCitationFunction}
                      />
                    ))}
              </div>
            ) : (
              <div className="flex justify-center items-center">
                <LoaderScan />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
