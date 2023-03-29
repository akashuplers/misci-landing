import { verify } from "jsonwebtoken";
import { sendMail } from "services/sendEmail";
import { sendEmail, sendEmails } from "../utils/mailJetConfig";

const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/send/verify-email', async (req: any, res: any) => {
    const db = req.app.get('db')
    try {
        const data = req.body
        const email = data.email
        const emailExists = await db.db('lilleAdmin').collection('waitLists').findOne({
            email
        })
        if(emailExists && emailExists.isVerified) {
            return res.status(400).send({
                type: "ERROR",
                message: "Email is already verified!"
            })
        }
        var token = jwt.sign({ type: 'lille', email }, process.env.JWT_SECRET_KEY);
        sendEmails({
            to: [
              { Email: email }
            ],
            subject: "Email verification",
            textMsg: "Email verification",
            htmlMsg: `
            <p>Dear User,</p>
            <br/><br/>
            <p>Thank you taking the action to have your email verified with Lille Platform.
            </p><br/><br/>
            <p>Please verify your email by clicking below button</p><br/><br/>
            <p>
                ${
                    process.env.NODE_ENV === "production" ? 
                    `<a href="https://${process.env.BASE_URL}/waitlist/verify-email?token=${token}">Verify Mail</a>`
                    :
                    `<a href="http://${process.env.BASE_URL}:${process.env.PORT}/waitlist/verify-email?token=${token}">Verify Mail</a>`
                }
            </p>
            <p>Please contact us at <a href="mailto:cs@nowigence.com">cs@nowigence.com</a> if you face any issue.</p>
            <br/><br/>
            <p>Cheers.</p>
            <p>Lille Support Team</p>
            <p>www.lille.com</p>
            <br/><br/>
            <p style="font-size: 6px">This is system generated email. Do not reply to this email. </p>
            `,
          })
          if(emailExists)
            await db.db('lilleAdmin').collection('waitLists').updateOne({email}, {$set: {
                email,
                token,
                isVerified: 0
            }})
          else 
            await db.db('lilleAdmin').collection('waitLists').insertOne({
                email,
                token,
                isVerified: 0,
            })  
          return res.status(200).send({
            type: "SUCCESS",
            message: "Verification Email sent!"
          })  
      } catch(err) {
        return res
        .status(500)
        .send({ error: true, message: err.message });
      }
})
router.get('/verify-email', async(req: any, res: any) => {
    const db = req.app.get('db')
    const token = req.param('token')
    console.log(token)
    const tokenVerification: any = verify(token, process.env.JWT_SECRET_KEY!)
    console.log(tokenVerification, "tokenVerification")
    if(tokenVerification) {
        const emailDetails = await db.db('lilleAdmin').collection('waitLists').findOne({email: tokenVerification.email})
        if(!emailDetails) {
            return res.status(400).send({
                type: "ERROR",
                message: "Token invalid"
            })
        }
        await db.db('lilleAdmin').collection('waitLists').updateOne({email: tokenVerification.email}, {
            $set: {
                isVerified: 1
            }
        })
        return res.status(301).redirect(`${process.env.WAITLIST_BASE_URL}/verify?token=${token}`)
    } else {
        return res.redirect(`${process.env.WAITLIST_BASE_URL}`)
    }
})
router.post('/add-urls', async(req: any, res: any) => {
    const db = req.app.get('db')
    const data = req.body
    if(!data.token) {
        return res.status(400).send({
            type: "ERROR",
            message:"Missing Token" 
        })
    }
    const tokenVerification: any = verify(data.token, process.env.JWT_SECRET_KEY!)
    if(!tokenVerification) {
        return res.status(400).send({
            type: "ERROR",
            message:"Invalid Token" 
        })
    }
    const emailDetails = await db.db('lilleAdmin').collection('waitLists').findOne({email: tokenVerification.email, isVerified: 1})
    if(!emailDetails) {
        return res.status(400).send({
            type: "ERROR",
            message: "Email not found or email is not verified"
        })
    }
    await db.db('lilleAdmin').collection('waitLists').updateOne({email: tokenVerification.email}, {
        $set: {
            urls: data.urls,
            keywords: data.keywords || [],
        }
    })
    return res.status(200).send({
        type: "SUCCESS",
        message: "URLs added!"
    })  
})

module.exports = router;