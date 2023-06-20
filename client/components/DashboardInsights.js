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
import IdeaTag from "./IdeaTag";
import LoaderScan from "./LoaderScan";
import MainIdeaItem from "./MainIdeaItem";
import TrialEndedModal from "./TrialEndedModal";
import UsedFilteredIdeaItem from "./UsedFilteredIdeaItem";
import UsedReference from "./UsedReference";
import { RegenerateIcon } from "./localicons/localicons";
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
}) {
  const [enabled, setEnabled] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [formInput, setformInput] = useState("");
  const [urlValid, setUrlValid] = useState(false);
  const [file, setFile] = useState(null);
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

  const [filteredIdeas, setFilteredIdeas] = useState([]);
  const [notUniquefilteredIdeas, setNotUniqueFilteredIdeas] = useState([]);
  const { showTwitterThreadUI, setShowTwitterThreadUI } = useThreadsUIStore();

  const setShowContributionModal = useByMeCoffeModal(
    (state) => state.toggleModal
  );
  const [toggle, setToggle] = useState(true);
  const toggleClass = " transform translate-x-3";
  const creditLeft = useStore((state) => state.creditLeft);

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
    console.log("regenSelected", regenSelected);
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
    e.target.classList.toggle("active");
    //const refCount = e.target.firstElementChild;

    /* Adding or removing the keywords to an array */
    console.log("e.target.dataset", e.target.dataset, filteredArray);
    const filterText = e.target.dataset.source;

    const valueExists = filteredArray.find(
      (el) => Object.values(el).indexOf(filterText) > -1
    );
    if (valueExists) {
      setFilteredArray((prev) => [
        ...prev.filter((el) => el.filterText !== filterText),
      ]);
    } else {
      setFilteredArray((prev) => [...prev, { filterText, criteria: "ref" }]);
    }
    if (!toggle) {
      setToggle(!toggle);
    }

    console.log("setFilteredArray", filteredArray);
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
  useEffect(() => {
    console.log("Ideas", ideas);
  }, [ideas]);

  // Adds the matched idea into notUniqueFilteredIdeas
  useEffect(() => {
    setFilteredIdeas([]);
    setFreshFilteredIdeas([]);

    setNotUniqueFilteredIdeas([]);

    const arr = ideaType === "used" ? ideas : freshIdeas;
    console.log("IDEAS PROPS");
    console.log(ideas);
    // Assuming you have a state variable called 'notUniqueFilteredIdeas' and a function called 'setNotUniqueFilteredIdeas' to update it.

    filteredArray.forEach((filterObject) => {
      arr.forEach((idea) => {
        console.log("IDEA");
        console.log(idea);
        const searchObject = filterObject?.filterText;
        console.log("CRITERIA : ", filterObject?.criteria);
        const doesIdeasIncludeSearchObject = idea?.idea?.includes(searchObject);
        console.log("DOES IDEA INCLUDE SEARCH OBJECT", doesIdeasIncludeSearchObject);

        const isIdeaNameSameAsSearchObject = idea?.name === searchObject;
        console.log("IS IDEA NAME SAME AS SEARCH OBJECT", isIdeaNameSameAsSearchObject);
        var ideaOfIdea = idea?.idea;
        // lowercase the idea
        ideaOfIdea = ideaOfIdea?.toLowerCase();
        const lowerCaseSearchObject = searchObject?.toLowerCase();
        const ideaName = idea?.name?.toLowerCase();

        if (filterObject?.criteria === "tag" && ideaOfIdea?.includes(lowerCaseSearchObject)) {
          console.log('idea is in IDEA');
          console.log(idea);
          setNotUniqueFilteredIdeas((prev) => [...prev, idea]);
        } else if (filterObject?.criteria === "ref" && ideaName === lowerCaseSearchObject) {
          console.log('IDEA IN NOT UNIQUE FILTERED TAG');
          console.log(idea);
          setNotUniqueFilteredIdeas((prev) => [...prev, idea]);
        }
      });
    });

  }, [filteredArray]);

  // We create a set so that the values are unique, and multiple ideas are not added
  useEffect(() => {
    // Create a new Set object from the array, which removes duplicates
    console.log('NOT UNQITE FILTER IDEAS HERE');
    console.log(notUniquefilteredIdeas)
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
      console.log('IDeA TO BE ADDED');
      if (ideaType === "used") {
        setFilteredIdeas((prev) => [...prev, idea]);
      } else if (ideaType === "fresh") {
        setFreshFilteredIdeas((prev) => [...prev, idea]);
      }
    });
  }, [notUniquefilteredIdeas]);


  // keep this for de-bugging
  useEffect(() => {
    console.log('FILTERD ARRAY');
    console.log('IDEA TYPE');
    console.log(ideaType);
    console.log(filteredArray);
    console.log('FILTER IDEAS');
    console.log(filteredIdeas);
  }, [filteredIdeas]);
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
      console.log("111", arr);
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
      console.log("222", arr);
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
      console.log("888", newarr, arrUsed, regenSelected, arrFresh);
      RegenerateBlog({
        variables: {
          options: {
            ideas: newarr,
            blog_id: blog_id,
          },
        },
        onCompleted: (data) => {
          console.log("regen", data);
          updateCredit();
          setBlogData(data?.regenerateBlog);
          setIdeas(data?.regenerateBlog?.ideas?.ideas);
          setTags(data?.regenerateBlog?.tags);
          setFreshIdeaTags(data?.regenerateBlog?.freshIdeasTags);
          setReference(data?.regenerateBlog?.references);
          setFreshIdeaReferences(data?.regenerateBlog?.freshIdeasReferences);
          setFreshIdeas(data?.regenerateBlog?.ideas?.freshIdeas);
          // setTwitterThreadData(data?.regenerateBlog?.publish_data)
          // const aa = data?.regenerateBlog?.publish_data?.find(
          //   (pd) => pd?.platform === "twitter"
          // );
          console.log(
            "asfgasfda ",
            data?.regenerateBlog?.pythonRespTime,
            data?.regenerateBlog?.respTime
          );
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
          console.log(aaThreads.threads);
          if (aaThreads?.threads?.length <= 0) {
            setTwitterThreadData(twitterThreadData)
          } else {
            const theLastThread = aaThreads.threads[aaThreads.threads.length - 1];
            // merge this will text with 2nd last tweet
            var theSecondLastThread = aaThreads.threads[aaThreads.threads.length - 2];
            if (theLastThread !== undefined && theLastThread !== null && theLastThread !== "") {
              const mergedText = theSecondLastThread + " ." + theLastThread;
              theSecondLastThread = mergedText;
              aaThreads.threads.pop();
              aaThreads.threads.pop();
              aaThreads.threads.push(theSecondLastThread);
              console.log("THREADS DATA AFTER MERGE");
              console.log(aaThreads.threads);
              setTwitterThreadData(aaThreads.threads);
            }
          }

          const htmlDoc = jsonToHtml(aa);
          setEditorText(htmlDoc);

          console.log("Sucessfully re-generated the article");
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
          console.log(data);
          console.log("MEE DATA");
          console.log(meeData);
          const credits = meeData?.me?.credits;
          console.log("CREDITS : " + credits);
          var userCredits = meeData?.me?.totalCredits - creditLeft - 1;
          console.log("USER CREDITS: " + userCredits);
          userCredits = userCredits + 2;
          const SHOW_CONTRIBUTION_MODAL = ContributionCheck(
            userCredits,
            meeData
          );
          console.log("SHOW_CONTRIBUTION_MODAL: ", SHOW_CONTRIBUTION_MODAL);
          if (SHOW_CONTRIBUTION_MODAL) {
            setShowContributionModal(true);
          }
          setOption(option);
        },
        onError: (error) => {
          console.error("Credit Exhaust or any other error", error.message);
          if (error.message === 'Unexpected error value: "@Credit exhausted"') {
            toast.error("Credit exhausted");
            setCreditModal(true);
          } else {
            if (error.message) {
              console.log("error", error.message);
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

  function handleSelectAll() {
    if (toggle) {
      if (freshFilteredIdeas?.length > 0) {
        const updatedFilteredIdeas = freshFilteredIdeas.map((el, elIndex) => {
          return { ...el, used: 1 };
        });
        setFreshFilteredIdeas(updatedFilteredIdeas);
        console.log(
          "updatedFilteredIdeas",
          updatedFilteredIdeas,
          freshFilteredIdeas
        );
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
        console.log(
          "updatedFilteredIdeas",
          updatedFilteredIdeas,
          freshFilteredIdeas
        );
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
    const FORMATCHECK = checkFileFormatAndSize(target.files[0]);
    // alert(FORMATCHECK, "FORMATCHECK")
    if (!FORMATCHECK) {
      return;
    }
    setFileValid(true);
    setUrlValid(false);

    const file = target.files[0];

    // Check if file is defined
    if (!file) {
      toast.error("No file chosen");
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024); // convert size to MB

    if (fileSizeMB > 3) {
      toast.error("File size cannot exceed 3MB");
      return; // stop function execution after showing the error
    }

    setformInput(file.name);
    console.log(file);
    setFile(file);
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
  function checkFileFormatAndSize(file) {
    var extension = file.name.split(".").pop().toLowerCase();
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
  function postFormData(e) {
    e.preventDefault();
    setNewIdeaLoad(true);

    let url = API_BASE_PATH;
    let raw;
    console.log(raw);
    if (fileValid) {
      url += API_ROUTES.FILE_UPLOAD;
      raw = new FormData();
      raw.append("file", file);
      raw.append("blog_id", blog_id);
    } else if (urlValid) {
      url += API_ROUTES.URL_UPLOAD;
      raw = {
        url: formInput,
        blog_id: blog_id,
      };
    } else {
      url += API_ROUTES.KEYWORD_UPLOAD;
      raw = {
        keyword: formInput,
        blog_id: blog_id,
      };
    }

    const myHeaders = {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    if (!fileValid) {
      myHeaders["Content-Type"] = "application/json";
    }

    const config = {
      method: "post",
      url: url,
      headers: myHeaders,
      data: raw,
    };

    axios(config)
      .then((response) => {
        setIdeaType("fresh");
        console.log(response.data);
        setFreshIdeas(response.data.data);
        setFreshIdeaReferences(response.data.references);
        setFreshIdeaTags(response.data.freshIdeasTags);

        setPyResTime(response.data.pythonRespTime);
        setNdResTime(response.data.respTime);
        console.log(freshIdeas);
        const fresh = document.querySelector(".idea-button.fresh");
        const used = document.querySelector(".idea-button.used");

        used.classList.remove("active");
        fresh.classList.add("active");
      })
      .catch((error) => {
        console.log("error", error);
         toast.error(error?.response?.data?.message || 'Host has denied the extraction from this URL. Please try again or try some other URL.', {
    autoClose: 10000, // 10 seconds
  });
      })
      .finally(() => {
        setformInput("");
        setFileValid(false);
        setUrlValid(false);

        setNewIdeaLoad(false);
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
      // console.log(formInput)
      return pattern.test(formInput);
    }
  }, [formInput]);

  const [authenticationModalOpen, setAuthenticationModalOpen] = useState(false);
  const [authenticationModalType, setAuthneticationModalType] =
    useState("signup");
  var Gbid;
  if (typeof window !== "undefined") {
    Gbid = localStorage.getItem("Gbid");
  }

  function handleCitationFunction(source) {
    let filtered;
    // console.log(link)
    if (ideaType === "used") {
      reference.forEach((el, index) => {
        // console.log("elll", el, source);
        if (el.source === source) {
          filtered = index;
        }
      });
    } else if (ideaType === "fresh") {
      freshIdeasReferences.forEach((el, index) => {
        // console.log(el.url, link);
        if (el.source === source) {
          filtered = index;
        }
      });
    }

    if (filtered === 0 || filtered) {
      return filtered + 1;
    } else {
      // console.log(link, reference, "search")
      return null;
    }
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
            class="w-[240px] ml-16 bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 border border-indigo-700 rounded"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
          {/* <button class="w-[240px] ml-9 bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded text-sm"></button> */}
        </div>
      </Modal>
      {creditModal && (
        <TrialEndedModal setTrailModal={setCreditModal} topic={null} />
      )}
      <div className="text-xs px-2 mb-24 lg:mb-0" style={{ borderLeft: "2px solid #d2d2d2" }} id="regenblog">
        <div className="flex justify-between gap-[1.25em]">
          <p className="font-normal w-[70%]">
            Regenerate your blog on the basis of selected used & fresh ideas.
          </p>
          <button
            className="cta flex items-center gap-2 self-start !py-2 !font-semibold"
            onClick={
              isAuthenticated
                ? handleRegenerate
                : () => {
                  updateisSave();
                  // setAuthenticationModalOpen(true);
                }
            }
          >
            <RegenerateIcon />
            Regenerate
          </button>
        </div>

        {tags?.length > 0 && (
          <div>
            <div className="flex justify-between w-full items-center py-2">
              <p className="pt-[0.65em] font-semibold">Filtering Keywords</p>
            </div>
            <div
              className="flex gap-[0.5em] flex-wrap h-full lg:max-h-[60px] overflow-x-hidden overflow-y-scroll !pb-0"
              style={{ padding: "0.75em 0.25em" }}
            >
              {ideaType === "used"
                ? tags?.map((tag, i) => {
                  return (
                    <IdeaTag
                      key={i}
                      tag={tag}
                      handleTagClick={handleTagClick}
                    />
                  );
                })
                : freshIdeaTags?.length > 0
                  ? freshIdeaTags?.map((tag, i) => {
                    return (
                      <IdeaTag
                        key={i}
                        tag={tag}
                        handleTagClick={handleTagClick}
                      />
                    );
                  })
                  : "Generate fresh ideas to see tags"}
            </div>
          </div>
        )}
        <div>
          <div className="flex justify-between w-full items-center py-2">
            <p className="pt-[0.65em] font-semibold">Sources</p>
          </div>
          <div
            className="flex gap-[0.5em] flex-wrap max-h-[60px] overflow-x-hidden overflow-y-scroll !pb-0"
            style={{ padding: "0.75em 0.5em" }}
          >
            {ideaType === "used" ? (
              reference?.length > 0 ? (
                reference?.map((ref, index) => {
                  return (
                    <UsedReference
                      key={index}
                      reference={ref}
                      index={index}
                      handleRefClick={handleRefClick}
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
        </div>
        <div className="flex py-2 relative gap-5">
          <button
            className="idea-button cta used m-2 ml-0 active !px-[0.4em] !py-[0.25em] !text-xs"
            onClick={(e) => {
              setIdeaType("used");
            }}
          >
            Used Idea(s){" "}
            <span className="mx-auto bg-blue-200 text-[10px] w-[20px] h-[20px] flex items-center justify-center font-bold text-sky-800 rounded-full absolute left-[102%] top-[50%] translate-y-[-50%]">
              {ideas?.length}
            </span>
          </button>

          <button
            className="idea-button cta fresh m-2 ml-0 flex gap-1 items-center !p-[0.4em] !py-[0.25em] !text-xs realtive"
            onClick={(e) => {
              if (isAuthenticated) setIdeaType("fresh");
              else {
                updateisSave();
              }
            }}
          >
            <Image
              src="/lightBulb.png"
              alt="lightBulb"
              width={20}
              height={20}
              style={{ pointerEvents: "none" }}
            />
            Fresh Idea(s){" "}
            {freshIdeas?.length > 0 && (
              <span className="mx-auto bg-blue-200 text-[10px] w-[20px] h-[20px] flex items-center justify-center font-bold text-sky-800 rounded-full absolute left-[102%] top-[50%] translate-y-[-50%]">
                {freshIdeas?.length}
              </span>
            )}
          </button>
          {ideaType === "fresh" && (
            <>
              <span className="mt-3 text-sm ml-3">Select all </span>
              <div
                className="md:w-10 md:h-5 w-7 h-2 flex items-center bg-blue-400 rounded-full p-1 cursor-pointer mt-3"
                onClick={() => {
                  handleSelectAll();
                  setToggle(!toggle);
                }}
              >
                <div
                  className={
                    "bg-black md:w-5 md:h-5 h-4 w-4 rounded-full shadow-md transform duration-300 ease-in-out" +
                    (toggle ? null : toggleClass)
                  }
                ></div>
              </div>
            </>
          )}
        </div>
        <div
          className=" dashboardInsightsUsedSectionHeight overflow-y-scroll px-2"
        >
          {ideaType === "used"
            ? filteredIdeas?.length > 0
              ? filteredIdeas?.map((idea, index) => {
                return (
                  <UsedFilteredIdeaItem
                    key={index}
                    index={index}
                    idea={idea}
                    filteredIdeas={filteredIdeas}
                    setFilteredIdeas={setFilteredIdeas}
                    ideas={ideas}
                    setIdeas={setIdeas}
                    handleUsedIdeas={handleUsedIdeas}
                    handleCitationFunction={handleCitationFunction}
                  />
                );
              })
              : ideas?.map((idea, index) => {
                return (
                  <MainIdeaItem
                    key={index}
                    index={index}
                    idea={idea}
                    ideas={ideas}
                    setIdeas={setIdeas}
                    handleUsedIdeas={handleUsedIdeas}
                    handleCitationFunction={handleCitationFunction}
                  />
                );
              })
            : ""}
          {ideaType === "fresh" && (
            <div className="w-full">
              {isAuthenticated && (
                <>
                  <FreshIdeaForm
                    postFormData={postFormData}
                    newIdeaLoad={newIdeaLoad}
                    ideaType={ideaType}
                    formInput={formInput}
                    handleFormChange={handleFormChange}
                    hover={hover}
                    handleFileUpload={handleFileUpload}
                  />
                </>
              )}
              {freshFilteredIdeas?.length > 0
                ? freshFilteredIdeas?.map((idea, index) => {
                  return (
                    <FreshFilteredIdeaItem
                      key={index}
                      index={index}
                      idea={idea}
                      handleCitationFunction={handleCitationFunction}
                      filteredIdeas={filteredIdeas}
                      setFilteredIdeas={setFilteredIdeas}
                      ideas={ideas}
                      setIdeas={setIdeas}
                      handleUsedIdeas={handleUsedIdeas}
                    />
                  );
                })
                : freshIdeas?.map((idea, index) => {
                  return (
                    <IdeaComponent
                      key={index}
                      index={index}
                      idea={idea}
                      handleCitationFunction={handleCitationFunction}
                      handleInputClick={handleInputClick}
                      freshIdeas={freshIdeas}
                      setFreshIdeas={setFreshIdeas}
                    />
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
