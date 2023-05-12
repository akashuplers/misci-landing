// wiki.js - Wiki route module.

import axios from "axios";
import { ObjectID } from "bson";
import { randomUUID, createHmac } from "crypto";
import { fileCreate } from "../utils/file";
import { createAccessToken, createRefreshToken } from "../utils/accessToken";
import { validateRegisterInput, validateLoginInput, validateUpdateInput } from "../validations/Validations";
import { encodeURIfix } from "../utils/encode";
import { authMiddleware } from "../middleWare/authToken";
import { getTimeStamp } from "../utils/date";
import { verify } from "jsonwebtoken";
import { sendForgotPasswordEmail } from "../utils/mailJetConfig";
import { fetchUser, publishBlog, updateUserCredit } from "../graphql/resolver/blogs/blogsRepo";
const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const queryString = require('querystring')
var fs = require("fs");

export const __prod__ = process.env.NODE_ENV === "production" ? true : false;

// Home page route.
router.get("/", function (req: any, res: any) {
  res.send("Wiki home page");
});

router.get('/temp/user', async (req: any, res: any) => {
    const db = req.app.get('db')
    try {
        const userId = new ObjectID();
        await db.db('lilleAdmin').collection('tempUserData').insertOne({
          tempUserId: userId,
          timestamp: Math.round(new Date().getTime() / 1000),
        })
        return res
        .status(200)
        .send({ error: false, data: {userId} });
      } catch(err) {
        return res
        .status(500)
        .send({ error: true, message: err.message });
      }
})

router.post("/user/login", async (req: any, res: any) => {
    try {
        const db = req.app.get('db')
        const { errors, isValid } = validateLoginInput(req.body);
        if (!isValid) {
          return res.status(400).send({
            message: errors
          });
        }
  
        const { email, password } = req.body;
        const userExists = await db
          .db("lilleAdmin")
          .collection("users")
          .findOne({ email: email.toLowerCase() });
  
        if (!userExists) {
          return res.status(404).send({
            success: false,
            data: null,
            message: `Could not find account: ${email}`,
          });
        }
        // console.log("userExists", userExists);
  
        const match = await bcrypt.compare(password, userExists.password);
        if (!match) {
          //return error to user to let them know the password is incorrect
          return res.status(401).send({
            success: false,
            message: "Incorrect credentials",
          });
        }
  
        // TODO: MOVE THIS TO A FUNCTION
        let today = new Date();
        let dd = today.getDate();
        let mm = today.getMonth() + 1; //January is 0!
  
        let yyyy = today.getFullYear();
  
        console.log(
          "req.headers['x-forwarded-host']) :>> ",
          req.headers["x-forwarded-for"]
        );
        const ipAddress = req?.headers?.["x-forwarded-for"]?.split(", ")?.[0];
  
        if (dd < 10) {
          //@ts-ignore
          dd = "0" + dd;
        }
        if (mm < 10) {
          //@ts-ignore
          mm = "0" + mm;
        }
  
        //@ts-ignore
        today = `${yyyy}-${mm}-${dd}`;
  
        // TODO: Send data to the database here.
        const data: any = {
          userId: userExists._id,
          date: today,
          timestamp: Math.round(new Date().getTime() / 1000),
        };
        if (ipAddress) data.ipAddress = ipAddress;
  
  
        // DATA TO SIGN INTO JWT ACCESS TOKEN & REFRESH TOKEN
        const userObj = {
          email: userExists.email,
          id: userExists._id,
          company: userExists.company,
        };
  
        // CREATE ACCESS TOKEN
        const accessToken = createAccessToken(userObj);
  
        // CREATE REFRESH ACCESS TOKEN
        const refreshToken = createRefreshToken(userObj);
  
        // @ts-ignore
        // req.session.userId = refreshToken;
        if(__prod__) {
            res.setHeader('Set-Cookie', 'foo=bar; HttpOnly');
        }
        res.cookie(process.env.COOKIE_NAME, refreshToken, {
          path: "/",
          sameSite: "Lax",
          secure: __prod__,
          // domain: __prod__ ? "bang-k8s.com" : undefined,
          domain: __prod__ ? process.env.BASE_URL : "localhost",
          expire: Date.now() + 86400000,
        });
        return res.status(200).send({
          data: {
            accessToken,
            accessTokenExp: process.env.ACCESS_TOKEN_EXPIRES,
            success: true,
            email,
            id: userExists._id,
          },
        });
      } catch (error) {
        console.log(error)
        return res.status(500).send({ error: true, message: `${error}` });
      }
})

