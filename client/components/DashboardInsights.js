/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/jsx-key */
import React, { useEffect, useState } from "react";
import { Switch } from "@headlessui/react";
import LoaderPlane from "./LoaderPlane";
import { regenerateBlog } from "../graphql/mutations/regenerateBlog";
import { jsonToHtml } from "../helpers/helper";
import { useMutation, gql } from "@apollo/client";
import { API_BASE_PATH, API_ROUTES } from "../constants/apiEndpoints";
import ReactLoading from "react-loading";
import useStore from "../store/store";

export default function DashboardInsights({
  loading,
  ideas,
  blog_id,
  tags,
  setEditorText,
  setBlogData,
  setblog_id,
  setIdeas,
  setTags,
}) {
  const [enabled, setEnabled] = useState(false);

  const [filteredIdeas, setFilteredIdeas] = useState([]);
  const [formInput, setformInput] = useState("");

  const [urlValid, setUrlValid] = useState(false);

  const [file, setFile] = useState(null);
  const [fileValid, setFileValid] = useState(false);

  const [ideaType, setIdeaType] = useState("used");
  const [freshIdea, setFreshIdea] = useState([]);

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

    if (regenSelected.length >= 5) {
      e.target.checked = false;
      return;
    }

    setRegenSelected((prev) => [...prev, ideaObject]);
  }

  const [filterTags, setFilterTags] = useState([])

  function handleTagClick(e){
    e.target.classList.toggle("active")

    /* Adding or removing the keywords to an array */
    const filterText = e.target.innerText;
    setFilterTags(prev => prev.includes(filterText) ? [...prev.filter(el => el !== filterText)] : [...prev, filterText])
  }

  useEffect(() => {
    setFilteredIdeas([])
    filterTags.forEach(filterText => ideas.forEach(idea => idea.idea.indexOf(filterText) >= 0 && setFilteredIdeas(prev => [...prev, idea.idea])));
  },[filterTags])

  useEffect(() => {
    console.log(filteredIdeas)
  },[filteredIdeas])


  function handleRegenerate() {
    console.log(regenSelected);
    if (regenSelected.length >= 1) {
      console.log(regenSelected);
      RegenerateBlog({
        variables: {
          options: {
            ideas: regenSelected,
            blog_id: blog_id,
          },
        },
        onCompleted: (data) => {
          console.log("regen", data);
          setBlogData(data.regenerateBlog);
          setblog_id(data.regenerateBlog._id);
          setIdeas(data.regenerateBlog.ideas.ideas);
          setTags(data.regenerateBlog.tags);

          // const aa = data.regenerateBlog.publish_data[2].tiny_mce_data;
          const aa = data.regenerateBlog.publish_data.find(pd => pd.platform === 'linkedin').tiny_mce_data
          const htmlDoc = jsonToHtml(aa);
          setEditorText(htmlDoc);

          console.log("Sucessfully re-generated the article");

          setRegenSelected([]);

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

          setFilterTags([])
          setFilteredIdeas([])
          Array.from(document.querySelectorAll(".tag-button.active")).forEach(el => el.classList.remove("active"));
          target = undefined
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
          setFreshIdea([]);
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

  function postFormData(e) {
    // console.log("url " + formInput,"file " + fileValid,"urlvalid " + urlValid)
    e.preventDefault();
    setNewIdeaLoad(true);

    let url = API_BASE_PATH;
    var raw;
    if (urlValid) {
      url += API_ROUTES.URL_UPLOAD;
      raw = JSON.stringify({
        url: formInput,
        blog_id: blog_id,
      });
    } else if (fileValid) {
      url += API_ROUTES.FILE_UPLOAD;
      console.log(file);
      raw = new FormData();
      raw.append("file", file);
      raw.append("blog_id", blog_id);
    } else {
      url += API_ROUTES.KEYWORD_UPLOAD;
      raw = JSON.stringify({
        keyword: formInput,
        blog_id: blog_id,
      });
    }

    var myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      `Bearer ${localStorage.getItem("token")}`
    );
    if (!fileValid) {
      myHeaders.append("Content-Type", "application/json");
    }

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(url, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        setIdeaType("fresh");
        console.log(result);
        setFreshIdea(result.data);

        const fresh = document.querySelector(".idea-button.fresh");
        const used = document.querySelector(".idea-button.used");

        used.classList.remove("active");
        fresh.classList.add("active");
        // console.log(idea)
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

  useEffect(() => {
    if(loading || regenLoading) return
    const checkbox = Array.from(document.querySelectorAll("input[type='checkbox'].usedIdeas"))
    checkbox.forEach(box => box.checked = true);
    // console.log(checkbox);
  },[ideas, filteredIdeas])


  if (loading || regenLoading) return <LoaderPlane />;

  return (
    <>
      <div className="w-[30%] px-5 text-xs">
        {isAuthenticated && (
          <div className="flex pb-4 justify-between gap-[1.25em]">
            <p className="font-normal w-[70%]">
              Regenerate your article on the basis of selected keyword, URL or
              uploaded document
            </p>
            <button
              className="h-[fit-content] bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white p-[0.25em] border border-blue-500 hover:border-transparent rounded"
              onClick={handleRegenerate}
            >
              Regenerate
            </button>
          </div>
        )}
        {isAuthenticated && (
          <form onSubmit={postFormData}>
            {newIdeaLoad ? (
              <ReactLoading
                type={"spin"}
                color={"#2563EB"}
                height={50}
                width={50}
                className={"mx-auto"}
              />
            ) : (
              <div className="flex items-center relative mb-[10px]">
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
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  "
                    placeholder="Keyword or URL or file"
                    required
                    value={formInput}
                    onChange={handleFormChange}
                    style={{ fontSize: "1em" }}
                    title="Enter keyword, URL or upload document"
                  />
                </div>
                <button
                  type="submit"
                  className="p-2.5 ml-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
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
                {hover ? (
                  <>
                    <div
                      className="max-w-sm rounded overflow-hidden shadow-lg india r-0 bg-white mt-15"
                      style={{ zIndex: 9999, position: "absolute", right: "0" }}
                    >
                      upload a file
                    </div>
                  </>
                ) : (
                  <></>
                )}
                <label className="p-2.5 ml-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 cursor-pointer">
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

                <div className="absolute top-[110%]">
                  <span>To get Fresh Ideas enter Keyword, URL or File</span>
                  {/* <p>url - {urlValid ? <span class="text-green-500">true</span> : <span class="text-red-500">false</span>}</p> */}
                </div>
              </div>
            )}
          </form>
        )}
        {tags.length > 0 && <div>
          <div className="flex justify-between w-full items-center py-5 mt-7">
            <p className=" font-semibold">Filtering Keywords</p>
          </div>
          <div className="flex gap-[0.25em] flex-wrap max-h-[70px] overflow-y-scroll">
            {tags?.map(tag => {
              return <div
                        className="bg-gray-300 rounded-full p-2 cursor-pointer tag-button cta"
                        onClick={(e) => handleTagClick(e)}
                      >{tag}</div>
            })}
          </div>
        </div>}
        <div className="flex pb-5 pt-5">
          <button
            className="idea-button cta used m-3 ml-0 active !px-[0.4em] !py-[0.25em]"
            onClick={(e) => {
              setIdeaType("used");
              const sib = e.target.nextElementSibling;
              sib?.classList.remove("active");
              e.target.classList.add("active");
            }}
          >
            Used Idea(s)
          </button>
          {isAuthenticated && <button
            className="idea-button cta fresh m-3 ml-0 flex gap-1 items-center !p-[0.4em] !py-[0.25em]"
            onClick={(e) => {
              setIdeaType("fresh");
              const sib = e.target.previousElementSibling;
              sib?.classList.remove("active");
              e.target.classList.add("active");
            }}
          >
            <img src="/lightBulb.png" className="w-5 h-5" />
            Fresh Idea(s)
          </button>}
        </div>
        <div className="h-[35%] overflow-y-scroll absolute mr-5">
          {ideaType === "used"
            ? filteredIdeas.length > 0 
            ? filteredIdeas?.map((idea, index) => {
                return (
                  <div className="flex pb-5" key={index}>
                    <div className="flex justify-between gap-5 w-full">
                      <p>{idea}</p>
                      <input
                        type="checkbox"
                        className="mb-4 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 usedIdeas"
                      />
                    </div>
                  </div>
                );
              })
            : ideas?.map((idea, index) => {
                return (
                  <div className="flex pb-5 usedIdeas" key={index}>
                    <div className="flex justify-between gap-5 w-full">
                      <p>{idea.idea}</p>
                      <input
                        type="checkbox"
                        className="mb-4 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 usedIdeas"
                      />
                    </div>
                  </div>
                );
              })
            : ""}
          {ideaType === "fresh"
            ? freshIdea?.map((idea, index) => {
                return (
                  <div className="flex pb-5" key={index}>
                    <div className="flex justify-between gap-5 w-full">
                      <p>{idea.idea}</p>
                      <input
                        type="checkbox"
                        className="mb-4 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        onClick={(e) =>
                          handleInputClick(idea.idea, idea.article_id, e)
                        }
                      />
                    </div>
                  </div>
                );
              })
            : ""}
        </div>
      </div>
    </>
  );
}
