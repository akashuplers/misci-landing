 
import Layout from '@/components/Layout';
import { useState } from 'react'

const faqs =  [
  {
    "question": "What is Lille.ai?",
    "answer": "Lille.ai is an AI-powered content creation platform. It helps users generate and optimize content for general blogs, Twitter, and LinkedIn. It allows users to provide topics and offers a wide range of trending topics to base your content on."
  },
  {
    "question": "What kind of content can I generate with Lille.ai?",
    "answer": "With Lille.ai, you can generate Twitter posts, LinkedIn posts, and even full blogs based on the topics you provide, choose, or from our trending topic suggestions."
  },
  {
    "question": "How do I sign up or login to Lille.ai?",
    "answer": "You can sign up for Lille.ai using your email address, Google account, or LinkedIn account. If you already have an account with Lille.ai, just enter your email address and password in the 'Login' fields to access your dashboard."
  },
  {
    "question": "What are the different ways of creating a blog in Lille.ai?",
    "answer": "You can choose from the given trending topics on the home page or type in your own topic, e.g., 'Benefits of Ginger', and click the 'Generate' button to create a blog. Once a blog is created, we show the ideas that have been used to create the blog in the right-side panel. You can also provide a topic, URL, or a file (size < 3MB) to generate fresh ideas and then select some or all of the fresh ideas in combination with some or all or none of the used ideas, and click 'Regenerate' to regenerate the already created blog."
  },
  {
    "question": "How much does Lille.ai cost?",
    "answer": "Lille.ai has a free plan with a limited number of credits. We also offer paid plans with additional features: $15.95 monthly, $39.95 quarterly, and $149.95 yearly."
  },
  {
    "question": "What are the benefits of a paid plan?",
    "answer": "Paid plans grant full feature access, including 200 credits per month, the ability to create and regenerate blogs with your topics, unlimited publishing on top social media platforms, and the opportunity for customization. You can go to the settings page and edit the daily feed preferences in the respective tab. You'll also have access to our support team for any inquiries or issues."
  },
  {
    "question": "How does the credit system work?",
    "answer": "Each action (like generating or regenerating content) costs a credit. The free plan offers up to 25 credits. Upgrading to a paid plan gives you additional benefits like more credits and full feature access."
  },
  {
    "question": "What does the Lille.ai dashboard offer?",
    "answer": "You can generate any blog using the 'Generate New' link and access your previously saved blogs in the saved list. Once you publish a blog, you can find it in the published list. A blog can be published to the Lille platform and shared via WhatsApp, Telegram, Twitter, LinkedIn, etc."
  },
  {
    "question": "What are 'trending topics' on Lille.ai?",
    "answer": "Trending topics are popular subjects or themes that are currently relevant or widely discussed on the internet. Lille.ai suggests trending topics that you can use as inspiration for your content. These suggestions change dynamically and are not user-specific."
  },
  {
    "question": "What is the maximum file size one can upload to get the fresh ideas?",
    "answer": "Lille allows maximum 3MB files to be uploaded. One can upload files of formats .pdf, .docx and .txt to generate fresh ideas."
  },
  {
    "question": "Can I publish my content directly to social media platforms?",
    "answer": "Yes, with our paid plans, you can enjoy unlimited publishing of the content you create on Lille.ai directly to top social media platforms."
  },
  {
    "question": "Can I customize the content generation by Lille.ai?",
    "answer": "Yes, customization possibilities are available. You can talk to our support team for more details on this. The generated content is designed to serve as a foundation which you can further refine to match your specific needs."
  }
]

export default function FAQPage() {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
  <Layout>
    <div className="max-w-3xl mx-auto my-10 bg-white p-4 shadow-md rounded-md space-y-4">
      {faqs.map((faq, i) => (
        <details
          key={i}
          className="group border-s-4 border-blue-500 bg-gray-50 p-6  [&_summary::-webkit-details-marker]:hidden"
          open={activeIndex === i}
          onClick={() => setActiveIndex(i)}
        >
          <summary className="flex cursor-pointer items-center justify-between gap-1.5">
            <h2 className="text-lg font-medium text-gray-900 ">
              {faq.question}
            </h2>

            <span className="shrink-0 rounded-full bg-white p-1.5 text-gray-900   sm:p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 shrink-0 transition duration-300 group-open:-rotate-45"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </summary>

          <p className="mt-4 leading-relaxed text-black ">
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  </Layout>
);
}