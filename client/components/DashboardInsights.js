/* eslint-disable react/jsx-key */
import React, { useEffect, useState } from "react";
import { Switch } from "@headlessui/react";
import LoaderPlane from "./LoaderPlane";
import { regenerateBlog } from "../graphql/mutations/regenerateBlog";
import { jsonToHtml } from "../helpers/helper";
import { useMutation, gql } from "@apollo/client";

export default function DashboardInsights({ loading, ideas, blog_id, setEditorText }) {
  const [enabled, setEnabled] = useState(false);
  const [valid, setValid] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const [regenSelected, setRegenSelected] = useState([]);

  const [RegenerateBlog, { data, loading: regenLoading, error }] =
    useMutation(regenerateBlog);

  function handleInputClick(idea, article_id, e) {
    const ideaObject = {
      "text" : idea,
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

    if (regenSelected.length >= 3) {
      e.target.checked = false;
      return;
    }

    setRegenSelected((prev) => [...prev, ideaObject]);
  }

  function handleRegenerate() {
    if(regenSelected.length < 1) return

    console.log(regenSelected);
    RegenerateBlog({
      variables: {
        options: {
          ideas: regenSelected,
          blog_id: blog_id,
        },
      },
      onCompleted: (data) => {
        console.log(data);
        const regenDoc = data.regenerate.publish_data[2].tiny_mce_data;
        const htmlDoc = jsonToHtml(regenDoc);
        setEditorText(htmlDoc);
        console.log("Sucessfully re-generated the article");
        setRegenSelected([])
      },
      onError: (error) => {
        console.error(error);
      },
    }).catch((err) => {
      console.error(err);
    }).finally(()=>{
      setRegenSelected([])
    });
  }

  function urlHandler(e) {
    const value = e.target.value;
    setUrlInput(value);
  }

  function postFormData(e) {
    e.preventDefault();
    var expression =
      /[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)?/gi;
    var regex = new RegExp(expression);
    checkDataforUrl(regex);
  }

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
    setValid(pattern.test(urlInput));
  }

  if (loading || regenLoading) return <LoaderPlane />;

  return (
    <>
      <div className="w-[40%] pl-9 pr-2">
        <div className="flex pb-4">
          <p className="font-normal w-[70%] pr-10">
            Regenerate your article on the basis of selected keyword, URL or
            uploaded document
          </p>
          <button
            className="h-10 pl-5 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
            onClick={handleRegenerate}
          >
            Regenerate
          </button>
        </div>
        <form className="flex items-center" onSubmit={postFormData}>
          <label for="simple-search" className="sr-only">
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
                  fill-rule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
            <input
              type="text"
              id="simple-search"
              onChange={urlHandler}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  "
              placeholder="Enter keyword, URL or upload document"
              required
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
          <div className="p-2.5 ml-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            <input
              accept="application/pdf, .docx, .txt, .rtf, .png, .jpg, .jpeg, .gif"
              type="file"
              max-size="500000"
              style={{ display: "none" }}
            />
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
        </form>
        <div>
          <p>url - {valid ? "true" : "false"}</p>
        </div>
        <div className="flex">
          <p className="pr-[50%] pt-5 pb-5 font-semibold">Filtering Keywords</p>
          <div className="grid p-5">
            <Switch
              checked={enabled}
              onChange={setEnabled}
              className={`${enabled ? "bg-blue-500" : "bg-blue-200"}
          relative inline-flex h-[19px] w-[40px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
            >
              <span className="sr-only">Use setting</span>
              <span
                aria-hidden="true"
                className={`${enabled ? "translate-x-5" : "translate-x-0"}
            pointer-events-none inline-block h-[17px] w-[17px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
              />
            </Switch>
          </div>
        </div>
        <div className="grid grid-cols-4 space-x-2">
          <button className="bg-gray-300 rounded-full p-1">Save</button>
          <button className="bg-gray-300 rounded-full p-1">Save</button>
          <button className="bg-gray-300 rounded-full p-1">Save</button>
        </div>
        <div className="flex pb-5">
          <div className="p-3 pt-9">Used Idea</div>
          <div className="p-3 pt-9 flex">
            <img src="/lightBulb.png" className="w-5 h-5" />
            Fresh Idea
          </div>
        </div>
        <div className="h-1/5 overflow-y-scroll">
          {ideas.map((idea) => {
            if (idea.idea.length <= 0) return;
            return (
              <div className="flex pb-10">
                <div className="flex justify-between gap-5 w-[95%] pr-5">
                  <p>{idea.idea}</p>
                  <input
                    id="default-checkbox"
                    type="checkbox"
                    className="mb-4 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    onClick={(e) =>
                      handleInputClick(idea.idea, idea.article_id, e)
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}