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
  
    return <span style={{ color: "var(--primary-blue)" }} className="">
    <TextTransition springConfig={presets.gentle}>
      <span className="">
        {text[index % text.length] =='Writing' ?
        <>&nbsp;&nbsp;Writing&nbsp;&nbsp;</>: 
        <>{text[index % text.length]}</> 
        }  
      </span>
    </TextTransition>
  </span>
  }