import { useEffect, useState } from "react";
import TextTransition, { presets } from "react-text-transition";

interface Props {
    text: string[];
}
export const TextTransitionEffect = ({ text } : Props) => {
    const [index, setIndex] = useState(0);
    useEffect(() => {
      const intervalId = setInterval(
        () => setIndex((index) => index + 1),
        3000 // every 3 seconds
      );
      return () => clearTimeout(intervalId);
    }, []);
  
    return <span  style={{ color: "white"  , backgroundColor: "var(--primary-orange)" , padding: "0.5rem" , borderRadius: "0.5rem"
    }} className="flex items-center justify-center lg:w-[295px]">
    <TextTransition springConfig={presets.gentle}>
      <span className="">
        {text[index % text.length] =='Researches' ?
        <>&nbsp;&nbsp;Researches&nbsp;&nbsp;</>: 
        <>{text[index % text.length]}</> 
        }  
      </span>
    </TextTransition>
  </span>
  }