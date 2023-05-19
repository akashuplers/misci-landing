/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect } from "react";
import useStore from "../store/store";
import Navbar from "./Navbar";
import Sidebar from "./SidebarNav";

export default function Layout({ children }) {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const updateAuthentication = useStore((state) => state.updateAuthentication);


  useEffect(() => {
    updateAuthentication();
  }, []);

  return (
    <Fragment>
      {isAuthenticated ? <Sidebar /> : <Navbar isOpen={false} />}
      <div className={isAuthenticated && `authenticatedLayout`}>{children}</div>
    </Fragment>
  );
}
