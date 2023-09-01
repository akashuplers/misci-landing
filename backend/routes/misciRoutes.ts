import { ObjectID } from "mongodb";
import { Python } from "../services/python";
import { getTimeStamp } from "../utils/date";
import { publish } from "../utils/subscription";

const express = require("express");
const router = express.Router();


router.post('/generate', async (req: any, res: any) => {
    const {question, userId} = req.body
    const db = req.app.get('dbLive')
    const userEmail = await db.db('lilleAdmin').collection('misciEmail').findOne()
    console.log(userEmail)
    try {
        const userData = await db.db('admin').collection('users').findOne({
            email: userEmail.email
        })
        const askMeAnswers = await new Python({userId: userData?._id}).getAskMeAnswers(question)
        console.log(askMeAnswers, "askMeAnswers")
        if(!askMeAnswers) {
            publish({userId, keyword: null, step: "ANSWER_FETCHING_FAILED", data: null})
            return res
            .status(400)
            .send({ error: true, message: "No answers found!" });    
        }
        const article = askMeAnswers?.internal_results?.main_document
        console.log(article, "article")
        const answers = askMeAnswers?.internal_results?.main_document?.full_content
        const title = askMeAnswers?.internal_results?.main_document?.title
        const answersObj = {
            published: false,
                published_date: false,
                platform: "answers",
                creation_date: Math.round(new Date().getTime() / 1000) ,
                tiny_mce_data: {
                    "tag": "BODY",
                    children: [
                        {
                            "tag": "H3",
                            "attributes": {
                                "style": "text-align: center;"
                            },
                            "children": [
                                {
                                    "tag": "STRONG",
                                    "attributes": {},
                                    "children": [
                                        title
                                    ]
                                }
                            ]
                        },
                        {
                            "tag": "P",
                            "attributes": {},
                            "children": [
                                answers
                            ]
                        },
                        {
                            "tag": "P",
                            "attributes": {},
                            "children": []
                        },
                    ]
                }
        }
        const updatedBlogs = [
            answersObj
        ]
        const finalBlogObj = {
            article_id: [article.id],
            publish_data: updatedBlogs,
            userId: new ObjectID(userData?._id),
            email: userData.email,
            keyword: title,
            question,
            status: "draft",
            // imageUrl: imageUrl ? imageUrl : process.env.PLACEHOLDER_IMAGE,
            // imageSrc,
            date: getTimeStamp(),
            updatedAt: getTimeStamp(),
            type: "misci"
        }
        const insertedData = await db.db('lilleBlog').collection('blogs').insertOne(finalBlogObj)
        const data = await db.db('lilleBlog').collection('blogs').findOne({_id: new ObjectID(insertedData.insertedId)})
        console.log(data, "data")
        publish({userId, keyword: null, step: "ANSWER_FETCHING_COMPLETED", data})
        return res
        .status(200)
        .send({ error: false, message: "Answer Fetched" });
    }catch(err){
        return res
        .status(500)
        .send({ error: true, message: err.message });
    }
})

module.exports = router