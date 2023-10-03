import React from "react";
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
    </div>
  );
}
