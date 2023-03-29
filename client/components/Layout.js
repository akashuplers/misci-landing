import React, { useState, useEffect, Fragment } from "react";
import Sidebar from "./SidebarNav";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }) {
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
    <Fragment>
      {isAuthenticated ? (
        <>
          <Sidebar />
          <div className=" mx-auto">{children}</div>
        </>
      ) : (
        <>
          <Navbar />
          {children}
          <Footer />
        </>
      )}
    </Fragment>
  );
}
