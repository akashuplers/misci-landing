import React from 'react';

const PricingCardUpdated = ({
  title,
  description,
  price,
  features,
  ctaText,
  isPaid,
  onCtaClick,
}) => {
  const cardBg = isPaid ? 'bg-gradient-to-r from-primary to-[#15324E]' : 'bg-white';
  const cardText = isPaid ? 'text-white' : 'text-primary';

  return (
    <div className={`relative flex flex-col p-4 w-[21rem] rounded-lg shadow-lg ${cardBg}`}>
      <div className={`flex flex-col items-start gap-4 mt-4 ${cardText}`}>
        <p className="font-semibold text-2xl">{title}</p>
        <p className="text-4xl font-bold">{price}</p>
        <p className="text-lg font-medium mb-4">{description}</p>
      </div>
      <div className={`mt-4 h-[2px] ${isPaid ? 'bg-secondary' : 'bg-tertiary'}`}></div>
      <div className={`flex flex-col items-start justify-start mt-4 ${cardText}`}>
        {features.map((feature, index) => (
          <p key={index}>{feature}</p>
        ))}
      </div>
      <button
        onClick={onCtaClick}
        className={`absolute bottom-2 right-4 p-4 rounded-lg text-white bg-secondary hover:bg-primary transition ease-in-out duration-300 cursor-pointer`}
      >
        {ctaText}
      </button>
    </div>
  );
};

export default PricingCard;
