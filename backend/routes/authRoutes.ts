// wiki.js - Wiki route module.

import axios from "axios";
import { ObjectID } from "bson";
import { randomUUID, createHmac } from "crypto";
import { fileCreate } from "../utils/file";
import { createAccessToken, createRefreshToken } from "../utils/accessToken";
import { validateRegisterInput, validateLoginInput, validateUpdateInput, validateSupportInput } from "../validations/Validations";
import { encodeURIfix } from "../utils/encode";
import { authMiddleware } from "../middleWare/authToken";
import { daysBetween, diff_hours, diff_minutes, getDateString, getTimeStamp, monthDiff, timeFromMins, timeToMins } from "../utils/date";
import { verify } from "jsonwebtoken";
import { sendContributionEmail, sendEmails, sendForgotPasswordEmail } from "../utils/mailJetConfig";
import { assignTweetQuota, blogGeneration, fetchArticleById, fetchArticleUrls, fetchBlog, fetchBlogIdeas, fetchUser, publishBlog, updateUserCredit } from "../graphql/resolver/blogs/blogsRepo";
import { ChatGPT } from "../services/chatGPT";
import { Python } from "../services/python";
import { publish } from "../utils/subscription";
const multer = require("multer");
const inMemoryStorage = multer.memoryStorage();
const mulitUploadStrategy = multer({ storage: inMemoryStorage });
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
          email: userExists.email,
          timestamp: Math.round(new Date().getTime() / 1000),
        };
        if (ipAddress) data.ipAddress = ipAddress;
        // TODO: maybe add error state
        await db.db("lilleAdmin").collection("loginLogs").insertOne(data);
  
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
      if(data.userName) {
        const userNameExist = await db.db('lilleAdmin').collection('users').count({
          userName: data.userName
        })
        if(userNameExist) {
          return res.status(401).send({
            type: "ERROR",
            message: "User Name exists!"
          })
        }
      }
      if(data.linkedInUserName) {
        const userNameExist = await db.db('lilleAdmin').collection('users').count({
          linkedInUserName: data.linkedInUserName
        })
        if(userNameExist) {
          return res.status(401).send({
            type: "ERROR",
            message: "User Name exists!"
          })
        }
      }
      if(data.googleUserName) {
        const userNameExist = await db.db('lilleAdmin').collection('users').count({
          googleUserName: data.googleUserName
        })
        if(userNameExist) {
          return res.status(401).send({
            type: "ERROR",
            message: "User Name exists!"
          })
        }
      }
      if(data.paid) {
        delete data._id;
        // data.credits = process.env.PAID_CREDIT_COUNT
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

      if(!data.paid) {
        const userDetails = await db.db('lilleAdmin').collection('users').findOne({
          _id: new ObjectID(user.insertedId)
        })
        assignTweetQuota(db, userDetails)  
      }

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
      const addedUser = await db.db('lilleAdmin').collection('users').findOne({_id: new ObjectID(user.insertedId)})  
      // DONE!!
      return res.status(201).send({ error: false, message: "User added!", user: addedUser });
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

router.post('/linkedin/me', authMiddleware, async (request: any, reply: any) => {
  const body = request.body
  const db = request.app.get('db')
  try {
    const authUser = request.user
    let userDetails = null
    if(authUser) {
      userDetails = await fetchUser({id: authUser.id, db})
      if(!userDetails) {
        return reply.status(400).send({
          type: "SUCCESS",
          message: "No user found!"
        })
      }
    }
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
    if(user.data && user.data) {
      await db.db('lilleAdmin').collection('users').updateOne({
        email: userDetails ? userDetails.email : user.data.email
      }, {
        $set: {
          linkedInUserName: `${user.data.localizedFirstName} ${user.data.localizedLastName}`
        }
      })
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
      type: "ERROR",
      message: "No user found!"
    })
  }
  if(!userDetails.paid && parseInt(userDetails.credits) <= 0) {
    return reply.status(400).send({
      type: "ERROR",
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
    const textsArray = body.texts
    const quota = await db.db('lilleAdmin').collection('tweetsQuota').findOne({
      userId: new ObjectID(userDetails._id)
    })
    if(quota) {
      const currentDate = new Date()
      console.log(quota)
      console.log(diff_hours(new Date(quota.date * 1000), currentDate))
      if(!quota.remainingQuota) {
        return reply.status(400).send({
          type: "ERROR",
          message: "Your 24 hours tweet quota has been exahusted!"
        })
      }
      if(diff_hours(new Date(quota.date * 1000), currentDate) < 24) {
        if(textsArray && textsArray.length && quota.remainingQuota < textsArray.length) {
          return reply.status(400).send({
            type: "ERROR",
            message: "Your 24 hours tweet remaining quota is less then your tweets!"
          })
        }
      }
    } 
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
    let responses: any[] = []
    let response: any = null
    let tweetLength = 0
    if(textsArray && textsArray.length) {  
      tweetLength = textsArray.length
      for (let [index, text] of textsArray.entries()) {
        let params: any = {"text": text}
        if(index > 0 && responses && responses.length) {
          params = {
            ...params, 
            reply: {
              in_reply_to_tweet_id: responses[index - 1].data.id
            }
          }
        }
        console.log(params)
        const response = await axios({
          method: "POST",
          url: `https://api.twitter.com/2/tweets`,
          headers: {
          "Authorization":`OAuth oauth_consumer_key="${process.env.TWITTER_API_KEY}",oauth_token="${accessToken}",oauth_signature_method="HMAC-SHA1",oauth_timestamp="${timeStamp}",oauth_nonce="${uuid}",oauth_version="1.0",oauth_signature="${encodeURIComponent(hash)}"`,
          "Content-Type": "application/json"
          },
          data: JSON.stringify(params)
        });
        responses.push(response.data)
        // console.log(responses, "responses")
      }
    } else {
      tweetLength = 1
      response = await axios({
        method: "POST",
        url: `https://api.twitter.com/2/tweets`,
        headers: {
        "Authorization":`OAuth oauth_consumer_key="${process.env.TWITTER_API_KEY}",oauth_token="${accessToken}",oauth_signature_method="HMAC-SHA1",oauth_timestamp="${timeStamp}",oauth_nonce="${uuid}",oauth_version="1.0",oauth_signature="${encodeURIComponent(hash)}"`,
        "Content-Type": "application/json"
        },
        data: JSON.stringify({"text": textBody})
      });
    }
    let updatedTweetsQuotaData;
    const configs = await db.db('lilleAdmin').collection('config').findOne()
    const totalQuota = !userDetails.isSubscribed ? parseInt(configs?.tweetsQuota?.unpaid || "3") : parseInt(configs?.tweetsQuota?.paid || "6")
    const updatedQuota = !quota ? totalQuota - tweetLength : quota.remainingQuota - tweetLength
    updatedTweetsQuotaData = {
      totalQuota,
      remainingQuota: updatedQuota,
      date: !quota ? getTimeStamp() : quota.date,
      userId: new ObjectID(userDetails._id),
    }
    const res = await db.db('lilleAdmin').collection('tweetsQuota').updateOne(
      {userId: new ObjectID(userDetails._id)}, 
      {$set: updatedTweetsQuotaData}, 
      {upsert: true})
    console.log(res)
    await publishBlog({id: options.blogId, db, platform: "twitter"})
    return reply.status(200).send({
      data: responses?.length ?  responses : response?.data
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

router.post('/twitter/me', authMiddleware, async (request: any, reply: any) => {
  const db = request.app.get('db')
  const options = request.body
  console.log(options)
  const user = request.user
  if(!user) {
    return reply.status(401).send({
      type: "ERROR",
      message: "Not authorised!"
    })
  }
  const userDetails = await fetchUser({id: user.id, db})
  if(!userDetails) {
    return reply.status(401).send({
      type: "ERROR",
      message: "User not found!"
    })
  }
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
    if(response.data) {
      await db.db('lilleAdmin').collection('users').updateOne({
        email: userDetails.email
      }, {
        $set: {
          twitterUserName: `${response.data.data.username}`
        }
      })
    }
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
    await db.db("lilleAdmin").collection("loginLogs").insertOne(data);
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
    isSubscribed: true
  }).toArray()
  const newCredit = await db.db('lilleAdmin').collection('config').findOne()
  if(subscribedUsers && subscribedUsers.length) {
    await (
      Promise.all(
        subscribedUsers.map(async (user: any) => {
          const paymentStarts = user?.paymentsStarts || null
          if(paymentStarts) {
            const now = new Date();
            const paymentStartDate: any = new Date(paymentStarts * 1000);
            const monthDuration = monthDiff(paymentStartDate, now)
            let nextDate = new Date(paymentStartDate.setMonth(paymentStartDate.getMonth() + (monthDuration === 0 ? monthDuration + 1 : monthDuration)));
            let differenceInDays = daysBetween(now, nextDate)
            if(differenceInDays < 0) {
              nextDate = new Date(paymentStartDate.setMonth(paymentStartDate.getMonth() + 1));
              differenceInDays = daysBetween(now, nextDate)
            }
            if(differenceInDays === 0 && monthDuration) {
              console.log(`======== Running monthly credit for paid user ${user.email} ==========`)
              console.log(nextDate, "next")
              console.log(now, "now")
              console.log( monthDuration, user, "duration")
              console.log( differenceInDays, "differenceInDays")
              await db.db('lilleAdmin').collection('users').updateOne({_id: new ObjectID(user._id)}, {
                $set: {
                  credits: parseInt(newCredit?.monthly_credit || "200"),
                  totalCredits: parseInt(newCredit?.monthly_credit || "200")
                }
              })
            }
          }
          return user
        })
      )
    )
  }
  // const nonSubscribedUser = await db.db('lilleAdmin').collection('users').find({
  //   isSubscribed: false,
  //   paid: false
  // }).toArray()
  // if(nonSubscribedUser && nonSubscribedUser.length) {
  //   await (
  //     Promise.all(
  //       subscribedUsers.map(async (user: any) => {
  //         const createdAt = user?.date || null
  //         console.log(createdAt)
  //         if(createdAt) {
  //           const now = new Date();
  //           const createdAtDate: any = new Date(createdAt);
  //           console.log(createdAtDate)
  //           const monthDuration = monthDiff(createdAtDate, now)
  //           const nextDate = new Date(createdAtDate.setMonth(createdAtDate.getMonth() + (monthDuration === 0 ? monthDuration + 1 : monthDuration)));
  //           console.log(nextDate, "next")
  //           console.log(now, "now")
  //           console.log( monthDuration, "duration")
  //           let differenceInDays = daysBetween(now, nextDate)
  //           console.log( differenceInDays, "differenceInDays")
  //           if(differenceInDays === 0 && monthDuration) {
  //             console.log(`======== Running monthly credit for paid user ${user.email} ==========`)
  //             await db.db('lilleAdmin').collection('users').updateOne({_id: new ObjectID(user._id)}, {
  //               $set: {
  //                 credits: parseInt(newCredit?.monthly_credit || "200"),
  //                 totalCredits: parseInt(newCredit?.monthly_credit || "200")
  //               }
  //             })
  //           }
  //         }
  //         return user
  //       })
  //     )
  //   )
  // }
  return res.status(200).send({
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

router.post('/save-user-support', authMiddleware, async (req: any, res: any) => {
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
  const { errors, isValid } = validateSupportInput(data);
  if (!isValid)
    return res
      .status(400)
      .send({ error: true, errors, message: "input errors" });
  await db.db('lilleAdmin').collection('supports').insertOne({
    userId: new ObjectID(user.id),
    ...data
  })
  await sendContributionEmail({
    email: userDetails.email,
    userName: `${userDetails.name} ${userDetails.lastName}`,
    htmlMsg: `<p>Dear ${userDetails.name} ${userDetails.lastName},</p>
      <p></p>
      <p>Thank you for buying us a coffee! </p>
      <p>The Nowigence team appreciates the kind gesture of yours.</p>
      <p>We are hopeful that your journey with Lille will be fruitful.</p>
      <p></p>
      <p>Thank You.</p> 
      <p>Nowigence Team.</p>
      <p>Nowigence, Inc.</p>
    
    `
  })
  return res.status(201).send({ errors: false, message: "Support Data Added!" });
})

router.get('/add-tweet-quota', async (req: any, res: any) => {
  const db = req.app.get('db')
  // const users: {_id: ObjectID, paid: Boolean, isSubscribed: Boolean}[] = await db.db('lilleAdmin').collection('users').find({}, {
  //   projection: {
  //     _id: 1,
  //     paid: 1,
  //     isSubscribed: 1
  //   }
  // }).toArray()
  // const quotaDataBefore24hours = await db.db('lilleAdmin').collection('tweetsQuota').find({"date":{
  //   $lte: (new Date(Date.now() - (24*60*60 * 1000)).getTime()) / 1000
  // }}).toArray()
  const users = await db.db('lilleAdmin').collection('users').find({}, {projection: {
    _id: 1,
    paid: 1,
    isSubscribed: 1,
    email: 1
  }}).toArray() 
  console.log(users)
  // const quotaNotExist: {_id: ObjectID, paid: Boolean, isSubscribed: Boolean}[] = await db.db('lilleAdmin').collection('users').aggregate([
  //   {
  //     $lookup: {
  //       from: "tweetsQuota",
  //       localField: "_id",
  //       foreignField: "userId",
  //       as: "join"
  //     }
  //   },
  //   {
  //     $match: {
  //       "join": {
  //         $size: 0
  //       }
  //     }
  //   },
  //   {
  //     $project: {
  //       join: 0
  //     }
  //   }
  // ]).toArray()
  // if(quotaNotExist && quotaNotExist.length) {
  //   await (
  //     Promise.all(
  //       quotaNotExist.map(async (user) => {
  //         const quotaData = await db.db('lilleAdmin').collection('tweetsQuota').findOne({_id: new ObjectID(user._id)})
  //         if(!quotaData){
  //           console.log(`Adding new tweet quota for user ${user._id}`)
  //           await assignTweetQuota(db, user, false)
  //         }
  //         return user
  //       })
  //     )
  //   )
  // }
  if(users && users.length) {
    await (
      Promise.all(
        users.map(async (user: any) => {
          console.log(`Reallocating daily quota for user ${user._id}`)
          const resp = await assignTweetQuota(db, user, false)
          return resp
        })
      )
    )
  }
  return res.status(200).send({
    type: "SUCCESS",
    message: "Tweet Quota Checked!"
  })
})

router.get('/send-otp', authMiddleware,  async (request: any, res: any) => {
  try {
    const db = request.app.get('db')
    const user = request.user
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
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++ ) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    console.log(OTP)
    const test = await sendEmails({
      to: [
        { Email: userDetails.email, Name: `${userDetails.name} ${userDetails.lastName}` }
      ],
      subject: "Email verification for Lille",
      textMsg: "Email verification for Lille",
      // htmlMsg: `
      // <p>Dear ${userDetails.name},</p>
      // <br/><br/>
      // <p>Thank you taking the action to have your email verified with Lille Platform.
      // Please add the following one time password ( OTP )  to get your email verified.
      // </p><br/><br/>
      // <p>OTP: ${OTP}</p>
      // <br/>
      // <p>Please contact us at <a href="mailto:info@nowigence.com">info@nowigence.com</a> if you face any issue.</p>
      // <br/><br/>
      // <p>Cheers.</p>
      // <p>Lille Support Team</p>
      // <p>nowigence.com</p>
      // <br/><br/>
      // <p style="font-size: 6px">This is system generated email. Do not reply to this email. </p>
      // `,
      htmlMsg: `
      <html><head></head><body marginheight="0"><p style="box-sizing: border-box ; margin: 0">&nbsp;</p>
      
      <div class="bee-page-container" style="box-sizing: border-box">
      <div class="bee-row bee-row-1" style="box-sizing: border-box ; position: relative ; background-repeat: no-repeat">
      <div class="bee-row-content" style="box-sizing: border-box ; position: relative ; max-width: 650px ; margin: 0 auto ; background-repeat: no-repeat ; color: #000">
      <div class="bee-col bee-col-1 bee-col-w12" style="box-sizing: border-box ; padding-bottom: 5px ; padding-top: 5px">
      <div class="bee-block bee-block-1 bee-divider" style="box-sizing: border-box ; overflow: auto ; padding: 10px">
      <div class="spacer" style="box-sizing: border-box ; height: 10px">&nbsp;</div>
      </div>
      </div>
      </div>
      </div>
      <div class="bee-row bee-row-2" style="box-sizing: border-box ; position: relative ; background-repeat: no-repeat">
      <div class="bee-row-content" style="box-sizing: border-box;position: relative;max-width: 650px;margin: 0 auto;/* display: flex ; */background-repeat: no-repeat;background-color: #f9948c;color: #000">
      <div class="bee-col bee-col-1 bee-col-w12" style="box-sizing: border-box ; padding: 10px 15px">
      <div class="bee-block bee-block-1 bee-image" style="box-sizing: border-box ; overflow: auto ; width: 100%"><img class="bee-center bee-fixedwidth" style="box-sizing: border-box;display: block;width: 100%;margin: auto;max-width: 124px;height: 66px;text-align: center;/* left: 50%; *//* position: relative; */" src="https://lille.ai/lille_logo_new.png" alt=""></div>
      </div>
      </div>
      </div>
      <div class="bee-row bee-row-3" style="box-sizing: border-box ; position: relative ; background-repeat: no-repeat">
      <div class="bee-row-content" style="box-sizing: border-box;position: relative;max-width: 650px;margin: 0 auto;/* display: flex ; */background-repeat: no-repeat;background-color: #f0d5d5;color: #000">
      <div class="bee-col bee-col-1 bee-col-w12" style="box-sizing: border-box ; padding-top: 5px">
      <div class="bee-block bee-block-1 bee-text" style="box-sizing: border-box ; padding: 30px 10px">
      <div class="bee-text-content" style="box-sizing: border-box ; line-height: 120% ; font-size: 12px ; font-family: inherit ; color: #052d3d">
      <p style="box-sizing: border-box ; margin: 0 ; line-height: 14px ; font-size: 12px ; text-align: center"><span style="box-sizing: border-box ; font-size: 30px ; line-height: 36px"><strong style="box-sizing: border-box">Here's your Verification Code</strong></span></p>
      </div>
      </div>
      </div>
      </div>
      </div>
      <div class="bee-row bee-row-4" style="box-sizing: border-box ; position: relative ; background-repeat: no-repeat">
      <div class="bee-row-content" style="box-sizing: border-box;position: relative;max-width: 650px;margin: 0 auto;/* display: flex; */background-repeat: no-repeat;background-color: #fff;border-bottom: 0 solid #fff;border-left: 0 solid #fff;border-radius: 0;border-right: 0px solid #fff;border-top: 0 solid #fff;color: #000">
      <div class="bee-col bee-col-1 bee-col-w12" style="box-sizing: border-box ; border-bottom: 30px solid #f0d5d5 ; border-left: 30px solid #f0d5d5 ; border-right: 30px solid #f0d5d5 ; border-top: 0 solid #f0d5d5 ; padding-bottom: 30px ; padding-top: 30px">
      <div class="bee-block bee-block-1 bee-image" style="box-sizing: border-box ; overflow: auto ; padding-bottom: 32px ; width: 100%"><img class="bee-center bee-fixedwidth" style="box-sizing: border-box ; display: block ; width: 100% ; margin: 0 auto ; max-width: 118px" src="https://a95de3cb9b.imgdist.com/public/users/Integrators/BeeProAgency/1006241_991088/data_protection_2_.png" alt=""></div>
      <div class="bee-block bee-block-2 bee-text" style="box-sizing: border-box ; padding-bottom: 10px ; padding-left: 10px ; padding-right: 10px">
      <div class="bee-text-content" style="box-sizing: border-box ; line-height: 120% ; font-size: 12px ; font-family: inherit ; color: #fc7318">
      <p style="box-sizing: border-box ; margin: 0 ; line-height: 14px ; font-size: 12px ; text-align: center ; letter-spacing: 6px"><span style="box-sizing: border-box ; color: #052d3d ; line-height: 14px"><span style="box-sizing: border-box ; font-size: 46px ; line-height: 55px"><strong style="box-sizing: border-box">${OTP}</strong></span></span></p>
      </div>
      </div>
      <div class="bee-block bee-block-3 bee-text" style="box-sizing: border-box ; padding: 15px 10px">
      <div class="bee-text-content" style="box-sizing: border-box ; line-height: 120% ; font-size: 12px ; font-family: inherit ; color: #fc7318">
      <p style="box-sizing: border-box ; margin: 0 ; line-height: 14px ; font-size: 12px ; text-align: center"><span style="box-sizing: border-box ; font-size: 20px ; line-height: 24px ; color: #052d3d"><strong style="box-sizing: border-box">👉 <span style="box-sizing: border-box ; font-size: 13px ; line-height: 15px">&nbsp;&nbsp;<span style="box-sizing: border-box ; background-color: #ffff99 ; line-height: 14px"> Valid for ${process.env.OTP_VERIFICATION_TIME} min. only&nbsp;</span></span></strong></span></p>
      </div>
      </div>
      </div>
      </div>
      </div>
      <div class="bee-row bee-row-5" style="box-sizing: border-box ; position: relative ; background-repeat: no-repeat">
      <div class="bee-row-content" style="box-sizing: border-box ; position: relative ; max-width: 650px ; margin: 0 auto ; display: flex ; background-repeat: no-repeat ; color: #000">
      <div class="bee-col bee-col-1 bee-col-w12" style="box-sizing: border-box ; padding-bottom: 20px ; padding-top: 20px">
      <div class="bee-block bee-block-1 bee-divider" style="box-sizing: border-box ; overflow: auto ; padding: 10px">
      <div class="center bee-separator" style="box-sizing: border-box ; margin: 0 auto ; border-top: 1px dotted #c4c4c4 ; width: 60%">&nbsp;</div>
      </div>
      <div class="bee-block bee-block-2 bee-text" style="box-sizing: border-box ; padding: 10px">
      <div class="bee-text-content" style="box-sizing: border-box ; font-size: 12px ; line-height: 120% ; font-family: inherit ; color: #000000">
      <p style="box-sizing: border-box ; margin: 0 ; font-size: 12px ; line-height: 14px ; text-align: center"><a style="box-sizing: border-box ; text-decoration: underline ; color: #000000" href="mailto:customersuccess@lille.ai" target="_other" rel="nofollow"><strong style="box-sizing: border-box">You can reach us at customersuccess@lille.ai</strong></a></p>
      </div>
      </div>
      <div class="bee-block bee-block-3 bee-text" style="box-sizing: border-box ; padding: 10px">
      <div class="bee-text-content" style="box-sizing: border-box ; font-size: 12px ; line-height: 120% ; font-family: inherit ; color: #004aad">
      <p style="box-sizing: border-box ; margin: 0 ; font-size: 12px ; line-height: 14px ; text-align: center">Creator of Lille.ai - &nbsp; &nbsp;© Nowigence, Inc. - All Rights Reserved 2023</p>
      </div>
      </div>
      </div>
      </div>
      </div>
      </div>
      
      </html>
      
      
      `
    });
    const data: any = {
      userId: new ObjectID(userDetails._id),
      date: getDateString(new Date()),
      timestamp: getTimeStamp(),
      otp: OTP,
      isVerified: 0,
      isExpired: 0,
      createdAt: new Date()
    };
    await db
    .db("lilleAdmin")
    .collection('userOTP')
    .insertOne(data);
    return res.status(200).send({
      error: false,
      message: "OTP sent to your registered email address"
    })
  } catch(err) {
    console.log(err)
    return res
      .status(500)
      .send({ error: true, message: err.message });
  }
})

router.post('/verify-otp', authMiddleware,  async (request: any, res: any) => {
  try {
    const body = request.body
    const db = request.app.get('db')
    const user = request.user
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
    
    const getOTP = await db.db('lilleAdmin').collection('userOTP').findOne({
      userId: new ObjectID(userDetails._id),
      otp: body.otp
    })
    
    if(!getOTP) throw "Invalid otp!"
    if(getOTP && (getOTP.isExpired || getOTP.isVerified)) throw "OTP Expired!"

    const createdAt = getOTP.createdAt
    const currentTimeStamp = getTimeStamp()
    const otpVerificationTimestamp =  Math.round(new Date(createdAt.getTime() + (parseInt(process.env.OTP_VERIFICATION_TIME || '20')) * 60000).getTime() / 1000)
    console.log(otpVerificationTimestamp)
    if(currentTimeStamp > otpVerificationTimestamp) {
      await db.db('lilleAdmin').collection('userOTP').updateOne({_id: new ObjectID(getOTP._id)}, {$set: {isExpired: 1}})
      throw "OTP Expired!"
    }
    await db.db('lilleAdmin').collection('userOTP').updateOne({_id: new ObjectID(getOTP._id)}, {$set: {isVerified: 1}})
    await db.db('lilleAdmin').collection('userOTP').update({userId: new ObjectID(userDetails._id), isExpired: 0, isVerified: 0}, {$set: {isExpired: 1}})
    await db.db('lilleAdmin').collection('users').updateOne({_id: new ObjectID(user._id)}, {$set: {emailVerified: 1}})
    return res.status(200).send({
      error: false,
      message: "Email address verified!"
    })
  } catch(err) {
    console.log(err)
    return res
      .status(500)
      .send({ error: true, message: err.message ? err.message : err });
  }
})

router.post('/request-trial', async (req: any, res: any) => {
  const db = req.app.get('db')
  const data = req.body
  const {email, name, topics} = data
  if(!email || !name || !topics) {
      return res.status(400).send({
          type: "ERROR",
          message: "Please provide all data!"
      })
  }
  const emailExists = await db.db('lilleAdmin').collection('trials').findOne({
      email
  })
  if(emailExists) {
      return res.status(400).send({
          type: "ERROR",
          message: "Request is already under process!"
      })
  }
  await db.db('lilleAdmin').collection('trials').insertOne({email, topics, name})
  return res.status(200).send({
      type: "SUCCESS",
      message: "Request accepted!"
  })
})
router.post('/remove-sources', [authMiddleware], async (req: any, res: any) => {
  const db = req.app.get('db')
  const user = req.user
  const {blogId, sourceId} = req.body
  try {
    if(!user || !Object.keys(user).length) {
      return res.status(401).send({
        type: "ERROR",
        message: "Not Authorized!"
      })
    }
    let userDetails = null
    if(user && Object.keys(user).length) {
      userDetails = await fetchUser({id: user.id, db})
      if(!userDetails) {
        return res.status(400).send({
          type: "ERROR",
          message: "@No user found"
        })
      }
      if(userDetails.credits <= 0) {
        return res.status(400).send({
          type: "ERROR",
          message: "@Credit exhausted"
        })
      }
    }
    const article = await db.db('lilleArticles').collection('articles').findOne({_id: sourceId})
    const blog = await fetchBlog({id: blogId, db})
    const blogIdeas = await fetchBlogIdeas({id: blogId, db})
    let updatedSourcesArray = []
    let updatedArticleIdsArray = []
    let updatedBlogIdeasArray = []
    let updatedTagsArray = []
    console.log(blog.sourcesArray)
    console.log(blog.article_id)
    console.log("================================")
    if(blog.sourcesArray && blog.sourcesArray.length) {
      updatedSourcesArray = blog.sourcesArray.filter((data: any) => data.id !== sourceId)
    }
    if(blog.article_id && blog.article_id.length) {
      updatedArticleIdsArray = blog.article_id.filter((data: any) => data !== sourceId)
    }
    if(blogIdeas && blogIdeas?.ideas?.length) {
      updatedBlogIdeasArray = blogIdeas?.ideas.filter((data: any) => data.article_id !== sourceId)
    }
    if(blog.tags && blog.tags.length) {
      updatedTagsArray = blog.tags.filter((data: any) => article._source.driver.includes(data))
    }
    console.log(updatedSourcesArray)
    console.log(updatedArticleIdsArray)
    console.log(updatedBlogIdeasArray)
    const updatedBlog = await db.db('lilleBlogs').collection('blogs').findOneAndUpdate({
      _id: new ObjectID(blogId)
    }, {
      $set: {
        article_id: updatedArticleIdsArray,
        sourcesArray: updatedSourcesArray,
        tags: updatedTagsArray,
      }
    }, {returnDocument: "after"})
    const updatedBlogIdeas = await db.db('lilleBlogs').collection('blogIdeas').findOneAndUpdate({
      blog_id: new ObjectID(blogId)
    }, {
      $set: {
        ideas: updatedBlogIdeasArray
      }
    }, {returnDocument: "after"})
    let uniqueSources : {
      url: string
      source: string
      id?: string
      type?: string
    }[] = [];
    if(blog.sourcesArray && blog.sourcesArray.length) {
      blog.sourcesArray.forEach((c: any) => {
        const dupe = uniqueSources.find((data: {
            url: string
            source: string
        }) => data.source === c.source)
        if(!dupe) uniqueSources.push(c)
      });
    }
    return res.status(200).send({
      type: "SUCCESS",
      message: "Source Deleted",
      blogIdeas: updatedBlogIdeas?.value || blog,
      blog: updatedBlog?.value || blog,
    })
  }catch(e){
    console.log(e, "remove source")
    return res.status(400).send({
      type: "ERROR",
      message: e.message
    })
  }
})
router.post('/generate', [authMiddleware, mulitUploadStrategy.array('files')], async (req: any, res: any) => {
  let startRequest = new Date()
  const db = req.app.get('db')
  console.log(req.body)
  let {keyword, article_ids: articleIds, keywords, urls, tones, user_id: userId} = req.body
  let files = req.files
  let combinedArticleIds: string[] = []
  let sourcesArray: any[] = []
  // let keyword = args.options.keyword
  // let articleIds: any[] = args.options.article_ids
  // let keywords = args.options.keywords
  // let uploads = args.options.uploads
  // let urls = args.options.urls
  // let tones = args.options.tones
  if(!keyword?.length && !keywords?.length) {
    return res.status(400).send({
      type: "ERROR",
      message: "No keyword passed!"
    })
  }
  if(!userId || userId == "null") {
    return res.status(400).send({
      type: "ERROR",
      message: "User Id missing!"
    })
  }
  const user = req.user
  let userDetails = null
  if(user && Object.keys(user).length) {
    userDetails = await fetchUser({id: user.id, db})
    if(!userDetails) {
      return res.status(400).send({
        type: "ERROR",
        message: "@No user found"
      })
    }
    if(userDetails.credits <= 0) {
      return res.status(400).send({
        type: "ERROR",
        message: "@Credit exhausted"
      })
    }
  }
  if((urls?.length > 1 || files?.length > 1) && (!user || !Object.keys(user).length)) {
    return res.status(400).send({
      type: "ERROR",
      message: "User not authorized!"
    })
  }
  let refUrls: {
      url: string
      source: string
  }[] = []
  let pythonStart = new Date()
  const cachedBlogData = await db.db('lilleBlogs').collection('cachedBlogs').find({keyword}).sort({date: -1}).toArray()
  if(cachedBlogData.length) {
      const cachedBlogIdeaData = await db.db('lilleBlogs').collection('cachedBlogIdeas').findOne({blog_id: new ObjectID(cachedBlogData[0]._id)})
      delete cachedBlogData[0]._id
      delete cachedBlogIdeaData._id
      delete cachedBlogIdeaData.blog_id
      const updatedBlogs = {
          ...cachedBlogData[0],
          userId: new ObjectID(userId),
          date: getTimeStamp(),
          updatedAt: getTimeStamp(),
      }
      const updatedBlogIdeas = cachedBlogIdeaData
      const insertBlog = await db.db('lilleBlogs').collection('blogs').insertOne(updatedBlogs)
      const insertBlogIdeas = await db.db('lilleBlogs').collection('blogIdeas').insertOne({
          blog_id: new ObjectID(insertBlog.insertedId),
          ...updatedBlogIdeas
      })
      if(cachedBlogData[0].article_id && cachedBlogData[0].article_id.length) refUrls = await fetchArticleUrls({db, articleId: cachedBlogData[0].article_id})
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
      await delay(10000)
      if(user && Object.keys(user).length) {
          const updateduser = await fetchUser({id: user.id, db})
          const updatedCredits = ((updateduser.credits || 25) - 1)
          await updateUserCredit({id: updateduser._id, credit: updatedCredits, db})
          if(updatedCredits <= 0) {
              await sendEmails({
                  to: [
                  { Email: `akash.sharma@nowigence.com`, Name: `Akash Sharma` },
                  { Email: `arvind.ajimal@nowigence.com`, Name: `Arvind Ajimal` },
                  { Email: `subham.mahanta@nowigence.com`, Name: `Subham Mahanta` },
                  { Email: `vashisth@adesignguy.co`, Name: `Vashisth Bhushan` }
                  ],
                  subject: "Credit Exhausted",
                  textMsg: "",
                  htmlMsg: `
                      <p>Hello All,</p>
                      <p>Credit has been exhausted for below user</p>
                      <p>User Name: ${updateduser.name} ${userDetails.lastName}</p>
                      <p>User Email: ${updateduser.email}</p>
                  `,
              });
          }
      }
      return {...cachedBlogData[0], _id: insertBlog.insertedId,  ideas: {
          blog_id: new ObjectID(insertBlog.insertedId),
          ...updatedBlogIdeas,
          _id: insertBlogIdeas.insertedId
      }, references: refUrls}
  }
  let pythonKeywordStartTime = new Date()
  if(!combinedArticleIds?.length) {
      try {
        combinedArticleIds = await new Python({userId: userId}).uploadKeyword({keyword, timeout:60000})
        let pythonKeywordEndTime = new Date()
        let pythonKeywordRespTime = diff_minutes(pythonKeywordEndTime, pythonKeywordStartTime)
        console.log(`========== Time taken by python for extracting from keyword ${pythonKeywordRespTime}`)
        // combinedArticleIds = [ 'e84cb604-52f9-11ee-ac29-0242ac130002' ]
        if(combinedArticleIds && combinedArticleIds.length) {
          combinedArticleIds = combinedArticleIds.filter((data) => data !== "None")
        }
        combinedArticleIds.map((id) => sourcesArray.push({
          type: "web",
          id
        }))
        
      }catch(e){
          console.log(e, "error from python")
      }
  }
  publish({userId, keyword, step: "KEYWORD_COMPLETED"})
  let unprocessedFiles: string[] = []
  let unprocessedUrls: string[] = []


  let urlsArticleIds: string[] = []
  let fileArticleIds: string[] = []
  if(urls && urls.length) {
    for (let index = 0; index < urls.length; index++) {
      let pythonURLStartTime = new Date()
      const url = urls[index];
      try {
        const urlUploadRes = await new Python({userId}).uploadUrl({url})
        let pythonUrlEndTime = new Date()
        let pythonUrlRespTime = diff_minutes(pythonUrlEndTime, pythonURLStartTime)
        console.log(`========== Time taken by python for extracting from url ${pythonUrlRespTime}`)
        urlsArticleIds.push(urlUploadRes)
        sourcesArray.push({
          type: "url",
          id: urlUploadRes
        })
      }catch(e: any){
        unprocessedUrls.push(url)
      }
    }
    publish({userId, keyword, step: "URL_UPLOAD_COMPLETED"})
  } else if(files && files.length) {
    for (let index = 0; index < files.length; index++) {
      let pythonFileStartTime = new Date()
      const file = files[index];
      try {
        const fileUploadRes = await new Python({userId}).uploadFile({file})
        let pythonFileEndTime = new Date()
        let pythonFileRespTime = diff_minutes(pythonFileEndTime, pythonFileStartTime)
        console.log(`========== Time taken by python for extracting from file ${pythonFileRespTime}`)
        fileArticleIds.push(fileUploadRes)
        sourcesArray.push({
          type: "file",
          id: fileUploadRes
        })
      }catch(e: any){
        unprocessedFiles.push(file.originalname)
      }
    }
    publish({userId, keyword, step: "FILE_UPLOAD_COMPLETED"})
    console.log(fileArticleIds, "file ids")
  }
  // articleIds = [
  //     '97a32ca9-1710-11ee-8959-0242c0a8e002',
  //     '96345a34-1710-11ee-8959-0242c0a8e002',
  //     '9495c95a-1710-11ee-8959-0242c0a8e002',
  //     '991cd785-1710-11ee-8959-0242c0a8e002'
  // ]
  if(urlsArticleIds) {
    combinedArticleIds = [...combinedArticleIds, ...urlsArticleIds]
  }
  if(fileArticleIds) {
    combinedArticleIds = [...combinedArticleIds, ...fileArticleIds]
  }
  console.log(combinedArticleIds, "combinedArticleIds")
  if(sourcesArray && sourcesArray.length) {
    sourcesArray = await (
      Promise.all(
        sourcesArray.map(async (source) => {
          const articleData = await db.db('lilleArticles').collection('articles').findOne({
            _id: source.id
          })
          const name = articleData._source?.source?.name
          if(source.type === "url" || source.type === "web") {
            return {
              ...source,
              source: name,
              url: articleData?._source?.orig_url
            }
          } else {
            return {
              ...source,
              source: name && (name === "file" || name === "note") ? articleData._source.title : name,
              url: null
            }
          }
        })
      )
    )
  }
  let pythonEnd = new Date()
  let pythonRespTime = diff_minutes(pythonEnd, pythonStart)
  let texts = ""
  let imageUrl: string | null = null
  let imageSrc: string | null = null
  let article_ids: String[] = []
  let ideasArr: {
      idea: string;
      article_id: string;
  }[] = []
  let tags: String[] = []
  let ideasText = ""
  let articlesData: any[] = []
  combinedArticleIds = combinedArticleIds.filter((id: string) => id)
  if(combinedArticleIds) {
      articlesData = await (
          Promise.all(
            combinedArticleIds?.map(async (id: string, index: number) => {
                  const article = await db.db('lilleArticles').collection('articles').findOne({_id: id})
                  if(!((article.proImageLink).toLowerCase().includes('placeholder'))) {
                      imageUrl = article.proImageLink
                      imageSrc = article._source?.orig_url
                  } else {
                      if(index === (combinedArticleIds.length - 1) && !imageUrl) {
                          imageUrl = (process.env.PLACEHOLDER_IMAGE || article.proImageLink)
                          imageSrc = null
                      }
                  }
                  // keyword = article.keyword
                  // const productsTags = (article.ner_norm?.PRODUCT && article.ner_norm?.PRODUCT.slice(0,3)) || []
                  // const organizationTags = (article.ner_norm?.ORG && article.ner_norm?.ORG.slice(0,3)) || []
                  // const personsTags = (article.ner_norm?.PERSON && article.ner_norm?.PERSON.slice(0,3)) || []
                  tags.push(...article._source.driver)
                  const name = article._source?.source?.name
                  return {
                      used_summaries: article._source.summary.slice(0, 10),
                      name: name && name === "file" ? article._source.title : name,
                      unused_summaries: article._source.summary.slice(10),
                      keyword,
                      id
                  }
              })
          )
      )
      articlesData.forEach((data) => {
          data.used_summaries.forEach((summary: string, index: number) => {
              texts += `'${summary}'\n`
              ideasText += `${summary} `
              ideasArr.push({idea: summary, article_id: data.id})
          })
          article_ids.push(data.id)
      })
  }
  try {
      let uniqueTags: String[] = [];
      tags.forEach((c) => {
          if (!uniqueTags.includes(c)) {
              uniqueTags.push(c);
          }
      });
      if(combinedArticleIds && combinedArticleIds.length) refUrls = await fetchArticleUrls({db, articleId: combinedArticleIds})
      const blogGeneratedData: any = await blogGeneration({
          db,
          text: !articlesData.length ? keyword : texts,
          regenerate: !articlesData.length ? false: true,
          imageUrl: imageUrl || process.env.PLACEHOLDER_IMAGE,
          title: keyword,
          imageSrc,
          ideasText,
          ideasArr,
          refUrls,
          userDetails,
          userId: (userDetails && userDetails._id) || userId,
          keywords,
          tones
      })
      if(blogGeneratedData) {
          const {usedIdeasArr, updatedBlogs, description,title} = blogGeneratedData
          const finalBlogObj = {
              article_id: combinedArticleIds,
              publish_data: updatedBlogs,
              userId: new ObjectID(userId),
              email: userDetails && userDetails.email,
              keyword: keyword || title,
              status: "draft",
              description,
              tags: uniqueTags,
              imageUrl: imageUrl ? imageUrl : process.env.PLACEHOLDER_IMAGE,
              imageSrc,
              sourcesArray,
              date: getTimeStamp(),
              updatedAt: getTimeStamp(),
          }
          let updatedIdeas: any = []
          articlesData.forEach((data) => {
              data.used_summaries.forEach((summary: string) => updatedIdeas.push({
                  idea: summary,
                  article_id: data.id,
                  reference: null,
                  name: data.name,
                  used: 1,
              }))
          })
          if(!articlesData.length) {
              usedIdeasArr.forEach((idea: string) => updatedIdeas.push({
                  idea,
                  article_id: null,
                  reference: null,
                  used: 1,
              }))
          }
          if(updatedIdeas && updatedIdeas.length) {
              updatedIdeas = await (
                  Promise.all(
                      updatedIdeas.map(async (ideasData: any) => {
                          if(ideasData.article_id) {
                              const article = await fetchArticleById({id: ideasData.article_id, db, userId})
                              const sourceFilter = sourcesArray.find((source: any) => source.id === ideasData.article_id)
                              let type = null
                              if(sourceFilter) {
                                type = sourceFilter.type
                              }
                              return {
                                  ...ideasData,
                                  type,
                                  reference: {
                                      type: "article",
                                      link: article._source.orig_url,
                                      id: ideasData.article_id,
                                  }
                              }
                          } else {
                              return {
                                  ...ideasData
                              }
                          }
                      })       
                  )
              )
          }
          const insertBlog = await db.db('lilleBlogs').collection('blogs').insertOne(finalBlogObj)
          const insertBlogIdeas = await db.db('lilleBlogs').collection('blogIdeas').insertOne({
              blog_id: insertBlog.insertedId,
              ideas: updatedIdeas
          })
          let blogDetails = null
          let blogIdeasDetails = null
          if(insertBlog.insertedId){
              const id: any = insertBlog.insertedId
              blogDetails = await db.db('lilleBlogs').collection('blogs').findOne({_id: new ObjectID(id)})
          }
          if(insertBlogIdeas.insertedId){
              const id: any = insertBlogIdeas.insertedId
              blogIdeasDetails = await db.db('lilleBlogs').collection('blogIdeas').findOne({_id: new ObjectID(id)})
          }
          let endRequest = new Date()
          let respTime = diff_minutes(endRequest, startRequest)
          if(user && Object.keys(user).length) {
              const updateduser = await fetchUser({id: user.id, db})
              const updatedCredits = ((updateduser.credits || 25) - 1)
              await updateUserCredit({id: updateduser._id, credit: updatedCredits, db})
              if(updatedCredits <= 0) {
                  await sendEmails({
                      to: [
                      { Email: `akash.sharma@nowigence.com`, Name: `Akash Sharma` },
                      { Email: `arvind.ajimal@nowigence.com`, Name: `Arvind Ajimal` },
                      { Email: `subham.mahanta@nowigence.com`, Name: `Subham Mahanta` },
                      { Email: `vashisth@adesignguy.co`, Name: `Vashisth Bhushan` }
                      ],
                      subject: "Credit Exhausted",
                      textMsg: "",
                      htmlMsg: `
                          <p>Hello All,</p>
                          <p>Credit has been exhausted for below user</p>
                          <p>User Name: ${updateduser.name} ${userDetails.lastName}</p>
                          <p>User Email: ${updateduser.email}</p>
                      `,
                  });
              }
          }
          let uniqueSources : {
            url: string
            source: string
            id?: string
          }[] = [];
          sourcesArray.forEach((c) => {
              const dupe = uniqueSources.find((data: {
                  url: string
                  source: string
              }) => data.source === c.source)
              if(!dupe) uniqueSources.push(c)
          });
          return res.status(200).send({
            type: "SUCCESS",
            data:{...blogDetails, ideas: blogIdeasDetails, references: uniqueSources, pythonRespTime, respTime, unprocessedFiles, unprocessedUrls}
          })
      }else{
          console.log(blogGeneratedData, "blogGeneratedData")
          return res.status(400).send({
            type: "ERROR",
            message: "Something went wrong"
          })
      }
  } catch(e: any) {
      console.log(e)
      return res.status(400).send({
        type: "ERROR",
        message: e.message
      })
  }
})

router.post('/save/user-name', authMiddleware, async (req: any, res: any) => {
  const db = req.app.get('db')
  const {userName} = req.body
  try {
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
    if(!userName) {
      return res.status(400).send({
        type: "ERROR",
        message: "Please provide username!"
      })
    }
    const userNameExist = await db.db('lilleAdmin').collection('users').count({
      userName,
      _id: {
        $ne: new ObjectID(userDetails._id)
      }
    })
    console.log(userNameExist, userDetails._id)
    if(userNameExist) {
      return res.status(401).send({
        type: "ERROR",
        message: "User Name exists!"
      })
    }
    await db.db('lilleAdmin').collection('users').updateOne({
      _id: userDetails._id
    }, {
      $set: {
        userName
      }
    })
    return res.status(200).send({
      type: "SUCCESS",
      message: "User Name Added!"
  })
  }catch(e) {
    return res.status(500).send({
      type: "ERROR",
      message: e.message
    })
  }
})
router.get('/assign-username', async (req: any, res: any) => {
  const db = req.app.get('db')
  const usersWithNoUserName = await db.db('lilleAdmin').collection('users').find(
    {$or: [{userName: {$exists: false}}, {userName: null}]}
  ).toArray()
  for (let index = 0; index < usersWithNoUserName.length; index++) {
    const user = usersWithNoUserName[index];
    const userName = `${user.name}${user.lastName}${Math.floor(Math.random()*(999-100+1)+100)}`
    await db.db('lilleAdmin').collection('users').updateOne({
      _id: new ObjectID(user._id)
    }, {
      $set: {
        userName
      }
    })
  }
  return res.status(200).send({
    type: "SUCCESS",
    message: "User Name Added!"
  })
})
router.get('/saved-time', authMiddleware, async (req: any, res: any) => {
  const db = req.app.get('db')
  try {
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
    const totalSavedData = await db.db('lilleBlogs').collection('blogsTime').find({userId: new ObjectID(user.id), status: "SAVE"}, {
      projection: {
        time: 1,
        date: 1,
        _id: 0
      }
    }).toArray()
    const currentTimeStamp = getTimeStamp()
    const todaysDateTimeStamp = getTimeStamp(new Date(getDateString(new Date())))
    let oneWeekAgoDate: any = new Date()
    oneWeekAgoDate.setDate(oneWeekAgoDate.getDate() - 7)
    oneWeekAgoDate = getTimeStamp(oneWeekAgoDate)
    let oneMonthAgoDate: any = new Date()
    oneMonthAgoDate.setMonth(oneMonthAgoDate.getMonth() - 1);
    oneMonthAgoDate = getTimeStamp(oneMonthAgoDate)
    console.log(totalSavedData)
    if(totalSavedData && totalSavedData.length) {
      let daySaved = 0
      let weekSaved = 0
      let monthSaved = 0
      totalSavedData?.forEach((data: {time: string, date: number}) => {
        if(data.date <= currentTimeStamp && data.date >= todaysDateTimeStamp) {
          daySaved += timeToMins(data.time)
        }
        if(data.date <= currentTimeStamp && data.date >= oneWeekAgoDate) {
          weekSaved += timeToMins(data.time)
        }
        if(data.date <= currentTimeStamp && data.date >= oneMonthAgoDate) {
          monthSaved += timeToMins(data.time)
        }
      })
      const oneDaySavedTime = timeFromMins(daySaved)
      const oneWeekSavedTime = timeFromMins(weekSaved)
      const oneMonthSavedTime = timeFromMins(monthSaved)
      console.log(daySaved, oneDaySavedTime, oneWeekAgoDate, oneWeekSavedTime, oneMonthAgoDate, oneMonthSavedTime)
      return res.status(200).send({
        type: "SUCCESS",
        message: "Total Saved Time!",
        data: {
          oneDaySavedTime,
          oneWeekSavedTime,
          oneMonthSavedTime
        }
      })
    } else {
      return res.status(200).send({
        type: "SUCCESS",
        message: "Total Saved Time!",
        data: {
          oneDaySavedTime: "00:00",
          oneWeekSavedTime:"00:00",
          oneMonthSavedTime:"00:00"
        }
      })
    }
  }catch(e){
    return res.status(500).send({
      type: "ERROR",
      message: e.message
    })
  }
})

router.get('/total-saved-time', async (req: any, res: any) => {
  const db = req.app.get('db')
  try {
    const totalSavedData = await db.db('lilleBlogs').collection('blogsTime').find({
      status: "SAVE"
    }, {
      projection: {
        time: 1,
        date: 1,
        _id: 0
      }
    }).toArray()
    // let oneWeekAgoDate: any = new Date()
    // oneWeekAgoDate.setDate(oneWeekAgoDate.getDate() - 7)
    // oneWeekAgoDate = getTimeStamp(oneWeekAgoDate)
    // let oneMonthAgoDate: any = new Date()
    // oneMonthAgoDate.setMonth(oneMonthAgoDate.getMonth() - 1);
    // oneMonthAgoDate = getTimeStamp(oneMonthAgoDate)
    console.log(totalSavedData.length)
    if(totalSavedData && totalSavedData.length) {
      let total = 0
      totalSavedData?.forEach((data: {time: string, date: number}) => {
        total += timeToMins(data.time)
      })
      console.log(total)
      const totalSavedTime = timeFromMins(total)
      return res.status(200).send({
        type: "SUCCESS",
        message: "Total Saved Time!",
        data: {
          totalSavedTime
        }
      })
    } else {
      return res.status(200).send({
        type: "SUCCESS",
        message: "Total Saved Time!",
        data: {
          oneDaySavedTime: "00:00",
          oneWeekSavedTime:"00:00",
          oneMonthSavedTime:"00:00"
        }
      })
    }
  }catch(e){
    return res.status(500).send({
      type: "ERROR",
      message: e.message
    })
  }
})

router.post('/add-time-saved', async (req: any, res: any) => {
  const db = req.app.get('db')
  const {userId, blogId, time, type, status} = req.body
  try {
    if(!userId) {
      return res.status(400).send({
        type: "ERROR",
        message: "No user id found!"
      })
    }
    const blog = await db.db('lilleBlogs').collection('blogs').findOne({
      _id: new ObjectID(blogId)
    })
    if(!blog) {
      return res.status(400).send({
        type: "ERROR",
        message: "Blog not found!"
      })
    }
    const splittedTime = time.split(":")
    await db.db('lilleBlogs').collection('blogsTime').updateOne({blogId: new ObjectID(blogId)}, 
    {$set: {
      userId: new ObjectID(userId),
      blogId: new ObjectID(blogId),
      time: `00:${splittedTime[0] || 1}`,
      type,
      status: status || "SAVE",
      date: getTimeStamp()
    }}, 
    {upsert: true})
    return res.status(200).send({
      type: "SUCCESS",
      message: "Time Added!"
    })
  }catch(e){
    return res.status(500).send({
      type: "ERROR",
      message: e.message
    })
  }
})

router.post('/prompt-test', async (req: any, res: any) => {
  const db = req.app.get('db')
  console.log(req.body)
  const {prompt} = req.body
  try {
    const chatgptApis = await db.db('lilleAdmin').collection('chatGPT').findOne()
    let availableApi: any = null
    if(chatgptApis) {
      availableApi = chatgptApis.apis?.find((api: any) => !api.quotaFull)
    } else {
      throw "Something went wrong! Please connect with support team";
    }
    const response = await new ChatGPT({apiKey: availableApi.key, text: prompt, db}).textCompletion(chatgptApis.timeout)
    return res.status(200).send({
      type: "SUCCESS",
      data: response
    })
  }catch(e){
    return res.status(500).send({
      type: "ERROR",
      message: e.message
    })
  }
})

router.post('/fetch-finance', async (req: any, res: any) => {
  const db = req.app.get('dbLive')
  try {
    const options: any = {
        method: 'GET',
        url: 'https://yahoo-finance127.p.rapidapi.com/multi-quote/nowg',
        headers: {
            'X-RapidAPI-Key': process.env.RAPID_API_SUBSCRIPTION,
            'X-RapidAPI-Host': 'yahoo-finance127.p.rapidapi.com'
        }
      };
      const financeData = await db.db('admin').collection('yahooFinance').findOne()
      let response = null
      if(financeData) {
        console.log(financeData)
        const financeAddedTimeStamp = getTimeStamp(new Date(financeData.createdAt))
        console.log(financeAddedTimeStamp)
        const currentDateTimeStamp = getTimeStamp(new Date(getDateString(new Date())))
        if(financeAddedTimeStamp >= currentDateTimeStamp) {
          response = financeData
          return res.status(200).send({
            type: "SUCCESS",
            data: {
              symbol: response?.symbol,
              marketPrice:response?.regularMarketPrice.fmt,
              currency: response?.currency,
              marketChange: response?.regularMarketChange?.fmt,
              marketChangePercentage: response?.regularMarketChangePercent?.fmt
            }
          })
        }
      }   
      response = await axios.request(options);
      if(financeData) {
        const addDailyValue = await db.db('admin').collection('yahooFinance').updateOne({
          _id: new ObjectID(financeData._id)
        },{
          $set: {
            ...response?.data?.['0'],
            createdAt: getDateString(new Date())
          }
        }) 
      }else{
        const addDailyValue = await db.db('admin').collection('yahooFinance').insertOne({
          ...response?.data?.['0'],
          createdAt: getDateString(new Date())
        })
      }
      console.log(response.data)
      if(response.data) {
        const data = response?.data?.['0']
        return res.status(200).send({
          type: "SUCCESS",
          data: {
            symbol: data?.symbol,
            marketPrice:data?.regularMarketPrice.fmt,
            currency: data?.currency,
            marketChange: data?.regularMarketChange?.fmt,
            marketChangePercentage: data?.regularMarketChangePercent?.fmt
          }
        })
      }
  }catch(e){
    console.log(e, "error from rapid api")
    return res.status(500).send({
      type: "ERROR",
      message: e.message
    })
  }
})

module.exports = router;
