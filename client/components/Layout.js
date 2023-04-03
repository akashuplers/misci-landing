/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, Fragment } from "react";
import Sidebar from "./SidebarNav";
import Navbar from "./Navbar";
import Footer from "./Footer";
import useStore from "../store/store";

export default function Layout({ children }) {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const updateAuthentication = useStore((state) => state.updateAuthentication);

  useEffect(() => {
    updateAuthentication();
  }, []);

  return (
    <Fragment>
      {isAuthenticated ? (
        <>
          <Sidebar />
          <div className="mx-auto">{children}</div>
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
