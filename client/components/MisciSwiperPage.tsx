import React from 'react';

type Props = {
    img: string,
    question : string,
    answer: string,
    reasoning: string;
};

const MisciSwiperPage: React.FC<Props> = ({
    img,
    question,
    answer,
    reasoning
}) => {
  return (
    <div className='rounded-xl shadow-2xl shadow-gray-300 text-black w-full h-full flex flex-col justify-between items-start gap-4 p-6 bg-white'>
        <div className='flex flex-col justify-between items-start gap-4'>
          <h1 className='text-3xl md:text-4xl font-semibold'>{question}</h1>
          <h4 className='text-base'>Ans: {answer}</h4>
          <p className='text-base'>{reasoning}</p>
        </div>
        <div className='w-full h-max rounded-lg' style={{
          background: `url(${img}) center no-repeat`,
          backgroundSize: 'cover',
          flex: '1 1 fit-content'
        }}>
            {/* <img className='w-full object-cover rounded-lg' src={img}/> */}
        </div>
    </div>
  );
};

export default MisciSwiperPage;