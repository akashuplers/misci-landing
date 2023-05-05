/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/jsx-key */
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import styles from "../styles/saved.module.css";
import { useQuery, useMutation } from "@apollo/client";
import { getAllBlogs } from "../graphql/queries/getAllBlogs";
import Head from "next/head";
import { contextType } from "react-modal";
import LoaderScan from "../components/LoaderScan";
import Pagination from "../components/Pagination";
import { deleteBlog } from "../graphql/mutations/deleteBlog";
import { toast } from "react-toastify";
import Modal from "react-modal";
import { ToastContainer } from "react-toastify";
import Link from "next/link";
import { useApolloClient } from "@apollo/client";

const PAGE_COUNT = 12;

export default function Saved() {
  const client = useApolloClient();
  const [pageSkip, setPageSkip] = useState(0);
  const [blog_id, setblog_id] = useState("");
  const [openModal, setOpenModal] = useState(false);

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
  const { data, error, loading } = useQuery(getAllBlogs, {
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
      },
    },
  });
  const [
    DeleteBlog,
    { data: delteData, loading: delteLoading, error: delteError },
  ] = useMutation(deleteBlog);

  const files = [
    {
      title: "IMG_4985.HEIC",
      size: "3.9 MB",
      source:
        "https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80",
    },
    // More files...
  ];

  const handleDelete = () => {
    setOpenModal(false);
    console.log("blog_id", blog_id);
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
      .then(() => {})
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
  };

  console.log(data);
  return (
    <>
      <ToastContainer />
      <Layout>
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
              className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8 mx-[5%]"
              style={{
                listStyleType: "none",
              }}
            >
              {data?.getAllBlogs.blogs.map((blog, index) => (
                <>
                  <li key={blog._id} className="relative">
                    <div className="group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="pointer-events-none object-cover h-[150px] w-[280px]"
                        style={{ scale: "1.25" }}
                      />
                      <Link
                        legacyBehavior
                        as={"/public/" + blog._id}
                        href={{
                          pathname: "/public/" + blog,
                        }}
                        passHref
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
                              {/* <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 28 28"
                          stroke-width="1"
                          stroke="currentColor"
                          class="w-6 h-6"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg> */}
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
            <Pagination
              pageSkip={pageSkip}
              setPageSkip={setPageSkip}
              totalItems={data?.getAllBlogs.count}
            />
          </div>
        )}
        <Modal
          isOpen={openModal}
          onRequestClose={() => setOpenModal(false)}
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
              height: "280px",
              // width: "100%",
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
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
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
          <div className="flex m-9">
            <button
              class="mr-4 w-[200px] p-4 bg-transparent hover:bg-green-500 text-gray-500 font-semibold hover:text-white py-2 px-4 border border-gray-500 hover:border-transparent rounded"
              onClick={() => {
                setOpenModal(false);
              }}
            >
              No
            </button>
            <button
              class="w-[240px]  bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded"
              onClick={() => {
                handleDelete();
              }}
            >
              YES, Delete
            </button>
          </div>
        </Modal>
      </Layout>
    </>
  );
}
