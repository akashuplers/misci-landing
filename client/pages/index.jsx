// import Lottie from 'lottie-react';

import Lottie from "lottie-react";
import infinityLoop from "../lottie/infinity-loop.json";
import { useRouter } from "next/router";

function Home() {
  const router = useRouter();

  return (
    <div className='relative'>
        <div
            className="bg-cover bg-center h-screen flex flex-col text-white absolute opacity-80"
            style={{
                backgroundImage: "url(../ukrainian_cuisine.jpg)",
            }}
        >
            {/* infinity UI */}
            <div className="mb-6 flex items-center justify-end me-6 mt-4 flex-col md:flex-row">
                <span className="w-[8rem] min-w-[8rem] relative flex items-center justify-center">
                <img
                    className="w-full bg-gray-100"
                    style={{
                    objectFit: 'cover'
                    }}
                    src="/miscinew.png"
                    alt="MisciLog"
                />
                </span>
                <Lottie animationData={infinityLoop} className="w-[5rem] min-w-[5rem]" />
                <span className="w-[9rem] min-w-[9rem]" >
                <img 
                    className="h-[70px] w-full bg-gray-100"
                    style={{
                    objectFit: 'cover'
                    }}
                    src="/misci_main.png"
                    alt="misci_main"
                />
                </span>
            </div>

            {/* other text */}
            <div style={{marginTop: "1rem" }} className='flex flex-col items-center relative'>
                <h1 className="text-6xl font-bold mb-4">Ground to Gourmet</h1>
                <h2 className="text-2xl font-bold text-center mt-4 mb-2">TRACING THE ORIGINS OF THE {<br />} FOOD WE LOVE</h2>
                <p className="text-2xl font-bold text-center mt-4 px-10">
                    Explore the captivating world of New York State’s food from Apples to Oysters and beyond. Ground to Gourmet takes a tour through the native and naturalized foods of New York, and the human interactions that led to their modern cultivation.
                </p>

                {/* trigger button for types of food page */}
                <div
                    className='text-center mt-20 mb-4 cursor-pointer'
                    onClick={() => router.push('/misci/food-list')}
                >
                    <p style={{border: "3px solid #eee"}} className="text-4xl font-bold rounded-lg p-2 bg-green-600 font-mono">Explore food!</p>
                </div>
            </div>

            {/* chat */}
            <img
                className='h-12 absolute bottom-10 right-7 cursor-pointer'
                src="/chat.png"
                style={{objectFit: 'cover'}}
                onClick={() => router.push('/misci')}
            />
        </div>
    </div>
  )
}

export default Home;