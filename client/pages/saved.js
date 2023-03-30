/* eslint-disable react-hooks/rules-of-hooks */
import { all } from "axios";
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
// import { getAllBlogs } from "../graphql/queries/getAllBlogs";

export default function saved() {
    const [allBlogs, setAllBlogs] = useState([
        {
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. ipsum dolor sit amet consectetur adipisicing elit. ',
            image: "https://images.pexels.com/photos/3471423/pexels-photo-3471423.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            tags: ["label1","label2"],
            title: "this a filler title",
            _id: "6423f2a5df61bee260863244"
        },
        {
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. ipsum dolor sit amet consectetur adipisicing elit. ',
            image: "https://images.pexels.com/photos/3471423/pexels-photo-3471423.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            tags: ["label1","label2"],
            title: "this a filler title",
            _id: "6423f2a5df61bee260863244"
        },
        {
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. ipsum dolor sit amet consectetur adipisicing elit. ',
            image: "https://images.pexels.com/photos/3471423/pexels-photo-3471423.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            tags: ["label1","label2"],
            title: "this a filler title",
            _id: "6423f2a5df61bee260863244"
        },
        {
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. ipsum dolor sit amet consectetur adipisicing elit. ',
            image: "https://images.pexels.com/photos/3471423/pexels-photo-3471423.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            tags: ["label1","label2"],
            title: "this a filler title",
            _id: "6423f2a5df61bee260863244"
        },
        {
            description: null,
            image: "https://images.pexels.com/photos/3471423/pexels-photo-3471423.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            tags: ["label1","label2"],
            title: "this a filler title",
            _id: "6423f2a5df61bee260863244"
        }
    ]);

    /*useEffect(() => {
        function fetchAllBlogs(){
            const accessToken = JSON.parse(localStorage.getItem("token")).accessToken

            var myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");
            myHeaders.append("Authorization", `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFrYXNoLnNoYXJtYUBub3dpZ2VuY2UuY29tIiwiaWQiOiI2NDBlY2VjZjIzNjljMDQ3ZGJlMGI4ZmYiLCJjb21wYW55Ijoibm93aWdlbmNlIiwiaWF0IjoxNjgwMDkzNzA0LCJleHAiOjE2ODAxODAxMDR9.B16uuyMYswzJxukm0LfAtZj0AvkGyk3oF_SEPK4oGCQ`);

            var raw = JSON.stringify({
            "query": "query GetAllBlogs {\n  getAllBlogs {\n    _id\n    title\n  description\n   tags\n   image\n }\n}"
            });

            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };

            fetch("https://maverick.lille.ai/graphql", requestOptions)
            .then(response => response.json())
            .then(result => {
                console.log(result)
                setAllBlogs(result.data.getAllBlogs)
            })
            .catch(error => console.log('error', error));
        }
        fetchAllBlogs()
    },[])

    if(allBlogs == null) return*/

    console.log(allBlogs)
    return (
        <>
            <Layout>
                <div className="flex divide-x">
                    <div className="h-[100%] w-[65%] ml-[27%] mr-9">
                         <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                            {allBlogs.map((blog) => (
                                <div key={blog._id} className="group relative">
                                    <div className="min-h-80 aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
                                        <img
                                        src={blog.image}
                                        alt={blog.title}
                                        className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                                        />
                                    </div>
                                    <div className="mt-4 flex justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">
                                                <span aria-hidden="true" className="absolute inset-0" />
                                                {blog.title}
                                            </h3>
                                            <p>{blog.description}</p>
                                            <div style={{
                                                    marginTop: "0.5em",
                                                    display: "flex",
                                                    gap: "0.25em"
                                            }}>
                                                {blog.tags.map(tag => {
                                                    return (
                                                        <div style={{
                                                            backgroundColor: "#bdd5f6",
                                                            padding: "0.1em",
                                                            color: "white",
                                                            borderRadius: "5px"
                                                        }}>
                                                            {tag}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
}
