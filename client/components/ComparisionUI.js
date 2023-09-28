
import React from 'react';

const ComparisonUI = () => {
  return (
    <div className="relative text-white py-20 px-8 bg-[#4839fa]">
      <img 
        src="./bg-2.jpg" 
        alt="Background" 
        className="absolute top-0 left-0 w-full h-full object-cover opacity-10 z-1"
      />
        <div className='z-10 relative'>
      <h1 className="text-4xl font-bold mb-12">Key Features that Elevate Lille.ai:</h1>
      <div className="grid md:grid-cols-2 gap-12 mb-20">
        {[
          'Content Customization: Enriched by Co-Pilot, crafted by you.',
          'Broad Spectrum Analysis: For refined and coherent outputs.',
          'Prompt Engineering: Advanced capabilities to respond swiftly and accurately.',
          'Expansive Database: Dive deep into varied topics and refine your knowledge.',
          'Copyright Control: Your content remains yours, always.',
          'Data Security & Integrity: Your trust is paramount, and we honor it with top-tier security.'
        ].map((feature, index) => (
          <div key={index} className="hover:bg-[#F4928A] hover:text-white transition duration-300 p-4 rounded-lg">
            <p>{feature}</p>
          </div>
        ))}
      </div>
      <h1 className="text-3xl font-bold mb-12">Making the Right Choice:</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { name: '🌍 ChatGPT', description: 'Tailored for chat & hallucinations.', price: '$20/month' },
          { name: '⚙️ Jasper', description: 'Offers varied features without traceability of content.', price: '$79/month' },
          { name: '✒️ Copy.ai', description: 'A writing assistant.', price: '$59/month' }
        ].map((option, index) => (
          <div key={index} className="bg-[#E9C403] text-black p-4 rounded-lg hover:shadow-lg transition duration-300">
            <h3 className="text-2xl font-semibold mb-4">{option.name}</h3>
            <p>{option.description}</p>
            <p className="mt-4 font-bold">{option.price}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#F4928A] mt-12 p-8 rounded-lg">
        <h2 className="text-3xl font-bold mb-4">Your Ideas Deserve Brilliance.</h2>
        <p>Craft, refine, and shine with Lille.ai. Embrace a transformative content journey, tailored just for you.</p>
      </div>
        </div>
    </div>
  );
};

export default ComparisonUI;
