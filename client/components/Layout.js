/* eslint-disable react-hooks/exhaustive-deps */
import { meeAPI } from "@/graphql/querys/mee";
import { useQuery } from "@apollo/client";
import { Fragment, useEffect } from "react";
import { toast } from "react-toastify";
import useStore, { MeeDataStore, useUserData } from "../store/store";
import Navbar from "./Navbar";
import Sidebar from "./SidebarNav";

export default function Layout({ children }) {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const updateAuthentication = useStore((state) => state.updateAuthentication);
  const { meeData, getUserData, updateUserData } = useUserData();
  var getToken;
  useEffect(() => {
    if (typeof window !== "undefined") {
      getToken = localStorage.getItem("token");
    }
  }, []);
  const {
    data: data,
    loading: meeLoading,
    error: meeError,
  } = useQuery(meeAPI, {
    context: {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getToken,
      },
    },
    onError: ({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        for (let err of graphQLErrors) {
          switch (err.extensions.code) {
            case "UNAUTHENTICATED":
              localStorage.clear();
              window.location.href = "/";
          }
        }
      }
      if (networkError) {
        console.log(`[Network error]: ${networkError}`);

        if (
          `${networkError}` ===
          "ServerError: Response not successful: Received status code 401" &&
          isAuthenticated
        ) {
          localStorage.clear();

          toast.error("Session Expired! Please Login Again..", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    },
  });
  useEffect(() => {
    updateAuthentication();
  }, []);
  useEffect(() => {
    if (data) {
      updateUserData(data);
    }
  }, [data]);


  return (
    <Fragment>
      {isAuthenticated ? <Sidebar /> : <Navbar isOpen={false} />}
      <div className={isAuthenticated && `authenticatedLayout`}>{children}</div>
    </Fragment>
  );
}
