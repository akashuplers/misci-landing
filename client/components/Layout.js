import React, { useState, useEffect, Fragment } from "react";
import Sidebar from "./SidebarNav";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    var getToken;
    if (typeof window !== "undefined") {
      getToken = localStorage.getItem("token");
    }
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
          <Navbar isOpen={false} />
          {children}
          <Footer />
        </>
      )}
    </Fragment>
  );
}
