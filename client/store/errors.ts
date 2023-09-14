interface ErrorMessages {
    specialCharactersOnly: string;
    whiteSpaces: string;
    retrievalError: string;
    loaderStageBreak: string;
    loaderStageBreakAgain: string;
    errorAnswer: string;
    unableToGenerateArticle: string;
    errorAnswerWithQuestion: (question: string) => string;
  }
  
  const ErrorBase: ErrorMessages = {
    specialCharactersOnly:
      "Oops! Let's mix things up. 🌟 Please use words and numbers with your special characters.",
    whiteSpaces:
      "Gotcha! 🚀 It seems you only pressed the space bar. Please type in your question based on our event theme.",
    retrievalError:
      "Hmm, I couldn't fetch that answer. 🕵️ Let's try again! Head back to the main page, tweak your question or ask a new one based on our event theme. I'm here to help!",
    loaderStageBreak:
      "Whoops! It seems we hit a tiny bump. 🌌 Head back to the main page, adjust your question, or ask something new. Let's explore answers together!",
    loaderStageBreakAgain:
      'Starry skies! We lost our connection for a moment. 🌠 Please go back to the main page, modify your question, or ask something new. Let\'s explore answers together!',
      errorAnswer: `<div class="text-slate-600 font-normal leading-normal text-xl"> <div id="answersEditor"> <p>This question goes beyond the library that we built for the Ground to Gourmet exhibit! You might be able to find the answer by using Lille.ai with web access, which you can try for yourself at <strong>https://www.lille.ai</strong>.</p> </div> <br /> </div>`, 
      errorAnswerWithQuestion: (question: string) => `<div class="text-slate-600 font-normal leading-normal text-xl"> <div id="answersEditor">
      <p>This question goes beyond the library that we built for the Ground to Gourmet exhibit! You might be able to find the answer by using Lille.ai with web access, which you can try for yourself at <strong>https://www.lille.ai</strong>.</p> </div> <br /> </div>`,
      unableToGenerateArticle: "We weren't able to generate an article for this question"
  };
  
  export default ErrorBase;