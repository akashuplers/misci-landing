/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/jsx-key */
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { ToastContainer, toast } from "react-toastify";
import BottomTabBar from "../components/BottomTabBar";
import Layout from "../components/Layout";
import LoaderScan from "../components/LoaderScan";
import Pagination from "../components/Pagination";
import { deleteBlog } from "../graphql/mutations/deleteBlog";
import {deleteBlogByAdmin} from "../graphql/mutations/deleteAdminBlog";
import { getAllBlogs } from "../graphql/queries/getAllBlogs";
import styles from '../styles/saved.module.css';
import { meeAPI } from "../graphql/querys/mee";
import { useDebounce } from "@uidotdev/usehooks";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { getBlogbyId } from "../graphql/queries/getBlogbyId";
import { useRouter } from "next/router";
import { jsonToHtml } from "../helpers/helper";
import {
  convertToURLFriendly,
  getBlogTitle,
} from "@/store/appHelpers";

const PAGE_COUNT = 12;

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", function (event) {
    event.stopImmediatePropagation();
  });
}

export default function Published() {
  const client = useApolloClient();
  const [pageSkip, setPageSkip] = useState(0);
  const [blog_id, setblog_id] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [search, setSearch] = useState(null);

  const [seoTag, setSeoTag] = useState(null);
  const [currentBlogId, setCurrentBlogId] = useState('');
  const [socialUsernameLink, setSocialUsernameLink] = useState(null)

  const debouncedSearchTerm = useDebounce(search, 300);
  const { data, error, loading, refetch } = useQuery(getAllBlogs, {
    context: {
      headers: {
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
    variables: {
      options: {
        status: ["published"],
        page_skip: pageSkip * PAGE_COUNT,
        page_limit: (1 + pageSkip) * PAGE_COUNT,
        search: debouncedSearchTerm
      },
    },
  });

  useEffect(() => {
    if(!loading && !socialUsernameLink){
      setCurrentBlogId(data.getAllBlogs.blogs._id)
    }
  },[data])

  const {
    data: gqlData,
    loading: gqlLoading,
    erro: gqlError,
    refetch: blogRefetch,
  } = useQuery(getBlogbyId, {
    variables: {
      fetchBlogId: currentBlogId,
    }
  });

  useEffect(() => {
    if(!!currentBlogId) {
      blogRefetch()
      setSeoTag(null)
    }
  },[currentBlogId])

  useEffect(() => {
    if (!gqlLoading) {
      if(!socialUsernameLink){
        const userDetails = gqlData?.fetchBlog?.userDetail;
        if (userDetails?.googleUserName) {
            setSocialUsernameLink("/public/google/" + userDetails?.googleUserName.replace(/\s/g, "") + "/")
        } else if (userDetails?.twitterUsxerName) {
            setSocialUsernameLink("/public/twitter/" + userDetails.twitterUserName.replace(/\s/g, "") + "/")
        } else if (userDetails?.linkedInUserName) {
            setSocialUsernameLink("/public/linkedin/" + userDetails?.linkedInUserName.replace(/\s/g, "") + "/")
        } else if (userDetails?.userName) {
            setSocialUsernameLink("/public/user/" + userDetails?.userName.replace(/\s/g, "") + "/")
        }
      }

      const aa = gqlData?.fetchBlog?.publish_data.find(
        (pd) => pd.platform === "wordpress"
      ).tiny_mce_data;
      const html = jsonToHtml(aa);
      
      const fakeDivContainer = document.createElement("div");
      fakeDivContainer.innerHTML = html;
      var h2Element = fakeDivContainer.querySelector("h2")?.innerText;
      var h2text = convertToURLFriendly(h2Element ?? "blog");
      let authorProfilePath = "/" + h2text + "/";
      setSeoTag(authorProfilePath)
    }
  }, [gqlData]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = null;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    setPageSkip(0)
    refetch()
  }, [debouncedSearchTerm])

  const [
    DeleteBlog,
    { data: delteData, loading: delteLoading, error: delteError },
  ] = useMutation(deleteBlog);

    const [
    DeleteBlogByAdmin,
    { data: delteDataAdmin, loading: delteLoadingAdmin, error: delteErrorAdmin },
  ] = useMutation(deleteBlogByAdmin);

   const {
    data: meeData,
    loading: meeLoading,
    error: meeError,
  } = useQuery(meeAPI, {
    context: {
      headers: {
        "Content-Type": "application/json",
        Authorization:`Bearer ${localStorage.getItem("token")}`,
      },
    },
    onError: ({ graphQLErrors, networkError, operation, forward }) => {
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
          "ServerError: Response not successful: Received status code 401"
        ) {
          localStorage.clear();
          window.location.href = "/";
        }
      }
    },
  });

  const handleDelete = () => {
    setOpenModal(false);
    console.log("blog_id", blog_id);

    if(meeData?.me.isAdmin === false){
    console.log("meeData?.me?. vdve", meeData?.me);
    DeleteBlog({
      variables: {
        options: {
          blog_id: blog_id,
        },
      },
      context: {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    })
      .then(() => { })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        toast.success("Successfully Deleted!", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        client.cache.evict({ blog_id: blog_id });
      });
    } else {

    DeleteBlogByAdmin({
      variables: {
        options: {
          blog_id: blog_id,
        },
      },
      context: {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    })
      .then(() => { })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        toast.success("Successfully Deleted as Admin!", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        client.cache.evict({ blog_id: blog_id });
      });
    }
  };
  return (
    <>
      <ToastContainer />
      <Layout>
        <div className="w-full lg:w-[25%] h-16 bg-white bg-opacity-25 rounded-lg shadow border border-indigo-600 backdrop-blur-[18px] justify-start items-center gap-3 inline-flex my-4 px-2 focus-within:ring-2 focus-within:ring-indigo-600 search">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            <input
              id="1"
              type="text"
              placeholder="Search Topics"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="peer h-full w-full rounded-lg  font-thin outline-none drop-shadow-sm transition-all duration-200 ease-in-out focus:bg-transparent focus:ring-2 focus:ring-transparent border-none"
            />
        </div>
        {loading ? (
          <LoaderScan />
        ) : (
          <div style={{ padding: "1em 0 6em 0" }} className="relative">
            {data?.getAllBlogs.blogs.length === 0 && (
              <img
                src="/noBlog/noPublished.png"
                alt="No Blogs"
                className="mx-auto h-[250px] w-[300px] mt-[20%]"
              />
            )}
            <ul
              role="list"
              className="flex flex-col  lg:grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8 mx-[5%]"
              style={{
                listStyleType: "none",
              }}
            >

              {data?.getAllBlogs.blogs.map((blog, index) => (
                <>
                  <li key={blog._id} className="relative" onMouseEnter={() => setCurrentBlogId(blog._id)}>
                    <div className="group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="pointer-events-none object-cover h-[150px] w-[280px]"
                        style={{ scale: "1.25" }}
                      />
                      <Link
                        legacyBehavior
                        href={{
                          pathname: socialUsernameLink ? socialUsernameLink + blog.title + seoTag + blog._id : `/public/${blog._id}`
                        }}
                        passHref
                        style={{
                          
                        }}
                      >
                        <a
                          target="_blank"
                          style={{
                            position: "absolute",
                            top: "0",
                            right: "0",
                            zIndex: "1",
                            background: "white",
                            borderRadius: "0 0 0 5px",
                            cursor: `${gqlLoading ? 'progress' : 'pointer'}`,
                            pointerEvents: `${gqlLoading ? 'none' : 'all'}`
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24"
                            viewBox="0 0 24 24"
                            width="24"
                          >
                            <path d="M0 0h24v24H0z" fill="none" />
                            <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                          </svg>
                        </a>
                      </Link>
                      <Link
                        legacyBehavior
                        href={{
                          pathname: "/dashboard/" + blog._id,
                          query: { isPublished: true },
                        }}
                      >
                        <a>
                          <button
                            type="button"
                            className="absolute inset-0 focus:outline-none"
                            onMouseEnter={(e) => {
                              const delButton = document.querySelector(
                                `#savedBlog${index}DelButton`
                              );
                              delButton.classList.remove("!hidden");
                            }}
                            onMouseLeave={(e) => {
                              const delButton = document.querySelector(
                                `#savedBlog${index}DelButton`
                              );
                              delButton.classList.add("!hidden");
                            }}
                          >
                            <span className="sr-only">
                              View details for {blog.title}
                            </span>
                            <button
                              id={`savedBlog${index}DelButton`}
                              className={`${styles.statusDelButton} !hidden ${styles.deleteButton}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setblog_id(blog._id);
                                setOpenModal(true);
                              }}
                              onMouseEnter={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              DELETE
                            </button>
                          </button>
                        </a>
                      </Link>
                    </div>
                    <button className={`${styles.dateTag} mt-2`}>
                      {new Date(blog?.date * 1000).toLocaleString("en-US", {
                        timeZone: "Asia/Kolkata",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                      })}
                    </button>
                    <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">
                      {blog?.title}
                    </p>
                    <p className="pointer-events-none block text-sm font-medium text-gray-500">
                      {blog?.description?.length > 115
                        ? blog?.description?.substring(0, 115) + "..."
                        : blog.description}
                    </p>
                  </li>
                </>
              ))}


            </ul>
            <div className="hidden lg:block"
            > <Pagination
                totalItems={data?.getAllBlogs.count}
                pageSkip={pageSkip}
                setPageSkip={setPageSkip}
              />

            </div>
            <div className="flex lg:hidden">
              <BottomTabBar />
            </div>
          </div>
        )}
        <Modal
          isOpen={openModal}
          onRequestClose={() => setOpenModal(false)}
          ariaHideApp={false}
          className="modalModalWidth sm:w-[38%] max-h-[95%]"
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
              borderRadius: "8px",
              height: "280px",
              width: "90%",
              maxWidth: "380px",
              bottom: "",
              zIndex: "999",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)",
              padding: "30px",
              paddingBottom: "0px",
            },
          }}
        >
          <button
            className="absolute right-[35px]"
            onClick={() => setOpenModal(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="mx-auto pb-4">
            <img className="mx-auto h-12" src="/info.png" />
          </div>
          <div className="mx-auto font-bold text-2xl pl-[25%]">
            Are you sure
          </div>
          <p className="text-gray-500 text-base font-medium mt-4 mx-auto">
            Are you sure you want to delete this Blog?
          </p>
          <div className="flex my-9">
            <button
              className="mr-4 w-[200px] p-4 bg-transparent hover:bg-green-500 text-gray-500 font-semibold hover:text-white py-2 px-4 border border-gray-500 hover:border-transparent rounded"
              onClick={() => {
                setOpenModal(false);
              }}
            >
              No
            </button>
            <button
              className="w-[240px]  bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded"
              onClick={() => {
                handleDelete();
              }}
            >
              YES, Delete
            </button>
          </div>
        </Modal>
      </Layout >
    </>
  );
}
