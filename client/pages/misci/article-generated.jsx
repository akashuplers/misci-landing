import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const defaultArticleObj = {
    error: false,
    data: {
        entities: {
            How: [
                "potato farming practices",
                "potato varieties",
                "traditional plant breeding techniques",
                "genetic modification",
                "cross-breeding"
            ],
            What: [
                "potatoes",
                "soil",
                "food crop",
                "potato cultivation",
                "potato production"
            ],
            When: [
                "early 1990s",
                "early 1960s",
                "2007"
            ],
            Where: [
                "Europe",
                "North America",
                "former Soviet Union",
                "Asia",
                "Africa",
                "Latin America",
                "Sub-Saharan Africa",
                "northern Russia",
                "high altitude",
                "latitude areas",
                "Andes"
            ],
            Who: [
                "China",
                "India"
            ],
            Whom: [
                "farmers"
            ],
            Why: [
                "limited areas of crop land",
                "developing countries",
                "climate change",
                "changing conditions",
                "maintain crop yields",
                "stressors induced by climate change"
            ]
        },
        image_source: "https://example.com/image.jpg",
        img_url: "https://images.squarespace-cdn.com/content/v1/5b5b5824f2e6b10639fdaf09/a277eae9-bf1a-4e66-9daf-dd2e60209073/Produce+Storage+Tips+icons+%289%29.png?format=2500w",
        questions: [
            "What are the largest potato growing regions in the world?",
            "Where were potatoes primarily grown and consumed until the early 1990s?",
            "What type of soil is most suitable for growing potatoes?",
            "Why are potato crops considered an excellent alternative for farmers with limited areas of crop land?"
        ],
        subtopics: [
            {
                points: [
                    "China and India are the largest potato growing regions in the world.",
                    "Almost a third of all potatoes are harvested in China and India."
                ],
                subtopic: "Potato Production in China and India"
            },
            {
                points: [
                    "Until the early 1990s, potatoes were primarily grown and consumed in Europe, North America, and countries of the former Soviet Union."
                ],
                subtopic: "Historical Potato Consumption"
            },
            {
                points: [
                    "Loamy and sandy loam soils with good drainage and aeration are most suitable for growing potatoes.",
                    "These soils should also be rich in organic matter."
                ],
                subtopic: "Suitable Soil Conditions for Potato Cultivation"
            },
            {
                points: [
                    "Potatoes produce more food on less land faster than any other major food crop.",
                    "Potato crops are an excellent alternative for farmers with limited areas of crop land.",
                    "This is particularly beneficial for developing countries with growing populations."
                ],
                subtopic: "Potato as an Alternative Food Crop"
            }
        ],
        title: "Potato Cultivation and Climate Change"
    }
};

function ArticleGenerated() {
   const [articleObj, setArticleObj] = useState({});
   const [isLoading, setIsLoading] = useState(false);
   const router = useRouter();
   
   useEffect(() => {
    setIsLoading(true);
    const apiResponseData = JSON.parse(localStorage.getItem('apiResponseData'));
    if(apiResponseData) {
        setArticleObj(apiResponseData);
    } else {
        setArticleObj(defaultArticleObj?.data);
    }
    setIsLoading(false);
   }, []);
    
  return (
    <div className='h-screen overflow-y-auto bg-yellow-50'>
        {isLoading ?
            <p className='text-center mt-10'>Loading...</p>
        :
        <div>
            {/* head */}
            <div className="items-center mt-5">
                {/* heading text */}
                <div className="w-screen text-center">
                    <h1 className="text-2xl md:text-4xl italic uppercase font-bold mb-4">
                        {articleObj?.title}
                    </h1>
                </div>
            </div>
            
            {/* body */}
            {articleObj?.img_url ?
                // body with image
                <div className='md:grid md:grid-cols-5 flex flex-col md:gap-8 lg:gap-12 gap-6 px-7 mb-[6rem] md:mb-[3rem]'>
                    {/* food image */}
                    <div className='md:col-start-1 md:col-end-2 pl-[3rem] pr-[3rem] md:pl-0 md:pr-0'>
                        <img
                            src={articleObj?.img_url}
                            alt='article-image'
                            className='h-[10rem] xl:h-[35rem] lg:h-[27rem] md:h-[18rem] md:w-[30rem]'
                        />
                    </div>
            
                    {/* food notes */}
                    <div className='md:col-start-2 md:col-end-6 text-justify'>

                        {/* extracted entities */}
                        <p className='text-xl font-bold mb-2'>Extracted Entities :</p>
                        <p className='mb-2'>{JSON.stringify(articleObj?.entities)}</p>

                        {/* rest of the notes */}
                        <div className='md:col-start-2 md:col-end-6 text-justify'>
                            {articleObj?.subtopics?.map((item, index) => (
                                <div key={index}>
                                    <p className='text-xl font-bold mb-2'>{item?.subtopic + ' :'}</p>
                                    <ul className='mb-3'>
                                        {item?.points?.map((ele, index) => (
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
                                    {articleObj?.questions?.map((item, index) => (
                                        <li key={index}>
                                            <p>{item}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            :
                // body without image
                <div className='px-10 mb-[6rem] md:mb-[3rem]'>
                    {/* food notes */}
                    <div className='md:col-start-2 md:col-end-6 text-justify'>

                        {/* extracted entities */}
                        <p className='text-xl font-bold mb-2'>Extracted Entities :</p>
                        <p className='mb-2'>{JSON.stringify(articleObj?.entities)}</p>

                        {/* rest of the notes */}
                        <div className='md:col-start-2 md:col-end-6 text-justify'>
                            {articleObj?.subtopics?.map((item, index) => (
                                <div key={index}>
                                    <p className='text-xl font-bold mb-2'>{item?.subtopic + ' :'}</p>
                                    <ul className='mb-3'>
                                        {item?.points?.map((ele, index) => (
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
                                    {articleObj?.questions?.map((item, index) => (
                                        <li key={index}>
                                            <p>{item}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            }

            {/* chat image */}
            <img
                className='h-12 absolute bottom-10 right-7 cursor-pointer bg-gray-400 rounded-md p-1.5'
                src="/chat.png"
                style={{objectFit: 'cover'}}
                onClick={() => router.replace('/misci')}
            />
        </div>
        }

    </div>
  )
}

export default ArticleGenerated;