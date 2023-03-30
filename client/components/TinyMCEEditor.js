import React, { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { htmlToJson, jsonToHtml } from "../helpers/helper";
import { generateBlog } from "../graphql/mutations/generateBlog";
import { updateBlog } from "../graphql/mutations/updateBlog";
import LoaderPlane from "./LoaderPlane";
import { useMutation } from "@apollo/client";
import AuthenticationModal from "../components/AuthenticationModal";

export default function TinyMCEEditor({
  topic,
  isAuthenticated,
  editorText,
  loading,
  blog_id,
}) {
  const [updatedText, setEditorText] = useState();
  const [authenticationModalType, setAuthneticationModalType] = useState("");
  const [authenticationModalOpen, setAuthenticationModalOpen] = useState(false);
  var getToken;
  if (typeof window !== "undefined") {
    getToken = localStorage.getItem("token");
  }
  const [
    UpdateBlog,
    { data: updateData, loading: updateLoading, error: updateError },
  ] = useMutation(updateBlog, {
    context: {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getToken,
      },
    },
  });

  const handleSave = () => {
    //console.log(isAuthenticated);
    if (isAuthenticated) {
      const jsonDoc = htmlToJson(editorText).children;
      const formatedJSON = { children: [...jsonDoc] };
      UpdateBlog({
        variables: {
          options: {
            tinymce_json: formatedJSON,
            blog_id: blog_id,
            platform: "wordpress",
          },
        },
        onCompleted: (data) => {
          const aa = data.generate.publish_data[2].tiny_mce_data;
          //console.log("+++", aa);
          const htmlDoc = jsonToHtml(aa);
          //console.log(updatedText)
          setEditorText(htmlDoc);
          //console.log(updatedText)
          //console.log("Sucessfully generated the article");
        },
        onError: (error) => {
          //console.log(error);
        },
      }).catch((err) => {
        //console.log(err);
      });
    } else {
      setAuthneticationModalType("signup");
      setAuthenticationModalOpen(true);
    }
  };

  if (loading) return <LoaderPlane />;
  //if(editorText){console.log(editorText)}
  return (
    <>
      <AuthenticationModal
        type={authenticationModalType}
        setType={setAuthneticationModalType}
        modalIsOpen={authenticationModalOpen}
        setModalIsOpen={setAuthenticationModalOpen}
      />
      <Editor
        value={editorText ? editorText : updatedText}
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
        }}
      />

      <button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        onClick={handleSave}
      >
        Save
      </button>
    </>
  );
}
