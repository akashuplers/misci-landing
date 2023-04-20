import React from "react";

export default function LoaderScan() {
  return (
    <div className="mx-auto ml-0 pl-10 text-center flex center flex-col">
      <img className="mx-auto" src="/loader.gif"></img>
      <div className="-mt-12 animate-pulse text-xs">Loading ...</div>
    </div>
  );
}
