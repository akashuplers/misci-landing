/* eslint-disable react-hooks/exhaustive-deps */
import { meeAPI } from "@/graphql/querys/mee";
import { useQuery } from "@apollo/client";
import { Fragment, useEffect } from "react";
import { toast } from "react-toastify";
import useStore, { MeeDataStore, useUserData } from "../store/store";
import Navbar from "./Navbar";
import Sidebar from "./SidebarNav";
import { useRouter } from "next/router";

export default function Layout({ blogId,  children, saveAuthModal = null,setSaveAuthModal = null }) {
  
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const updateAuthentication = useStore((state) => state.updateAuthentication);
  const router = useRouter();
  const pathName = router.pathname;
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
  const styles = {
    height: `calc(100vh - 5rem)`
  }

  return (
    <Fragment>
      {isAuthenticated ? <Sidebar /> : <Navbar 
        isOpen={false} 
        blogId={blogId} 
        saveAuthModal={saveAuthModal}
        setSaveAuthModal={setSaveAuthModal}
      />}
      <div className={isAuthenticated ? `authenticatedLayout` : ''}
      style={ pathName.includes('/dashboard')?styles: {}}
      >{children}</div>
    </Fragment>
  );
}
