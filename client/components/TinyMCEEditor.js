import React, { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { htmlToJson, jsonToHtml } from "./helpers/helper";

const handleEditorChange = (content, editor) => {
  console.log("Content was updated:", content);
};

export default function TinyMCEEditor() {
  const [content, setContent] = useState("");

  return (
    <Editor
      initialValue={content}
      apiKey="fe5diy29pdw6ao3sud8j2wqjgzuoeli3um07gw0hh9h8f7a6"
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
        const _json = htmlToJson(content);
        console.log(_json);
        // handleEditorChange(content, editor);
      }}
    />
  );
}
