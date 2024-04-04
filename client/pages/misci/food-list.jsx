import Lottie from "lottie-react";
import infinityLoop from "../../lottie/infinity-loop.json";
import { foodTypes } from "./data";
import { useState } from "react";

const defaultFoodItemsList = [ "Almond", "Cashew", "Chestnut", "Hazelnut", "Kernels", "Peanut", "Pine Nuts", "Pistachio", "Walnut" ];
const defaultImageUrl = "https://images.immediate.co.uk/production/volatile/sites/30/2021/02/almonds-9e25ce7.jpg?quality=90&webp=true&resize=600,545";

function FoodList() {
  const [foodCategory, setFoodCategory] = useState("Nuts and Seeds");
  const [foodItems, setFoodItems] = useState(defaultFoodItemsList);
  const [foodImageUrl, setFoodImageUrl] = useState(defaultImageUrl);

  const handleClickOnFoodType = (foodCategoryItem) => {
    setFoodItems(foodCategoryItem?.foodItems);
    setFoodCategory(foodCategoryItem?.name);
    setFoodImageUrl(foodCategoryItem?.foodTypeUrl);
  }

  return (
    <div className="h-screen bg-yellow-50">
        {/* heading and infinity UI */}
        <div className="flex flex-col flex-col-reverse lg:flex-row items-center">
            {/* heading text */}
            <div className="w-screen text-center lg:pl-44">
                <h1 className="text-6xl text-green-700 font-bold mb-4">
                    Ground to Gourmet
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

        {/* food types, food items and food image */}
        <div className="grid grid-cols-3 mt-7 gap-3 px-2 md:px-5">
            {/* food types */}
            <div className="lg:pl-16">
                <h3 className="text-orange-500 text-4xl font-bold italic">Food Types</h3>
                <div className="mt-5 max-h-[40vh] overflow-y-auto max-w-[27vw] overflow-x-auto">
                    <ul className="list-none mt-4">
                        {foodTypes.map((foodType) => (
                            <li
                                key={foodType.id}
                                className="cursor-pointer"
                                onClick={() => handleClickOnFoodType(foodType)}
                            >
                                <p className="text-2xl italic mb-2 md:font-bold md:mb-0">{foodType.name}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* food items */}
            <div>
                <h3 className="text-orange-500 font-bold italic text-3xl">{foodCategory}</h3>
                <div className="mt-5 max-h-[40vh] overflow-y-auto max-w-[27vw] md:max-w-[15vw] overflow-x-auto">
                    <ul className="list-none">
                        {foodItems?.map((foodItem, index) => (
                            <li key={index}>
                                <p style={{ fontSize: "1.35rem", lineHeight: "1.85rem" }} className="cursor-pointer md:font-bold italic mb-1 md:mb-0">{foodItem}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* food image */}
            <div className="lg:pr-[4rem] flex items-center">
                <img
                    src={foodImageUrl}
                    alt="food-image"
                    className="h-[12rem] lg:h-[30rem] md:h-[22rem] w-[30rem]"
                />
            </div>

        </div>

        {/* chat */}
        <img
            className='h-12 absolute bottom-10 right-7 cursor-pointer bg-gray-500 rounded-sm p-1.5'
            src="/chat.png"
            style={{objectFit: 'cover'}}
        />
        
    </div>
  )
}

export default FoodList;