/* eslint-disable react/jsx-key */
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import styles from "../styles/saved.module.css";
import { useQuery } from "@apollo/client";
import { getAllBlogs } from "../graphql/queries/getAllBlogs";
import Head from "next/head";
import { contextType } from "react-modal";

export default function Saved() {
  const { data, error, loading } = useQuery(getAllBlogs, {
    context: {
      headers: {
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
    variables: {
      options: { status: "published", page_skip: 0, page_limit: 7 },
    },
  });
  console.log(data);

  if (loading) {
    return <h1>Loading</h1>;
  }

  const files = [
    {
      title: "IMG_4985.HEIC",
      size: "3.9 MB",
      source:
        "https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80",
    },
    // More files...
  ];

  return (
    <>
      <Layout>
        <ul
          role="list"
          className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8 ml-[5%]"
        >
          {data?.getAllBlogs.blogs.map((blog) => (
            <li key={blog._id} className="relative">
              <div className="group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="pointer-events-none object-cover group-hover:opacity-75"
                />
                <a href={"/public/" + blog._id} target="_blank">
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
                {blog.title}
              </p>
              <p className="pointer-events-none block text-sm font-medium text-gray-500">
                {blog.description.substring(0, 115) + "..."}
              </p>
            </li>
          ))}
              
        </ul>
      </Layout>
    </>
  );
}
