import Image from "next/image";

 const TestimonialUserCard = ({ imageSrc, name, content }) => {
  return (
    <div className="w-[451px] h-[356px] left-[847px] top-[22px] absolute opacity-60 flex-col justify-center items-center inline-flex">
      <div className="h-[284px] px-10 pt-[50px] pb-[90px] rounded-lg flex-col justify-start items-center gap-6 flex">
        <div className="w-6 h-6 relative" />
        <div className="self-stretch h-24 flex-col justify-center items-start gap-6 flex">
          <div className="self-stretch opacity-70 text-center text-black text-[16px] font-normal leading-normal">
            {content}
          </div>
        </div>
      </div>
      <div className="flex-col justify-start items-center gap-2 flex">
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