/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, Fragment, useState } from "react";
import Sidebar from "./SidebarNav";
import Navbar from "./Navbar";
import Footer from "./Footer";
import useStore from "../store/store";
import { useRouter } from "next/router";

export default function Layout({ children }) {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const updateAuthentication = useStore((state) => state.updateAuthentication);


  useEffect(() => {
    updateAuthentication();
  }, []);

  return (
    <Fragment>
      {isAuthenticated ? <Sidebar/> : <Navbar isOpen={false}/>}
      <div className={isAuthenticated && `authenticatedLayout`}>{children}</div>
    </Fragment>
  );
}
