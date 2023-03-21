import React, { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { htmlToJson, jsonToHtml } from "./helpers/helper";

let data = {
  tag: "BODY",
  attributes: {},
  children: [
    {
      tag: "P",
      attributes: {},
      children: ["dsds"],
    },
    {
      tag: "P",
      attributes: {},
      children: ["sdos"],
    },
    {
      tag: "P",
      attributes: {},
      children: ["ldnds"],
    },
    {
      tag: "P",
      attributes: {},
      children: ["SDodd"],
    },
    {
      tag: "P",
      attributes: {},
      children: ["sDodnoid"],
    },
  ],
};

export default function TinyMCEEditor() {
  const [editorText, setEditorText] = useState("");

  useEffect(() => {
    const htmlDoc = jsonToHtml(data);
    setEditorText(htmlDoc);
  }, []);

  const handleSave = () => {
    data = htmlToJson(editorText);
    console.log(data);
  };

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
