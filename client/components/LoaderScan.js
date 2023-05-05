import React from "react";

export default function LoaderScan() {
  return (
    <div className="mx-auto ml-0 pl-10 text-center flex center flex-col relative">
      <img className="mx-auto" src="/loader.gif"></img>
      <div className="-mt-12 animate-pulse text-sm" style={{
        position: 'absolute',
        bottom: '20%',
        left: '0',
        right: '0'
      }}>Loading ...</div>
    </div>
  );
}
