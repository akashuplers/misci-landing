// wiki.js - Wiki route module.

import { ObjectID } from "bson";
import { createAccessToken, createRefreshToken } from "../utils/accessToken";
import { validateRegisterInput, validateLoginInput } from "../validations/Validations";
const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');

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
          return res.status(400).send(errors);
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

      if(data.password){
        hashedPW = await bcrypt.hash(data.password, 12);
        data.password = hashedPW;
      }
      data.isDemoUser = false;
      data.admin = 'N';
      data.name = data.firstName;
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
        await db.db("lilleAdmin").collection("users").updateOne({
          email: data.email
        }, {
          $set: data
        });
        user = await db.db('lilleAdmin').collection('users').findOne({email: data.email})
      } else {
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

module.exports = router;
