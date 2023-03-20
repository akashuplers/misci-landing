import React from "react";
import Sidebar from "./SidebarNav";

export default function Layout({ children }) {
  return (
    <>
      <Sidebar />

      <div className=" mx-auto">{children}</div>
    </>
  );
}
