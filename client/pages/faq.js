 
import { useState } from 'react'

const faqs = [
    {
      "question": "What is Lille.ai?",
      "answer": "Lille.ai is an AI-powered content creation platform. It helps users generate and optimize content for Twitter and LinkedIn, and offers a wide range of trending topics to base your content on."
    },
    {
      "question": "What kind of content can I generate with Lille.ai?",
      "answer": "With Lille.ai, you can generate Twitter posts, LinkedIn posts, and even full blogs based on the topics you choose or from our trending topic suggestions."
    },
    {
      "question": "How do I sign up or login to Lille.ai?",
      "answer": "You can sign up for Lille.ai using your email address, Google account, or LinkedIn account. If you already have an account, just enter your email address in the 'Login' field to access your dashboard."
    },
    {
      "question": "How does the credit system work?",
      "answer": "Each action (like generating or regenerating content) costs a certain number of credits. The free plan offers up to 25 credits. Upgrading to a paid plan gives you additional benefits like more credits and full feature access."
    },
    {
      "question": "How much does Lille.ai cost?",
      "answer": "Lille.ai has a free forever plan. We also offer paid plans with additional features: $15.95 monthly, $39.95 quarterly, and $149.95 yearly."
    },
    {
      "question": "What are the benefits of a paid plan?",
      "answer": "Paid plans grant full feature access, including 200 credits per month, the ability to create and regenerate blogs with your topics, unlimited publishing on top social media platforms, and the opportunity for customization. You'll also have access to our support team for any inquiries or issues."
    },
    {
      "question": "What does the Lille.ai dashboard offer?",
      "answer": "You can generate articles, which redirects you to the dashboard page. After that, you can create multiple blogs, and the saved blogs can later be used for publishing and sharing with the public."
    },
    {
      "question": "What are 'trending topics' on Lille.ai?",
      "answer": "Trending topics are popular subjects or themes that are currently relevant or widely discussed on the internet. Lille.ai suggests trending topics that you can use as inspiration for your content. These suggestions change dynamically and are not user-specific."
    },
    {
      "question": "Can I publish my content directly to social media platforms?",
      "answer": "Yes, with our paid plans you can enjoy unlimited publishing of the content you create on Lille.ai directly to top social media platforms."
    },
    {
      "question": "Can I customize the content generated by Lille.ai?",
      "answer": "Yes, customization possibilities are available. You can talk to our support team for more details on this. The generated content is designed to serve as a foundation which you can further refine to match your specific needs."
    }
]
export default function FAQPage() {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="max-w-md mx-auto my-10 bg-white p-4 shadow-md rounded-md">
      {faqs.map((faq, i) => (
        <div key={i} className="mb-4">
          <h2
            onClick={() => setActiveIndex(i)}
            className={`cursor-pointer px-5 py-3 border-b ${
              activeIndex === i ? 'font-semibold' : 'font-normal'
            }`}
          >
            {faq.question}
          </h2>
          <div
            className={`overflow-hidden transition-height duration-500 ease-in-out ${
              activeIndex === i ? 'h-auto' : 'h-0'
            }`}
          >
            <p className="px-5 py-3">{faq.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}