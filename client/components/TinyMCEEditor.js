/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { htmlToJson, jsonToHtml } from "../helpers/helper";
import { generateBlog } from "../graphql/mutations/generateBlog";
import { updateBlog } from "../graphql/mutations/updateBlog";
import LoaderPlane from "./LoaderPlane";
import { useMutation } from "@apollo/client";
import AuthenticationModal from "./AuthenticationModal";
import { useRouter } from "next/router";
import { useMemo } from "react";

export default function TinyMCEEditor({
  topic,
  isAuthenticated,
  editorText,
  loading,
  blog_id,
  blogData
}) {
  const [updatedText, setEditorText] = useState(editorText);
  
  const [authenticationModalType, setAuthneticationModalType] = useState("");
  const [authenticationModalOpen, setAuthenticationModalOpen] = useState(false);
  const router = useRouter();
  var getToken;
  if (typeof window !== "undefined") {
    getToken = localStorage.getItem("token");
  }
  const [
    UpdateBlog,
    { data: updateData, loading: updateLoading, error: updateError },
  ] = useMutation(updateBlog);

  const handleSave = () => {
    if (typeof window !== "undefined") {
      getToken = localStorage.getItem("token");
    }
    if (getToken) {
      console.log("token", getToken);
      const jsonDoc = htmlToJson(updatedText).children;
      const formatedJSON = { children: [...jsonDoc] };
      UpdateBlog(
        {
          variables: {
            options: {
              tinymce_json: formatedJSON,
              blog_id: blog_id,
              platform: "wordpress",
            },
          },
        },
        {
          context: {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + getToken,
            },
          },
        }
      )
        .then(() => {
          router.push("/dashboard/" + blog_id);
        })
        .catch((err) => {
          //console.log(err);
        });
      setAuthenticationModalOpen(false);
    } else {
      setAuthneticationModalType("signup");
      setAuthenticationModalOpen(true);
    }
  };

  if (loading) return <LoaderPlane />;

  function handleBlog(e){
    const siblingButton = document.querySelectorAll(".blog-toggle-button");
    siblingButton.forEach(el => el.classList.remove("active"))
    const button = e.target;
    button.classList.add("active")

    const aa = blogData.publish_data[2].tiny_mce_data;
    const htmlDoc = jsonToHtml(aa);

    setEditorText(htmlDoc);
  }
  function handleLinkedinBlog(e){
    const siblingButton = document.querySelectorAll(".blog-toggle-button");
    siblingButton.forEach(el => el.classList.remove("active"))
    const button = e.target;
    button.classList.add("active")

    const aa = blogData.publish_data[0].tiny_mce_data;
    const htmlDoc = jsonToHtml(aa);

    setEditorText(htmlDoc);
  }
  function handleTwitterBlog(e){
    const siblingButton = document.querySelectorAll(".blog-toggle-button");
    siblingButton.forEach(el => el.classList.remove("active"))
    const button = e.target;
    button.classList.add("active")

    const aa = blogData.publish_data[1].tiny_mce_data;
    const htmlDoc = jsonToHtml(aa);

    setEditorText(htmlDoc);
  }

  return (
    <>
      {isAuthenticated ? 
        <div style={{
          'position': 'absolute',
          'top': '-6%',
          'left': '0',
          'display': 'flex',
          'gap': '0.5em'
        }}>
          <button className="blog-toggle-button active" onClick={handleBlog}>Blog</button>
          <button className="blog-toggle-button" onClick={handleLinkedinBlog}>Linkedin</button>
          <button className="blog-toggle-button" onClick={handleTwitterBlog}>Twitter</button>
        </div> : 
        <div></div> 
      }
      <AuthenticationModal
        type={authenticationModalType}
        setType={setAuthneticationModalType}
        modalIsOpen={authenticationModalOpen}
        setModalIsOpen={setAuthenticationModalOpen}
        handleSave={handleSave}
      />
      <Editor
        value={updatedText || editorText}
        apiKey="ensd3fyudvpis4e3nzpnns1vxdtoexc363h3yww4iepx6vis"
        init={{
          skin: "naked",
          icons: "small",
          toolbar_location: "bottom",
          plugins: "lists code table codesample link",
          menubar: false,
          statusbar: false,
          height: 600,
          plugins:
            "preview powerpaste casechange importcss tinydrive searchreplace autolink autosave save directionality advcode visualblocks visualchars fullscreen image link media mediaembed template codesample table charmap pagebreak nonbreaking anchor tableofcontents insertdatetime advlist lists checklist wordcount tinymcespellchecker a11ychecker editimage help formatpainter permanentpen pageembed charmap mentions quickbars linkchecker emoticons advtable export footnotes mergetags autocorrect",
          menu: {
            tc: {
              title: "Comments",
              items: "addcomment showcomments deleteallconversations",
            },
          },
          toolbar:
            "undo redo | bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist checklist | forecolor backcolor casechange permanentpen formatpainter removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media pageembed template link anchor codesample | a11ycheck ltr rtl | showcomments addcomment | footnotes | mergetags",
        }}
        onEditorChange={(content, editor) => {
          setEditorText(content);
          console.log(updatedText);
        }}
      />

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        onClick={handleSave}
      >
        Save
      </button>
    </>
  );
}
