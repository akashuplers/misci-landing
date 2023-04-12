/* eslint-disable react/jsx-key */
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import styles from "../styles/saved.module.css";
import { useQuery, useMutation } from "@apollo/client";
import { getAllBlogs } from "../graphql/queries/getAllBlogs";
import Head from "next/head";
import { contextType } from "react-modal";
import LoaderPlane from "../components/LoaderPlane";
import { deleteBlog } from "../graphql/mutations/deleteBlog";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";

export default function Saved() {
  const { data, error, loading } = useQuery(getAllBlogs, {
    context: {
      headers: {
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
    variables: { options: { status: null, page_skip: 0, page_limit: 100 } },
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
  const handleDelete = (blog_id) => {
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
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      });
  };

  if (loading) return <LoaderPlane />;

  return (
    <>
      <ToastContainer />
      <Layout>
        <ul
          role="list"
          className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8 ml-[5%]"
        >
          {data?.getAllBlogs.blogs.map((blog) => (
            <>
              <li key={blog._id} className="relative">
                <div className="flex text-sm text-left bg-transparent text-blue-400 font-semibold py-2 px-2 border border-blue-500 rounded relative z-99 m-2 h-[35px] w-[83px]">
                  {blog.status}
                </div>
                <div className="group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="pointer-events-none object-cover group-hover:opacity-75"
                  />
                  <a href={"/dashboard/" + blog._id}>
                    <button
                      type="button"
                      className="absolute inset-0 focus:outline-none"
                    >
                      <span className="sr-only">
                        View details for {blog.title}
                      </span>
                    </button>
                  </a>
                </div>
                <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">
                  {blog?.title}
                </p>
                <p className="pointer-events-none block text-sm font-medium text-gray-500">
                  {blog?.description?.length > 115
                    ? blog?.description?.substring(0, 115) + "..."
                    : blog.description}
                </p>
                <button
                  className="flex bg-transparent hover:bg-red-500 text-red-400 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded relative z-99 mt-4 w-[100px]"
                  onClick={() => handleDelete(blog._id)}
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
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                  Delete
                </button>
              </li>
            </>
          ))}
              
        </ul>
      </Layout>
    </>
  );
}
