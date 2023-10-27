import React, { useEffect, useState } from 'react';
import MisciSwiperPage from '@/components/MisciSwiperPage';
import { Swiper, SwiperSlide } from "swiper/react";
import infinityLoop from "../../lottie/infinity-loop.json";

import { Pagination, Autoplay, Navigation } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import { NextPage } from 'next';
import { FloatingBalls } from '@/components/ui/Chip';
import Lottie from 'lottie-react';
import { API_BASE_PATH, API_ROUTES } from '@/constants/apiEndpoints';

type TopQuestion = {
  question: string;
  short_answer: string;
  detail_answer: string;
  image: string;
}


const MisciAll: NextPage = () => {
  const [data, setData] = useState<TopQuestion[]>([]);

  useEffect(() => {
    const fetchData = () => {
      fetch(API_BASE_PATH + API_ROUTES.MISCI_TOP_ALL,{
        method: 'GET'
      })
        .then(res => res.json())
        .then(res => {
          if(!res.error){
            setData(res.data)
          }
        })
    }

    fetchData()
  },[])

  return (
    <div className="relative overflow-x-hidden flex items-center justify-start flex-col w-full min-h-screen">
      <div id='background' className='w-full h-full overflow-hidden fixed pointer-events-none'>
        <FloatingBalls className="absolute top-[40%] left-[2%]" />
        <FloatingBalls className="absolute top-[70%] left-[10%]" />
        <FloatingBalls className="absolute top-[10%] right-[2%]" />
        <FloatingBalls className="absolute top-[50%] right-[10%]" />
        <div
          style={{
            width: 1285.42,
            height: "100%",
            transform: "rotate(-340deg)",
            position: "absolute",
            top: "-26%",
            right: "-10%",
            background: "linear-gradient(255deg, #EAF2FE 0%, #F3F6FB 60%, rgba(251, 247.32, 243, 0) 100%)",
            objectFit: "cover",
            objectPosition: "center center",
            zIndex: -1,
          }}
        />
        <div
          style={{
            width: 1214.42,
            height: 1093.78,
            position: "absolute",
            top: "-10%",
            left: "-10%",
            transform: "rotate(-160deg)",
            background:
              "linear-gradient(255deg, #E2EFFF 28.8%, #F3F6FB 57.32%, rgba(251, 247, 243, 0.00) 76.42%)",
            objectFit: "cover",
            objectPosition: "center center",
            zIndex: -1,
          }}
        />
        <div
          style={{
            width: 91.19,
            height: 91.19,
            transformOrigin: "0 0",
            position: "absolute",
            background: "linear-gradient(180deg, #40AFFF 0%, #FA19A4 100%)",
            fill: "linear-gradient(180deg, #40AFFF 0%, #FA19A4 138.46%)",
            filter: "blur(65px) drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))",
          }}
          className="rounded-full shadow-lg top-[80%] left-[0%]"
        />{" "}
        <div
          style={{
            width: 91.19,
            height: 91.19,
            transformOrigin: "0 0",
            position: "absolute",
            background: "linear-gradient(180deg, #40AFFF 0%, #FA19A4 100%)",
            fill: "linear-gradient(180deg, #40AFFF 0%, #FA19A4 138.46%)",
            filter: "blur(65px) drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))",
          }}
          className="rounded-full shadow-lg right-0 top-[20%]"
        />
      </div>
      {/* <h1>Top Queries By Our Visitors And Our Answers</h1> */}
      <div className="max-w-[80%] my-6 flex items-center justify-around flex-col md:flex-row z-[1]">
          <span className="w-[8rem] min-w-[8rem] relative flex items-center justify-center">
            <img
              className="h-full w-full"
              style={{
                mixBlendMode: "color-burn",
                objectFit: 'cover'
              }}
              src="/miscinew.png"
              alt="MisciLog"
            />
          </span>
          <Lottie animationData={infinityLoop} className="w-[5rem] min-w-[5rem]" />
          <span className="w-[9rem] min-w-[9rem]" >
            <img 
              className="h-[60px] w-full"
              style={{
                mixBlendMode: "color-burn",
                objectFit: 'cover'
              }}
              src="/misci_main.png" 
              alt="misci_main" 
            />
          </span>
        </div>
      <Swiper
        modules={[Pagination, Autoplay, Navigation]}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 30000,
          disableOnInteraction: false,
        }}
        spaceBetween={50}
        navigation={true}
      >
          {data.map((page,index) => (
            <SwiperSlide key={index} className='max-w-[850px]'>
                  <MisciSwiperPage question={page.question} answer={page.short_answer} reasoning={page.detail_answer} img={page.image} />
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  );
};

export default MisciAll;