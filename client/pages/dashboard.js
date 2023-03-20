import React, { useState } from "react";
import Layout from "../components/Layout";
import { Editor } from "@tinymce/tinymce-react";
import DragNdrop from "../components/DragAndDrop";
import DashboardInsights from "../components/DashboardInsights";

export default function Home() {
  return (
    <>
      <Layout />
      <div className="flex divide-x">
        <div className="h-[100%] w-[65%] pl-[20%] pr-9">
          <DragNdrop />
          <Editor apiKey="qagffr3pkuv17a8on1afax661irst1hbr4e6tbv888sz91jc" />
        </div>
        <DashboardInsights />
      </div>
    </>
  );
}
