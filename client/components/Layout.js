/* eslint-disable react-hooks/exhaustive-deps */
import { meeAPI } from "@/graphql/querys/mee";
import { useQuery } from "@apollo/client";
import { Fragment, useEffect } from "react";
import { toast } from "react-toastify";
import useStore, { MeeDataStore, useUserData } from "../store/store";
import Navbar from "./Navbar";
import Sidebar from "./SidebarNav";

export default function Layout({ blogId,  children }) {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const updateAuthentication = useStore((state) => state.updateAuthentication);
  const { meeData, getUserData, updateUserData } = useUserData();
  var getToken;
  useEffect(() => {
    if (typeof window !== "undefined") {
      getToken = localStorage.getItem("token");
    }
  }, []);
  
  useEffect(() => {
    updateAuthentication();
  }, []);

  return (
    <Fragment>
      {isAuthenticated ? <Sidebar /> : <Navbar isOpen={false} blogId={blogId} />}
      <div className={isAuthenticated ? `authenticatedLayout` : ''}>{children}</div>
    </Fragment>
  );
}
