interface ErrorMessages {
    specialCharactersOnly: string;
    whiteSpaces: string;
    retrievalError: string;
    loaderStageBreak: string;
    loaderStageBreakAgain: string;
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
      'Starry skies! We lost our connection for a moment. 🌠 Please go back to the main page, modify your question, or ask something new. Let\'s explore answers together!'
  };
  
  export default ErrorBase;