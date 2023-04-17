import React from "react";
import Lottie from "lottie-react";
import loader from "./loader.json";
export default function LoaderPlane() {
  const style = {
    height: 250,
  };
  return (
    <div className="mx-auto ml-0 pl-10 text-center flex center flex-col ">
      <Lottie style={style} animationData={loader} loop={true} />
      <div className="-mt-12 animate-pulse text-xs">Loading ...</div>
    </div>
  );
}
