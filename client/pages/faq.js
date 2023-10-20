 
import Layout from '@/components/Layout';
import { useState } from 'react'

const faqs =  [
  {
      "question": "What is Lille.ai?",
      "answer": "Lille.ai is an AI-powered co-pilot for content research, discovery, and writing. It can read tons of information from the internet and documents you give it, and then it helps you write about it. And the best part? It tells you with precise source reference, so you know it is trustworthy. Its seamless integration with platforms like Google Drive and popular social media ensures you have a holistic content management experience."
  },
  {
      "question": "Why was Lille.ai created?",
      "answer": "Lille.ai, a SaaS application was created to help people deal with the overwhelming influx of information in the digital era. It acts as an extended memory, streamlining the process of information retrieval, organization, and dissemination."
  },
  {
      "question": "Who should use Lille.ai?",
      "answer": "Lille.ai is great for people who write a lot or need to find information quickly. It quickly assists you by providing the structure and the various views that can help you write or research large volumes of content efficiently. If you write for websites (content creators) or help websites get found (SEO specialists) or post a lot on social media (influencers), Lille is then your co-pilot. It's also super helpful for teams who use writing to connect with their customers, and for anyone who has a lot of information to sort through, like researchers, teachers, and students. In nutshell writers, bloggers, content creators, journalists, researchers, teachers and students can reap the benefits using Lille.ai."
  },
  {
      "question": "What value does Lille.ai offer?",
      "answer": "With Lille.ai, you can write your first draft super-fast - 80% faster than before! It boosts your content marketing outputs by 27x, gets more than 590% more impressions in 60 days or less. It is like having a super-power for writing! And the best part? Your writing will always sound like you, and you will not have to spend weeks making changes."
  },
  {
      "question": "How is Lille.ai different from other writing tools like ChatGPT?",
      "answer": "Lille does not make things up - it always tells you where the information comes from. Plus, it lets you control how your writing sounds and how long it is. And it helps you find the most important points for your writing and makes sure your writing is ready to be shared on any platform. Moreover, its intelligent content research auto-pilot curates the most relevant points, ensuring your content is platform-ready and optimized for SEO through auto-backlinking."
  },
  {
      "question": "Isn't Lille.ai like Jasper and CopyAI?",
      "answer": "Well, Lille.ai is special because it lets you add your own content to mix with information from the web. This means you're writing has depth and is unique. Plus, if you have lots of documents that you need to refer to often, Lille.ai can help you use those too! And do not worry, your information is always safe and private with us. The answers produced remain as your intellectual property.\n\nThese features are not available in Jasper and CopyAI."
  },
  {
      "question": "How do I sign up or log in to Lille.ai?",
      "answer": "Joining Lille.ai is effortless. Signup using your email, Google account, or LinkedIn account. If you already have an account, just enter your email and password to access the platform."
  },
  {
      "question": "I see 'Wrong Credentials' message when I submit username and password that I know.",
      "answer": "If you had created an account with Lille.ai but now face difficulty in login and you see 'wrong credentials' message when you add username and password it means either username is wrong, or the password is wrong. If you have not received any email from the Lille team mentioning any account blocking, then your account is active, but you need to remember the correct credentials. Lille provides the 'forgot password' feature on the login pop up itself. Click on that and follow the instructions to reset your password in case password is the issue otherwise you will get to know if your username exists or not."
  },
  {
      "question": "How can I create content with Lille.ai?",
      "answer": "Lille.ai’s intuitive homepage is your starting point. Open https://www.lille.ai and on the home page, simply type in the topic that you have in mind and hit ‘Generate Draft’.  Lille.ai will understand that you want to create the content based on the given topic, it will search the web to look for relevant content from the prominent sources to gather the ideas and finally uses its AI engine to create the content for you. For example, you can type in 'Benefits of Ginger' or ‘Global Warming is changing into Global Simmering’ as a topic.\n\nWeb as source is there by default but you can also provide additional source of ideas as a URL or your own document. Select either ‘URLs’ or ‘Documents’ option for that and upload the URL or FILE that you want to act as the additional source of ideas in addition to the topic in the input box.\n\nOnce you hit ‘Generate Draft’ Lille’s real time progress bar will show how the content creation proceeds."
  },
  {
      "question": "Generate Draft - What is this?",
      "answer": "Generate Draft’ crafts preliminary content for your review. You are using Lille.ai to create relevant and meaningful content for you based on the topic you provide. You can always upload a URL or a file to act as an additional source of ideas for content creation. When the content is created and shown to you in the workspace where you reach after you hit the ‘Generate Draft’ button and progress bar completes its run, the content presented to you is a draft version. You can review it and save it as the final copy, or you can edit the content or change the image etc. and save and finally publish as per your choice of the publishing platforms given to you. NOTE: Bigger size files and lengthier articles from the URLs uploaded will add to response time."
  },
  {
      "question": "Next Draft - What is this?",
      "answer": "Once the draft content is created after you provide the topic and hit the ‘Generate Draft’ on the home page, Lille shows the ideas that have been used to create the draft in the right-side panel. You can also provide a topic, URL, or a file (size < 3MB) to generate fresh ideas and then select some or all the fresh ideas in combination with some or all or none of the used ideas and click 'Next Draft' to regenerate the already created draft. This feature reimagines your draft to better resonate with your intent.\n\nNOTE: Bigger size files and lengthier articles from the URLs uploaded will add to response time."
  },
  {
      "question": "How much does Lille.ai cost?",
      "answer": "Lille.ai’s pricing structure caters to varied needs: Lille.ai has a free plan with a limited number of credits. We also offer paid plans with additional features at $49/month, $129/quarter, and $468/year."
  },
  {
      "question": "What are the benefits of a paid plan?",
      "answer": "Paid plans unlock full feature access, including 200 credits per month, the ability to create and regenerate contents with your topics, unlimited publishing to social media platforms, and the ability to set your tone. You can visit the settings page and edit the daily feed preferences in the respective tab. You'll also have access to our dedicated support team for any inquiries or issues."
  },
  {
      "question": "Can I publish my content directly to social media platforms?",
      "answer": "Absolutely. As a Premium user you can effortlessly publish your content from Lille.ai on leading social media platforms, enhancing web visibility. With our paid plans, you can enjoy unlimited publishing of the content. The publishing URL will contain your profile name, the title of the article, and a key heading from the published content."
  },
  {
      "question": "What about the privacy of the content I create or the research that I do?",
      "answer": "The way you train Lille to assist you is private and personal to you. We are not a web search engine who use your prompts to help others or appeal to a large audience. Your use and your data is private to you. Only publicly published content is accessible in Lille.ai's library, ensuring your intellectual property remains yours. The benefit is that other users will then be able to use your content as reference quoting your content."
  },
  {
      "question": "Can I upload any type of URLs and Files in addition to the topic for generating the draft?",
      "answer": "URLs with paywalls or restricted access might face limitations. Lille will show you the alert message if you upload such a URL. Lille.ai supports uploads up to 7MB in .pdf, .docx, and .txt formats to generate the draft content. Files that have password-based access or need digital authorization may not work well. NOTE: Bigger size files uploaded will add to response time. If you have bigger files that you want to use for content generation, reach out to our support team and we will be glad to help you out."
  },
  {
      "question": "Does Lille.ai have a reward program?",
      "answer": "Yes, we do! Each time you create or publish your content with Lille.ai, you earn points. With these points, you can get cool gifts like t-shirts and other accessories."
  },
  {
      "question": "How does Lille.ai keep my data safe?",
      "answer": "Keeping your information safe is super important to us. Lille.ai uses robust SSL encryption, coupled with rigorous system monitoring, to ensure data integrity. We use strong security to make sure that only the right people can access the platform and they do not have access to the documents uploaded by you. Plus, we keep a close watch on our systems to make sure they are always fail safe."
  },
  {
      "question": "What If I need customization in the process of content generation as well as publishing?",
      "answer": "Yes, customization possibilities are available. Please reach out to our support team for bespoke adjustments or feature requests. The generated content is designed to serve as a foundation which you can further refine to match your specific needs. Also, we can add other publishing platforms that may be needed. We have already done customizations for some of our existing customers."
  },
  {
      "question": "What is the basis of the claim that Lille is saving lots of time for the users?",
      "answer": "Upon receiving a topic from the user, Lille swiftly sources relevant ideas from the web. These ideas are then processed by Lille's sophisticated AI and ML algorithms, resulting in crafting a comprehensive draft article. This article is not only structured with distinct headings and a conclusion but also meticulously references every source. Notably, Lille embeds backlinks within the content itself, signifying how specific sections are influenced by their respective sources.\n\nCompleting this intricate process takes Lille about a minute. Contrast this efficiency with the traditional human approach: conceptualizing, researching, and then drafting. Our research indicates that a person typically invests around 30 minutes crafting an article on a standard topic. Using this benchmark, Lille.ai calculates and displays the time each user saves per article."
  },
  {
      "question": "Can I control what sources are used to generate my article?",
      "answer": "Absolutely! If you supply only a topic, Lille.ai offers the flexibility to regenerate content by selecting or deselecting ideas derived from specific sources. Simply navigate to the workspace panel on the right and select the desired source to view associated ideas. Additionally, you can provide a topic accompanied by specific URLs to base your article on. After reviewing the generated content, you are free to include or exclude ideas from any uploaded URL, allowing you to tailor the article even further. Should you change your mind about certain aspects, regenerating the content is a breeze."
  },
  {
      "question": "I have more questions. How can I contact Lille.ai support?",
      "answer": "Lille.ai’s dedicated support team will be glad to assist you. Engage with us through the platform’s chat feature or email at customersuccess@lille.ai."
  }
]

export default function FAQPage() {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
  <Layout>
      <div className="max-w-3xl mx-auto my-10 bg-white p-4 shadow-md rounded-md space-y-4">
        {faqs.map((faq, i) => (
          <div key={i}>
            <div
              className="flex cursor-pointer items-center justify-between gap-1.5 p-6 border-2 border-s-4 border-gray-500 bg-gray-50"
              onClick={() => setActiveIndex(i === activeIndex ? null : i)}
            >
              <h2 className="text-lg font-medium text-gray-900 ">
                {faq.question}
              </h2>
              <span className={`shrink-0 rounded-full bg-white p-1.5 text-gray-900 transform transition-transform ${activeIndex === i ? 'rotate-45' : ''}`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
            </div>

            <div className={`mt-4 leading-relaxed text-black transition-all duration-300 ${activeIndex === i ? 'block' : 'hidden'}`}>
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </Layout>
);
}