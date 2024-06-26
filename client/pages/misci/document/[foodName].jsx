import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router';
import Lottie from "lottie-react";
import infinityLoop from "../../../lottie/infinity-loop.json";
import { foodItemsJson } from '../../../public/data/misci-data';

function DocumentPage() {
  const router = useRouter();
  const [foodImageUrl, setFoodImageUrl] = useState('');
  const [notes, setNotes] = useState([]);
  const [references, setReferences] = useState([]);
  const [foodItemName, setFoodItemName] = useState('');

  const getFoodItemObj = (foodName) => {
    const foodItem = foodItemsJson.find(item => item?.title?.toLowerCase() === foodName?.toLowerCase());
    return foodItem ? foodItem : null;
  }

  useEffect(() => {
    const { foodName } = router.query;
    setFoodItemName(foodName);
    const foodItemObj = getFoodItemObj(foodName);

    if(foodItemObj) {
      setFoodItemName(foodItemObj?.title);
      setFoodImageUrl(foodItemObj?.imageUrl);
      setNotes(foodItemObj?.notes);
      setReferences(foodItemObj?.references);
    }
  }, [router.query]);


  return (
    <div className='h-screen overflow-y-auto bg-yellow-50'>
        {/* head */}
        <div className="flex flex-col flex-col-reverse lg:flex-row items-center">
            {/* heading text */}
            <div className="w-screen text-center lg:pl-44">
                <h1 className="text-3xl md:text-5xl italic uppercase font-bold mb-4">
                    {foodItemName}
                </h1>
            </div>
            
            {/* infinity UI */}
            <div className="mb-6 flex pl-5 md:pl-0 items-center justify-center md:justify-end me-3 mt-2 md:flex-row">
              <span className="w-[6rem] md:w-[8rem] md:min-w-[8rem] relative flex items-center justify-center">
              <img
                  className="w-full h-[11vh] bg-gray-100"
                  style={{
                  objectFit: 'cover'
                  }}
                  src="/miscinew.png"
                  alt="MisciLog"
              />
              </span>
              <Lottie animationData={infinityLoop} className="w-[5rem] min-w-[5rem]" />
              <span className="w-[6.5rem] md:w-[9rem] md:min-w-[9rem]" >
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
        </div>

        {/* body */}
        <div className='md:grid md:grid-cols-5 flex flex-col md:gap-8 lg:gap-12 gap-6 px-7 mb-[6rem]'>
          {/* food image */}
          <div className='md:col-start-1 md:col-end-2 pl-[3rem] pr-[3rem] md:pl-0 md:pr-0'>
            <img
              src={foodImageUrl}
              alt='food-image'
              className='h-[10rem] xl:h-[35rem] lg:h-[27rem] md:h-[18rem] md:w-[30rem]'
            />
          </div>

          {/* food notes */}
          <div className='md:col-start-2 md:col-end-6 text-justify'>
            {notes?.map((item, index) => (
              <div key={index}>
                <p className='text-xl font-bold mb-2'>{item?.title + ' :'}</p>
                <ul className='mb-3'>
                  {item?.bulletPoints?.map((ele, index) => (
                    <li key={index}>
                      <p>{ele}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* references */}
            <div>
              <p className='text-xl font-bold mb-2 mt-2'>References</p>
              <ul className='list-decimal'>
                {references?.map((item, index) => (
                  <li key={index}>
                    <a href={item} target='_blank' className='underline pointer-cursor text-blue-500'>{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* chat */}
        <img
          className='h-12 absolute bottom-10 right-7 cursor-pointer bg-gray-400 rounded-md p-1.5'
          src="/chat.png"
          style={{objectFit: 'cover'}}
          onClick={() => router.replace('/misci')}
        />
    </div>
  )
}

export default DocumentPage;