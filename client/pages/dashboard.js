import React, { useState } from "react";
import Layout from "../components/Layout";
import { Editor } from "@tinymce/tinymce-react";
import DragNdrop from "../components/DragAndDrop";
import DashboardInsights from "../components/DashboardInsights";

import TinyMCEEditor from "../components/TinyMCEEditor";

export default function Home() {
  return (
    <>
      <Layout />
      <div className="flex divide-x">
        <div className="h-[100%] w-[65%] pl-[20%] pr-9">
          <TinyMCEEditor />
        </div>
        <DashboardInsights />
      </div>
    </>
  );
}