router.post("/user/create", async (req: any, res: any) => {
    const db = req.app.get('db')
    try {
      const data = req.body;
      console.log("received data==", data)
      const demoUserPW = data?.isDemoUser;
      let hashedPW: string;
      data.email = data.email.toLowerCase();
      // Validate inputs
      const { errors, isValid } = validateRegisterInput(data);
      if (!isValid)
        return res
          .status(400)
          .send({ error: true, errors, message: "input errors" });

      if(data.password){
        hashedPW = await bcrypt.hash(data.password, 12);
        data.password = hashedPW;
      }
      data.isDemoUser = false;
      data.admin = 'N';
      data.name = data.firstName;
      data.premium = false;
      // add the date
      data.date = new Date();
      if(data.tempUserId) {
        data._id = new ObjectID(data.tempUserId)
      }
      delete data.tempUserId;
      delete data.firstName;
      console.log(data, "data")
      delete data.paymentMethodId;
      console.log(data, "data")
      let user = null
      if(data.paid) {
        delete data._id;
        data.credits = process.env.PAID_CREDIT_COUNT
        await db.db("lilleAdmin").collection("users").updateOne({
          email: data.email
        }, {
          $set: data
        });
        user = await db.db('lilleAdmin').collection('users').findOne({email: data.email})
      } else {
        data.credits = process.env.CREDIT_COUNT
        // check if user is duplicatez
        const dupCheck = await db
        .db("lilleAdmin")
        .collection("users")
        .findOne({ email: data.email });
        // if dup, throw error "user exists"
        if (dupCheck)
          return res
            .status(400)
            .send({ error: true, message: "User already exists" });
        // insert user into mongodb
        user = await db.db("lilleAdmin").collection("users").insertOne(data);
        if (!user?.insertedId)
          return res.status(500).send({
            error: true,
            message:
              "User not added to database, likely database connection issue.",
          });
      }
      const userId = user?.insertedId || user._id

      if (!userId)
        return res.status(500).send({
          error: true,
          message:
            "User not added to database, likely database connection issue.",
        });

      // make token and add to DB
      const token = createAccessToken({
        email: data.email,
        id: user.insertedId
      });

      const isTokenInDB = db
        .db("lilleAdmin")
        .collection("users")
        .findOneAndUpdate(
          { _id: user.insertedId },
          { $set: { resetPasswordToken: token } }
        );
      // DONE!!
      return res.status(201).send({ error: false, message: "User added!" });
    } catch (error) {
      console.log(error, "error")
      return res.status(500).send({ error: true, message: `${error}` });
    }
});

router.post('/linkedin/token', async (request: any, reply: any) => {
  const body = request.body
  try {
    const accessToken = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', queryString.stringify({
      grant_type:"authorization_code",
      code: body.code,
      // eslint-disable-next-line no-restricted-globals
      redirect_uri:body.url,
      client_id:process.env.LINKEDIN_CLIENT_ID,
      client_secret:process.env.LINKEDIN_CLIENT_SECRET
    }))
    return reply
      .status(200)
      .send({ error: false, data: accessToken.data });
  } catch(err) {
    console.log(err, "err")
    if(err.status === 401) {
      return reply.status(401).send({
        error: true,
        message:
          err.message
      });
    } else {
      return reply.status(500).send({
        error: true,
        message:
          err.message
      });
    }
  }
})

