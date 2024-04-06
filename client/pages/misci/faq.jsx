import Lottie from "lottie-react";
import infinityLoop from "../../lottie/infinity-loop.json";
import { useRouter } from "next/router";

const faqsList = [
    "What are some economic and social implications of potato cultivation for developing countries?",
    "What all vitamins are in Acorn?",
    "From what does a tomato grow?",
];

const articles = [
  {
    id: 1,
    title: "Acorn and Climate Change: ",
    description: "A study of acorns has revealed that the warmer the weather the smaller the crop of acorns. Another sign of the climate change impact on acorn is that its autumn.",
  },
  {
    id: 2,
    title: "Different Types of Acorns: ",
    description: "There are 38 different type of acorns. To tell the type of acorn, look at the hat-like woody cup. Native North American acorns have cups with overlapping scales.",
  },
  {
    id: 3,
    title: "Different Types of Acorns: ",
    description: "Acorns are edible nuts that can be roasted, ground into flour, or used for a caffeine-free coffee-like drink. However, raw acorns contain bitter tasting tannin that may be toxic to humans.",
  },
];

function Faq() {
  const router = useRouter();
  let foodName = 'Acorn';

  return (
    <div className="h-screen overflow-y-auto bg-yellow-50">
      {/* heading and infinity UI */}
      <div className="flex flex-col flex-col-reverse lg:flex-row items-center">
        {/* heading text */}
        <div className="w-screen text-center md:pl-39 xl:pl-44">
          <h1 className="text-2xl sm:text-4xl md:text-5xl xl:text-6xl text-green-700 font-bold mb-4">
            Ground to Gourmet
          </h1>
        </div>

        {/* infinity UI */}
        <div className="mb-6 flex pl-5 md:pl-0 items-center justify-center md:justify-end me-3 mt-2 md:flex-row">
              <span className="w-[6rem] sm:w-[6rem] md:w-[8rem] md:min-w-[8rem] relative flex items-center justify-center">
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
              <span className="w-[6rem] sm:w-[6.5rem] md:w-[9rem] md:min-w-[9rem]" >
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
      <div className="px-8 lg:px-16">

        {/* faq */}
        <p className="text-2xl md:text-4xl font-bold text-orange-500">FAQ</p>
        <ul className="list-decimal mt-4 lg:pl-5">
            {faqsList.map((item, index) => (
                <li key={index}>
                    <p
                      className="text-justify md:text-xl cursor-pointer"
                      onClick={() => router.push('/misci')}
                    >
                      {item}
                    </p>
                </li>
            ))}
        </ul>

        {/* recommended articles */}
        <p className="text-xl sm:text-2xl md:text-4xl font-bold text-orange-500 mt-4 md:mt-8">Recommended Articles</p>
        <div
          className="mt-3 md:mt-5 mb-4 md:mb-0 flex flex-col items-center md:flex-row cursor-pointer"
          onClick={() => router.push(`/misci/document/${foodName}`)}
        >
          {articles.map((item, index) => (
            <div key={item.id} className="md:mr-8 mb-4 md:mb-0">
              <div className="w-[220px] h-[300px] md:h-[300px] md:w-[220px] p-4 bg-cover bg-center bg-[url('/file.png')]">
                <strong>{item.title}</strong>
                {item.description}
              </div>
              <p className="font-bold text-center md:text-xl">Article-{index+1}</p>
            </div>
          ))}
        </div>
        

      </div>

      

      
    </div>
  );
}

export default Faq;
