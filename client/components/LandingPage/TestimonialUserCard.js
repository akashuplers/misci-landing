import Image from "next/image";
import { QuoteOpen } from "../localicons/localicons";

const TestimonialUserCard = ({ imageSrc, name, content, selected = false }) => {
  return (
    <div
      className={`${
        !selected ? "opacity-60" : ""
      } flex-col justify-center items-center inline-flex`}
    >
      <div
        className={`${
          selected == true ? "bg-blue-700 text-white opacity-100" : ""
        }px-10 pt-[50px] pb-[90px] rounded-lg flex-col justify-start items-center gap-6 flex`}
      >
        <QuoteOpen className={`w-6 h-6 ${selected ? "text-white" : ""} `} />
        <div className="self-stretch h-24 flex-col justify-center items-start gap-6 flex">
          <div
            className={`self-stretch opacity-70 text-center ${
              !selected ? "text-black" : "text-white"
            } text-[16px] font-normal leading-normal`}
          >
            {content}
          </div>
        </div>
      </div>
      <div
        className={`flex-col justify-start items-center gap-2 flex ${
          selected && " -mt-9"
        }`}
      >
        <div className="w-[90px] h-[90px] justify-center items-center inline-flex">
          <Image
            className="w-[90px] h-[90px] rounded-full"
            src={imageSrc}
            alt="Customer"
            width={90}
            height={90}
          />
        </div>
        <div className="text-zinc-800 text-[16px] font-semibold">{name}</div>
      </div>
    </div>
  );
};

export default TestimonialUserCard;
