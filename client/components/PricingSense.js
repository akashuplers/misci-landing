import React from 'react';

const PricingSense = () => {
  return (
    <div className="bg-[#241c7a] text-white py-14 px-8 ">
      <h2 className="text-4xl font-bold mb-8 text-center bg-[#241c7a] w-1/2 rounded-md mx-auto p-4">Why Lille.ai Stands Out?</h2>
      <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <div className="hover:bg-[#F4928A] hover:text-[#4939FA] transition duration-300 p-4 rounded-lg cursor-pointer">
          <h3 className="text-2xl font-semibold">Deep Dive Analysis</h3>
          <p>A unique blend of extractive and generative AI, offering a comprehensive first draft response to even the most complex queries.</p>
        </div>
        <div className="hover:bg-[#E9C403] hover:text-[#4939FA] transition duration-300 p-4 rounded-lg">
          <h3 className="text-2xl font-semibold">Your Personal Workspace</h3>
          <p>Seamlessly upload your own content, link with your storage repositories, and curate as you go along.</p>
        </div>
        <div className="hover:bg-[#F4928A] hover:text-[#4939FA] transition duration-300 p-4 rounded-lg">
          <h3 className="text-2xl font-semibold">Transparency & Authenticity</h3>
          <p>Your content, backed by a bibliography, ensures no unwarranted claims.</p>
        </div>
        <div className="hover:bg-[#E9C403] hover:text-[#4939FA] transition duration-300 p-4 rounded-lg">
          <h3 className="text-2xl font-semibold">Affordable Excellence</h3>
          <p>Stellar quality without breaking the bank.</p>
        </div>
      </div>
    </div>
  );
};

export default PricingSense;
