import React from "react";
import Lottie from "lottie-react";
import loader from "./loader.json";
import Typewriter from "typewriter-effect";

export default function LoaderPlane() {
  const style = {
    height: 250,
  };
  return (
    <div className="mx-auto ml-0 pl-10 text-center flex center flex-col ">
      <Lottie style={style} animationData={loader} loop={true} />
      <Typewriter
        onInit={(typewriter) => {
          typewriter
            .pauseFor(500)
            .typeString("Searching the sources on the Internet.")
            .pauseFor(500)
            .deleteAll()
            .typeString("Extracting Ideas from the sources.")
            .pauseFor(500)
            .deleteAll()
            .typeString("Creating backlinks for your blogs.")
            .pauseFor(500)
            .deleteAll()
            .typeString("Generating H1 & H2 headings")
            .pauseFor(500)
            .deleteAll()
            .typeString("Creating the blog for you!!")
            .pauseFor(500)
            .start();
        }}
      />
    </div>
  );
}
