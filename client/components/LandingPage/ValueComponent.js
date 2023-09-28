export default function ValueComponent() {
  const valueSections = [
   {
    question: "Can Lille.ai cover diverse topics?",
    answer: "From reading and understanding URL’s, documents to academic papers, it's equipped to assist on diverse topics. With Lille.ai, you’ve got a Swiss Army knife for information. ",
    imageURL: "/screenshots/1.jpg",
  },
   {
    question: "Could Lille.ai potentially replace my job?",
    answer: "Definitely not. Remember the rise of calculators in the mid-90s? They didn’t take jobs but instead made tasks faster and even created new job opportunities. Similarly, Lille.ai isn't here to replace you, but to help you navigate the vast information landscape more effectively. Think of it as your personal assistant, making information access and presentation more efficient and enjoyable.",
    imageURL: "/screenshots/7.jpg",
  },
  {
    question: "With so many generative AI tools around since ChatGPT's launch, why should I pick Lille.ai?",
    answer: "Because Lille.ai is tailored for you. While most tools merely generate content, Lille.ai empowers you with both extractive and generative AI. Imagine having a workspace that responds uniquely to your needs, allowing you to craft information until it feels just right. Moreover, the content you craft is distinctly yours – free from the common inaccuracies found in other generative AIs.",
    imageURL: "/screenshots/2.png",
  },
  {
    question: "I'm tech-savvy and excel at prompt engineering. What makes Lille.ai valuable for someone like me?",
    answer: "It's not just about technical prowess. Lille.ai offers a comprehensive workspace to extract insights and craft content tailored for various platforms. It goes beyond mere prompt engineering – think of it as harnessing the power of AI to elevate your content and broaden your digital footprint. Creating something like Lille.ai from scratch would be a mammoth task, even for the technically adept.",
    imageURL: "/screenshots/3.png",
  },
  {
    question: "Why should marketing pros like me choose Lille.ai?",
    answer: "Look, we understand you. Content Marketing in the digital age demands precision. Lille.ai not only targets but tailor's content, analyzing oceans of information for that laser-focused approach. Think higher conversion rates and satisfying ROIs. Lille.ai isn't just a tool—it's your next content marketing co-pilot.",
    imageURL: "/screenshots/4.jpg",
  },
  {
    question: "How does Lille.ai increase my efficiency?",
    answer: "Drowning in data? Lille.ai lets you sail through content creating challenges, leaving more room for strategy and creativity. It's like having an extra pair of hands that’s always with you.",
    imageURL: "/screenshots/5.jpg",
  },
  {
    question: "Can I trust Lille.ai's accuracy?",
    answer: "Absolutely. Deep learning is Lille.ai's core feature, ensuring you're always on point. It's like having a trusted content consultant always on call.",
    imageURL: "/screenshots/6.jpg",
  },
  ];

  const colors = ['#4939FA', '#F4928A', '#E9C403']; // An array of your colors

  return (
    <div className="pt-12">
      <div className="container mx-auto max-w-full sm:max-w-5xl">

      
        {valueSections.map((section, index) => (
          <div
            key={index}
            className={`flex flex-wrap items-center ${
              index % 2 === 0 ? "flex-row" : "flex-row-reverse"
            } mb-16 animate__animated animate__fadeInUp`}
          >
            <div className="w-full md:w-1/2 p-4">
              <h2 
                className={`text-2xl font-bold mb-4`}
                style={{color: colors[index % colors.length]}} // Selects the color dynamically based on the index
              >
                {section.question}
              </h2>
              <p className="text-md text-black">{section.answer}</p>
            </div>

            <div className="w-full md:w-1/2 p-4">
              <div
                className="bg-gray-300 rounded-lg"
                style={{ backgroundColor: "#F4928A" }}
              >
                <img
                  className="h-full w-full object-cover object-center rounded-lg"
                  src={section.imageURL}
                  alt=""
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
