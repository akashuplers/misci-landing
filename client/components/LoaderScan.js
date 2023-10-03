import React from "react";
<<<<<<< HEAD
import opener_loading from '../components/loader.json';
import LottiePlayer from "lottie-react";
export default function LoaderScan() {
  return (
    <div className="text-center flex items-center justify-center relative">
      <LottiePlayer
        loop
        autoplay
        animationData={opener_loading}
        className="h-48"
      />
=======

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
>>>>>>> misc-cp-prod-adg
    </div>
  );
}
