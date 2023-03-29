import React, { useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

import { EffectFlip, Pagination, Navigation, Autoplay } from "swiper";

export default function SwiperComponent({ data }) {
  return (
    <>
      <Swiper
        grabCursor={false}
        pagination={{
          clickable: true,
        }}
        navigation={false}
        modules={[Pagination]}
        className="mySwiper"
      >
        {data.map((item) => {
          return (
            <SwiperSlide>
              <div
                style={{
                  // background: "rgba(255, 255, 255, 0.06)",
                  boxShadow: "0px 10px 60px rgba(8, 115, 174, 0.08)",
                }}
                className="rounded-[10px] bg-[white] w-[90%] p-4 flex flex-col mt-0"
              >
                <div>
                  <img className="h-[50px]" src={item.icon} alt="" />
                </div>
                <div className="flex flex-col justify-start items-start">
                  <h1 className="text-[#0e0e2c] text-[24px] font-bold py-2">
                    {item.heading}
                  </h1>
                  <p className="text-[#756f86] font-normal text-[18px] py-2">
                    {item.description}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </>
  );
}
