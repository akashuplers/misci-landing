import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import DragNdrop from "../components/DragAndDrop";
import DashboardInsights from "../components/DashboardInsights";
import NavBar from "../components/NavBar";

import TinyMCEEditor from "../components/TinyMCEEditor";

dashboard.getInitialProps = ({ query }) => {
  return { query };
};

export default function dashboard({ query }) {
  const { topic } = query;
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const getToken = localStorage.getItem("token");
    if (
      getToken === "undefined" ||
      getToken === null ||
      getToken == undefined
    ) {
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, []);
  return (
    <>
      {isAuthenticated ? (
        <>
          <Layout />
          <div className="flex divide-x">
            <div className="h-[100%] w-[65%] pl-[20%] pr-9">
              <TinyMCEEditor topic={topic} isAuthenticated={isAuthenticated} />
            </div>
            <DashboardInsights />
          </div>
        </>
      ) : (
        <>
          <NavBar />
          <div className="flex divide-x">
            <div className="h-[100%] w-[65%] pl-[2%] pr-9">
              <TinyMCEEditor topic={topic} isAuthenticated={isAuthenticated} />
            </div>
            <DashboardInsights />
          </div>
        </>
      )}
    </>
  );
}
