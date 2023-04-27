import React, { useEffect, useState } from "react";
import { Switch } from "@headlessui/react";
import LoaderScan from "./LoaderScan";
import { regenerateBlog } from "../graphql/mutations/regenerateBlog";
import { jsonToHtml } from "../helpers/helper";
import { useMutation, gql } from "@apollo/client";
import { API_BASE_PATH, API_ROUTES } from "../constants/apiEndpoints";
import ReactLoading from "react-loading";
import useStore from "../store/store";
import AuthenticationModal from "./AuthenticationModal";
import axios from "axios";
import Link from "next/link";
import { handleSave } from "./TinyMCEEditor";

export default function DashboardInsights({
  loading,

  ideas,
  setIdeas,

  freshIdeas: oldFreshIdeas,

  blog_id,
  setblog_id,

  tags,
  setTags,

  freshIdeasReferences,
  setFreshIdeaReferences,

  reference,
  setReferences,

  setBlogData,
  setEditorText,

  setPyResTime,
  setNdResTime,
}) {
  const [enabled, setEnabled] = useState(false);

  const [formInput, setformInput] = useState("");
  const [urlValid, setUrlValid] = useState(false);
  const [file, setFile] = useState(null);
  const [fileValid, setFileValid] = useState(false);
  const [arrUsed, setArrUsed] = useState([]);
  const [arrFresh, setArrFresh] = useState([]);
  const [ideaType, setIdeaType] = useState("used");
  const [freshIdeas, setFreshIdeas] = useState([]);
  const [freshFilteredIdeas, setFreshFilteredIdeas] = useState([]);
  const updateCredit = useStore((state) => state.updateCredit);
  const updateisSave = useStore((state) => state.updateisSave);

  useEffect(() => {
    setFreshIdeas(oldFreshIdeas);
  }, [oldFreshIdeas]);

  const [newIdeaLoad, setNewIdeaLoad] = useState(false);

  const [regenSelected, setRegenSelected] = useState([]);

  const isAuthenticated = useStore((state) => state.isAuthenticated);

  const [RegenerateBlog, { data, loading: regenLoading, error }] =
    useMutation(regenerateBlog);

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

  const [filteredIdeas, setFilteredIdeas] = useState([]);
  const [notUniquefilteredIdeas, setNotUniqueFilteredIdeas] = useState([]);

  const [filteredArray, setFilteredArray] = useState([]);

  function handleTagClick(e) {
    e.target.classList.toggle("active");

    /* Adding or removing the keywords to an array */
    const filterText = e.target.innerText;
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

  // Adds the matched idea into notUniqueFilteredIdeas
  useEffect(() => {
    setFilteredIdeas([]);
    setFreshFilteredIdeas([]);

    setNotUniqueFilteredIdeas([]);

    if (ideaType === "used") {
      filteredArray.forEach((filterObject) =>
        ideas.forEach((idea) => {
          if (filterObject?.criteria === "tag") {
            idea?.idea?.indexOf(filterObject?.filterText) >= 0 &&
              setNotUniqueFilteredIdeas((prev) => [...prev, idea]);
          } else if (filterObject?.criteria === "ref") {
            idea?.name === filterObject?.filterText &&
              setNotUniqueFilteredIdeas((prev) => [...prev, idea]);
          }
        })
      );
    } else if (ideaType === "fresh") {
      filteredArray.forEach((filterObject) =>
        freshIdeas.forEach((idea) => {
          if (filterObject?.criteria === "tag") {
            idea?.idea?.indexOf(filterObject?.filterText) >= 0 &&
              setNotUniqueFilteredIdeas((prev) => [...prev, idea]);
          } else if (filterObject?.criteria === "ref") {
            idea?.name === filterObject?.filterText &&
              setNotUniqueFilteredIdeas((prev) => [...prev, idea]);
          }
        })
      );
    }
  }, [filteredArray]);

  // We create a set so that the values are unique, and multiple ideas are not added
  useEffect(() => {
    // Create a new Set object from the array, which removes duplicates
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

  /*
  keep this for de-bugging
  useEffect(() => {
    console.log(filteredArray);
    console.log(filteredIdeas);
  }, [filteredIdeas]);
  */

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
      for (let index = 0; index < freshIdeas.length; index++) {
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
          setBlogData(data.regenerateBlog);
          setIdeas(data.regenerateBlog.ideas.ideas);
          setTags(data.regenerateBlog.tags);
          setReferences(data.regenerateBlog.references);
          setFreshIdeaReferences(data.regenerateBlog.freshIdeasReferences);
          setFreshIdeas(data?.regenerateBlog?.ideas?.freshIdeas);
          console.log(
            "asfgasfda ",
            data.regenerateBlog.pythonRespTime,
            data.regenerateBlog.respTime
          );
          setPyResTime(data.regenerateBlog.pythonRespTime);
          setNdResTime(data.regenerateBlog.respTime);

          // const aa = data.regenerateBlog.publish_data[2].tiny_mce_data;

          const newArray = data.regenerateBlog.publish_data.filter(
            (obj) => obj.platform === "wordpress"
          );
          var aa;
          const arr = newArray.find((pd) => pd.published === false);
          if (arr) {
            aa = arr.tiny_mce_data;
          } else {
            aa = newArray[newArray.length - 1].tiny_mce_data;
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
          setblog_id(data.regenerateBlog._id);

          const button = document.querySelectorAll(".blog-toggle-button");
          button.forEach((btn) => btn.classList.remove("active"));
          Array.from(button).filter(
            (btn) =>
              btn.classList.contains("wordpress") && btn.classList.add("active")
          );

          const fresh = document.querySelector(".idea-button.fresh");
          const used = document.querySelector(".idea-button.used");

          used.classList.add("active");
          fresh.classList.remove("active");

          setFilteredArray([]);
          setFilteredIdeas([]);
          Array.from(document.querySelectorAll(".tag-button.active")).forEach(
            (el) => el.classList.remove("active")
          );
          target = undefined;
        },
        onError: (error) => {
          console.error(error);
        },
      })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setIdeaType("used");
          setRegenSelected([]);
          // setFreshIdeas([]);
        });
    }
  }

  function handleFileUpload({ target }) {
    setFileValid(true);
    setUrlValid(false);

    setformInput(target.files[0].name);
    setFile(target.files[0]);
    // console.log(file)
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

  const handleusedideas = (arr) => {
    setArrUsed(arr);
  };

  function postFormData(e) {
    // console.log("url " + formInput,"file " + fileValid,"urlvalid " + urlValid)
    e.preventDefault();
    setNewIdeaLoad(true);

    let url = API_BASE_PATH;
    var raw;
    if (urlValid) {
      url += API_ROUTES.URL_UPLOAD;
      raw = {
        url: formInput,
        blog_id: blog_id,
      };
    } else if (fileValid) {
      url += API_ROUTES.FILE_UPLOAD;
      console.log(file);
      raw = new FormData();
      raw.append("file", file);
      raw.append("blog_id", blog_id);
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

        setPyResTime(response.data.pythonRespTime);
        setNdResTime(response.data.respTime);
        console.log(freshIdeas);
        const fresh = document.querySelector(".idea-button.fresh");
        const used = document.querySelector(".idea-button.used");

        used.classList.remove("active");
        fresh.classList.add("active");
      })
      .catch((error) => console.log("error", error))
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
      <div className="w-[35%] text-xs px-2" style={{ width: "40%" , borderLeft:"2px solid #d2d2d2"}}>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M8 16C5.76667 16 3.875 15.225 2.325 13.675C0.775 12.125 0 10.2333 0 8C0 5.76667 0.775 3.875 2.325 2.325C3.875 0.775003 5.76667 3.4602e-06 8 3.4602e-06C9.15 3.4602e-06 10.25 0.237337 11.3 0.712003C12.35 1.18667 13.25 1.866 14 2.75V1C14 0.71667 14.096 0.479004 14.288 0.287004C14.48 0.0950036 14.7173 -0.000663206 15 3.4602e-06C15.2833 3.4602e-06 15.521 0.0960036 15.713 0.288004C15.905 0.480004 16.0007 0.717337 16 1V6C16 6.28334 15.904 6.521 15.712 6.713C15.52 6.905 15.2827 7.00067 15 7H10C9.71667 7 9.479 6.904 9.287 6.712C9.095 6.52 8.99933 6.28267 9 6C9 5.71667 9.096 5.479 9.288 5.287C9.48 5.095 9.71733 4.99934 10 5H13.2C12.6667 4.06667 11.9373 3.33334 11.012 2.8C10.0867 2.26667 9.08267 2 8 2C6.33333 2 4.91667 2.58334 3.75 3.75C2.58333 4.91667 2 6.33334 2 8C2 9.66667 2.58333 11.0833 3.75 12.25C4.91667 13.4167 6.33333 14 8 14C9.15 14 10.2127 13.6957 11.188 13.087C12.1633 12.4783 12.8923 11.666 13.375 10.65C13.4583 10.4667 13.596 10.3123 13.788 10.187C13.98 10.0617 14.1757 9.99934 14.375 10C14.7583 10 15.046 10.1333 15.238 10.4C15.43 10.6667 15.4507 10.9667 15.3 11.3C14.6667 12.7167 13.6917 13.8543 12.375 14.713C11.0583 15.5717 9.6 16.0007 8 16Z"
                fill="#4A3AFE"
              />
            </svg>
            Regenerate
          </button>
        </div>

        {tags?.length > 0 && (
          <div>
            <div className="flex justify-between w-full items-center py-2">
              <p className="pt-[0.65em] font-semibold">Filtering Keywords</p>
            </div>
            <div className="flex gap-[0.5em] flex-wrap max-h-[60px] overflow-y-scroll !pb-0" style={{padding: '0.75em 0.25em'}}>
              {tags?.map((tag, i) => {
                return (
                  <div
                    key={i}
                    className="tag-button cta"
                    style={{
                      borderRadius: '100px',
                      padding: '0.25em 0.75em',
                      backgroundColor: '#e9e9e9',
                      border: 'none',
                      color: 'black',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onClick={(e) => handleTagClick(e)}
                  >
                    {toTitleCase(tag)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div>
          <div className="flex justify-between w-full items-center py-2">
            <p className="pt-[0.65em] font-semibold">Sources</p>
          </div>
          <div className="flex gap-[0.5em] flex-wrap max-h-[60px] overflow-x-hidden overflow-y-scroll !pb-0" style={{padding: '0.75em 0.5em'}}>
            {ideaType === "used" ? (
              reference?.length > 0 ? (
                reference?.map((ref, index) => {
                  return (
                    <div
                      key={index}
                      className="ref-button cta relative"
                      style={{
                        borderRadius: '100px',
                        padding: '0.25em 0.75em',
                        backgroundColor: '#e9e9e9',
                        border: 'none',
                        color: 'black',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                      onClick={handleRefClick}
                      data-source={ref.source}
                    >
                      {ref.source}
                      <span
                        className=""
                        style={{
                          position: "absolute",
                          bottom: "65%",
                          left: "90%",
                          backgroundColor: "inherit",
                          color: "inherit",
                          width: "14px",
                          height: "14px",
                          fontSize: "0.65rem",
                          fontWeight: "600",
                          borderRadius: "100px",
                          display: "flex",
                          justifyContent: "center",
                          zIndex: "100",
                          alignItems: "center",
                        }}
                      >
                        {index + 1}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div>Used Idea sources not found</div>
              )
            ) : freshIdeasReferences?.length > 0 ? (
              freshIdeasReferences?.map((ref, index) => {
                return (
                  <div
                    key={index}
                    className="ref-button cta relative"
                    style={{
                      borderRadius: '100px',
                      padding: '0.25em 0.75em',
                      backgroundColor: '#e9e9e9',
                      border: 'none',
                      color: 'black',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onClick={handleRefClick}
                    data-source={ref.source}
                  >
                    {ref.source}
                    <span
                      className=""
                      style={{
                        position: "absolute",
                          bottom: "65%",
                          left: "90%",
                          backgroundColor: "inherit",
                          color: "inherit",
                          width: "14px",
                          height: "14px",
                          fontSize: "0.65rem",
                          fontWeight: "600",
                          borderRadius: "100px",
                          display: "flex",
                          justifyContent: "center",
                          zIndex: "100",
                          alignItems: "center",
                      }}
                    >
                      {index + 1}
                    </span>
                  </div>
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
            <img
              src="/lightBulb.png"
              className="w-5 h-5"
              style={{ pointerEvents: "none" }}
            />
            Fresh Idea(s){" "}
            {freshIdeas?.length > 0 && (
              <span className="mx-auto bg-blue-200 text-[10px] w-[20px] h-[20px] flex items-center justify-center font-bold text-sky-800 rounded-full absolute left-[102%] top-[50%] translate-y-[-50%]">
                {freshIdeas?.length}
              </span>
            )}
          </button>
        </div>
        <div
          className="overflow-y-scroll absolute px-2 mb-6 "
          style={{
            marginRight: "0.5em",
            maxHeight: "82vh",
            visibility:
              ideaType === "fresh" && !freshIdeas ? "hidden" : "visible",

            height: "-webkit-fill-available",
          }}
        >
          {ideaType === "used"
            ? filteredIdeas?.length > 0
              ? filteredIdeas?.map((idea, index) => {
                  return (
                    <div className="flex pb-3" key={index}>
                      <div className="flex justify-between gap-5 w-full">
                        <p>{idea?.idea} </p>
                        <a
                          style={{
                            color: "#4a3afe",
                            alignSelf: "flex-start",
                            position: "relative",
                            marginLeft: "auto",
                            cursor: "pointer",
                          }}
                          onMouseEnter={() => {
                            document
                              .querySelector(`.refrenceTooltip${index}`)
                              .classList.remove("hidden");
                          }}
                          onMouseLeave={() => {
                            document
                              .querySelector(`.refrenceTooltip${index}`)
                              .classList.add("hidden");
                          }}
                        >
                          {handleCitationFunction(idea?.name)}
                          <div
                            className={`hidden refrenceTooltip${index}`}
                            style={{
                              position: "absolute",
                              top: "100%",
                              right: "0",
                              border: "1px solid",
                              color: "black",
                              backgroundColor: "white",
                              padding: "0.5em",
                              borderRadius: "5px",
                              zIndex: "1",
                            }}
                          >
                            {idea?.name}{" "}
                            {idea?.reference?.type === "article" ? (
                              <a
                                href={idea?.reference?.link}
                                target="_blank"
                                style={{ color: "blue" }}
                              >
                                Link
                              </a>
                            ) : (
                              <Link
                                href={`/dashboard/${idea?.reference?.id}`}
                                target="_blank"
                              >
                                Link
                              </Link>
                            )}
                          </div>
                        </a>
                        <input
                          type="checkbox"
                          className="mb-4 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          checked={idea?.used}
                          onClick={() => {
                            const updatedFilteredIdeas = filteredIdeas.map(
                              (el, elIndex) =>
                                elIndex === index
                                  ? { ...el, used: el.used === 1 ? 0 : 1 }
                                  : el
                            );
                            setFilteredIdeas(updatedFilteredIdeas);
                            var ideasCopy = [];
                            for (let i = 0; i < ideas.length; i++) {
                              const element = ideas[i];
                              const f = updatedFilteredIdeas.find(
                                (pd) => pd.idea === element.idea
                              );
                              if (f) {
                                ideasCopy.push(f);
                              } else {
                                ideasCopy.push(element);
                              }
                            }
                            setIdeas(ideasCopy);
                            const arr = [];
                            for (
                              let index = 0;
                              index < updatedFilteredIdeas.length;
                              index++
                            ) {
                              const element = updatedFilteredIdeas[index];
                              if (element.used) {
                                const ideaObject = {
                                  text: element.idea,
                                  article_id: element.article_id,
                                };
                                arr.push(ideaObject);
                              }
                            }
                            handleusedideas(arr);
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              : ideas?.map((idea, index) => {
                  return (
                    <div className="flex pb-3 usedIdeas" key={index}>
                      <div className="flex justify-between gap-5 w-full">
                        <p>{idea?.idea} </p>
                        <a
                          style={{
                            color: "#4a3afe",
                            alignSelf: "flex-start",
                            position: "relative",
                            marginLeft: "auto",
                            cursor: "pointer",
                          }}
                          onMouseEnter={() => {
                            document
                              .querySelector(`.refrenceTooltip${index}`)
                              .classList.remove("hidden");
                          }}
                          onMouseLeave={() => {
                            document
                              .querySelector(`.refrenceTooltip${index}`)
                              .classList.add("hidden");
                          }}
                        >
                          {/* {idea?.reference?.type === "article" ? "[2]" : "[1]"} */}

                          {handleCitationFunction(idea?.name)}
                          <div
                            className={`hidden refrenceTooltip${index}`}
                            style={{
                              position: "absolute",
                              top: "100%",
                              right: "0",
                              border: "1px solid",
                              color: "black",
                              backgroundColor: "white",
                              padding: "0.5em",
                              borderRadius: "5px",
                              zIndex: "1",
                            }}
                          >
                            {idea?.name}{" "}
                            {idea?.reference?.type === "article" ? (
                              <a
                                href={idea?.reference?.link}
                                target="_blank"
                                style={{ color: "blue" }}
                              >
                                Link
                              </a>
                            ) : (
                              <Link
                                href={`/dashboard/${idea?.reference?.id}`}
                                target="_blank"
                              >
                                Link
                              </Link>
                            )}
                          </div>
                        </a>
                        <input
                          type="checkbox"
                          className="mb-4 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          checked={idea?.used}
                          onClick={(e) => {
                            console.log(idea);
                            const updatedIdeas = ideas.map((el, elIndex) =>
                              elIndex === index
                                ? { ...el, used: el.used === 1 ? 0 : 1 }
                                : el
                            );
                            setIdeas(updatedIdeas);
                            const arr = [];
                            for (
                              let index = 0;
                              index < updatedIdeas.length;
                              index++
                            ) {
                              const element = updatedIdeas[index];
                              if (element.used) {
                                const ideaObject = {
                                  text: element.idea,
                                  article_id: element.article_id,
                                };
                                arr.push(ideaObject);
                              }
                            }
                            handleusedideas(arr);
                          }}
                        />
                      </div>
                    </div>
                  );
                })
            : ""}
          {ideaType === "fresh" 
            && (
              <>
                {isAuthenticated && (
                  <>
                    <form onSubmit={postFormData} className="mb-4 mt-1">
                      {newIdeaLoad ? (
                        <ReactLoading
                          type={"spin"}
                          color={"#2563EB"}
                          height={50}
                          width={50}
                          className={"mx-auto"}
                        />
                      ) : (
                        ideaType === "fresh" && (
                          <div className="flex items-center gap-1 relative mb-[10px]">
                            <label htmlFor="simple-search" className="sr-only">
                              Search
                            </label>
                            <div className="relative w-full">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg
                                  aria-hidden="true"
                                  className="w-5 h-5 text-gray-500 dark:text-gray-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                    clipRule="evenodd"
                                  ></path>
                                </svg>
                              </div>
                              <input
                                type="text"
                                id="simple-search"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-[0.75em]"
                                placeholder="To get Fresh Ideas upload topic, URL or File."
                                required
                                value={formInput}
                                onChange={handleFormChange}
                                style={{ fontSize: "1em" }}
                                title="Enter keyword, URL or upload document"
                              />
                            </div>
                            {hover ? (
                              <>
                                <div
                                  className="max-w-sm rounded overflow-hidden shadow-lg india r-0 bg-white mt-15"
                                  style={{
                                    zIndex: 9999,
                                    position: "absolute",
                                    right: "0",
                                  }}
                                >
                                  upload a file
                                </div>
                              </>
                            ) : (
                              <></>
                            )}
                            <label
                              className="cta-invert"
                              style={{
                                background: "none",
                                color: "black",
                                border: "1px solid #b3b3b3",
                              }}
                            >
                              <input
                                type="file"
                                accept="application/pdf, .docx, .txt, .rtf, .png, .jpg, .jpeg, .gif"
                                max-size="500000"
                                onInput={handleFileUpload}
                                style={{ display: "none" }}
                              />
                              <div onMouseEnter={onHover} onMouseLeave={onLeave}>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="w-6 h-6"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10.5 3.75a6 6 0 00-5.98 6.496A5.25 5.25 0 006.75 20.25H18a4.5 4.5 0 002.206-8.423 3.75 3.75 0 00-4.133-4.303A6.001 6.001 0 0010.5 3.75zm2.03 5.47a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72v4.94a.75.75 0 001.5 0v-4.94l1.72 1.72a.75.75 0 101.06-1.06l-3-3z"
                                    clipRule="evenodd"
                                  />
                                </svg>

                                <span className="sr-only">Upload</span>
                              </div>
                            </label>
                            <button type="submit" className="cta-invert">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="sr-only">Search</span>
                            </button>
                          </div>
                        )
                      )}
                    </form>
                  </>
                )}
                {freshFilteredIdeas?.length > 0
                  ? freshFilteredIdeas?.map((idea, index) => {
                      return (
                        <div className="flex pb-3" key={index}>
                          <div className="flex justify-between gap-5 w-full">
                            <p>{idea?.idea}</p>

                            <a
                              style={{
                                color: "#4a3afe",
                                alignSelf: "flex-start",
                                position: "relative",
                                marginLeft: "auto",
                                cursor: "pointer",
                              }}
                              onMouseEnter={() => {
                                document
                                  .querySelector(`.refrenceTooltip${index}`)
                                  .classList.remove("hidden");
                              }}
                              onMouseLeave={() => {
                                document
                                  .querySelector(`.refrenceTooltip${index}`)
                                  .classList.add("hidden");
                              }}
                            >
                              {handleCitationFunction(idea?.name)}
                              <div
                                className={`hidden refrenceTooltip${index}`}
                                style={{
                                  position: "absolute",
                                  top: "100%",
                                  right: "0",
                                  border: "1px solid",
                                  color: "black",
                                  backgroundColor: "white",
                                  padding: "0.5em",
                                  borderRadius: "5px",
                                  zIndex: "1",
                                }}
                              >
                                {idea?.name}{" "}
                                {idea?.reference?.type === "article" ? (
                                  <a
                                    href={idea?.reference?.link}
                                    target="_blank"
                                    style={{ color: "blue" }}
                                  >
                                    Link
                                  </a>
                                ) : (
                                  <Link
                                    href={`/dashboard/${idea?.reference?.id}`}
                                    target="_blank"
                                  >
                                    Link
                                  </Link>
                                )}
                              </div>
                            </a>
                            <input
                              type="checkbox"
                              className="mb-4 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                              checked={idea?.used}
                              onClick={(e) => {
                                const updatedFilteredIdeas = freshFilteredIdeas.map(
                                  (el, elIndex) =>
                                    elIndex === index
                                      ? { ...el, used: el.used === 1 ? 0 : 1 }
                                      : el
                                );
                                setFreshFilteredIdeas(updatedFilteredIdeas);
                                var ideasCopy = [];
                                for (let i = 0; i < freshIdeas.length; i++) {
                                  const element = freshIdeas[i];
                                  const f = updatedFilteredIdeas.find(
                                    (pd) => pd.idea === element.idea
                                  );
                                  if (f) {
                                    ideasCopy.push(f);
                                  } else {
                                    ideasCopy.push(element);
                                  }
                                }
                                setFreshIdeas(ideasCopy);
                                const arr = [];
                                for (
                                  let index = 0;
                                  index < updatedFilteredIdeas.length;
                                  index++
                                ) {
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
                              }}
                            />
                          </div>
                        </div>
                      );
                    })
                  : freshIdeas?.map((idea, index) => {
                      return (
                        <div className="flex pb-3" key={index}>
                          <div className="flex justify-between gap-5 w-full">
                            <p>{idea?.idea}</p>

                            <a
                              style={{
                                color: "#4a3afe",
                                alignSelf: "flex-start",
                                position: "relative",
                                marginLeft: "auto",
                                cursor: "pointer",
                              }}
                              onMouseEnter={() => {
                                document
                                  .querySelector(`.refrenceTooltip${index}`)
                                  .classList.remove("hidden");
                              }}
                              onMouseLeave={() => {
                                document
                                  .querySelector(`.refrenceTooltip${index}`)
                                  .classList.add("hidden");
                              }}
                            >
                              {handleCitationFunction(idea?.name)}
                              <div
                                className={`hidden refrenceTooltip${index}`}
                                style={{
                                  position: "absolute",
                                  top: "100%",
                                  right: "0",
                                  border: "1px solid",
                                  color: "black",
                                  backgroundColor: "white",
                                  padding: "0.5em",
                                  borderRadius: "5px",
                                  zIndex: "1",
                                }}
                              >
                                {idea?.name}{" "}
                                {idea?.reference?.type === "article" ? (
                                  <a
                                    href={idea?.reference?.link}
                                    target="_blank"
                                    style={{ color: "blue" }}
                                  >
                                    Link
                                  </a>
                                ) : (
                                  <Link
                                    href={`/dashboard/${idea?.reference?.id}`}
                                    target="_blank"
                                  >
                                    Link
                                  </Link>
                                )}
                              </div>
                            </a>
                            <input
                              type="checkbox"
                              className="mb-4 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                              onClick={(e) => {
                                console.log(idea);
                                const updatedIdeas = freshIdeas.map((el, elIndex) =>
                                  elIndex === index
                                    ? { ...el, used: el.used === 1 ? 0 : 1 }
                                    : el
                                );
                                setFreshIdeas(updatedIdeas);
                                handleInputClick(idea?.idea, idea?.article_id, e);
                              }}
                              checked={idea?.used}
                            />
                          </div>
                        </div>
                      );
                })}
              </>
            )
          }
        </div>
      </div>
    </>
  );
}
