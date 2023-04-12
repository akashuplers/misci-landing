export const __prod_cors__ =
  process.env.NODE_ENV !== "production"
    ? {
        origin: [
          `http://${process.env.BASE_URL}:3000`,
          `http://${process.env.BASE_URL}:5000`,
          `http://${process.env.BASE_URL}:5000/graphql`,
          `ws://${process.env.BASE_URL}:5000/graphql`,
          "https://studio.apollographql.com",
          "https://pluaris-prod.vercel.app",
          "https://pluaris3.nowigence.ai",
          "https://pluaris.com",
          "https://pluaris.ai",
        ],
        credentials: true,
      }
    : {
        origin: [
          `https://${process.env.BASE_URL}`,
          `wss://${process.env.BASE_URL}`,
          "https://pluaris-prod.vercel.app",
          "https://pluaris3.nowigence.ai",
          "https://pluaris.com"
        ],
        credentials: true,
      };
export const REDIS_COOKIE_NAME = "redis-riddle";

export const REFRESH_COOKIE_NAME = "pl-riddle";      
