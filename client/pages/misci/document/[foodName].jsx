import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router';
import Lottie from "lottie-react";
import infinityLoop from "../../../lottie/infinity-loop.json";
import { foodItemsJson } from '../../../public/data/misci-data';

function DocumentPage() {
  const router = useRouter();
  const { foodName } = router.query;
  const [foodImageUrl, setFoodImageUrl] = useState(foodName);

  const notesObj = foodItemsJson[0].notes;

  const [foodItemName, setFoodItemName] = useState('');

  const getImageUrlFromFoodItemsList = (foodName) => {
    const foodItem = foodItemsJson.find(item => item.title === foodName);
    return foodItem ? foodItem.imageUrl : null;
  }

  useEffect(() => {
    const { foodName } = router.query;
    setFoodItemName(foodName);
    const imageUrl = getImageUrlFromFoodItemsList(foodName);
    setFoodImageUrl(imageUrl);
  }, []);


  return (
    <div className='h-screen bg-yellow-50'>
        <div className="flex flex-col flex-col-reverse lg:flex-row items-center">
            {/* heading text */}
            <div className="w-screen text-center lg:pl-44">
                <h1 className="text-5xl italic uppercase font-bold mb-4">
                    {foodName}
                </h1>
            </div>
            
            {/* infinity UI */}
            <div className="mb-6 flex items-center justify-end me-3 mt-2 md:flex-row">
                <span className="w-[8rem] min-w-[8rem] relative flex items-center justify-center">
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
        </div>
        <div className='grid grid-cols-5 gap-12 px-5'>
          {/* food image */}
          <div className='col-start-1 col-end-2'>
            <img
              src={foodImageUrl}
              alt='food-image'
              className='h-[12rem] lg:h-[35rem] md:h-[22rem] w-[30rem]'
            />
          </div>

          {/* food notes */}
          <div className='col-start-2 col-end-6'>
            <p className='text-xl font-bold mb-2'>Different Types</p>
            <ul>
              {notesObj?.differentTypes.map((item, index) => (
                <li key={index}>
                  <p>{item}</p>
                </li>
              ))}
            </ul>

            <p className='text-xl font-bold mb-2 mt-2'>Are Acorns Edible?</p>
            <ul>
              {notesObj?.areAcornsEdible.map((item, index) => (
                <li key={index}>
                  <p>{item}</p>
                </li>
              ))}
            </ul>

            <p className='text-xl font-bold mb-2 mt-2'>Acorn for Skincare</p>
            <ul>
              {notesObj?.acornForSkincare.map((item, index) => (
                <li key={index}>
                  <p>{item}</p>
                </li>
              ))}
            </ul>

            <p className='text-xl font-bold mb-2 mt-2'>Acorn and Climate Change</p>
            <ul>
              {notesObj?.acornForSkincare.map((item, index) => (
                <li key={index}>
                  <p>{item}</p>
                </li>
              ))}
            </ul>

            <p className='text-xl font-bold mb-2 mt-2'>References</p>
            <ul className='list-decimal'>
              {notesObj?.references.map((item, index) => (
                <li key={index}>
                  <a href={item} target='_blank' className='underline pointer-cursor text-blue-500'>{item}</a>
                </li>
              ))}
            </ul>

          </div>          

        </div>

        {/* chat */}
        <img
            className='h-12 absolute bottom-10 right-7 cursor-pointer bg-gray-500 rounded-sm p-1.5'
            src="/chat.png"
            style={{objectFit: 'cover'}}
            onClick={() => router.replace('/misci')}
        />
    </div>
  )
}

export default DocumentPage;