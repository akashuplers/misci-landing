/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/jsx-key */
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import styles from "../styles/saved.module.css";
import { useQuery, useMutation } from "@apollo/client";
import { getAllBlogs } from "../graphql/queries/getAllBlogs";
import LoaderScan from "../components/LoaderScan";
import { deleteBlog } from "../graphql/mutations/deleteBlog";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import Modal from "react-modal";
import Link from "next/link";
const PAGE_COUNT = 12;

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", function (event) {
    event.stopImmediatePropagation();
  });
}

export default function Saved() {
  const [openModal, setOpenModal] = useState(false);
  const [blog_id, setblog_id] = useState("");
  const [pageSkip, setPageSkip] = useState(0);

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
        status: ["ir_generated", "draft", "saved"],
        page_skip: pageSkip * PAGE_COUNT,
        page_limit: (1 + pageSkip) * PAGE_COUNT,
      },
    },
  });
  const [
    DeleteBlog,
    { data: delteData, loading: delteLoading, error: delteError },
  ] = useMutation(deleteBlog);

  var paginationArr = [];
  for (var i = 1; i <= Math.ceil(data?.getAllBlogs.count / PAGE_COUNT); i++)
    paginationArr.push(i);

  const handleDelete = () => {
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
        setOpenModal(false);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      });
  };

  return (
    <>
      <Layout>
        <ToastContainer />
        {loading ? (
          <LoaderScan />
        ) : (
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
                      className="pointer-events-none object-cover h-[185px] w-[280px]"
                    />

                    <Link href={"/dashboard/" + blog._id}>
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
                        <button
                          className={`${styles.statusDelButton} ${styles.statusButton}`}
                        >
                          {blog?.status === "ir_generated"
                            ? "DAILY FEED"
                            : blog?.status.toUpperCase()}
                        </button>
                        <span className="sr-only">
                          View details for {blog.title}
                        </span>
                        <button
                          id={`savedBlog${index}DelButton`}
                          className={`${styles.statusDelButton} !hidden ${styles.deleteButton}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            console.log(blog._id);
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
                    </Link>
                  </div>
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
        )}
        {paginationArr.length > 1 && (
          <div
            className="pagination"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "2em",
              paddingBottom: "2em",
            }}
          >
            <ul
              style={{
                display: "flex",
                gap: "2em",
                listStyleType: "none",
              }}
            >
              {paginationArr.map((el, index) => (
                <li
                  style={{
                    border: "1px solid",
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  className={pageSkip === index ? "active" : ""}
                  onClick={(e) => {
                    setPageSkip(index);
                  }}
                >
                  {el}
                </li>
              ))}
            </ul>
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
              boxShadow: "0px 4px 20px rgba(170, 169, 184, 0.1)",
              borderRadius: "8px",
              height: "17%",
              width: "80%",
              maxWidth: "230px",
              bottom: "",
              zIndex: "999",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)",
              padding: "20px",
              paddingBottom: "0px",
            },
          }}
        >
          <div className="pl-4 text-xl font-bold mb-5">Are You Sure ?</div>
          <button
            class="mr-5 bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded"
            onClick={() => {
              handleDelete();
            }}
          >
            YES
          </button>
          <button
            class="ml-6 p-4 bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded"
            onClick={() => {
              setOpenModal(false);
            }}
          >
            NO!
          </button>
        </Modal>
      </Layout>
    </>
  );
}
