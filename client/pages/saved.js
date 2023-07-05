/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/jsx-key */
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { ToastContainer, toast } from "react-toastify";
import BlogListItem from "../components/BlogListItem";
import { BottomTabBar } from "../components/BottomTabBar";
import Layout from "../components/Layout";
import LoaderScan from "../components/LoaderScan";
import Pagination from "../components/Pagination";
import { deleteBlog } from "../graphql/mutations/deleteBlog";
import { getAllBlogs } from "../graphql/queries/getAllBlogs";
const PAGE_COUNT = 12;

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", function (event) {
    event.stopImmediatePropagation();
  });
}

export default function Saved() {
  const client = useApolloClient();
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

  const handleDelete = () => {
    console.log("blog_id", client.cache);
    setOpenModal(false);

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
  };

  return (
    <>
      <Layout>
        <ToastContainer />
        {loading ? (
          <LoaderScan />
        ) : (
          <div style={{ padding: "1em 0 6em 0" }} className="relative">
            {data?.getAllBlogs.blogs.length === 0 && (
              <img
                src="/noBlog/noSaved.png"
                alt="No Blogs"
                className="mx-auto h-[250px] w-[300px] mt-[20%]"
              />
            )}
            <ul
              role="list"
              className="flex flex-col md:grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8 mx-[5%]"
              style={{
                listStyleType: "none",
              }}
            >
              {data?.getAllBlogs.blogs.map((blog, index) => (
                <>
                  <BlogListItem
                    blog={blog}
                    setblog_id={setblog_id}
                    setOpenModal={setOpenModal}
                    index={index}
                    type={"saved"}
                  />
                </>
              ))}
            </ul>
            <div className="hidden lg:block">
              {" "}
              <Pagination
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
          <div className="flex m-9">
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
      </Layout>
    </>
  );
}
