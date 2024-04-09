import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router';
import Lottie from "lottie-react";
import infinityLoop from "../../../lottie/infinity-loop.json";
import { foodItemsJson } from '../../../public/data/misci-data';

const relatedQuestions = [
  'Who first domesticated tomatoes?',
  'When did tomatoes gain popularity in Italy and become known as "pomodoro" ?',
  'Why were tomatoes initially viewed with suspicion in Europe and the United States?',
];

const extractedEntities = '"What": ["tomatoes", "fiber", "vitamins A, C, and K, potassium, niacin, folate, and vitamin B6", "Vitamin C", "Potassium", "Vitamin K1", "Folate (vitamin B9)", "vegetarian or vegan diet", "carbs", "sugars", "fiber", "fat","protein", "potassium", "vitamin C", "lutein", "zeaxanthin", "lycopene"], "Why": ["blood pressure control", "heart disease prevention",  "normal tissue growth", "cell function", "pregnant women"]' ;

function ArticleGenerated() {
    const router = useRouter();
    const [foodImageUrl, setFoodImageUrl] = useState('');
    const [notes, setNotes] = useState([]);
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
        <div className='md:grid md:grid-cols-5 flex flex-col md:gap-8 lg:gap-12 gap-6 px-7 mb-[6rem] md:mb-[3rem]'>
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

            {/* extracted entities */}
            <p className='text-xl font-bold mb-2'>Extracted Entities:</p>
            <p className='mb-2'>{extractedEntities}</p>

            {/* rest of the food notes */}
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

                {/* related questions */}
                <div>
                    <p className='text-xl font-bold mb-2 mt-2'>Related Questions :</p>
                    <ul className='list-decimal'>
                        {relatedQuestions?.map((item, index) => (
                            <li key={index}>
                                <p>{item}</p>
                            </li>
                        ))}
                    </ul>
                </div>
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

export default ArticleGenerated;