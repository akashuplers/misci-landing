import React, { useState } from "react";
import Layout from "../components/Layout";
import DragNdrop from "../components/DragAndDrop";
import DashboardInsights from "../components/DashboardInsights";

import TinyMCEEditor from "../components/TinyMCEEditor";

dashboard.getInitialProps = ({ query }) => {
  return { query };
};

export default function dashboard({ query }) {
  const { topic } = query;
  return (
    <>
      <Layout />
      <div className="flex divide-x">
        <div className="h-[100%] w-[65%] pl-[20%] pr-9">
          <TinyMCEEditor topic={topic} />
        </div>
        <DashboardInsights />
      </div>
    </>
  );
}
