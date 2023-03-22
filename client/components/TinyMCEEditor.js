import React, { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { htmlToJson, jsonToHtml } from "../helpers/helper";
import { generateBlog } from "../graphql/mutations/generateBlog";
import { updateBlog } from "../graphql/mutations/updateBlog";
import { useMutation } from "@apollo/client";

export default function TinyMCEEditor(topic) {
  const [editorText, setEditorText] = useState("");
  const [blog_id, setblog_id] = useState("");

  const [GenerateBlog, { data, loading, error }] = useMutation(generateBlog);
  const [
    UpdateBlog,
    { data: updateData, loading: updateLoading, error: updateError },
  ] = useMutation(updateBlog);

  useEffect(() => {
    GenerateBlog({
      variables: {
        options: {
          user_id: "640ece0e2369c047dbe0b8fb",
          keyword: topic.topic,
        },
      },
      onCompleted: (data) => {
        const aa = data.generate.publish_data[2].tiny_mce_data;
        setblog_id(data.generate._id);
        console.log("+++", aa);
        const htmlDoc = jsonToHtml(aa);
        setEditorText(htmlDoc);
        console.log("Sucessfully generated the article");
      },
      onError: (error) => {
        console.log(error);
      },
    }).catch((err) => {
      console.log(err);
    });
  }, []);

  const handleSave = () => {
    const jsonDoc = htmlToJson(editorText);
    UpdateBlog({
      variables: {
        options: {
          tinymce_json: jsonDoc,
          blog_id: blog_id,
          platform: "wordpress",
        },
      },
      onCompleted: (data) => {
        const aa = data.generate.publish_data[2].tiny_mce_data;
        console.log("+++", aa);
        const htmlDoc = jsonToHtml(aa);
        setEditorText(htmlDoc);
        console.log("Sucessfully generated the article");
      },
      onError: (error) => {
        console.log(error);
      },
    }).catch((err) => {
      console.log(err);
    });
  };

  if (loading) return <p>loading..</p>;
  return (
    <>
      <Editor
        value={editorText}
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
