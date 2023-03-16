import React, { useState } from "react";
import Layout from "../components/Layout";
import { Editor } from "@tinymce/tinymce-react";
import DragNdrop from "../components/dragNdrop";

export default function Home() {
  return (
    <>
      <Layout />

      <div className="h-[100%] w-[60%] pl-[20%]">
        <DragNdrop />
        <Editor apiKey="qagffr3pkuv17a8on1afax661irst1hbr4e6tbv888sz91jc" />
      </div>
    </>
  );
}
