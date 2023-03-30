/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
// import { getAllBlogs } from "../graphql/queries/getAllBlogs";

export default function saved() {

    useEffect(() => {
        function fetchAllBlogs(){
            const accessToken = JSON.parse(localStorage.getItem("token")).accessToken

            var myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");
            myHeaders.append("Authorization", `Bearer ${accessToken}`);

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
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));
        }
        fetchAllBlogs()
    },[])

    return (
        <>
            <Layout>
                <div className="flex divide-x">
                    <div className="h-[100%] w-[65%] ml-[27%] mr-9">
                        saved blogs
                    </div>
                </div>
            </Layout>
        </>
    );
}