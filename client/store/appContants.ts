export const TYPES_OF_GENERATE = {
    REPURPOSE: 'repurpose',
    NORMAL: 'normal'
}
export const BASE_PRICE = 100;
export const UpgradeFeatures = [
    'Full Features Access with 200 Credits monthly validity',
    "Unlimited saving and publishing of Contents and LinkedIn Posts. 6 tweets per day on Twitter",
    'Create/Regenerate contents with your topics',
    'Customization possibilities, Talk to our support team'
]
export const STRIPE_CONST_AMOUNT = 100;
export const APP_REGEXP = {
  EMAIL_VALIDATION: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  URL_VALIDATION: /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/ig,
  GOOGLE_DRIVE_URL_VALIDATION: /^https:\/\/drive\.google\.com\.*/,
}
export const DEFAULT_USER_PROFILE_IMAGE = 'https://github.com/identicons/jasonlong.png';
export const MonthlyPlans = [
    {
      name: "Personal",
      description: "Perfect for side or hobby project",
      price: "$10",
      duration: "/ Month",
      features: [...UpgradeFeatures],
    },
    {
      name: "Startup",
      description: "Perfect for small teams",
      price: "$50",
      duration: "/ Month",
      features: [...UpgradeFeatures],
    },
    {
      name: "Organization",
      description: "Perfect for organization",
      price: "$70",
      duration: "/ Month",
      features: [...UpgradeFeatures],
    },
  ];
