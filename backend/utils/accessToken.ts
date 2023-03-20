import { sign } from "jsonwebtoken";

export interface AccessTokenFrame {
  id: string;
  email: string;
}

export interface RefreshTokenFrame {
  id: string;
  email: string;
}

// CREATE ACCESS TOKEN
export const createAccessToken = (userObj: AccessTokenFrame) => {
  // console.log("userObj", userObj);

  const accessToken = sign(userObj, process.env.JWT_SECRET_KEY!, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
  });
  // console.log("accessToken", accessToken);
  if (accessToken) {
    return accessToken;
  } else {
    console.log("returning null for accessToken");
    return null;
  }
};

// CREATE REFRESH TOKEN
export const createRefreshToken = (userObj: RefreshTokenFrame) => {
  // console.log("userObj", userObj);
  const refreshToken = sign(userObj, process.env.REFRESH_SECRET_KEY!);
  // console.log("refreshToken", refreshToken);
  if (refreshToken) {
    return refreshToken;
  } else {
    console.log("returning null for refreshToken");
    return null;
  }
};

// CREATE REFRESH TOKEN
export const createBlockChainToken = (obj: any) => {
  // console.log("userObj", userObj);
  const refreshToken = sign(obj, process.env.BLOCKCHAIN_JWT_SECRET_KEY!, {noTimestamp: true});
  // console.log("refreshToken", refreshToken);
  if (refreshToken) {
    return refreshToken;
  } else {
    console.log("returning null for refreshToken");
    return null;
  }
};

// Landing Token
export const createLandingAccessToken = (userObj: AccessTokenFrame) => {
  // console.log("userObj", userObj);

  const accessToken = sign(userObj, process.env.JWT_BLOCK_CHAIN_SECRET_KEY!, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
  });
  // console.log("accessToken", accessToken);
  if (accessToken) {
    return accessToken;
  } else {
    console.log("returning null for accessToken");
    return null;
  }
};