router.post('/linkedin/me', async (request: any, reply: any) => {
  const body = request.body
  try {
    const user = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${body.accessToken}`
      }
    })
    if(user) {
      const contact = await axios.get('https://api.linkedin.com/v2/clientAwareMemberHandles?q=members&projection=(elements*(primary,type,handle~))', {
        headers: {
          Authorization: `Bearer ${body.accessToken}`
        }
      })
      user.data.email = contact?.data?.elements && contact?.data?.elements.length > 0 && contact?.data?.elements[0]['handle~'].emailAddress
    }
    return reply
      .status(200)
      .send({ error: false, data: user.data });
  } catch(err) {
    console.log(err, "err")
    if(err.status === 401) {
      return reply.status(401).send({
        error: true,
        message:
          err.message
      });
    } else {
      return reply.status(500).send({
        error: true,
        message:
          err.message
      });
    }
  }
})

router.post('/twitter/request-token', async (request: any, reply: any) => {
  const body = request.body
  const secretKey: string = process.env.TWITTER_API_Key_Secret || "Hjy1ujvoQpHvYBRisBz3deCWKfjsH6peapdTLPx3p8eCKt43YU"
  console.log(body)
  const timeStamp = Math.round(Date.now() / 1000).toString();
  const uuid = randomUUID()
  // Percent encodes base url
  const encodedBaseURL = encodeURIComponent(
    `https://api.twitter.com/oauth/request_token`
  );
  const encodedParams = encodeURIComponent(
    `oauth_callback=${encodeURIComponent(body.callback)}&oauth_consumer_key=${process.env.TWITTER_API_KEY}&oauth_nonce=${uuid}&oauth_signature_method=HMAC-SHA1&oauth_timestamp=${timeStamp}&oauth_version=1.0`
  );
  const oauth_signature = `POST&${encodedBaseURL}&${encodedParams}`
  const signingKey = `${encodeURIComponent(
    secretKey
  )}&`;
  const hash = createHmac("sha1", signingKey)
  .update(oauth_signature)
  .digest("base64");
  try {
    const response = await axios({
      url: `https://api.twitter.com/oauth/request_token?oauth_callback=${encodeURIComponent(body.callback)}`, 
      method: 'POST',
      headers: {
        "Authorization": `OAuth oauth_consumer_key="${process.env.TWITTER_API_KEY}", oauth_nonce="${uuid}", oauth_signature="${encodeURIComponent(hash)}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${timeStamp}", oauth_version="1.0"`,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    return reply
      .status(200)
      .send({ error: false, data: response.data });
  }catch(e){
    console.log(e)
    // console.log(e.response.data)
    if(e.status === 401) {
      return reply.status(401).send({
        error: true,
        message:
          e.message
      });
    }
  }
})

router.post('/twitter/access-token', async (request: any, reply: any) => {
  const body = request.body
  try {
    const response = await axios({
      url: `https://api.twitter.com/oauth/access_token?oauth_verifier=${body.verifier}&oauth_token=${body.token}`, 
      method: 'POST'
    });
    console.log(response)
    return reply
      .status(200)
      .send({ error: false, data: response.data });
  }catch(e){
    console.log(e)
    if(e.status === 401) {
      return reply.status(401).send({
        error: true,
        message:
          e.message
      });
    }
  }
})

router.post('/linkedin/post', authMiddleware ,async (request: any, reply: any) => {
  const db = request.app.get('db')
  const user = request.user
  if(!user) throw "No user found!"
  const userDetails = await fetchUser({id: user.id, db})
  if(!userDetails) {
    return reply.status(400).send({
      type: "SUCCESS",
      message: "No user found!"
    })
  }
  if(!userDetails.paid && parseInt(userDetails.credits) <= 0) {
    return reply.status(400).send({
      type: "SUCCESS",
      message: "No free credits left!"
    })
  }
  const options = request.body
  const todaysDate = new Date()
  const headers = {
      headers: {
          Authorization: `Bearer ${options.token}`,
          "LinkedIn-Version": `202212`,
          "X-Restli-Protocol-Version": "2.0.0"
      }
  }
  console.log(request.body)
  let postObj = null
  if(!options.image || options?.image?.length === 0) {
      postObj = {
          "author": options.author,
          "commentary": options.data,
          "visibility": "PUBLIC",
          "distribution": {
            "feedDistribution": "MAIN_FEED",
            "targetEntities": [],
            "thirdPartyDistributionChannels": []
          },
          "lifecycleState": "PUBLISHED",
          "isReshareDisabledByAuthor": false
      }
  } else {
      const res = await fileCreate(options)
      // const file = await fs.readFileSync(path.join(__dirname, "../../../test-image.png"), 'utf-8')
      // const binary = await Buffer.from(file)
      const binary = await fs.readFileSync('test-image.png')
      // console.log(path.join(__dirname))
      // console.log(binary)
      const imageRegisterObj = {
          "initializeUploadRequest": {
              "owner": options.author
          }
      }
      let imagesURN = null
      try {
          imagesURN = await axios.post('https://api.linkedin.com/rest/images?action=initializeUpload', imageRegisterObj, headers)
      } catch(err) {
          console.log(err, "imageUpload")
      }
      const registerImageData = imagesURN?.data?.value
      console.log(registerImageData.image, "imageregistered")
      if(registerImageData) {
          const uploadUrl = registerImageData.uploadUrl
          // console.log(uploadUrl)
          // console.log(headers)
          try {
              const response = await axios({
                  method: "post",
                  url: uploadUrl,
                  data: binary,
                  headers: {...headers, 'Content-Type': 'image/png'}
              });
              console.log(response.status, "imageuploaded")
              if(response && response.status === 201) {
                  postObj = {
                      "author": options.author,
                      "commentary": options.data,
                      "visibility": "PUBLIC",
                      "distribution": {
                          "feedDistribution": "MAIN_FEED",
                          "targetEntities": [],
                          "thirdPartyDistributionChannels": []
                      },
                      "content": {
                          "media": {
                          "title":"Nowigence",
                          "id": registerImageData.image
                          }
                      },
                      "lifecycleState": "PUBLISHED",
                      "isReshareDisabledByAuthor": false
                      }
                  console.log(options.data, "postObj")
                  console.log(JSON.stringify(postObj), "postObjstringify")
              }
          } catch(err) {
              console.log(err, "error")
          }
      }
  }
  try {
      // const postURN = await axios.post('https://api.linkedin.com/rest/posts', JSON.stringify(postObj), {
      //     headers: {...headers.headers, 'Content-Type': 'application/json'}
      // })
      // var data = '{\n  "author": "urn:li:person:ytxABo0fo5",\n  "commentary": "Test\' Market Value Reaches Rs 1.33 Lakh Crore\\n\\nSummary: \\n - The market valuation of TCS jumped Rs 32,071.59 crore to Rs 11,77,226.60 crore. \\n - The market valuation of TCS jumped Rs 32,071.59 crore to Rs 11,77,226.60 crore. \\n - The market valuation of Infosys climbed Rs 24,804.5 crore to Rs 6,36,143.85 crore and that of ICICI Bank advanced Rs 20,471.04 crore to Rs 6,27,823.56 crore. \\n - The market capitalisation of State Bank of India gained Rs 15,171.84 crore to Rs 4,93,932.64 crore and that of Adani Transmission went higher by Rs 7,730.36 crore to Rs 4,38,572.68 crore. \\n - HDFC Bank\'s valuation climbed Rs 7,248.44 crore to Rs 8,33,854.18 crore. \\n - HDFC\'s valuation fell by Rs 2,551.25 crore to Rs 4,41,501.59 crore and that of Bajaj Finance dipped Rs 432.88 crore to Rs 4,34,913.12 crore. \\n",\n  "visibility": "PUBLIC",\n  "distribution": {\n    "feedDistribution": "MAIN_FEED",\n    "targetEntities": [],\n    "thirdPartyDistributionChannels": []\n  },\n  "content": {\n    "media": {\n      "title":"title of the image",\n      "id": "urn:li:image:C4D10AQFDJBu3jJ-XmQ"\n    }\n  },\n  "lifecycleState": "PUBLISHED",\n  "isReshareDisabledByAuthor": false\n}\n// {\n//     "author": "urn:li:person:ytxABo0fo5",\n//     "commentary": "Sample text Post",\n//   "visibility": "PUBLIC",\n//   "distribution": {\n//     "feedDistribution": "MAIN_FEED",\n//     "targetEntities": [],\n//     "thirdPartyDistributionChannels": []\n//   },\n//   "lifecycleState": "PUBLISHED",\n//   "isReshareDisabledByAuthor": false\n// }';

      var config: any = {
          method: 'post',
          url: 'https://api.linkedin.com/rest/posts',
          headers: { 
              ...headers.headers,
              'Content-Type': 'application/json'
          },
          data : JSON.stringify(postObj)
      };

      const postUrn = await axios(config)

      if(options.image && options.image.length > 0)
          await fs.unlinkSync('test-image.png')

      const uin = "x-restli-id"
      await publishBlog({id: options.blogId, db, platform: "linkedin"})
      return reply
      .status(200)
      .send({ error: false, data: postUrn.headers[uin] });
  }  catch (err) {
      console.log(err)
      // throw new Error(`${err}`);
      if(err?.response?.data?.status) {
        return reply
            .status(err?.response?.data?.status)
            .send({ error: true, message: err?.response?.data?.message });
      } else {
        return reply
            .status(500)
            .send({ error: true, message: err.message });
      }
  }
})

router.post('/twitter/post',authMiddleware, async (request: any, reply: any) => {
  const db = request.app.get('db')
  const user = request.user
  if(!user) throw "No user found!"
  const userDetails = await fetchUser({id: user.id, db})
  if(!userDetails) {
    return reply.status(400).send({
      type: "SUCCESS",
      message: "No user found!"
    })
  }
  if(!userDetails.paid && parseInt(userDetails.credits) <= 0) {
    return reply.status(400).send({
      type: "SUCCESS",
      message: "No free credits left!"
    })
  }
  const options = request.body
  const body = options
  const secretKey: string = process.env.TWITTER_API_Key_Secret || "Hjy1ujvoQpHvYBRisBz3deCWKfjsH6peapdTLPx3p8eCKt43YU"
  try {
    const accessToken = (body.token).split('=')[1]
    const accessTokenSecret = (body.secret).split('=')[1]
    const timeStamp = Math.round(Date.now() / 1000).toString();
    const uuid = randomUUID()
    const textBody = body.text
    // Percent encodes base url
    const encodedBaseURL = encodeURIfix(
    `https://api.twitter.com/2/tweets`
    );
    const encodedParams = encodeURIfix(
    `oauth_consumer_key=${process.env.TWITTER_API_KEY}&oauth_nonce=${uuid}&oauth_signature_method=HMAC-SHA1&oauth_timestamp=${timeStamp}&oauth_token=${accessToken}&oauth_version=1.0`
    );
    const oauth_signature = `POST&${encodedBaseURL}&${encodedParams}`
    const signingKey = `${encodeURIfix(secretKey)}&${encodeURIfix(accessTokenSecret)}`;
    // console.log(`oauth_consumer_key=${process.env.TWITTER_API_KEY}&oauth_nonce=${uuid}&oauth_signature_method=HMAC-SHA1&oauth_timestamp=${timeStamp}&oauth_token=${accessToken}&oauth_version=1.0`)
    // console.log(signingKey)
    // console.log(oauth_signature)
    const hash = createHmac("sha1", signingKey)
    .update(oauth_signature)
    .digest("base64");
    const response = await axios({
        method: "POST",
        url: `https://api.twitter.com/2/tweets`,
        headers: {
        "Authorization":`OAuth oauth_consumer_key="${process.env.TWITTER_API_KEY}",oauth_token="${accessToken}",oauth_signature_method="HMAC-SHA1",oauth_timestamp="${timeStamp}",oauth_nonce="${uuid}",oauth_version="1.0",oauth_signature="${encodeURIComponent(hash)}"`,
        "Content-Type": "application/json"
        },
        data: JSON.stringify({"text": textBody})
    });
    await publishBlog({id: options.blogId, db, platform: "twitter"})
    return reply.status(200).send({
      data: response.data
    })
  } catch(e) {
    console.log(e)
      if(e.response.status === 403) {
          return reply
          .status(e.response.status)
          .send({ error: true, message: e.response.data.detail });
      }
      if(e.response.status === 401) {
        return reply
        .status(e.response.status)
        .send({ error: true, message: "Unauthorized" });
      }
      return reply
        .status(e.response.status)
        .send({ error: true, message: e?.response?.data?.errors?.length ? e?.response?.data?.errors?.[0].message : e.message});
  }
})

router.post('/twitter/me', async (request: any, reply: any) => {
  const options = request.body
  console.log(options)
  const body = options
  const secretKey: string = process.env.TWITTER_API_Key_Secret || "Hjy1ujvoQpHvYBRisBz3deCWKfjsH6peapdTLPx3p8eCKt43YU"
  const accessToken = (body.token).split('=')[1]
  const accessTokenSecret = (body.secret).split('=')[1]
  const timeStamp = Math.round(Date.now() / 1000).toString();
  const uuid = randomUUID()
  const textBody = body.text
  // Percent encodes base url
  const encodedBaseURL = encodeURIfix(
  `https://api.twitter.com/2/users/me`
  );
  const encodedParams = encodeURIfix(
  `oauth_consumer_key=${process.env.TWITTER_API_KEY}&oauth_nonce=${uuid}&oauth_signature_method=HMAC-SHA1&oauth_timestamp=${timeStamp}&oauth_token=${accessToken}&oauth_version=1.0`
  );
  const oauth_signature = `GET&${encodedBaseURL}&${encodedParams}`
  const signingKey = `${encodeURIfix(secretKey)}&${encodeURIfix(accessTokenSecret)}`;
  // console.log(`oauth_consumer_key=${process.env.TWITTER_API_KEY}&oauth_nonce=${uuid}&oauth_signature_method=HMAC-SHA1&oauth_timestamp=${timeStamp}&oauth_token=${accessToken}&oauth_version=1.0`)
  // console.log(signingKey)
  // console.log(oauth_signature)
  const hash = createHmac("sha1", signingKey)
  .update(oauth_signature)
  .digest("base64");
  console.log(`OAuth oauth_consumer_key="${process.env.TWITTER_API_KEY}",oauth_token="${accessToken}",oauth_signature_method="HMAC-SHA1",oauth_timestamp="${timeStamp}",oauth_nonce="${uuid}",oauth_version="1.0",oauth_signature="${encodeURIComponent(hash)}"`)  
  try {
    const response = await axios({
        method: "get",
        url: `https://api.twitter.com/2/users/me`,
        headers: {
        "Authorization":`OAuth oauth_consumer_key="${process.env.TWITTER_API_KEY}",oauth_token="${accessToken}",oauth_signature_method="HMAC-SHA1",oauth_timestamp="${timeStamp}",oauth_nonce="${uuid}",oauth_version="1.0",oauth_signature="${encodeURIComponent(hash)}"`,
        "Content-Type": "application/json"
        }
    });
    return reply.status(200).send({data: response.data})
  } catch(e) {
      console.log(e)
      if(e.response.status === 403) {
          reply
          .status(e.response.status)
          .send({ error: true, message: e.response.data.detail });
      }
      if(e.response.status === 401) {
        reply
        .status(e.response.status)
        .send({ error: true, message: "Unauthorized" });
      }
  }
})

router.post("/user/social/login", async (req: any, res: any) => {
  try {
    const db = req.app.get('db')
    // const { errors, isValid } = validateLoginInput(req.body);
    // if (!isValid) {
    //   return res.status(400).send(errors);
    // }
    const { email, password } = req.body;
    const userExists = await db
      .db("lilleAdmin")
      .collection("users")
      .findOne({ email: email.toLowerCase() });

    if (!userExists) {
      return res.status(404).send({
        success: false,
        data: null,
        message: `Could not find account: ${email}`,
      });
    }
    // console.log("userExists", userExists);

    // TODO: MOVE THIS TO A FUNCTION
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!

    let yyyy = today.getFullYear();

    console.log(
      "req.headers['x-forwarded-host']) :>> ",
      req.headers["x-forwarded-for"]
    );
    const ipAddress = req?.headers?.["x-forwarded-for"]?.split(", ")?.[0];

    if (dd < 10) {
      //@ts-ignore
      dd = "0" + dd;
    }
    if (mm < 10) {
      //@ts-ignore
      mm = "0" + mm;
    }

    //@ts-ignore
    today = `${yyyy}-${mm}-${dd}`;

    // TODO: Send data to the database here.
    const data: any = {
      userId: userExists._id,
      date: today,
      timestamp: Math.round(new Date().getTime() / 1000),
    };
    if (ipAddress) data.ipAddress = ipAddress;


    // DATA TO SIGN INTO JWT ACCESS TOKEN & REFRESH TOKEN
    const userObj = {
      email: userExists.email,
      id: userExists._id,
      company: userExists.company,
    };

    // CREATE ACCESS TOKEN
    const accessToken = createAccessToken(userObj);

    // CREATE REFRESH ACCESS TOKEN
    const refreshToken = createRefreshToken(userObj);

    // @ts-ignore
    // req.session.userId = refreshToken;
    if(__prod__) {
        res.setHeader('Set-Cookie', 'foo=bar; HttpOnly');
    }
    res.cookie(process.env.COOKIE_NAME, refreshToken, {
      path: "/",
      sameSite: "Lax",
      secure: __prod__,
      // domain: __prod__ ? "bang-k8s.com" : undefined,
      domain: __prod__ ? process.env.BASE_URL : "localhost",
      expire: Date.now() + 86400000,
    });
    return res.status(200).send({
      data: {
        accessToken,
        accessTokenExp: process.env.ACCESS_TOKEN_EXPIRES,
        success: true,
        email,
        id: userExists._id,
      },
    });
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: true, message: `${error}` });
  }
})

router.post("/forgot-password", async (request: any, reply: any) => {
  const db = request.app.get('db')
  // console.log(
  //   "================================================================================"
  // );
  // console.log("FORGOT PASSWORD ROUTE HIT");
  try {
    const email = request?.body?.email.toLowerCase();
    if (!email) {
      return reply.status(400).send({ error: "Please fill in email field" });
    }

    const user = await db.db("lilleAdmin").collection("users").findOne({ email });
    if (!user) {
      return reply
        .status(404)
        .send({ error: true, message: "User not found" });
    }

    // console.log("user :>> ", user);

    const newAccessTkn = createAccessToken({
      id: user._id,
      email: user.email
    });
    // console.log("newAccessTkn :>> ", newAccessTkn);

    const updatedUser = await db
      .db("lilleAdmin")
      .collection("users")
      .findOneAndUpdate(
        { email },
        { $set: { resetPasswordToken: newAccessTkn } },
        // or returnNewDocument: true,
        { returnOriginal: false }
      );
    if (!updatedUser) throw "failed to update DB with access token";

    // console.log("updatedUser :>> ", updatedUser);

    const forgotReq = await sendForgotPasswordEmail({
      email: user?.email,
      userName: `${user?.name} ${user.lastName}`,
      token: newAccessTkn!,
    });

    // console.log("forgotReq", forgotReq.response);
    if (!forgotReq.response.ok) {
      return reply.status(500).send({
        message:
          "Could not send forgot password email at this time.  Please try again",
      });
    }

    return reply.status(200).send({ message: "success" });
    //----- END Node mailer section -----//
  } catch (error) {
    console.log("error :>> ", error);
    return reply.status(500).send({
      error: "Sorry, something went wrong and we're not entirely sure what!",
    });
  }
});

router.post("/reset", async (request: any, reply: any) => {
  // const filter = { resetPasswordToken: request.body.token };
  const db = request.app.get('db')
  if(!request.body.token) {
    reply.status(400).send({
      error: true,
      message: "Token missing!",
    });
  }
  if(!request.body.password) {
    reply.status(400).send({
      error: true,
      message: "New password missing!",
    });
  }
  const user = await db.db("lilleAdmin").collection("users").findOne({
    resetPasswordToken: request.body.token,
  });
  // console.log("user :>> ", user);
  if (!user) {
    return (
      reply
        .clearCookie(process.env.COOKIE_NAME, { maxAge: Date.now() })
        // .setCookie(REFRESH_COOKIE_NAME, {
        //   path: "/auth",
        //   expires: exp,
        // })
        .status(403)
        .send({ error: true, message: "Forbidden" })
    );
  }
  try {
    // console.log("trying to verify password...");
    verify(user.resetPasswordToken, process.env.JWT_SECRET_KEY!);
  } catch (err) {
    console.log("err from reset top catch", err);
    // return reply.sendFile(path.join(__dirname + "/tokenExpired.html"));
  }
  if (request.body.password !== request.body.confirm) {
    return reply.status(400).send({
      error: true,
      message: "Your submitted passwords do not match. Please try again.",
    });
  }
  if (request.body.password === request.body.confirm) {
    const hashedPW = await bcrypt.hash(request.body.password, 12);
    const filter = { resetPasswordToken: request.body.token };
    const updates = {
      $set: { password: hashedPW, resetPasswordToken: undefined },
    };
    const updatePWRes = await db
      .db("lilleAdmin")
      .collection("users")
      .findOneAndUpdate(filter, updates, { returnOriginal: false });
    if (!updatePWRes) {
      reply.status(400).send({
        error: true,
        message: "Could not add password at this time.",
      });
      // reply.sendFile(path.join(__dirname + "/Error.html"));
    }
    reply.status(201).send({ errors: false, message: "Password changed!" });
    // reply.sendFile(path.join(__dirname + "/success.html"));
  }
});
router.post("/logout",authMiddleware, async (request: any, reply: any) => {
  // console.log("Running logout", REFRESH_COOKIE_NAME);
  reply.setCookie(process.env.COOKIE_NAME, "", {
    httpOnly: __prod__,
    path: "/",
    sameSite: "Lax",
    secure: __prod__,
    domain: __prod__ ? process.env.COOKIE_DOMAIN : "localhost",
    expires: Date.now(),
  });
  // .clearCookie(REFRESH_COOKIE_NAME, { maxAge: exp })
  reply.status(200).send({ data: { success: true } });
});
// router.post('/delete', async (request: any, reply: any) => {
//   const {emails} = request.body
//   const db = request.app.get('db')
//   const userIds = await db.db('lilleAdmin').collection('users').find({email: {$in: emails}}, {projection: {_id: 1}}).toArray()
//   const ids = userIds.map((data: any) => data._id)
//   await db.db('lilleBlogs').collection('blogs').deleteMany({userId: {$nin: ids}})
//   await db.db('lilleArticles').collection('articles').deleteMany({"userMetaData.userId": {$nin: ids}})
//   return reply.send(200)
//   // await (
//   //   Promise.all(
//   //     userIds.map(async(data: any) => {
//   //       console.log(data)
//   //       await db.db('lilleAdmin').collection('users').deleteOne({_id: new ObjectID(data._id)})
//   //       await db.db('lilleArticles').collection('articles').deleteMany({"userMetaData.userId": new ObjectID(data._id)})
//   //       const blogIds = await db.db('lilleBlogs').collection('blogs').find({userId: new ObjectID(data._id)}, {projection: {_id: 1}}).toArray()
//   //       await db.db('lilleBlogs').collection('blogs').deleteMany()
//   //       // await (
//   //       //   Promise.all(
//   //       //     blogIds.map(async (blogData: any) => {
//   //       //       await db.db('lilleBlogs').collection('blogs').deleteMany({_id: new ObjectID(blogData._id)})
//   //       //       await db.db('lilleBlogs').collection('blogIdeas').deleteMany({blogId: new ObjectID(blogData._id)})
//   //       //     })
//   //       //   )
//   //       // )
//   //     })
//   //   )
//   // )
// })
router.get('/add-monthly-credits', async (req: any, res: any) => {
  const db = req.app.get('db')
  const subscribedUsers = await db.db('lilleAdmin').collection('users').find({
    isSubscribed: true,
    paid: true
  }).toArray()
  await (
    Promise.all(
      subscribedUsers.map(async (user: any) => {
        const paymentStarts = user?.paymentsStarts || null
        console.log(paymentStarts)
        if(paymentStarts) {
          let paymentDate: any = new Date(paymentStarts);
          let currentDate: any = new Date(getTimeStamp() * 1000);
          paymentDate = `${paymentDate.getMonth()+1}/${paymentDate.getDate()}/${paymentDate.getFullYear()}`
          currentDate = `${currentDate.getMonth()+1}/${currentDate.getDate()}/${currentDate.getFullYear()}`
          var difference = new Date(currentDate).getTime() - new Date(paymentDate).getTime();
          let differenceInDays = difference / (1000 * 3600 * 24)
          if(differenceInDays === 30) {
            console.log(`======== Running monthly credit for user ${user.email} ==========`)
            await db.db('lilleAdmin').collection('users').updateOne({_id: new ObjectID(user._id)}, {
              $set: {
                credits: parseInt(process.env.PAID_CREDIT_COUNT || "200"),
                totalCredits: parseInt(process.env.PAID_CREDIT_COUNT || "200")
              }
            })
          }
        }
        return user
      })
    )
  )
  return res.statue(200).send({
    message: "Monthly credit added"
  })
})
router.put('/update-profile', authMiddleware, async (req: any, res: any) => {
  const db = req.app.get('db')
  const data = req.body
  const user = req.user
  if(!user) {
    return res.status(401).send({
      type: "ERROR",
      message: "Not authorised!"
    })
  }
  const userDetails = await fetchUser({id: user.id, db})
  if(!userDetails) {
    return res.status(401).send({
      type: "ERROR",
      message: "User not found!"
    })
  }
  const { errors, isValid } = validateUpdateInput(data);
  if (!isValid)
    return res
      .status(400)
      .send({ error: true, errors, message: "input errors" });
  await db.db('lilleAdmin').collection('users').updateOne({_id: new ObjectID(user.id)}, {
    $set: {
      ...data,
      name: data.firstName
    }
  })
  const userUpdatedDetails = await fetchUser({id: user.id, db})
  return res.status(201).send({ errors: false, message: "Profile Updated!", data: userUpdatedDetails });
})
module.exports = router;
