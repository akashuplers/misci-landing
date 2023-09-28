export const TYPES_OF_GENERATE = {
  REPURPOSE: "repurpose",
  NORMAL: "normal",
};
export const BASE_PRICE = 100;
export const UpgradeFeatures = [
  "At just $49/month (Score more savings with our $468 annual option!) ",
  "💡 200 Monthly Credits for uninterrupted creativity. ",
  "♾️ Limitless horizons: Save, edit, and publish content. From LinkedIn posts to insightful daily twitter threads. ",
  "🛠 Bespoke Adaptations: Align Lille.ai to fit your unique needs, with customization possibilities and dedicated support. ",
  "🔭 Perfect for: Visionaries in search of the ultimate content tool. ",
];
export const STRIPE_CONST_AMOUNT = 100;
export const APP_REGEXP = {
  EMAIL_VALIDATION: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  URL_VALIDATION:
    /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi,
  GOOGLE_DRIVE_URL_VALIDATION: /^https:\/\/drive\.google\.com\.*/,
};
export const DEFAULT_USER_PROFILE_IMAGE =
  "https://github.com/identicons/jasonlong.png";
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

